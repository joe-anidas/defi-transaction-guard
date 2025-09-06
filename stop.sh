#!/bin/bash

# DeFi Transaction Guard - Stop All Services Script
# Stops all running services and cleans up processes

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

print_header "🛑 DeFi Transaction Guard - Stop All Services"
echo ""

# Stop services by port
stop_services() {
    print_status "Stopping all DeFi Transaction Guard services..."
    
    # Define ports to clean up
    ports=(8080 5173 5002 8545 9090)
    
    for port in "${ports[@]}"; do
        if lsof -ti:$port &> /dev/null; then
            print_warning "Stopping service on port $port"
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done
    
    # Kill any remaining processes by name
    print_status "Cleaning up remaining processes..."
    
    # Kill Go processes (backend)
    pkill -f "go run main.go" 2>/dev/null || true
    
    # Kill Python processes (AI service)
    pkill -f "python3 app.py" 2>/dev/null || true
    
    # Kill Node processes (frontend and blockchain)
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "npm run node" 2>/dev/null || true
    pkill -f "hardhat node" 2>/dev/null || true
    
    # Kill any remaining node processes in our directories
    pkill -f "vite" 2>/dev/null || true
    
    sleep 2
}

# Clean up log files
cleanup_logs() {
    print_status "Cleaning up log files..."
    
    # Remove log files if they exist
    rm -f backend.log frontend.log ai-service.log blockchain.log 2>/dev/null || true
    
    # Remove temporary terminal scripts
    rm -f /tmp/defi_terminal_*.sh 2>/dev/null || true
}

# Verify services are stopped
verify_cleanup() {
    print_status "Verifying services are stopped..."
    
    ports=(8080 5173 5002 8545 9090)
    all_stopped=true
    
    for port in "${ports[@]}"; do
        if lsof -ti:$port &> /dev/null; then
            print_warning "Port $port is still in use"
            all_stopped=false
        fi
    done
    
    if $all_stopped; then
        print_success "All services stopped successfully!"
    else
        print_warning "Some services may still be running. Check manually."
    fi
}

# Main execution
main() {
    stop_services
    cleanup_logs
    verify_cleanup
    
    echo ""
    print_success "DeFi Transaction Guard services stopped! 🛑"
    echo ""
    print_status "To start again, run: ./start.sh"
}

# Run main function
main "$@"
