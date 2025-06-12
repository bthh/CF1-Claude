import { useState, useEffect, useCallback } from 'react';

interface UseMobileNavigationOptions {
  breakpoint?: number; // px width where mobile nav kicks in
  enableSwipeGestures?: boolean;
  autoCloseOnRouteChange?: boolean;
}

export const useMobileNavigation = (options: UseMobileNavigationOptions = {}) => {
  const {
    breakpoint = 1024, // lg breakpoint
    enableSwipeGestures = true,
    autoCloseOnRouteChange = true
  } = options;

  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if we're in mobile viewport
  const checkIsMobile = useCallback(() => {
    const isMobileViewport = window.innerWidth < breakpoint;
    setIsMobile(isMobileViewport);
    
    // Auto-close navigation when switching to desktop
    if (!isMobileViewport && isOpen) {
      setIsOpen(false);
    }
  }, [breakpoint, isOpen]);

  // Handle window resize
  useEffect(() => {
    checkIsMobile();
    
    const handleResize = () => {
      checkIsMobile();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkIsMobile]);

  // Handle route changes
  useEffect(() => {
    if (autoCloseOnRouteChange && isOpen) {
      closeNavigation();
    }
  }, [autoCloseOnRouteChange]); // Note: Not including isOpen to avoid infinite re-renders

  // Navigation controls
  const openNavigation = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsOpen(true);
      
      // Prevent body scroll when mobile nav is open
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isAnimating]);

  const closeNavigation = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsOpen(false);
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isAnimating]);

  const toggleNavigation = useCallback(() => {
    if (isOpen) {
      closeNavigation();
    } else {
      openNavigation();
    }
  }, [isOpen, openNavigation, closeNavigation]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeNavigation();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, closeNavigation]);

  // Touch/swipe gesture support
  useEffect(() => {
    if (!enableSwipeGestures || !isMobile) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].screenX;
      touchStartY = event.changedTouches[0].screenY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      touchEndX = event.changedTouches[0].screenX;
      touchEndY = event.changedTouches[0].screenY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const swipeThreshold = 50;
      
      // Only trigger if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0 && touchStartX < 50 && !isOpen) {
          // Swipe right from left edge - open navigation
          openNavigation();
        } else if (deltaX < 0 && isOpen) {
          // Swipe left - close navigation
          closeNavigation();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enableSwipeGestures, isMobile, isOpen, openNavigation, closeNavigation]);

  // Focus management for accessibility
  const focusManagement = useCallback((navElement: HTMLElement | null) => {
    if (!navElement) return;

    if (isOpen) {
      // Focus first focusable element in navigation
      const focusableElements = navElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  return {
    // State
    isMobile,
    isOpen,
    isAnimating,
    
    // Actions
    openNavigation,
    closeNavigation,
    toggleNavigation,
    
    // Utilities
    focusManagement,
    
    // CSS classes for styling
    overlayClasses: `fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
      isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
    }`,
    
    navigationClasses: `fixed top-0 left-0 h-full bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`,
    
    // ARIA attributes for accessibility
    ariaAttributes: {
      'aria-expanded': isOpen,
      'aria-controls': 'mobile-navigation',
      'aria-label': 'Toggle navigation menu'
    }
  };
};