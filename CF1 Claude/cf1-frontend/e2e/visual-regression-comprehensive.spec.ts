import { test, expect, Page } from '@playwright/test';

/**
 * CF1 Platform - Comprehensive Visual Regression Testing Framework
 *
 * This test suite implements enterprise-grade visual regression testing
 * to ensure UI consistency across all platform components and user flows.
 *
 * Target: Prevent visual regressions in financial interfaces
 * Coverage: All critical UI components with cross-browser validation
 */

// Test configuration for visual regression
const VISUAL_CONFIG = {
  threshold: 0.2, // 20% visual difference threshold for enterprise stability
  maxDiffPixels: 100, // Maximum acceptable pixel differences
  animations: 'disabled' as const, // Disable animations for consistent screenshots
};

// Viewport configurations for comprehensive responsive testing
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
  ultrawide: { width: 2560, height: 1440 },
};

// Helper function to prepare page for visual testing
async function preparePage(page: Page): Promise<void> {
  // Disable animations for consistent visual testing
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  });

  // Wait for fonts and assets to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Additional stability wait
}

// Helper function to handle authentication for admin pages
async function authenticateAdmin(page: Page): Promise<void> {
  await page.goto('/admin');

  // Check if already authenticated or in demo mode
  const isAuthenticated = await page.locator('[data-testid="admin-dashboard"]').isVisible().catch(() => false);

  if (!isAuthenticated) {
    // Perform admin login for testing
    await page.fill('[data-testid="admin-email"]', 'test-admin@cf1platform.com');
    await page.fill('[data-testid="admin-password"]', 'TestPassword123!');
    await page.click('[data-testid="admin-login-button"]');
    await page.waitForURL('**/admin/dashboard');
  }
}

