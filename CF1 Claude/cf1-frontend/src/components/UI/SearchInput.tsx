import React, { useState, useEffect, forwardRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

/**
 * Enterprise CF1SearchInput Component
 *
 * Standardized search input component following CF1 design system principles:
 * - "TradFi Feel, DeFi Engine" - Professional, institutional appearance
 * - WCAG 2.1 AA compliance with proper ARIA labels and keyboard navigation
 * - Consistent with enterprise design patterns
 * - TypeScript strict mode compatible
 *
 * @example
 * ```tsx
 * <SearchInput
 *   value={query}
 *   onChange={setQuery}
 *   placeholder="Search assets..."
 *   suggestions={assetSuggestions}
 *   size="md"
 * />
 * ```
 */
interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Change handler for search value */
  onChange: (value: string) => void;
  /** Submit handler for search */
  onSubmit?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Loading state indicator */
  loading?: boolean;
  /** Search suggestions array */
  suggestions?: string[];
  /** Suggestion click handler */
  onSuggestionClick?: (suggestion: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Input size following design system */
  size?: 'sm' | 'md' | 'lg';
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Enable responsive design system (default: true) */
  responsive?: boolean;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** Input disabled state */
  disabled?: boolean;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  loading = false,
  suggestions = [],
  onSuggestionClick,
  className = '',
  size = 'md',
  responsive = true,
  disabled = false,
  debounceMs = 300,
  ...props
}, ref) => {
  const ariaLabel = props['aria-label'];
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce the search value but don't automatically call onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs]);

  // Responsive sizing using design system tokens
  const responsiveSizes = {
    sm: 'h-responsive-8 text-responsive-sm min-h-[44px]',
    md: 'h-responsive-10 text-responsive-base min-h-[44px]',
    lg: 'h-responsive-12 text-responsive-lg min-h-[48px]'
  };

  // Legacy sizing for non-responsive mode
  const legacySizes = {
    sm: 'h-8 text-sm min-h-[44px]',
    md: 'h-10 text-sm min-h-[44px]',
    lg: 'h-12 text-base min-h-[48px]'
  };

  const sizes = responsive ? responsiveSizes : legacySizes;

  // Responsive icon sizing using design system tokens
  const responsiveIconSizes = {
    sm: 'w-icon-xs h-icon-xs',
    md: 'w-icon-sm h-icon-sm',
    lg: 'w-icon-md h-icon-md'
  };

  // Legacy icon sizing for non-responsive mode
  const legacyIconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizes = responsive ? responsiveIconSizes : legacyIconSizes;

  const handleClear = () => {
    onChange('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    onSuggestionClick?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className={`${iconSizes[size]} text-gray-400 animate-spin`} />
          ) : (
            <Search className={`${iconSizes[size]} text-gray-400`} />
          )}
        </div>
        
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
          aria-label={ariaLabel || placeholder || 'Search'}
          disabled={disabled}
          className={`
            cf1-input
            ${responsive ? 'pl-responsive-10 pr-responsive-10' : 'pl-10 pr-10'}
            ${sizes[size]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          {...props}
        />
        
        {value && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className={`${iconSizes[size]} text-gray-400`} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
            >
              <span className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <span>{suggestion}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;