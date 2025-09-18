import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * CF1 Platform - Comprehensive Accessibility Testing Framework
 *
 * This test suite implements automated WCAG 2.1 AA compliance testing
 * to ensure the platform meets enterprise accessibility standards.
 *
 * Standards: WCAG 2.1 AA, Section 508, ADA compliance
 * Target: 100% accessibility compliance for financial interfaces
 */

// Accessibility testing configuration
const ACCESSIBILITY_CONFIG = {
  wcagLevel: 'AA' as const,
  standards: ['wcag2a', 'wcag2aa', 'wcag21aa', 'section508'],
  disableRules: [
    // Temporarily disable rules that may conflict with financial interface requirements
    // These should be reviewed and enabled as accessibility improvements are implemented
  ],
  includedImpacts: ['critical', 'serious', 'moderate', 'minor'],
};

// Helper function to prepare page for accessibility testing
async function preparePage(page: Page): Promise<void> {
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Ensure dynamic content is loaded
  await page.waitForTimeout(2000);

  // Verify critical elements are present
  await page.waitForSelector('main, [role="main"], .main-content', { timeout: 10000 });
}

// Helper function to run comprehensive axe analysis
async function runAccessibilityAudit(page: Page, testName: string): Promise<void> {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(ACCESSIBILITY_CONFIG.standards)
    .disableRules(ACCESSIBILITY_CONFIG.disableRules)
    .analyze();

  // Log detailed results for analysis
  console.log(`\n=== Accessibility Audit: ${testName} ===`);
  console.log(`Violations found: ${accessibilityScanResults.violations.length}`);

  if (accessibilityScanResults.violations.length > 0) {
    console.log('\nViolations by Impact:');
    const violationsByImpact = accessibilityScanResults.violations.reduce((acc, violation) => {
      acc[violation.impact || 'unknown'] = (acc[violation.impact || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(violationsByImpact).forEach(([impact, count]) => {
      console.log(`  ${impact}: ${count}`);
    });

    // Log first few violations for debugging
    accessibilityScanResults.violations.slice(0, 3).forEach((violation, index) => {
      console.log(`\nViolation ${index + 1}:`);
      console.log(`  Rule: ${violation.id}`);
      console.log(`  Impact: ${violation.impact}`);
      console.log(`  Description: ${violation.description}`);
      console.log(`  Help: ${violation.help}`);
      console.log(`  Elements affected: ${violation.nodes.length}`);
    });
  }

  // Assert no critical or serious violations
  const criticalViolations = accessibilityScanResults.violations.filter(
    v => v.impact === 'critical' || v.impact === 'serious'
  );

  expect(criticalViolations).toHaveLength(0);

  // For moderate violations, log but don't fail (can be addressed in follow-up)
  const moderateViolations = accessibilityScanResults.violations.filter(
    v => v.impact === 'moderate'
  );

  if (moderateViolations.length > 0) {
    console.log(`\nWarning: ${moderateViolations.length} moderate accessibility issues found in ${testName}`);
  }
}

// Helper function to test keyboard navigation
async function testKeyboardNavigation(page: Page, testName: string): Promise<void> {
  console.log(`\n=== Keyboard Navigation Test: ${testName} ===`);

  // Reset focus to start of page
  await page.keyboard.press('Home');

  const focusableElements: string[] = [];
  let tabCount = 0;
  const maxTabs = 20; // Prevent infinite loops

  while (tabCount < maxTabs) {
    await page.keyboard.press('Tab');
    tabCount++;

    // Get currently focused element
    const focusedElement = await page.evaluate(() => {
      const element = document.activeElement;
      if (!element) return null;

      return {
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        text: element.textContent?.substring(0, 50) || '',
        ariaLabel: element.getAttribute('aria-label'),
        role: element.getAttribute('role')
      };
    });

    if (focusedElement) {
      const elementDesc = `${focusedElement.tagName}${focusedElement.id ? '#' + focusedElement.id : ''}${focusedElement.role ? '[role=' + focusedElement.role + ']' : ''}`;
      focusableElements.push(elementDesc);

      // Verify focus is visible
      const focusIndicator = await page.evaluate(() => {
        const element = document.activeElement;
        if (!element) return false;

        const styles = window.getComputedStyle(element);
        const outline = styles.outline;
        const boxShadow = styles.boxShadow;

        // Check for focus indicators
        return outline !== 'none' || boxShadow !== 'none' ||
               element.classList.contains('focus-visible') ||
               element.classList.contains('focus');
      });

      if (!focusIndicator) {
        console.log(`Warning: No visible focus indicator on ${elementDesc}`);
      }
    }

    // Break if we've reached the end (body gets focus again)
    const isAtEnd = await page.evaluate(() => document.activeElement === document.body);
    if (isAtEnd && tabCount > 1) break;
  }

  console.log(`Focusable elements found: ${focusableElements.length}`);
  console.log(`Tab sequence: ${focusableElements.slice(0, 5).join(' → ')}${focusableElements.length > 5 ? ' ...' : ''}`);

  // Verify at least some elements are focusable
  expect(focusableElements.length).toBeGreaterThan(0);
}

// Helper function to test screen reader compatibility
async function testScreenReaderCompatibility(page: Page, testName: string): Promise<void> {
  console.log(`\n=== Screen Reader Compatibility: ${testName} ===`);

  // Check for proper heading structure
  const headings = await page.evaluate(() => {
    const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    return headingElements.map(h => ({
      level: parseInt(h.tagName.substring(1)),
      text: h.textContent?.trim() || '',
      id: h.id || '',
      hasId: !!h.id
    }));
  });

  console.log(`Headings found: ${headings.length}`);

  // Verify heading hierarchy
  if (headings.length > 0) {
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBeGreaterThanOrEqual(1); // Should have at least one H1

    headings.forEach((heading, index) => {
      console.log(`  H${heading.level}: ${heading.text.substring(0, 50)}${heading.text.length > 50 ? '...' : ''}`);
    });
  }

  // Check for landmark regions
  const landmarks = await page.evaluate(() => {
    const landmarkElements = Array.from(document.querySelectorAll('[role], main, nav, header, footer, aside, section'));
    return landmarkElements.map(el => ({
      tagName: el.tagName,
      role: el.getAttribute('role') || el.tagName.toLowerCase(),
      ariaLabel: el.getAttribute('aria-label'),
      ariaLabelledby: el.getAttribute('aria-labelledby')
    }));
  });

  console.log(`Landmarks found: ${landmarks.length}`);
  landmarks.forEach(landmark => {
    console.log(`  ${landmark.role}: ${landmark.ariaLabel || landmark.ariaLabelledby || '(no label)'}`);
  });

  // Verify essential landmarks exist
  const landmarkRoles = landmarks.map(l => l.role);
  const hasMain = landmarkRoles.includes('main') || landmarkRoles.includes('MAIN');
  const hasNavigation = landmarkRoles.includes('navigation') || landmarkRoles.includes('nav') || landmarkRoles.includes('NAV');

  expect(hasMain).toBe(true); // Main content area should exist
  // Navigation is expected on most pages but not strictly required for modals/simple pages
}

test.describe('CF1 Platform - Accessibility Compliance Testing', () => {

  test.describe('Core Page Accessibility', () => {

    test('Homepage/Login - WCAG 2.1 AA Compliance', async ({ page }) => {
      await page.goto('/');
      await preparePage(page);

      await runAccessibilityAudit(page, 'Homepage/Login');
      await testKeyboardNavigation(page, 'Homepage/Login');
      await testScreenReaderCompatibility(page, 'Homepage/Login');
    });

    test('Dashboard - WCAG 2.1 AA Compliance', async ({ page }) => {
      await page.goto('/dashboard');
      await preparePage(page);

      await runAccessibilityAudit(page, 'Dashboard');
      await testKeyboardNavigation(page, 'Dashboard');
      await testScreenReaderCompatibility(page, 'Dashboard');
    });

    test('Marketplace - WCAG 2.1 AA Compliance', async ({ page }) => {
      await page.goto('/marketplace');
      await preparePage(page);

      await runAccessibilityAudit(page, 'Marketplace');
      await testKeyboardNavigation(page, 'Marketplace');
      await testScreenReaderCompatibility(page, 'Marketplace');
    });

    test('Portfolio - WCAG 2.1 AA Compliance', async ({ page }) => {
      await page.goto('/portfolio');
      await preparePage(page);

      await runAccessibilityAudit(page, 'Portfolio');
      await testKeyboardNavigation(page, 'Portfolio');
      await testScreenReaderCompatibility(page, 'Portfolio');
    });
  });

  test.describe('Interactive Components Accessibility', () => {

    test('Investment Modal - Complete Accessibility', async ({ page }) => {
      await page.goto('/marketplace');
      await preparePage(page);

      // Open investment modal
      await page.click('[data-testid="asset-card"]:first-child');
      await page.waitForSelector('[data-testid="investment-modal"]', { state: 'visible' });

      await runAccessibilityAudit(page, 'Investment Modal');

      // Test modal-specific keyboard navigation
      console.log('\n=== Modal Keyboard Navigation ===');

      // Modal should trap focus
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Verify focus is within modal
      const focusInModal = await page.evaluate(() => {
        const modal = document.querySelector('[data-testid="investment-modal"]');
        const activeElement = document.activeElement;
        return modal?.contains(activeElement) || false;
      });

      expect(focusInModal).toBe(true);

      // Test ESC key to close modal
      await page.keyboard.press('Escape');
      await page.waitForSelector('[data-testid="investment-modal"]', { state: 'hidden' });
    });

    test('Form Controls - Accessibility Standards', async ({ page }) => {
      await page.goto('/marketplace');
      await preparePage(page);

      // Open investment modal to test form controls
      await page.click('[data-testid="asset-card"]:first-child');
      await page.waitForSelector('[data-testid="investment-modal"]');

      // Test form accessibility
      const formAccessibility = await page.evaluate(() => {
        const form = document.querySelector('form');
        if (!form) return { hasForm: false };

        const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
        const formData = inputs.map(input => ({
          type: input.type || input.tagName,
          hasLabel: !!input.labels?.length || !!input.getAttribute('aria-label') || !!input.getAttribute('aria-labelledby'),
          required: input.hasAttribute('required'),
          hasDescription: !!input.getAttribute('aria-describedby'),
          id: input.id
        }));

        return {
          hasForm: true,
          inputCount: inputs.length,
          allInputsLabeled: formData.every(input => input.hasLabel),
          inputs: formData
        };
      });

      console.log('\n=== Form Accessibility Analysis ===');
      console.log(`Form inputs: ${formAccessibility.inputCount}`);
      console.log(`All inputs labeled: ${formAccessibility.allInputsLabeled}`);

      if (formAccessibility.hasForm) {
        expect(formAccessibility.allInputsLabeled).toBe(true);
      }

      await runAccessibilityAudit(page, 'Form Controls');
    });

    test('Navigation Components - Keyboard Access', async ({ page }) => {
      await page.goto('/dashboard');
      await preparePage(page);

      // Test main navigation
      console.log('\n=== Navigation Accessibility ===');

      const navigationAccessibility = await page.evaluate(() => {
        const navElements = Array.from(document.querySelectorAll('nav, [role="navigation"]'));

        return navElements.map(nav => ({
          hasRole: nav.getAttribute('role') === 'navigation' || nav.tagName === 'NAV',
          hasLabel: !!nav.getAttribute('aria-label') || !!nav.getAttribute('aria-labelledby'),
          linkCount: nav.querySelectorAll('a, [role="link"]').length,
          hasSkipLink: !!document.querySelector('a[href="#main"], a[href="#content"], .skip-link')
        }));
      });

      console.log(`Navigation sections: ${navigationAccessibility.length}`);
      navigationAccessibility.forEach((nav, index) => {
        console.log(`  Nav ${index + 1}: Role=${nav.hasRole}, Label=${nav.hasLabel}, Links=${nav.linkCount}`);
      });

      // Verify skip link exists
      const hasSkipLink = navigationAccessibility.some(nav => nav.hasSkipLink);
      expect(hasSkipLink).toBe(true);

      await runAccessibilityAudit(page, 'Navigation');
    });
  });

  test.describe('Admin Panel Accessibility', () => {

    test('Admin Dashboard - Administrative Interface Compliance', async ({ page }) => {
      // Navigate to admin panel (assuming demo mode or test authentication)
      await page.goto('/admin');
      await preparePage(page);

      await runAccessibilityAudit(page, 'Admin Dashboard');
      await testKeyboardNavigation(page, 'Admin Dashboard');
      await testScreenReaderCompatibility(page, 'Admin Dashboard');
    });

    test('Data Tables - Complex Data Accessibility', async ({ page }) => {
      await page.goto('/admin/users');
      await preparePage(page);

      // Test table accessibility
      const tableAccessibility = await page.evaluate(() => {
        const tables = Array.from(document.querySelectorAll('table'));

        return tables.map(table => ({
          hasCaption: !!table.querySelector('caption'),
          hasHeaders: !!table.querySelector('th'),
          headerScope: Array.from(table.querySelectorAll('th')).every(th =>
            th.hasAttribute('scope') || th.hasAttribute('id')
          ),
          rowCount: table.querySelectorAll('tr').length,
          hasAltSortable: !!table.querySelector('[aria-sort]')
        }));
      });

      console.log('\n=== Table Accessibility Analysis ===');
      tableAccessibility.forEach((table, index) => {
        console.log(`Table ${index + 1}:`);
        console.log(`  Has caption: ${table.hasCaption}`);
        console.log(`  Has headers: ${table.hasHeaders}`);
        console.log(`  Header scope defined: ${table.headerScope}`);
        console.log(`  Rows: ${table.rowCount}`);
      });

      await runAccessibilityAudit(page, 'Data Tables');
    });
  });

  test.describe('Mobile Accessibility', () => {

    test('Mobile Navigation - Touch Accessibility', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');
      await preparePage(page);

      // Test mobile-specific accessibility
      const mobileAccessibility = await page.evaluate(() => {
        // Check touch target sizes (minimum 44px)
        const interactiveElements = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'));

        const touchTargets = interactiveElements.map(el => {
          const rect = el.getBoundingClientRect();
          return {
            element: el.tagName + (el.id ? '#' + el.id : ''),
            width: rect.width,
            height: rect.height,
            meetsMinimum: rect.width >= 44 && rect.height >= 44
          };
        });

        return {
          totalInteractive: interactiveElements.length,
          meetingMinimum: touchTargets.filter(t => t.meetsMinimum).length,
          touchTargets: touchTargets.slice(0, 10) // First 10 for logging
        };
      });

      console.log('\n=== Mobile Touch Target Analysis ===');
      console.log(`Total interactive elements: ${mobileAccessibility.totalInteractive}`);
      console.log(`Meeting 44px minimum: ${mobileAccessibility.meetingMinimum}/${mobileAccessibility.totalInteractive}`);

      // Log elements that don't meet minimum size
      const smallTargets = mobileAccessibility.touchTargets.filter(t => !t.meetsMinimum);
      if (smallTargets.length > 0) {
        console.log('Elements below 44px minimum:');
        smallTargets.forEach(target => {
          console.log(`  ${target.element}: ${target.width}x${target.height}px`);
        });
      }

      await runAccessibilityAudit(page, 'Mobile Navigation');
    });
  });

  test.describe('Color and Contrast Accessibility', () => {

    test('Color Contrast - WCAG AA Standards', async ({ page }) => {
      await page.goto('/dashboard');
      await preparePage(page);

      // Run specific color contrast analysis
      const contrastResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .withRules(['color-contrast'])
        .analyze();

      console.log('\n=== Color Contrast Analysis ===');
      console.log(`Contrast violations: ${contrastResults.violations.length}`);

      contrastResults.violations.forEach((violation, index) => {
        console.log(`Violation ${index + 1}: ${violation.help}`);
        violation.nodes.slice(0, 3).forEach((node, nodeIndex) => {
          console.log(`  Element ${nodeIndex + 1}: ${node.target.join(' ')}`);
        });
      });

      // Assert no color contrast violations
      expect(contrastResults.violations).toHaveLength(0);
    });

    test('High Contrast Mode Support', async ({ page }) => {
      await page.goto('/dashboard');

      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              background-color: black !important;
              color: white !important;
              border-color: white !important;
            }
          }
        `
      });

      await preparePage(page);
      await runAccessibilityAudit(page, 'High Contrast Mode');
    });
  });

  test.describe('Dynamic Content Accessibility', () => {

    test('Live Regions and Updates', async ({ page }) => {
      await page.goto('/dashboard');
      await preparePage(page);

      // Check for live regions
      const liveRegions = await page.evaluate(() => {
        const liveElements = Array.from(document.querySelectorAll('[aria-live], [role="status"], [role="alert"]'));

        return liveElements.map(el => ({
          tagName: el.tagName,
          ariaLive: el.getAttribute('aria-live'),
          role: el.getAttribute('role'),
          text: el.textContent?.substring(0, 100) || ''
        }));
      });

      console.log('\n=== Live Regions Analysis ===');
      console.log(`Live regions found: ${liveRegions.length}`);
      liveRegions.forEach((region, index) => {
        console.log(`  Region ${index + 1}: ${region.role || region.ariaLive} - ${region.text}`);
      });

      await runAccessibilityAudit(page, 'Dynamic Content');
    });

    test('Loading States Accessibility', async ({ page }) => {
      // Test loading states with screen reader announcements
      await page.goto('/dashboard');

      // Simulate loading state
      await page.evaluate(() => {
        const main = document.querySelector('main');
        if (main) {
          main.setAttribute('aria-busy', 'true');
          main.setAttribute('aria-live', 'polite');
        }
      });

      await preparePage(page);
      await runAccessibilityAudit(page, 'Loading States');
    });
  });
});

test.describe('Accessibility Compliance Summary', () => {

  test('Generate Accessibility Report', async ({ page }) => {
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/marketplace', name: 'Marketplace' },
      { path: '/portfolio', name: 'Portfolio' },
      { path: '/admin', name: 'Admin Panel' }
    ];

    const accessibilityReport: any[] = [];

    for (const pageInfo of pages) {
      try {
        await page.goto(pageInfo.path);
        await preparePage(page);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();

        accessibilityReport.push({
          page: pageInfo.name,
          path: pageInfo.path,
          violations: results.violations.length,
          criticalViolations: results.violations.filter(v => v.impact === 'critical').length,
          seriousViolations: results.violations.filter(v => v.impact === 'serious').length,
          moderateViolations: results.violations.filter(v => v.impact === 'moderate').length,
          minorViolations: results.violations.filter(v => v.impact === 'minor').length,
          passes: results.passes.length
        });
      } catch (error) {
        console.log(`Error testing ${pageInfo.name}: ${error}`);
        accessibilityReport.push({
          page: pageInfo.name,
          path: pageInfo.path,
          error: error.message
        });
      }
    }

    console.log('\n=== ACCESSIBILITY COMPLIANCE SUMMARY ===');
    console.log('Page\t\t\tTotal\tCritical\tSerious\tModerate\tMinor\tPasses');
    console.log('---'.repeat(25));

    accessibilityReport.forEach(report => {
      if (report.error) {
        console.log(`${report.page}\t\tERROR: ${report.error}`);
      } else {
        console.log(`${report.page}\t\t${report.violations}\t${report.criticalViolations}\t\t${report.seriousViolations}\t${report.moderateViolations}\t\t${report.minorViolations}\t${report.passes}`);
      }
    });

    const totalCritical = accessibilityReport.reduce((sum, r) => sum + (r.criticalViolations || 0), 0);
    const totalSerious = accessibilityReport.reduce((sum, r) => sum + (r.seriousViolations || 0), 0);

    console.log('\n=== COMPLIANCE STATUS ===');
    console.log(`Total Critical Violations: ${totalCritical}`);
    console.log(`Total Serious Violations: ${totalSerious}`);
    console.log(`WCAG 2.1 AA Compliance: ${totalCritical === 0 && totalSerious === 0 ? 'PASS' : 'FAIL'}`);

    // Assert overall compliance
    expect(totalCritical).toBe(0);
    expect(totalSerious).toBe(0);
  });
});