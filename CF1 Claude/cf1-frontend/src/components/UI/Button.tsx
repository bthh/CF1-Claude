import React from 'react';
import { LucideIcon } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600',
    outline: 'bg-transparent border-current text-current hover:bg-current/10',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    success: 'bg-green-600 hover:bg-green-700 text-white border-transparent'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center space-x-2 font-medium rounded-lg border transition-colors
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && (
        <LoadingSpinner 
          size="small" 
          color={variant === 'primary' || variant === 'danger' || variant === 'success' ? 'white' : 'primary'}
        />
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className={iconSizes[size]} />
      )}
      
      <span>{children}</span>
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  );
};

export default Button;