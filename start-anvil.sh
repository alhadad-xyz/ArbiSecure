#!/bin/bash
# Start Anvil with Arbitrum Sepolia fork

echo "🔧 Starting Anvil local fork of Arbitrum Sepolia..."
echo ""
echo "This will give you 10 pre-funded accounts with 10,000 ETH each!"
echo ""

anvil \
  --fork-url https://sepolia-rollup.arbitrum.io/rpc \
  --chain-id 31337 \
  --port 8545 \
  --host 0.0.0.0

# After starting, import one of these private keys to MetaMask:
# Account #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# Account #1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

# Add this network to MetaMask:
# Network Name: Anvil Local
# RPC URL: http://127.0.0.1:8545
# Chain ID: 31337
# Currency: ETH
