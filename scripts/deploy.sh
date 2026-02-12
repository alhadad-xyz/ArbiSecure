#!/bin/bash

# Deploy ArbiSecure Escrow Contract to Arbitrum Sepolia
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying ArbiSecure Escrow to Arbitrum Sepolia..."

# Resolve root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if .env exists
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo "❌ Error: .env file not found at $ROOT_DIR/.env"
    echo "Please create .env file with PRIVATE_KEY and ALCHEMY_API_KEY"
    exit 1
fi

# Load environment variables
source "$ROOT_DIR/.env"

# Fallback to public RPC if Alchemy key is missing or not set
if [[ -z "$ARBITRUM_SEPOLIA_RPC_URL" ]] || [[ "$ARBITRUM_SEPOLIA_RPC_URL" == *"YOUR_API_KEY"* ]]; then
    echo "⚠️  Alchemy RPC URL not configured or contains placeholder."
    echo "🔄  Falling back to public Arbitrum Sepolia endpoint..."
    ARBITRUM_SEPOLIA_RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"
fi

echo "Debug: Using RPC_URL: $ARBITRUM_SEPOLIA_RPC_URL"

# Build the contract
echo "📦 Building contract..."
cd "$ROOT_DIR/contracts"
cargo build --release --target wasm32-unknown-unknown

# Deploy using Stylus CLI
# Deploy using Stylus CLI with Nightly and specific gas settings
echo "🔧 Deploying contract..."

# Check if rust-nightly is installed
if ! rustup toolchain list | grep -q "nightly"; then
    echo "⚠️ Nightly toolchain not found. Installing..."
    rustup toolchain install nightly
    rustup target add wasm32-unknown-unknown --toolchain nightly
fi

cargo +nightly stylus deploy \
  --private-key=$PRIVATE_KEY \
  --endpoint=$ARBITRUM_SEPOLIA_RPC_URL \
  --max-fee-per-gas-gwei=10.0

echo "✅ Deployment complete!"
echo "📝 Update NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS in frontend/.env.local with the new address from output above."