test.describe('CF1 Platform - Visual Regression Testing', () => {

  test.describe('Authentication & Onboarding Flows', () => {

    test('Login Page - Clean Authentication Interface', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      await preparePage(page);

      // Capture clean login state
      await expect(page).toHaveScreenshot('login-page-desktop.png', VISUAL_CONFIG);

      // Test mobile responsive login
      await page.setViewportSize(VIEWPORTS.mobile);
      await expect(page).toHaveScreenshot('login-page-mobile.png', VISUAL_CONFIG);
    });

    test('Wallet Connection States', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      await preparePage(page);

      // Capture wallet connection component
      const walletComponent = page.locator('[data-testid="wallet-connection"]');
      await expect(walletComponent).toHaveScreenshot('wallet-disconnected.png', VISUAL_CONFIG);

      // Simulate wallet connection
      await page.click('[data-testid="connect-wallet-button"]');
      await page.waitForTimeout(500);
      await expect(walletComponent).toHaveScreenshot('wallet-connecting.png', VISUAL_CONFIG);
    });
  });

  test.describe('Dashboard Components', () => {

    test('Main Dashboard Layout - Multi-Viewport', async ({ page }) => {
      await page.goto('/dashboard');
      await preparePage(page);

      // Desktop dashboard
      await page.setViewportSize(VIEWPORTS.desktop);
      await expect(page).toHaveScreenshot('dashboard-desktop.png', VISUAL_CONFIG);

      // Tablet dashboard
      await page.setViewportSize(VIEWPORTS.tablet);
      await expect(page).toHaveScreenshot('dashboard-tablet.png', VISUAL_CONFIG);

      // Mobile dashboard
      await page.setViewportSize(VIEWPORTS.mobile);
      await expect(page).toHaveScreenshot('dashboard-mobile.png', VISUAL_CONFIG);
    });

    test('Portfolio Widget States', async ({ page }) => {
      await page.goto('/dashboard');
      await preparePage(page);
      await page.setViewportSize(VIEWPORTS.desktop);

      // Empty portfolio state
      const portfolioWidget = page.locator('[data-testid="portfolio-widget"]');
      await expect(portfolioWidget).toHaveScreenshot('portfolio-empty.png', VISUAL_CONFIG);

      // Mock portfolio data loading
      await page.evaluate(() => {
        // Inject mock portfolio data for visual testing
        window.mockPortfolioData = {
          totalValue: 125000,
          assets: [
            { name: 'Real Estate Fund A', value: 75000, allocation: 60 },
            { name: 'Tech Startup Equity', value: 35000, allocation: 28 },
            { name: 'Green Energy Project', value: 15000, allocation: 12 }
          ]
        };
      });

      await page.reload();
      await preparePage(page);
      await expect(portfolioWidget).toHaveScreenshot('portfolio-loaded.png', VISUAL_CONFIG);
    });

    test('Analytics Widgets', async ({ page }) => {
      await page.goto('/dashboard');
      await preparePage(page);
      await page.setViewportSize(VIEWPORTS.desktop);

      // Analytics widget with chart data
      const analyticsWidget = page.locator('[data-testid="analytics-widget"]');
      await expect(analyticsWidget).toHaveScreenshot('analytics-widget.png', VISUAL_CONFIG);

      // Performance chart
      const performanceChart = page.locator('[data-testid="performance-chart"]');
      await expect(performanceChart).toHaveScreenshot('performance-chart.png', VISUAL_CONFIG);
    });
  });

  test.describe('Investment Flow Components', () => {

    test('Marketplace Listing Grid', async ({ page }) => {
      await page.goto('/marketplace');
      await preparePage(page);

      // Desktop marketplace grid
      await page.setViewportSize(VIEWPORTS.desktop);
      await expect(page).toHaveScreenshot('marketplace-desktop.png', VISUAL_CONFIG);

      // Mobile marketplace (card stack)
      await page.setViewportSize(VIEWPORTS.mobile);
      await expect(page).toHaveScreenshot('marketplace-mobile.png', VISUAL_CONFIG);
    });

    test('Investment Modal States', async ({ page }) => {
      await page.goto('/marketplace');
      await preparePage(page);
      await page.setViewportSize(VIEWPORTS.desktop);

      // Open investment modal
      await page.click('[data-testid="asset-card"]:first-child');
      await page.waitForSelector('[data-testid="investment-modal"]');

      // Initial modal state
      const modal = page.locator('[data-testid="investment-modal"]');
      await expect(modal).toHaveScreenshot('investment-modal-initial.png', VISUAL_CONFIG);

      // Modal with investment amount
      await page.fill('[data-testid="investment-amount"]', '5000');
      await expect(modal).toHaveScreenshot('investment-modal-filled.png', VISUAL_CONFIG);

      // Modal error state
      await page.fill('[data-testid="investment-amount"]', '999999999');
      await page.click('[data-testid="validate-investment"]');
      await expect(modal).toHaveScreenshot('investment-modal-error.png', VISUAL_CONFIG);
    });

    test('Asset Detail Pages', async ({ page }) => {
      await page.goto('/marketplace/asset/1');
      await preparePage(page);

      // Desktop asset detail
      await page.setViewportSize(VIEWPORTS.desktop);
      await expect(page).toHaveScreenshot('asset-detail-desktop.png', VISUAL_CONFIG);

      // Mobile asset detail
      await page.setViewportSize(VIEWPORTS.mobile);
      await expect(page).toHaveScreenshot('asset-detail-mobile.png', VISUAL_CONFIG);
    });
  });

  test.describe('Admin Panel Interface', () => {

    test('Admin Dashboard Layout', async ({ page }) => {
      await authenticateAdmin(page);
      await page.setViewportSize(VIEWPORTS.desktop);
      await preparePage(page);

      await expect(page).toHaveScreenshot('admin-dashboard.png', VISUAL_CONFIG);
    });

    test('User Management Interface', async ({ page }) => {
      await authenticateAdmin(page);
      await page.goto('/admin/users');
      await preparePage(page);
      await page.setViewportSize(VIEWPORTS.desktop);

      await expect(page).toHaveScreenshot('admin-users.png', VISUAL_CONFIG);
    });

    test('Proposal Review Queue', async ({ page }) => {
      await authenticateAdmin(page);
      await page.goto('/admin/proposals');
      await preparePage(page);
      await page.setViewportSize(VIEWPORTS.desktop);

      // Empty queue state
      await expect(page).toHaveScreenshot('proposal-queue-empty.png', VISUAL_CONFIG);

      // Queue with proposals (mock data)
      await page.evaluate(() => {
        window.mockProposalData = [
          {
            id: 1,
            title: 'Downtown Commercial Property',
            status: 'pending_review',
            amount: 2500000,
            submittedAt: '2024-01-15'
          },
          {
            id: 2,
            title: 'Tech Startup Series A',
            status: 'under_review',
            amount: 1000000,
            submittedAt: '2024-01-14'
          }
        ];
      });

      await page.reload();
      await preparePage(page);
      await expect(page).toHaveScreenshot('proposal-queue-loaded.png', VISUAL_CONFIG);
    });
  });

  test.describe('Mobile Experience & Touch Interfaces', () => {

    test('Mobile Navigation Menu', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/dashboard');
      await preparePage(page);

      // Closed mobile menu
      await expect(page).toHaveScreenshot('mobile-nav-closed.png', VISUAL_CONFIG);

      // Open mobile menu
      await page.click('[data-testid="mobile-menu-toggle"]');
      await expect(page).toHaveScreenshot('mobile-nav-open.png', VISUAL_CONFIG);
    });

    test('Touch-Optimized Components', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/marketplace');
      await preparePage(page);

      // Touch-optimized asset cards
      await expect(page).toHaveScreenshot('touch-asset-cards.png', VISUAL_CONFIG);

      // Touch-optimized filters
      await page.click('[data-testid="filter-toggle"]');
      await expect(page).toHaveScreenshot('touch-filters.png', VISUAL_CONFIG);
    });
  });

  test.describe('Error States & Edge Cases', () => {

    test('Error Boundary Components', async ({ page }) => {
      await page.goto('/dashboard');
      await preparePage(page);
      await page.setViewportSize(VIEWPORTS.desktop);

      // Simulate component error
      await page.evaluate(() => {
        // Trigger error boundary
        window.simulateError = true;
      });

      await page.reload();
      await preparePage(page);
      await expect(page).toHaveScreenshot('error-boundary.png', VISUAL_CONFIG);
    });

    test('Loading States', async ({ page }) => {
      // Intercept network requests to simulate loading
      await page.route('**/api/**', route => {
        // Delay API responses for loading state capture
        setTimeout(() => route.continue(), 2000);
      });

      await page.goto('/dashboard');
      await page.setViewportSize(VIEWPORTS.desktop);

      // Capture loading states
      await expect(page).toHaveScreenshot('dashboard-loading.png', VISUAL_CONFIG);
    });

    test('Empty States', async ({ page }) => {
      await page.goto('/portfolio');
      await preparePage(page);
      await page.setViewportSize(VIEWPORTS.desktop);

      // Empty portfolio state
      await expect(page).toHaveScreenshot('portfolio-empty-state.png', VISUAL_CONFIG);

      // Empty marketplace state
      await page.goto('/marketplace');
      await preparePage(page);
      await expect(page).toHaveScreenshot('marketplace-empty-state.png', VISUAL_CONFIG);
    });
  });

  test.describe('Cross-Browser Consistency', () => {

    test('Critical Pages Cross-Browser', async ({ page, browserName }) => {
      await page.setViewportSize(VIEWPORTS.desktop);

      // Test key pages across browsers
      const pages = ['/dashboard', '/marketplace', '/portfolio'];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await preparePage(page);

        const pageName = pagePath.replace('/', '') || 'home';
        await expect(page).toHaveScreenshot(`${pageName}-${browserName}.png`, VISUAL_CONFIG);
      }
    });
  });

  test.describe('Accessibility Visual Validation', () => {

    test('High Contrast Mode', async ({ page }) => {
      await page.goto('/dashboard');
      await page.setViewportSize(VIEWPORTS.desktop);

      // Enable high contrast mode
      await page.addStyleTag({
        content: `
          :root {
            --color-bg: #000000;
            --color-text: #ffffff;
            --color-primary: #ffff00;
            --color-border: #ffffff;
          }
        `
      });

      await preparePage(page);
      await expect(page).toHaveScreenshot('dashboard-high-contrast.png', VISUAL_CONFIG);
    });

    test('Focus Indicators', async ({ page }) => {
      await page.goto('/marketplace');
      await page.setViewportSize(VIEWPORTS.desktop);
      await preparePage(page);

      // Focus on interactive elements
      await page.keyboard.press('Tab');
      await expect(page).toHaveScreenshot('focus-first-element.png', VISUAL_CONFIG);

      await page.keyboard.press('Tab');
      await expect(page).toHaveScreenshot('focus-second-element.png', VISUAL_CONFIG);
    });
  });

  test.describe('Performance Visual Validation', () => {

    test('Component Rendering Performance', async ({ page }) => {
      await page.goto('/dashboard');
      await page.setViewportSize(VIEWPORTS.desktop);

      // Measure and capture render performance
      const performanceMetrics = await page.evaluate(() => {
        return window.performance.getEntriesByType('measure');
      });

      await preparePage(page);
      await expect(page).toHaveScreenshot('dashboard-performance-baseline.png', VISUAL_CONFIG);

      // Validate no visual degradation under load
      console.log('Performance metrics:', performanceMetrics);
    });
  });
});

test.describe('Visual Regression - Data States', () => {

  test('Chart Rendering Consistency', async ({ page }) => {
    await page.goto('/dashboard');
    await preparePage(page);
    await page.setViewportSize(VIEWPORTS.desktop);

    // Mock consistent chart data for visual testing
    await page.evaluate(() => {
      window.chartData = {
        performanceData: [
          { date: '2024-01', value: 100000 },
          { date: '2024-02', value: 105000 },
          { date: '2024-03', value: 110000 },
          { date: '2024-04', value: 108000 },
          { date: '2024-05', value: 115000 }
        ]
      };
    });

    await page.reload();
    await preparePage(page);

    const chartContainer = page.locator('[data-testid="chart-container"]');
    await expect(chartContainer).toHaveScreenshot('performance-chart-consistent.png', VISUAL_CONFIG);
  });
});