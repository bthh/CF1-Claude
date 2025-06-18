import React, { useState } from 'react';
import {
  X,
  Settings,
  Bell,
  BellOff,
  Mail,
  Smartphone,
  Clock,
  Save,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useNotificationSystemStore, NotificationType, NotificationPriority } from '../../store/notificationSystemStore';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose
}) => {
  const {
    preferences,
    isEnabled,
    updatePreferences,
    updateCategoryPreference,
    enableNotifications,
    disableNotifications
  } = useNotificationSystemStore();

  const { success, error } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [localEnabled, setLocalEnabled] = useState(isEnabled);
  const [hasChanges, setHasChanges] = useState(false);

  const notificationTypes: { type: NotificationType; label: string; description: string }[] = [
    {
      type: 'proposal_approved',
      label: 'Proposal Approved',
      description: 'When your asset proposals are approved'
    },
    {
      type: 'proposal_rejected',
      label: 'Proposal Rejected',
      description: 'When your asset proposals are rejected'
    },
    {
      type: 'proposal_changes_requested',
      label: 'Changes Requested',
      description: 'When admins request changes to your proposals'
    },
    {
      type: 'governance_voting_started',
      label: 'Voting Started',
      description: 'When governance voting begins'
    },
    {
      type: 'governance_voting_ended',
      label: 'Voting Ended',
      description: 'When governance voting ends'
    },
    {
      type: 'investment_confirmed',
      label: 'Investment Confirmed',
      description: 'When your investments are processed'
    },
    {
      type: 'investment_failed',
      label: 'Investment Failed',
      description: 'When your investments fail to process'
    },
    {
      type: 'dividend_received',
      label: 'Dividend Received',
      description: 'When you receive dividend payments'
    },
    {
      type: 'token_unlock',
      label: 'Token Unlock',
      description: 'When your tokens become available'
    },
    {
      type: 'kyc_approved',
      label: 'KYC Approved',
      description: 'When your identity verification is approved'
    },
    {
      type: 'kyc_rejected',
      label: 'KYC Rejected',
      description: 'When your identity verification is rejected'
    },
    {
      type: 'system_maintenance',
      label: 'System Maintenance',
      description: 'Platform maintenance notifications'
    },
    {
      type: 'security_alert',
      label: 'Security Alerts',
      description: 'Important security notifications'
    },
    {
      type: 'general',
      label: 'General',
      description: 'General platform notifications'
    }
  ];

  const priorityOptions: { value: NotificationPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleGlobalEnabledChange = (enabled: boolean) => {
    setLocalEnabled(enabled);
    setHasChanges(true);
  };

  const handleGlobalPreferenceChange = (key: keyof typeof localPreferences, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleCategoryChange = (type: NotificationType, key: string, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: {
          ...prev.categories[type],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleQuietHoursChange = (key: string, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      updatePreferences(localPreferences);
      if (localEnabled !== isEnabled) {
        localEnabled ? enableNotifications() : disableNotifications();
      }
      setHasChanges(false);
      success('Notification settings saved successfully');
    } catch (err) {
      error('Failed to save notification settings');
    }
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setLocalEnabled(isEnabled);
    setHasChanges(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Settings Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notification Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Global Settings */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Global Settings</h3>
            
            {/* Enable/Disable Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {localEnabled ? (
                  <Bell className="w-5 h-5 text-green-600" />
                ) : (
                  <BellOff className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {localEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Turn all notifications on or off
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localEnabled}
                  onChange={(e) => handleGlobalEnabledChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Notification Channels */}
            {localEnabled && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Notification Channels</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* In-App Notifications */}
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localPreferences.enableInApp}
                          onChange={(e) => handleGlobalPreferenceChange('enableInApp', e.target.checked)}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">In-App</span>
                      </label>
                    </div>
                  </div>

                  {/* Email Notifications */}
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <Mail className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localPreferences.enableEmail}
                          onChange={(e) => handleGlobalPreferenceChange('enableEmail', e.target.checked)}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Email</span>
                      </label>
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localPreferences.enablePush}
                          onChange={(e) => handleGlobalPreferenceChange('enablePush', e.target.checked)}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Push</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quiet Hours */}
            {localEnabled && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Quiet Hours</h4>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences.quietHours.enabled}
                      onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Enable quiet hours (only urgent notifications)
                    </span>
                  </label>

                  {localPreferences.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={localPreferences.quietHours.startTime}
                          onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={localPreferences.quietHours.endTime}
                          onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Max Notifications */}
            {localEnabled && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum Notifications to Keep
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={localPreferences.maxNotifications}
                  onChange={(e) => handleGlobalPreferenceChange('maxNotifications', parseInt(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Older notifications will be automatically removed
                </p>
              </div>
            )}
          </div>

          {/* Category Settings */}
          {localEnabled && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Notification Categories
              </h3>
              
              <div className="space-y-4">
                {notificationTypes.map(({ type, label, description }) => {
                  const categoryPref = localPreferences.categories[type];
                  
                  return (
                    <div key={type} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={categoryPref.enabled}
                                onChange={(e) => handleCategoryChange(type, 'enabled', e.target.checked)}
                                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {label}
                              </span>
                            </label>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {description}
                          </p>
                        </div>
                        
                        <select
                          value={categoryPref.priority}
                          onChange={(e) => handleCategoryChange(type, 'priority', e.target.value)}
                          disabled={!categoryPref.enabled}
                          className="ml-4 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        >
                          {priorityOptions.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      {categoryPref.enabled && (
                        <div className="flex items-center space-x-4 text-sm">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categoryPref.inApp}
                              onChange={(e) => handleCategoryChange(type, 'inApp', e.target.checked)}
                              className="mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Bell className="w-3 h-3 mr-1 text-blue-600" />
                            <span className="text-gray-700 dark:text-gray-300">In-App</span>
                          </label>

                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categoryPref.email}
                              onChange={(e) => handleCategoryChange(type, 'email', e.target.checked)}
                              className="mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Mail className="w-3 h-3 mr-1 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">Email</span>
                          </label>

                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categoryPref.push}
                              onChange={(e) => handleCategoryChange(type, 'push', e.target.checked)}
                              className="mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Smartphone className="w-3 h-3 mr-1 text-purple-600" />
                            <span className="text-gray-700 dark:text-gray-300">Push</span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;