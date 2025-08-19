import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: env.VITE_SOURCEMAP === 'true',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Core dependencies - group by function, not arbitrary boundaries
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              // Router
              if (id.includes('react-router')) {
                return 'vendor-router';
              }
              // Query/Data
              if (id.includes('@tanstack/react-query')) {
                return 'vendor-query';
              }
              // Polyfills and crypto dependencies - must be loaded together
              if (id.includes('buffer') || id.includes('process') || id.includes('crypto-browserify') || 
                  id.includes('stream-browserify') || id.includes('base64-js') || id.includes('ieee754') ||
                  id.includes('bn.js') || id.includes('/bn/')) {
                return 'vendor-cosmos'; // Include ALL crypto polyfills WITH cosmos
              }
              // Blockchain - large dependencies that need polyfills
              if (id.includes('@cosmjs/') || id.includes('cosmwasm')) {
                return 'vendor-cosmos';
              }
              // Charts - large UI dependency
              if (id.includes('recharts')) {
                return 'vendor-charts';
              }
              // UI components
              if (id.includes('lucide-react') || id.includes('framer-motion')) {
                return 'vendor-ui';
              }
              // Monitoring
              if (id.includes('web-vitals') || id.includes('@sentry/react')) {
                return 'vendor-monitoring';
              }
              // Everything else goes to default vendor
              return 'vendor-misc';
            }

            // Application code - group by functional dependency relationships
            
            // All stores together - they have complex interdependencies
            if (id.includes('/src/store/')) {
              return 'app-stores';
            }
            
            // Admin functionality - includes components AND their store dependencies
            if (id.includes('/src/components/Admin/') || 
                id.includes('/src/pages/') && (id.includes('Admin') || id.includes('SuperAdmin'))) {
              return 'app-admin';
            }
            
            // Discovery functionality
            if (id.includes('/src/components/Discovery/') || 
                id.includes('/src/pages/Discovery')) {
              return 'app-discovery';
            }
            
            // Dashboard variants - keep heavy components separate for lazy loading
            if (id.includes('DashboardVariantA')) {
              return 'app-dashboard-a';
            }
            if (id.includes('DashboardVariantB')) {
              return 'app-dashboard-b';
            }
            if (id.includes('DashboardVariantC')) {
              return 'app-dashboard-c';
            }
            
            // Core dashboard components
            if (id.includes('/src/components/Dashboard/')) {
              return 'app-dashboard-core';
            }
            
            // Utils and services
            if (id.includes('/src/utils/') || id.includes('/src/services/') || id.includes('/src/lib/')) {
              return 'app-utils';
            }
            
            // Everything else stays in main bundle for now
            return null;
          }
        }
      },
      chunkSizeWarningLimit: 800, // Reduced to encourage smaller chunks
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    
    // Development server configuration
    server: {
      port: 5173,
      host: true,
      cors: true,
      hmr: {
        port: 5174
      },
      watch: {
        usePolling: true,
        interval: 100
      },
      strictPort: false,
      // Fix for React Router - serve index.html for all routes
      historyApiFallback: true
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      host: true
    },
    
    // Environment variables and polyfills
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      global: 'globalThis',
      'process.env': '{}',
      'process.platform': '"browser"',
      'process.version': '"v18.0.0"',
      'require.resolve': 'undefined',
      'require.cache': 'undefined'
    },
    
    // Node.js polyfills for browser compatibility
    resolve: {
      alias: {
        buffer: 'buffer',
        process: 'process/browser',
        util: 'util',
        crypto: 'crypto-browserify',
        stream: 'stream-browserify'
      }
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-router-dom', 
        'buffer', 
        'process',
        'crypto-browserify',
        'stream-browserify'
      ]
    }
  }
})
