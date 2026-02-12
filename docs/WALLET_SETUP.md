# Arbitrum Sepolia Wallet Setup & Deployment Guide

## 1. Setup Your Wallet (MetaMask)

1. **Install MetaMask** browser extension if you haven't.
2. **Add Arbitrum Sepolia Network**:
   - Open MetaMask → Click Network Dropdown → "Add network"
   - **Network Name**: Arbitrum Sepolia
   - **RPC URL**: `https://sepolia-rollup.arbitrum.io/rpc`
   - **Chain ID**: `421614`
   - **Currency Symbol**: `ETH`
   - **Block Explorer**: `https://sepolia.arbiscan.io`

   *Or just visit [chainlist.org](https://chainlist.org/chain/421614) and click "Connect Wallet"*

## 2. Get Testnet ETH (Faucet)

You need testnet ETH to pay for gas. Use one of these faucets:
- **[Alchemy Faucet](https://www.alchemy.com/faucets/arbitrum-sepolia)** (Requires signup, reliable)
- **[QuickNode Faucet](https://faucet.quicknode.com/arbitrum/sepolia)**
- **[Bware Labs Faucet](https://bwarelabs.com/faucets/arbitrum-sepolia)**

**Check your balance:** Once you claim, check MetaMask to see if you have ETH on Arbitrum Sepolia.

## 3. Export Private Key

You need your wallet's private key to deploy the contract.
1. Open MetaMask
2. Click the three dots (menu) next to your account
3. Click "Account details"
4. Click "Show private key"
5. Enter your password and copy the key

**⚠️ SECURITY WARNING:** Never share this key or commit it to GitHub. This is why we use `.env` files.

## 4. Run Deployment

Now that you have your key and ETH:

### Step 1: Create .env file
Run this in your terminal:
```bash
cp .env.example .env
```

### Step 2: Edit .env
Open `.env` and paste your key (remove the `0x` prefix if present):
```bash
PRIVATE_KEY=your_copied_key_here
```

### Step 3: Deploy
Run the deploy command:
```bash
# Load the key from .env and deploy
export $(grep -v '^#' .env | xargs) && cargo stylus deploy \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc \
  --private-key $PRIVATE_KEY
```
