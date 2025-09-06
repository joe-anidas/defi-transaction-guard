#!/bin/bash

# Build and Push DeFi Transaction Guard Images for Akash Network
# Aligned with your project structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-your-dockerhub-username}"
VERSION="${VERSION:-latest}"
PROJECT_NAME="defi-transaction-guard"

echo -e "${CYAN}🐳 Building DeFi Transaction Guard for Akash Network${NC}"
echo -e "${CYAN}=================================================${NC}"

# Validate prerequisites
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon not running. Please start Docker.${NC}"
    exit 1
fi

# Check Docker Hub login
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}⚠️ Not logged into Docker Hub. Please run: docker login${NC}"
    read -p "Press Enter after logging in..."
fi

echo -e "${BLUE}📦 Docker Username: ${DOCKER_USERNAME}${NC}"
echo -e "${BLUE}🏷️ Version: ${VERSION}${NC}"
echo -e "${BLUE}📁 Project: ${PROJECT_NAME}${NC}"

# Build AI Service (Python Flask with GPU support)
echo -e "${PURPLE}🤖 Building AI Detection Service...${NC}"
if [ ! -d "ai-service" ]; then
    echo -e "${RED}❌ ai-service directory not found${NC}"
    exit 1
fi

cd ai-service
docker build -t ${DOCKER_USERNAME}/defi-ai-service:${VERSION} .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AI Service built successfully${NC}"
else
    echo -e "${RED}❌ AI Service build failed${NC}"
    exit 1
fi

echo -e "${BLUE}📤 Pushing AI Service...${NC}"
docker push ${DOCKER_USERNAME}/defi-ai-service:${VERSION}
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AI Service pushed to Docker Hub${NC}"
else
    echo -e "${RED}❌ AI Service push failed${NC}"
    exit 1
fi
cd ..

# Build GoFr Backend
echo -e "${PURPLE}⚙️ Building GoFr Backend Service...${NC}"
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ backend directory not found${NC}"
    exit 1
fi

cd backend
docker build -t ${DOCKER_USERNAME}/gofr-backend:${VERSION} .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ GoFr Backend built successfully${NC}"
else
    echo -e "${RED}❌ GoFr Backend build failed${NC}"
    exit 1
fi

echo -e "${BLUE}📤 Pushing GoFr Backend...${NC}"
docker push ${DOCKER_USERNAME}/gofr-backend:${VERSION}
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ GoFr Backend pushed to Docker Hub${NC}"
else
    echo -e "${RED}❌ GoFr Backend push failed${NC}"
    exit 1
fi
cd ..

# Build React Frontend
echo -e "${PURPLE}🌐 Building React Frontend...${NC}"
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ frontend directory not found${NC}"
    exit 1
fi

cd frontend
docker build -t ${DOCKER_USERNAME}/defi-frontend:${VERSION} .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ React Frontend built successfully${NC}"
else
    echo -e "${RED}❌ React Frontend build failed${NC}"
    exit 1
fi

echo -e "${BLUE}📤 Pushing React Frontend...${NC}"
docker push ${DOCKER_USERNAME}/defi-frontend:${VERSION}
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ React Frontend pushed to Docker Hub${NC}"
else
    echo -e "${RED}❌ React Frontend push failed${NC}"
    exit 1
fi
cd ..

# Update Akash deployment manifest
echo -e "${BLUE}📝 Updating Akash deployment manifest...${NC}"
if [ -f "akash-production-deploy.yaml" ]; then
    # Create backup
    cp akash-production-deploy.yaml akash-production-deploy.yaml.backup
    
    # Update image names
    sed -i.tmp "s/your-dockerhub-username/${DOCKER_USERNAME}/g" akash-production-deploy.yaml
    rm -f akash-production-deploy.yaml.tmp
    
    echo -e "${GREEN}✅ Deployment manifest updated${NC}"
else
    echo -e "${YELLOW}⚠️ akash-production-deploy.yaml not found, skipping update${NC}"
fi

# Display build summary
echo -e "${CYAN}🎉 Build Complete!${NC}"
echo -e "${CYAN}=================${NC}"
echo -e "${GREEN}📦 Images built and pushed:${NC}"
echo -e "  🤖 ${DOCKER_USERNAME}/defi-ai-service:${VERSION}"
echo -e "  ⚙️ ${DOCKER_USERNAME}/gofr-backend:${VERSION}"
echo -e "  🌐 ${DOCKER_USERNAME}/defi-frontend:${VERSION}"

echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "1. Set your API keys:"
echo -e "   export GROK_API_KEY='gsk_your_key_here'"
echo -e "   export GEMINI_API_KEY='your_gemini_key_here'"
echo -e "   export BLOCKDAG_API_KEY='your_blockdag_key_here'"
echo -e ""
echo -e "2. Deploy to Akash Network:"
echo -e "   ./deploy-to-akash-production.sh"
echo -e ""
echo -e "3. Or test locally first:"
echo -e "   docker-compose -f docker-compose.test.yml up"

echo -e "${YELLOW}💡 Pro Tips:${NC}"
echo -e "• Test locally before deploying to Akash"
echo -e "• Monitor resource usage during deployment"
echo -e "• Check provider GPU availability"
echo -e "• Set appropriate bid prices for faster deployment"

echo -e "${GREEN}🚀 Ready for Akash Network deployment!${NC}"