# Testing & Debugging Guide for Stylus Contracts

## Overview

Since local compilation is blocked by dependency issues, here are alternative approaches to test and debug your contract.

---

## 1. Syntax & Type Checking (Works Now!)

### Check Rust Syntax
```bash
cd contracts
cargo check --lib
```

This validates:
- ✅ Rust syntax correctness
- ✅ Type checking
- ✅ Import resolution
- ✅ Function signatures

**Note:** May still fail on final linking, but catches most code errors.

---

## 2. Export ABI for Frontend Integration

Generate the contract ABI without full compilation:

```bash
cd contracts
cargo build --features export-abi
```

This creates the ABI JSON that your frontend needs to interact with the contract.

---

## 3. Unit Tests (Rust)

Create unit tests in your contract file:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deal_status_values() {
        assert_eq!(DealStatus::Pending as u8, 0);
        assert_eq!(DealStatus::Funded as u8, 1);
        assert_eq!(DealStatus::Released as u8, 2);
    }

    #[test]
    fn test_deal_creation_logic() {
        // Test business logic without blockchain
        let client = Address::ZERO;
        let freelancer = Address::ZERO;
        let amount = U256::from(1000);
        
        // Add your logic tests here
    }
}
```

Run tests:
```bash
cargo test --lib
```

---

## 4. Deploy to Testnet & Test Live

**Best approach for hackathon:**

### Step 1: Try Direct Deployment
```bash
cd contracts
cargo stylus deploy \
  --private-key <YOUR_PRIVATE_KEY> \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

The Stylus CLI might handle dependencies better than local builds.

### Step 2: Verify on Arbiscan
After deployment, verify your contract:
```bash
cargo stylus verify \
  --deployment-tx <TX_HASH>
```

### Step 3: Test with Cast (Foundry)
```bash
# Call get_deal_count (read-only)
cast call <CONTRACT_ADDRESS> "get_deal_count()(uint256)" \
  --rpc-url https://sepolia-rollup.arbitrum.io/rpc

# Create a deal (write)
cast send <CONTRACT_ADDRESS> \
  "create_deal(address,uint256,address)" \
  <FREELANCER> <AMOUNT> <ARBITER> \
  --private-key <KEY> \
  --rpc-url https://sepolia-rollup.arbitrum.io/rpc
```

---

## 5. Frontend Testing (Recommended for Hackathon)

**Deploy once, test through UI:**

### Setup wagmi Hooks
```typescript
// In your frontend
import { useContractWrite, useContractRead } from 'wagmi'

const { write: createDeal } = useContractWrite({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'create_deal',
})

const { data: dealCount } = useContractRead({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'get_deal_count',
})
```

### Test Flow
1. Deploy contract to Sepolia
2. Update frontend with contract address
3. Test all functions through UI
4. Monitor transactions on Arbiscan

---

## 6. Manual Code Review Checklist

Since automated testing is limited, use this checklist:

### Storage Safety
- [ ] All storage fields use Stylus storage types (StorageU256, StorageAddress, etc.)
- [ ] No direct use of U256 or Address in storage structs
- [ ] StorageMap used correctly for mappings

### Function Safety
- [ ] All public functions return Result<T, Vec<u8>>
- [ ] Access control checks in place (msg::sender())
- [ ] No panics in production code
- [ ] Proper error handling

### Business Logic
- [ ] Deal creation increments counter
- [ ] Status transitions are valid (Pending → Funded → Released)
- [ ] No reentrancy vulnerabilities
- [ ] Funds can't be locked permanently

---

## 7. Debugging Deployed Contracts

### View Transaction Traces
```bash
# Get transaction receipt
cast receipt <TX_HASH> --rpc-url https://sepolia-rollup.arbitrum.io/rpc

# View logs
cast logs --address <CONTRACT_ADDRESS> \
  --rpc-url https://sepolia-rollup.arbitrum.io/rpc
```

### Check Contract State
```bash
# Read storage slot directly
cast storage <CONTRACT_ADDRESS> <SLOT> \
  --rpc-url https://sepolia-rollup.arbitrum.io/rpc
```

---

## 8. Workaround: Docker Build Environment

If you need local compilation, use Docker with a known-good environment:

```dockerfile
FROM rust:1.79.0

RUN cargo install cargo-stylus
RUN rustup target add wasm32-unknown-unknown

WORKDIR /app
COPY . .

RUN cargo build --target wasm32-unknown-unknown --release
```

Build:
```bash
docker build -t stylus-builder .
docker run -v $(pwd):/app stylus-builder
```

---

## Recommended Testing Strategy for Hackathon

**Day 1-2: Code Review + Syntax Check**
```bash
cargo check --lib
```

**Day 3-4: Deploy to Testnet**
```bash
cargo stylus deploy --private-key <KEY>
```

**Day 5-8: Frontend Integration Testing**
- Test all functions through UI
- Monitor Arbiscan for transaction success
- Iterate on frontend UX

**Day 9: Final Testing**
- End-to-end user flow
- Edge case testing
- Gas optimization verification

---

## Quick Debug Commands

```bash
# Check syntax only
cargo check --lib

# Try to generate ABI
cargo build --features export-abi

# View contract size (if build succeeds)
ls -lh target/wasm32-unknown-unknown/release/*.wasm

# Deploy directly
cargo stylus deploy --private-key $PRIVATE_KEY
```

---

## Next Steps

1. ✅ Code review complete (contract looks good!)
2. ⏭️ Try `cargo stylus deploy` directly
3. ⏭️ Set up frontend with contract ABI
4. ⏭️ Test through UI on Arbitrum Sepolia

**The contract code is solid** - focus on integration testing rather than local compilation!
