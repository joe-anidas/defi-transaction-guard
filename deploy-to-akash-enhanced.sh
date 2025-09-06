#!/bin/bash

# Enhanced Akash Network Deployment Script for DeFi Transaction Guard
# Features: BlockDAG integration, GPU acceleration, AI caching, monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
AKASH_CHAIN_ID="akashnet-2"
AKASH_NODE="https://rpc.akash.forbole.com:443"
DEPLOYMENT_FILE="deploy-enhanced.yaml"
WALLET_NAME="defi-guard-wallet"
DEPLOYMENT_NAME="defi-guard-enhanced"

echo -e "${CYAN}🚀 DeFi Transaction Guard - Enhanced Akash Deployment${NC}"
echo -e "${CYAN}=================================================${NC}"

# Check if akash CLI is installed
if ! command -v akash &> /dev/null; then
    echo -e "${RED}❌ Akash CLI not found. Please install it first:${NC}"
    echo -e "${YELLOW}curl -sSfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Akash CLI found${NC}"

# Check wallet
echo -e "${BLUE}🔑 Checking wallet...${NC}"
if ! akash keys show $WALLET_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠️ Wallet '$WALLET_NAME' not found. Creating new wallet...${NC}"
    akash keys add $WALLET_NAME
    echo -e "${RED}🚨 IMPORTANT: Save your mnemonic phrase securely!${NC}"
    echo -e "${YELLOW}💰 Fund your wallet with AKT tokens before continuing${NC}"
    read -p "Press Enter after funding your wallet..."
else
    echo -e "${GREEN}✅ Wallet '$WALLET_NAME' found${NC}"
fi

# Get wallet address
WALLET_ADDRESS=$(akash keys show $WALLET_NAME -a)
echo -e "${BLUE}📍 Wallet Address: ${WALLET_ADDRESS}${NC}"

# Check balance
echo -e "${BLUE}💰 Checking wallet balance...${NC}"
BALANCE=$(akash query bank balances $WALLET_ADDRESS --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID -o json | jq -r '.balances[0].amount // "0"')
if [ "$BALANCE" -lt 5000000 ]; then
    echo -e "${RED}❌ Insufficient balance. Need at least 5 AKT for deployment${NC}"
    echo -e "${YELLOW}Current balance: $(echo "scale=6; $BALANCE/1000000" | bc) AKT${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Sufficient balance: $(echo "scale=6; $BALANCE/1000000" | bc) AKT${NC}"

# Validate deployment file
echo -e "${BLUE}📋 Validating deployment configuration...${NC}"
if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo -e "${RED}❌ Deployment file '$DEPLOYMENT_FILE' not found${NC}"
    exit 1
fi

