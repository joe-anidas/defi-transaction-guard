#!/bin/bash

# DeFi Transaction Guard - Build and Push Docker Images for Akash
# Run this script to prepare all services for Akash deployment

set -e

# Configuration
DOCKER_USERNAME="joeanidas"
PROJECT_NAME="defi-transaction-guard"

echo "🚀 Building and pushing Docker images for Akash deployment..."

# Build AI Service
echo "📦 Building AI Service..."
cd ai-service
docker build -t $DOCKER_USERNAME/defi-ai-service:latest .
docker push $DOCKER_USERNAME/defi-ai-service:latest
echo "✅ AI Service pushed: $DOCKER_USERNAME/defi-ai-service:latest"
cd ..

# Build GoFr Backend
echo "📦 Building GoFr Backend..."
cd backend
docker build -t $DOCKER_USERNAME/gofr-backend:latest .
docker push $DOCKER_USERNAME/gofr-backend:latest
echo "✅ GoFr Backend pushed: $DOCKER_USERNAME/gofr-backend:latest"
cd ..

# Build React Frontend
echo "📦 Building React Frontend..."
cd frontend
docker build -t $DOCKER_USERNAME/defi-frontend:latest .
docker push $DOCKER_USERNAME/defi-frontend:latest
echo "✅ React Frontend pushed: $DOCKER_USERNAME/defi-frontend:latest"
cd ..

echo "🎉 All images built and pushed successfully!"
echo ""
echo "📋 Image Summary:"
echo "  - AI Service: $DOCKER_USERNAME/defi-ai-service:latest"
echo "  - GoFr Backend: $DOCKER_USERNAME/gofr-backend:latest"
echo "  - React Frontend: $DOCKER_USERNAME/defi-frontend:latest"
echo "  - Redis: redis:7-alpine (official image)"
echo "  - Prometheus: prom/prometheus:latest (official image)"
echo ""
echo "🚀 Ready for Akash deployment!"
