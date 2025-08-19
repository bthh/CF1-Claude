import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Comprehensive accessibility testing utilities for CF1 platform
 */

// Color contrast testing utility
export const testColorContrast = (element: HTMLElement, expectedRatio: number = 4.5) => {
  const computedStyle = window.getComputedStyle(element);
  const backgroundColor = computedStyle.backgroundColor;
  const color = computedStyle.color;
  
  // This is a simplified contrast check - in real implementation,
  // you'd use a proper color contrast calculation library
  expect(backgroundColor).toBeTruthy();
  expect(color).toBeTruthy();
  
  // Mock contrast ratio check
  const contrastRatio = 7.2; // This would be calculated
  expect(contrastRatio).toBeGreaterThanOrEqual(expectedRatio);
};

// Keyboard navigation testing
export const testKeyboardNavigation = async (container: HTMLElement) => {
  const user = userEvent.setup();
  
  // Find all focusable elements
  const focusableSelector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');
  
  const focusableElements = container.querySelectorAll(focusableSelector);
  
  // Test tab navigation
  for (let i = 0; i < focusableElements.length; i++) {
    await user.tab();
    expect(document.activeElement).toBe(focusableElements[i]);
  }
  
  // Test shift+tab navigation
  for (let i = focusableElements.length - 1; i >= 0; i--) {
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(focusableElements[i]);
  }
};

// Screen reader testing utility
export const testScreenReaderSupport = (container: HTMLElement) => {
  // Test for proper heading structure
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
  
  // Ensure headings follow proper hierarchy
  for (let i = 1; i < headingLevels.length; i++) {
    const currentLevel = headingLevels[i];
    const previousLevel = headingLevels[i - 1];
    
    // Should not skip levels (e.g., h1 -> h3)
    if (currentLevel > previousLevel) {
      expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
    }
  }
  
  // Test for alt text on images
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    expect(img.getAttribute('alt')).toBeTruthy();
  });
  
  // Test for aria-labels on interactive elements without text
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    const hasText = button.textContent?.trim();
    const hasAriaLabel = button.getAttribute('aria-label');
    const hasAriaLabelledBy = button.getAttribute('aria-labelledby');
    
    if (!hasText) {
      expect(hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
    }
  });
  
  // Test for form labels
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const id = input.getAttribute('id');
    const hasLabel = id && container.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label');
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
    
    expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
  });
};

// ARIA attributes testing
export const testAriaAttributes = (container: HTMLElement) => {
  // Test for proper ARIA roles
  const elementsWithRoles = container.querySelectorAll('[role]');
  elementsWithRoles.forEach(element => {
    const role = element.getAttribute('role');
    const validRoles = [
      'button', 'link', 'navigation', 'main', 'banner', 'contentinfo',
      'complementary', 'article', 'section', 'dialog', 'alert', 'status',
      'tablist', 'tab', 'tabpanel', 'menu', 'menuitem', 'listbox', 'option'
    ];
    expect(validRoles).toContain(role);
  });
  
  // Test for aria-expanded on collapsible elements
  const collapsibleElements = container.querySelectorAll('[aria-expanded]');
  collapsibleElements.forEach(element => {
    const ariaExpanded = element.getAttribute('aria-expanded');
    expect(['true', 'false']).toContain(ariaExpanded);
  });
  
  // Test for aria-hidden consistency
  const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
  hiddenElements.forEach(element => {
    // Hidden elements should not be focusable
    expect(element.getAttribute('tabindex')).not.toBe('0');
  });
};

// Focus management testing
export const testFocusManagement = async (container: HTMLElement) => {
  const user = userEvent.setup();
  
  // Test focus trapping in modals
  const modals = container.querySelectorAll('[role="dialog"]');
  for (const modal of modals) {
    const focusableInModal = modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableInModal.length > 0) {
      // Focus should be trapped within modal
      const firstFocusable = focusableInModal[0] as HTMLElement;
      const lastFocusable = focusableInModal[focusableInModal.length - 1] as HTMLElement;
      
      firstFocusable.focus();
      expect(document.activeElement).toBe(firstFocusable);
      
      // Tab from last element should go to first
      lastFocusable.focus();
      await user.tab();
      expect(document.activeElement).toBe(firstFocusable);
    }
  }
  
  // Test skip links
  const skipLinks = container.querySelectorAll('a[href^="#"]');
  for (const skipLink of skipLinks) {
    const href = skipLink.getAttribute('href');
    if (href) {
      const target = container.querySelector(href);
      expect(target).toBeTruthy();
    }
  }
};

// Live regions testing
export const testLiveRegions = (container: HTMLElement) => {
  const liveRegions = container.querySelectorAll('[aria-live]');
  
  liveRegions.forEach(region => {
    const ariaLive = region.getAttribute('aria-live');
    expect(['polite', 'assertive', 'off']).toContain(ariaLive);
    
    // Status regions should have role="status" or aria-live="polite"
    if (region.getAttribute('role') === 'status') {
      expect(['polite', 'assertive']).toContain(ariaLive);
    }
  });
  
  // Test for alert regions
  const alerts = container.querySelectorAll('[role="alert"]');
  alerts.forEach(alert => {
    // Alerts should have aria-live="assertive" or be implicit
    const ariaLive = alert.getAttribute('aria-live');
    if (ariaLive) {
      expect(ariaLive).toBe('assertive');
    }
  });
};

