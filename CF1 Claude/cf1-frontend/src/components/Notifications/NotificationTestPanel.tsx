import React from 'react';
import { Bell, TestTube } from 'lucide-react';
import { useNotificationService } from '../../services/notificationService';
import { NotificationType } from '../../store/notificationSystemStore';

const NotificationTestPanel: React.FC = () => {
  const notificationService = useNotificationService();

  const testNotifications: { type: NotificationType; label: string; description: string }[] = [
    {
      type: 'proposal_approved',
      label: 'Proposal Approved',
      description: 'Test proposal approval notification'
    },
    {
      type: 'proposal_rejected',
      label: 'Proposal Rejected',
      description: 'Test proposal rejection notification'
    },
    {
      type: 'governance_voting_started',
      label: 'Governance Vote',
      description: 'Test governance voting notification'
    },
    {
      type: 'investment_confirmed',
      label: 'Investment Confirmed',
      description: 'Test investment confirmation'
    },
    {
      type: 'dividend_received',
      label: 'Dividend Received',
      description: 'Test dividend payment notification'
    },
    {
      type: 'kyc_approved',
      label: 'KYC Approved',
      description: 'Test KYC approval notification'
    },
    {
      type: 'security_alert',
      label: 'Security Alert',
      description: 'Test urgent security notification'
    },
    {
      type: 'system_maintenance',
      label: 'Maintenance',
      description: 'Test maintenance notification'
    }
  ];

  const handleTestNotification = (type: NotificationType) => {
    notificationService.sendTestNotification(type);
  };

  const handleTestBatch = () => {
    // Send multiple notifications at once
    setTimeout(() => notificationService.sendTestNotification('proposal_approved'), 100);
    setTimeout(() => notificationService.sendTestNotification('investment_confirmed'), 500);
    setTimeout(() => notificationService.sendTestNotification('governance_voting_started'), 1000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <TestTube className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notification Test Panel
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test different notification types and triggers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {testNotifications.map(({ type, label, description }) => (
          <button
            key={type}
            onClick={() => handleTestNotification(type)}
            className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {label}
              </h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={handleTestBatch}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          Test Batch (3 notifications)
        </button>
        
        <button
          onClick={() => notificationService.clearAllNotifications()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Clear All Notifications
        </button>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> This test panel is for development purposes. 
          In production, notifications are triggered automatically by platform events.
        </p>
      </div>
    </div>
  );
};

export default NotificationTestPanel;