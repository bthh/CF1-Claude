import React from 'react';
import { clsx } from 'clsx';

export interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'error';
  label: string;
  status?: string; // Support for proposal status mapping
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, label, status }) => {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';

  // Map proposal status to variant if status is provided
  const getVariantFromStatus = (status: string): 'success' | 'warning' | 'error' => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  const actualVariant = status ? getVariantFromStatus(status) : variant;
  const actualLabel = status || label;

  const variantClasses = {
    success: 'bg-purple-100 text-purple-800 border border-purple-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200'
  };

  return (
    <span className={clsx(baseClasses, variantClasses[actualVariant])}>
      {actualLabel}
    </span>
  );
};

export default StatusBadge;