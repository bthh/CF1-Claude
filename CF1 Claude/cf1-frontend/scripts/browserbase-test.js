/**
 * Simple Browserbase connection test
 */

import dotenv from 'dotenv';
import { chromium } from 'playwright';
import fs from 'fs/promises';

dotenv.config({ path: '.env.browserbase' });

async function testBrowserbase() {
  console.log('🔗 Testing Browserbase connection...');
  
  const browserbaseUrl = process.env.BROWSERBASE_CONNECT_URL;
  console.log('📡 Connecting to:', browserbaseUrl);
  
  let browser;
  try {
    // Connect to Browserbase
    browser = await chromium.connect(browserbaseUrl);
    console.log('✅ Connected to Browserbase successfully!');
    
    const page = await browser.newPage();
    console.log('📄 Created new page');
    
    // Test with a simple public URL first
    console.log('🌐 Testing with public URL...');
    await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
    
    const title = await page.title();
    console.log(`📝 Page title: ${title}`);
    
    // Take a test screenshot
    const screenshot = await page.screenshot({ type: 'png' });
    console.log(`📸 Screenshot captured: ${screenshot.length} bytes`);
    
    // Try to access your production CF1 site
    console.log('🚀 Testing CF1 production site...');
    await page.goto('https://rwa2.netlify.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const cf1Title = await page.title();
    console.log(`🎯 CF1 site title: ${cf1Title}`);
    
    // Take screenshot of CF1 site
    const cf1Screenshot = await page.screenshot({ 
      type: 'png',
      fullPage: true 
    });
    
    // Save the screenshot
    await fs.mkdir('screenshots', { recursive: true });
    await fs.writeFile('screenshots/cf1-production.png', cf1Screenshot);
    
    console.log('✅ CF1 production screenshot saved to screenshots/cf1-production.png');
    
    return {
      success: true,
      title: cf1Title,
      screenshotSize: cf1Screenshot.length
    };
    
  } catch (error) {
    console.error('❌ Browserbase test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔌 Browser connection closed');
    }
  }
}

testBrowserbase().then(result => {
  console.log('🏁 Test completed:', result);
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});