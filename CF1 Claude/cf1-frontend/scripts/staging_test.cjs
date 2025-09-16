// staging_test.cjs - CF1 Staging Environment Test via Browserbase
require('dotenv').config({ path: '.env.browserbase' });
const { chromium } = require('playwright');
const fs = require('fs/promises');

async function testStagingSite() {
  console.log('--- CF1 Staging Environment Test via Browserbase ---');
  const connectUrl = process.env.BROWSERBASE_CONNECT_URL;
  const stagingUrl = 'https://68c95aa850920f69596abcd1--rwa2.netlify.app/';

  if (!connectUrl) {
    console.error('❌ ERROR: BROWSERBASE_CONNECT_URL not found in .env.browserbase file.');
    return;
  }

  console.log(`🌍 Connecting to Browserbase...`);
  console.log(`🎯 Target URL: ${stagingUrl}`);
  console.log('📦 Environment: STAGING (staging branch deployment)');

  let browser;
  try {
    // Connect to Browserbase
    browser = await chromium.connect(connectUrl, { timeout: 45000 });
    console.log('✅ SUCCESS: Connected to Browserbase!');

    const page = await browser.newPage();
    console.log('✅ SUCCESS: Browser page created.');

    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log('📱 Viewport set to 1920x1080');

    // Navigate to CF1 staging site
    console.log(`🔗 Loading ${stagingUrl}...`);
    await page.goto(stagingUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log('✅ SUCCESS: Page loaded!');

    // Get page info
    const title = await page.title();
    const url = page.url();
    console.log(`📄 Page title: "${title}"`);
    console.log(`🔗 Final URL: ${url}`);

    // Wait for content to settle
    await page.waitForTimeout(3000);

    // Take screenshot
    console.log('📸 Taking screenshot...');
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true
    });
    console.log(`✅ Screenshot captured: ${Math.round(screenshot.length / 1024)} KB`);

    // Save screenshot
    await fs.mkdir('screenshots', { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `screenshots/cf1-staging-${timestamp}.png`;
    await fs.writeFile(screenshotPath, screenshot);
    console.log(`💾 Screenshot saved: ${screenshotPath}`);

    // Get page content for analysis
    const content = await page.content();
    const contentPath = `screenshots/cf1-staging-content-${timestamp}.html`;
    await fs.writeFile(contentPath, content);
    console.log(`📄 Page content saved: ${contentPath}`);

    // Test additional pages
    const testPages = [
      '/dashboard',
      '/marketplace',
      '/portfolio',
      '/create-proposal',
      '/admin'
    ];

    console.log(`\n🔍 Testing additional staging pages...`);

    for (const pagePath of testPages) {
      try {
        console.log(`  → Testing ${pagePath}...`);
        await page.goto(`${stagingUrl}${pagePath}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        });

        await page.waitForTimeout(2000);

        const pageScreenshot = await page.screenshot({ type: 'png' });
        const pageScreenshotPath = `screenshots/cf1-staging${pagePath.replace('/', '-')}-${timestamp}.png`;
        await fs.writeFile(pageScreenshotPath, pageScreenshot);

        console.log(`    ✅ ${pagePath}: ${Math.round(pageScreenshot.length / 1024)} KB saved`);

      } catch (pageError) {
        console.log(`    ❌ ${pagePath}: ${pageError.message}`);
      }
    }

    // Test dark mode functionality
    console.log(`\n🌙 Testing dark mode toggle...`);
    try {
      await page.goto(stagingUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Look for dark mode toggle button
      const darkModeButton = await page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"], button[aria-label*="dark"]').first();
      if (await darkModeButton.count() > 0) {
        await darkModeButton.click();
        await page.waitForTimeout(1000);

        const darkModeScreenshot = await page.screenshot({ type: 'png' });
        const darkModeScreenshotPath = `screenshots/cf1-staging-darkmode-${timestamp}.png`;
        await fs.writeFile(darkModeScreenshotPath, darkModeScreenshot);
        console.log(`    ✅ Dark mode: ${Math.round(darkModeScreenshot.length / 1024)} KB saved`);
      } else {
        console.log(`    ❌ Dark mode toggle not found`);
      }
    } catch (darkModeError) {
      console.log(`    ❌ Dark mode test: ${darkModeError.message}`);
    }

    console.log('\n🎉 STAGING TEST SUCCESSFUL!');
    console.log('=====================================');
    console.log(`📊 Screenshots saved in: screenshots/`);
    console.log(`🎯 Main page: ${screenshotPath}`);
    console.log(`📱 Resolution: 1920x1080`);
    console.log(`🌐 Staging Site: ${stagingUrl}`);
    console.log(`🔧 Environment: staging branch`);

    return {
      success: true,
      screenshotPath,
      contentPath,
      title,
      screenshotSize: screenshot.length,
      environment: 'staging'
    };

  } catch (error) {
    console.error('\n❌ ERROR: Failed to test staging site.');
    console.error('------------------------------------------');
    console.error(`Error Type: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    console.error('------------------------------------------');

    if (error.message.includes('Timeout')) {
      console.log('\n📋 This appears to be a connection timeout.');
      console.log('The WebSocket connection to Browserbase is timing out.');
      console.log('This is likely due to WSL networking restrictions.');
    } else {
      console.log('\n📋 Troubleshooting Steps:');
      console.log(`1. Verify the staging site is accessible: ${stagingUrl}`);
      console.log('2. Check your Browserbase project settings');
      console.log('3. Ensure your API key has proper permissions');
      console.log('4. Try running from a non-WSL environment');
    }

    return { success: false, error: error.message };

  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('🔌 Browser connection closed.');
      } catch (closeError) {
        console.warn('⚠️ Warning: Error closing browser connection');
      }
    }
  }
}

// Run the test
testStagingSite()
  .then(result => {
    if (result.success) {
      console.log('\n🏆 CF1 staging site successfully captured via Browserbase!');
      console.log('🚀 This staging environment can be used to test development changes');
      console.log('   before deploying to production at https://rwa2.netlify.app/');
      process.exit(0);
    } else {
      console.log('\n💥 Test failed - see error details above');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });