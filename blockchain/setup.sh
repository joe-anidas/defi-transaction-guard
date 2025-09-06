#!/bin/bash

echo "🔗 Setting up Blockchain (Smart Contracts)..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Compile contracts
echo -e "${BLUE}🔨 Compiling smart contracts...${NC}"
npm run compile

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Smart contracts compiled${NC}"
else
    echo -e "${RED}❌ Failed to compile contracts${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Blockchain setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Start blockchain: npm run node"
echo "2. Deploy contracts: npm run deploy"
echo "3. Run tests: npm test"