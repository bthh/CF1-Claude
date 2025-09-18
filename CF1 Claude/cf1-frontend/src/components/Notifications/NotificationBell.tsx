import React, { useState, useEffect } from 'react';
import { Bell, BellDot } from 'lucide-react';
import { useNotificationSystemStore } from '../../store/notificationSystemStore';
import NotificationCenter from './NotificationCenter';
import NotificationSettings from './NotificationSettings';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { unreadCount, isEnabled, clearExpiredNotifications } = useNotificationSystemStore();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Track unread count changes for animation
  useEffect(() => {
    if (unreadCount > 0) {
      setHasNewNotification(true);
      const timer = setTimeout(() => setHasNewNotification(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Periodically clear expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpiredNotifications();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [clearExpiredNotifications]);

  const handleBellClick = () => {
    setIsNotificationCenterOpen(true);
  };

  const handleCloseNotificationCenter = () => {
    setIsNotificationCenterOpen(false);
  };

  const handleOpenSettings = () => {
    setIsNotificationCenterOpen(false);
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  if (!isEnabled) {
    return null; // Don't show bell if notifications are disabled
  }

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={handleBellClick}
        className={`relative p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation ${className} ${
          hasNewNotification ? 'animate-pulse' : ''
        }`}
        title={`${unreadCount} unread notifications`}
      >
        {/* Bell Icon */}
        {unreadCount > 0 ? (
          <BellDot className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6" />
        )}

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold text-white rounded-full ${
            unreadCount > 99 ? 'bg-red-600 px-1' : 'bg-red-500'
          } ${hasNewNotification ? 'animate-bounce' : ''}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Pulse animation for new notifications */}
        {hasNewNotification && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-red-500 rounded-full animate-ping opacity-75" />
        )}
      </button>

      {/* Notification Center Modal */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={handleCloseNotificationCenter}
        onOpenSettings={handleOpenSettings}
      />

      {/* Notification Settings Modal */}
      <NotificationSettings
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
      />
    </>
  );
};

export default NotificationBell;