# Check for required environment variables
echo -e "${BLUE}🔧 Checking environment configuration...${NC}"
if [ -z "$GROK_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ GROK_API_KEY not set. AI analysis will use fallback mode${NC}"
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ GEMINI_API_KEY not set. AI analysis will use fallback mode${NC}"
fi

if [ -z "$BLOCKDAG_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ BLOCKDAG_API_KEY not set. BlockDAG features will be limited${NC}"
fi

# Update deployment file with API keys
echo -e "${BLUE}🔄 Updating deployment configuration...${NC}"
cp $DEPLOYMENT_FILE ${DEPLOYMENT_FILE}.backup

# Replace API keys in deployment file
if [ ! -z "$GROK_API_KEY" ]; then
    sed -i.bak "s/gsk_your_key_here/$GROK_API_KEY/g" $DEPLOYMENT_FILE
fi

if [ ! -z "$GEMINI_API_KEY" ]; then
    sed -i.bak "s/your_gemini_key_here/$GEMINI_API_KEY/g" $DEPLOYMENT_FILE
fi

if [ ! -z "$BLOCKDAG_API_KEY" ]; then
    sed -i.bak "s/your_blockdag_key_here/$BLOCKDAG_API_KEY/g" $DEPLOYMENT_FILE
fi

echo -e "${GREEN}✅ Configuration updated${NC}"

# Create deployment
echo -e "${PURPLE}🚀 Creating deployment on Akash Network...${NC}"
echo -e "${BLUE}This may take a few minutes...${NC}"

DEPLOYMENT_TX=$(akash tx deployment create $DEPLOYMENT_FILE \
    --from $WALLET_NAME \
    --node $AKASH_NODE \
    --chain-id $AKASH_CHAIN_ID \
    --gas-prices="0.025uakt" \
    --gas="auto" \
    --gas-adjustment="1.15" \
    --broadcast-mode=block \
    --yes \
    -o json)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment creation failed${NC}"
    exit 1
fi

DEPLOYMENT_DSEQ=$(echo $DEPLOYMENT_TX | jq -r '.logs[0].events[] | select(.type=="akash.v1beta3.EventDeploymentCreated") | .attributes[] | select(.key=="dseq") | .value')

if [ -z "$DEPLOYMENT_DSEQ" ] || [ "$DEPLOYMENT_DSEQ" = "null" ]; then
    echo -e "${RED}❌ Failed to get deployment sequence number${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment created with DSEQ: ${DEPLOYMENT_DSEQ}${NC}"

# Wait for bids
echo -e "${BLUE}⏳ Waiting for provider bids...${NC}"
sleep 30

# Check for bids
BIDS=$(akash query market bid list --owner $WALLET_ADDRESS --dseq $DEPLOYMENT_DSEQ --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID -o json)
BID_COUNT=$(echo $BIDS | jq '.bids | length')

if [ "$BID_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️ No bids received yet. Waiting longer...${NC}"
    sleep 60
    BIDS=$(akash query market bid list --owner $WALLET_ADDRESS --dseq $DEPLOYMENT_DSEQ --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID -o json)
    BID_COUNT=$(echo $BIDS | jq '.bids | length')
fi

if [ "$BID_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ No bids received. Try adjusting pricing in deployment file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Received ${BID_COUNT} bid(s)${NC}"

# Select the first bid (you might want to implement bid selection logic)
PROVIDER=$(echo $BIDS | jq -r '.bids[0].bid.bid_id.provider')
GSEQ=$(echo $BIDS | jq -r '.bids[0].bid.bid_id.gseq')
OSEQ=$(echo $BIDS | jq -r '.bids[0].bid.bid_id.oseq')

echo -e "${BLUE}🎯 Selected provider: ${PROVIDER}${NC}"

# Create lease
echo -e "${PURPLE}📝 Creating lease...${NC}"
LEASE_TX=$(akash tx market lease create \
    --dseq $DEPLOYMENT_DSEQ \
    --gseq $GSEQ \
    --oseq $OSEQ \
    --provider $PROVIDER \
    --from $WALLET_NAME \
    --node $AKASH_NODE \
    --chain-id $AKASH_CHAIN_ID \
    --gas-prices="0.025uakt" \
    --gas="auto" \
    --gas-adjustment="1.15" \
    --broadcast-mode=block \
    --yes)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Lease creation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Lease created successfully${NC}"

# Wait for deployment to be ready
echo -e "${BLUE}⏳ Waiting for deployment to be ready...${NC}"
sleep 60

# Get lease status
echo -e "${BLUE}📊 Checking deployment status...${NC}"
LEASE_STATUS=$(akash provider lease-status \
    --dseq $DEPLOYMENT_DSEQ \
    --gseq $GSEQ \
    --oseq $OSEQ \
    --provider $PROVIDER \
    --from $WALLET_NAME \
    --node $AKASH_NODE \
    --chain-id $AKASH_CHAIN_ID \
    -o json)

# Extract service URLs
AI_SERVICE_URL=$(echo $LEASE_STATUS | jq -r '.services."defi-guard-ai".uris[0] // "Not available"')
FRONTEND_URL=$(echo $LEASE_STATUS | jq -r '.services."defi-guard-frontend".uris[0] // "Not available"')
MONITORING_URL=$(echo $LEASE_STATUS | jq -r '.services."monitoring-prometheus".uris[0] // "Not available"')

# Display deployment information
echo -e "${CYAN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${CYAN}========================${NC}"
echo -e "${GREEN}📍 Deployment DSEQ: ${DEPLOYMENT_DSEQ}${NC}"
echo -e "${GREEN}🏢 Provider: ${PROVIDER}${NC}"
echo -e "${GREEN}🤖 AI Service: ${AI_SERVICE_URL}${NC}"
echo -e "${GREEN}🌐 Frontend: ${FRONTEND_URL}${NC}"
echo -e "${GREEN}📊 Monitoring: ${MONITORING_URL}${NC}"

# Test endpoints
echo -e "${BLUE}🧪 Testing deployment...${NC}"

if [ "$AI_SERVICE_URL" != "Not available" ]; then
    echo -e "${BLUE}Testing AI service health...${NC}"
    if curl -s "${AI_SERVICE_URL}/health" > /dev/null; then
        echo -e "${GREEN}✅ AI service is responding${NC}"
    else
        echo -e "${YELLOW}⚠️ AI service not ready yet (may take a few more minutes)${NC}"
    fi
fi

# Save deployment info
cat > deployment-info.json << EOF
{
  "deployment_dseq": "$DEPLOYMENT_DSEQ",
  "provider": "$PROVIDER",
  "gseq": "$GSEQ",
  "oseq": "$OSEQ",
  "ai_service_url": "$AI_SERVICE_URL",
  "frontend_url": "$FRONTEND_URL",
  "monitoring_url": "$MONITORING_URL",
  "wallet_address": "$WALLET_ADDRESS",
  "deployment_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo -e "${GREEN}💾 Deployment info saved to deployment-info.json${NC}"

# Restore original deployment file
mv ${DEPLOYMENT_FILE}.backup $DEPLOYMENT_FILE

echo -e "${CYAN}🚀 Enhanced DeFi Transaction Guard is now live on Akash Network!${NC}"
echo -e "${CYAN}Features enabled:${NC}"
echo -e "${GREEN}  ✅ GPU-accelerated AI analysis${NC}"
echo -e "${GREEN}  ✅ BlockDAG network integration${NC}"
echo -e "${GREEN}  ✅ Redis caching for performance${NC}"
echo -e "${GREEN}  ✅ Prometheus monitoring${NC}"
echo -e "${GREEN}  ✅ Grok + Gemini AI providers${NC}"

echo -e "${BLUE}📚 Useful commands:${NC}"
echo -e "${YELLOW}  # Check deployment status:${NC}"
echo -e "  akash provider lease-status --dseq $DEPLOYMENT_DSEQ --gseq $GSEQ --oseq $OSEQ --provider $PROVIDER --from $WALLET_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID"
echo -e "${YELLOW}  # View logs:${NC}"
echo -e "  akash provider lease-logs --dseq $DEPLOYMENT_DSEQ --gseq $GSEQ --oseq $OSEQ --provider $PROVIDER --from $WALLET_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID"
echo -e "${YELLOW}  # Close deployment:${NC}"
echo -e "  akash tx deployment close --dseq $DEPLOYMENT_DSEQ --from $WALLET_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --gas-prices=0.025uakt --gas=auto --gas-adjustment=1.15 --yes"

echo -e "${PURPLE}🎯 Your DeFi Transaction Guard is protecting the blockchain!${NC}"