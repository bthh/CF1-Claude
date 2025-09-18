import React, { forwardRef } from 'react';

/**
 * Enterprise CF1Card Component
 *
 * Standardized card component following CF1 design system principles:
 * - "TradFi Feel, DeFi Engine" - Professional, institutional appearance
 * - Consistent with enterprise design patterns
 * - WCAG 2.1 AA compliance with proper contrast and focus management
 * - TypeScript strict mode compatible
 *
 * @example
 * ```tsx
 * <Card variant="elevated" padding="large" hoverable>
 *   <h3>Portfolio Performance</h3>
 *   <p>Your investments are performing well...</p>
 * </Card>
 * ```
 */
interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Card visual variant following CF1 design system */
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  /** Padding size using design system tokens */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Shadow level for depth hierarchy */
  shadow?: 'none' | 'small' | 'medium' | 'large';
  /** Show border (default: true for outlined variant) */
  border?: boolean;
  /** Enable hover interactions */
  hoverable?: boolean;
  /** Click handler for interactive cards */
  onClick?: () => void;
  /** Enable responsive design system (default: true) */
  responsive?: boolean;
  /** Card size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Card as different HTML element */
  as?: keyof JSX.IntrinsicElements;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className = '',
  padding = 'medium',
  shadow = 'small',
  variant = 'default',
  border,
  hoverable = false,
  onClick,
  responsive = true,
  size = 'md',
  as: Component = 'div',
  ...props
}, ref) => {
  // Responsive padding using new system
  const responsivePaddingStyles = {
    none: '',
    small: responsive ? 'p-responsive-2' : 'p-3',
    medium: responsive ? 'p-responsive-4' : 'p-4',
    large: responsive ? 'p-responsive-6' : 'p-6'
  };

  // Legacy padding for non-responsive mode
  const legacyPaddingStyles = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const paddingStyles = responsive ? responsivePaddingStyles : legacyPaddingStyles;

  const shadowStyles = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg'
  };

  // Responsive border radius
  const borderRadiusClass = responsive ? 'rounded-responsive-lg' : 'rounded-lg';

  // Size-based responsive classes
  const sizeClasses = responsive ? {
    sm: 'card-responsive-sm',
    md: 'card-responsive',
    lg: 'card-responsive-lg'
  } : {};

  // Use predefined responsive classes if available and no custom padding
  const useResponsiveClass = responsive && size && padding === 'medium' && !className.includes('p-');

  const baseStyles = useResponsiveClass
    ? `
      ${sizeClasses[size]}
      ${shadowStyles[shadow]}
      ${hoverable ? 'hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `
    : `
      bg-white dark:bg-gray-800 ${borderRadiusClass}
      ${border ? 'border border-gray-200 dark:border-gray-700' : ''}
      ${shadowStyles[shadow]}
      ${paddingStyles[padding]}
      ${hoverable ? 'hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `;

  return (
    <Component
      ref={ref}
      className={baseStyles.replace(/\s+/g, ' ').trim()}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

export default Card;