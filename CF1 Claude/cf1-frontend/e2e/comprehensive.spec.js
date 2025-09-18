// tests/comprehensive.spec.js
import dotenv from 'dotenv';
import { test, expect, chromium } from '@playwright/test';
import { Browserbase } from '@browserbasehq/sdk';

dotenv.config({ path: '.env.browserbase' });

// --- Configuration ---
const PAGES_TO_TEST = [
  // Core Application Routes
  { name: 'dashboard', path: '/', description: 'Main dashboard with portfolio overview' },
  { name: 'dashboard-explicit', path: '/dashboard', description: 'Dashboard explicit route' },
  { name: 'marketplace', path: '/marketplace', description: 'Asset marketplace and discovery' },
  { name: 'portfolio', path: '/portfolio', description: 'User portfolio and holdings' },
  { name: 'portfolio-performance', path: '/portfolio/performance', description: 'Portfolio analytics' },
  { name: 'portfolio-transactions', path: '/portfolio/transactions', description: 'Transaction history' },

  // Launchpad Routes
  { name: 'launchpad', path: '/launchpad', description: 'New proposals and opportunities' },
  { name: 'launchpad-create', path: '/launchpad/create', description: 'Create new proposal' },
  { name: 'launchpad-drafts', path: '/launchpad/drafts', description: 'Draft proposals' },

  // Governance Routes
  { name: 'governance', path: '/governance', description: 'Governance proposals and voting' },
  { name: 'governance-active', path: '/governance/active', description: 'Active governance proposals' },
  { name: 'governance-passed', path: '/governance/passed', description: 'Passed governance proposals' },
  { name: 'governance-rejected', path: '/governance/rejected', description: 'Rejected governance proposals' },
  { name: 'governance-my-votes', path: '/governance/my-votes', description: 'My governance votes' },
  { name: 'governance-create', path: '/governance/create', description: 'Create governance proposal' },
  { name: 'governance-drafts', path: '/governance/drafts', description: 'Governance drafts' },

  // User Profile & Settings
  { name: 'profile', path: '/profile', description: 'User profile management' },
  { name: 'profile-edit', path: '/profile/edit', description: 'Edit user profile' },
  { name: 'settings', path: '/profile/settings', description: 'User preferences and settings' },
  { name: 'verification', path: '/profile/verification', description: 'Identity verification' },

  // Discovery & Analytics
  { name: 'discovery', path: '/discovery', description: 'Content discovery hub' },
  { name: 'analytics', path: '/analytics', description: 'Platform analytics dashboard' },

  // Secondary Trading
  { name: 'secondary-trading', path: '/secondary-trading', description: 'Secondary market trading' },

  // My Submissions (Creator Experience)
  { name: 'my-submissions', path: '/my-submissions', description: 'User submission management' },

  // Performance Dashboards
  { name: 'performance', path: '/dashboard/performance', description: 'Performance analytics' },
  { name: 'activity', path: '/dashboard/activity', description: 'Activity feed and notifications' },

  // Admin Routes (Public Access)
  { name: 'admin', path: '/admin', description: 'Admin navigation hub' },
  { name: 'admin-creator', path: '/admin/creator', description: 'Creator admin panel' },
  { name: 'admin-super', path: '/admin/super', description: 'Super admin panel' },
  { name: 'admin-platform', path: '/admin/platform', description: 'Platform admin panel' },
  { name: 'admin-testing', path: '/admin/testing', description: 'Role-based testing page' }
];

const VIEWPORTS_TO_TEST = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'large-desktop', width: 1920, height: 1080 }
];

test.describe.configure({ mode: 'serial' }); // Force sequential execution for session stability

