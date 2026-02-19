#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::string::String;
use alloc::vec::Vec;
use alloy_sol_types::sol;
use stylus_sdk::{
    alloy_primitives::{Address, U256, U64, U8},
    evm,
    prelude::*,
};

use stylus_sdk::call::Call;

// ============================================================================
// Enums
// ============================================================================

/// Status of the deal
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u8)]
pub enum DealStatus {
    /// Deal created but not yet funded
    Created = 0,
    /// Deal funded by client
    Funded = 1,
    /// Deal in progress
    Active = 2,
    /// Dispute raised
    Disputed = 3,
    /// Deal completed via natural flow or dispute resolution
    Completed = 4,
    /// Deal cancelled (if not started)
    Cancelled = 5,
}

impl DealStatus {
    /// Convert from u8 to DealStatus
    #[inline]
    pub fn from_u8(value: u8) -> Option<Self> {
        match value {
            0 => Some(DealStatus::Created),
            1 => Some(DealStatus::Funded),
            2 => Some(DealStatus::Active),
            3 => Some(DealStatus::Disputed),
            4 => Some(DealStatus::Completed),
            5 => Some(DealStatus::Cancelled),
            _ => None,
        }
    }

    /// Convert to u8 for storage
    #[inline]
    pub fn as_u8(self) -> u8 {
        self as u8
    }
}

// ============================================================================
// Storage Layout
// ============================================================================

sol_storage! {
    /// Milestone within a deal (Flattened for size optimization)
    pub struct Milestone {
        /// Amount allocated to this milestone
        uint256 amount;
        /// Whether the milestone funds have been released
        bool is_released;
        /// Timestamp when this milestone can be released (0 if none)
        uint256 end_timestamp;
        /// Whether manual approval by client is required
        bool requires_approval;
    }

    /// Main Deal structure (Includes Dispute Data)
    pub struct Deal {
        /// Address of the client (buyer)
        address client;
        /// Address of the freelancer (seller)
        address freelancer;
        /// Address of the assigned arbiter
        address arbiter;
        /// Token used for payment (Address::ZERO for ETH)
        address token;
        /// Remaining deal amount (decrements on release)
        uint256 remaining_amount;
        /// Current status of the deal (DealStatus enum)
        uint8 status;
        /// Creation timestamp
        uint256 created_at;
        /// Milestones associated with the deal
        Milestone[] milestones;

        // --- Dispute Data (Flattened) ---
        /// Whether the dispute has been resolved
        bool is_resolved;
        /// Ruling outcome (0=Pending, 1=Client, 2=Freelancer, 3=Split)
        uint8 ruling;
    }

    /// Main contract storage for ArbiSecure escrow protocol
    #[entrypoint]
    pub struct ArbiSecure {
        /// Contract admin address
        address admin;

        // === Deal Management ===
        /// Mapping of deal ID to Deal data
        mapping(uint256 => Deal) deals;

        /// Counter for generating unique deal IDs
        uint256 deal_counter;

        // === Gasless Transaction Support ===
        /// Tracks whether an address has used their free first deal
        mapping(address => bool) gasless_deals_used;
    }
}

// ============================================================================
// Interfaces
// ============================================================================

sol_interface! {
    interface IERC20 {
        function transfer(address recipient, uint256 amount) external returns (bool);
        function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    }
}

// ============================================================================
// Implementation
// ============================================================================

#[public]
impl ArbiSecure {
    /// Initialize the contract sets admin
    pub fn initialize(&mut self) {
        let caller = self.vm().msg_sender();
        if self.admin.get() != Address::ZERO {
            return;
        }
        self.admin.set(caller);
        self.deal_counter.set(U256::ZERO);
    }

    /// Transfer admin rights
    pub fn transfer_admin(&mut self, new_admin: Address) {
        let caller = self.vm().msg_sender();
        let admin = self.admin.get();

        require(caller == admin, "Auth");
        require(new_admin != Address::ZERO, "Zero");

        self.admin.set(new_admin);
    }

