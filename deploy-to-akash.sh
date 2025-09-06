#!/bin/bash

# DeFi Transaction Guard - Akash Network Deployment
# This script deploys the AI service to Akash Network

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying DeFi Transaction Guard to Akash Network${NC}"
echo "=================================================="

# Check if akash CLI is installed
if ! command -v akash &> /dev/null; then
    echo -e "${RED}❌ Akash CLI not found. Installing...${NC}"
    echo "Please install Akash CLI from: https://docs.akash.network/guides/cli"
    exit 1
fi

# Check wallet setup
echo -e "${BLUE}📋 Checking Akash wallet setup...${NC}"
if ! akash keys list | grep -q "default"; then
    echo -e "${YELLOW}⚠️  No Akash wallet found. Creating one...${NC}"
    akash keys add default
    echo -e "${GREEN}✅ Wallet created. Please fund it with AKT tokens.${NC}"
    echo "Get testnet tokens from: https://faucet.akash.network"
    exit 1
fi

# Set environment variables
export AKASH_NODE="https://rpc.akashnet.net:443"
export AKASH_CHAIN_ID="akashnet-2"
export AKASH_KEYRING_BACKEND="os"
export AKASH_FROM="default"

# Check balance
echo -e "${BLUE}💰 Checking wallet balance...${NC}"
BALANCE=$(akash query bank balances $(akash keys show default -a) --node $AKASH_NODE)
echo "Balance: $BALANCE"

# Create deployment
echo -e "${BLUE}📦 Creating deployment...${NC}"
akash tx deployment create deploy.yaml --from $AKASH_FROM --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --gas-prices="0.025uakt" --gas="auto" --gas-adjustment=1.15 -y

# Wait for deployment
echo -e "${BLUE}⏳ Waiting for deployment to be created...${NC}"
sleep 10

# Get deployment sequence
DSEQ=$(akash query deployment list --owner $(akash keys show default -a) --node $AKASH_NODE -o json | jq -r '.deployments[0].deployment.deployment_id.dseq')
echo -e "${GREEN}✅ Deployment created with sequence: $DSEQ${NC}"

# Query bids
echo -e "${BLUE}🔍 Querying bids...${NC}"
akash query market bid list --owner $(akash keys show default -a) --node $AKASH_NODE --dseq $DSEQ

# Accept a bid (you'll need to choose one)
echo -e "${YELLOW}⚠️  Please manually accept a bid using:${NC}"
echo "akash tx market lease create --owner \$(akash keys show default -a) --node $AKASH_NODE --dseq $DSEQ --gseq 1 --oseq 1 --provider <PROVIDER_ADDRESS> --from $AKASH_FROM --chain-id $AKASH_CHAIN_ID --gas-prices=\"0.025uakt\" --gas=\"auto\" --gas-adjustment=1.15 -y"

echo ""
echo -e "${GREEN}🎉 Deployment initiated on Akash Network!${NC}"
echo -e "${BLUE}📊 Monitor your deployment at: https://akashnet.net/deployments${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Accept a bid from a provider"
echo "2. Wait for deployment to be active"
echo "3. Get the deployment URL"
echo "4. Update your backend to use Akash AI endpoint"
echo ""
echo -e "${GREEN}🏆 Now you're ACTUALLY using Akash Network!${NC}"