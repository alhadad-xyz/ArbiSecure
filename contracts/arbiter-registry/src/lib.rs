#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use alloy_sol_types::sol;
use stylus_sdk::{
    alloy_primitives::{Address, U256},
    evm,
    prelude::*,
};

// ============================================================================
// Enums
// ============================================================================

/// Reasons for slashing an arbiter's stake
#[derive(Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum SlashReason {
    /// Arbiter colluded with one party
    Collusion = 0,
    /// Arbiter failed to respond within 72 hours
    Timeout = 1,
    /// Arbiter made consistently unfair rulings
    UnfairRulings = 2,
}

impl SlashReason {
    /// Convert from u8 to SlashReason
    #[inline]
    pub fn from_u8(value: u8) -> Option<Self> {
        match value {
            0 => Some(SlashReason::Collusion),
            1 => Some(SlashReason::Timeout),
            2 => Some(SlashReason::UnfairRulings),
            _ => None,
        }
    }
}

// ============================================================================
// Storage Layout
// ============================================================================

sol_storage! {
    /// Profile for a registered arbiter
    pub struct ArbiterProfile {
        /// Total amount staked by the arbiter
        uint256 stake;
        /// Current reputation score (default 100)
        uint256 reputation;
        /// Number of disputes resolved
        uint256 disputes_resolved;
        /// Whether the arbiter is currently active
        bool is_active;
    }

    /// Arbiter Registry Contract
    #[entrypoint]
    pub struct ArbiterRegistry {
        /// Mapping of arbiter address to ArbiterProfile data
        mapping(address => ArbiterProfile) arbiters;

        /// Admin address (can slash)
        address admin;

        /// Token used for staking
        address staking_token;

        /// Minimum stake required
        uint256 min_stake;
    }
}

// ============================================================================
// Interfaces
// ============================================================================

sol_interface! {
    interface IERC20 {
        function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    }
}

// ============================================================================
// Implementation
// ============================================================================

#[public]
impl ArbiterRegistry {
    /// Initialize the registry
    pub fn initialize(&mut self, staking_token: Address, min_stake: U256) {
        if self.admin.get() != Address::ZERO {
            return;
        }
        let caller = self.vm().msg_sender();
        self.admin.set(caller);
        self.staking_token.set(staking_token);
        self.min_stake.set(min_stake);
    }

    /// Register as an arbiter
    pub fn register_as_arbiter(&mut self, amount: U256) {
        let caller = self.vm().msg_sender();
        let min_stake_val = self.min_stake.get();
        let token_addr = self.staking_token.get();

        if amount < min_stake_val {
            panic!("Low Stake");
        }

        // Transfer tokens
        let token = IERC20::new(token_addr);
        let contract_address = self.vm().contract_address();
        let config = stylus_sdk::call::Call::new_in(self);
        let result = token.transfer_from(config, caller, contract_address, amount);

        if result.is_err() || !result.unwrap() {
            panic!("Tkn Fail");
        }

        // Update state
        let mut profile = self.arbiters.setter(caller);
        let current_stake = profile.stake.get();

        if current_stake == U256::ZERO {
            profile.reputation.set(U256::from(100));
            profile.disputes_resolved.set(U256::ZERO);
            profile.is_active.set(true);
        }

        profile.stake.set(current_stake + amount);

        evm::log(ArbiterRegistered {
            arbiter: caller,
            amount,
        });
    }

    /// Slash an arbiter (Admin only)
    pub fn slash_arbiter(&mut self, arbiter: Address, amount: U256, reason: u8) {
        let caller = self.vm().msg_sender();
        if caller != self.admin.get() {
            panic!("Not Admin");
        }

        let mut profile = self.arbiters.setter(arbiter);
        let current_stake = profile.stake.get();

        if current_stake < amount {
            panic!("Low Stake");
        }

        profile.stake.set(current_stake - amount);

        let current_reputation = profile.reputation.get();
        let penalty = match SlashReason::from_u8(reason) {
            Some(SlashReason::Collusion) => U256::from(50),
            Some(SlashReason::Timeout) => U256::from(10),
            Some(SlashReason::UnfairRulings) => U256::from(20),
            None => U256::from(0),
        };

        if current_reputation > penalty {
            profile.reputation.set(current_reputation - penalty);
        } else {
            profile.reputation.set(U256::ZERO);
            profile.is_active.set(false);
        }
    }

    /// Get arbiter status
    pub fn get_arbiter_status(&self, arbiter: Address) -> (bool, U256, U256) {
        let profile = self.arbiters.get(arbiter);
        (
            profile.is_active.get(),
            profile.stake.get(),
            profile.reputation.get(),
        )
    }
}

// ============================================================================
// Events
// ============================================================================

sol! {
    event ArbiterRegistered(address indexed arbiter, uint256 amount);
}
