/**
 * CF1 Accessibility Provider
 * Global accessibility context and settings management
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AccessibilityTheme, ScreenReaderUtils, FocusManager, KeyboardNavigation } from '../utils/accessibility';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  announcements: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  saveFocus: () => void;
  restoreFocus: () => void;
  isHighContrastEnabled: boolean;
  isReducedMotionEnabled: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  announcements: true,
  keyboardNavigation: true,
  focusVisible: true
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface Props {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<Props> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('cf1-accessibility-settings');
    const savedSettings = saved ? JSON.parse(saved) : {};
    
    // Detect system preferences
    const systemPreferences = {
      highContrast: AccessibilityTheme.isHighContrastEnabled(),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
    
    return {
      ...defaultSettings,
      ...systemPreferences,
      ...savedSettings
    };
  });

  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(settings.highContrast);
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(settings.reducedMotion);

  // Update settings and persist to localStorage
  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('cf1-accessibility-settings', JSON.stringify(newSettings));
  };

  // Announce to screen readers
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (settings.announcements) {
      ScreenReaderUtils.announce(message, priority);
    }
  };

  // Focus management
  const saveFocus = () => FocusManager.saveFocus();
  const restoreFocus = () => FocusManager.restoreFocus();

  // Apply accessibility settings to DOM
  useEffect(() => {
    const root = document.documentElement;

    // High contrast
    if (settings.highContrast) {
      AccessibilityTheme.applyHighContrast();
      setIsHighContrastEnabled(true);
    } else {
      AccessibilityTheme.removeHighContrast();
      setIsHighContrastEnabled(false);
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
      setIsReducedMotionEnabled(true);
    } else {
      root.classList.remove('reduce-motion');
      setIsReducedMotionEnabled(false);
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    root.classList.add(`font-${settings.fontSize}`);

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible-enabled');
    } else {
      root.classList.remove('focus-visible-enabled');
    }

    // Keyboard navigation
    if (settings.keyboardNavigation) {
      root.classList.add('keyboard-navigation-enabled');
    } else {
      root.classList.remove('keyboard-navigation-enabled');
    }

  }, [settings]);

  // Listen for system preference changes
  useEffect(() => {
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleContrastChange = (e: MediaQueryListEvent) => {
      updateSettings({ highContrast: e.matches });
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      updateSettings({ reducedMotion: e.matches });
    };

    contrastQuery.addEventListener('change', handleContrastChange);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      contrastQuery.removeEventListener('change', handleContrastChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Set up global keyboard shortcuts
  useEffect(() => {
    const shortcuts: (() => void)[] = [];

    // Alt + H: Toggle high contrast
    shortcuts.push(
      KeyboardNavigation.addShortcut('h', () => {
        updateSettings({ highContrast: !settings.highContrast });
      }, {
        alt: true,
        description: 'Toggle high contrast mode'
      })
    );

    // Alt + M: Toggle reduced motion
    shortcuts.push(
      KeyboardNavigation.addShortcut('m', () => {
        updateSettings({ reducedMotion: !settings.reducedMotion });
      }, {
        alt: true,
        description: 'Toggle reduced motion'
      })
    );

    // Alt + +: Increase font size
    shortcuts.push(
      KeyboardNavigation.addShortcut('=', () => {
        const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
        const currentIndex = sizes.indexOf(settings.fontSize);
        const newIndex = Math.min(currentIndex + 1, sizes.length - 1);
        updateSettings({ fontSize: sizes[newIndex] });
      }, {
        alt: true,
        description: 'Increase font size'
      })
    );

    // Alt + -: Decrease font size
    shortcuts.push(
      KeyboardNavigation.addShortcut('-', () => {
        const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
        const currentIndex = sizes.indexOf(settings.fontSize);
        const newIndex = Math.max(currentIndex - 1, 0);
        updateSettings({ fontSize: sizes[newIndex] });
      }, {
        alt: true,
        description: 'Decrease font size'
      })
    );

    // Cleanup
    return () => {
      shortcuts.forEach(cleanup => cleanup());
    };
  }, [settings]);

  // Initialize screen reader announcements
  useEffect(() => {
    announce('CF1 Platform accessibility features initialized');
  }, []);

  const contextValue: AccessibilityContextType = {
    settings,
    updateSettings,
    announce,
    saveFocus,
    restoreFocus,
    isHighContrastEnabled,
    isReducedMotionEnabled
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;