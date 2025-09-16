import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface CF1ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  animate?: boolean;
}

const CF1Button = forwardRef<HTMLButtonElement, CF1ButtonProps>(({
  variant = 'primary',
  size = 'md',
  children,
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  animate = true,
  className = '',
  disabled,
  ...props
}, ref) => {
  
  const baseClasses = `
    relative overflow-hidden font-medium transition-all duration-300 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    inline-flex items-center justify-center gap-2
    ${animate ? 'hover:transform hover:-translate-y-0.5' : ''}
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variants = {
    primary: 'cf1-btn-primary text-white focus:ring-blue-500',
    secondary: 'cf1-btn-secondary text-slate-700 dark:text-slate-200 focus:ring-slate-500',
    accent: 'cf1-gradient-accent text-white focus:ring-red-500',
    ghost: `
      bg-transparent text-slate-600 dark:text-slate-300 
      hover:bg-slate-100 dark:hover:bg-slate-800 
      border border-transparent hover:border-slate-200 dark:hover:border-slate-700
    `,
    outline: `
      bg-transparent border-2 border-slate-300 dark:border-slate-600 
      text-slate-700 dark:text-slate-300
      hover:border-blue-500 dark:hover:border-blue-400 
      hover:text-blue-600 dark:hover:text-blue-400
      hover:bg-blue-50 dark:hover:bg-blue-900/20
    `
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
    xl: 'px-8 py-4 text-xl min-h-[56px]'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  };

  const LoadingSpinner = () => (
    <svg 
      className={`animate-spin ${iconSizes[size]}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const buttonContent = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} />}
      <span className={loading ? 'opacity-75' : ''}>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} />}
    </>
  );

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {buttonContent}
    </button>
  );
});

CF1Button.displayName = 'CF1Button';

export default CF1Button;