import { useEffect, useCallback, useRef } from 'react';

// Hook for focus management
export const useFocusManagement = () => {
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  const getFocusableElements = useCallback((container: HTMLElement = document.body) => {
    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, [focusableSelectors]);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [getFocusableElements]);

  const restoreFocus = useCallback(() => {
    const lastFocusedElement = document.querySelector('[data-was-focused]') as HTMLElement;
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement.removeAttribute('data-was-focused');
    }
  }, []);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      activeElement.setAttribute('data-was-focused', 'true');
    }
  }, []);

  return {
    getFocusableElements,
    trapFocus,
    restoreFocus,
    saveFocus
  };
};

// Hook for screen reader announcements
export const useScreenReader = () => {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
    announcementRef.current = liveRegion;

    return () => {
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return { announce };
};

// Hook for ARIA attributes management
export const useARIA = () => {
  const setARIAExpanded = useCallback((element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString());
  }, []);

  const setARIAPressed = useCallback((element: HTMLElement, pressed: boolean) => {
    element.setAttribute('aria-pressed', pressed.toString());
  }, []);

  const setARIASelected = useCallback((element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString());
  }, []);

  const setARIAChecked = useCallback((element: HTMLElement, checked: boolean | 'mixed') => {
    element.setAttribute('aria-checked', checked.toString());
  }, []);

  const setARIAHidden = useCallback((element: HTMLElement, hidden: boolean) => {
    if (hidden) {
      element.setAttribute('aria-hidden', 'true');
    } else {
      element.removeAttribute('aria-hidden');
    }
  }, []);

  const setARIALabel = useCallback((element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label);
  }, []);

  const setARIALabelledBy = useCallback((element: HTMLElement, labelId: string) => {
    element.setAttribute('aria-labelledby', labelId);
  }, []);

  const setARIADescribedBy = useCallback((element: HTMLElement, descriptionId: string) => {
    element.setAttribute('aria-describedby', descriptionId);
  }, []);

  return {
    setARIAExpanded,
    setARIAPressed,
    setARIASelected,
    setARIAChecked,
    setARIAHidden,
    setARIALabel,
    setARIALabelledBy,
    setARIADescribedBy
  };
};

// Hook for reduced motion preferences
export const useReducedMotion = () => {
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      document.documentElement.setAttribute(
        'data-reduced-motion', 
        mediaQuery.matches.toString()
      );
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { prefersReducedMotion };
};

// Hook for color contrast and color scheme
export const useColorScheme = () => {
  const prefersDarkMode = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  const prefersHighContrast = useCallback(() => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }, []);

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const updateColorScheme = () => {
      document.documentElement.setAttribute(
        'data-color-scheme', 
        darkModeQuery.matches ? 'dark' : 'light'
      );
      document.documentElement.setAttribute(
        'data-high-contrast', 
        highContrastQuery.matches.toString()
      );
    };

    updateColorScheme();
    darkModeQuery.addEventListener('change', updateColorScheme);
    highContrastQuery.addEventListener('change', updateColorScheme);

    return () => {
      darkModeQuery.removeEventListener('change', updateColorScheme);
      highContrastQuery.removeEventListener('change', updateColorScheme);
    };
  }, []);

  return { prefersDarkMode, prefersHighContrast };
};

// Main accessibility hook that combines all features
export const useAccessibility = () => {
  const focusManagement = useFocusManagement();
  const screenReader = useScreenReader();
  const aria = useARIA();
  
  useReducedMotion();
  useColorScheme();

  // Skip link functionality
  const addSkipLink = useCallback((targetId: string, linkText: string = 'Skip to main content') => {
    const existingSkipLink = document.getElementById('skip-link');
    if (existingSkipLink) return;

    const skipLink = document.createElement('a');
    skipLink.id = 'skip-link';
    skipLink.href = `#${targetId}`;
    skipLink.textContent = linkText;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg';
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }, []);

  // Keyboard navigation enhancement
  const enhanceKeyboardNavigation = useCallback(() => {
    // Add visible focus indicators
    const style = document.createElement('style');
    style.textContent = `
      .focus-visible:focus {
        outline: 2px solid #3B82F6;
        outline-offset: 2px;
      }
      
      .focus-visible:focus:not(:focus-visible) {
        outline: none;
      }
      
      /* High contrast mode adjustments */
      @media (prefers-contrast: high) {
        .focus-visible:focus {
          outline: 3px solid;
          outline-offset: 3px;
        }
      }
      
      /* Reduced motion adjustments */
      @media (prefers-reduced-motion: reduce) {
        *, ::before, ::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    
    if (!document.head.querySelector('#accessibility-styles')) {
      style.id = 'accessibility-styles';
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    addSkipLink('main-content');
    enhanceKeyboardNavigation();
  }, [addSkipLink, enhanceKeyboardNavigation]);

  return {
    ...focusManagement,
    ...screenReader,
    ...aria,
    addSkipLink,
    enhanceKeyboardNavigation
  };
};