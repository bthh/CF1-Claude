import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Settings } from 'lucide-react';
import NotificationSettings from '../components/Notifications/NotificationSettings';

const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <button
              onClick={() => navigate('/dashboard/activity')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Notifications</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
            <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
              <Settings className="w-4 h-4" />
              <span className="font-medium">SETTINGS</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your notification preferences and delivery settings
          </p>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Dashboard
        </button>
        <span>›</span>
        <button
          onClick={() => navigate('/dashboard/activity')}
          className="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Notifications
        </button>
        <span>›</span>
        <span className="text-gray-900 dark:text-white font-medium">Settings</span>
      </nav>

      {/* Settings Content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-600 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage how and when you receive notifications from the CF1 platform
          </p>
        </div>

        <div className="p-6">
          <NotificationSettings
            isOpen={true}
            onClose={() => navigate('/dashboard/activity')}
            isFullPage={true}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;