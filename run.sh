#!/bin/bash

# DeFi Transaction Guard - One-Click Startup Script
# This script starts both backend and frontend automatically

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

# Check if required tools are installed
check_prerequisites() {
    print_header "🔍 Checking Prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go v1.21+ from https://golang.org/dl/"
        exit 1
    fi
    
    print_success "All prerequisites are installed!"
}

# Kill any existing processes on our ports
cleanup_ports() {
    print_status "Cleaning up existing processes..."
    
    # Kill processes on ports 8080, 5173, 3000
    for port in 8080 5173 3000; do
        if lsof -ti:$port &> /dev/null; then
            print_warning "Killing process on port $port"
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done
    
    sleep 1
}

# Setup backend
setup_backend() {
    print_header "🔧 Setting up Backend..."
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found!"
        exit 1
    fi
    
    cd backend
    
    # Install Go dependencies
    print_status "Installing Go dependencies..."
    go mod tidy
    
    # Check if .env exists, if not copy from example
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Created .env from .env.example. Add your API keys for full functionality."
        fi
    fi
    
    cd ..
    print_success "Backend setup complete!"
}

# Setup frontend
setup_frontend() {
    print_header "🎨 Setting up Frontend..."
    
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found!"
        exit 1
    fi
    
    cd frontend
    
    # Install npm dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
    else
        print_status "Dependencies already installed, skipping..."
    fi
    
    cd ..
    print_success "Frontend setup complete!"
}

# Start backend server
start_backend() {
    print_header "🚀 Starting Backend Server..."
    
    cd backend
    
    # Start backend in background
    print_status "Starting Go server on http://localhost:8080..."
    HTTP_PORT=8080 METRICS_PORT=9090 go run . > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    cd ..
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    for i in {1..10}; do
        if curl -s http://localhost:8080/health > /dev/null 2>&1; then
            print_success "Backend is running on http://localhost:8080"
            return 0
        fi
        sleep 1
    done
    
    print_error "Backend failed to start. Check backend.log for details."
    return 1
}

# Start frontend server
start_frontend() {
    print_header "🎨 Starting Frontend Server..."
    
    cd frontend
    
    # Start frontend in background
    print_status "Starting React dev server on http://localhost:5173..."
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    cd ..
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    for i in {1..15}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            print_success "Frontend is running on http://localhost:5173"
            return 0
        fi
        sleep 1
    done
    
    print_warning "Frontend may still be starting. Check http://localhost:5173 in a moment."
    return 0
}

# Display running services
show_status() {
    print_header "📊 Service Status"
    echo ""
    echo -e "${GREEN}🛡️ DeFi Transaction Guard is now running!${NC}"
    echo ""
    echo -e "${BLUE}📱 Frontend:${NC} http://localhost:5173"
    echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:8080"
    echo -e "${BLUE}📊 Health Check:${NC} http://localhost:8080/health"
    echo -e "${BLUE}🤖 AI Status:${NC} http://localhost:8080/api/ai/status"
    echo ""
    echo -e "${YELLOW}📝 Logs:${NC}"
    echo -e "  Backend: tail -f backend.log"
    echo -e "  Frontend: tail -f frontend.log"
    echo ""
    echo -e "${PURPLE}🛑 To stop:${NC} Press Ctrl+C or run: ./stop.sh"
    echo ""
}

# Cleanup function
cleanup() {
    print_header "🧹 Cleaning up..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes
    lsof -ti:8080,5173 | xargs kill -9 2>/dev/null || true
    
    print_success "Cleanup complete!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_header "🛡️ DeFi Transaction Guard - Startup Script"
    echo ""
    
    check_prerequisites
    cleanup_ports
    setup_backend
    setup_frontend
    
    if start_backend; then
        start_frontend
        show_status
        
        # Keep script running
        print_status "Services are running. Press Ctrl+C to stop."
        while true; do
            sleep 1
        done
    else
        print_error "Failed to start backend. Exiting."
        exit 1
    fi
}

# Run main function
main "$@"