// Local visual analysis test for CF1 Platform at localhost:5173
import { test, expect } from '@playwright/test';

test.describe('CF1 Platform Local Visual Analysis', () => {
  const baseURL = 'http://localhost:5173';

  // Test different viewport sizes to identify "zoomed in" issues
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' },
    { width: 1920, height: 1080, name: 'large-desktop' }
  ];

  const pages = [
    { path: '/', name: 'dashboard' },
    { path: '/portfolio', name: 'portfolio' },
    { path: '/launchpad', name: 'launchpad' },
    { path: '/marketplace', name: 'marketplace' },
    { path: '/governance', name: 'governance' }
  ];

  // Test each page at each viewport size
  for (const viewport of viewports) {
    for (const pageDef of pages) {
      test(`${pageDef.name} page at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        try {
          await page.goto(`${baseURL}${pageDef.path}`, {
            waitUntil: 'networkidle',
            timeout: 15000
          });

          // Wait for main content to load
          await page.waitForSelector('main', { timeout: 10000 });

          // Wait a bit more for any dynamic content
          await page.waitForTimeout(2000);

          // Take full page screenshot
          const screenshot = await page.screenshot({
            fullPage: true,
            path: `screenshots/${pageDef.name}-${viewport.name}-${viewport.width}px.png`
          });

          console.log(`✅ Screenshot saved: ${pageDef.name}-${viewport.name}-${viewport.width}px.png`);

        } catch (error) {
          console.log(`❌ Failed to capture ${pageDef.name} at ${viewport.name}: ${error.message}`);

          // Try to take a screenshot anyway for analysis
          try {
            await page.screenshot({
              fullPage: true,
              path: `screenshots/FAILED-${pageDef.name}-${viewport.name}-${viewport.width}px.png`
            });
          } catch (screenshotError) {
            console.log(`Failed to take error screenshot: ${screenshotError.message}`);
          }
        }
      });
    }
  }

  // Test component density on dashboard
  test('component density analysis - dashboard hero section', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${baseURL}/`);

    await page.waitForSelector('main', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Focus on hero section for density analysis
    const hero = page.locator('div[class*="container-responsive"]').first();
    if (await hero.count() > 0) {
      await hero.screenshot({ path: 'screenshots/density-hero-section.png' });
    }

    // Focus on quick actions cards
    const cards = page.locator('div[class*="card-responsive"]').first();
    if (await cards.count() > 0) {
      await cards.screenshot({ path: 'screenshots/density-card-components.png' });
    }

    console.log('✅ Component density screenshots captured');
  });

  // Test typography scaling
  test('typography scaling analysis', async ({ page }) => {
    const typographyViewports = [375, 768, 1280, 1920];

    for (const width of typographyViewports) {
      await page.setViewportSize({ width, height: Math.floor(width * 0.6) });
      await page.goto(`${baseURL}/`);

      await page.waitForSelector('main', { timeout: 10000 });
      await page.waitForTimeout(1000);

      // Focus on main heading elements
      const heading = page.locator('h1').first();
      if (await heading.count() > 0) {
        await heading.screenshot({ path: `screenshots/typography-h1-${width}px.png` });
      }

      // Focus on body text
      const paragraph = page.locator('p').first();
      if (await paragraph.count() > 0) {
        await paragraph.screenshot({ path: `screenshots/typography-p-${width}px.png` });
      }
    }

    console.log('✅ Typography scaling screenshots captured');
  });
});