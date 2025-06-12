import React, { useState, useRef, useEffect } from 'react';
import { 
  Filter, 
  X, 
  ChevronDown, 
  Calendar, 
  DollarSign, 
  Percent,
  Bookmark,
  RotateCcw,
  Save,
  Trash2
} from 'lucide-react';

interface FilterRange {
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onResetFilters: () => void;
  onSavePreset: (name: string) => boolean;
  onLoadPreset: (name: string) => boolean;
  onDeletePreset: (name: string) => boolean;
  presets: Record<string, any>;
  
  // Filter configurations
  priceRange?: FilterRange;
  apyRange?: FilterRange;
  categories?: FilterOption[];
  availabilityOptions?: FilterOption[];
  sortOptions?: FilterOption[];
  
  // Customization
  title?: string;
  showPresets?: boolean;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  presets,
  priceRange = { min: 0, max: 10000, step: 100, prefix: '$' },
  apyRange = { min: 0, max: 20, step: 0.5, suffix: '%' },
  categories = [],
  availabilityOptions = [],
  sortOptions = [],
  title = 'Advanced Filters',
  showPresets = true
}) => {
  const [activeTab, setActiveTab] = useState<'filters' | 'presets'>('filters');
  const [newPresetName, setNewPresetName] = useState('');
  const [showPresetInput, setShowPresetInput] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const RangeSlider: React.FC<{
    range: FilterRange;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    label: string;
  }> = ({ range, value, onChange, label }) => {
    const [localValue, setLocalValue] = useState(value);

    const handleMinChange = (newMin: number) => {
      const newValue: [number, number] = [Math.min(newMin, localValue[1]), localValue[1]];
      setLocalValue(newValue);
      onChange(newValue);
    };

    const handleMaxChange = (newMax: number) => {
      const newValue: [number, number] = [localValue[0], Math.max(newMax, localValue[0])];
      setLocalValue(newValue);
      onChange(newValue);
    };

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="relative">
              {range.prefix && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                  {range.prefix}
                </span>
              )}
              <input
                type="number"
                min={range.min}
                max={range.max}
                step={range.step}
                value={localValue[0]}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  range.prefix ? 'pl-8' : ''
                } ${range.suffix ? 'pr-8' : ''}`}
              />
              {range.suffix && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                  {range.suffix}
                </span>
              )}
            </div>
          </div>
          
          <span className="text-gray-500 dark:text-gray-400">to</span>
          
          <div className="flex-1">
            <div className="relative">
              {range.prefix && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                  {range.prefix}
                </span>
              )}
              <input
                type="number"
                min={range.min}
                max={range.max}
                step={range.step}
                value={localValue[1]}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  range.prefix ? 'pl-8' : ''
                } ${range.suffix ? 'pr-8' : ''}`}
              />
              {range.suffix && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                  {range.suffix}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {range.prefix}{localValue[0]}{range.suffix} - {range.prefix}{localValue[1]}{range.suffix}
        </div>
      </div>
    );
  };

  const CheckboxGroup: React.FC<{
    options: FilterOption[];
    value: string[];
    onChange: (value: string[]) => void;
    label: string;
  }> = ({ options, value, onChange, label }) => {
    const handleToggle = (optionValue: string) => {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    };

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {options.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-900 dark:text-white flex-1">
                {option.label}
              </span>
              {option.count !== undefined && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({option.count})
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    );
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    
    const success = onSavePreset(newPresetName.trim());
    if (success) {
      setNewPresetName('');
      setShowPresetInput(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        {showPresets && (
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('filters')}
              className={`flex-1 px-6 py-3 text-sm font-medium ${
                activeTab === 'filters'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Filters
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 px-6 py-3 text-sm font-medium ${
                activeTab === 'presets'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Bookmark className="w-4 h-4 inline mr-2" />
              Presets
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'filters' ? (
            <div className="space-y-6">
              {/* Price Range */}
              <RangeSlider
                range={priceRange}
                value={filters.priceRange || [priceRange.min, priceRange.max]}
                onChange={(value) => onFilterChange('priceRange', value)}
                label="Price Range"
              />

              {/* APY Range */}
              <RangeSlider
                range={apyRange}
                value={filters.apyRange || [apyRange.min, apyRange.max]}
                onChange={(value) => onFilterChange('apyRange', value)}
                label="Expected APY"
              />

              {/* Date Range */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={filters.dateRange?.start || ''}
                      onChange={(e) => onFilterChange('dateRange', {
                        ...filters.dateRange,
                        start: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={filters.dateRange?.end || ''}
                      onChange={(e) => onFilterChange('dateRange', {
                        ...filters.dateRange,
                        end: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Availability Options */}
              {availabilityOptions.length > 0 && (
                <CheckboxGroup
                  options={availabilityOptions}
                  value={filters.availabilityFilter || []}
                  onChange={(value) => onFilterChange('availabilityFilter', value)}
                  label="Availability"
                />
              )}

              {/* Sort Options */}
              {sortOptions.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sort By
                  </label>
                  <select
                    value={`${filters.sortBy}_${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('_');
                      onFilterChange('sortBy', sortBy);
                      onFilterChange('sortOrder', sortOrder);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <optgroup key={option.value} label={option.label}>
                        <option value={`${option.value}_asc`}>{option.label} (A-Z)</option>
                        <option value={`${option.value}_desc`}>{option.label} (Z-A)</option>
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Save New Preset */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Save Current Filters
                </h4>
                {showPresetInput ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="Preset name..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
                    />
                    <button
                      onClick={handleSavePreset}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowPresetInput(false);
                        setNewPresetName('');
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPresetInput(true)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Preset
                  </button>
                )}
              </div>

              {/* Saved Presets */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Saved Presets
                </h4>
                {Object.keys(presets).length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No saved presets yet
                  </p>
                ) : (
                  Object.keys(presets).map((presetName) => (
                    <div
                      key={presetName}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <span className="text-sm text-gray-900 dark:text-white">
                        {presetName}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onLoadPreset(presetName)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => onDeletePreset(presetName)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onResetFilters}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};