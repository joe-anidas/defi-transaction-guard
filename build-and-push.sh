#!/bin/bash

# Build and Push Docker Images for Akash Deployment
# Make sure to replace 'your-dockerhub-username' with your actual Docker Hub username

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

echo -e "${CYAN}🐳 Building and Pushing DeFi Guard Images for Akash${NC}"
echo -e "${CYAN}=================================================${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if logged into Docker Hub
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}⚠️ Not logged into Docker Hub. Please run: docker login${NC}"
    read -p "Press Enter after logging in..."
fi

echo -e "${BLUE}📦 Docker Username: ${DOCKER_USERNAME}${NC}"
echo -e "${BLUE}🏷️ Version Tag: ${VERSION}${NC}"

# Build AI Service
echo -e "${PURPLE}🤖 Building AI Service...${NC}"
cd ai-service
docker build -t ${DOCKER_USERNAME}/defi-guard-ai:${VERSION} .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AI Service built successfully${NC}"
else
    echo -e "${RED}❌ AI Service build failed${NC}"
    exit 1
fi

echo -e "${BLUE}📤 Pushing AI Service to Docker Hub...${NC}"
docker push ${DOCKER_USERNAME}/defi-guard-ai:${VERSION}
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AI Service pushed successfully${NC}"
else
    echo -e "${RED}❌ AI Service push failed${NC}"
    exit 1
fi
cd ..

# Build Backend Service
echo -e "${PURPLE}⚙️ Building Backend Service...${NC}"
cd backend
docker build -t ${DOCKER_USERNAME}/defi-guard-backend:${VERSION} .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend Service built successfully${NC}"
else
    echo -e "${RED}❌ Backend Service build failed${NC}"
    exit 1
fi

echo -e "${BLUE}📤 Pushing Backend Service to Docker Hub...${NC}"
docker push ${DOCKER_USERNAME}/defi-guard-backend:${VERSION}
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend Service pushed successfully${NC}"
else
    echo -e "${RED}❌ Backend Service push failed${NC}"
    exit 1
fi
cd ..

# Build Frontend Service
echo -e "${PURPLE}🌐 Building Frontend Service...${NC}"
cd frontend
docker build -t ${DOCKER_USERNAME}/defi-guard-frontend:${VERSION} .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend Service built successfully${NC}"
else
    echo -e "${RED}❌ Frontend Service build failed${NC}"
    exit 1
fi

echo -e "${BLUE}📤 Pushing Frontend Service to Docker Hub...${NC}"
docker push ${DOCKER_USERNAME}/defi-guard-frontend:${VERSION}
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend Service pushed successfully${NC}"
else
    echo -e "${RED}❌ Frontend Service push failed${NC}"
    exit 1
fi
cd ..

# Update deployment manifest
echo -e "${BLUE}📝 Updating Akash deployment manifest...${NC}"
sed -i.bak "s/your-dockerhub-username/${DOCKER_USERNAME}/g" akash-deploy.yaml
echo -e "${GREEN}✅ Deployment manifest updated${NC}"

# Display summary
echo -e "${CYAN}🎉 All images built and pushed successfully!${NC}"
echo -e "${CYAN}============================================${NC}"
echo -e "${GREEN}📦 Images pushed:${NC}"
echo -e "  🤖 ${DOCKER_USERNAME}/defi-guard-ai:${VERSION}"
echo -e "  ⚙️ ${DOCKER_USERNAME}/defi-guard-backend:${VERSION}"
echo -e "  🌐 ${DOCKER_USERNAME}/defi-guard-frontend:${VERSION}"

echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "1. Update API keys in akash-deploy.yaml"
echo -e "2. Run: ./deploy-to-akash.sh"
echo -e "3. Monitor deployment with Akash CLI"

echo -e "${YELLOW}💡 Tip: You can test locally first with:${NC}"
echo -e "   docker-compose up -f docker-compose.test.yml"