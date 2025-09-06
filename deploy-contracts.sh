#!/bin/bash

echo "📄 Deploying Smart Contracts"
echo "============================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

cd blockchain

echo -e "${BLUE}🚀 Deploying contracts to localhost...${NC}"
npm run deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contracts deployed successfully${NC}"
    
    echo -e "${BLUE}🔍 Verifying deployment...${NC}"
    npm run verify
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Deployment verified${NC}"
        echo ""
        echo -e "${BLUE}📋 Next steps:${NC}"
        echo "1. Refresh your frontend (http://localhost:5173)"
        echo "2. Connect MetaMask to localhost network"
        echo "3. Try the demo!"
    else
        echo -e "${RED}❌ Verification failed${NC}"
    fi
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Make sure blockchain is running: ./start-blockchain.sh"
fi