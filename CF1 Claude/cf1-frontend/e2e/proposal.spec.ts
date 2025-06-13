import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

test.describe('Proposal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Connect wallet (demo mode)
    await page.click('button:has-text("Connect Wallet")');
    await page.click('button:has-text("Use Demo Mode")');
    
    // Wait for wallet connection
    await expect(page.locator('text=cosmos1')).toBeVisible({ timeout: 10000 });
  });

  test('Create and view a new proposal', async ({ page }) => {
    // Navigate to create proposal
    await page.click('a:has-text("Launchpad")');
    await page.click('button:has-text("Create Proposal")');

    // Fill out proposal form
    await page.fill('input[name="name"]', 'E2E Test Property');
    await page.fill('textarea[name="description"]', 'This is an E2E test property description with sufficient detail.');
    await page.fill('input[name="full_description"]', 'Full description for E2E testing with comprehensive details about the property.');
    
    // Select asset type
    await page.selectOption('select[name="asset_type"]', 'Real Estate');
    await page.selectOption('select[name="category"]', 'Commercial');
    
    await page.fill('input[name="location"]', 'Test City, TC');
    
    // Financial terms
    await page.fill('input[name="target_amount"]', '50000');
    await page.fill('input[name="token_price"]', '10');
    await page.fill('input[name="total_shares"]', '5000');
    await page.fill('input[name="minimum_investment"]', '100');
    await page.fill('input[name="expected_apy"]', '8');
    await page.fill('input[name="funding_period"]', '30');

    // Add risk factors
    await page.click('button:has-text("Add Risk Factor")');
    await page.fill('input[placeholder="Enter risk factor"]', 'Market volatility risk');

    // Add highlights
    await page.click('button:has-text("Add Highlight")');
    await page.fill('input[placeholder="Enter highlight"]', 'Prime location with high foot traffic');

    // Submit proposal
    await page.click('button:has-text("Create Proposal")');

    // Wait for success and redirect
    await expect(page).toHaveURL(/\/launchpad\/proposal\//);
    
    // Verify proposal details are displayed
    await expect(page.locator('h1:has-text("E2E Test Property")')).toBeVisible();
    await expect(page.locator('text=$50,000')).toBeVisible();
    await expect(page.locator('text=8% Expected APY')).toBeVisible();
  });

  test('Invest in an existing proposal', async ({ page }) => {
    // Navigate to marketplace
    await page.click('a:has-text("Marketplace")');
    
    // Click on first available proposal
    await page.click('.proposal-card >> nth=0');
    
    // Wait for proposal detail page
    await expect(page.locator('button:has-text("Invest")')).toBeVisible();
    
    // Click invest button
    await page.click('button:has-text("Invest")');
    
    // Fill investment amount
    await page.fill('input[name="amount"]', '100');
    
    // Confirm investment
    await page.click('button:has-text("Confirm Investment")');
    
    // Wait for transaction confirmation
    await expect(page.locator('text=Investment successful')).toBeVisible({ timeout: 15000 });
    
    // Verify investment appears in portfolio
    await page.click('a:has-text("Portfolio")');
    await expect(page.locator('text=100 NTRN')).toBeVisible();
  });

  test('Search and filter proposals', async ({ page }) => {
    // Navigate to marketplace
    await page.click('a:has-text("Marketplace")');
    
    // Use search
    await page.fill('input[placeholder="Search assets..."]', 'Real Estate');
    await page.press('input[placeholder="Search assets..."]', 'Enter');
    
    // Apply filters
    await page.click('button:has-text("Filters")');
    
    // Filter by category
    await page.click('input[value="Real Estate"]');
    
    // Filter by status
    await page.click('input[value="Active"]');
    
    // Apply filters
    await page.click('button:has-text("Apply Filters")');
    
    // Verify filtered results
    await expect(page.locator('.proposal-card')).toHaveCount(await page.locator('.proposal-card').count());
    
    // Verify all visible proposals match filter
    const proposals = await page.locator('.proposal-card').all();
    for (const proposal of proposals) {
      await expect(proposal.locator('text=Real Estate')).toBeVisible();
    }
  });

  test('Cancel a proposal as creator', async ({ page }) => {
    // First create a proposal
    await page.click('a:has-text("Launchpad")');
    await page.click('button:has-text("Create Proposal")');
    
    // Quick fill required fields
    await page.fill('input[name="name"]', 'Proposal to Cancel');
    await page.fill('textarea[name="description"]', 'This proposal will be cancelled for testing.');
    await page.selectOption('select[name="asset_type"]', 'Real Estate');
    await page.fill('input[name="target_amount"]', '10000');
    await page.fill('input[name="token_price"]', '1');
    await page.fill('input[name="funding_period"]', '7');
    
    await page.click('button:has-text("Create Proposal")');
    
    // Wait for proposal creation
    await expect(page).toHaveURL(/\/launchpad\/proposal\//);
    
    // Click cancel button
    await page.click('button:has-text("Cancel Proposal")');
    
    // Confirm cancellation
    await page.click('button:has-text("Yes, Cancel")');
    
    // Verify cancellation
    await expect(page.locator('text=Cancelled')).toBeVisible();
    await expect(page.locator('button:has-text("Invest")')).toBeDisabled();
  });

  test('Verify investment limits and validation', async ({ page }) => {
    // Navigate to a proposal
    await page.click('a:has-text("Marketplace")');
    await page.click('.proposal-card >> nth=0');
    
    // Try to invest without enough balance
    await page.click('button:has-text("Invest")');
    
    // Try invalid amounts
    await page.fill('input[name="amount"]', '0');
    await page.click('button:has-text("Confirm Investment")');
    await expect(page.locator('text=Minimum investment')).toBeVisible();
    
    // Try exceeding balance
    await page.fill('input[name="amount"]', '999999999');
    await page.click('button:has-text("Confirm Investment")');
    await expect(page.locator('text=Insufficient funds')).toBeVisible();
    
    // Close modal
    await page.click('button[aria-label="Close"]');
  });

  test('Portfolio overview after investments', async ({ page }) => {
    // Make an investment first
    await page.click('a:has-text("Marketplace")');
    await page.click('.proposal-card >> nth=0');
    await page.click('button:has-text("Invest")');
    await page.fill('input[name="amount"]', '100');
    await page.click('button:has-text("Confirm Investment")');
    
    // Wait for success
    await expect(page.locator('text=Investment successful')).toBeVisible({ timeout: 15000 });
    
    // Navigate to portfolio
    await page.click('a:has-text("Portfolio")');
    
    // Verify portfolio displays
    await expect(page.locator('text=Portfolio Value')).toBeVisible();
    await expect(page.locator('text=Total Invested')).toBeVisible();
    await expect(page.locator('text=Active Investments')).toBeVisible();
    
    // Check investment details
    await page.click('tab:has-text("Investments")');
    await expect(page.locator('td:has-text("100 NTRN")')).toBeVisible();
  });
});