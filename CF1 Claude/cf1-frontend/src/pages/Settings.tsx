import React, { useState } from 'react';
import { 
  Bell, 
  Shield, 
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  Key,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Eye,
  Type,
  MousePointer,
  Volume2
} from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';
import { AccessibilityPanel } from '../components/Accessibility/AccessibilityPanel';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    investmentHistory: false,
    performanceData: true
  });

  const [theme, setTheme] = useState('light');
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  
  const { settings, isHighContrastEnabled, isReducedMotionEnabled } = useAccessibility();

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences and security settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about your investments via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={() => handleNotificationChange('email')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get real-time alerts on your device</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={() => handleNotificationChange('push')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive important alerts via text message</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Marketing Communications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive news and promotional content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.marketing}
                    onChange={() => handleNotificationChange('marketing')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy & Security</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Profile Visibility</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Public Profile</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Allow others to see your basic profile information</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.profileVisible}
                        onChange={() => handlePrivacyChange('profileVisible')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Investment History</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Share your investment activity with the community</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.investmentHistory}
                        onChange={() => handlePrivacyChange('investmentHistory')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Performance Data</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Include your returns in platform analytics</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.performanceData}
                        onChange={() => handlePrivacyChange('performanceData')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-gray-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Security Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                      </div>
                    </div>
                    <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">Not Enabled</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* App Preferences */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">App Preferences</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred app appearance</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      theme === 'light' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm">Dark</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Language</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Select your preferred language</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Currency</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Default currency for displaying values</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="usd">USD ($)</option>
                  <option value="eur">EUR (€)</option>
                  <option value="gbp">GBP (£)</option>
                  <option value="btc">BTC (₿)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Accessibility</h2>
            </div>

            <div className="space-y-6">
              {/* Current Settings Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Current Settings</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Type className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Font Size:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{settings.fontSize}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">High Contrast:</span>
                    <span className={`font-medium ${isHighContrastEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {isHighContrastEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MousePointer className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Reduced Motion:</span>
                    <span className={`font-medium ${isReducedMotionEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {isReducedMotionEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Announcements:</span>
                    <span className={`font-medium ${settings.announcements ? 'text-green-600' : 'text-gray-500'}`}>
                      {settings.announcements ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Open Accessibility Panel Button */}
              <button
                onClick={() => setShowAccessibilityPanel(true)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Customize Accessibility Settings</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Adjust display, interaction, and audio preferences</p>
                  </div>
                </div>
                <div className="text-gray-400">→</div>
              </button>

              {/* Quick Actions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Keyboard Shortcuts</h4>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex justify-between">
                    <span>Toggle High Contrast:</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs">Alt + H</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Toggle Reduced Motion:</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs">Alt + M</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Increase Font Size:</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs">Alt + +</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Decrease Font Size:</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs">Alt + -</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Actions */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Account Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Download your account data</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Import Data</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Upload external portfolio data</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Contact Support</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Get help with your account</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-red-900 dark:text-red-400 mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Danger Zone</span>
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-400">Delete Account</p>
                    <p className="text-xs text-red-600 dark:text-red-500">Permanently delete your account</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Panel */}
      <AccessibilityPanel
        isOpen={showAccessibilityPanel}
        onClose={() => setShowAccessibilityPanel(false)}
      />
    </div>
  );
};

export default Settings;