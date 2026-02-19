#!/bin/bash

# Deploy ArbiSecure Escrow Contract to Local Nitro Dev Node
# Usage: ./deploy_local.sh

set -e

echo "🚀 Deploying ArbiSecure Escrow to Local Nitro Dev Node..."

# Resolve root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Local Dev Node Configuration
RPC_URL="http://127.0.0.1:8547"
# Standard Nitro dev node pre-funded account
PRIVATE_KEY="0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659"

echo "Debug: Using RPC_URL: $RPC_URL"

# Build the contract
echo "📦 Building contract..."
cd "$ROOT_DIR/contracts"
cargo build --release --target wasm32-unknown-unknown

# Deploy using Stylus CLI
echo "🔧 Deploying contract..."

# Check if rust-nightly is installed
if ! rustup toolchain list | grep -q "nightly"; then
    echo "⚠️ Nightly toolchain not found. Installing..."
    rustup toolchain install nightly
    rustup target add wasm32-unknown-unknown --toolchain nightly
fi

# Use nightly to avoid metadata parsing issues
cargo +nightly stylus deploy \
  --private-key=$PRIVATE_KEY \
  --endpoint=$RPC_URL \
  --no-verify \
  --no-activate # Activation might need manual step or different flags on dev node, let's try activating by default first, but wait. run-dev-node.sh deploys a cache manager. 
  # Actually, let's try standard deploy first. Usually --no-verify is good for local.

# Rethinking: The standard deploy command activates if not told otherwise.
# Let's use the standard command but point to local RPC.

cargo +nightly stylus deploy \
  --private-key=$PRIVATE_KEY \
  --endpoint=$RPC_URL \
  --no-verify 

echo "✅ Local Deployment complete!"
echo "📝 Update NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS in frontend/.env.local with the new address from output above."
