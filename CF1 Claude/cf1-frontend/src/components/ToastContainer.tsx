import React from 'react';
import { Toast } from './Toast';
import type { Notification } from '../hooks/useNotifications';

interface ToastContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onRemove }) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full">
      {notifications.slice(0, 5).map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
      {notifications.length > 5 && (
        <div className="text-center">
          <div className="bg-gray-800 dark:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
            +{notifications.length - 5} more notifications
          </div>
        </div>
      )}
    </div>
  );
};