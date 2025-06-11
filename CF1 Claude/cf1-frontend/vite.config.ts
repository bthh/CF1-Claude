import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
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
            ui: ['lucide-react']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    
    // Development server configuration
    server: {
      port: 5173,
      host: true,
      cors: true
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      host: true
    },
    
    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    }
  }
})
