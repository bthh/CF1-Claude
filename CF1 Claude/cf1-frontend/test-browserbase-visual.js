#!/usr/bin/env node

// test-browserbase-visual.js - Standalone Browserbase Visual Testing
import dotenv from 'dotenv';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.browserbase' });

// Create screenshots directory
const screenshotsDir = './screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runVisualTests() {
  console.log('🚀 Starting CF1 Visual Regression Tests with Browserbase...');

  const browserbaseUrl = process.env.BROWSERBASE_CONNECT_URL;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;

  console.log('📡 Project ID:', projectId);
  console.log('🔗 Connect URL:', browserbaseUrl ? 'Set' : 'Missing');

  if (!browserbaseUrl || !projectId) {
    console.error('❌ Missing Browserbase configuration');
    return;
  }

  let browser;
  const timeout = 60000; // 60 seconds

  try {
    console.log('⏱️  Connecting to Browserbase...');

    // Add timeout to connection
    const connectPromise = chromium.connect(browserbaseUrl);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), timeout)
    );

    browser = await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ Connected successfully!');

    // Test configurations
    const tests = [
      {
        name: 'homepage-desktop',
        url: 'https://rwa2.netlify.app/',
        viewport: { width: 1280, height: 720 },
        waitFor: '.heading-responsive-hero, [data-testid="dashboard-hero"]'
      },
      {
        name: 'homepage-tablet',
        url: 'https://rwa2.netlify.app/',
        viewport: { width: 768, height: 1024 },
        waitFor: '.heading-responsive-hero, [data-testid="dashboard-hero"]'
      },
      {
        name: 'homepage-mobile',
        url: 'https://rwa2.netlify.app/',
        viewport: { width: 375, height: 667 },
        waitFor: '.heading-responsive-hero, [data-testid="dashboard-hero"]'
      },
      {
        name: 'portfolio-desktop',
        url: 'https://rwa2.netlify.app/portfolio',
        viewport: { width: 1280, height: 720 },
        waitFor: '.heading-responsive-xl, [data-testid="portfolio-content"]'
      },
      {
        name: 'portfolio-mobile',
        url: 'https://rwa2.netlify.app/portfolio',
        viewport: { width: 375, height: 667 },
        waitFor: '.heading-responsive-xl, [data-testid="portfolio-content"]'
      },
      {
        name: 'launchpad-desktop',
        url: 'https://rwa2.netlify.app/launchpad',
        viewport: { width: 1280, height: 720 },
        waitFor: '.heading-responsive-xl, [data-testid="launchpad-content"]'
      }
    ];

    // Run all tests
    let successCount = 0;
    let failCount = 0;

    for (const test of tests) {
      try {
        console.log(`📸 Taking screenshot: ${test.name} (${test.viewport.width}x${test.viewport.height})`);

        const page = await browser.newPage();
        await page.setViewportSize(test.viewport);
        await page.goto(test.url, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });

        // Wait for content to load
        try {
          await page.waitForSelector(test.waitFor, { timeout: 15000 });
        } catch (e) {
          console.log(`⚠️  Selector not found for ${test.name}, proceeding anyway...`);
        }

        // Wait a bit more for any animations/loading
        await page.waitForTimeout(3000);

        // Take screenshot
        const screenshotPath = path.join(screenshotsDir, `${test.name}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
          animations: 'disabled'
        });

        console.log(`✅ Screenshot saved: ${screenshotPath}`);
        successCount++;

        await page.close();
      } catch (error) {
        console.error(`❌ Failed to capture ${test.name}:`, error.message);
        failCount++;
      }
    }

    console.log(`\n🎉 Visual testing complete!`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('👋 Browser session closed.');
    }
  }
}

// Run the tests
runVisualTests().catch(console.error);