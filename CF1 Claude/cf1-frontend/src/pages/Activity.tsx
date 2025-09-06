import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Eye, Clock, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { useNotificationSystemStore, getPriorityColor, getPriorityIcon } from '../store/notificationSystemStore';
import { useDataMode } from '../store/dataModeStore';
import { formatTimeAgo } from '../utils/format';

const Activity: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount } = useNotificationSystemStore();
  const totalNotifications = notifications.length;
  const { isDemo, currentMode } = useDataMode();

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
            <p className="text-2xl font-bold text-blue-600">{totalNotifications}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Notifications</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{unreadCount}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
          </div>
        </div>
      </div>

      {/* Notification Management */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-600 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          {/* Notifications List */}
          <div className="space-y-3">
            {totalNotifications > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    notification.read
                      ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                      : 'bg-white dark:bg-gray-700 border-blue-200 dark:border-blue-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
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
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              notification.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              notification.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                              notification.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {notification.priority.toUpperCase()}
                            </span>
                            
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;