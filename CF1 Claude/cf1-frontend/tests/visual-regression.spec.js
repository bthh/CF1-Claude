// tests/visual-regression.spec.js
import dotenv from 'dotenv';
import { test, expect, chromium } from '@playwright/test';
import { Browserbase } from '@browserbasehq/sdk';

// Load environment variables
dotenv.config({ path: '.env.browserbase' });

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY,
});

test.describe('CF1 Platform Visual Regression Tests', () => {
  let browser;
  let context;

  // Before all tests, connect to a Browserbase session
  test.beforeAll(async () => {
    console.log('🚀 Creating Browserbase session for visual testing...');
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      browserSettings: {
        viewport: { width: 1280, height: 720 }
      }
    });

    console.log('🔗 Connecting to session...');
    browser = await chromium.connectOverCDP(session.connectUrl, { timeout: 60000 });
    context = browser.contexts()[0];
    console.log('✅ Connected to Browserbase!');
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
      console.log('👋 Browserbase session closed.');
    }
  });

  // RESPONSIVE DESIGN VALIDATION TESTS

  test('Homepage - Desktop (1280px) - should match baseline', async () => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('https://rwa2.netlify.app/');

    // Wait for content to load
    await page.waitForSelector('[data-testid="dashboard-hero"], .heading-responsive-hero', { timeout: 10000 });

    await expect(page).toHaveScreenshot('homepage-desktop-1280.png', {
      fullPage: true,
      maxDiffPixels: 150,
      threshold: 0.2
    });

    await page.close();
  });

  test('Homepage - Tablet (768px) - should match baseline', async () => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('https://rwa2.netlify.app/');

    await page.waitForSelector('[data-testid="dashboard-hero"], .heading-responsive-hero', { timeout: 10000 });

    await expect(page).toHaveScreenshot('homepage-tablet-768.png', {
      fullPage: true,
      maxDiffPixels: 150,
      threshold: 0.2
    });

    await page.close();
  });

  test('Homepage - Mobile (375px) - should match baseline', async () => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://rwa2.netlify.app/');

    await page.waitForSelector('[data-testid="dashboard-hero"], .heading-responsive-hero', { timeout: 10000 });

    await expect(page).toHaveScreenshot('homepage-mobile-375.png', {
      fullPage: true,
      maxDiffPixels: 150,
      threshold: 0.2
    });

    await page.close();
  });

  test('Portfolio Page - Desktop - should match baseline', async () => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('https://rwa2.netlify.app/portfolio');

    // Wait for portfolio content or empty state
    await page.waitForSelector('[data-testid="portfolio-content"], .heading-responsive-xl', { timeout: 10000 });

    await expect(page).toHaveScreenshot('portfolio-desktop-1280.png', {
      fullPage: true,
      maxDiffPixels: 150,
      threshold: 0.2
    });

    await page.close();
  });

  test('Portfolio Page - Mobile - should match baseline', async () => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://rwa2.netlify.app/portfolio');

    await page.waitForSelector('[data-testid="portfolio-content"], .heading-responsive-xl', { timeout: 10000 });

    await expect(page).toHaveScreenshot('portfolio-mobile-375.png', {
      fullPage: true,
      maxDiffPixels: 150,
      threshold: 0.2
    });

    await page.close();
  });

  test('Launchpad Page - Desktop - should match baseline', async () => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('https://rwa2.netlify.app/launchpad');

    await page.waitForSelector('[data-testid="launchpad-content"], .heading-responsive-xl', { timeout: 10000 });

    await expect(page).toHaveScreenshot('launchpad-desktop-1280.png', {
      fullPage: true,
      maxDiffPixels: 150,
      threshold: 0.2
    });

    await page.close();
  });

  test('Launchpad Page - Mobile - should match baseline', async () => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://rwa2.netlify.app/launchpad');

    await page.waitForSelector('[data-testid="launchpad-content"], .heading-responsive-xl', { timeout: 10000 });

    await expect(page).toHaveScreenshot('launchpad-mobile-375.png', {
      fullPage: true,
      maxDiffPixels: 150,
      threshold: 0.2
    });

    await page.close();
  });

  // COMPONENT-SPECIFIC TESTS

  test('Button Components - should render consistently', async () => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('https://rwa2.netlify.app/');

    // Wait for buttons to load
    await page.waitForSelector('button, .btn-responsive-md', { timeout: 10000 });

    // Focus on the hero section with buttons
    const heroSection = await page.locator('[data-testid="dashboard-hero"], .container-responsive').first();

    await expect(heroSection).toHaveScreenshot('button-components-hero.png', {
      maxDiffPixels: 100,
      threshold: 0.2
    });

    await page.close();
  });

  test('Card Components - should render consistently', async () => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('https://rwa2.netlify.app/');

    // Wait for cards to load
    await page.waitForSelector('.card-responsive, [data-testid="action-cards"]', { timeout: 10000 });

    // Focus on the quick actions section
    const actionsSection = await page.locator('[data-testid="quick-actions"], section').nth(1);

    await expect(actionsSection).toHaveScreenshot('card-components-actions.png', {
      maxDiffPixels: 100,
      threshold: 0.2
    });

    await page.close();
  });

  // TYPOGRAPHY SCALING TEST

  test('Typography Scaling - Cross-Viewport Consistency', async () => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' },
      { width: 1920, height: 1080, name: 'large-desktop' }
    ];

    for (const viewport of viewports) {
      const page = await context.newPage();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('https://rwa2.netlify.app/');

      await page.waitForSelector('.heading-responsive-hero', { timeout: 10000 });

      // Focus on typography elements
      const typographySection = await page.locator('.heading-responsive-hero').first();

      await expect(typographySection).toHaveScreenshot(`typography-${viewport.name}-${viewport.width}.png`, {
        maxDiffPixels: 100,
        threshold: 0.2
      });

      await page.close();
    }
  });
});