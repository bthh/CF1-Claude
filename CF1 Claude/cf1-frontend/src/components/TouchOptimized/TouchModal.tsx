import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useMobileNavigation } from '../../hooks/useMobileNavigation';

interface TouchModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'bottom' | 'top';
  showHeader?: boolean;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  preventBodyScroll?: boolean;
  className?: string;
  overlayClassName?: string;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  swipeToClose?: boolean;
}

export const TouchModal: React.FC<TouchModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  position = 'center',
  showHeader = true,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  className = '',
  overlayClassName = '',
  onSwipeDown,
  swipeThreshold = 100,
  swipeToClose = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0, modalY: 0 });
  const [dragOffset, setDragOffset] = useState(0);
  const { isMobile } = useMobileNavigation();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (preventBodyScroll && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, preventBodyScroll]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle backdrop direct click
  const handleDirectBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop) {
      e.stopPropagation();
      onClose();
    }
  };

  // Touch/drag handlers for mobile swipe-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeToClose) return;
    
    const touch = e.touches[0];
    const modalRect = modalRef.current?.getBoundingClientRect();
    
    setIsDragging(true);
    setDragStart({
      y: touch.clientY,
      modalY: modalRect?.top || 0
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !swipeToClose) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStart.y;
    
    // Only allow downward dragging
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !swipeToClose) return;
    
    setIsDragging(false);
    
    // If dragged down far enough, close modal  
    const currentThreshold = swipeToClose ? Math.min(swipeThreshold, 50) : swipeThreshold;
    if (dragOffset > currentThreshold) {
      onSwipeDown ? onSwipeDown() : onClose();
    }
    
    setDragOffset(0);
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full w-full h-full'
  };

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'items-start justify-center pt-4 sm:pt-8 px-4';
      case 'bottom':
        return 'items-end justify-center pb-4 sm:pb-0 px-4';
      case 'center':
      default:
        return 'items-center justify-center p-4';
    }
  };

  // Modal transform for drag effect
  const getModalTransform = () => {
    if (isDragging && dragOffset > 0) {
      return `translateY(${dragOffset}px)`;
    }
    return '';
  };

  // Modal animation classes
  const getModalClasses = () => {
    let baseClasses = `
      relative
      bg-white
      dark:bg-gray-800
      shadow-2xl
      transition-all
      duration-300
      ease-out
      touch-manipulation
      ${size === 'full' ? '' : 'rounded-t-xl sm:rounded-xl'}
      ${sizeClasses[size]}
    `;

    if (position === 'bottom') {
      baseClasses += ` 
        w-full
        max-h-[90vh]
        sm:max-h-[80vh]
        ${isMobile ? 'rounded-t-xl' : 'sm:rounded-xl sm:mb-4'}
      `;
    } else {
      // For center and top positions, use max dimensions without margins for perfect centering
      baseClasses += ` max-h-[90vh] max-w-[calc(100vw-2rem)]`;
    }

    return baseClasses;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed
        inset-0
        z-50
        flex
        ${getPositionClasses()}
        transition-all
        duration-300
        ${overlayClassName}
      `}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
        data-testid="modal-backdrop"
        onClick={handleDirectBackdropClick}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`${getModalClasses()} ${className}`}
        style={{
          transform: getModalTransform(),
          transition: isDragging ? 'none' : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle for bottom modals on mobile */}
        {position === 'bottom' && isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        )}

        {/* Header */}
        {showHeader && (title || subtitle || showCloseButton) && (
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="
                  ml-4
                  p-2
                  text-gray-400
                  hover:text-gray-600
                  dark:hover:text-gray-300
                  hover:bg-gray-100
                  dark:hover:bg-gray-700
                  rounded-lg
                  transition-colors
                  touch-manipulation
                  flex-shrink-0
                "
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Action buttons component for modal footers
interface TouchModalActionsProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export const TouchModalActions: React.FC<TouchModalActionsProps> = ({
  children,
  className = '',
  sticky = true
}) => {
  return (
    <div
      className={`
        flex
        flex-col
        sm:flex-row
        gap-3
        sm:gap-4
        p-4
        sm:p-6
        border-t
        border-gray-200
        dark:border-gray-700
        bg-white
        dark:bg-gray-800
        ${sticky ? 'sticky bottom-0' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Primary button component optimized for touch
interface TouchModalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const TouchModalButton: React.FC<TouchModalButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg'
  };

  const variantClasses = {
    primary: `
      bg-blue-600 dark:bg-blue-500
      hover:bg-blue-700 dark:hover:bg-blue-600
      active:bg-blue-800 dark:active:bg-blue-700
      text-white
      border-transparent
    `,
    secondary: `
      bg-white dark:bg-gray-700
      hover:bg-gray-50 dark:hover:bg-gray-600
      active:bg-gray-100 dark:active:bg-gray-500
      text-gray-700 dark:text-gray-300
      border-gray-300 dark:border-gray-600
    `,
    danger: `
      bg-red-600 dark:bg-red-500
      hover:bg-red-700 dark:hover:bg-red-600
      active:bg-red-800 dark:active:bg-red-700
      text-white
      border-transparent
    `,
    ghost: `
      bg-transparent
      hover:bg-gray-100 dark:hover:bg-gray-700
      active:bg-gray-200 dark:active:bg-gray-600
      text-gray-700 dark:text-gray-300
      border-transparent
    `
  };

  return (
    <button
      className={`
        relative
        inline-flex
        items-center
        justify-center
        font-medium
        border-2
        rounded-lg
        transition-all
        duration-200
        touch-manipulation
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};