import React from 'react';
import { Bell, AlertCircle, CheckCircle, Info, Clock, ArrowRight, BellRing, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/format';

interface NotificationsWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const NotificationsWidget: React.FC<NotificationsWidgetProps> = ({ size, isEditMode = false }) => {
  const navigate = useNavigate();

  // Mock data - replace with real data from store/API
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Investment Confirmed',
      message: 'Your investment in Green Energy Fund has been confirmed',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      read: false,
      priority: 'high',
      icon: CheckCircle
    },
    {
      id: 2,
      type: 'info',
      title: 'New Proposal Available',
      message: 'Vote on "Increase Platform Fee to 3%" - ends in 2 days',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: false,
      priority: 'medium',
      icon: Info
    },
    {
      id: 3,
      type: 'warning',
      title: 'KYC Verification Required',
      message: 'Complete identity verification to unlock full features',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      read: true,
      priority: 'high',
      icon: AlertCircle
    },
    {
      id: 4,
      type: 'info',
      title: 'Dividend Payment Received',
      message: 'Real Estate Portfolio dividend: $125.50',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      read: true,
      priority: 'low',
      icon: CheckCircle
    },
    {
      id: 5,
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight from 2-4 AM UTC',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      priority: 'low',
      icon: Settings
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNavigate = () => {
    navigate('/notifications');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-amber-500';
      default: return 'border-l-4 border-gray-300 dark:border-gray-600';
    }
  };

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="space-y-2 flex-1 overflow-hidden">
          {notifications.slice(0, 3).map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start space-x-2 p-2 rounded-lg ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
            >
              <div className={`p-1 rounded-full ${getTypeColor(notification.type)} flex-shrink-0`}>
                <notification.icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(notification.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-4 mb-3 text-xs">
          <div className="flex items-center space-x-1">
            <BellRing className="w-3 h-3 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">{unreadCount} unread</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Latest</span>
          </div>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {notifications.slice(0, 4).map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start space-x-2 p-2 rounded-lg ${getPriorityIndicator(notification.priority)} ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className={`p-1.5 rounded-full ${getTypeColor(notification.type)} flex-shrink-0`}>
                <notification.icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatTimeAgo(notification.timestamp)}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Large and Full size
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm rounded-full px-3 py-1 min-w-[2rem] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        {!isEditMode && (
          <button 
            onClick={handleNavigate}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      
      <div className={`grid ${size === 'full' ? 'grid-cols-3' : 'grid-cols-1'} gap-4 mb-4`}>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <Bell className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {notifications.length}
          </p>
          <p className="text-xs text-blue-600 mt-1">All notifications</p>
        </div>
        
        {size === 'full' && (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <BellRing className="w-5 h-5 text-red-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Unread</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
              <p className="text-xs text-red-600 mt-1">Need attention</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-amber-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">High Priority</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {notifications.filter(n => n.priority === 'high').length}
              </p>
              <p className="text-xs text-amber-600 mt-1">Urgent items</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start space-x-3 p-3 rounded-xl transition-colors cursor-pointer ${getPriorityIndicator(notification.priority)} ${
                !notification.read 
                  ? 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20' 
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <div className={`p-2 rounded-full ${getTypeColor(notification.type)} flex-shrink-0`}>
                <notification.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        notification.priority === 'high' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                          : notification.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    )}
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsWidget;