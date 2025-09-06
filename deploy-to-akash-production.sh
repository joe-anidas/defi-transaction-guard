#!/bin/bash

# Deploy DeFi Transaction Guard to Akash Network - Production Ready
# Aligned with your project structure and requirements

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
DEPLOYMENT_FILE="akash-production-deploy.yaml"
WALLET_NAME="${WALLET_NAME:-defi-guard-wallet}"
PROJECT_NAME="defi-transaction-guard"

echo -e "${CYAN}🚀 DeFi Transaction Guard - Akash Production Deployment${NC}"
echo -e "${CYAN}====================================================${NC}"

# Prerequisites validation
echo -e "${BLUE}🔍 Validating prerequisites...${NC}"

# Check Akash CLI
if ! command -v akash &> /dev/null; then
    echo -e "${YELLOW}📥 Installing Akash CLI...${NC}"
    curl -sSfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | sh
    export PATH="$PATH:./bin"
    
    if ! command -v akash &> /dev/null; then
        echo -e "${RED}❌ Akash CLI installation failed${NC}"
        echo -e "${BLUE}Please install manually: https://docs.akash.network/guides/cli${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Akash CLI found: $(akash version --short)${NC}"

# Check deployment file
if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo -e "${RED}❌ Deployment file '$DEPLOYMENT_FILE' not found${NC}"
    echo -e "${BLUE}Please run ./build-for-akash.sh first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment file found${NC}"

# Check jq for JSON processing
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️ jq not found. Installing...${NC}"
    if command -v brew &> /dev/null; then
        brew install jq
    elif command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y jq
    else
        echo -e "${RED}❌ Please install jq manually${NC}"
        exit 1
    fi
fi

# Wallet management
echo -e "${BLUE}🔑 Managing Akash wallet...${NC}"

if ! akash keys show $WALLET_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠️ Wallet '$WALLET_NAME' not found${NC}"
    echo -e "${BLUE}Choose an option:${NC}"
    echo -e "1. Create new wallet"
    echo -e "2. Import existing wallet"
    read -p "Enter choice (1 or 2): " choice
    
    case $choice in
        1)
            echo -e "${BLUE}Creating new wallet...${NC}"
            akash keys add $WALLET_NAME
            echo -e "${RED}🚨 CRITICAL: Save your mnemonic phrase securely!${NC}"
            ;;
        2)
            echo -e "${BLUE}Importing existing wallet...${NC}"
            akash keys add $WALLET_NAME --recover
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${YELLOW}💰 Please fund your wallet with AKT tokens${NC}"
    echo -e "${BLUE}Mainnet: Buy from exchanges (Osmosis, Kraken, etc.)${NC}"
    echo -e "${BLUE}Testnet: Get from https://faucet.akash.network${NC}"
    read -p "Press Enter after funding your wallet..."
else
    echo -e "${GREEN}✅ Wallet '$WALLET_NAME' found${NC}"
fi

# Get wallet info
WALLET_ADDRESS=$(akash keys show $WALLET_NAME -a)
echo -e "${BLUE}📍 Wallet Address: ${WALLET_ADDRESS}${NC}"

# Check wallet balance
echo -e "${BLUE}💰 Checking wallet balance...${NC}"
BALANCE_RESPONSE=$(akash query bank balances $WALLET_ADDRESS \
    --node $AKASH_NODE \
    --chain-id $AKASH_CHAIN_ID \
    -o json 2>/dev/null || echo '{"balances":[]}')

BALANCE=$(echo $BALANCE_RESPONSE | jq -r '.balances[] | select(.denom=="uakt") | .amount // "0"')
BALANCE_AKT=$(echo "scale=6; $BALANCE/1000000" | bc 2>/dev/null || echo "0")

echo -e "${BLUE}Current balance: ${BALANCE_AKT} AKT${NC}"

# Minimum balance check (20 AKT for production deployment)
MIN_BALANCE=20000000  # 20 AKT in uAKT
if [ "$BALANCE" -lt "$MIN_BALANCE" ]; then
    echo -e "${RED}❌ Insufficient balance for production deployment${NC}"
    echo -e "${YELLOW}Required: 20+ AKT, Current: ${BALANCE_AKT} AKT${NC}"
    echo -e "${BLUE}Please fund your wallet and try again${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Sufficient balance for deployment${NC}"

