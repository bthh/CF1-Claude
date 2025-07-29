/**
 * CF1 Accessibility Settings Panel
 * User interface for accessibility preferences
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Eye, 
  Type, 
  MousePointer, 
  Volume2, 
  VolumeX, 
  Contrast,
  Zap,
  ZapOff,
  Check,
  X,
  Info
} from 'lucide-react';
import { useAccessibility } from '../../providers/AccessibilityProvider';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, announce } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'display' | 'interaction' | 'audio'>('display');

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
    announce(`${key} ${Array.isArray(value) ? 'changed' : value ? 'enabled' : 'disabled'}`);
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Small', sample: 'Aa' },
    { value: 'medium', label: 'Medium', sample: 'Aa' },
    { value: 'large', label: 'Large', sample: 'Aa' },
    { value: 'extra-large', label: 'Extra Large', sample: 'Aa' }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-labelledby="accessibility-panel-title"
        aria-describedby="accessibility-panel-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 
              id="accessibility-panel-title"
              className="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
            >
              <Settings className="w-5 h-5 mr-2" />
              Accessibility Settings
            </h2>
            <p 
              id="accessibility-panel-description"
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
            >
              Customize your experience for better accessibility
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close accessibility settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            {[
              { id: 'display', label: 'Display', icon: Eye },
              { id: 'interaction', label: 'Interaction', icon: MousePointer },
              { id: 'audio', label: 'Audio', icon: Volume2 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`${id}-panel`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Display Tab */}
          {activeTab === 'display' && (
            <div id="display-panel" role="tabpanel" aria-labelledby="display-tab" className="space-y-6">
              {/* High Contrast */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Contrast className="w-5 h-5 mr-2 text-gray-600" />
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      High Contrast Mode
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-7">
                    Increases color contrast for better visibility
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('highContrast', !settings.highContrast)}
                  className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.highContrast ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={settings.highContrast}
                  aria-describedby="high-contrast-description"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    {settings.reducedMotion ? (
                      <ZapOff className="w-5 h-5 mr-2 text-gray-600" />
                    ) : (
                      <Zap className="w-5 h-5 mr-2 text-gray-600" />
                    )}
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Reduce Motion
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-7">
                    Minimizes animations and transitions
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('reducedMotion', !settings.reducedMotion)}
                  className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={settings.reducedMotion}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Font Size */}
              <div>
                <div className="flex items-center mb-3">
                  <Type className="w-5 h-5 mr-2 text-gray-600" />
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Font Size
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3 ml-7">
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSettingChange('fontSize', option.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.fontSize === option.value
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                      }`}
                      role="radio"
                      aria-checked={settings.fontSize === option.value}
                    >
                      <div className="text-center">
                        <div className={`font-bold ${
                          option.value === 'small' ? 'text-sm' :
                          option.value === 'medium' ? 'text-base' :
                          option.value === 'large' ? 'text-lg' : 'text-xl'
                        }`}>
                          {option.sample}
                        </div>
                        <div className="text-xs mt-1">{option.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interaction Tab */}
          {activeTab === 'interaction' && (
            <div id="interaction-panel" role="tabpanel" className="space-y-6">
              {/* Keyboard Navigation */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Enhanced Keyboard Navigation
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Improved keyboard shortcuts and focus indicators
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('keyboardNavigation', !settings.keyboardNavigation)}
                  className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.keyboardNavigation ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={settings.keyboardNavigation}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Focus Visible */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Enhanced Focus Indicators
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    More visible focus outlines for keyboard navigation
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('focusVisible', !settings.focusVisible)}
                  className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.focusVisible ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={settings.focusVisible}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.focusVisible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Keyboard Shortcuts Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Keyboard Shortcuts
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                      <li><kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">Alt + H</kbd> Toggle high contrast</li>
                      <li><kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">Alt + M</kbd> Toggle reduced motion</li>
                      <li><kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">Alt + +</kbd> Increase font size</li>
                      <li><kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">Alt + -</kbd> Decrease font size</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audio Tab */}
          {activeTab === 'audio' && (
            <div id="audio-panel" role="tabpanel" className="space-y-6">
              {/* Screen Reader Announcements */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    {settings.announcements ? (
                      <Volume2 className="w-5 h-5 mr-2 text-gray-600" />
                    ) : (
                      <VolumeX className="w-5 h-5 mr-2 text-gray-600" />
                    )}
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Screen Reader Announcements
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-7">
                    Announces important changes and updates
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('announcements', !settings.announcements)}
                  className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.announcements ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={settings.announcements}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.announcements ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Settings are saved automatically
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;