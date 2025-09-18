import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Enhanced reporting for CI/CD pipeline
  reporter: process.env.CI
    ? [['html'], ['github'], ['json', { outputFile: 'test-results/results.json' }]]
    : 'html',

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // CI-specific configurations
    actionTimeout: process.env.CI ? 30000 : 10000,
    navigationTimeout: process.env.CI ? 60000 : 30000,

    // Browserbase configuration for CI
    ...(process.env.CI && process.env.BROWSERBASE_API_KEY && {
      connectOptions: {
        wsEndpoint: `wss://connect.browserbase.com?apiKey=${process.env.BROWSERBASE_API_KEY}&projectId=${process.env.BROWSERBASE_PROJECT_ID}`,
      },
    }),
  },

  projects: process.env.CI
    ? [
        // CI: Focus on primary enterprise browsers for CF1
        {
          name: 'chromium-desktop',
          use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
        },
        {
          name: 'chromium-mobile',
          use: { ...devices['Pixel 5'] },
        },
      ]
    : [
        // Local: Full browser matrix for comprehensive testing
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
        {
          name: 'Mobile Chrome',
          use: { ...devices['Pixel 5'] },
        },
        {
          name: 'Mobile Safari',
          use: { ...devices['iPhone 12'] },
        },
      ],

  webServer: process.env.CI
    ? {
        // CI: Use preview server for built artifacts
        command: 'npm run preview',
        port: 4173,
        reuseExistingServer: false,
        timeout: 120 * 1000,
      }
    : {
        // Local: Use dev server for faster iteration
        command: 'npm run dev',
        port: 5173,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
});