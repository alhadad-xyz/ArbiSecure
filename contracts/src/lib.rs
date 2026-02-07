#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use stylus_sdk::{
    alloy_primitives::{Address, U256},
    prelude::*,
    storage::{StorageAddress, StorageU256, StorageMap},
    msg,
    block,
};

// Deal status enum
#[derive(Copy, Clone, PartialEq)]
pub enum DealStatus {
    Pending = 0,   // Deal created, awaiting deposit
    Funded = 1,    // Funds deposited
    Released = 2,  // Funds released to freelancer
    Disputed = 3,  // Dispute raised
    Resolved = 4,  // Dispute resolved
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
    /// TODO (Day 2): Implement deposit logic
    pub fn deposit(&mut self, _deal_id: U256) -> Result<(), Vec<u8>> {
        // TODO: Implement deposit logic
        Ok(())
    }

    /// Release funds to freelancer
    /// TODO (Day 2): Implement release logic
    pub fn release(&mut self, _deal_id: U256) -> Result<(), Vec<u8>> {
        // TODO: Implement release logic
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
