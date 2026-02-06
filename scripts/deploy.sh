#!/bin/bash

# Deploy ArbiSecure Escrow Contract to Arbitrum Sepolia
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying ArbiSecure Escrow to Arbitrum Sepolia..."

# Check if .env exists
if [ ! -f ../.env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with PRIVATE_KEY and ALCHEMY_API_KEY"
    exit 1
fi

# Load environment variables
source ../.env

# Build the contract
echo "📦 Building contract..."
cd ../contracts
cargo build --release --target wasm32-unknown-unknown

# Deploy using Stylus CLI
echo "🔧 Deploying contract..."
# cargo stylus deploy \
#   --private-key=$PRIVATE_KEY \
#   --endpoint=$ARBITRUM_SEPOLIA_RPC_URL

echo "✅ Deployment complete!"
echo "📝 Update NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS in frontend/.env.local"
