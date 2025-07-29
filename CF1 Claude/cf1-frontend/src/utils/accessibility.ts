/**
 * CF1 Accessibility Utilities
 * WCAG 2.1 AA compliance helpers and utilities
 */

// Focus management utilities
export class FocusManager {
  private static focusHistory: HTMLElement[] = [];
  private static trapStack: HTMLElement[] = [];

  /**
   * Save current focus for restoration later
   */
  static saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push(activeElement);
    }
  }

  /**
   * Restore the last saved focus
   */
  static restoreFocus(): void {
    const lastFocused = this.focusHistory.pop();
    if (lastFocused) {
      setTimeout(() => {
        try {
          lastFocused.focus();
        } catch (e) {
          // Element might no longer exist
          console.warn('Could not restore focus to element:', e);
        }
      }, 0);
    }
  }

  /**
   * Trap focus within a container element
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element initially
    firstElement.focus();
    this.trapStack.push(container);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      const index = this.trapStack.indexOf(container);
      if (index > -1) {
        this.trapStack.splice(index, 1);
      }
    };
  }

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]'
    ].join(', ');

    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    return elements.filter(element => {
      const style = getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             !element.hasAttribute('aria-hidden');
    });
  }
}

// Screen reader utilities
export class ScreenReaderUtils {
  /**
   * Announce message to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcer = this.getAnnouncer(priority);
    announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }

  /**
   * Get or create aria-live announcer element
   */
  private static getAnnouncer(priority: 'polite' | 'assertive'): HTMLElement {
    const id = `cf1-announcer-${priority}`;
    let announcer = document.getElementById(id);
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = id;
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    }
    
    return announcer;
  }

  /**
   * Generate accessible description for complex UI elements
   */
  static generateDescription(element: {
    type: string;
    value?: string | number;
    label?: string;
    status?: string;
    context?: string;
  }): string {
    const parts: string[] = [];
    
    if (element.label) {
      parts.push(element.label);
    }
    
    if (element.value !== undefined) {
      parts.push(`${element.value}`);
    }
    
    if (element.status) {
      parts.push(`Status: ${element.status}`);
    }
    
    if (element.context) {
      parts.push(element.context);
    }
    
    return parts.join(', ');
  }
}

// Keyboard navigation utilities
export class KeyboardNavigation {
  /**
   * Handle arrow key navigation for menus and lists
   */
  static handleArrowNavigation(
    e: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    orientation: 'horizontal' | 'vertical' | 'both' = 'vertical'
  ): number {
    if (items.length === 0) return currentIndex;

    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }
        break;
      
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        }
        break;
      
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }
        break;
      
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        }
        break;
      
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
    }

    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus();
    }

    return newIndex;
  }

  /**
   * Add keyboard shortcuts with proper accessibility
   */
  static addShortcut(
    key: string,
    callback: () => void,
    options: {
      ctrl?: boolean;
      alt?: boolean;
      shift?: boolean;
      description?: string;
    } = {}
  ): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matches = 
        e.key.toLowerCase() === key.toLowerCase() &&
        (options.ctrl ? e.ctrlKey : !e.ctrlKey) &&
        (options.alt ? e.altKey : !e.altKey) &&
        (options.shift ? e.shiftKey : !e.shiftKey);

      if (matches) {
        e.preventDefault();
        callback();
        
        // Announce shortcut activation to screen readers
        if (options.description) {
          ScreenReaderUtils.announce(`Shortcut activated: ${options.description}`);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }
}

// Color contrast and theme utilities
export class AccessibilityTheme {
  /**
   * Check if color meets WCAG AA contrast requirements
   */
  static checkContrast(foreground: string, background: string): {
    ratio: number;
    passAA: boolean;
    passAAA: boolean;
  } {
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    return {
      ratio,
      passAA: ratio >= 4.5,
      passAAA: ratio >= 7
    };
  }

  /**
   * Calculate relative luminance of a color
   */
  private static getLuminance(color: string): number {
    // This is a simplified implementation
    // In production, you'd want a more robust color parser
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Convert hex color to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Apply high contrast theme
   */
  static applyHighContrast(): void {
    document.documentElement.classList.add('high-contrast');
    localStorage.setItem('cf1-high-contrast', 'true');
    ScreenReaderUtils.announce('High contrast mode enabled');
  }

  /**
   * Remove high contrast theme
   */
  static removeHighContrast(): void {
    document.documentElement.classList.remove('high-contrast');
    localStorage.removeItem('cf1-high-contrast');
    ScreenReaderUtils.announce('High contrast mode disabled');
  }

  /**
   * Check if high contrast is enabled
   */
  static isHighContrastEnabled(): boolean {
    return localStorage.getItem('cf1-high-contrast') === 'true' ||
           window.matchMedia('(prefers-contrast: high)').matches;
  }
}

// Form accessibility utilities
export class FormAccessibility {
  /**
   * Generate accessible error messages
   */
  static createErrorMessage(fieldId: string, message: string): string {
    const errorId = `${fieldId}-error`;
    
    // Create or update error element
    let errorElement = document.getElementById(errorId);
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      errorElement.className = 'text-red-600 text-sm mt-1';
      
      const field = document.getElementById(fieldId);
      if (field) {
        field.setAttribute('aria-describedby', errorId);
        field.setAttribute('aria-invalid', 'true');
        field.parentNode?.insertBefore(errorElement, field.nextSibling);
      }
    }
    
    errorElement.textContent = message;
    return errorId;
  }

  /**
   * Clear error message for a field
   */
  static clearErrorMessage(fieldId: string): void {
    const errorId = `${fieldId}-error`;
    const errorElement = document.getElementById(errorId);
    const field = document.getElementById(fieldId);
    
    if (errorElement) {
      errorElement.remove();
    }
    
    if (field) {
      field.removeAttribute('aria-describedby');
      field.removeAttribute('aria-invalid');
    }
  }

  /**
   * Create accessible field group
   */
  static createFieldGroup(legend: string, fields: HTMLElement[]): HTMLFieldSetElement {
    const fieldset = document.createElement('fieldset');
    const legendElement = document.createElement('legend');
    
    legendElement.textContent = legend;
    legendElement.className = 'text-lg font-medium text-gray-900 dark:text-white mb-4';
    
    fieldset.appendChild(legendElement);
    fields.forEach(field => fieldset.appendChild(field));
    
    return fieldset;
  }
}

// Export all utilities
export const Accessibility = {
  FocusManager,
  ScreenReaderUtils,
  KeyboardNavigation,
  AccessibilityTheme,
  FormAccessibility
};

export default Accessibility;