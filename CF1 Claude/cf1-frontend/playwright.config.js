// playwright.config.js
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env.browserbase
dotenv.config({ path: '.env.browserbase' });

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.{js,ts}',
  timeout: 90000, // Increased for Browserbase connection time

  // ⚡️ DEVELOPER TIER: Optimized parallelism for Browserbase stability
  fullyParallel: false, // Disable for better session management
  workers: process.env.CI ? 2 : 4, // Conservative worker count for Browserbase stability

  expect: {
    // Configure visual comparison settings
    threshold: 0.2,
    toMatchSnapshot: {
      maxDiffPixels: 150,
    },
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixels: 150,
    },
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // More retries with Developer tier stability
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    baseURL: 'https://rwa2.netlify.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'visual-regression',
      testMatch: ['**/visual-regression.spec.js', '**/comprehensive.spec.js'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  webServer: process.env.NODE_ENV === 'development' ? {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  } : undefined,
});