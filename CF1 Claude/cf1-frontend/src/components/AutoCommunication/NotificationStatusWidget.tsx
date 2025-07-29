import React from 'react';
import { Clock, CheckCircle, AlertCircle, Bell, Users, Play, Pause } from 'lucide-react';
import { useProposalNotifications } from '../../hooks/useProposalNotifications';
import { notificationScheduler } from '../../services/notificationScheduler';

interface NotificationStatusWidgetProps {
  proposalId?: string;
  creatorId?: string;
}

const NotificationStatusWidget: React.FC<NotificationStatusWidgetProps> = ({ 
  proposalId, 
  creatorId 
}) => {
  const { 
    hasConfiguredNotifications, 
    getNotificationSummary, 
    isSchedulerRunning,
    schedulerStatus 
  } = useProposalNotifications(creatorId);

  const globalStatus = schedulerStatus;
  const proposalSummary = proposalId ? getNotificationSummary(proposalId) : null;
  const hasConfig = creatorId ? hasConfiguredNotifications(creatorId) : false;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
          <Bell className="w-4 h-4 mr-2" />
          Auto-Communications Status
        </h3>
        <div className="flex items-center space-x-2">
          {isSchedulerRunning ? (
            <div className="flex items-center text-green-600 text-xs">
              <Play className="w-3 h-3 mr-1" />
              Active
            </div>
          ) : (
            <div className="flex items-center text-red-600 text-xs">
              <Pause className="w-3 h-3 mr-1" />
              Inactive
            </div>
          )}
        </div>
      </div>

      {/* Global Scheduler Status */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {globalStatus.scheduledCount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Scheduled</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {globalStatus.executedCount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Delivered</div>
        </div>
      </div>

      {/* Creator Configuration Status */}
      {creatorId && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Creator Configuration
            </span>
            <div className="flex items-center">
              {hasConfig ? (
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-1" />
              )}
              <span className="text-xs text-gray-500">
                {hasConfig ? 'Configured' : 'No auto-communications set'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Proposal-Specific Status */}
      {proposalId && proposalSummary && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Proposal Notifications
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {proposalSummary.total}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-sm font-medium text-yellow-600">
                {proposalSummary.pending}
              </div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div>
              <div className="text-sm font-medium text-green-600">
                {proposalSummary.executed}
              </div>
              <div className="text-xs text-gray-500">Sent</div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Information */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span>Check Interval:</span>
            <span>{Math.round(globalStatus.checkInterval / 1000)}s</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>System Status:</span>
            <span className={isSchedulerRunning ? 'text-green-600' : 'text-red-600'}>
              {isSchedulerRunning ? 'Operational' : 'Stopped'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationStatusWidget;