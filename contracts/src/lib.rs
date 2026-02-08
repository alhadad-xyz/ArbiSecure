#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use stylus_sdk::{
    alloy_primitives::{Address, U256},
    prelude::*,
    storage::{StorageAddress, StorageU256, StorageMap},
    msg,
    block,
    call,
    evm,
};
use alloy_sol_types::{sol, SolError};

// Deal status enum
#[derive(Copy, Clone, PartialEq, PartialOrd)]
pub enum DealStatus {
    Pending = 0,   // Deal created, awaiting deposit
    Funded = 1,    // Funds deposited
    Released = 2,  // Funds released to freelancer
    Disputed = 3,  // Dispute raised
    Resolved = 4,  // Dispute resolved
}

// Define events and errors using sol! macro
sol! {
    event DealFunded(uint256 indexed deal_id, uint256 amount);
    event DealReleased(uint256 indexed deal_id, address freelancer, uint256 amount);
    
    error InvalidStatus();
    error Unauthorized();
    error IncorrectAmount();
    error TransferFailed();
}

// Main contract storage
#[solidity_storage]
#[entrypoint]
pub struct ArbiSecureEscrow {
    deals_client: StorageMap<U256, StorageAddress>,
    deals_freelancer: StorageMap<U256, StorageAddress>,
    deals_amount: StorageMap<U256, StorageU256>,
    deals_arbiter: StorageMap<U256, StorageAddress>,
    deals_status: StorageMap<U256, StorageU256>,
    deals_created_at: StorageMap<U256, StorageU256>,
    deal_count: StorageU256,
}

#[external]
impl ArbiSecureEscrow {
    /// Initialize the contract
    pub fn init(&mut self) -> Result<(), Vec<u8>> {
        Ok(())
    }

    /// Create a new escrow deal
    pub fn create_deal(
        &mut self,
        freelancer: Address,
        amount: U256,
        arbiter: Address,
    ) -> Result<U256, Vec<u8>> {
        let deal_id = self.deal_count.get();
        let client = msg::sender();
        
        let mut client_storage = self.deals_client.setter(deal_id);
        client_storage.set(client);

        let mut freelancer_storage = self.deals_freelancer.setter(deal_id);
        freelancer_storage.set(freelancer);

        let mut amount_storage = self.deals_amount.setter(deal_id);
        amount_storage.set(amount);

        let mut arbiter_storage = self.deals_arbiter.setter(deal_id);
        arbiter_storage.set(arbiter);

        let mut status_storage = self.deals_status.setter(deal_id);
        status_storage.set(U256::from(DealStatus::Pending as u8));

        let mut created_at_storage = self.deals_created_at.setter(deal_id);
        created_at_storage.set(U256::from(block::timestamp()));

        let new_count = deal_id + U256::from(1);
        self.deal_count.set(new_count);

        Ok(deal_id)
    }

    /// Deposit funds into escrow
    #[payable]
    pub fn deposit(&mut self, deal_id: U256) -> Result<(), Vec<u8>> {
        // 1. Check status is Pending
        let current_status = self.deals_status.get(deal_id);
        if current_status != U256::from(DealStatus::Pending as u8) {
            return Err(InvalidStatus{}.encode());
        }

        // 2. Check amount matches
        let required_amount = self.deals_amount.get(deal_id);
        if msg::value() != required_amount {
             return Err(IncorrectAmount{}.encode());
        }

        // 3. Update status to Funded
        let mut status_storage = self.deals_status.setter(deal_id);
        status_storage.set(U256::from(DealStatus::Funded as u8));

        // 4. Emit event
        evm::log(DealFunded {
            deal_id,
            amount: required_amount,
        });

        Ok(())
    }

    /// Release funds to freelancer
    pub fn release(&mut self, deal_id: U256) -> Result<(), Vec<u8>> {
        // 1. Check sender is Client
        let client = self.deals_client.get(deal_id);
        if msg::sender() != client {
            return Err(Unauthorized{}.encode());
        }

        // 2. Check status is Funded
        let current_status = self.deals_status.get(deal_id);
        if current_status != U256::from(DealStatus::Funded as u8) {
             return Err(InvalidStatus{}.encode());
        }

        // 3. Transfer to Freelancer
        let freelancer = self.deals_freelancer.get(deal_id);
        let amount = self.deals_amount.get(deal_id);

        if call::transfer_eth(freelancer, amount).is_err() {
            return Err(TransferFailed{}.encode());
        }

        // 4. Update status to Released
        let mut status_storage = self.deals_status.setter(deal_id);
        status_storage.set(U256::from(DealStatus::Released as u8));

        // 5. Emit event
        evm::log(DealReleased {
            deal_id,
            freelancer,
            amount,
        });

        Ok(())
    }

    /// Get deal details
    pub fn get_deal(&self, deal_id: U256) -> Result<(Address, Address, U256, Address, U256, U256), Vec<u8>> {
        // StorageMap accesses return accessors (Guards). 
        // We convert StorageType to primitive using .into() (or check if that works).
        let client = self.deals_client.get(deal_id).into();
        let freelancer = self.deals_freelancer.get(deal_id).into();
        let amount = self.deals_amount.get(deal_id).into();
        let arbiter = self.deals_arbiter.get(deal_id).into();
        let status = self.deals_status.get(deal_id).into();
        let created_at = self.deals_created_at.get(deal_id).into();

        Ok((client, freelancer, amount, arbiter, status, created_at))
    }

    /// Get total number of deals
    pub fn get_deal_count(&self) -> Result<U256, Vec<u8>> {
        Ok(self.deal_count.get())
    }
}
