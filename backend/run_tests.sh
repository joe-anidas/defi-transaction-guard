#!/bin/bash

echo "🧪 DeFi Transaction Guard - AI Integration Tests"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if server is running
echo -e "${BLUE}📡 Checking if server is running...${NC}"
if curl -s http://localhost:8080/health > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server not running. Please start with: go run .${NC}"
    exit 1
fi

# Test AI Status
echo -e "\n${BLUE}🤖 Testing AI Service Status...${NC}"
curl -s http://localhost:8080/api/ai/status | jq '.' || echo "jq not installed, showing raw response"

# Test AI Providers
echo -e "\n${BLUE}📊 Testing AI Providers...${NC}"
curl -s http://localhost:8080/api/ai/providers | jq '.' || echo "jq not installed, showing raw response"

# Test Normal Transaction
echo -e "\n${BLUE}🔍 Testing Normal Transaction Analysis...${NC}"
curl -s -X POST http://localhost:8080/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "from": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "value": "0.1",
    "gasLimit": "150000",
    "data": "0x38ed1739"
  }' | jq '.' || echo "Analysis completed"

# Test Suspicious Transaction
echo -e "\n${BLUE}🚨 Testing Suspicious Transaction Analysis...${NC}"
curl -s -X POST http://localhost:8080/api/risk-score \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "from": "0x1234567890abcdef1234567890abcdef12345678",
    "to": "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    "value": "1000",
    "gasLimit": "800000",
    "data": "0x945bcec9"
  }' | jq '.' || echo "Analysis completed"

# Test Statistics
echo -e "\n${BLUE}📈 Testing Firewall Statistics...${NC}"
curl -s http://localhost:8080/api/stats | jq '.' || echo "Stats retrieved"

# Test Alerts
echo -e "\n${BLUE}🚨 Testing Recent Alerts...${NC}"
curl -s http://localhost:8080/api/alerts | jq '.' || echo "Alerts retrieved"

# Simulate Exploit
echo -e "\n${BLUE}💥 Testing Exploit Simulation...${NC}"
curl -s -X POST http://localhost:8080/api/simulate-exploit | jq '.' || echo "Exploit simulated"

echo -e "\n${GREEN}🎉 All tests completed!${NC}"
echo -e "${YELLOW}💡 Check the server logs for detailed AI analysis results${NC}"