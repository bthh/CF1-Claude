/**
 * CF1 Visual Inspector - Production Site Analysis
 * Uses Browserbase to capture and analyze CF1 frontend
 */

import dotenv from 'dotenv';
import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

dotenv.config({ path: '.env.browserbase' });

class CF1VisualInspector {
  constructor() {
    this.browserbaseUrl = process.env.BROWSERBASE_CONNECT_URL;
    this.projectId = process.env.BROWSERBASE_PROJECT_ID;
    
    console.log('🎯 CF1 Visual Inspector initialized');
    console.log('📡 Project ID:', this.projectId);
  }

  /**
   * Capture screenshots of CF1 production site
   */
  async inspectProduction() {
    const baseUrl = 'https://rwa2.netlify.app';
    const pages = [
      { name: 'Landing', path: '/', description: 'Main landing page' },
      { name: 'Dashboard', path: '/dashboard', description: 'User dashboard' },
      { name: 'Marketplace', path: '/marketplace', description: 'Asset marketplace' },
      { name: 'Portfolio', path: '/portfolio', description: 'User portfolio' },
      { name: 'Create Proposal', path: '/create-proposal', description: 'Proposal creation' },
      { name: 'Admin', path: '/admin', description: 'Admin interface' },
    ];

    console.log('🚀 Inspecting CF1 Production Site');
    console.log('🌐 Base URL:', baseUrl);
    
    const results = [];
    let browser;
    
    try {
      // Connect to Browserbase with longer timeout
      console.log('🔗 Connecting to Browserbase...');
      browser = await chromium.connect(this.browserbaseUrl, {
        timeout: 60000  // 60 second timeout
      });
      
      console.log('✅ Connected successfully!');
      
      for (const page of pages) {
        try {
          console.log(`\\n📸 Capturing: ${page.name} - ${page.description}`);
          
          const browserPage = await browser.newPage();
          
          // Set a reasonable viewport
          await browserPage.setViewportSize({ width: 1920, height: 1080 });
          
          const fullUrl = `${baseUrl}${page.path}`;
          console.log(`🔗 Loading: ${fullUrl}`);
          
          // Navigate with timeout
          await browserPage.goto(fullUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
          });
          
          // Wait for any loading to complete
          await browserPage.waitForTimeout(3000);
          
          // Capture screenshot
          const screenshot = await browserPage.screenshot({
            type: 'png',
            fullPage: true
          });
          
          // Save screenshot
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `cf1-${page.name.toLowerCase().replace(/\\s+/g, '-')}-${timestamp}.png`;
          const screenshotPath = path.join('screenshots', 'cf1-production', filename);
          
          await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
          await fs.writeFile(screenshotPath, screenshot);
          
          // Get page info
          const title = await browserPage.title();
          const url = browserPage.url();
          
          // Get page content for analysis
          const content = await browserPage.content();
          const contentPath = path.join('screenshots', 'cf1-production', `content-${page.name.toLowerCase()}-${timestamp}.html`);
          await fs.writeFile(contentPath, content);
          
          const result = {
            pageName: page.name,
            description: page.description,
            url: fullUrl,
            title,
            screenshotPath,
            contentPath,
            screenshotSize: screenshot.length,
            timestamp,
            success: true
          };
          
          results.push(result);
          console.log(`✅ Captured ${page.name}: ${screenshot.length} bytes`);
          
          // Close page to free memory
          await browserPage.close();
          
          // Brief pause between captures
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ Failed to capture ${page.name}:`, error.message);
          results.push({
            pageName: page.name,
            error: error.message,
            success: false
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Browser connection failed:', error.message);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
        console.log('🔌 Browser closed');
      }
    }
    
    // Generate report
    const report = {
      inspectionTime: new Date().toISOString(),
      baseUrl,
      totalPages: pages.length,
      successfulCaptures: results.filter(r => r.success).length,
      failedCaptures: results.filter(r => !r.success).length,
      results
    };
    
    const reportPath = path.join('screenshots', 'cf1-production', `inspection-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\\n📊 Inspection Complete!');
    console.log('📁 Report saved:', reportPath);
    console.log(`✅ Success: ${report.successfulCaptures}/${report.totalPages}`);
    console.log(`❌ Failed: ${report.failedCaptures}/${report.totalPages}`);
    
    return report;
  }

  /**
   * Analyze specific UI components
   */
  async analyzeComponent(url, componentName = 'component') {
    console.log(`🔍 Analyzing ${componentName} at: ${url}`);
    
    let browser;
    try {
      browser = await chromium.connect(this.browserbaseUrl);
      const page = await browser.newPage();
      
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // Wait for page to settle
      await page.waitForTimeout(2000);
      
      // Capture multiple viewport sizes
      const viewports = [
        { name: 'desktop', width: 1920, height: 1080 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'mobile', width: 375, height: 667 }
      ];
      
      const captures = [];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(1000); // Let resize settle
        
        const screenshot = await page.screenshot({ type: 'png' });
        const filename = `${componentName}-${viewport.name}-${Date.now()}.png`;
        const screenshotPath = path.join('screenshots', 'component-analysis', filename);
        
        await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
        await fs.writeFile(screenshotPath, screenshot);
        
        captures.push({
          viewport: viewport.name,
          dimensions: `${viewport.width}x${viewport.height}`,
          screenshotPath,
          size: screenshot.length
        });
        
        console.log(`📱 Captured ${viewport.name}: ${screenshot.length} bytes`);
      }
      
      return {
        component: componentName,
        url,
        captures,
        timestamp: new Date().toISOString()
      };
      
    } finally {
      if (browser) await browser.close();
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'inspect';
  
  const inspector = new CF1VisualInspector();
  
  try {
    switch (command) {
      case 'inspect':
      case 'production':
        await inspector.inspectProduction();
        break;
        
      case 'component':
        const url = args[1] || 'https://rwa2.netlify.app/dashboard';
        const name = args[2] || 'dashboard';
        await inspector.analyzeComponent(url, name);
        break;
        
      case 'help':
      default:
        console.log(`
🎯 CF1 Visual Inspector

Commands:
  inspect                     Capture all CF1 production pages
  production                  Same as inspect
  component [url] [name]      Analyze specific component/page
  help                        Show this help

Examples:
  node scripts/cf1-visual-inspector.js
  node scripts/cf1-visual-inspector.js component https://rwa2.netlify.app/marketplace marketplace
        `);
    }
  } catch (error) {
    console.error('💥 Inspector failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default CF1VisualInspector;