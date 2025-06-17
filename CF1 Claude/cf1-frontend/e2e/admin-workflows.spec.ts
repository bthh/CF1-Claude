import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

test.describe('Admin Workflows E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Connect wallet in demo mode
    await page.click('button:has-text("Connect Wallet")');
    await page.click('button:has-text("Use Demo Mode")');
    
    // Wait for wallet connection
    await expect(page.locator('text=cosmos1')).toBeVisible({ timeout: 10000 });
  });

  test('Creator Admin - Complete workflow', async ({ page }) => {
    // Access admin login
    await page.click('button:has-text("Quick Actions")');
    await page.click('button:has-text("Admin Access")');
    
    // Select Creator Admin role
    await page.click('text=Creator Admin');
    await page.click('button:has-text("Login as Admin")');
    
    // Wait for successful login
    await expect(page.locator('text=Successfully logged in')).toBeVisible();
    
    // Navigate to Creator Admin dashboard
    await page.click('a:has-text("Creator Admin")');
    await expect(page).toHaveURL(/\/admin\/creator/);
    
    // Verify dashboard loads
    await expect(page.locator('h1:has-text("Creator Dashboard")')).toBeVisible();
    await expect(page.locator('text=Total Proposals')).toBeVisible();
    await expect(page.locator('text=Funds Raised')).toBeVisible();
    
    // Test tab navigation
    await page.click('button:has-text("Proposals")');
    await expect(page.locator('text=Funding Progress')).toBeVisible();
    
    await page.click('button:has-text("Distributions")');
    await expect(page.locator('text=Total Tokens')).toBeVisible();
    
    await page.click('button:has-text("Analytics")');
    await expect(page.locator('text=Performance Metrics')).toBeVisible();
    
    // Test proposal management actions
    await page.click('button:has-text("Proposals")');
    
    // Try to edit a proposal
    const editButton = page.locator('button[title="Edit Proposal"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page.locator('text=Proposal edit action completed')).toBeVisible();
    }
    
    // Test refresh functionality
    await page.click('button:has-text("Refresh")');
    await expect(page.locator('text=Loading dashboard')).toBeVisible();
  });

  test('Super Admin - Platform configuration and emergency controls', async ({ page }) => {
    // Login as Super Admin
    await page.click('button:has-text("Quick Actions")');
    await page.click('button:has-text("Admin Access")');
    await page.click('text=Super Admin');
    await page.click('button:has-text("Login as Admin")');
    
    await expect(page.locator('text=Successfully logged in')).toBeVisible();
    
    // Navigate to Super Admin dashboard
    await page.click('a:has-text("Super Admin")');
    await expect(page).toHaveURL(/\/admin\/super/);
    
    // Verify platform health overview
    await expect(page.locator('text=Platform Health')).toBeVisible();
    await expect(page.locator('text=System Uptime')).toBeVisible();
    await expect(page.locator('text=Total Value Locked')).toBeVisible();
    
    // Test configuration tab
    await page.click('button:has-text("Configuration")');
    await expect(page.locator('text=Platform Configuration')).toBeVisible();
    
    // Test platform fee update
    const platformFeeInput = page.locator('input[type="number"]').first();
    await platformFeeInput.fill('3.0');
    
    // Toggle maintenance mode
    const maintenanceToggle = page.locator('text=Maintenance Mode').locator('xpath=following-sibling::button').first();
    await maintenanceToggle.click();
    await expect(page.locator('text=maintenanceMode updated successfully')).toBeVisible();
    
    // Test security tab
    await page.click('button:has-text("Security")');
    await expect(page.locator('text=Suspicious Investment Pattern')).toBeVisible();
    
    // Investigate security alert
    const investigateButton = page.locator('button:has-text("Investigate")').first();
    if (await investigateButton.isVisible()) {
      await investigateButton.click();
      await expect(page.locator('text=Alert investigated successfully')).toBeVisible();
    }
    
    // Test emergency controls
    await page.click('button:has-text("Emergency")');
    await expect(page.locator('text=Emergency Controls')).toBeVisible();
    
    // Test maintenance mode activation (with confirmation)
    await page.click('button:has-text("Enable Maintenance")');
    await expect(page.locator('text=Maintenance mode enabled')).toBeVisible();
    
    // Test system logs
    await page.click('button:has-text("Logs")');
    await expect(page.locator('text=System Logs')).toBeVisible();
    await expect(page.locator('text=Transaction failed due to insufficient gas')).toBeVisible();
  });

  test('Platform Admin - User management and compliance', async ({ page }) => {
    // Login as Platform Admin
    await page.click('button:has-text("Quick Actions")');
    await page.click('button:has-text("Admin Access")');
    await page.click('text=Platform Admin');
    await page.click('button:has-text("Login as Admin")');
    
    await expect(page.locator('text=Successfully logged in')).toBeVisible();
    
    // Navigate to Platform Admin dashboard
    await page.click('a:has-text("Platform Admin")');
    await expect(page).toHaveURL(/\/admin\/platform/);
    
    // Verify user management interface
    await expect(page.locator('text=User Management')).toBeVisible();
    await expect(page.locator('text=Alice Johnson')).toBeVisible();
    
    // Test user search
    const searchInput = page.locator('input[placeholder*="Search users"]');
    await searchInput.fill('Alice');
    await expect(page.locator('text=Alice Johnson')).toBeVisible();
    await expect(page.locator('text=Bob Smith')).not.toBeVisible();
    
    // Clear search
    await searchInput.fill('');
    
    // Test user filtering
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('active');
    
    // Test user actions
    const viewDetailsButton = page.locator('button[title="View Details"]').first();
    await viewDetailsButton.click();
    await expect(page.locator('text=Contact Information')).toBeVisible();
    
    // Test user suspension
    const suspendButton = page.locator('button[title="Suspend User"]').first();
    if (await suspendButton.isVisible()) {
      await suspendButton.click();
      await expect(page.locator('text=User suspended successfully')).toBeVisible();
    }
    
    // Test compliance tab
    await page.click('button:has-text("Compliance")');
    await expect(page.locator('text=KYC documents require manual verification')).toBeVisible();
    
    // Handle compliance case
    const approveButton = page.locator('button:has-text("Approve")').first();
    if (await approveButton.isVisible()) {
      await approveButton.click();
      await expect(page.locator('text=Compliance case approved successfully')).toBeVisible();
    }
    
    // Test support tickets
    await page.click('button:has-text("Support")');
    await expect(page.locator('text=Unable to withdraw tokens')).toBeVisible();
    
    // Assign support ticket
    const assignButton = page.locator('button:has-text("Assign")').first();
    if (await assignButton.isVisible()) {
      await assignButton.click();
      await expect(page.locator('text=Support ticket assigned successfully')).toBeVisible();
    }
    
    // Test analytics tab
    await page.click('button:has-text("Analytics")');
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=KYC Pending')).toBeVisible();
    await expect(page.locator('text=User Status Distribution')).toBeVisible();
  });

  test('Admin role switching and permissions', async ({ page }) => {
    // Start as Creator Admin
    await page.click('button:has-text("Quick Actions")');
    await page.click('button:has-text("Admin Access")');
    await page.click('text=Creator Admin');
    await page.click('button:has-text("Login as Admin")');
    
    // Verify Creator Admin access
    await page.click('a:has-text("Creator Admin")');
    await expect(page.locator('text=Creator Dashboard')).toBeVisible();
    
    // Try to access Super Admin (should not be possible)
    await page.goto(`${BASE_URL}/admin/super`);
    await expect(page.locator('text=Super Admin Access Required')).toBeVisible();
    
    // Logout and switch to Super Admin
    await page.click('button:has-text("Quick Actions")');
    
    // Find and click profile menu
    const userIcon = page.locator('[data-tour="profile-menu"]');
    await userIcon.click();
    await page.click('button:has-text("Sign Out")');
    
    // Login as Super Admin
    await page.click('button:has-text("Quick Actions")');
    await page.click('button:has-text("Admin Access")');
    await page.click('text=Super Admin');
    await page.click('button:has-text("Login as Admin")');
    
    // Verify Super Admin can access all areas
    await page.click('a:has-text("Super Admin")');
    await expect(page.locator('text=Super Admin Dashboard')).toBeVisible();
    
    // Test access to other admin areas
    await page.goto(`${BASE_URL}/admin/creator`);
    await expect(page.locator('text=Creator Dashboard')).toBeVisible(); // Super admin should have access
    
    await page.goto(`${BASE_URL}/admin/platform`);
    await expect(page.locator('text=Platform Admin')).toBeVisible(); // Super admin should have access
  });

  test('Admin session timeout and security', async ({ page }) => {
    // Login as admin
    await page.click('button:has-text("Quick Actions")');
    await page.click('button:has-text("Admin Access")');
    await page.click('text=Creator Admin');
    await page.click('button:has-text("Login as Admin")');
    
    // Navigate to admin area
    await page.click('a:has-text("Creator Admin")');
    await expect(page.locator('text=Creator Dashboard')).toBeVisible();
    
    // Simulate session timeout by manipulating localStorage
    await page.evaluate(() => {
      const expiredSession = {
        role: 'creator',
        walletAddress: 'cosmos1test123',
        loginTime: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        permissions: ['view_proposals']
      };
      localStorage.setItem('cf1_admin_session', JSON.stringify(expiredSession));
    });
    
    // Refresh page to trigger session check
    await page.reload();
    
    // Should be redirected to login or see access denied
    await expect(page.locator('text=Access Denied').or(page.locator('text=Connect Wallet'))).toBeVisible();
  });

  test('Admin audit trail and logging', async ({ page }) => {
    // Login as Super Admin to access logs
    await page.click('button:has-text("Quick Actions")');
    await page.click('button:has-text("Admin Access")');
    await page.click('text=Super Admin');
    await page.click('button:has-text("Login as Admin")');
    
    await page.click('a:has-text("Super Admin")');
    
    // Perform some admin actions to generate audit trail
    await page.click('button:has-text("Configuration")');
    
    const platformFeeInput = page.locator('input[type="number"]').first();
    await platformFeeInput.fill('2.8');
    
    // Check logs
    await page.click('button:has-text("Logs")');
    await expect(page.locator('text=System Logs')).toBeVisible();
    
    // Verify log entries exist
    await expect(page.locator('text=error').or(page.locator('text=warning')).or(page.locator('text=info'))).toBeVisible();
  });

  test('Mobile admin interface responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Login as admin
    await page.click('button:has-text("Quick Actions")');
    await page.click('button:has-text("Admin Access")');
    await page.click('text=Creator Admin');
    await page.click('button:has-text("Login as Admin")');
    
    // Navigate to admin dashboard
    await page.click('a:has-text("Creator Admin")');
    
    // Verify mobile layout
    await expect(page.locator('text=Creator Dashboard')).toBeVisible();
    
    // Test mobile navigation and tabs
    await page.click('button:has-text("Proposals")');
    await expect(page.locator('text=Funding Progress')).toBeVisible();
    
    // Test mobile-friendly interactions
    await page.click('button[title="View Details"]');
    
    // Verify responsive layout adapts
    await expect(page.locator('.grid')).toBeVisible();
  });
});