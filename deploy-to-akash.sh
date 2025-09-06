#!/bin/bash

# DeFi Transaction Guard - Complete Akash Network Deployment Script
# This script handles the entire deployment flow from start to finish

set -e

# Configuration
AKASH_KEY_NAME="defi-guard-wallet"
AKASH_CHAIN_ID="akashnet-2"
AKASH_NODE="https://rpc.akashnet.net:443"
SDL_FILE="demo-sdl.yaml"

echo "🚀 DeFi Transaction Guard - Akash Network Deployment"
echo "=================================================="

# Check if Akash CLI is installed
if ! command -v akash &> /dev/null; then
    echo "❌ Akash CLI not found. Installing..."
    curl -s https://raw.githubusercontent.com/ovrclk/akash/master/install.sh | sh
    export PATH="$PATH:$HOME/.akash/bin"
fi

echo "✅ Akash CLI version: $(akash version)"

# Check if wallet exists, create if not
if ! akash keys show $AKASH_KEY_NAME &> /dev/null; then
    echo "🔑 Creating new wallet: $AKASH_KEY_NAME"
    akash keys add $AKASH_KEY_NAME
    echo "⚠️  IMPORTANT: Save your wallet mnemonic phrase securely!"
    echo "⚠️  You'll need AKT tokens to deploy. Get them from:"
    echo "   - Testnet faucet: https://faucet.akash.network/"
    echo "   - Or transfer from an exchange"
    echo ""
    read -p "Press Enter after you've secured your wallet and funded it with AKT..."
fi

# Set environment variables
export AKASH_KEY_NAME=$AKASH_KEY_NAME
export AKASH_CHAIN_ID=$AKASH_CHAIN_ID
export AKASH_NODE=$AKASH_NODE

echo "🔍 Checking wallet balance..."
BALANCE=$(akash query bank balances $(akash keys show $AKASH_KEY_NAME -a) --node $AKASH_NODE | grep -o '[0-9]*uakt' | head -1 | sed 's/uakt//')
if [ -z "$BALANCE" ] || [ "$BALANCE" -lt 1000000 ]; then
    echo "❌ Insufficient AKT balance. You need at least 1 AKT to deploy."
    echo "   Current balance: $BALANCE uakt"
    echo "   Get AKT from: https://faucet.akash.network/"
    exit 1
fi
echo "✅ Wallet balance: $BALANCE uakt"

# Step 1: Create deployment
echo ""
echo "📦 Step 1: Creating deployment..."
DEPLOYMENT_OUTPUT=$(akash tx deployment create $SDL_FILE --from $AKASH_KEY_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --gas auto --gas-adjustment 1.5 --gas-prices 0.025uakt -y)
echo "✅ Deployment created"

# Extract deployment sequence
DSEQ=$(echo "$DEPLOYMENT_OUTPUT" | grep -o 'dseq: [0-9]*' | awk '{print $2}')
if [ -z "$DSEQ" ]; then
    echo "❌ Failed to extract deployment sequence"
    echo "Deployment output: $DEPLOYMENT_OUTPUT"
    exit 1
fi
echo "📋 Deployment DSEQ: $DSEQ"

# Step 2: Wait for bids
echo ""
echo "⏳ Step 2: Waiting for provider bids (30 seconds)..."
sleep 30

# Query for bids
echo "🔍 Checking for bids..."
BIDS=$(akash query market lease list --owner $(akash keys show $AKASH_KEY_NAME -a) --node $AKASH_NODE | grep -A 20 "dseq: $DSEQ" || echo "")

if [ -z "$BIDS" ]; then
    echo "❌ No bids received. This might be due to:"
    echo "   - Insufficient AKT balance"
    echo "   - SDL resource requirements too high"
    echo "   - Network issues"
    echo ""
    echo "Try again or check your SDL configuration."
    exit 1
fi

echo "✅ Bids received!"

# Extract provider address (first bid)
PROVIDER=$(echo "$BIDS" | grep "provider:" | head -1 | awk '{print $2}')
if [ -z "$PROVIDER" ]; then
    echo "❌ Failed to extract provider address"
    exit 1
fi
echo "🏢 Selected provider: $PROVIDER"

# Step 3: Create lease
echo ""
echo "🤝 Step 3: Creating lease with provider..."
LEASE_OUTPUT=$(akash tx market lease create --dseq $DSEQ --gseq 1 --oseq 1 --provider $PROVIDER --from $AKASH_KEY_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --gas auto --gas-adjustment 1.5 --gas-prices 0.025uakt -y)
echo "✅ Lease created"

# Step 4: Send manifest
echo ""
echo "📤 Step 4: Sending manifest to provider..."
MANIFEST_OUTPUT=$(akash provider send-manifest $SDL_FILE --dseq $DSEQ --provider $PROVIDER --from $AKASH_KEY_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID)
echo "✅ Manifest sent"

# Step 5: Get service endpoints
echo ""
echo "🌐 Step 5: Getting service endpoints..."
sleep 10

echo ""
echo "🎉 Deployment Complete!"
echo "====================="
echo ""
echo "📋 Deployment Details:"
echo "  DSEQ: $DSEQ"
echo "  Provider: $PROVIDER"
echo "  Wallet: $AKASH_KEY_NAME"
echo ""

# Get lease status and extract endpoints
echo "🔍 Fetching service endpoints..."
LEASE_STATUS=$(akash provider lease-status --dseq $DSEQ --gseq 1 --oseq 1 --provider $PROVIDER --from $AKASH_KEY_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID)

echo ""
echo "🌐 Service Endpoints:"
echo "===================="

# Extract and display endpoints
echo "$LEASE_STATUS" | grep -A 5 "defi-ai-service" | grep "hostname" | sed 's/.*hostname: /  🤖 AI Service: https:\/\//' | sed 's/.*/&/'
echo "$LEASE_STATUS" | grep -A 5 "gofr-backend" | grep "hostname" | sed 's/.*hostname: /  🔧 GoFr Backend: https:\/\//' | sed 's/.*/&:8080/'
echo "$LEASE_STATUS" | grep -A 5 "defi-frontend" | grep "hostname" | sed 's/.*hostname: /  🎨 Frontend: https:\/\//' | sed 's/.*/&/'
echo "$LEASE_STATUS" | grep -A 5 "prometheus-monitor" | grep "hostname" | sed 's/.*hostname: /  📊 Prometheus: https:\/\//' | sed 's/.*/&:9090/'

echo ""
echo "🔧 Management Commands:"
echo "======================"
echo "  View logs: akash provider lease-logs --dseq $DSEQ --gseq 1 --oseq 1 --provider $PROVIDER --from $AKASH_KEY_NAME"
echo "  Lease status: akash provider lease-status --dseq $DSEQ --gseq 1 --oseq 1 --provider $PROVIDER --from $AKASH_KEY_NAME"
echo "  Close deployment: akash tx deployment close --dseq $DSEQ --from $AKASH_KEY_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID"

echo ""
echo "🎯 Next Steps:"
echo "============="
echo "1. Test your services using the endpoints above"
echo "2. Configure your AI API keys in the environment variables"
echo "3. Monitor your deployment using the Prometheus endpoint"
echo "4. Check logs if any service isn't working properly"

echo ""
echo "🛡️ DeFi Transaction Guard is now live on Akash Network!"
echo "   Built with ❤️ for a safer DeFi ecosystem"