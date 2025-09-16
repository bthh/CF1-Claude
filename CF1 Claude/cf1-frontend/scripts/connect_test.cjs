// connect_test.js
require('dotenv').config({ path: '.env.browserbase' });
const { chromium } = require('playwright');

async function runConnectionTest() {
  console.log('--- Browserbase Connection Test ---');
  const connectUrl = process.env.BROWSERBASE_CONNECT_URL;

  if (!connectUrl) {
    console.error('❌ ERROR: BROWSERBASE_CONNECT_URL not found in .env.browserbase file.');
    return;
  }

  console.log(`🌍 Attempting to connect to: ${connectUrl.split('?')[0]}...`);

  let browser;
  try {
    // Set a specific timeout for the connection attempt (e.g., 30 seconds)
    browser = await chromium.connect(connectUrl, { timeout: 30000 });
    console.log('✅ SUCCESS: Connected to Browserbase successfully!');

    const page = await browser.newPage();
    console.log('✅ SUCCESS: Browser page opened.');

    await page.setContent('<h1>Connection successful!</h1>');
    console.log('✅ SUCCESS: Page content set.');

    console.log('\n--- Test Passed ---');

  } catch (error) {
    console.error('\n❌ ERROR: Failed to connect to Browserbase.');
    console.error('------------------------------------------');
    console.error(`Error Type: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    console.error('------------------------------------------');
    console.log('\n📋 Troubleshooting Steps:');
    console.log('1. Double-check your BROWSERBASE_API_KEY in the .env.browserbase file.');
    console.log('2. Ensure there are no firewall or proxy issues in your WSL environment blocking WebSocket (wss://) connections.');
    console.log('3. Verify your project is active on the Browserbase dashboard.');
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔌 Connection closed.');
    }
  }
}

runConnectionTest();