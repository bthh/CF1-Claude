import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Settings,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  X,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import { useNotificationSystemStore, NotificationType, NotificationPriority, getPriorityColor, getPriorityIcon } from '../store/notificationSystemStore';
import { useDataMode } from '../store/dataModeStore';
import { formatTimeAgo } from '../utils/format';
import NotificationSettings from '../components/Notifications/NotificationSettings';

const Activity: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    clearExpiredNotifications,
    getRecentNotifications,
    markMultipleAsRead,
    deleteMultiple
  } = useNotificationSystemStore();

  const totalNotifications = notifications.length;
  const { isDemo, currentMode } = useDataMode();

  // Component state
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-clear expired notifications on mount
  useEffect(() => {
    clearExpiredNotifications();
  }, [clearExpiredNotifications]);

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  // Event handlers
  const handleNotificationClick = (notification: any) => {
    if (isSelectionMode) {
      toggleNotificationSelection(notification.id);
      return;
    }

    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionable && notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleBulkMarkAsRead = () => {
    if (selectedNotifications.length > 0) {
      markMultipleAsRead(selectedNotifications);
      setSelectedNotifications([]);
      setIsSelectionMode(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedNotifications.length > 0) {
      deleteMultiple(selectedNotifications);
      setSelectedNotifications([]);
      setIsSelectionMode(false);
    }
  };

  const getNotificationTypeLabel = (type: NotificationType): string => {
    switch (type) {
      case 'proposal_approved': return 'Proposal Approved';
      case 'proposal_rejected': return 'Proposal Rejected';
      case 'proposal_changes_requested': return 'Changes Requested';
      case 'governance_voting_started': return 'Voting Started';
      case 'governance_voting_ended': return 'Voting Ended';
      case 'investment_confirmed': return 'Investment Confirmed';
      case 'investment_failed': return 'Investment Failed';
      case 'dividend_received': return 'Dividend Received';
      case 'token_unlock': return 'Token Unlock';
      case 'kyc_approved': return 'KYC Approved';
      case 'kyc_rejected': return 'KYC Rejected';
      case 'system_maintenance': return 'System Maintenance';
      case 'security_alert': return 'Security Alert';
      case 'general': return 'General';
      default: return 'Notification';
    }
  };

  const getPriorityBadgeColor = (priority: NotificationPriority): string => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {isDemo && (
              <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                <Eye className="w-4 h-4" />
                <span className="font-medium">DEMO MODE</span>
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {currentMode.toUpperCase()}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your notifications and stay updated on platform activity
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{filteredNotifications.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filter === 'all' ? 'Total' : filter === 'unread' ? 'Unread' : 'Filtered'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{unreadCount}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2 h-10 flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Notification Management */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-600 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="proposal_approved">Proposals</option>
              <option value="governance_voting_started">Governance</option>
              <option value="investment_confirmed">Investments</option>
              <option value="dividend_received">Dividends</option>
              <option value="system_maintenance">System</option>
            </select>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isSelectionMode ? (
                <>
                  <button
                    onClick={() => setSelectedNotifications(filteredNotifications.map(n => n.id))}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => {
                      setSelectedNotifications([]);
                      setIsSelectionMode(false);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  disabled={filteredNotifications.length === 0}
                >
                  Select
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {isSelectionMode && selectedNotifications.length > 0 ? (
                <>
                  <button
                    onClick={handleBulkMarkAsRead}
                    className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Mark Read ({selectedNotifications.length})</span>
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete ({selectedNotifications.length})</span>
                  </button>
                </>
              ) : (
                <>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Mark All Read</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear All</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    notification.read
                      ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                      : 'bg-white dark:bg-gray-700 border-blue-200 dark:border-blue-700 shadow-sm'
                  } ${
                    selectedNotifications.includes(notification.id)
                      ? 'ring-2 ring-blue-500'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleNotificationSelection(notification.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}

                    {/* Notification Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      notification.read ? 'bg-gray-200 dark:bg-gray-600' : `bg-${getPriorityColor(notification.priority)}-100 dark:bg-${getPriorityColor(notification.priority)}-900/30`
                    }`}>
                      {getPriorityIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>

                          <p className={`text-sm ${
                            notification.read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.message}
                          </p>

                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadgeColor(notification.priority)}`}>
                              {notification.priority.toUpperCase()}
                            </span>

                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(notification.timestamp)}
                            </span>

                            {notification.actionable && (
                              <span className="text-xs text-blue-600 flex items-center">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                {notification.actionText || 'View'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Individual Notification Actions */}
                        {!isSelectionMode && (
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 text-gray-400 hover:text-green-600 rounded"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                              title="Delete notification"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              </div>
            )}
          </div>

          {/* Footer Statistics */}
          {filteredNotifications.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                  {filter !== 'all' && ` (filtered from ${totalNotifications} total)`}
                </span>
                <span>
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Settings Modal */}
      {showSettings && (
        <NotificationSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default Activity;