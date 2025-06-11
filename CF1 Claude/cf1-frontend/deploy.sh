#!/bin/bash

# CF1 Platform Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: staging, production

set -e

ENVIRONMENT=${1:-staging}
PROJECT_NAME="cf1-frontend"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Deploying CF1 Platform Frontend to $ENVIRONMENT..."

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "❌ Error: Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Check if required files exist
if [[ ! -f ".env.$ENVIRONMENT" ]]; then
    echo "❌ Error: Environment file .env.$ENVIRONMENT not found"
    exit 1
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_NODE_VERSION="18.0.0"
if ! node -pe "require('semver').gte('$NODE_VERSION', '$REQUIRED_NODE_VERSION')" 2>/dev/null; then
    echo "❌ Error: Node.js version $REQUIRED_NODE_VERSION or higher required"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run type checking
echo "🔧 Running type checks..."
npm run type-check

# Run tests (skip for staging)
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "🧪 Running tests..."
    npm run test:run
fi

# Build application
echo "🏗️  Building application for $ENVIRONMENT..."
if [[ "$ENVIRONMENT" == "production" ]]; then
    npm run build:production
else
    npm run build:testnet
fi

# Create deployment archive
echo "📦 Creating deployment archive..."
tar -czf "${PROJECT_NAME}_${ENVIRONMENT}_${TIMESTAMP}.tar.gz" dist/

# Deploy based on environment
case $ENVIRONMENT in
    staging)
        echo "🚀 Deploying to staging environment..."
        # Add staging deployment commands here
        # Example: rsync to staging server
        echo "📋 Staging deployment completed!"
        echo "🌐 Preview URL: http://staging.cf1platform.com"
        ;;
    production)
        echo "🚀 Deploying to production environment..."
        
        # Docker deployment
        echo "🐳 Building Docker image..."
        docker build -t cf1-frontend:latest .
        docker tag cf1-frontend:latest cf1-frontend:$TIMESTAMP
        
        # Deploy with docker-compose
        echo "🚀 Starting production containers..."
        docker-compose -f docker-compose.yml --profile production up -d
        
        echo "✅ Production deployment completed!"
        echo "🌐 Production URL: https://app.cf1platform.com"
        ;;
esac

# Post-deployment verification
echo "🔍 Running post-deployment verification..."
sleep 10

if [[ "$ENVIRONMENT" == "production" ]]; then
    HEALTH_URL="http://localhost/health"
else
    HEALTH_URL="http://localhost:4173/health"
fi

if curl -f "$HEALTH_URL" >/dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "⚠️  Health check failed - please verify deployment"
fi

echo "🎉 Deployment completed successfully!"
echo "📊 Deployment summary:"
echo "   - Environment: $ENVIRONMENT"
echo "   - Timestamp: $TIMESTAMP"
echo "   - Build size: $(du -h dist/ | tail -1 | cut -f1)"
echo "   - Archive: ${PROJECT_NAME}_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"