#!/bin/bash

# CF1 AI Analyzer Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 CF1 AI Analyzer Deployment Script${NC}"
echo "========================================"

# Configuration
SERVICE_NAME="cf1-ai-analyzer"
IMAGE_NAME="cf1-ai-analyzer"
CONTAINER_NAME="cf1-ai-analyzer"
PORT="8000"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${RED}❌ Please edit .env file with your ANTHROPIC_API_KEY before continuing.${NC}"
        exit 1
    else
        echo -e "${RED}❌ .env.example file not found.${NC}"
        exit 1
    fi
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "your_anthropic_api_key_here" ]; then
    echo -e "${RED}❌ ANTHROPIC_API_KEY not configured in .env file.${NC}"
    echo "Please set a valid Anthropic API key in the .env file."
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration validated${NC}"

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon not running. Please start Docker.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is available${NC}"

# Stop and remove existing container if it exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo -e "${YELLOW}🔄 Stopping existing container...${NC}"
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# Remove existing image if it exists (for fresh builds)
if [ "$1" = "--rebuild" ] || [ "$1" = "-r" ]; then
    echo -e "${YELLOW}🔄 Removing existing image for rebuild...${NC}"
    docker rmi $IMAGE_NAME:latest || true
fi

# Build the Docker image
echo -e "${BLUE}🏗️  Building Docker image...${NC}"
docker build -t $IMAGE_NAME:latest .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker image built successfully${NC}"

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p temp logs

# Run the container
echo -e "${BLUE}🚀 Starting CF1 AI Analyzer container...${NC}"

docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:8000 \
    -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    -e CF1_BACKEND_URL="${CF1_BACKEND_URL:-http://host.docker.internal:3001}" \
    -e WEBHOOK_SECRET="${WEBHOOK_SECRET:-cf1-ai-webhook-secret-key}" \
    -v "$(pwd)/temp:/app/temp" \
    -v "$(pwd)/logs:/app/logs" \
    --restart unless-stopped \
    $IMAGE_NAME:latest

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start container${NC}"
    exit 1
fi

# Wait for service to start
echo -e "${BLUE}⏳ Waiting for service to start...${NC}"
sleep 10

# Health check
echo -e "${BLUE}🔍 Performing health check...${NC}"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:$PORT/health)
HTTP_CODE="${HEALTH_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Container logs:"
    docker logs $CONTAINER_NAME --tail 20
    exit 1
fi

# Display service information
echo ""
echo -e "${GREEN}🎉 CF1 AI Analyzer deployed successfully!${NC}"
echo "============================================="
echo -e "${BLUE}📋 Service Information:${NC}"
echo "  Service URL: http://localhost:$PORT"
echo "  Health Check: http://localhost:$PORT/health"
echo "  API Documentation: http://localhost:$PORT/docs"
echo "  Container Name: $CONTAINER_NAME"
echo "  Image: $IMAGE_NAME:latest"
echo ""
echo -e "${BLUE}🔧 Management Commands:${NC}"
echo "  View logs: docker logs $CONTAINER_NAME -f"
echo "  Stop service: docker stop $CONTAINER_NAME"
echo "  Restart service: docker restart $CONTAINER_NAME"
echo "  Remove service: docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
echo ""
echo -e "${BLUE}🧪 Test Commands:${NC}"
echo "  Health check: curl http://localhost:$PORT/health"
echo "  Service stats: curl http://localhost:$PORT/api/v1/stats"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Verify the service is accessible from your CF1 backend"
echo "2. Test document analysis with a sample PDF"
echo "3. Check webhook delivery to CF1 backend"
echo "4. Monitor logs for any errors or issues"
echo ""
echo -e "${GREEN}✅ CF1 AI Analyzer is ready for production use!${NC}"

# Optional: Display recent logs
echo -e "${BLUE}📄 Recent logs:${NC}"
docker logs $CONTAINER_NAME --tail 10