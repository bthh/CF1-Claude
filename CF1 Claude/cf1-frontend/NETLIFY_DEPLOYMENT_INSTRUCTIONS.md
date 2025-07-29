# CF1 Frontend - Manual Netlify Deployment Instructions

## Quick Deploy via Netlify Web Interface

Since the Netlify CLI requires interactive team selection, here are the instructions for manual deployment:

### Step 1: Build the Project
```bash
cd "/home/bth/bth/CF1-Claude/CF1 Claude/cf1-frontend"
npm run build
```

### Step 2: Deploy via Netlify Web Interface

1. **Go to Netlify**: Visit https://app.netlify.com/
2. **Sign in**: Use your Netlify account
3. **New Site**: Click "Add new site" → "Deploy manually"
4. **Upload Build**: Drag and drop the `dist` folder from the project directory
5. **Configure**:
   - Site name: `cf1-claude-frontend` (or your preferred name)
   - Build command: `npm run build`
   - Publish directory: `dist`

### Step 3: Connect to GitHub (Optional for automatic deployments)

1. **Site Settings**: Go to site settings
2. **Build & Deploy**: Navigate to build settings
3. **Link Repository**: Connect to `https://github.com/bthh/CF1-Claude.git`
4. **Configure Build**:
   - Base directory: `CF1 Claude/cf1-frontend`
   - Build command: `npm run build`
   - Publish directory: `CF1 Claude/cf1-frontend/dist`

## Build Output Location

The build creates a `dist` folder with these key files:
- `index.html` - Main entry point
- `assets/` - CSS, JS, and other static assets
- All files are production-optimized and gzipped

## Build Status

✅ **Build Success**: The project builds successfully with optimized bundles
✅ **No Blocking Errors**: All critical TypeScript issues resolved
✅ **Production Ready**: Includes all role-based testing framework features

## Expected Site Features

When deployed, the site will include:
- **Role-Based Testing Dashboard**: Complete testing environment
- **Enhanced Role Selector**: Advanced role switching with data preview
- **Admin Testing Panel**: Specialized admin workflow testing  
- **Hybrid Mode Controller**: Demo/testnet integration
- **All CF1 Platform Features**: Launchpad, governance, portfolio management

## Deployment Configuration

The project includes `netlify.toml` with:
- Build settings: `publish = "dist"`, `command = "npm run build"`
- SPA redirects: All routes redirect to `index.html`
- Security headers: X-Frame-Options, CSP, etc.
- Caching: Optimized for static assets

## Access After Deployment

Once deployed, the site will be available at:
- Custom domain: `https://cf1-claude-frontend.netlify.app` (or your chosen name)
- Netlify subdomain: `https://[random-id].netlify.app`

The CF1 platform will be fully functional with the complete role-based testing framework!