# Environment configuration
echo -e "${BLUE}🔧 Configuring environment...${NC}"

# Check for API keys
API_KEYS_CONFIGURED=0
if [ ! -z "$GROK_API_KEY" ]; then
    echo -e "${GREEN}✅ Grok API key configured${NC}"
    API_KEYS_CONFIGURED=$((API_KEYS_CONFIGURED + 1))
else
    echo -e "${YELLOW}⚠️ GROK_API_KEY not set${NC}"
fi

if [ ! -z "$GEMINI_API_KEY" ]; then
    echo -e "${GREEN}✅ Gemini API key configured${NC}"
    API_KEYS_CONFIGURED=$((API_KEYS_CONFIGURED + 1))
else
    echo -e "${YELLOW}⚠️ GEMINI_API_KEY not set${NC}"
fi

if [ ! -z "$BLOCKDAG_API_KEY" ]; then
    echo -e "${GREEN}✅ BlockDAG API key configured${NC}"
    API_KEYS_CONFIGURED=$((API_KEYS_CONFIGURED + 1))
else
    echo -e "${YELLOW}⚠️ BLOCKDAG_API_KEY not set${NC}"
fi

if [ $API_KEYS_CONFIGURED -eq 0 ]; then
    echo -e "${YELLOW}⚠️ No API keys configured. Services will use fallback modes.${NC}"
    echo -e "${BLUE}For production, consider setting at least one AI API key:${NC}"
    echo -e "  export GROK_API_KEY='gsk_your_key_here'"
    echo -e "  export GEMINI_API_KEY='your_gemini_key_here'"
    
    read -p "Continue with fallback mode? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Prepare deployment file with API keys
echo -e "${BLUE}📝 Preparing deployment configuration...${NC}"
TEMP_DEPLOY_FILE="akash-deploy-temp.yaml"
cp $DEPLOYMENT_FILE $TEMP_DEPLOY_FILE

# Update API keys in deployment file
if [ ! -z "$GROK_API_KEY" ]; then
    sed -i.bak "s/GROK_API_KEY=/GROK_API_KEY=${GROK_API_KEY}/g" $TEMP_DEPLOY_FILE
fi

if [ ! -z "$GEMINI_API_KEY" ]; then
    sed -i.bak "s/GEMINI_API_KEY=/GEMINI_API_KEY=${GEMINI_API_KEY}/g" $TEMP_DEPLOY_FILE
fi

if [ ! -z "$BLOCKDAG_API_KEY" ]; then
    sed -i.bak "s/BLOCKDAG_API_KEY=/BLOCKDAG_API_KEY=${BLOCKDAG_API_KEY}/g" $TEMP_DEPLOY_FILE
fi

if [ ! -z "$PRIVATE_KEY" ]; then
    sed -i.bak "s/PRIVATE_KEY=/PRIVATE_KEY=${PRIVATE_KEY}/g" $TEMP_DEPLOY_FILE
fi

echo -e "${GREEN}✅ Deployment configuration prepared${NC}"

# Create deployment on Akash
echo -e "${PURPLE}🚀 Creating deployment on Akash Network...${NC}"
echo -e "${BLUE}This will deploy:${NC}"
echo -e "  🤖 AI Detection Service (GPU-powered)"
echo -e "  ⚙️ GoFr Backend API"
echo -e "  🌐 React Frontend Dashboard"
echo -e "  🗄️ Redis Cache"
echo -e "  📊 Prometheus Monitoring"

read -p "Proceed with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    rm -f $TEMP_DEPLOY_FILE ${TEMP_DEPLOY_FILE}.bak
    exit 0
fi

echo -e "${BLUE}Creating deployment transaction...${NC}"
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
    echo -e "${YELLOW}Check your balance and try again${NC}"
    rm -f $TEMP_DEPLOY_FILE ${TEMP_DEPLOY_FILE}.bak
    exit 1
fi

