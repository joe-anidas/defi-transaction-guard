#!/bin/bash

echo "🔗 Starting Hardhat Blockchain for DeFi Transaction Guard"
echo "======================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd blockchain

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🔨 Compiling contracts...${NC}"
npm run compile

echo -e "${BLUE}⚡ Starting blockchain on port 8545...${NC}"
echo -e "${YELLOW}Keep this terminal open - blockchain runs here${NC}"
echo -e "${YELLOW}In another terminal, run: cd blockchain && npm run deploy${NC}"
echo ""

npm run node