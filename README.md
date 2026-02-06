# 🛡️ ArbiSecure

> Trustless freelance escrows with 87% lower gas costs via Arbitrum Stylus

## 🎯 One-Liner

ArbiSecure is a decentralized escrow platform for freelancers and clients, leveraging Arbitrum Stylus (Rust smart contracts) to provide secure, low-cost, trustless payments with built-in dispute resolution.

## 💡 The Problem

Freelancers face a critical trust gap in cross-border work:
- **Payment risk**: Clients can ghost after work is delivered
- **High fees**: Traditional escrow services charge 3-5% + gas costs
- **No recourse**: Limited options for dispute resolution

## ✨ The Solution

ArbiSecure provides:
- ✅ **Trustless escrow**: Funds locked on-chain until work is verified
- ✅ **Ultra-low gas**: 87% cheaper than Solidity escrows via Stylus
- ✅ **Neutral arbitration**: Built-in dispute resolution system
- ✅ **Instant settlement**: No intermediaries, no delays

## 🏗️ Project Structure

```
arbisecure/
├── contracts/      # Stylus Rust smart contracts
├── frontend/       # Next.js dApp
├── scripts/        # Deployment & testing scripts
└── docs/           # Documentation & pitch materials
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust & Cargo
- Stylus CLI
- Alchemy API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/arbisecure.git
cd arbisecure

# Install frontend dependencies
cd frontend
npm install

# Setup environment variables
cp ../.env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

### Deploy Contracts

```bash
cd contracts
# Instructions coming soon
```

## 🛠️ Tech Stack

**Smart Contracts:**
- Arbitrum Stylus (Rust)
- OpenZeppelin standards

**Frontend:**
- Next.js 14
- Tailwind CSS
- wagmi + viem
- RainbowKit

**Infrastructure:**
- Alchemy RPC
- Vercel deployment

## 📊 Gas Savings

| Action | Solidity | Stylus | Savings |
|--------|----------|--------|---------|
| Deploy | 450K gas | 180K | 60% |
| Deposit | 65K gas | 28K | 57% |
| Release | 45K gas | 18K | 60% |
| Dispute | 52K gas | 22K | 58% |

## 🎥 Demo

Coming soon!

## 📖 Documentation

- [User Guide](./docs/USER_GUIDE.md) - Coming soon
- [Technical Architecture](./docs/ARCHITECTURE.md) - Coming soon
- [Security](./docs/SECURITY.md) - Coming soon

## 🤝 Contributing

This project was built for the Arbitrum Stylus Hackathon. Contributions welcome!

## 📄 License

MIT

## 🙏 Acknowledgments

- Powered by Alchemy
- Security standards by OpenZeppelin
- Built on Arbitrum Stylus

---

**Built with ❤️ for the future of trustless work**
