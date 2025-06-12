import React from 'react';
import { X, Filter } from 'lucide-react';

interface FilterBadge {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

interface FilterBadgesProps {
  badges: FilterBadge[];
  onClearAll?: () => void;
  className?: string;
  showClearAll?: boolean;
}

export const FilterBadges: React.FC<FilterBadgesProps> = ({
  badges,
  onClearAll,
  className = '',
  showClearAll = true
}) => {
  if (badges.length === 0) {
    return null;
  }

  const getColorClasses = (color: FilterBadge['color'] = 'blue') => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
    };
    return colorMap[color];
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mr-2">
        <Filter className="w-4 h-4 mr-1" />
        <span>Active filters:</span>
      </div>
      
      {badges.map((badge) => (
        <div
          key={badge.key}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getColorClasses(badge.color)}`}
        >
          <span className="mr-1">{badge.label}:</span>
          <span className="font-semibold">{badge.value}</span>
          <button
            onClick={badge.onRemove}
            className="ml-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${badge.label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      
      {showClearAll && badges.length > 1 && onClearAll && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

// Hook to generate filter badges from filter state
export const useFilterBadges = (
  filters: any,
  onClearFilter: (key: string) => void,
  config: {
    searchLabel?: string;
    categoryLabel?: string;
    priceLabel?: string;
    apyLabel?: string;
    dateLabel?: string;
    availabilityLabel?: string;
    categoryOptions?: Record<string, string>;
  } = {}
): FilterBadge[] => {
  const {
    searchLabel = 'Search',
    categoryLabel = 'Category',
    priceLabel = 'Price',
    apyLabel = 'APY',
    dateLabel = 'Date',
    availabilityLabel = 'Availability',
    categoryOptions = {}
  } = config;

  const badges: FilterBadge[] = [];

  // Search term
  if (filters.searchTerm && filters.searchTerm.trim()) {
    badges.push({
      key: 'searchTerm',
      label: searchLabel,
      value: filters.searchTerm,
      onRemove: () => onClearFilter('searchTerm'),
      color: 'blue'
    });
  }

  // Category
  if (filters.category && filters.category !== 'all') {
    const categoryName = categoryOptions[filters.category] || filters.category;
    badges.push({
      key: 'category',
      label: categoryLabel,
      value: categoryName,
      onRemove: () => onClearFilter('category'),
      color: 'green'
    });
  }

  // Price range
  if (filters.priceRange && Array.isArray(filters.priceRange)) {
    const [min, max] = filters.priceRange;
    if (min > 0 || max < 10000) { // Assuming default max is 10000
      badges.push({
        key: 'priceRange',
        label: priceLabel,
        value: `$${min.toLocaleString()} - $${max.toLocaleString()}`,
        onRemove: () => onClearFilter('priceRange'),
        color: 'yellow'
      });
    }
  }

  // APY range
  if (filters.apyRange && Array.isArray(filters.apyRange)) {
    const [min, max] = filters.apyRange;
    if (min > 0 || max < 20) { // Assuming default max is 20
      badges.push({
        key: 'apyRange',
        label: apyLabel,
        value: `${min}% - ${max}%`,
        onRemove: () => onClearFilter('apyRange'),
        color: 'purple'
      });
    }
  }

  // Date range
  if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
    const { start, end } = filters.dateRange;
    let dateValue = '';
    
    if (start && end) {
      dateValue = `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
    } else if (start) {
      dateValue = `From ${new Date(start).toLocaleDateString()}`;
    } else if (end) {
      dateValue = `Until ${new Date(end).toLocaleDateString()}`;
    }

    if (dateValue) {
      badges.push({
        key: 'dateRange',
        label: dateLabel,
        value: dateValue,
        onRemove: () => onClearFilter('dateRange'),
        color: 'indigo'
      });
    }
  }

  // Availability filters
  if (filters.availabilityFilter && Array.isArray(filters.availabilityFilter) && filters.availabilityFilter.length > 0) {
    badges.push({
      key: 'availabilityFilter',
      label: availabilityLabel,
      value: filters.availabilityFilter.join(', '),
      onRemove: () => onClearFilter('availabilityFilter'),
      color: 'red'
    });
  }

  return badges;
};