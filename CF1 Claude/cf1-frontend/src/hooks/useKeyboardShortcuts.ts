import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
  disabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
  preventDefault = true
}: UseKeyboardShortcutsOptions) => {
  const shortcutsRef = useRef(shortcuts);
  
  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when user is typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      // Allow certain global shortcuts even in inputs
      const globalShortcuts = shortcutsRef.current.filter(s => 
        s.category === 'global' && !s.disabled
      );
      
      for (const shortcut of globalShortcuts) {
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.altKey === !!shortcut.altKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.metaKey === !!shortcut.metaKey
        ) {
          if (preventDefault) {
            event.preventDefault();
          }
          shortcut.action();
          return;
        }
      }
      return;
    }

    // Check all shortcuts
    for (const shortcut of shortcutsRef.current) {
      if (shortcut.disabled) continue;
      
      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.altKey === !!shortcut.altKey &&
        !!event.shiftKey === !!shortcut.shiftKey &&
        !!event.metaKey === !!shortcut.metaKey
      ) {
        if (preventDefault) {
          event.preventDefault();
        }
        shortcut.action();
        return;
      }
    }
  }, [enabled, preventDefault]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  // Generate help text for shortcuts
  const getShortcutHelp = useCallback(() => {
    const categories = shortcutsRef.current.reduce((acc, shortcut) => {
      if (shortcut.disabled) return acc;
      
      const category = shortcut.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    }, {} as Record<string, KeyboardShortcut[]>);

    return categories;
  }, []);

  // Format shortcut for display
  const formatShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const parts = [];
    
    if (shortcut.ctrlKey || shortcut.metaKey) {
      parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.altKey) {
      parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
    }
    if (shortcut.shiftKey) {
      parts.push('⇧');
    }
    
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(' + ');
  }, []);

  return {
    getShortcutHelp,
    formatShortcut
  };
};

// Common keyboard shortcuts for the app
export const useCommonShortcuts = () => {
  const shortcuts: KeyboardShortcut[] = [
    // Global shortcuts
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('input[type="text"], input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: 'Focus search',
      category: 'global'
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open modals or dropdowns
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
        
        // Close modals by clicking backdrop or close button
        const backdrop = document.querySelector('[role="dialog"] + div, .modal-backdrop');
        const closeButton = document.querySelector('[role="dialog"] button[aria-label*="close" i], .modal [data-close]');
        
        if (closeButton) {
          (closeButton as HTMLElement).click();
        } else if (backdrop) {
          (backdrop as HTMLElement).click();
        }
      },
      description: 'Close modal/dropdown',
      category: 'global'
    },
    {
      key: '?',
      shiftKey: true,
      action: () => {
        // Could show help modal
        console.log('Show keyboard shortcuts help');
      },
      description: 'Show help',
      category: 'global'
    },
    
    // Navigation shortcuts
    {
      key: 'h',
      action: () => window.location.href = '/',
      description: 'Go to dashboard',
      category: 'navigation'
    },
    {
      key: 'm',
      action: () => window.location.href = '/marketplace',
      description: 'Go to marketplace',
      category: 'navigation'
    },
    {
      key: 'p',
      action: () => window.location.href = '/portfolio',
      description: 'Go to portfolio',
      category: 'navigation'
    },
    {
      key: 'l',
      action: () => window.location.href = '/launchpad',
      description: 'Go to launchpad',
      category: 'navigation'
    },
    {
      key: 'g',
      action: () => window.location.href = '/governance',
      description: 'Go to governance',
      category: 'navigation'
    },
    
    // Actions
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        const createButton = document.querySelector('button[href*="create"], a[href*="create"], button:contains("Create"), button:contains("New")') as HTMLElement;
        if (createButton) {
          createButton.click();
        }
      },
      description: 'Create new item',
      category: 'actions'
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => {
        window.location.reload();
      },
      description: 'Refresh page',
      category: 'actions'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        const filterButton = document.querySelector('button[aria-label*="filter" i], button:contains("Filter")') as HTMLElement;
        if (filterButton) {
          filterButton.click();
        }
      },
      description: 'Open filters',
      category: 'actions'
    }
  ];

  return shortcuts;
};