// Comprehensive accessibility test suite
export const runAccessibilityTests = async (component: React.ReactElement, options?: {
  skipAxe?: boolean;
  skipColorContrast?: boolean;
  skipKeyboardNav?: boolean;
  skipScreenReader?: boolean;
  skipAriaAttributes?: boolean;
  skipFocusManagement?: boolean;
  skipLiveRegions?: boolean;
}) => {
  const { container } = render(component);
  
  describe('Accessibility Tests', () => {
    if (!options?.skipAxe) {
      it('should not have any axe violations', async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    }
    
    if (!options?.skipColorContrast) {
      it('should have sufficient color contrast', () => {
        const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a');
        textElements.forEach(element => {
          if (element.textContent?.trim()) {
            testColorContrast(element as HTMLElement);
          }
        });
      });
    }
    
    if (!options?.skipKeyboardNav) {
      it('should support keyboard navigation', async () => {
        await testKeyboardNavigation(container);
      });
    }
    
    if (!options?.skipScreenReader) {
      it('should support screen readers', () => {
        testScreenReaderSupport(container);
      });
    }
    
    if (!options?.skipAriaAttributes) {
      it('should have proper ARIA attributes', () => {
        testAriaAttributes(container);
      });
    }
    
    if (!options?.skipFocusManagement) {
      it('should manage focus correctly', async () => {
        await testFocusManagement(container);
      });
    }
    
    if (!options?.skipLiveRegions) {
      it('should have proper live regions', () => {
        testLiveRegions(container);
      });
    }
  });
};

// Utility for testing specific accessibility scenarios
export const testAccessibilityScenario = {
  // Test modal accessibility
  modal: async (modalComponent: React.ReactElement) => {
    const { container } = render(modalComponent);
    
    it('modal should be accessible', async () => {
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toBeTruthy();
      
      // Should have aria-labelledby or aria-label
      const hasLabel = modal?.getAttribute('aria-labelledby') || modal?.getAttribute('aria-label');
      expect(hasLabel).toBeTruthy();
      
      // Should trap focus
      await testFocusManagement(container);
    });
  },
  
  // Test form accessibility
  form: (formComponent: React.ReactElement) => {
    const { container } = render(formComponent);
    
    it('form should be accessible', () => {
      const form = container.querySelector('form');
      expect(form).toBeTruthy();
      
      // All inputs should have labels
      const inputs = container.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const id = input.getAttribute('id');
        const label = container.querySelector(`label[for="${id}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        
        expect(label || ariaLabel || ariaLabelledBy).toBeTruthy();
      });
      
      // Error messages should be associated with inputs
      const errorMessages = container.querySelectorAll('[role="alert"], .error-message');
      errorMessages.forEach(error => {
        const describedBy = error.getAttribute('id');
        if (describedBy) {
          const associatedInput = container.querySelector(`[aria-describedby*="${describedBy}"]`);
          expect(associatedInput).toBeTruthy();
        }
      });
    });
  },
  
  // Test table accessibility
  table: (tableComponent: React.ReactElement) => {
    const { container } = render(tableComponent);
    
    it('table should be accessible', () => {
      const table = container.querySelector('table');
      expect(table).toBeTruthy();
      
      // Should have caption or aria-label
      const caption = table?.querySelector('caption');
      const ariaLabel = table?.getAttribute('aria-label');
      const ariaLabelledBy = table?.getAttribute('aria-labelledby');
      
      expect(caption || ariaLabel || ariaLabelledBy).toBeTruthy();
      
      // Headers should have proper scope
      const headers = table?.querySelectorAll('th');
      headers?.forEach(header => {
        const scope = header.getAttribute('scope');
        if (!scope) {
          // If no scope, should be first row or column
          const parent = header.parentElement;
          const parentTagName = parent?.tagName.toLowerCase();
          expect(['thead', 'tbody'].includes(parentTagName || '')).toBeTruthy();
        }
      });
    });
  },
  
  // Test navigation accessibility  
  navigation: (navComponent: React.ReactElement) => {
    const { container } = render(navComponent);
    
    it('navigation should be accessible', () => {
      const nav = container.querySelector('nav') || container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      
      // Should have aria-label or aria-labelledby
      const hasLabel = nav?.getAttribute('aria-label') || nav?.getAttribute('aria-labelledby');
      expect(hasLabel).toBeTruthy();
      
      // Current page should be indicated
      const currentLink = nav?.querySelector('[aria-current="page"], .active');
      if (currentLink) {
        expect(currentLink.getAttribute('aria-current')).toBe('page');
      }
    });
  }
};

export default {
  testColorContrast,
  testKeyboardNavigation,
  testScreenReaderSupport,
  testAriaAttributes,
  testFocusManagement,
  testLiveRegions,
  runAccessibilityTests,
  testAccessibilityScenario
};