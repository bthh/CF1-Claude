import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Eye, EyeOff, X, Check } from 'lucide-react';

interface TouchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'minimal';
  onClear?: () => void;
  isTouched?: boolean;
  showFeedback?: boolean;
}

export const TouchInput = forwardRef<HTMLInputElement, TouchInputProps>(({
  label,
  error,
  helper,
  success,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  clearable = false,
  size = 'md',
  variant = 'default',
  className = '',
  onClear,
  isTouched = false,
  showFeedback = true,
  type = 'text',
  value,
  placeholder,
  ...props
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update hasValue when value changes
  useEffect(() => {
    setHasValue(!!value && value.toString().length > 0);
  }, [value]);

  // Focus management for touch interfaces
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
    onClear?.();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Size variants with touch-optimized dimensions
  const sizeClasses = {
    sm: 'h-10 px-3 text-sm',
    md: 'h-12 px-4 text-base',
    lg: 'h-14 px-5 text-lg'
  };

  // Base input classes with touch optimizations
  const baseInputClasses = `
    w-full
    ${sizeClasses[size]}
    border-2
    rounded-lg
    transition-all
    duration-200
    appearance-none
    outline-none
    font-medium
    touch-manipulation
    bg-white
    dark:bg-gray-800
    text-gray-900
    dark:text-white
    placeholder:text-gray-500
    dark:placeholder:text-gray-400
    focus:outline-none
    focus:ring-0
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:bg-gray-50
    dark:disabled:bg-gray-900
  `;

  // Border and focus states
  const getBorderClasses = () => {
    if (error) {
      return 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400';
    }
    if (success && showFeedback) {
      return 'border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400';
    }
    if (isFocused) {
      return 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20';
    }
    return 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500';
  };

  // Label classes for floating variant
  const getLabelClasses = () => {
    if (variant === 'floating') {
      const baseLabel = `
        absolute
        left-4
        transition-all
        duration-200
        pointer-events-none
        text-gray-500
        dark:text-gray-400
        touch-manipulation
      `;
      
      if (isFocused || hasValue) {
        return `${baseLabel} -top-2 text-xs bg-white dark:bg-gray-800 px-1`;
      }
      return `${baseLabel} top-1/2 -translate-y-1/2 text-base`;
    }
    return 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';
  };

  // Calculate padding for icons
  const getPaddingClasses = () => {
    let paddingLeft = size === 'sm' ? 'pl-3' : size === 'md' ? 'pl-4' : 'pl-5';
    let paddingRight = size === 'sm' ? 'pr-3' : size === 'md' ? 'pr-4' : 'pr-5';

    if (leftIcon) {
      paddingLeft = size === 'sm' ? 'pl-10' : size === 'md' ? 'pl-12' : 'pl-14';
    }

    if (rightIcon || showPasswordToggle || clearable) {
      paddingRight = size === 'sm' ? 'pr-10' : size === 'md' ? 'pr-12' : 'pr-14';
    }

    return `${paddingLeft} ${paddingRight}`;
  };

  const inputType = showPasswordToggle && !isPasswordVisible ? 'password' : 
                   showPasswordToggle && isPasswordVisible ? 'text' : type;

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  const iconPosition = size === 'sm' ? 'top-3' : size === 'md' ? 'top-3.5' : 'top-4';

  return (
    <div className={`relative ${className}`}>
      {/* Label for default and minimal variants */}
      {label && variant !== 'floating' && (
        <label className={getLabelClasses()}>
          {label}
        </label>
      )}

      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className={`absolute left-3 ${iconPosition} pointer-events-none text-gray-400 dark:text-gray-500`}>
            <div className={iconSize}>
              {leftIcon}
            </div>
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref || inputRef}
          type={inputType}
          value={value}
          placeholder={variant === 'floating' ? '' : placeholder}
          className={`
            ${baseInputClasses}
            ${getBorderClasses()}
            ${getPaddingClasses()}
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Floating Label */}
        {label && variant === 'floating' && (
          <label className={getLabelClasses()}>
            {label}
          </label>
        )}

        {/* Right Side Icons */}
        <div className={`absolute right-3 ${iconPosition} flex items-center space-x-1`}>
          {/* Success Icon */}
          {success && showFeedback && (
            <div className="text-green-500 dark:text-green-400">
              <Check className={iconSize} />
            </div>
          )}

          {/* Clear Button */}
          {clearable && hasValue && !props.disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 
                       p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-colors touch-manipulation"
              tabIndex={-1}
            >
              <X className={`${iconSize} stroke-2`} />
            </button>
          )}

          {/* Password Toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 
                       p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-colors touch-manipulation"
              tabIndex={-1}
            >
              {isPasswordVisible ? (
                <EyeOff className={`${iconSize} stroke-2`} />
              ) : (
                <Eye className={`${iconSize} stroke-2`} />
              )}
            </button>
          )}

          {/* Custom Right Icon */}
          {rightIcon && !showPasswordToggle && !clearable && (
            <div className="text-gray-400 dark:text-gray-500">
              <div className={iconSize}>
                {rightIcon}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Messages */}
      {showFeedback && (
        <div className="mt-1 min-h-[1.25rem]">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          )}
          {success && !error && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              {success}
            </p>
          )}
          {helper && !error && !success && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {helper}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

TouchInput.displayName = 'TouchInput';