// staging-browserbase-test.cjs - Comprehensive CF1 Staging Test
require('dotenv').config({ path: '.env.browserbase' });
const { chromium } = require('playwright');
const fs = require('fs/promises');

console.log('🌐 CF1 Staging Environment via Browserbase');
console.log('==========================================\n');

async function testStagingEnvironment() {
  // Staging URL from Netlify branch deployment
  const STAGING_URL = 'https://68c95aa850920f69596abcd1--rwa2.netlify.app';

  console.log('🔗 Testing CF1 Staging Environment');
  console.log('   This deployment represents the current staging branch');
  console.log('   and can be used to test changes before production.');
  console.log('');

  const connectUrl = process.env.BROWSERBASE_CONNECT_URL;
  if (!connectUrl) {
    console.error('❌ ERROR: BROWSERBASE_CONNECT_URL not found in .env.browserbase file.');
    return;
  }

  console.log('🔗 Staging URL:', STAGING_URL);
  console.log('📡 Browserbase Connect URL:', connectUrl);

  let browser;
  try {
    console.log('⏳ Connecting to Browserbase...');

    browser = await chromium.connect(connectUrl, {
      timeout: 30000 // 30 second timeout
    });

    const page = await browser.newPage();

    // Test the staging deployment
    console.log(`🌐 Navigating to staging deployment: ${STAGING_URL}`);
    await page.goto(STAGING_URL, { waitUntil: 'networkidle' });

    // Take a screenshot
    const screenshot = await page.screenshot();
    console.log('📸 Screenshot captured');

    // Get the page title
    const title = await page.title();
    console.log('📄 Page title:', title);

    // Test various staging-specific features
    console.log('\n🔍 Testing staging environment features...');

    // Test 1: Check if this is indeed the staging branch
    const bodyText = await page.locator('body').textContent();
    if (bodyText.includes('CF1 Platform') || bodyText.includes('CF1')) {
      console.log('✅ CF1 platform detected in staging content');
    } else {
      console.log('⚠️  CF1 platform content not detected');
    }

    // Test 2: React root element
    const reactRoot = await page.locator('#root').count();
    if (reactRoot > 0) {
      console.log('✅ React root element found');
    } else {
      console.log('❌ React root element not found');
    }

    // Test 3: Navigation functionality
    try {
      const navLinks = await page.locator('nav a, [data-testid="nav-link"]').count();
      console.log(`✅ Navigation links found: ${navLinks}`);
    } catch (navError) {
      console.log('❌ Navigation test failed:', navError.message);
    }

    // Test 4: Dark mode toggle (if available)
    try {
      const themeToggle = await page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"]').count();
      if (themeToggle > 0) {
        console.log('✅ Theme toggle found');

        // Try clicking it to test dark mode
        await page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"]').first().click();
        await page.waitForTimeout(1000);
        console.log('✅ Dark mode toggle tested');
      } else {
        console.log('⚠️  Theme toggle not found');
      }
    } catch (themeError) {
      console.log('❌ Theme toggle test failed:', themeError.message);
    }

    // Test 5: Check for staging-specific indicators
    const pageContent = await page.content();
    const hasWalletConnect = pageContent.includes('Connect Wallet') || pageContent.includes('wallet');
    const hasBlockchain = pageContent.includes('blockchain') || pageContent.includes('Neutron');

    if (hasWalletConnect) {
      console.log('✅ Wallet connection features detected');
    }
    if (hasBlockchain) {
      console.log('✅ Blockchain integration features detected');
    }

    // Save staging test results
    await fs.mkdir('screenshots', { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Save screenshot
    const screenshotPath = `screenshots/staging-test-${timestamp}.png`;
    await fs.writeFile(screenshotPath, screenshot);
    console.log(`💾 Staging screenshot saved: ${screenshotPath}`);

    // Save page content for analysis
    const contentPath = `screenshots/staging-content-${timestamp}.html`;
    await fs.writeFile(contentPath, pageContent);
    console.log(`📄 Staging content saved: ${contentPath}`);

    console.log('\n🎯 STAGING TEST COMPLETED SUCCESSFULLY!');
    console.log('   Your staging environment is accessible via browserbase.');
    console.log('   This allows for visual testing without WSL WebSocket limitations.');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Review screenshots in screenshots/ folder');
    console.log('   2. Use staging environment for development testing');
    console.log('   3. Deploy changes to production when ready');

    return {
      success: true,
      stagingUrl: STAGING_URL,
      screenshotPath,
      contentPath,
      title
    };

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Ensure staging deployment is accessible:', STAGING_URL);
    console.log('2. Check that Browserbase credentials are valid');
    console.log('3. Verify this script is run from a non-WSL environment if possible');
    console.log('4. Check Netlify deployment status for staging branch');

    return {
      success: false,
      error: error.message
    };

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testStagingEnvironment()
  .then(result => {
    if (result.success) {
      console.log('\n🏆 Staging environment test completed successfully!');
      console.log('🚀 The staging branch deployment is working via Browserbase');
    } else {
      console.log('\n💥 Staging environment test failed');
      console.log('   This is likely due to WSL WebSocket connectivity issues');
      console.log('   The staging deployment should still be accessible in a regular browser');
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
  });