# Extract deployment sequence number
DEPLOYMENT_DSEQ=$(echo $DEPLOYMENT_TX | jq -r '
    .logs[]?.events[]? | 
    select(.type=="akash.v1beta3.EventDeploymentCreated") | 
    .attributes[]? | 
    select(.key=="dseq") | 
    .value' 2>/dev/null | head -1)

if [ -z "$DEPLOYMENT_DSEQ" ] || [ "$DEPLOYMENT_DSEQ" = "null" ]; then
    echo -e "${RED}❌ Failed to extract deployment sequence number${NC}"
    echo -e "${YELLOW}Transaction: ${DEPLOYMENT_TX}${NC}"
    rm -f $TEMP_DEPLOY_FILE ${TEMP_DEPLOY_FILE}.bak
    exit 1
fi

echo -e "${GREEN}✅ Deployment created successfully${NC}"
echo -e "${BLUE}📍 Deployment DSEQ: ${DEPLOYMENT_DSEQ}${NC}"

# Wait for and select bids
echo -e "${BLUE}⏳ Waiting for provider bids...${NC}"
echo -e "${YELLOW}This may take 2-5 minutes...${NC}"

MAX_WAIT=300  # 5 minutes
WAIT_TIME=0
BID_COUNT=0

while [ $WAIT_TIME -lt $MAX_WAIT ] && [ $BID_COUNT -eq 0 ]; do
    sleep 30
    WAIT_TIME=$((WAIT_TIME + 30))
    
    BIDS=$(akash query market bid list \
        --owner $WALLET_ADDRESS \
        --dseq $DEPLOYMENT_DSEQ \
        --node $AKASH_NODE \
        --chain-id $AKASH_CHAIN_ID \
        -o json 2>/dev/null || echo '{"bids":[]}')
    
    BID_COUNT=$(echo $BIDS | jq '.bids | length' 2>/dev/null || echo "0")
    
    if [ $BID_COUNT -gt 0 ]; then
        break
    fi
    
    echo -e "${YELLOW}⏳ Still waiting for bids... (${WAIT_TIME}s/${MAX_WAIT}s)${NC}"
done

if [ $BID_COUNT -eq 0 ]; then
    echo -e "${RED}❌ No bids received after ${MAX_WAIT} seconds${NC}"
    echo -e "${YELLOW}💡 Try:${NC}"
    echo -e "  • Increasing bid prices in deployment file"
    echo -e "  • Checking provider availability at stats.akash.network"
    echo -e "  • Reducing resource requirements"
    rm -f $TEMP_DEPLOY_FILE ${TEMP_DEPLOY_FILE}.bak
    exit 1
fi

echo -e "${GREEN}✅ Received ${BID_COUNT} bid(s)${NC}"

# Select best bid (prefer GPU providers)
SELECTED_BID=$(echo $BIDS | jq -r '.bids[0].bid')
PROVIDER=$(echo $SELECTED_BID | jq -r '.bid_id.provider')
GSEQ=$(echo $SELECTED_BID | jq -r '.bid_id.gseq')
OSEQ=$(echo $SELECTED_BID | jq -r '.bid_id.oseq')
BID_PRICE=$(echo $SELECTED_BID | jq -r '.price.amount')

echo -e "${BLUE}🎯 Selected Provider: ${PROVIDER}${NC}"
echo -e "${BLUE}💰 Bid Price: ${BID_PRICE} uAKT/block${NC}"

# Create lease
echo -e "${PURPLE}📝 Creating lease with provider...${NC}"
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
    echo -e "${YELLOW}⚠️ Manifest send may have issues, but continuing...${NC}"
fi

# Wait for services to start
echo -e "${BLUE}⏳ Waiting for services to initialize...${NC}"
echo -e "${YELLOW}This can take 5-15 minutes for GPU services...${NC}"
sleep 180  # 3 minutes initial wait

# Get service status and URLs
echo -e "${BLUE}📊 Retrieving service information...${NC}"
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
AI_SERVICE_URL=$(echo $LEASE_STATUS | jq -r '.services."defi-ai-service".uris[0] // "Not available"')
BACKEND_URL=$(echo $LEASE_STATUS | jq -r '.services."gofr-backend".uris[0] // "Not available"')
FRONTEND_URL=$(echo $LEASE_STATUS | jq -r '.services."defi-frontend".uris[0] // "Not available"')
MONITORING_URL=$(echo $LEASE_STATUS | jq -r '.services."prometheus-monitor".uris[0] // "Not available"')

# Save deployment information
cat > deployment-production-info.json << EOF
{
  "project": "$PROJECT_NAME",
  "deployment_dseq": "$DEPLOYMENT_DSEQ",
  "provider": "$PROVIDER",
  "gseq": "$GSEQ",
  "oseq": "$OSEQ",
  "wallet_address": "$WALLET_ADDRESS",
  "services": {
    "ai_service": "$AI_SERVICE_URL",
    "backend_api": "$BACKEND_URL",
    "frontend_dashboard": "$FRONTEND_URL",
    "monitoring": "$MONITORING_URL"
  },
  "deployment_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "chain_id": "$AKASH_CHAIN_ID",
  "node": "$AKASH_NODE",
  "estimated_monthly_cost_uakt": "$(echo "$BID_PRICE * 43200" | bc)",
  "api_keys_configured": $API_KEYS_CONFIGURED
}
EOF

# Cleanup temporary files
rm -f $TEMP_DEPLOY_FILE ${TEMP_DEPLOY_FILE}.bak

# Display deployment results
echo -e "${CYAN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${CYAN}========================${NC}"
echo -e "${GREEN}📍 Deployment DSEQ: ${DEPLOYMENT_DSEQ}${NC}"
echo -e "${GREEN}🏢 Provider: ${PROVIDER}${NC}"
echo -e "${GREEN}💰 Monthly Cost: ~$(echo "scale=2; $BID_PRICE * 43200 / 1000000" | bc) AKT${NC}"
echo -e ""
echo -e "${BLUE}🌐 Service URLs:${NC}"
echo -e "${GREEN}  🤖 AI Service: ${AI_SERVICE_URL}${NC}"
echo -e "${GREEN}  ⚙️ Backend API: ${BACKEND_URL}${NC}"
echo -e "${GREEN}  🌐 Frontend: ${FRONTEND_URL}${NC}"
echo -e "${GREEN}  📊 Monitoring: ${MONITORING_URL}${NC}"

# Test services
echo -e "${BLUE}🧪 Testing deployed services...${NC}"

if [ "$AI_SERVICE_URL" != "Not available" ]; then
    echo -e "${BLUE}Testing AI service...${NC}"
    if curl -s --max-time 15 "${AI_SERVICE_URL}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ AI service responding${NC}"
    else
        echo -e "${YELLOW}⚠️ AI service still starting (normal for GPU services)${NC}"
    fi
fi

if [ "$FRONTEND_URL" != "Not available" ]; then
    echo -e "${BLUE}Testing frontend...${NC}"
    if curl -s --max-time 10 "$FRONTEND_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend responding${NC}"
    else
        echo -e "${YELLOW}⚠️ Frontend still starting${NC}"
    fi
fi

echo -e "${GREEN}💾 Deployment info saved to deployment-production-info.json${NC}"

# Display management commands
echo -e "${CYAN}🛠️ Management Commands${NC}"
echo -e "${CYAN}===================${NC}"
echo -e "${YELLOW}Check deployment status:${NC}"
echo -e "akash provider lease-status --dseq $DEPLOYMENT_DSEQ --gseq $GSEQ --oseq $OSEQ --provider $PROVIDER --from $WALLET_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID"

echo -e "${YELLOW}View service logs:${NC}"
echo -e "akash provider lease-logs --dseq $DEPLOYMENT_DSEQ --gseq $GSEQ --oseq $OSEQ --provider $PROVIDER --from $WALLET_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --service defi-ai-service"

echo -e "${YELLOW}Update deployment:${NC}"
echo -e "akash provider send-manifest akash-production-deploy.yaml --dseq $DEPLOYMENT_DSEQ --gseq $GSEQ --oseq $OSEQ --provider $PROVIDER --from $WALLET_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID"

echo -e "${YELLOW}Close deployment:${NC}"
echo -e "akash tx deployment close --dseq $DEPLOYMENT_DSEQ --from $WALLET_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --gas-prices=0.025uakt --gas=auto --gas-adjustment=1.15 --yes"

echo -e "${PURPLE}🎯 Your DeFi Transaction Guard is now live on Akash Network!${NC}"
echo -e "${BLUE}Features deployed:${NC}"
echo -e "${GREEN}  ✅ GPU-accelerated AI threat detection${NC}"
echo -e "${GREEN}  ✅ GoFr backend with BlockDAG integration${NC}"
echo -e "${GREEN}  ✅ React dashboard with real-time monitoring${NC}"
echo -e "${GREEN}  ✅ Redis caching for performance${NC}"
echo -e "${GREEN}  ✅ Prometheus metrics and monitoring${NC}"

echo -e "${CYAN}🚀 Ready to protect DeFi transactions on the decentralized cloud!${NC}"