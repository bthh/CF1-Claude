import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  size = 'medium',
  className = ''
}) => {
  const sizes = {
    small: {
      container: 'p-6',
      icon: 'w-8 h-8',
      title: 'text-base',
      description: 'text-sm',
      button: 'text-sm px-3 py-2'
    },
    medium: {
      container: 'p-8',
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-base',
      button: 'text-sm px-4 py-2'
    },
    large: {
      container: 'p-12',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-lg',
      button: 'text-base px-6 py-3'
    }
  };

  const currentSize = sizes[size];

  return (
    <div className={`text-center ${currentSize.container} ${className}`}>
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className={`${currentSize.icon} text-gray-400 dark:text-gray-500`} />
        </div>
      )}
      
      <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 ${currentSize.title}`}>
        {title}
      </h3>
      
      {description && (
        <p className={`text-gray-600 dark:text-gray-400 mb-6 ${currentSize.description}`}>
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className={`
            ${action.variant === 'secondary' 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
            ${currentSize.button}
            rounded-lg font-medium transition-colors
          `}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;