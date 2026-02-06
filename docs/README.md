# ArbiSecure - Setup Instructions

## Quick Start

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build contracts (requires Stylus CLI):
```bash
cd contracts
cargo stylus build
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `ALCHEMY_API_KEY`
- `PRIVATE_KEY` (for deployment)
