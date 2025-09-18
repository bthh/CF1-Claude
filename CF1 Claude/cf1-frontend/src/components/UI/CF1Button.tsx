import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import {
  CF1ButtonVariant,
  CF1ButtonSize,
  CF1InteractiveProps,
  CF1ComponentProps,
} from '../../types/cf1-design-system';

/**
 * Enterprise CF1Button Component
 *
 * Standardized button component following CF1 design system principles:
 * - "TradFi Feel, DeFi Engine" - Professional, institutional appearance
 * - WCAG 2.1 AA compliance with proper contrast ratios and touch targets
 * - Consistent with enterprise design patterns
 * - TypeScript strict mode compatible
 *
 * @example
 * ```tsx
 * <CF1Button variant="primary" size="md" icon={Save} loading={isSubmitting}>
 *   Save Changes
 * </CF1Button>
 * ```
 */
interface CF1ButtonProps
  extends CF1InteractiveProps,
    Omit<CF1ComponentProps<'button'>, 'onClick'> {
  /** Button visual variant following CF1 design system */
  variant?: CF1ButtonVariant;
  /** Button size with consistent touch targets */
  size?: CF1ButtonSize;
  /** Button content */
  children: React.ReactNode;
  /** Optional Lucide icon */
  icon?: LucideIcon;
  /** Icon position relative to text */
  iconPosition?: 'left' | 'right';
  /** Full width button */
  fullWidth?: boolean;
  /** Enable hover animations (default: true) */
  animate?: boolean;
  /** Button type for form submission */
  type?: 'button' | 'submit' | 'reset';
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
  
  const responsive = props.responsive ?? true;

  const baseClasses = `
    relative overflow-hidden font-medium transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    inline-flex items-center justify-center touch-manipulation
    ${responsive ? 'rounded-responsive-lg gap-responsive-sm' : 'rounded-lg gap-2'}
    ${animate ? 'hover:transform hover:-translate-y-0.5 hover:shadow-md' : ''}
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variants = {
    primary: 'cf1-btn-primary text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'cf1-btn-secondary text-slate-700 dark:text-slate-200 focus:ring-slate-500 shadow-sm hover:shadow-md',
    accent: 'cf1-gradient-accent text-white focus:ring-red-500 shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500 shadow-sm hover:shadow-md',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white focus:ring-green-500 shadow-sm hover:shadow-md',
    ghost: `
      bg-transparent text-slate-600 dark:text-slate-200
      hover:bg-slate-100 dark:hover:bg-slate-700
      border border-transparent hover:border-slate-200 dark:hover:border-slate-600
      focus:ring-slate-500 dark:focus:ring-slate-400
    `,
    outline: `
      bg-transparent border-2 border-slate-300 dark:border-slate-600
      text-slate-700 dark:text-slate-300
      hover:border-blue-500 dark:hover:border-blue-400
      hover:text-blue-600 dark:hover:text-blue-400
      hover:bg-blue-50 dark:hover:bg-blue-900/20
      focus:ring-blue-500
    `
  };
  
  // Responsive sizing using design system tokens
  const responsiveSizes = {
    sm: 'px-responsive-3 py-responsive-2 text-responsive-sm min-h-[44px] min-w-[44px]',
    md: 'px-responsive-4 py-responsive-3 text-responsive-base min-h-[44px] min-w-[44px]',
    lg: 'px-responsive-6 py-responsive-4 text-responsive-lg min-h-[48px] min-w-[48px]',
    xl: 'px-responsive-8 py-responsive-5 text-responsive-xl min-h-[56px] min-w-[56px]'
  };

  // Legacy sizing for non-responsive mode
  const legacySizes = {
    sm: 'px-3 py-2 text-sm min-h-[44px] min-w-[44px]',
    md: 'px-4 py-2.5 text-base min-h-[44px] min-w-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px] min-w-[48px]',
    xl: 'px-8 py-4 text-xl min-h-[56px] min-w-[56px]'
  };

  const sizes = responsive ? responsiveSizes : legacySizes;

  // Responsive icon sizing using design system tokens
  const responsiveIconSizes = {
    sm: 'w-icon-xs h-icon-xs',
    md: 'w-icon-sm h-icon-sm',
    lg: 'w-icon-md h-icon-md',
    xl: 'w-icon-lg h-icon-lg'
  };

  // Legacy icon sizing for non-responsive mode
  const legacyIconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  };

  const iconSizes = responsive ? responsiveIconSizes : legacyIconSizes;

  const LoadingSpinner = () => (
    <svg
      className={`animate-spin ${iconSizes[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
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
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={iconSizes[size]} aria-hidden="true" />
      )}
      <span className={loading ? 'opacity-75' : ''}>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={iconSizes[size]} aria-hidden="true" />
      )}
    </>
  );

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {buttonContent}
    </button>
  );
});

CF1Button.displayName = 'CF1Button';

export default CF1Button;