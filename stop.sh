#!/bin/bash

# DeFi Transaction Guard - Stop Script
# This script stops all running services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo -e "${BLUE}🛑 Stopping DeFi Transaction Guard...${NC}"
echo ""

# Kill processes by port
for port in 8080 5173 3000 9090; do
    if lsof -ti:$port &> /dev/null; then
        print_status "Stopping process on port $port"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

# Kill processes by name
pkill -f "go run" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Clean up log files
if [ -f "backend.log" ]; then
    rm backend.log
    print_status "Removed backend.log"
fi

if [ -f "frontend.log" ]; then
    rm frontend.log
    print_status "Removed frontend.log"
fi

sleep 1

print_success "All services stopped!"
echo ""
echo -e "${GREEN}✅ DeFi Transaction Guard has been stopped.${NC}"
echo -e "${BLUE}🚀 To start again, run: ./run.sh${NC}"