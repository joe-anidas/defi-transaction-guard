#!/bin/bash

echo "🔍 DeFi Transaction Guard - System Diagnosis"
echo "============================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Port $port ($service) - RUNNING${NC}"
        return 0
    else
        echo -e "${RED}❌ Port $port ($service) - NOT RUNNING${NC}"
        return 1
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local name=$2
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name - RESPONDING${NC}"
        return 0
    else
        echo -e "${RED}❌ $name - NOT RESPONDING${NC}"
        return 1
    fi
}

echo -e "${BLUE}📊 System Status Check${NC}"
echo ""

# Check required tools
echo -e "${BLUE}🛠️  Required Tools:${NC}"
command -v node >/dev/null 2>&1 && echo -e "${GREEN}✅ Node.js$(node --version)${NC}" || echo -e "${RED}❌ Node.js - NOT INSTALLED${NC}"
command -v npm >/dev/null 2>&1 && echo -e "${GREEN}✅ npm $(npm --version)${NC}" || echo -e "${RED}❌ npm - NOT INSTALLED${NC}"
command -v go >/dev/null 2>&1 && echo -e "${GREEN}✅ Go $(go version | cut -d' ' -f3)${NC}" || echo -e "${RED}❌ Go - NOT INSTALLED${NC}"
echo ""

# Check ports
echo -e "${BLUE}🔌 Port Status:${NC}"
check_port 8545 "Hardhat Blockchain"
check_port 8080 "GoFr Backend"
check_port 5173 "React Frontend"
echo ""

# Check services
echo -e "${BLUE}🌐 Service Health:${NC}"
test_endpoint "http://127.0.0.1:8545" "Blockchain RPC"
test_endpoint "http://localhost:8080/health" "Backend API"
test_endpoint "http://localhost:5173" "Frontend"
echo ""

# Check blockchain specific
echo -e "${BLUE}🔗 Blockchain Details:${NC}"
if check_port 8545 "Blockchain" >/dev/null 2>&1; then
    # Test RPC call
    BLOCK_NUMBER=$(curl -s -X POST http://127.0.0.1:8545 \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | \
        jq -r '.result' 2>/dev/null)
    
    if [ "$BLOCK_NUMBER" != "null" ] && [ "$BLOCK_NUMBER" != "" ]; then
        echo -e "${GREEN}✅ Blockchain responding - Block: $BLOCK_NUMBER${NC}"
    else
        echo -e "${RED}❌ Blockchain not responding to RPC calls${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Blockchain not running - need to start Hardhat node${NC}"
fi

# Check contracts
echo -e "${BLUE}📄 Smart Contracts:${NC}"
if [ -f "frontend/src/contracts/addresses.json" ]; then
    GUARD_ADDRESS=$(cat frontend/src/contracts/addresses.json | jq -r '.transactionGuard' 2>/dev/null)
    if [ "$GUARD_ADDRESS" != "0x0000000000000000000000000000000000000000" ] && [ "$GUARD_ADDRESS" != "null" ]; then
        echo -e "${GREEN}✅ Contracts deployed - Guard: $GUARD_ADDRESS${NC}"
    else
        echo -e "${RED}❌ Contracts not deployed${NC}"
    fi
else
    echo -e "${RED}❌ Contract addresses file not found${NC}"
fi
echo ""

# Check backend specific
echo -e "${BLUE}⚡ Backend Details:${NC}"
if test_endpoint "http://localhost:8080/health" "Backend" >/dev/null 2>&1; then
    # Test AI status
    AI_STATUS=$(curl -s http://localhost:8080/api/ai/status | jq -r '.aiEnabled' 2>/dev/null)
    if [ "$AI_STATUS" = "true" ]; then
        echo -e "${GREEN}✅ AI services enabled${NC}"
    else
        echo -e "${YELLOW}⚠️  AI services may need configuration${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Backend not running - need to start GoFr server${NC}"
fi

# Check environment
echo -e "${BLUE}🔧 Environment:${NC}"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Backend .env file exists${NC}"
    if grep -q "GROK_API" backend/.env; then
        echo -e "${GREEN}✅ Grok API key configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Grok API key not found${NC}"
    fi
    if grep -q "GEMINI_API" backend/.env; then
        echo -e "${GREEN}✅ Gemini API key configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Gemini API key not found${NC}"
    fi
else
    echo -e "${RED}❌ Backend .env file missing${NC}"
fi
echo ""

# Provide recommendations
echo -e "${BLUE}💡 Recommendations:${NC}"

if ! check_port 8545 "Blockchain" >/dev/null 2>&1; then
    echo -e "${YELLOW}1. Start blockchain: cd blockchain && npm run node${NC}"
fi

if ! test_endpoint "http://localhost:8080/health" "Backend" >/dev/null 2>&1; then
    echo -e "${YELLOW}2. Start backend: cd backend && go run .${NC}"
fi

if ! test_endpoint "http://localhost:5173" "Frontend" >/dev/null 2>&1; then
    echo -e "${YELLOW}3. Start frontend: cd frontend && npm run dev${NC}"
fi

if [ ! -f "frontend/src/contracts/addresses.json" ] || [ "$(cat frontend/src/contracts/addresses.json | jq -r '.transactionGuard' 2>/dev/null)" = "0x0000000000000000000000000000000000000000" ]; then
    echo -e "${YELLOW}4. Deploy contracts: cd blockchain && npm run deploy${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Quick fix: Run ./start-demo.sh for automated setup${NC}"