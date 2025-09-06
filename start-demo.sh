#!/bin/bash

echo "🚀 DeFi Transaction Guard - Complete Demo Startup"
echo "================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start blockchain
start_blockchain() {
    echo -e "${BLUE}🔗 Starting Hardhat Blockchain...${NC}"
    cd blockchain
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing blockchain dependencies..."
        npm install
    fi
    
    # Compile contracts
    echo "🔨 Compiling smart contracts..."
    npm run compile
    
    # Start blockchain in background
    echo "⚡ Starting local blockchain on port 8545..."
    npm run node &
    BLOCKCHAIN_PID=$!
    
    # Wait for blockchain to start
    echo "⏳ Waiting for blockchain to initialize..."
    sleep 5
    
    # Check if blockchain is running
    if check_port 8545; then
        echo -e "${GREEN}✅ Blockchain running on http://127.0.0.1:8545${NC}"
        
        # Deploy contracts
        echo "📄 Deploying smart contracts..."
        npm run deploy
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Smart contracts deployed successfully${NC}"
            
            # Verify deployment
            echo "🔍 Verifying deployment..."
            npm run verify
        else
            echo -e "${RED}❌ Contract deployment failed${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Failed to start blockchain${NC}"
        return 1
    fi
    
    cd ..
    return 0
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}⚡ Starting GoFr Backend...${NC}"
    cd backend
    
    # Install Go dependencies
    echo "📦 Installing Go dependencies..."
    go mod tidy
    
    # Start backend in background
    echo "🚀 Starting API server on port 8080..."
    go run . &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 3
    
    # Check if backend is running
    if check_port 8080; then
        echo -e "${GREEN}✅ Backend running on http://localhost:8080${NC}"
        
        # Test AI integration
        echo "🤖 Testing AI integration..."
        curl -s http://localhost:8080/api/ai/status > /dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ AI services ready${NC}"
        else
            echo -e "${YELLOW}⚠️  AI services may need configuration${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to start backend${NC}"
        return 1
    fi
    
    cd ..
    return 0
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🎨 Starting React Frontend...${NC}"
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Start frontend
    echo "🌐 Starting frontend on port 5173..."
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    sleep 5
    
    # Check if frontend is running
    if check_port 5173; then
        echo -e "${GREEN}✅ Frontend running on http://localhost:5173${NC}"
    else
        echo -e "${RED}❌ Failed to start frontend${NC}"
        return 1
    fi
    
    cd ..
    return 0
}

# Function to cleanup processes
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up processes...${NC}"
    if [ ! -z "$BLOCKCHAIN_PID" ]; then
        kill $BLOCKCHAIN_PID 2>/dev/null
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Kill any remaining processes on our ports
    pkill -f "hardhat node" 2>/dev/null
    pkill -f "go run" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Trap cleanup on exit
trap cleanup EXIT INT TERM

# Main execution
echo -e "${YELLOW}🔍 Checking system requirements...${NC}"

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is required but not installed${NC}"; exit 1; }
command -v go >/dev/null 2>&1 || { echo -e "${RED}❌ Go is required but not installed${NC}"; exit 1; }

echo -e "${GREEN}✅ All required tools found${NC}"
echo ""

# Check if ports are available
if check_port 8545; then
    echo -e "${YELLOW}⚠️  Port 8545 is already in use. Stopping existing process...${NC}"
    pkill -f "hardhat node" 2>/dev/null
    sleep 2
fi

if check_port 8080; then
    echo -e "${YELLOW}⚠️  Port 8080 is already in use. Stopping existing process...${NC}"
    pkill -f "go run" 2>/dev/null
    sleep 2
fi

if check_port 5173; then
    echo -e "${YELLOW}⚠️  Port 5173 is already in use. Stopping existing process...${NC}"
    pkill -f "vite" 2>/dev/null
    sleep 2
fi

# Start all services
echo -e "${BLUE}🚀 Starting DeFi Transaction Guard Demo...${NC}"
echo ""

# Step 1: Start blockchain
if start_blockchain; then
    echo ""
    
    # Step 2: Start backend
    if start_backend; then
        echo ""
        
        # Step 3: Start frontend
        if start_frontend; then
            echo ""
            echo -e "${GREEN}🎉 All services started successfully!${NC}"
            echo ""
            echo -e "${YELLOW}📋 Demo URLs:${NC}"
            echo "🔗 Blockchain RPC: http://127.0.0.1:8545"
            echo "⚡ Backend API: http://localhost:8080"
            echo "🌐 Frontend Demo: http://localhost:5173"
            echo ""
            echo -e "${YELLOW}🛠️  Next Steps:${NC}"
            echo "1. Open http://localhost:5173 in your browser"
            echo "2. Connect MetaMask wallet"
            echo "3. Switch to localhost network (Chain ID: 31337)"
            echo "4. Try the exploit simulation demo"
            echo ""
            echo -e "${BLUE}💡 MetaMask Setup:${NC}"
            echo "Network Name: Localhost"
            echo "RPC URL: http://127.0.0.1:8545"
            echo "Chain ID: 31337"
            echo "Currency Symbol: ETH"
            echo ""
            echo -e "${GREEN}Press Ctrl+C to stop all services${NC}"
            echo ""
            
            # Keep script running
            while true; do
                sleep 1
            done
        else
            echo -e "${RED}❌ Failed to start frontend${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Failed to start backend${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to start blockchain${NC}"
    exit 1
fi