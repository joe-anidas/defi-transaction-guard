#!/bin/bash

# DeFi Transaction Guard - Multi-Terminal Startup Script
# Opens 4 terminals and runs services in each

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

print_header "🛡️ DeFi Transaction Guard - Multi-Terminal Startup"
echo ""

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18+"
        exit 1
    fi
    
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go v1.21+"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.9+"
        exit 1
    fi
    
    print_success "All prerequisites are installed!"
}

# Setup dependencies
setup_dependencies() {
    print_status "Setting up dependencies..."
    
    # Setup blockchain dependencies
    if [ -d "blockchain" ] && [ ! -d "blockchain/node_modules" ]; then
        print_status "Installing blockchain dependencies..."
        cd blockchain && npm install && cd ..
    fi
    
    # Setup frontend dependencies
    if [ -d "frontend" ] && [ ! -d "frontend/node_modules" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend && npm install && cd ..
    fi
    
    # Setup backend dependencies
    if [ -d "backend" ]; then
        print_status "Installing backend dependencies..."
        cd backend && go mod tidy && cd ..
    fi
    
    # Setup AI service dependencies
    if [ -d "ai-service" ]; then
        print_status "Installing AI service dependencies..."
        cd ai-service && python3 -m pip install -r requirements.txt && cd ..
    fi
    
    print_success "Dependencies setup complete!"
}

# Clean up existing processes
cleanup_ports() {
    print_status "Cleaning up existing processes..."
    
    # Kill processes on our ports
    for port in 8080 5173 5002 8545; do
        if lsof -ti:$port &> /dev/null; then
            print_warning "Killing process on port $port"
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done
    
    sleep 1
}

# Function to create terminal with command
create_terminal() {
    local title="$1"
    local command="$2"
    local directory="$3"
    
    # Create a temporary script for the terminal
    local script_file="/tmp/defi_terminal_${title// /_}.sh"
    
    cat > "$script_file" << EOF
#!/bin/bash
cd "$directory"
echo -e "\033[1;34m🛡️ $title\033[0m"
echo -e "\033[0;36mDirectory: $directory\033[0m"
echo -e "\033[0;36mCommand: $command\033[0m"
echo ""
$command
EOF
    
    chmod +x "$script_file"
    
    # Open terminal based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell application \"Terminal\" to do script \"$script_file\""
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal --title="$title" -- bash -c "$script_file; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -title "$title" -e "$script_file" &
        else
            print_warning "No supported terminal found. Please run manually: $command"
        fi
    else
        print_warning "Unsupported OS. Please run manually: $command"
    fi
}

# Main execution
main() {
    check_prerequisites
    setup_dependencies
    cleanup_ports
    
    print_status "Opening 4 terminals for DeFi Transaction Guard services..."
    echo ""
    
    # Terminal 1: Blockchain Node (Hardhat)
    print_status "Terminal 1: Starting Blockchain Node..."
    create_terminal "Blockchain Node (Hardhat)" "npm run node" "$PROJECT_DIR/blockchain"
    
    sleep 2
    
    # Terminal 2: AI Service
    print_status "Terminal 2: Starting AI Service..."
    create_terminal "AI Service (Port 5002)" "python3 app.py" "$PROJECT_DIR/ai-service"
    
    sleep 2
    
    # Terminal 3: Backend (GoFr)
    print_status "Terminal 3: Starting Backend..."
    create_terminal "Backend API (Port 8080)" "go run main.go" "$PROJECT_DIR/backend"
    
    sleep 2
    
    # Terminal 4: Frontend (React)
    print_status "Terminal 4: Starting Frontend..."
    create_terminal "Frontend (Port 5173)" "npm run dev" "$PROJECT_DIR/frontend"
    
    echo ""
    print_success "All terminals opened successfully!"
    echo ""
    print_header "📊 Service Information"
    echo ""
    echo -e "${BLUE}🔗 Blockchain Node:${NC} http://localhost:8545"
    echo -e "${BLUE}🤖 AI Service:${NC} http://localhost:5002"
    echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:8080"
    echo -e "${BLUE}🎨 Frontend:${NC} http://localhost:5173"
    echo ""
    print_header "📋 Next Steps"
    echo ""
    echo "1. Wait for all services to start (check terminal outputs)"
    echo "2. Deploy contracts: ./deploy-contracts.sh"
    echo "3. Open frontend: http://localhost:5173"
    echo "4. Test AI analysis: http://localhost:5002/health"
    echo ""
    print_header "🛑 To Stop All Services"
    echo "Run: ./stop.sh"
    echo ""
    print_success "DeFi Transaction Guard is starting up! 🚀"
}

# Run main function
main "$@"
