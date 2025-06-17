import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface TouchSelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  helper?: string;
  success?: string;
  size?: 'sm' | 'md' | 'lg';
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  onClear?: () => void;
  className?: string;
  showFeedback?: boolean;
}

export const TouchSelect: React.FC<TouchSelectProps> = ({
  options,
  value,
  placeholder = 'Select an option...',
  label,
  error,
  helper,
  success,
  size = 'md',
  searchable = false,
  clearable = false,
  disabled = false,
  required = false,
  multiple = false,
  onChange,
  onClear,
  className = '',
  showFeedback = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectId = useId();

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected option(s)
  const selectedOptions = multiple 
    ? options.filter(option => Array.isArray(value) && value.includes(option.value))
    : options.find(option => option.value === value);

  // Get display value
  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option?.label || '';
      }
      return `${value.length} items selected`;
    }
    
    if (!value) return placeholder;
    const option = options.find(opt => opt.value === value);
    return option?.label || '';
  };

  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange([]);
    } else {
      onChange('');
    }
    onClear?.();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[focusedIndex].value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && dropdownRef.current) {
      const focusedElement = dropdownRef.current.querySelector(
        `[data-option-index="${focusedIndex}"]`
      ) as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  // Size variants
  const sizeClasses = {
    sm: 'h-10 px-3 text-sm',
    md: 'h-12 px-4 text-base',
    lg: 'h-14 px-5 text-lg'
  };

  // Get border classes
  const getBorderClasses = () => {
    if (error) {
      return 'border-red-300 dark:border-red-600 focus-within:border-red-500 dark:focus-within:border-red-400';
    }
    if (success && showFeedback) {
      return 'border-green-300 dark:border-green-600 focus-within:border-green-500 dark:focus-within:border-green-400';
    }
    if (isOpen) {
      return 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20';
    }
    return 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500';
  };

  const hasValue = multiple ? Array.isArray(value) && value.length > 0 : !!value;

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Label */}
      {label && (
        <label id={selectId + '-label'} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Button */}
      <div
        id={selectId}
        className={`
          relative
          w-full
          ${sizeClasses[size]}
          border-2
          ${getBorderClasses()}
          rounded-lg
          bg-white
          dark:bg-gray-800
          cursor-pointer
          transition-all
          duration-200
          touch-manipulation
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-required={required}
        aria-labelledby={label ? selectId + '-label' : undefined}
      >
        <div className="flex items-center justify-between w-full h-full">
          <span
            className={`
              truncate
              ${hasValue ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}
            `}
          >
            {getDisplayValue()}
          </span>
          
          <div className="flex items-center space-x-1">
            {/* Clear Button */}
            {clearable && hasValue && !disabled && (
              <button
                onClick={handleClear}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 
                         p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-colors touch-manipulation"
                tabIndex={-1}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Dropdown Arrow */}
            <ChevronDown
              className={`
                w-5 h-5
                text-gray-400
                dark:text-gray-500
                transition-transform
                duration-200
                ${isOpen ? 'rotate-180' : ''}
              `}
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="
            absolute
            top-full
            left-0
            right-0
            mt-1
            bg-white
            dark:bg-gray-800
            border
            border-gray-200
            dark:border-gray-700
            rounded-lg
            shadow-xl
            z-50
            max-h-60
            overflow-hidden
            touch-manipulation
          "
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="
                    w-full
                    h-10
                    pl-10
                    pr-4
                    border
                    border-gray-300
                    dark:border-gray-600
                    rounded-lg
                    bg-white
                    dark:bg-gray-700
                    text-gray-900
                    dark:text-white
                    placeholder:text-gray-500
                    dark:placeholder:text-gray-400
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    dark:focus:ring-blue-400
                    focus:border-transparent
                    touch-manipulation
                  "
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                {searchable && searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = multiple 
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value;
                const isFocused = index === focusedIndex;

                return (
                  <div
                    key={option.value}
                    data-option-index={index}
                    onClick={() => !option.disabled && handleOptionSelect(option.value)}
                    className={`
                      flex
                      items-center
                      justify-between
                      px-4
                      py-3
                      cursor-pointer
                      transition-colors
                      touch-manipulation
                      ${option.disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                      ${isFocused && !option.disabled 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : ''
                      }
                      ${isSelected 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : 'text-gray-900 dark:text-white'
                      }
                    `}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center space-x-3">
                      {option.icon && (
                        <div className="w-5 h-5 text-gray-400 dark:text-gray-500">
                          {option.icon}
                        </div>
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                    
                    {isSelected && (
                      <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

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
};