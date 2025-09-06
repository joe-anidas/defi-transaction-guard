#!/bin/bash

echo "⚡ Setting up Backend (GoFr API Server)..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check Go installation
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed. Please install Go 1.21+ first.${NC}"
    exit 1
fi

echo -e "${BLUE}🐹 Go version: $(go version)${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
go mod tidy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Backend setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Start server: go run main.go"
echo "2. Test health: curl http://localhost:8080/health"
echo "3. View API docs: http://localhost:8080/health"