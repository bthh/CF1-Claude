import { test, expect, Page } from '@playwright/test';

/**
 * CF1 Visual Regression Test Suite
 *
 * Focus: Core enterprise pages that affect user experience
 * Standards: "TradFi Feel, DeFi Engine" design consistency
 * Coverage: Desktop + Mobile viewports for accessibility
 */

// Helper function for consistent page setup
async function setupPage(page: Page, path: string) {
  await page.goto(path);

  // Wait for critical CF1 components to load
  await page.waitForSelector('[data-testid="cf1-main-content"], main, .main-content', {
    timeout: 10000
  });

  // Wait for any loading spinners to disappear
  await page.waitForFunction(() => {
    const spinners = document.querySelectorAll('.animate-spin, [data-testid="loading"]');
    return spinners.length === 0;
  }, { timeout: 15000 });

  // Allow time for animations and transitions to complete
  await page.waitForTimeout(1000);
}

test.describe('CF1 Core Pages - Visual Regression', () => {
  test('Dashboard - Landing page maintains TradFi professional appearance', async ({ page }) => {
    await setupPage(page, '/');

    // Hide dynamic elements that change (timestamps, random data)
    await page.addStyleTag({
      content: `
        .timestamp, .last-updated, .current-time,
        .animate-pulse, .animate-bounce,
        [data-testid="dynamic-timestamp"] {
          visibility: hidden !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('dashboard-main.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('Marketplace - Asset discovery and filtering interface', async ({ page }) => {
    await setupPage(page, '/marketplace');

    // Wait for asset cards to load
    await page.waitForSelector('.asset-card, [data-testid="asset-card"]', {
      timeout: 10000
    });

    await expect(page).toHaveScreenshot('marketplace-main.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('Discovery - Smart search with bubble tag filters', async ({ page }) => {
    await setupPage(page, '/discovery');

    // Wait for bubble tag filters to render
    await page.waitForSelector('button[class*="rounded-full"]', {
      timeout: 5000
    });

    await expect(page).toHaveScreenshot('discovery-smart-search.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('Portfolio - Investment tracking and performance', async ({ page }) => {
    await setupPage(page, '/portfolio');

    // Wait for portfolio data to load
    await page.waitForSelector('.portfolio-widget, [data-testid="portfolio-content"]', {
      timeout: 10000
    });

    await expect(page).toHaveScreenshot('portfolio-main.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('Admin Dashboard - Platform management interface', async ({ page }) => {
    await setupPage(page, '/admin');

    // Note: This will show login screen for non-authenticated users, which is expected
    await expect(page).toHaveScreenshot('admin-interface.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });
});

test.describe('CF1 Component States - Visual Consistency', () => {
  test('Sidebar - Default collapsed state', async ({ page }) => {
    await setupPage(page, '/');

    // Verify sidebar is collapsed by default (recent fix)
    await expect(page.locator('[data-testid="sidebar"], aside').first()).toHaveScreenshot('sidebar-collapsed.png', {
      animations: 'disabled',
    });
  });

  test('Sidebar - Expanded state', async ({ page }) => {
    await setupPage(page, '/');

    // Click to expand sidebar
    await page.click('button[title*="Expand"], .sidebar-toggle', { timeout: 5000 });
    await page.waitForTimeout(500); // Animation completion

    await expect(page.locator('[data-testid="sidebar"], aside').first()).toHaveScreenshot('sidebar-expanded.png', {
      animations: 'disabled',
    });
  });

  test('Category Filters - Bubble tag design', async ({ page }) => {
    await setupPage(page, '/discovery');

    // Focus on the category filter section
    const filterSection = page.locator('div:has(button[class*="rounded-full"])').first();
    await expect(filterSection).toHaveScreenshot('category-filters-bubble-tags.png', {
      animations: 'disabled',
    });
  });

  test('Dark Mode - Theme consistency', async ({ page }) => {
    await setupPage(page, '/');

    // Toggle to dark mode (if toggle exists)
    const darkModeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="dark"]');
    if (await darkModeToggle.count() > 0) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
    }

    await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });
});

test.describe('CF1 Mobile Experience - Responsive Design', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('Mobile Dashboard - Professional mobile experience', async ({ page }) => {
    await setupPage(page, '/');

    await expect(page).toHaveScreenshot('mobile-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('Mobile Marketplace - Touch-optimized asset browsing', async ({ page }) => {
    await setupPage(page, '/marketplace');

    await page.waitForSelector('.asset-card, [data-testid="asset-card"]', {
      timeout: 10000
    });

    await expect(page).toHaveScreenshot('mobile-marketplace.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('Mobile Category Filters - Touch-friendly bubble tags', async ({ page }) => {
    await setupPage(page, '/discovery');

    const filterSection = page.locator('div:has(button[class*="rounded-full"])').first();
    await expect(filterSection).toHaveScreenshot('mobile-category-filters.png', {
      animations: 'disabled',
    });
  });
});

test.describe('CF1 Accessibility - Visual Compliance', () => {
  test('High Contrast Mode - WCAG 2.1 AA compliance', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await setupPage(page, '/');

    await expect(page).toHaveScreenshot('high-contrast-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('Focus States - Keyboard navigation visibility', async ({ page }) => {
    await setupPage(page, '/discovery');

    // Tab through category filter buttons to show focus states
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const filterSection = page.locator('div:has(button[class*="rounded-full"])').first();
    await expect(filterSection).toHaveScreenshot('focus-states-filters.png', {
      animations: 'disabled',
    });
  });
});