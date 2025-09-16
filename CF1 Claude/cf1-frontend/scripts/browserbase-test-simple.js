/**
 * Simplified Browserbase connection test
 */

import dotenv from 'dotenv';
import { chromium } from 'playwright';
import fs from 'fs/promises';

dotenv.config({ path: '.env.browserbase' });

async function testBrowserbaseSimple() {
  console.log('🔗 Starting simple Browserbase test...');
  
  const browserbaseUrl = process.env.BROWSERBASE_CONNECT_URL;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;
  
  console.log('📡 Project ID:', projectId);
  console.log('🔗 Connect URL:', browserbaseUrl ? 'Set' : 'Missing');
  
  if (!browserbaseUrl || !projectId) {
    console.error('❌ Missing Browserbase configuration');
    return;
  }
  
  let browser;
  const timeout = 30000; // 30 seconds
  
  try {
    console.log('⏱️  Connecting with 30s timeout...');
    
    // Add timeout to connection
    const connectPromise = chromium.connect(browserbaseUrl);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), timeout)
    );
    
    browser = await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ Connected to Browserbase!');
    
    const page = await browser.newPage();
    console.log('📄 New page created');
    
    // Quick test with example.com
    console.log('🌐 Loading example.com...');
    await page.goto('https://example.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    const title = await page.title();
    console.log(`📝 Page title: "${title}"`);
    
    // Quick screenshot
    const screenshot = await page.screenshot({ type: 'png' });
    console.log(`📸 Screenshot: ${screenshot.length} bytes`);
    
    // Save to file
    await fs.mkdir('screenshots', { recursive: true });
    await fs.writeFile('screenshots/example-test.png', screenshot);
    console.log('💾 Screenshot saved: screenshots/example-test.png');
    
    console.log('🎉 Test successful!');
    return { success: true, title };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔍 Error details:', error.stack);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('🔌 Browser closed');
      } catch (closeError) {
        console.warn('⚠️  Browser close error:', closeError.message);
      }
    }
  }
}

// Run the test
testBrowserbaseSimple()
  .then(result => {
    console.log('🏁 Final result:', result);
    process.exit(result && result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });