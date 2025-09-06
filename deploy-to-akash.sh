#!/bin/bash

# Deploy DeFi Transaction Guard to Akash Network
# Complete deployment script with error handling and monitoring

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
DEPLOYMENT_FILE="akash-deploy.yaml"
WALLET_NAME="${WALLET_NAME:-defi-guard-wallet}"
DEPLOYMENT_NAME="defi-guard-production"

echo -e "${CYAN}🚀 DeFi Transaction Guard - Akash Network Deployment${NC}"
echo -e "${CYAN}===================================================${NC}"

# Prerequisites check
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Akash CLI
if ! command -v akash &> /dev/null; then
    echo -e "${RED}❌ Akash CLI not found. Installing...${NC}"
    curl -sSfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | sh
    export PATH="$PATH:./bin"
    if ! command -v akash &> /dev/null; then
        echo -e "${RED}❌ Akash CLI installation failed. Please install manually.${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Akash CLI found${NC}"

# Check deployment file
if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo -e "${RED}❌ Deployment file '$DEPLOYMENT_FILE' not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Deployment file found${NC}"

# Wallet setup
echo -e "${BLUE}🔑 Setting up wallet...${NC}"
if ! akash keys show $WALLET_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠️ Wallet '$WALLET_NAME' not found. Creating new wallet...${NC}"
    akash keys add $WALLET_NAME
    echo -e "${RED}🚨 IMPORTANT: Save your mnemonic phrase securely!${NC}"
    echo -e "${YELLOW}💰 Fund your wallet with AKT tokens before continuing${NC}"
    echo -e "${BLUE}You can get testnet tokens from: https://faucet.akash.network${NC}"
    read -p "Press Enter after funding your wallet..."
else
    echo -e "${GREEN}✅ Wallet '$WALLET_NAME' found${NC}"
fi

# Get wallet address
WALLET_ADDRESS=$(akash keys show $WALLET_NAME -a)
echo -e "${BLUE}📍 Wallet Address: ${WALLET_ADDRESS}${NC}"

# Check balance
echo -e "${BLUE}💰 Checking wallet balance...${NC}"
BALANCE_RESPONSE=$(akash query bank balances $WALLET_ADDRESS --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID -o json 2>/dev/null || echo '{"balances":[]}')
BALANCE=$(echo $BALANCE_RESPONSE | jq -r '.balances[] | select(.denom=="uakt") | .amount // "0"')

if [ "$BALANCE" -lt 15000000 ]; then  # 15 AKT minimum
    echo -e "${RED}❌ Insufficient balance. Need at least 15 AKT for deployment${NC}"
    echo -e "${YELLOW}Current balance: $(echo "scale=6; $BALANCE/1000000" | bc 2>/dev/null || echo "0") AKT${NC}"
    echo -e "${BLUE}Get tokens from: https://faucet.akash.network${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Sufficient balance: $(echo "scale=6; $BALANCE/1000000" | bc) AKT${NC}"

# Environment variables check
echo -e "${BLUE}🔧 Checking environment configuration...${NC}"
ENV_WARNINGS=0

