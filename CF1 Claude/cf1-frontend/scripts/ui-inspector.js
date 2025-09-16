/**
 * CF1 Frontend - UI Visual Inspector
 * Uses Browserbase to capture screenshots and analyze UI components
 */

require('dotenv').config({ path: '.env.browserbase' });
const { chromium } = require('playwright');
const fs = require('fs/promises');
const path = require('path');

class UIInspector {
  constructor() {
    this.browserbaseUrl = process.env.BROWSERBASE_CONNECT_URL;
    this.projectId = process.env.BROWSERBASE_PROJECT_ID;
    
    if (!this.browserbaseUrl || !this.projectId) {
      throw new Error('Missing Browserbase configuration. Check .env.browserbase file.');
    }
    
    console.log('🔍 UI Inspector initialized');
    console.log(`📡 Project ID: ${this.projectId}`);
  }

  /**
   * Capture screenshot of a URL using Browserbase
   */
  async captureScreenshot(url, options = {}) {
    const {
      fullPage = true,
      waitFor = 'domcontentloaded',
      viewport = { width: 1280, height: 720 },
      outputPath = 'screenshots'
    } = options;

    console.log(`📸 Capturing screenshot of: ${url}`);
    
    let browser;
    try {
      // Connect to Browserbase
      browser = await chromium.connect(this.browserbaseUrl);
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewportSize(viewport);
      
      // Navigate to URL
      await page.goto(url, { waitUntil: waitFor, timeout: 30000 });
      
      // Wait a moment for any animations to settle
      await page.waitForTimeout(2000);
      
      // Take screenshot
      const screenshotBuffer = await page.screenshot({ 
        fullPage,
        type: 'png'
      });
      
      // Save screenshot locally
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${timestamp}.png`;
      const fullPath = path.join(outputPath, filename);
      
      await fs.mkdir(outputPath, { recursive: true });
      await fs.writeFile(fullPath, screenshotBuffer);
      
      console.log(`✅ Screenshot saved: ${fullPath}`);
      
      // Also get page content for analysis
      const pageContent = await page.content();
      const contentPath = path.join(outputPath, `content-${timestamp}.html`);
      await fs.writeFile(contentPath, pageContent);
      
      console.log(`📄 Page content saved: ${contentPath}`);
      
      return {
        screenshotPath: fullPath,
        contentPath,
        screenshotBuffer,
        pageContent,
        url,
        timestamp
      };
      
    } catch (error) {
      console.error('❌ Screenshot capture failed:', error.message);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Capture screenshots of multiple pages/states
   */
  async captureMultiple(urls, options = {}) {
    const results = [];
    
    for (const url of urls) {
      try {
        const result = await this.captureScreenshot(url, options);
        results.push(result);
        
        // Wait between captures to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to capture ${url}:`, error.message);
        results.push({ url, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Capture specific UI component states
   */
  async captureComponentStates(baseUrl, states = []) {
    const urls = states.map(state => `${baseUrl}${state.path}`);
    const results = await this.captureMultiple(urls);
    
    // Create a summary report
    const report = {
      baseUrl,
      captureTime: new Date().toISOString(),
      states: states.map((state, index) => ({
        ...state,
        result: results[index]
      }))
    };
    
    const reportPath = path.join('screenshots', `ui-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 UI Report saved: ${reportPath}`);
    return report;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const inspector = new UIInspector();
  
  switch (command) {
    case 'capture':
      const url = args[1] || 'http://localhost:5173';
      await inspector.captureScreenshot(url);
      break;
      
    case 'inspect-cf1':
      // Pre-defined CF1 frontend states to capture
      const cf1States = [
        { name: 'Landing Page', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Create Proposal', path: '/create-proposal' },
        { name: 'Admin Login', path: '/admin' },
        { name: 'Marketplace', path: '/marketplace' },
        { name: 'Portfolio', path: '/portfolio' }
      ];
      
      console.log('🎯 Inspecting CF1 Frontend states...');
      await inspector.captureComponentStates('http://localhost:5173', cf1States);
      break;
      
    case 'help':
    default:
      console.log(`
🔍 CF1 UI Inspector - Browserbase Integration

Usage:
  node scripts/ui-inspector.js [command] [options]

Commands:
  capture [url]     Capture screenshot of specific URL (default: http://localhost:5173)
  inspect-cf1       Capture all main CF1 frontend states
  help              Show this help message

Examples:
  node scripts/ui-inspector.js capture
  node scripts/ui-inspector.js capture http://localhost:5173/dashboard
  node scripts/ui-inspector.js inspect-cf1

Note: Make sure your frontend is running on http://localhost:5173
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = UIInspector;