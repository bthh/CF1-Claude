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
          manualChunks: {
            // Core dependencies
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            query: ['@tanstack/react-query'],
            
            // Blockchain dependencies
            cosmos: ['@cosmjs/cosmwasm-stargate', '@cosmjs/stargate'],
            
            // UI dependencies
            ui: ['lucide-react', 'framer-motion'],
            charts: ['recharts'],
            
            // Performance monitoring
            monitoring: ['web-vitals', '@sentry/react'],
            
            // Dashboard variants (code splitting)
            'dashboard-a': ['./src/components/Dashboard/DashboardVariantA.tsx'],
            'dashboard-b': ['./src/components/Dashboard/DashboardVariantB.tsx'],
            'dashboard-c': ['./src/components/Dashboard/DashboardVariantC.tsx'],
            
            // Discovery components
            'discovery-hub': ['./src/components/Discovery/DiscoveryHub.tsx'],
            'video-library': ['./src/components/Discovery/VideoLibrary.tsx'],
            'market-insights': ['./src/components/Discovery/MarketInsights.tsx'],
            
            // Admin components
            'admin-panel': [
              './src/components/Admin/AdminHeader.tsx',
              './src/components/Admin/AdminSidebar.tsx',
              './src/components/Admin/GovernanceAdmin.tsx',
              './src/components/Admin/LaunchpadAdmin.tsx'
            ],
            
            // Store (state management) - include ALL stores to prevent circular deps
            stores: [
              './src/store/authStore.ts',
              './src/store/portfolioStore.ts', 
              './src/store/proposalStore.ts',
              './src/store/uiStore.ts',
              './src/store/walletStore.ts',
              './src/store/rewardsStore.ts',
              './src/store/dashboardV2Store.ts',
              './src/store/discoveryStore.ts',
              './src/store/enhancedDashboardStore.ts',
              './src/store/dataModeStore.ts',
              './src/store/demoModeStore.ts',
              './src/store/featureToggleStore.ts'
            ],
            
            // Polyfills
            polyfills: ['buffer', 'process', 'crypto-browserify', 'stream-browserify']
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
