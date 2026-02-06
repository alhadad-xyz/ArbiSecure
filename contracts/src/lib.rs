#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use stylus_sdk::{
    alloy_primitives::{Address, U256},
    prelude::*,
    storage::{StorageAddress, StorageU256, StorageMap},
    msg,
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

// Escrow deal structure
#[storage]
pub struct EscrowDeal {
    client: StorageAddress,
    freelancer: StorageAddress,
    amount: StorageU256,
    arbiter: StorageAddress,
    status: StorageU256, // Using U256 to store enum value
    created_at: StorageU256,
}

// Main contract storage
#[storage]
#[entrypoint]
pub struct ArbiSecureEscrow {
    deals: StorageMap<U256, EscrowDeal>,
    deal_count: StorageU256,
}

#[public]
impl ArbiSecureEscrow {
    /// Initialize the contract
    pub fn init(&mut self) -> Result<(), Vec<u8>> {
        self.deal_count.set(U256::from(0));
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
        let new_count = deal_id + U256::from(1);
        
        let mut deal = self.deals.setter(deal_id);
        deal.client.set(msg::sender());
        deal.freelancer.set(freelancer);
        deal.amount.set(amount);
        deal.arbiter.set(arbiter);
        deal.status.set(U256::from(DealStatus::Pending as u8));
        deal.created_at.set(U256::from(0)); // TODO: Add block timestamp
        
        self.deal_count.set(new_count);
        
        Ok(deal_id)
    }

    /// Deposit funds into escrow
    /// TODO (Day 2): Implement deposit logic
    /// - Check msg.value matches deal.amount
    /// - Update deal.status to Funded
    /// - Emit DealFunded event
    pub fn deposit(&mut self, deal_id: U256) -> Result<(), Vec<u8>> {
        // Stub - will implement in Day 2
        Ok(())
    }

    /// Release funds to freelancer
    /// TODO (Day 2): Implement release logic
    /// - Check msg.sender == client
    /// - Transfer funds to freelancer
    /// - Update status to Released
    /// - Emit DealReleased event
    pub fn release(&mut self, deal_id: U256) -> Result<(), Vec<u8>> {
        // Stub - will implement in Day 2
        Ok(())
    }

    /// Get deal details
    pub fn get_deal(&self, deal_id: U256) -> Result<(Address, Address, U256, Address, U256, U256), Vec<u8>> {
        let deal = self.deals.getter(deal_id);
        Ok((
            deal.client.get(),
            deal.freelancer.get(),
            deal.amount.get(),
            deal.arbiter.get(),
            deal.status.get(),
            deal.created_at.get(),
        ))
    }

    /// Get total number of deals
    pub fn get_deal_count(&self) -> Result<U256, Vec<u8>> {
        Ok(self.deal_count.get())
    }
}