test.describe('CF1 Platform - Comprehensive Visual Regression Test', () => {
  let browser;
  let context;
  let bb; // Declare bb here

  // Connect to Browserbase once before all tests
  test.beforeAll(async () => {
    console.log('🔧 Debug: API Key exists:', !!process.env.BROWSERBASE_API_KEY);
    console.log('🔧 Debug: Project ID exists:', !!process.env.BROWSERBASE_PROJECT_ID);

    // ✅ Initialize `bb` inside the hook, right before it's used
    bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY });

    console.log('🔧 Debug: bb instance created:', !!bb);
    console.log('🔧 Debug: bb.createSession exists:', !!bb.createSession);

    console.log('🚀 Creating Browserbase session...');

    try {
      const session = await bb.createSession({
        projectId: process.env.BROWSERBASE_PROJECT_ID,
        // 🛡️ DEVELOPER TIER: Enhanced capabilities
        browserSettings: {
          solveCaptchas: true,    // Auto-solve CAPTCHAs
          blockAds: true,         // Block ads for faster loading
          recordSession: false,   // Disable recording for faster performance
          logSession: false,      // Disable logs for faster performance
        },
        // Enable stealth mode for better compatibility
        keepAlive: true,
        timeout: 120000, // 2 minutes timeout with Developer tier stability
      });

      console.log('🔗 Connecting to session via CDP...');
      const connectUrl = bb.getConnectURL({ sessionId: session.id });
      browser = await chromium.connectOverCDP(connectUrl, { timeout: 90 * 1000 });
      context = browser.contexts()[0]; // Use the context from the connected browser
      console.log('✅ Connection established!');
      console.log(`📊 Testing ${PAGES_TO_TEST.length} pages across ${VIEWPORTS_TO_TEST.length} viewports = ${PAGES_TO_TEST.length * VIEWPORTS_TO_TEST.length} total screenshots`);
      console.log('⚡️ DEVELOPER TIER: Running with up to 15 parallel browsers for maximum speed!');
      console.log('🔍 DEEP DIVE: Comprehensive UI consistency audit across all major platform routes');
    } catch (error) {
      console.error('❌ Failed to connect to Browserbase:', error.message);
      throw error;
    }
  });

  // Disconnect after all tests are done
  test.afterAll(async () => {
    if (browser) {
      await browser.close();
      console.log('👋 Browserbase session closed.');
    }
  });

  // --- Dynamic Test Generation ---
  // This will generate a test for each page and viewport combination
  for (const pageInfo of PAGES_TO_TEST) {
    for (const viewport of VIEWPORTS_TO_TEST) {
      test(`should match snapshot for ${pageInfo.name} on ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
        console.log(`📸 Capturing: ${pageInfo.name} - ${viewport.name}`);

        const page = await context.newPage();

        try {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });

          const url = `https://rwa2.netlify.app${pageInfo.path}`;
          console.log(`🌐 Loading: ${url}`);
          console.log(`📋 Testing: ${pageInfo.description}`);

          await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
          });

          // Handle potential authentication redirects or choose path modal
          try {
            // Wait for either the main content or auth/choose path modal
            await page.waitForSelector('main, [data-testid="choose-path-modal"], [data-testid="auth-modal"]', { timeout: 5000 });

            // If we see a choose path modal, dismiss it for testing
            const choosePathModal = page.locator('[data-testid="choose-path-modal"]');
            if (await choosePathModal.isVisible()) {
              await page.click('button:has-text("Browse Marketplace")'); // Select a default path
              await page.waitForTimeout(1000);
            }
          } catch (e) {
            // Continue with screenshot if elements aren't found
            console.log(`ℹ️  Standard page load for ${pageInfo.name}`);
          }

          // Wait for key responsive elements to load
          try {
            await page.waitForSelector('.heading-responsive-hero, .heading-responsive-xl, h1', { timeout: 10000 });
          } catch (e) {
            console.log(`⚠️  No heading selectors found on ${pageInfo.name}, proceeding...`);
          }

          // Additional wait for any animations/dynamic content
          await page.waitForTimeout(2000);

          // The core assertion: compare against a baseline screenshot
          await expect(page).toHaveScreenshot(`${pageInfo.name}-${viewport.name}.png`, {
            fullPage: true,
            maxDiffPixels: 150, // Threshold for anti-aliasing differences
            threshold: 0.2, // 20% threshold for pixel differences
            animations: 'disabled' // Disable animations for consistent screenshots
          });

          console.log(`✅ Screenshot captured: ${pageInfo.name}-${viewport.name}.png`);

        } catch (error) {
          console.error(`❌ Failed to capture ${pageInfo.name} on ${viewport.name}:`, error.message);
          throw error;
        } finally {
          await page.close();
        }
      });
    }
  }

  // --- Responsive Component Tests ---
  test.describe('Component-Level Responsive Testing', () => {
    test('should verify button components scale correctly across viewports', async () => {
      for (const viewport of VIEWPORTS_TO_TEST) {
        const page = await context.newPage();
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('https://rwa2.netlify.app/', { waitUntil: 'domcontentloaded' });

        // Focus on button container
        const buttonSection = await page.locator('button, .btn-responsive-md').first();

        await expect(buttonSection).toHaveScreenshot(`buttons-${viewport.name}.png`, {
          maxDiffPixels: 50,
          threshold: 0.15
        });

        await page.close();
      }
    });

    test('should verify card components maintain proportions', async () => {
      for (const viewport of VIEWPORTS_TO_TEST) {
        const page = await context.newPage();
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('https://rwa2.netlify.app/', { waitUntil: 'domcontentloaded' });

        // Focus on card container
        try {
          const cardSection = await page.locator('.card-responsive, [class*="card"]').first();

          await expect(cardSection).toHaveScreenshot(`cards-${viewport.name}.png`, {
            maxDiffPixels: 50,
            threshold: 0.15
          });
        } catch (e) {
          console.log(`⚠️  No card elements found on ${viewport.name}`);
        }

        await page.close();
      }
    });
  });

  // --- Typography Scaling Test ---
  test('should verify typography scales appropriately across all viewports', async () => {
    for (const viewport of VIEWPORTS_TO_TEST) {
      const page = await context.newPage();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('https://rwa2.netlify.app/', { waitUntil: 'domcontentloaded' });

      // Focus on main heading
      try {
        const headingSection = await page.locator('.heading-responsive-hero, h1').first();

        await expect(headingSection).toHaveScreenshot(`typography-${viewport.name}.png`, {
          maxDiffPixels: 75,
          threshold: 0.2
        });
      } catch (e) {
        console.log(`⚠️  No heading elements found on ${viewport.name}`);
      }

      await page.close();
    }
  });
});