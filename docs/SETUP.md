# ArbiSecure Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm
- **Rust** and Cargo ([Install Rust](https://rustup.rs/))
- **Stylus CLI**: `cargo install --force cargo-stylus`
- **Alchemy API Key**: Sign up at [Alchemy](https://www.alchemy.com/)
- **WalletConnect Project ID** (optional): Get one at [WalletConnect Cloud](https://cloud.walletconnect.com/)

## Quick Start

### 1. Clone and Install

```bash
cd arbisecure
```

### 2. Setup Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your keys:
# - ALCHEMY_API_KEY
# - PRIVATE_KEY (for contract deployment)
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. Setup Frontend Environment

```bash
# Create frontend .env.local
cp ../.env.example .env.local

# Edit .env.local and add:
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (optional)
# - Contract addresses will be added after deployment
```

### 5. Build Stylus Contract

```bash
cd ../contracts

# Add wasm32 target
rustup target add wasm32-unknown-unknown

# Build the contract
cargo build --release --target wasm32-unknown-unknown

# Check if contract is valid
cargo stylus check
```

### 6. Run Frontend Development Server

```bash
cd ../frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app!

## Project Structure

```
arbisecure/
├── contracts/          # Stylus Rust smart contracts
│   ├── src/
│   │   └── main.rs    # Main escrow contract
│   └── Cargo.toml     # Rust dependencies
├── frontend/          # Next.js dApp
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   └── lib/           # Utilities and configs
├── scripts/           # Deployment scripts
│   └── deploy.sh      # Deploy to Arbitrum Sepolia
└── docs/              # Documentation
```

## Next Steps (Day 1 Evening)

- [ ] Test wallet connection on frontend
- [ ] Deploy contract to Arbitrum Sepolia testnet
- [ ] Update frontend with deployed contract address
- [ ] Create test deal to verify integration

## Day 2 Goals

- Implement `deposit()` function in contract
- Implement `release()` function in contract
- Build "Create Deal" form in frontend
- Connect frontend to deployed contract

## Troubleshooting

### Rust/Stylus Issues

**Error: `cargo stylus` not found**
```bash
cargo install --force cargo-stylus
```

**Error: wasm32 target not found**
```bash
rustup target add wasm32-unknown-unknown
```

### Frontend Issues

**Error: Module not found '@rainbow-me/rainbowkit'**
```bash
cd frontend
npm install
```

**Wallet not connecting**
- Ensure you're on Arbitrum Sepolia network
- Check that WalletConnect Project ID is set (optional but recommended)

## Resources

- [Arbitrum Stylus Docs](https://docs.arbitrum.io/stylus/quickstart)
- [Stylus SDK Reference](https://docs.rs/stylus-sdk/)
- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)
- [wagmi Docs](https://wagmi.sh/)

## Team Communication

- Daily standups at 9 AM
- Use GitHub issues for bug tracking
- Sync points: After lunch and end of day
