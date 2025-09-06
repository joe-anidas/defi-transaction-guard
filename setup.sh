#!/bin/bash

echo "🛡️ Setting up DeFi Transaction Guard..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check prerequisites
print_header "🔍 Checking Prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v go &> /dev/null; then
    print_error "Go is not installed. Please install Go 1.21+ first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "Go version: $(go version)"

# Setup blockchain
print_header "🔗 Setting up Blockchain..."
cd blockchain
./setup.sh
if [ $? -ne 0 ]; then
    print_error "Blockchain setup failed"
    exit 1
fi
cd ..

# Setup frontend
print_header "🎨 Setting up Frontend..."
cd frontend
./setup.sh
if [ $? -ne 0 ]; then
    print_error "Frontend setup failed"
    exit 1
fi
cd ..

# Setup backend
print_header "⚡ Setting up Backend..."
cd backend
./setup.sh
if [ $? -ne 0 ]; then
    print_error "Backend setup failed"
    exit 1
fi
cd ..

print_success "🎉 Complete setup finished!"
echo ""
print_header "📋 Next Steps:"
echo "1. Start blockchain:     cd blockchain && npm run node"
echo "2. Deploy contracts:     cd blockchain && npm run deploy"
echo "3. Start backend:        cd backend && go run main.go"
echo "4. Start frontend:       cd frontend && npm run dev"
echo ""
print_header "🎮 Demo Instructions:"
echo "Run: ./demo.sh"
echo ""
print_header "🏆 Ready for HackOdisha 5.0!"
echo "🎯 BlockDAG + Akash + GoFr = Victory! 🏆"