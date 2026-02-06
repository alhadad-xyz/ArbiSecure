# ArbiSecure

> Escrow platform powered by Arbitrum Stylus

## Project Structure

```
arbisecure/
├── contracts/      # Stylus Rust smart contracts
├── frontend/       # Next.js dApp
├── scripts/        # Deployment scripts
└── docs/           # Documentation
```

## Setup

### Prerequisites

- Node.js 18+
- Rust & Cargo
- Stylus CLI: `cargo install --force cargo-stylus`

### Installation

```bash
# Frontend
cd frontend
npm install
npm run dev

# Contracts
cd contracts
cargo stylus build
```

## Tech Stack

**Contracts:** Arbitrum Stylus (Rust)  
**Frontend:** Next.js 14, Tailwind CSS, wagmi, RainbowKit  
**Network:** Arbitrum Sepolia

## License

MIT