    /// Get the current admin address
    pub fn admin(&self) -> Address {
        self.admin.get()
    }

    #[payable]
    pub fn create_deal(
        &mut self,
        _ref_id: U256,
        freelancer: Address,
        arbiter: Address,
        token: Address,
        amount: U256,
        milestone_amounts: Vec<U256>,
        milestone_end_times: Vec<U256>,
        milestone_approvals: Vec<U256>, // Changed to U256 for ABI safety
    ) -> U256 {
        let caller = self.vm().msg_sender();
        self.gasless_deals_used.setter(caller).set(true);

        require(amount > U256::ZERO, "0Amt");
        require(freelancer != Address::ZERO, "0Free");
        require(arbiter != Address::ZERO, "0Arb");

        // Validate lengths
        let len = milestone_amounts.len();
        require(milestone_end_times.len() == len, "Len");
        require(milestone_approvals.len() == len, "Len");
        require(len > 0, "NoMs");

        // Validate sum
        let mut total_milestone_amount = U256::ZERO;
        for amt in &milestone_amounts {
            total_milestone_amount += *amt;
        }
        require(total_milestone_amount == amount, "Sum");

        // Transfer funds
        if token == Address::ZERO {
            require(self.vm().msg_value() == amount, "BadETH");
        } else {
            let token_contract = IERC20::new(token);
            let contract_address = self.vm().contract_address();
            let config = Call::new_in(self);
            let result = token_contract.transfer_from(config, caller, contract_address, amount);
            match result {
                Ok(success) => {
                    require(success, "TknF");
                }
                Err(_) => panic!("TknF"),
            }
        }

        // Cache timestamp
        let timestamp = self.vm().block_timestamp();

        // Create Deal
        let deal_id = self.deal_counter.get();
        self.deal_counter.set(deal_id + U256::from(1));

        let mut deal = self.deals.setter(deal_id);
        deal.client.set(caller);
        deal.freelancer.set(freelancer);
        deal.arbiter.set(arbiter);
        deal.token.set(token);
        deal.remaining_amount.set(amount);
        deal.status.set(U8::from(DealStatus::Funded.as_u8()));
        deal.created_at.set(U256::from(timestamp));

        // Initialize Dispute fields
        deal.is_resolved.set(false);
        deal.ruling.set(U8::from(0));

        // Set Milestones
        for i in 0..len {
            let mut m_guard = deal.milestones.grow();
            m_guard.amount.set(milestone_amounts[i]);
            m_guard.is_released.set(false);
            m_guard.end_timestamp.set(milestone_end_times[i]);
            m_guard
                .requires_approval
                .set(milestone_approvals[i] != U256::ZERO);
        }

        evm::log(DealCreated {
            deal_id,
            client: caller,
            freelancer,
            amount,
            token,
        });

        deal_id
    }

