// scripts/capture_example.cjs
require('dotenv').config({ path: '.env.browserbase' });
const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_URL = 'https://stripe.com';
const OUTPUT_FILE = 'stripe_screenshot.png';

async function captureExample() {
  console.log('--- Capturing Webpage Example ---');
  console.log(`🎯 Target: ${TARGET_URL}`);
  console.log(`📸 Output: ${OUTPUT_FILE}`);
  
  let browser;

  try {
    console.log(`🌍 Connecting to Browserbase...`);
    browser = await chromium.connect(process.env.BROWSERBASE_CONNECT_URL, { 
      timeout: 60000 
    });
    
    console.log(`✅ Connected! Creating new page...`);
    const page = await browser.newPage();
    
    // Set desktop viewport for consistent capture
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log(`📱 Viewport set to 1920x1080`);
    
    console.log(`🔗 Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log(`✅ Page loaded! Taking full-page screenshot...`);
    const screenshotBuffer = await page.screenshot({ 
      path: OUTPUT_FILE, 
      fullPage: true,
      type: 'png'
    });
    
    console.log(`📊 Screenshot size: ${Math.round(screenshotBuffer.length / 1024)} KB`);
    
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log(`✅ SUCCESS: Screenshot saved as ${OUTPUT_FILE}`);
      console.log(`📁 File location: ${process.cwd()}/${OUTPUT_FILE}`);
    } else {
      throw new Error('Screenshot file was not created.');
    }

  } catch (error) {
    console.error(`❌ ERROR: Failed to capture screenshot`);
    console.error(`Error Type: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    
    if (error.message.includes('Timeout')) {
      console.log('📋 This appears to be a connection timeout.');
      console.log('The WebSocket connection to Browserbase is timing out.');
      console.log('This is likely due to WSL networking restrictions.');
      console.log('');
      console.log('💡 To resolve this issue:');
      console.log('1. Run this script from Windows PowerShell instead of WSL');
      console.log('2. Or use a cloud development environment like GitHub Codespaces');
    }
    
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

captureExample();