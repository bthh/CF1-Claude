import React, { useState, useRef, useEffect, forwardRef, useId } from 'react';
import { X } from 'lucide-react';

interface TouchTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  success?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'minimal';
  clearable?: boolean;
  autoResize?: boolean;
  maxHeight?: number;
  showCharCount?: boolean;
  onClear?: () => void;
  isTouched?: boolean;
  showFeedback?: boolean;
}

export const TouchTextarea = forwardRef<HTMLTextAreaElement, TouchTextareaProps>(({
  label,
  error,
  helper,
  success,
  size = 'md',
  variant = 'default',
  clearable = false,
  autoResize = false,
  maxHeight = 200,
  showCharCount = false,
  className = '',
  onClear,
  isTouched = false,
  showFeedback = true,
  value,
  placeholder,
  maxLength,
  rows = 4,
  id: providedId,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const generatedId = useId();
  const textareaId = providedId || generatedId;

  // Update hasValue and charCount when value changes
  useEffect(() => {
    const currentValue = value?.toString() || '';
    setHasValue(currentValue.length > 0);
    setCharCount(currentValue.length);
    
    // Auto-resize functionality
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, autoResize, maxHeight]);

  // Focus management for touch interfaces
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleClear = () => {
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.focus();
    }
    onClear?.();
  };

  // Size variants with touch-optimized dimensions
  const sizeClasses = {
    sm: 'p-3 text-sm min-h-[80px]',
    md: 'p-4 text-base min-h-[100px]',
    lg: 'p-5 text-lg min-h-[120px]'
  };

  // Base textarea classes with touch optimizations
  const baseTextareaClasses = `
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
    resize-none
  `;

  // Border and focus states
  const getBorderClasses = () => {
    if (error) {
      return 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400';
    }
    if (success && showFeedback) {
      return 'border-green-500 dark:border-green-400 focus:border-green-500 dark:focus:border-green-400';
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
      return `${baseLabel} top-4 text-base`;
    }
    return 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';
  };

  // Calculate padding for clear button
  const getPaddingClasses = () => {
    if (clearable) {
      return size === 'sm' ? 'pr-10' : size === 'md' ? 'pr-12' : 'pr-14';
    }
    return '';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label for default and minimal variants */}
      {label && variant !== 'floating' && (
        <label htmlFor={textareaId} className={getLabelClasses()}>
          {label}
        </label>
      )}

      <div className="relative">
        {/* Textarea Field */}
        <textarea
          ref={ref || textareaRef}
          id={textareaId}
          value={value}
          placeholder={variant === 'floating' ? '' : placeholder}
          rows={autoResize ? 1 : rows}
          maxLength={maxLength}
          className={`
            ${baseTextareaClasses}
            ${getBorderClasses()}
            ${getPaddingClasses()}
          `}
          style={{
            maxHeight: autoResize ? `${maxHeight}px` : undefined,
            overflowY: autoResize ? 'hidden' : 'auto'
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Floating Label */}
        {label && variant === 'floating' && (
          <label htmlFor={textareaId} className={getLabelClasses()}>
            {label}
          </label>
        )}

        {/* Clear Button */}
        {clearable && hasValue && !props.disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={`
              absolute
              top-3
              ${size === 'sm' ? 'right-3' : size === 'md' ? 'right-4' : 'right-5'}
              text-gray-400
              dark:text-gray-500
              hover:text-gray-600
              dark:hover:text-gray-300
              p-1
              rounded-full
              hover:bg-gray-100
              dark:hover:bg-gray-700
              transition-colors
              touch-manipulation
            `}
            tabIndex={-1}
          >
            <X className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} stroke-2`} />
          </button>
        )}
      </div>

      {/* Character Count and Feedback */}
      {(showCharCount || showFeedback) && (
        <div className="mt-1 flex items-center justify-between min-h-[1.25rem]">
          <div className="flex-1">
            {showFeedback && (
              <>
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
              </>
            )}
          </div>
          
          {showCharCount && (
            <div className="flex-shrink-0 ml-2">
              <span
                className={`
                  text-xs
                  ${maxLength && charCount > maxLength * 0.9
                    ? charCount >= maxLength
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}
              >
                {charCount}{maxLength && ` / ${maxLength}`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

TouchTextarea.displayName = 'TouchTextarea';