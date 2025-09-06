#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "🛡️  DeFi Transaction Guard - Live Demo"
echo "======================================="
echo -e "${NC}"

echo -e "${BLUE}🎯 HackOdisha 5.0 Submission${NC}"
echo -e "${GREEN}✅ BlockDAG Track: BDAG staking + EVM contracts${NC}"
echo -e "${GREEN}✅ Akash Network: AI risk scoring on GPUs${NC}" 
echo -e "${GREEN}✅ GoFr Framework: High-performance backend APIs${NC}"
echo ""

echo -e "${YELLOW}📋 Demo Flow:${NC}"
echo "1. 🔗 Connect wallet to localhost blockchain"
echo "2. 💰 Check BDAG balance (1000 tokens from deploy)"
echo "3. 🎯 Select malicious contract to attack"
echo "4. 🚨 Execute transaction and watch firewall block it"
echo "5. 💡 See before/after comparison showing funds protected"
echo ""

echo -e "${BLUE}🌐 Open these URLs:${NC}"
echo "Frontend:  http://localhost:5173"
echo "Backend:   http://localhost:8080/health"
echo "Blockchain: localhost:8545 (Chain ID: 31337)"
echo ""

echo -e "${PURPLE}🏆 Judge Talking Points:${NC}"
echo "• 'First real-time DeFi firewall - prevention beats cure'"
echo "• 'AI on Akash analyzes transactions in <200ms'"
echo "• 'BDAG validators stake tokens to secure the network'"
echo "• 'GoFr APIs handle 10K+ TPS with structured logging'"
echo "• 'One-line integration: just add protected() modifier'"
echo ""

echo -e "${GREEN}🚀 Ready to win HackOdisha 5.0!${NC}"
echo ""

# Check if services are running
echo -e "${BLUE}🔍 Checking services...${NC}"

# Check blockchain
if curl -s http://localhost:8545 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Blockchain running on localhost:8545${NC}"
else
    echo -e "${RED}❌ Blockchain not running. Start with: cd blockchain && npm run node${NC}"
fi

# Check backend
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ GoFr backend running on localhost:8080${NC}"
else
    echo -e "${RED}❌ Backend not running. Start with: cd backend && go run main.go${NC}"
fi

# Check frontend
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ React frontend running on localhost:5173${NC}"
else
    echo -e "${RED}❌ Frontend not running. Start with: cd frontend && npm run dev${NC}"
fi

echo ""
echo -e "${PURPLE}🎬 Demo Script:${NC}"
echo -e "${YELLOW}Judge: 'Show me how this prevents DeFi hacks'${NC}"
echo -e "${BLUE}You: 'DeFi lost \$5B to exploits this year. Watch this...'${NC}"
echo -e "${BLUE}     [Open demo, connect wallet, show 1000 BDAG balance]${NC}"
echo -e "${BLUE}     'I'll try to drain liquidity from this contract...'${NC}"
echo -e "${BLUE}     [Select malicious contract, click execute]${NC}"
echo -e "${BLUE}     'AI on Akash detects the pattern... 94% exploit confidence...'${NC}"
echo -e "${BLUE}     [Screen flashes red: TRANSACTION BLOCKED]${NC}"
echo -e "${BLUE}     'Without our guard: \$50K stolen. With our guard: \$0 lost.'${NC}"
echo -e "${BLUE}     [Show before/after comparison]${NC}"
echo -e "${BLUE}     'Built on BlockDAG, powered by GoFr, secured by Akash AI.'${NC}"
echo ""
echo -e "${GREEN}🏆 Expected prize: \$2,500+ across all tracks!${NC}"