#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloc::string::String; 

use stylus_sdk::{
    alloy_primitives::{Address, U256, U8},
    prelude::*,
    storage::{StorageAddress, StorageMap, StorageU256, StorageU8, StorageString}, 
    msg,
    call::transfer_eth,
};

// --- 1. DEFINISI STATUS (ENUM) ---
#[repr(u8)]
#[derive(PartialEq, Copy, Clone)]
pub enum DealStatus {
    Pending = 0,
    Funded = 1,
    Released = 2,
    Disputed = 3,
    Resolved = 4,
}

// Helper: Convert u8 -> DealStatus
impl From<u8> for DealStatus {
    fn from(val: u8) -> Self {
        match val {
            0 => DealStatus::Pending,
            1 => DealStatus::Funded,
            2 => DealStatus::Released,
            3 => DealStatus::Disputed,
            4 => DealStatus::Resolved,
            _ => DealStatus::Pending,
        }
    }
}

// --- 2. STORAGE STRUCT ---
#[storage]
pub struct EscrowDeal {
    pub buyer: StorageAddress,
    pub seller: StorageAddress,
    pub amount: StorageU256,
    pub status: StorageU8,
    // Simpan Hash (IPFS CID atau Link ID)
    pub data_hash: StorageString, 
}

// --- 3. MAIN CONTRACT ---
#[storage]
#[entrypoint]
pub struct ArbiSecure {
    pub deal_count: StorageU256,
    pub deals: StorageMap<U256, EscrowDeal>,
}

// --- 4. IMPLEMENTASI LOGIKA ---
#[public]
impl ArbiSecure {
    
    // --- CREATE DEAL ---
    // User wajib kirim hash referensi
    pub fn create_deal(&mut self, seller: Address, amount: U256, data_hash: String) -> Result<U256, Vec<u8>> {
        let current_id = self.deal_count.get();
        let new_id = current_id + U256::from(1);
        
        self.deal_count.set(new_id);

        let mut new_deal = self.deals.setter(new_id);
        new_deal.buyer.set(msg::sender());
        new_deal.seller.set(seller);
        new_deal.amount.set(amount);
        new_deal.status.set(U8::from(DealStatus::Pending as u8));
        
        // Simpan Hash-nya
        new_deal.data_hash.set_str(&data_hash);

        Ok(new_id)
    }

    // --- DEPOSIT ---
    #[payable]
    pub fn deposit(&mut self, deal_id: U256) -> Result<(), Vec<u8>> {
        let mut deal = self.deals.setter(deal_id);
        
        let status_u8: u8 = deal.status.get().to(); 
        if status_u8 != (DealStatus::Pending as u8) {
            return Err(b"Deal is not in Pending state".to_vec());
        }

        if msg::value() != deal.amount.get() {
             return Err(b"Incorrect deposit amount".to_vec());
        }

        deal.status.set(U8::from(DealStatus::Funded as u8));
        Ok(())
    }

    // --- RELEASE ---
    pub fn release(&mut self, deal_id: U256) -> Result<(), Vec<u8>> {
        let mut deal = self.deals.setter(deal_id);

        let status_u8: u8 = deal.status.get().to();
        if status_u8 != (DealStatus::Funded as u8) {
            return Err(b"Deal is not funded yet".to_vec());
        }

        if msg::sender() != deal.buyer.get() {
            return Err(b"Only Buyer can release funds".to_vec());
        }

        let seller = deal.seller.get();
        let amount = deal.amount.get();

        transfer_eth(seller, amount)?;

        deal.status.set(U8::from(DealStatus::Released as u8));
        Ok(())
    }

    // --- VIEW FUNCTIONS ---

    pub fn get_deal_count(&self) -> Result<U256, Vec<u8>> {
        Ok(self.deal_count.get())
    }

    // Return Data Lengkap: (Buyer, Seller, Amount, Status, Hash)
    pub fn get_deal(&self, deal_id: U256) -> Result<(Address, Address, U256, u8, String), Vec<u8>> {
        let deal = self.deals.get(deal_id);
        
        Ok((
            deal.buyer.get(),
            deal.seller.get(),
            deal.amount.get(),
            deal.status.get().to(),
            deal.data_hash.get_string(), // Ambil Hash-nya
        ))
    }
}

// --- TAMBAHAN WAJIB UNTUK EXPORT ABI ---
#[cfg(feature = "export-abi")]
fn main() {
    // Kita isi dengan "MIT" dan versi Solidity standar
    stylus_sdk::abi::export::print_abi::<ArbiSecure>("MIT", "pragma solidity ^0.8.23;");
}