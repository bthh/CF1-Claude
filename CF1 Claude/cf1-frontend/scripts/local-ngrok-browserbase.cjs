// Browserbase script for local development via ngrok tunnel
require('dotenv').config({ path: '.env.browserbase' });
const { chromium } = require('playwright');

console.log('🌐 CF1 Local Development via Ngrok Tunnel Test');
console.log('==========================================\n');

async function testLocalSiteViaNgrok() {
  // You would replace this with your actual ngrok URL
  const NGROK_URL = process.env.NGROK_URL || 'https://YOUR-NGROK-URL.ngrok.io';

  if (NGROK_URL === 'https://YOUR-NGROK-URL.ngrok.io') {
    console.log('❌ No ngrok URL configured');
    console.log('   1. Install ngrok: https://ngrok.com/download');
    console.log('   2. Run: ./ngrok http 5173');
    console.log('   3. Copy the https URL and set NGROK_URL environment variable');
    console.log('   4. Or add NGROK_URL=https://abc123.ngrok.io to .env.browserbase');
    return;
  }

  const connectUrl = process.env.BROWSERBASE_CONNECT_URL;
  if (!connectUrl) {
    console.error('❌ ERROR: BROWSERBASE_CONNECT_URL not found in .env.browserbase file.');
    return;
  }

  console.log('🔗 Ngrok URL:', NGROK_URL);
  console.log('📡 Browserbase Connect URL:', connectUrl);

  let browser;
  try {
    console.log('⏳ Connecting to Browserbase (via ngrok)...');

    browser = await chromium.connect(connectUrl, {
      timeout: 30000 // 30 second timeout
    });

    const page = await browser.newPage();

    // Test the ngrok tunnel to your local development server
    console.log(`🌐 Navigating to local dev server via ngrok: ${NGROK_URL}`);
    await page.goto(NGROK_URL, { waitUntil: 'networkidle' });

    // Take a screenshot
    const screenshot = await page.screenshot();
    console.log('📸 Screenshot captured');

    // Get the page title
    const title = await page.title();
    console.log('📄 Page title:', title);

    // Check if the page loaded properly
    const bodyText = await page.locator('body').textContent();
    if (bodyText.includes('CF1 Platform') || bodyText.includes('CF1')) {
      console.log('✅ CF1 platform detected in page content');
    } else {
      console.log('⚠️  CF1 platform content not detected');
    }

    // Test if we can find React root element
    const reactRoot = await page.locator('#root').count();
    if (reactRoot > 0) {
      console.log('✅ React root element found');
    } else {
      console.log('❌ React root element not found');
    }

    console.log('\n🎯 Test completed successfully!');
    console.log('   Your local CF1 development server is accessible via browserbase');
    console.log('   through the ngrok tunnel.');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Ensure ngrok is running: ./ngrok http 5173');
    console.log('2. Verify the ngrok URL is correct and accessible');
    console.log('3. Check that your local dev server is running on port 5173');
    console.log('4. Ensure BROWSERBASE_CONNECT_URL is valid in .env.browserbase');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testLocalSiteViaNgrok();