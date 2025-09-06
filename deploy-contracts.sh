#!/bin/bash

# DeFi Transaction Guard - Contract Deployment Script
# Deploys smart contracts to the local blockchain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_header "🛡️ DeFi Transaction Guard - Contract Deployment"
echo ""

# Check if blockchain node is running
check_blockchain_node() {
    print_status "Checking if blockchain node is running..."
    
    # Wait up to 30 seconds for the blockchain node to start
    for i in {1..30}; do
        if curl -s -X POST -H "Content-Type: application/json" \
           --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
           http://localhost:8545 > /dev/null 2>&1; then
            print_success "Blockchain node is running on port 8545"
            return 0
        fi
        
        if [ $i -eq 1 ]; then
            print_status "Waiting for blockchain node to start..."
        fi
        
        sleep 1
    done
    
    print_error "Blockchain node is not running on port 8545 after 30 seconds"
    print_warning "Please start the blockchain node first:"
    print_warning "  cd blockchain && npm run node"
    print_warning "Or run: ./start.sh"
    return 1
}

# Deploy contracts
deploy_contracts() {
    print_header "📄 Deploying Smart Contracts..."
    
    cd "$PROJECT_DIR/blockchain"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing blockchain dependencies..."
        npm install
    fi
    
    # Compile contracts
    print_status "Compiling smart contracts..."
    npm run compile
    
    # Deploy contracts
    print_status "Deploying contracts to localhost..."
    npm run deploy
    
    print_success "Contracts deployed successfully!"
    
    cd "$PROJECT_DIR"
}

# Display deployment summary
show_deployment_summary() {
    print_header "📊 Deployment Summary"
    echo ""
    echo -e "${GREEN}✅ Smart contracts deployed to localhost:8545${NC}"
    echo ""
    echo -e "${BLUE}📄 Contract Addresses:${NC}"
    echo -e "  Check: ${YELLOW}frontend/src/contracts/addresses.json${NC}"
    echo ""
    echo -e "${BLUE}🔗 Network:${NC} localhost:8545 (Chain ID: 31337)"
    echo -e "${BLUE}💰 Test ETH:${NC} Available for testing"
    echo ""
    print_success "Ready to test DeFi Transaction Guard! 🚀"
}

# Main execution
main() {
    if check_blockchain_node; then
        deploy_contracts
        show_deployment_summary
    else
        print_error "Cannot deploy contracts without blockchain node running."
        exit 1
    fi
}

# Run main function
main "$@"