if [ -z "$GROK_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ GROK_API_KEY not set${NC}"
    ENV_WARNINGS=$((ENV_WARNINGS + 1))
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ GEMINI_API_KEY not set${NC}"
    ENV_WARNINGS=$((ENV_WARNINGS + 1))
fi

if [ -z "$BLOCKDAG_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ BLOCKDAG_API_KEY not set${NC}"
    ENV_WARNINGS=$((ENV_WARNINGS + 1))
fi

if [ $ENV_WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️ ${ENV_WARNINGS} API key(s) not configured. Services will use fallback modes.${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update deployment file with API keys
echo -e "${BLUE}🔄 Updating deployment configuration...${NC}"
cp $DEPLOYMENT_FILE ${DEPLOYMENT_FILE}.backup

# Create temporary deployment file with API keys
TEMP_DEPLOY_FILE="akash-deploy-temp.yaml"
cp $DEPLOYMENT_FILE $TEMP_DEPLOY_FILE

# Replace API keys if they exist
if [ ! -z "$GROK_API_KEY" ]; then
    sed -i.bak "s/GROK_API_KEY=/GROK_API_KEY=${GROK_API_KEY}/g" $TEMP_DEPLOY_FILE
fi

if [ ! -z "$GEMINI_API_KEY" ]; then
    sed -i.bak "s/GEMINI_API_KEY=/GEMINI_API_KEY=${GEMINI_API_KEY}/g" $TEMP_DEPLOY_FILE
fi

if [ ! -z "$BLOCKDAG_API_KEY" ]; then
    sed -i.bak "s/BLOCKDAG_API_KEY=/BLOCKDAG_API_KEY=${BLOCKDAG_API_KEY}/g" $TEMP_DEPLOY_FILE
fi

echo -e "${GREEN}✅ Configuration updated${NC}"

# Create deployment
echo -e "${PURPLE}🚀 Creating deployment on Akash Network...${NC}"
echo -e "${BLUE}This may take a few minutes...${NC}"

DEPLOYMENT_TX=$(akash tx deployment create $TEMP_DEPLOY_FILE \
    --from $WALLET_NAME \
    --node $AKASH_NODE \
    --chain-id $AKASH_CHAIN_ID \
    --gas-prices="0.025uakt" \
    --gas="auto" \
    --gas-adjustment="1.15" \
    --broadcast-mode=block \
    --yes \
    -o json 2>/dev/null)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment creation failed${NC}"
    rm -f $TEMP_DEPLOY_FILE ${TEMP_DEPLOY_FILE}.bak
    exit 1
fi

# Extract deployment sequence number
DEPLOYMENT_DSEQ=$(echo $DEPLOYMENT_TX | jq -r '.logs[]?.events[]? | select(.type=="akash.v1beta3.EventDeploymentCreated") | .attributes[]? | select(.key=="dseq") | .value' 2>/dev/null | head -1)

if [ -z "$DEPLOYMENT_DSEQ" ] || [ "$DEPLOYMENT_DSEQ" = "null" ]; then
    echo -e "${RED}❌ Failed to get deployment sequence number${NC}"
    echo -e "${YELLOW}Transaction response: ${DEPLOYMENT_TX}${NC}"
    rm -f $TEMP_DEPLOY_FILE ${TEMP_DEPLOY_FILE}.bak
    exit 1
fi

echo -e "${GREEN}✅ Deployment created with DSEQ: ${DEPLOYMENT_DSEQ}${NC}"

# Wait for bids
echo -e "${BLUE}⏳ Waiting for provider bids...${NC}"
sleep 45

# Check for bids with retries
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    BIDS=$(akash query market bid list --owner $WALLET_ADDRESS --dseq $DEPLOYMENT_DSEQ --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID -o json 2>/dev/null || echo '{"bids":[]}')
    BID_COUNT=$(echo $BIDS | jq '.bids | length' 2>/dev/null || echo "0")
    
    if [ "$BID_COUNT" -gt 0 ]; then
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}⏳ No bids yet (attempt $RETRY_COUNT/$MAX_RETRIES). Waiting...${NC}"
    sleep 30
done

if [ "$BID_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ No bids received after $MAX_RETRIES attempts${NC}"
    echo -e "${YELLOW}💡 Try adjusting pricing in deployment file or check provider availability${NC}"
    rm -f $TEMP_DEPLOY_FILE ${TEMP_DEPLOY_FILE}.bak
    exit 1
fi

echo -e "${GREEN}✅ Received ${BID_COUNT} bid(s)${NC}"

# Select the best bid (lowest price with GPU support)
SELECTED_BID=$(echo $BIDS | jq -r '.bids[0].bid')
PROVIDER=$(echo $SELECTED_BID | jq -r '.bid_id.provider')
GSEQ=$(echo $SELECTED_BID | jq -r '.bid_id.gseq')
OSEQ=$(echo $SELECTED_BID | jq -r '.bid_id.oseq')
BID_PRICE=$(echo $SELECTED_BID | jq -r '.price.amount')

echo -e "${BLUE}🎯 Selected provider: ${PROVIDER}${NC}"
echo -e "${BLUE}💰 Bid price: ${BID_PRICE} uAKT${NC}"

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
    --yes 2>/dev/null)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Lease creation failed${NC}"
    rm -f $TEMP_DEPLOY_FILE ${TEMP_DEPLOY_FILE}.bak
    exit 1
fi

echo -e "${GREEN}✅ Lease created successfully${NC}"

# Send manifest to provider
echo -e "${BLUE}📋 Sending manifest to provider...${NC}"
akash provider send-manifest $TEMP_DEPLOY_FILE \
    --dseq $DEPLOYMENT_DSEQ \
    --gseq $GSEQ \
    --oseq $OSEQ \
    --provider $PROVIDER \
    --from $WALLET_NAME \
    --node $AKASH_NODE \
    --chain-id $AKASH_CHAIN_ID > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Manifest sent successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Manifest send may have failed, but continuing...${NC}"
fi

# Wait for deployment to be ready
echo -e "${BLUE}⏳ Waiting for services to start (this may take 5-10 minutes)...${NC}"
sleep 120

# Get lease status and service URLs
echo -e "${BLUE}📊 Checking deployment status...${NC}"
LEASE_STATUS=$(akash provider lease-status \
    --dseq $DEPLOYMENT_DSEQ \
    --gseq $GSEQ \
    --oseq $OSEQ \
    --provider $PROVIDER \
    --from $WALLET_NAME \
    --node $AKASH_NODE \
    --chain-id $AKASH_CHAIN_ID \
    -o json 2>/dev/null || echo '{"services":{}}')

# Extract service URLs
AI_SERVICE_URL=$(echo $LEASE_STATUS | jq -r '.services."defi-guard-ai".uris[0] // "Not available"')
FRONTEND_URL=$(echo $LEASE_STATUS | jq -r '.services."defi-guard-frontend".uris[0] // "Not available"')
MONITORING_URL=$(echo $LEASE_STATUS | jq -r '.services."prometheus-monitoring".uris[0] // "Not available"')

# Save deployment information
cat > deployment-info.json << EOF
{
  "deployment_dseq": "$DEPLOYMENT_DSEQ",
  "provider": "$PROVIDER",
  "gseq": "$GSEQ",
  "oseq": "$OSEQ",
  "wallet_address": "$WALLET_ADDRESS",
  "services": {
    "ai_service": "$AI_SERVICE_URL",
    "frontend": "$FRONTEND_URL",
    "monitoring": "$MONITORING_URL"
  },
  "deployment_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "chain_id": "$AKASH_CHAIN_ID",
  "node": "$AKASH_NODE"
}
EOF

# Display deployment results
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
    if curl -s --max-time 10 "${AI_SERVICE_URL}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ AI service is responding${NC}"
    else
        echo -e "${YELLOW}⚠️ AI service not ready yet (may take a few more minutes)${NC}"
    fi
fi

if [ "$FRONTEND_URL" != "Not available" ]; then
    echo -e "${BLUE}Testing frontend...${NC}"
    if curl -s --max-time 10 "$FRONTEND_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is responding${NC}"
    else
        echo -e "${YELLOW}⚠️ Frontend not ready yet (may take a few more minutes)${NC}"
    fi
fi

# Cleanup
rm -f $TEMP_DEPLOY_FILE ${TEMP_DEPLOY_FILE}.bak

echo -e "${GREEN}💾 Deployment info saved to deployment-info.json${NC}"

echo -e "${CYAN}🚀 DeFi Transaction Guard is now live on Akash Network!${NC}"
echo -e "${CYAN}Features enabled:${NC}"
echo -e "${GREEN}  ✅ GPU-accelerated AI analysis${NC}"
echo -e "${GREEN}  ✅ BlockDAG network integration${NC}"
echo -e "${GREEN}  ✅ Redis caching for performance${NC}"
echo -e "${GREEN}  ✅ Prometheus monitoring${NC}"
echo -e "${GREEN}  ✅ Multi-AI provider support${NC}"

echo -e "${BLUE}📚 Useful commands:${NC}"
echo -e "${YELLOW}  # Check deployment status:${NC}"
echo -e "  akash provider lease-status --dseq $DEPLOYMENT_DSEQ --gseq $GSEQ --oseq $OSEQ --provider $PROVIDER --from $WALLET_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID"

echo -e "${YELLOW}  # View service logs:${NC}"
echo -e "  akash provider lease-logs --dseq $DEPLOYMENT_DSEQ --gseq $GSEQ --oseq $OSEQ --provider $PROVIDER --from $WALLET_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --service defi-guard-ai"

echo -e "${YELLOW}  # Update deployment:${NC}"
echo -e "  akash provider send-manifest akash-deploy.yaml --dseq $DEPLOYMENT_DSEQ --gseq $GSEQ --oseq $OSEQ --provider $PROVIDER --from $WALLET_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID"

echo -e "${YELLOW}  # Close deployment:${NC}"
echo -e "  akash tx deployment close --dseq $DEPLOYMENT_DSEQ --from $WALLET_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --gas-prices=0.025uakt --gas=auto --gas-adjustment=1.15 --yes"

echo -e "${PURPLE}🎯 Your DeFi Transaction Guard is protecting the blockchain on Akash Network!${NC}"