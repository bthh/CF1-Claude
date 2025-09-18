import React, { useState, useMemo } from 'react';
import {
  X,
  Settings,
  Bell,
  BellOff,
  Mail,
  Clock,
  Save,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useNotificationSystemStore, NotificationType, InvestorNotificationType, CreatorNotificationType } from '../../store/notificationSystemStore';
import { useNotifications } from '../../hooks/useNotifications';
import { useSessionStore, SessionRole } from '../../store/sessionStore';
import { useVerificationStore } from '../../store/verificationStore';
import { useAuthStore } from '../../store/authStore';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  isFullPage?: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  isFullPage = false
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
  const { selectedRole } = useSessionStore();
  const { profile, basicVerification } = useVerificationStore();
  const { user } = useAuthStore();
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [localEnabled, setLocalEnabled] = useState(isEnabled);
  const [hasChanges, setHasChanges] = useState(false);

  // Role-based notification types
  const investorNotificationTypes: { type: InvestorNotificationType; label: string; description: string }[] = [
    {
      type: 'proposal_new',
      label: 'New Proposals',
      description: 'Notifies for all new proposals and proposals ending in 1 day'
    },
    {
      type: 'proposal_ending',
      label: 'Proposals Ending Soon',
      description: 'Alerts when proposals you might be interested in are ending soon'
    },
    {
      type: 'proposal_invested_alert',
      label: 'Investment Alerts',
      description: 'All proposal alerts for proposals you have already invested in'
    },
    {
      type: 'voting_asset_owned',
      label: 'Voting Opportunities',
      description: 'Voting notifications only for assets that you own'
    },
    {
      type: 'dividend_received',
      label: 'Dividend Received',
      description: 'Shows all dividends received for all assets you own'
    },
    {
      type: 'token_unlock',
      label: 'Token Unlock',
      description: 'When your tokens become available for trading'
    },
    {
      type: 'system_alert',
      label: 'System Alerts',
      description: 'Platform maintenance, security alerts, and general notifications'
    }
  ];

  const creatorNotificationTypes: { type: CreatorNotificationType; label: string; description: string }[] = [
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
    }
  ];

  // Get notification types based on user role
  const notificationTypes = useMemo(() => {
    const baseTypes = [...investorNotificationTypes];

    // Add creator notifications if user is a creator, super_admin, or owner
    if (selectedRole === 'creator' || selectedRole === 'super_admin' || selectedRole === 'owner') {
      baseTypes.push(...creatorNotificationTypes);
    }

    return baseTypes;
  }, [selectedRole]);

  // Check if user has email set up for email notifications
  // Try multiple sources: user.email, profile.email, basicVerification.email
  const hasEmail = useMemo(() => {
    const userEmail = user?.email && user.email.trim() !== '';
    const profileEmail = profile?.email && profile.email.trim() !== '';
    const basicEmail = basicVerification?.email && basicVerification.email.trim() !== '';

    return userEmail || profileEmail || basicEmail;
  }, [user?.email, profile?.email, basicVerification?.email]);

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
      // Validate email if email notifications are enabled
      if (localPreferences.enableEmail && !hasEmail) {
        error('Please add an email address to your profile to enable email notifications');
        return;
      }

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

  const renderSettingsContent = () => (
    <div className="space-y-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white">In-App Notifications</span>
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
                      disabled={!hasEmail}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</span>
                  </label>
                  {!hasEmail && (
                    <div className="flex items-center mt-1 text-xs text-amber-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      <span>Add email to profile first</span>
                    </div>
                  )}
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
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Notification Categories
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Choose which types of notifications to receive and how you'd like to receive them.
            </p>
          </div>

          <div className="space-y-4">
            {/* Investor notifications - show for all users */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Investor Notifications</h4>
                {investorNotificationTypes.map(({ type, label, description }) => {
                  const categoryPref = localPreferences.categories[type];

                  return (
                    <div key={type} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={categoryPref?.enabled || false}
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
                      </div>

                      {categoryPref?.enabled && (
                        <div className="flex items-center space-x-6 text-sm">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categoryPref.inApp}
                              onChange={(e) => handleCategoryChange(type, 'inApp', e.target.checked)}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Bell className="w-4 h-4 mr-1 text-blue-600" />
                            <span className="text-gray-700 dark:text-gray-300">In-App</span>
                          </label>

                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categoryPref.email}
                              onChange={(e) => handleCategoryChange(type, 'email', e.target.checked)}
                              disabled={!hasEmail}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <Mail className="w-4 h-4 mr-1 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">Email</span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Creator notifications for creators, super_admin, and owner */}
            {(selectedRole === 'creator' || selectedRole === 'super_admin' || selectedRole === 'owner') && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Creator Notifications</h4>
                {creatorNotificationTypes.map(({ type, label, description }) => {
                  const categoryPref = localPreferences.categories[type];

                  return (
                    <div key={type} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={categoryPref?.enabled || false}
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
                      </div>

                      {categoryPref?.enabled && (
                        <div className="flex items-center space-x-6 text-sm">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categoryPref.inApp}
                              onChange={(e) => handleCategoryChange(type, 'inApp', e.target.checked)}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Bell className="w-4 h-4 mr-1 text-blue-600" />
                            <span className="text-gray-700 dark:text-gray-300">In-App</span>
                          </label>

                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categoryPref.email}
                              onChange={(e) => handleCategoryChange(type, 'email', e.target.checked)}
                              disabled={!hasEmail}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <Mail className="w-4 h-4 mr-1 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">Email</span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderFooter = () => (
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
  );

  // Full page mode (no overlay, no fixed positioning)
  if (isFullPage) {
    return (
      <div className="w-full space-y-8">
        {renderSettingsContent()}

        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          {renderFooter()}
        </div>
      </div>
    );
  }

  // Modal mode (original overlay layout)
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

        <div className="p-6">
          {renderSettingsContent()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          {renderFooter()}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;