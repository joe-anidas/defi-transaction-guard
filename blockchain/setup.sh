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

# Run tests to ensure everything works
echo -e "${BLUE}🧪 Running tests...${NC}"
npm test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Blockchain setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Start blockchain: npm run node (in separate terminal)"
echo "2. Deploy contracts: npm run deploy"
echo "3. Start backend: cd ../backend && go run main.go"
echo "4. Start frontend: cd ../frontend && npm run dev"