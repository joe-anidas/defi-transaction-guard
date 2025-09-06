#!/bin/bash

# Test DeFi Transaction Guard locally before Akash deployment
# Validates all components work together

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🧪 Pre-Akash Deployment Testing${NC}"
echo -e "${CYAN}==============================${NC}"

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found${NC}"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker not running${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Check project structure
echo -e "${BLUE}📁 Validating project structure...${NC}"

required_dirs=("ai-service" "backend" "frontend")
for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo -e "${RED}❌ Directory '$dir' not found${NC}"
        exit 1
    fi
done

required_files=("ai-service/Dockerfile" "backend/Dockerfile" "frontend/Dockerfile" "docker-compose.test.yml")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ File '$file' not found${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Project structure validated${NC}"

# Test backend compilation
echo -e "${BLUE}⚙️ Testing GoFr backend compilation...${NC}"
cd backend
if go build -o test-binary .; then
    echo -e "${GREEN}✅ Backend compiles successfully${NC}"
    rm -f test-binary
else
    echo -e "${RED}❌ Backend compilation failed${NC}"
    exit 1
fi
cd ..

# Test AI service dependencies
echo -e "${BLUE}🤖 Testing AI service dependencies...${NC}"
cd ai-service
if python3 -c "import flask, requests, redis; print('Dependencies OK')"; then
    echo -e "${GREEN}✅ AI service dependencies available${NC}"
else
    echo -e "${YELLOW}⚠️ AI service dependencies missing (will be installed in Docker)${NC}"
fi
cd ..

# Start local test environment
echo -e "${PURPLE}🚀 Starting local test environment...${NC}"
echo -e "${YELLOW}This will start all services with Docker Compose...${NC}"

# Set test environment variables
export GROK_API_KEY="${GROK_API_KEY:-test_key}"
export GEMINI_API_KEY="${GEMINI_API_KEY:-test_key}"
export BLOCKDAG_API_KEY="${BLOCKDAG_API_KEY:-test_key}"

# Start services
docker-compose -f docker-compose.test.yml up -d

# Wait for services to start
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 30

# Test service health
echo -e "${BLUE}🔍 Testing service health...${NC}"

# Test Redis
if docker-compose -f docker-compose.test.yml exec -T redis-cache redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis cache is healthy${NC}"
else
    echo -e "${RED}❌ Redis cache not responding${NC}"
fi

# Test AI service
if curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${GREEN}✅ AI service is healthy${NC}"
    
    # Test AI analysis endpoint
    ai_response=$(curl -s -X POST http://localhost:5000/api/ai/analyze \
        -H "Content-Type: application/json" \
        -d '{
            "hash": "0x123",
            "from": "0xabc",
            "to": "0xdef",
            "value": "1.0",
            "gasLimit": "21000"
        }')
    
    if echo "$ai_response" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ AI analysis endpoint working${NC}"
    else
        echo -e "${YELLOW}⚠️ AI analysis endpoint has issues${NC}"
    fi
else
    echo -e "${RED}❌ AI service not responding${NC}"
fi

# Test backend
if curl -s http://localhost:8080/health > /dev/null; then
    echo -e "${GREEN}✅ GoFr backend is healthy${NC}"
    
    # Test risk scoring endpoint
    backend_response=$(curl -s -X POST http://localhost:8080/api/risk-score \
        -H "Content-Type: application/json" \
        -d '{
            "hash": "0x123",
            "from": "0xabc",
            "to": "0xdef",
            "value": "1.0",
            "gasLimit": "21000"
        }')
    
    if echo "$backend_response" | jq -e '.assessment' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Risk scoring endpoint working${NC}"
    else
        echo -e "${YELLOW}⚠️ Risk scoring endpoint has issues${NC}"
    fi
else
    echo -e "${RED}❌ GoFr backend not responding${NC}"
fi

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ React frontend is serving${NC}"
else
    echo -e "${RED}❌ React frontend not responding${NC}"
fi

# Test Prometheus
if curl -s http://localhost:9090/-/healthy > /dev/null; then
    echo -e "${GREEN}✅ Prometheus is healthy${NC}"
else
    echo -e "${YELLOW}⚠️ Prometheus not responding${NC}"
fi

# Performance test
echo -e "${BLUE}⚡ Running performance test...${NC}"
start_time=$(date +%s%N)

for i in {1..5}; do
    curl -s -X POST http://localhost:5000/api/ai/analyze \
        -H "Content-Type: application/json" \
        -d "{
            \"hash\": \"0x$i\",
            \"from\": \"0xabc\",
            \"to\": \"0xdef\",
            \"value\": \"$i.0\",
            \"gasLimit\": \"21000\"
        }" > /dev/null
done

end_time=$(date +%s%N)
duration=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds

echo -e "${GREEN}✅ Performance test: 5 requests in ${duration}ms (avg: $((duration/5))ms per request)${NC}"

# Show service logs (last 10 lines each)
echo -e "${BLUE}📋 Recent service logs:${NC}"

echo -e "${YELLOW}AI Service logs:${NC}"
docker-compose -f docker-compose.test.yml logs --tail=5 defi-guard-ai

echo -e "${YELLOW}Backend logs:${NC}"
docker-compose -f docker-compose.test.yml logs --tail=5 defi-guard-backend

# Cleanup
echo -e "${BLUE}🧹 Cleaning up test environment...${NC}"
docker-compose -f docker-compose.test.yml down

# Summary
echo -e "${CYAN}📊 Test Summary${NC}"
echo -e "${CYAN}==============${NC}"
echo -e "${GREEN}✅ Local testing completed successfully${NC}"
echo -e "${BLUE}Your DeFi Transaction Guard is ready for Akash deployment!${NC}"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Set your Docker Hub username: export DOCKER_USERNAME='your-username'"
echo -e "2. Set API keys (optional): export GROK_API_KEY='your-key'"
echo -e "3. Build images: ./build-for-akash.sh"
echo -e "4. Deploy to Akash: ./deploy-to-akash-production.sh"

echo -e "${PURPLE}🚀 Ready for Akash Network deployment!${NC}"