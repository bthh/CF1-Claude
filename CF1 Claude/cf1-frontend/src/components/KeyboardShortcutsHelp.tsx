import React, { useState, useEffect } from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import type { KeyboardShortcut } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Record<string, KeyboardShortcut[]>;
  formatShortcut: (shortcut: KeyboardShortcut) => string;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
  shortcuts,
  formatShortcut
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categoryOrder = ['global', 'navigation', 'actions', 'filtering'];
  const sortedCategories = Object.keys(shortcuts).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'global':
        return <Command className="w-4 h-4" />;
      case 'navigation':
        return <div className="w-4 h-4 bg-blue-500 rounded-full" />;
      case 'actions':
        return <div className="w-4 h-4 bg-green-500 rounded-sm" />;
      case 'filtering':
        return <div className="w-4 h-4 bg-purple-500 rounded-sm transform rotate-45" />;
      default:
        return <Keyboard className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-6">
            {sortedCategories.map((category) => (
              <div key={category}>
                <div className="flex items-center space-x-2 mb-3">
                  {getCategoryIcon(category)}
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    {category}
                  </h4>
                </div>
                
                <div className="space-y-2">
                  {shortcuts[category].map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              💡 Tips
            </h5>
            <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Shortcuts work on most pages, but not when typing in form fields</li>
              <li>• Use <kbd className="px-1 bg-blue-200 dark:bg-blue-800 rounded">?</kbd> anywhere to open this help</li>
              <li>• Press <kbd className="px-1 bg-blue-200 dark:bg-blue-800 rounded">Esc</kbd> to close modals and clear focus</li>
              <li>• Navigation shortcuts work from any page</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Press <kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> to close
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};