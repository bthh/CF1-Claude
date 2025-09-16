# CF1 Platform - Staging Environment Workflow Guide

## Overview

This document describes the staging environment setup for CF1 Platform, which provides a solution for visual testing and development validation using Browserbase integration without WSL networking limitations.

## Problem Statement

**Issue**: WSL networking restrictions prevent WebSocket connections to Browserbase
**Solution**: Git branch-based staging environment with automatic Netlify deployment

## Staging Environment Architecture

### Branch Strategy
```
main branch (production)     →  https://rwa2.netlify.app (Production)
staging branch (development) →  https://68c95aa850920f69596abcd1--rwa2.netlify.app (Staging)
```

### Deployment Pipeline
1. **Development**: Make changes in local environment
2. **Staging**: Push to `staging` branch for testing
3. **Production**: Merge staging changes to `main` branch

## Getting Started

### 1. Switch to Staging Branch
```bash
# Switch to staging branch
git checkout staging

# Ensure you're up to date with remote
git pull origin staging
```

### 2. Make Development Changes
```bash
# Make your changes to the codebase
# Edit files, add features, fix bugs, etc.

# Stage your changes
git add .

# Commit with descriptive message
git commit -m "Add new feature: [description]"
```

### 3. Deploy to Staging
```bash
# Push changes to staging branch
git push origin staging
```

**Note**: Netlify will automatically detect the push and deploy the staging branch to:
`https://68c95aa850920f69596abcd1--rwa2.netlify.app`

### 4. Test with Browserbase (if available)
```bash
# Test staging environment via Browserbase
node scripts/staging_test.cjs

# Or use the comprehensive staging test
node scripts/staging-browserbase-test.cjs
```

## Available Browserbase Scripts

### 1. `staging_test.cjs`
Full staging environment testing with multiple pages and dark mode validation.

**Features**:
- Complete page screenshots (1920x1080)
- Multi-page testing (dashboard, marketplace, portfolio, create-proposal, admin)
- Dark mode toggle testing
- Content validation
- HTML content extraction

**Usage**:
```bash
node scripts/staging_test.cjs
```

### 2. `staging-browserbase-test.cjs`
Comprehensive staging environment validation with feature detection.

**Features**:
- React app detection
- Navigation functionality testing
- Theme toggle validation
- Blockchain/wallet feature detection
- Staging-specific content analysis

**Usage**:
```bash
node scripts/staging-browserbase-test.cjs
```

## Manual Testing (WSL Fallback)

If Browserbase scripts fail due to WSL limitations, you can still test the staging environment:

### 1. Browser Testing
Visit the staging URL directly in your browser:
```
https://68c95aa850920f69596abcd1--rwa2.netlify.app
```

### 2. WebFetch Analysis
Use Claude's WebFetch tool to analyze the staging site:
```javascript
// Example WebFetch usage
WebFetch("https://68c95aa850920f69596abcd1--rwa2.netlify.app",
         "Analyze the CF1 platform staging deployment for functionality and design")
```

## Staging Environment Benefits

### ✅ Advantages
1. **No WSL Limitations**: WebSocket connections work from non-WSL environments
2. **Real Browser Testing**: Full browser rendering and JavaScript execution
3. **Visual Validation**: Screenshots and visual regression testing
4. **Multi-page Testing**: Comprehensive application flow testing
5. **Feature Isolation**: Test changes without affecting production
6. **Automated Deployment**: Instant deployment on git push

### ⚠️ Considerations
1. **WSL Limitation**: Browserbase scripts will still timeout in WSL
2. **Environment Differences**: Staging may have different data/configurations
3. **Temporary URLs**: Netlify deploy preview URLs change with each deployment
4. **Resource Usage**: Each push triggers a new build and deployment

## Development Workflow

### Standard Development Flow
```bash
# 1. Start with staging branch
git checkout staging
git pull origin staging

# 2. Make changes
# Edit files, implement features, fix bugs

# 3. Test locally (if needed)
npm run dev  # Frontend
npm run dev  # Backend (in backend/ directory)

# 4. Commit and deploy to staging
git add .
git commit -m "Feature: [description]"
git push origin staging

# 5. Test staging deployment
# - Visit staging URL in browser
# - Run browserbase scripts (if not in WSL)
# - Validate functionality

# 6. Merge to production (when ready)
git checkout main
git merge staging
git push origin main
```

### Emergency Hotfix Flow
```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/[issue-description]

# 2. Fix the issue
# Make minimal changes to fix critical issue

# 3. Test via staging
git checkout staging
git merge hotfix/[issue-description]
git push origin staging
# Test staging deployment

# 4. Deploy to production
git checkout main
git merge hotfix/[issue-description]
git push origin main

# 5. Cleanup
git branch -d hotfix/[issue-description]
```

## Troubleshooting

### Staging URL Not Working
1. Check Netlify deployment status
2. Verify staging branch was pushed successfully
3. Check for build errors in Netlify dashboard

### Browserbase Scripts Failing
1. Confirm you're running from non-WSL environment
2. Check `.env.browserbase` file for correct credentials
3. Verify BROWSERBASE_CONNECT_URL is valid
4. Test with shorter timeout values

### Build Failures
1. Check TypeScript compilation errors
2. Verify all dependencies are installed
3. Review build logs in Netlify dashboard
4. Ensure environment variables are set correctly

## Best Practices

### Commit Messages
- Use descriptive commit messages
- Include feature/bug/fix prefixes
- Reference issue numbers when applicable

### Testing Strategy
1. **Local Testing**: Basic functionality verification
2. **Staging Testing**: Visual and integration testing
3. **Production Deploy**: Only after staging validation

### Branch Management
- Keep staging branch up to date with main
- Regularly merge main into staging to avoid conflicts
- Use pull requests for significant features

## Scripts Reference

### Available Scripts
```bash
# Staging environment tests
node scripts/staging_test.cjs                    # Full staging test
node scripts/staging-browserbase-test.cjs        # Comprehensive staging validation

# Production comparison
node scripts/production_test.cjs                 # Production site test

# Local development (with ngrok)
node scripts/local-ngrok-browserbase.cjs        # Local site via ngrok
```

### Environment Configuration
Ensure `.env.browserbase` contains:
```
BROWSERBASE_CONNECT_URL=wss://connect.browserbase.com/v1/projects/[your-project-id]/sessions
```

## URL Reference

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Production** | https://rwa2.netlify.app | Live production site |
| **Staging** | https://68c95aa850920f69596abcd1--rwa2.netlify.app | Staging/testing environment |
| **Local Dev** | http://localhost:5173 | Local development server |

## Conclusion

The staging environment provides a robust solution for CF1 Platform development and testing, especially for visual validation via Browserbase. While WSL limitations prevent local Browserbase testing, the staging environment enables comprehensive browser-based testing in environments where WebSocket connections are available.

This workflow ensures:
- ✅ Safe development and testing
- ✅ Visual validation capabilities
- ✅ Production-like environment testing
- ✅ Automated deployment pipeline
- ✅ Rollback capabilities via git

For questions or issues with the staging workflow, refer to this documentation or check the troubleshooting section above.