    /// Releases funds for a milestone if all conditions are met
    #[allow(deprecated)]
    pub fn release_milestone(&mut self, deal_id: U256, milestone_index: U256) {
        let caller = self.vm().msg_sender();
        let timestamp = self.vm().block_timestamp();

        let (freelancer, amount, token_addr) = {
            let mut deal = self.deals.setter(deal_id);
            let client = deal.client.get();
            let freelancer = deal.freelancer.get();

            let status_val = deal.status.get().to::<u8>();
            let status = DealStatus::from_u8(status_val).expect("BadS");

            require(
                status == DealStatus::Funded || status == DealStatus::Active,
                "BadSt",
            );

            let milestone_idx_usize = milestone_index.to::<usize>();
            require(milestone_idx_usize < deal.milestones.len(), "NoMs");

            let mut milestone = deal.milestones.setter(milestone_idx_usize).expect("NoMs");
            require(!milestone.is_released.get(), "Rel");

            let milestone_amount = milestone.amount.get();

            // Check conditions (Flattened)
            let end_time = milestone.end_timestamp.get();
            let req_approval = milestone.requires_approval.get();

            // Logic:
            // 1. Client can ALWAYS release (Manual Override / Approval)
            // 2. If not Client (e.g. Freelancer claiming auto-release):
            //    - Must NOT require manual approval
            //    - Must satisfy time lock (if present)

            if caller != client {
                require(!req_approval, "Auth");
                if end_time > U256::ZERO {
                    require(U256::from(timestamp) >= end_time, "Time");
                }
            }

            // Release funds
            milestone.is_released.set(true);
            // Decrement remaining amount
            let current_remaining = deal.remaining_amount.get();
            let new_remaining = current_remaining - milestone_amount;
            deal.remaining_amount.set(new_remaining);

            // Update status
            if new_remaining == U256::ZERO {
                deal.status.set(U8::from(DealStatus::Completed.as_u8()));
            } else {
                deal.status.set(U8::from(DealStatus::Active.as_u8()));
            }

            let token_addr = deal.token.get();

            // Fee (0.5%)
            let fee_bps = U256::from(50);
            let fee_amount = milestone_amount * fee_bps / U256::from(10000);
            let amount = milestone_amount - fee_amount;

            (freelancer, amount, token_addr)
        };

        if token_addr == Address::ZERO {
            // ETH Transfer
            let _ = self.vm().transfer_eth(freelancer, amount);
        } else {
            // ERC20 Transfer
            let token = IERC20::new(token_addr);
            let config = Call::new_in(self);
            let result = token.transfer(config, freelancer, amount);
            match result {
                Ok(success) => require(success, "TokF"),
                Err(_) => panic!("TokF"),
            }
        }

        evm::log(MilestoneReleased {
            deal_id,
            milestone_index,
            freelancer,
            amount,
        });
    }

    /// Raises a dispute for a deal
    #[allow(deprecated)]
    pub fn raise_dispute(&mut self, deal_id: U256) {
        let caller = self.vm().msg_sender();
        let mut deal = self.deals.setter(deal_id);

        let status_val = deal.status.get().to::<u8>();
        let status = DealStatus::from_u8(status_val).expect("BadS");

        require(
            status == DealStatus::Funded || status == DealStatus::Active,
            "BadSt",
        );

        let client = deal.client.get();
        let freelancer = deal.freelancer.get();

        require(caller == client || caller == freelancer, "Auth");

        // Update deal status
        deal.status.set(U8::from(DealStatus::Disputed.as_u8()));

        // We do NOT store reason/cid in storage to save space. We do not emit them either to save size.
        // Frontend should log reason separately or emit an event from a helper contract if needed.
        // For Core contract, we only care that it IS disputed.
        // Update flattened dispute flag
        deal.is_resolved.set(false);
        deal.ruling.set(U8::from(0));

        // Emit event with details
        evm::log(DisputeRaised {
            deal_id,
            initiator: caller,
        });
    }

