import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
}

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true,
    focusVisible: true
  });

  useEffect(() => {
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const savedSettings = localStorage.getItem('cf1_accessibility_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
    } else {
      setSettings(prev => ({
        ...prev,
        highContrast: highContrastQuery.matches,
        reducedMotion: reducedMotionQuery.matches
      }));
    }

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    highContrastQuery.addEventListener('change', handleHighContrastChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('cf1_accessibility_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const applyAccessibilityClasses = useCallback(() => {
    const classes = [];
    
    if (settings.highContrast) classes.push('high-contrast');
    if (settings.reducedMotion) classes.push('reduced-motion');
    if (settings.largeText) classes.push('large-text');
    if (settings.focusVisible) classes.push('focus-visible');
    
    return classes.join(' ');
  }, [settings]);

  return {
    settings,
    updateSetting,
    applyAccessibilityClasses
  };
};

export const useKeyboardNavigation = (
  elements: (HTMLElement | null)[],
  options: {
    loop?: boolean;
    autoFocus?: boolean;
    onEscape?: () => void;
  } = {}
) => {
  const { loop = true, autoFocus = false, onEscape } = options;
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && elements[0]) {
      elements[0].focus();
    }
  }, [autoFocus, elements]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const validElements = elements.filter(el => el !== null);
    
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setCurrentIndex(prev => {
          const next = prev + 1;
          const newIndex = next >= validElements.length ? (loop ? 0 : prev) : next;
          validElements[newIndex]?.focus();
          return newIndex;
        });
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setCurrentIndex(prev => {
          const next = prev - 1;
          const newIndex = next < 0 ? (loop ? validElements.length - 1 : prev) : next;
          validElements[newIndex]?.focus();
          return newIndex;
        });
        break;
        
      case 'Home':
        e.preventDefault();
        setCurrentIndex(0);
        validElements[0]?.focus();
        break;
        
      case 'End':
        e.preventDefault();
        const lastIndex = validElements.length - 1;
        setCurrentIndex(lastIndex);
        validElements[lastIndex]?.focus();
        break;
        
      case 'Escape':
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        break;
    }
  }, [elements, loop, onEscape]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return {
    containerRef,
    currentIndex,
    setCurrentIndex
  };
};

export const useScreenReader = () => {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const LiveRegion = useCallback(() => (
    <div
      ref={announcementRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  ), []);

  return { announce, LiveRegion };
};