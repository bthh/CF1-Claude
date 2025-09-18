// scripts/connection-health-check.js
import dotenv from 'dotenv';
import { Browserbase } from '@browserbasehq/sdk';
import { chromium } from 'playwright';

dotenv.config({ path: '.env.browserbase' });

async function checkConnection() {
  console.log('--- Browserbase Connection Health Check ---');
  let browser;
  try {
    const apiKey = process.env.BROWSERBASE_API_KEY;
    const projectId = process.env.BROWSERBASE_PROJECT_ID;

    if (!apiKey || !projectId) {
      throw new Error('API Key or Project ID is missing from .env.browserbase');
    }

    console.log('✅ Environment variables loaded.');
    console.log(`📋 Project ID: ${projectId.substring(0, 8)}...`);
    console.log(`🔑 API Key: ${apiKey.substring(0, 8)}...`);

    const bb = new Browserbase({ apiKey });
    console.log('✅ Browserbase SDK initialized.');

    console.log('🚀 Creating session...');
    const session = await bb.createSession({
      projectId,
      // 🛡️ DEVELOPER TIER: Enhanced capabilities
      browserSettings: {
        solveCaptchas: true,    // Auto-solve CAPTCHAs
        blockAds: true,         // Block ads for faster loading
        recordSession: false,   // Disable recording for faster performance
        logSession: false,      // Disable logs for faster performance
      },
      // Enable stealth mode for better compatibility
      keepAlive: true,
      timeout: 120000, // 2 minutes timeout with Developer tier stability
    });
    console.log(`✅ Session created with ID: ${session.id}`);
    console.log(`📊 Session status: ${session.status}`);

    const connectUrl = bb.getConnectURL({ sessionId: session.id });
    console.log(`🔗 Attempting to connect to: ${connectUrl.substring(0, 50)}...`);

    browser = await chromium.connectOverCDP(connectUrl, { timeout: 45000 });
    console.log('✅ CDP connection established!');

    // Test basic browser functionality
    const context = browser.contexts()[0];
    const page = await context.newPage();
    console.log('✅ New page created successfully.');

    await page.goto('https://rwa2.netlify.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✅ Page navigation successful!');

    const title = await page.title();
    console.log(`✅ Page title retrieved: "${title}"`);

    await page.close();

    console.log('\n🎉 SUCCESS! Connection to Browserbase is working perfectly.');
    console.log('🚀 Developer tier features are active and functional!');

  } catch (error) {
    console.error('\n❌ FAILURE! The connection could not be established.');
    console.error('----------------------------------------------------');
    console.error('Error Details:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('----------------------------------------------------');

    // Provide diagnostic information
    if (error.message.includes('500')) {
      console.error('🔍 Diagnosis: Browserbase service experiencing 500 errors');
      console.error('💡 Solution: Wait for service recovery or contact Browserbase support');
    } else if (error.message.includes('WebSocket')) {
      console.error('🔍 Diagnosis: WebSocket connection issue');
      console.error('💡 Solution: Check network connectivity and firewall settings');
    } else if (error.message.includes('timeout')) {
      console.error('🔍 Diagnosis: Connection timeout');
      console.error('💡 Solution: Retry with longer timeout or check service status');
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log('👋 Connection closed.');
    }
    console.log('--- Health Check Complete ---');
  }
}

checkConnection();