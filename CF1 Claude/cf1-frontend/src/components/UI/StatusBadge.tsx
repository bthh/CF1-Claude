import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'draft';
  text: string;
  icon?: LucideIcon;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  icon: Icon,
  size = 'medium',
  className = ''
}) => {
  const statusStyles = {
    success: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    info: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    pending: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    draft: 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800'
  };

  const sizeStyles = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-2.5 py-1',
    large: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <span 
      className={`
        inline-flex items-center space-x-1 rounded-full border font-medium
        ${statusStyles[status]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      <span>{text}</span>
    </span>
  );
};

export default StatusBadge;