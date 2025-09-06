#!/bin/bash

echo "🎨 Setting up Frontend (React Dashboard)..."

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

echo -e "${GREEN}🎉 Frontend setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:5173"
echo "3. Connect MetaMask to localhost:8545"