    /// Resolves a dispute (arbiter only)
    #[allow(deprecated)]
    pub fn resolve_dispute(&mut self, deal_id: U256, client_share: U256, freelancer_share: U256) {
        let caller = self.vm().msg_sender();

        let (client, freelancer, arbiter_addr, net_client, net_freelancer, fee, token_addr) = {
            let mut deal = self.deals.setter(deal_id);

            let status_val = deal.status.get().to::<u8>();
            let status = DealStatus::from_u8(status_val).expect("BadS");

            require(status == DealStatus::Disputed, "NotDisp");
            require(!deal.is_resolved.get(), "Res");

            let arbiter_addr = deal.arbiter.get();
            require(caller == arbiter_addr, "NotArb");

            // Use remaining_amount instead of looping milestones
            let remaining_amount = deal.remaining_amount.get();

            let total_payout = client_share + freelancer_share;
            require(total_payout <= remaining_amount, "Over");

            // Arbiter Fee (5%)
            let fee = total_payout * U256::from(500) / U256::from(10000);
            let net_client = client_share - (client_share * U256::from(500) / U256::from(10000));
            let net_freelancer =
                freelancer_share - (freelancer_share * U256::from(500) / U256::from(10000));

            let token_addr = deal.token.get();
            let client = deal.client.get();
            let freelancer = deal.freelancer.get();

            // Update Dispute
            deal.is_resolved.set(true);

            // 1=Client, 2=Freelancer, 3=Split
            if client_share > freelancer_share {
                deal.ruling.set(U8::from(1));
            } else if freelancer_share > client_share {
                deal.ruling.set(U8::from(2));
            } else {
                deal.ruling.set(U8::from(3));
            }

            // Close Deal
            deal.status.set(U8::from(DealStatus::Completed.as_u8()));

            (
                client,
                freelancer,
                arbiter_addr,
                net_client,
                net_freelancer,
                fee,
                token_addr,
            )
        };

        // Transfers
        if token_addr == Address::ZERO {
            if net_client > U256::ZERO {
                let _ = self.vm().transfer_eth(client, net_client);
            }
            if net_freelancer > U256::ZERO {
                let _ = self.vm().transfer_eth(freelancer, net_freelancer);
            }
            if fee > U256::ZERO {
                let _ = self.vm().transfer_eth(arbiter_addr, fee);
            }
        } else {
            let token = IERC20::new(token_addr);
            if net_client > U256::ZERO {
                let config = Call::new_in(self);
                let _ = token.transfer(config, client, net_client);
            }
            if net_freelancer > U256::ZERO {
                let config = Call::new_in(self);
                let _ = token.transfer(config, freelancer, net_freelancer);
            }
            if fee > U256::ZERO {
                let config = Call::new_in(self);
                let _ = token.transfer(config, arbiter_addr, fee);
            }
        }

        evm::log(DisputeResolved {
            deal_id,
            client_amount: net_client,
            freelancer_amount: net_freelancer,
            arbiter_fee: fee,
        });
    }
    /// Get milestone details
    pub fn get_milestone(
        &self,
        deal_id: U256,
        index: U256,
    ) -> Result<(U256, bool, U256, bool), Vec<u8>> {
        let deal = self.deals.get(deal_id);
        if index >= U256::from(deal.milestones.len()) {
            return Err(Vec::new()); // Index out of bounds
        }

        let milestone_accessor = deal.milestones.get(index.to::<usize>());
        if milestone_accessor.is_none() {
            return Err(Vec::new());
        }
        let milestone = milestone_accessor.unwrap();

        Ok((
            milestone.amount.get(),
            milestone.is_released.get(),
            milestone.end_timestamp.get(),
            milestone.requires_approval.get(),
        ))
    }

    /// Get the client address for a deal
    pub fn get_deal_client(&self, deal_id: U256) -> Address {
        self.deals.get(deal_id).client.get()
    }

    /// Get the freelancer address for a deal
    pub fn get_deal_freelancer(&self, deal_id: U256) -> Address {
        self.deals.get(deal_id).freelancer.get()
    }

    /// Get the status of a deal
    pub fn get_deal_status(&self, deal_id: U256) -> U256 {
        U256::from(self.deals.get(deal_id).status.get().to::<u8>())
    }

    /// Get the remaining amount for a deal
    pub fn get_deal_amount(&self, deal_id: U256) -> U256 {
        self.deals.get(deal_id).remaining_amount.get()
    }

    /// Get the arbiter of a deal
    pub fn get_deal_arbiter(&self, deal_id: U256) -> Address {
        self.deals.get(deal_id).arbiter.get()
    }
}

// ============================================================================
// Helper Functions (Internal)
// ============================================================================

fn require(condition: bool, _message: &str) {
    if !condition {
        panic!();
    }
}

// ============================================================================
// Events
// ============================================================================

sol! {
    event MilestoneReleased(uint256 indexed deal_id, uint256 milestone_index, address freelancer, uint256 amount);
    event DisputeRaised(uint256 indexed deal_id, address initiator);
    event DisputeResolved(uint256 indexed deal_id, uint256 client_amount, uint256 freelancer_amount, uint256 arbiter_fee);
    event DealCreated(uint256 indexed deal_id, address client, address freelancer, uint256 amount, address token);
}
