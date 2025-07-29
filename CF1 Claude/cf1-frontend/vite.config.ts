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
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            cosmos: ['@cosmjs/cosmwasm-stargate', '@cosmjs/stargate'],
            ui: ['lucide-react'],
            polyfills: ['buffer', 'process', 'crypto-browserify', 'stream-browserify']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
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
