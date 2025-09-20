import React from 'react';

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
  if (!isOpen && !isFullPage) return null;

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Notification Settings
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Notification settings functionality will be implemented here.
      </p>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Close
      </button>
    </div>
  );
};

export default NotificationSettings;