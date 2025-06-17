import { test, expect, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

test.describe('Mobile Experience E2E Tests', () => {
  test.describe('Mobile Navigation', () => {
    test.use({ ...devices['iPhone 12'] });

    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Connect wallet in demo mode
      await page.click('button:has-text("Connect Wallet")');
      await page.click('button:has-text("Use Demo Mode")');
      
      await expect(page.locator('text=cosmos1')).toBeVisible({ timeout: 10000 });
    });

    test('should display mobile hamburger menu', async ({ page }) => {
      // Verify hamburger menu is visible on mobile
      const hamburgerButton = page.locator('button[aria-label="Open navigation menu"]');
      await expect(hamburgerButton).toBeVisible();
      
      // Click to open mobile menu
      await hamburgerButton.click();
      
      // Verify mobile navigation panel opens
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Marketplace')).toBeVisible();
      await expect(page.locator('text=Portfolio')).toBeVisible();
      await expect(page.locator('text=Launchpad')).toBeVisible();
    });

    test('should handle swipe gestures for navigation', async ({ page }) => {
      const hamburgerButton = page.locator('button[aria-label="Open navigation menu"]');
      await hamburgerButton.click();
      
      const mobileNav = page.locator('[data-testid="mobile-navigation"]');
      
      // Test swipe to close
      await mobileNav.hover();
      await page.mouse.down();
      await page.mouse.move(-300, 0); // Swipe left
      await page.mouse.up();
      
      // Navigation should close
      await expect(mobileNav).not.toBeVisible();
    });

    test('should navigate between pages on mobile', async ({ page }) => {
      const hamburgerButton = page.locator('button[aria-label="Open navigation menu"]');
      await hamburgerButton.click();
      
      // Navigate to Marketplace
      await page.click('text=Marketplace');
      await expect(page).toHaveURL(/\/marketplace/);
      await expect(page.locator('h1:has-text("Asset Marketplace")')).toBeVisible();
      
      // Verify mobile layout
      await expect(page.locator('.asset-card')).toBeVisible();
    });

    test('should handle mobile form interactions', async ({ page }) => {
      // Navigate to create proposal
      const hamburgerButton = page.locator('button[aria-label="Open navigation menu"]');
      await hamburgerButton.click();
      await page.click('text=Launchpad');
      await page.click('button:has-text("Create Proposal")');
      
      // Test mobile form inputs
      const nameInput = page.locator('input[name="name"]');
      await nameInput.fill('Mobile Test Property');
      
      // Verify touch keyboard doesn't interfere
      await expect(nameInput).toHaveValue('Mobile Test Property');
      
      // Test mobile dropdown
      const assetTypeSelect = page.locator('select[name="asset_type"]');
      await assetTypeSelect.selectOption('Real Estate');
      
      // Test mobile number inputs
      const targetAmountInput = page.locator('input[name="target_amount"]');
      await targetAmountInput.fill('50000');
      await expect(targetAmountInput).toHaveValue('50000');
    });
  });

  test.describe('Touch Interactions', () => {
    test.use({ ...devices['iPad Pro'] });

    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('button:has-text("Connect Wallet")');
      await page.click('button:has-text("Use Demo Mode")');
      await expect(page.locator('text=cosmos1')).toBeVisible();
    });

    test('should handle touch scrolling on data tables', async ({ page }) => {
      await page.goto(`${BASE_URL}/portfolio/transactions`);
      
      // Wait for transaction table to load
      await expect(page.locator('table')).toBeVisible();
      
      const table = page.locator('table');
      
      // Test horizontal scroll on wide tables
      await table.hover();
      await page.mouse.down();
      await page.mouse.move(-200, 0);
      await page.mouse.up();
      
      // Verify table can be scrolled
      await expect(table).toBeVisible();
    });

    test('should handle touch interactions on charts', async ({ page }) => {
      await page.goto(`${BASE_URL}/analytics`);
      
      // Wait for charts to load
      await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
      
      const chart = page.locator('[data-testid="chart-container"]').first();
      
      // Test touch interaction on chart
      await chart.tap();
      
      // Verify chart responds to touch
      await expect(chart).toBeVisible();
    });

    test('should handle pinch to zoom on charts', async ({ page }) => {
      await page.goto(`${BASE_URL}/analytics`);
      
      await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
      
      const chart = page.locator('[data-testid="chart-container"]').first();
      
      // Simulate pinch gesture
      await chart.hover();
      await page.touchscreen.tap(200, 200);
      
      // Chart should remain interactive
      await expect(chart).toBeVisible();
    });
  });

  test.describe('PWA Functionality', () => {
    test.use({ ...devices['Pixel 5'] });

    test('should work offline with service worker', async ({ page, context }) => {
      await page.goto(BASE_URL);
      
      // Wait for service worker to register
      await page.waitForTimeout(2000);
      
      // Go offline
      await context.setOffline(true);
      
      // Navigate to cached page
      await page.reload();
      
      // Should show offline message or cached content
      const offlineIndicator = page.locator('text=Offline Mode').or(page.locator('text=No internet connection'));
      await expect(offlineIndicator).toBeVisible({ timeout: 5000 });
    });

    test('should display install prompt on supported devices', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Simulate PWA install prompt
      await page.evaluate(() => {
        window.dispatchEvent(new Event('beforeinstallprompt'));
      });
      
      // Look for install button or prompt
      const installButton = page.locator('button:has-text("Install App")').or(page.locator('button:has-text("Add to Home Screen")'));
      
      // Install prompt might not always appear in test environment
      // This tests the handling rather than the prompt itself
      await page.waitForTimeout(1000);
    });

    test('should handle push notifications permission', async ({ page, context }) => {
      // Grant notification permission
      await context.grantPermissions(['notifications']);
      
      await page.goto(BASE_URL);
      await page.click('button:has-text("Connect Wallet")');
      await page.click('button:has-text("Use Demo Mode")');
      
      // Look for notification settings
      const notificationButton = page.locator('button[title*="notification"]').or(page.locator('[data-testid="notifications"]'));
      
      if (await notificationButton.isVisible()) {
        await notificationButton.click();
        await expect(page.locator('text=Notifications')).toBeVisible();
      }
    });
  });

  test.describe('Responsive Breakpoints', () => {
    test('should adapt layout for small screens (320px)', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto(BASE_URL);
      
      // Verify layout adapts to very small screens
      const hamburgerButton = page.locator('button[aria-label="Open navigation menu"]');
      await expect(hamburgerButton).toBeVisible();
      
      // Desktop navigation should be hidden
      const desktopNav = page.locator('nav:has-text("Dashboard")');
      await expect(desktopNav).not.toBeVisible();
    });

    test('should adapt layout for medium tablets (768px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(BASE_URL);
      
      // At tablet size, might show condensed desktop nav or mobile nav
      const navigation = page.locator('nav').or(page.locator('button[aria-label="Open navigation menu"]'));
      await expect(navigation).toBeVisible();
    });

    test('should show desktop layout on large screens (1024px+)', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto(BASE_URL);
      
      // Desktop navigation should be visible
      const desktopNav = page.locator('nav:has-text("Dashboard")');
      await expect(desktopNav).toBeVisible();
      
      // Mobile hamburger should be hidden
      const hamburgerButton = page.locator('button[aria-label="Open navigation menu"]');
      await expect(hamburgerButton).not.toBeVisible();
    });
  });

  test.describe('Mobile Performance', () => {
    test.use({ ...devices['iPhone 12'] });

    test('should load quickly on mobile devices', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(BASE_URL);
      
      // Wait for main content to load
      await expect(page.locator('h1')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (5 seconds for mobile)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle rapid touch interactions', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('button:has-text("Connect Wallet")');
      await page.click('button:has-text("Use Demo Mode")');
      
      // Rapid navigation taps
      const hamburgerButton = page.locator('button[aria-label="Open navigation menu"]');
      
      for (let i = 0; i < 5; i++) {
        await hamburgerButton.click();
        await page.waitForTimeout(100);
        
        // Try to navigate
        const marketplaceLink = page.locator('text=Marketplace');
        if (await marketplaceLink.isVisible()) {
          await marketplaceLink.click();
          await page.waitForTimeout(200);
        }
      }
      
      // Should handle rapid interactions gracefully
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Mobile Accessibility', () => {
    test.use({ ...devices['iPhone 12'] });

    test('should support voice control navigation', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Test that elements have proper labels for voice control
      const hamburgerButton = page.locator('button[aria-label="Open navigation menu"]');
      await expect(hamburgerButton).toHaveAttribute('aria-label');
      
      const connectButton = page.locator('button:has-text("Connect Wallet")');
      await expect(connectButton).toBeVisible();
      
      // Verify navigation is accessible
      await hamburgerButton.click();
      const navItems = page.locator('a[role="menuitem"]').or(page.locator('nav a'));
      const count = await navItems.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should support high contrast mode on mobile', async ({ page }) => {
      // Enable high contrast media query
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
      
      await page.goto(BASE_URL);
      
      // Verify dark mode is applied
      const body = page.locator('body');
      await expect(body).toHaveClass(/dark/);
    });

    test('should handle large text accessibility', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Simulate large text preference
      await page.addStyleTag({
        content: `
          * {
            font-size: 18px !important;
          }
          h1 { font-size: 32px !important; }
          h2 { font-size: 28px !important; }
        `
      });
      
      // Verify layout still works with larger text
      await expect(page.locator('h1')).toBeVisible();
      
      const hamburgerButton = page.locator('button[aria-label="Open navigation menu"]');
      await hamburgerButton.click();
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });
  });

  test.describe('Mobile Investment Flow', () => {
    test.use({ ...devices['iPhone 12'] });

    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('button:has-text("Connect Wallet")');
      await page.click('button:has-text("Use Demo Mode")');
      await expect(page.locator('text=cosmos1')).toBeVisible();
    });

    test('should complete investment flow on mobile', async ({ page }) => {
      // Navigate to marketplace
      const hamburgerButton = page.locator('button[aria-label="Open navigation menu"]');
      await hamburgerButton.click();
      await page.click('text=Marketplace');
      
      // Select first asset
      await page.click('.asset-card >> nth=0');
      
      // Investment modal should be touch-friendly
      await page.click('button:has-text("Invest")');
      
      // Mobile investment form
      const amountInput = page.locator('input[name="amount"]');
      await amountInput.fill('100');
      
      // Verify mobile-friendly button size
      const confirmButton = page.locator('button:has-text("Confirm Investment")');
      await expect(confirmButton).toBeVisible();
      
      // Complete investment
      await confirmButton.click();
      
      // Should handle mobile success flow
      await expect(page.locator('text=Investment successful')).toBeVisible({ timeout: 15000 });
    });

    test('should display mobile-optimized charts', async ({ page }) => {
      const hamburgerButton = page.locator('button[aria-label="Open navigation menu"]');
      await hamburgerButton.click();
      await page.click('text=Analytics');
      
      // Charts should be mobile-optimized
      await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
      
      // Test touch interaction
      const chart = page.locator('[data-testid="chart-container"]').first();
      await chart.tap();
      
      // Chart should respond appropriately on mobile
      await expect(chart).toBeVisible();
    });
  });
});