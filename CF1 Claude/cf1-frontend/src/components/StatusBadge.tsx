import React from 'react';
import { clsx } from 'clsx';

export interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'error';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, label }) => {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';

  const variantClasses = {
    success: 'bg-purple-100 text-purple-800 border border-purple-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200'
  };

  return (
    <span className={clsx(baseClasses, variantClasses[variant])}>
      {label}
    </span>
  );
};

export default StatusBadge;