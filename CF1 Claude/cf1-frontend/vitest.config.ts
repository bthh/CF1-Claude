/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'src/vite-env.d.ts',
        'src/polyfills.ts',
        'src/main.tsx',
      ],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        // Per-file thresholds for critical components
        'src/components/AdminEnhancements/**/*.tsx': {
          branches: 98,
          functions: 98,
          lines: 98,
          statements: 98,
        },
        'src/components/Dashboard/**/*.tsx': {
          branches: 96,
          functions: 96,
          lines: 96,
          statements: 96,
        },
        'src/store/**/*.ts': {
          branches: 97,
          functions: 97,
          lines: 97,
          statements: 97,
        },
      },
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],
  },
})