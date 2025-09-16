// browserbase-diagnostic.js
import dotenv from 'dotenv';
import { chromium } from 'playwright';

dotenv.config({ path: '.env.browserbase' });

async function runDiagnostics() {
  console.log('🔍 Browserbase Connection Diagnostics');
  console.log('=====================================\\n');
  
  // 1. Check environment variables
  console.log('1. Environment Variables:');
  console.log(`   PROJECT_ID: ${process.env.BROWSERBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   API_KEY: ${process.env.BROWSERBASE_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   CONNECT_URL: ${process.env.BROWSERBASE_CONNECT_URL ? '✅ Set' : '❌ Missing'}`);
  
  if (process.env.BROWSERBASE_CONNECT_URL) {
    console.log(`   URL Format: ${process.env.BROWSERBASE_CONNECT_URL}\\n`);
  }
  
  // 2. Test network connectivity
  console.log('2. Network Connectivity Test:');
  try {
    const response = await fetch('https://connect.browserbase.com', { 
      method: 'HEAD',
      timeout: 10000 
    });
    console.log(`   Browserbase reachable: ✅ ${response.status}`);
  } catch (error) {
    console.log(`   Browserbase reachable: ❌ ${error.message}`);
  }
  
  // 3. Test WebSocket connection
  console.log('\\n3. WebSocket Connection Test:');
  
  if (!process.env.BROWSERBASE_CONNECT_URL) {
    console.log('   ❌ Cannot test - CONNECT_URL not set');
    return;
  }
  
  let browser;
  const connectionTests = [
    { timeout: 10000, name: '10 second timeout' },
    { timeout: 30000, name: '30 second timeout' },
    { timeout: 60000, name: '60 second timeout' }
  ];
  
  for (const test of connectionTests) {
    console.log(`\\n   Testing with ${test.name}:`);
    try {
      const startTime = Date.now();
      
      console.log('     → Attempting connection...');
      browser = await chromium.connect(process.env.BROWSERBASE_CONNECT_URL, {
        timeout: test.timeout
      });
      
      const connectTime = Date.now() - startTime;
      console.log(`     ✅ Connected successfully in ${connectTime}ms`);
      
      // Test basic page creation
      console.log('     → Testing page creation...');
      const page = await browser.newPage();
      console.log('     ✅ Page created successfully');
      
      // Test simple navigation
      console.log('     → Testing navigation...');
      await page.goto('data:text/html,<h1>Test</h1>');
      console.log('     ✅ Navigation successful');
      
      // Test screenshot
      console.log('     → Testing screenshot...');
      const screenshot = await page.screenshot({ type: 'png' });
      console.log(`     ✅ Screenshot captured: ${screenshot.length} bytes`);
      
      await browser.close();
      console.log(`     ✅ Full test successful with ${test.name}`);
      
      // If we get here, connection is working
      return true;
      
    } catch (error) {
      console.log(`     ❌ Failed with ${test.name}: ${error.message}`);
      
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          // Ignore close errors
        }
        browser = null;
      }
    }
  }
  
  // 4. Additional debugging info
  console.log('\\n4. Additional Debug Information:');
  console.log(`   Node.js version: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  console.log(`   Playwright version: ${require('playwright/package.json').version}`);
  
  // 5. Suggestions
  console.log('\\n5. Troubleshooting Suggestions:');
  console.log('   • Verify your Browserbase API key is active');
  console.log('   • Check if your Browserbase project is properly configured');
  console.log('   • Ensure your network allows WebSocket connections');
  console.log('   • Try regenerating your API key in Browserbase dashboard');
  console.log('   • Check Browserbase status page for any outages');
  
  return false;
}

// 6. Create a fallback local screenshot for comparison
async function createFallbackDemo() {
  console.log('\\n6. Creating Fallback Local Demo:');
  
  try {
    // Try local browser (might not work in WSL without dependencies)
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial; background: #f0f0f0; padding: 50px; }
            .demo { background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: 0 auto; }
            h1 { color: #333; text-align: center; }
            button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="demo">
            <h1>Local Demo</h1>
            <p>This is a local screenshot test</p>
            <button>Click Me</button>
          </div>
        </body>
      </html>
    `);
    
    const screenshot = await page.screenshot({ type: 'png' });
    
    await fs.mkdir('screenshots', { recursive: true });
    await fs.writeFile('screenshots/local-demo.png', screenshot);
    
    await browser.close();
    
    console.log('   ✅ Local demo screenshot created: screenshots/local-demo.png');
    return true;
    
  } catch (error) {
    console.log(`   ❌ Local browser failed: ${error.message}`);
    console.log('   (This is expected in WSL without browser dependencies)');
    return false;
  }
}

// Run diagnostics
runDiagnostics()
  .then(async (success) => {
    if (!success) {
      await createFallbackDemo();
    }
    
    console.log('\\n🏁 Diagnostics Complete');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Diagnostic failed:', error);
    process.exit(1);
  });