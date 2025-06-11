# CF1 Platform Frontend - Deployment Guide

This guide covers the deployment process for the CF1 Platform frontend application.

## Overview

The CF1 Platform frontend is a React application built with Vite, designed for enterprise-grade RWA tokenization with proper production deployment capabilities.

## Prerequisites

- Node.js 18+ 
- npm 8+
- Docker (for containerized deployments)
- Access to deployment environments

## Environment Configuration

### Environment Files

1. **Development**: `.env.development` or `.env.local`
2. **Staging**: `.env.staging` 
3. **Production**: `.env.production`

### Required Environment Variables

```bash
# Application
VITE_APP_MODE=production
VITE_APP_VERSION=1.0.0

# Blockchain Network
VITE_NETWORK_ENV=mainnet
VITE_CHAIN_ID=neutron-1
VITE_RPC_URL=https://rpc.neutron.org
VITE_REST_URL=https://rest.neutron.org

# Contract Addresses
VITE_LAUNCHPAD_CONTRACT_ADDRESS=neutron1...
VITE_GOVERNANCE_CONTRACT_ADDRESS=neutron1...
VITE_MARKETPLACE_CONTRACT_ADDRESS=neutron1...

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
```

## Build Process

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build:production
```

### Build Verification
```bash
npm run preview:production
```

## Deployment Methods

### 1. Manual Deployment

#### Staging
```bash
./deploy.sh staging
```

#### Production
```bash
./deploy.sh production
```

### 2. Docker Deployment

#### Build Docker Image
```bash
docker build -t cf1-frontend:latest .
```

#### Run with Docker Compose
```bash
docker-compose up -d
```

#### Production with Traefik
```bash
docker-compose --profile production up -d
```

### 3. CI/CD Deployment

The application includes GitHub Actions workflows for automated deployment:

- **Staging**: Deploys on push to `develop` branch
- **Production**: Deploys on push to `main` branch

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Smart contract addresses updated
- [ ] SSL certificates ready (production)
- [ ] Domain DNS configured
- [ ] Backup strategy in place

### Deployment
- [ ] Run tests (`npm run test:run`)
- [ ] Lint code (`npm run lint`)
- [ ] Type check (`npm run type-check`)
- [ ] Build application
- [ ] Deploy to target environment
- [ ] Verify health checks

### Post-Deployment
- [ ] Application accessible via URL
- [ ] Health endpoint responding
- [ ] Wallet connection working
- [ ] Smart contract integration functional
- [ ] Analytics/monitoring active
- [ ] SSL/security headers configured

## Monitoring & Health Checks

### Health Check Endpoint
```
GET /health
```

### Application Metrics
- Build size: < 2MB
- Load time: < 3 seconds
- Core Web Vitals optimized

### Monitoring URLs
- **Staging**: https://staging.cf1platform.com
- **Production**: https://app.cf1platform.com

## Security Considerations

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' wss: https:;
```

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## Troubleshooting

### Common Issues

1. **White Screen on Load**
   - Check browser console for errors
   - Verify environment variables
   - Check network connectivity

2. **Wallet Connection Fails**
   - Verify RPC/REST endpoints
   - Check chain ID configuration
   - Ensure Keplr wallet installed

3. **Build Failures**
   - Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
   - Check TypeScript errors: `npm run type-check`
   - Verify environment variables

### Debug Mode
Enable debug mode in development:
```bash
VITE_ENABLE_DEBUG_MODE=true
```

## Rollback Procedure

### Quick Rollback
```bash
# Stop current deployment
docker-compose down

# Deploy previous version
docker run -d -p 80:80 cf1-frontend:previous-tag
```

### Database/State Rollback
- Smart contract state is immutable
- Local storage may need clearing
- Cache invalidation may be required

## Performance Optimization

### Build Optimizations
- Code splitting by route and vendor libraries
- Tree shaking for unused code elimination
- Asset minification and compression
- Source map generation (disabled in production)

### Runtime Optimizations
- Nginx gzip compression
- Static asset caching (1 year)
- CDN integration ready
- Service worker for offline support (optional)

## Support

For deployment issues or questions:
- Create issue in repository
- Contact DevOps team
- Check deployment logs
- Review monitoring dashboards

---

**Last Updated**: January 2025
**Version**: 1.0.0