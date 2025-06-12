import { useMemo } from 'react';

interface FilterBadge {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

interface UseFilterBadgesOptions {
  categoryOptions?: Record<string, string>;
  excludeKeys?: string[];
}

export const useFilterBadges = (
  filters: Record<string, any>,
  onRemoveFilter: (key: string) => void,
  options: UseFilterBadgesOptions = {}
): FilterBadge[] => {
  const { categoryOptions = {}, excludeKeys = [] } = options;

  return useMemo(() => {
    const badges: FilterBadge[] = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (excludeKeys.includes(key)) return;
      
      // Skip empty or default values
      if (!value || 
          value === '' || 
          value === 'all' ||
          (Array.isArray(value) && value.length === 0) ||
          (Array.isArray(value) && key.includes('Range') && 
           ((key === 'priceRange' && value[0] === 0 && value[1] === 10000) ||
            (key === 'apyRange' && value[0] === 0 && value[1] === 20)))) {
        return;
      }

      let label = '';
      let displayValue = '';
      let color: FilterBadge['color'] = 'blue';

      switch (key) {
        case 'searchTerm':
          label = 'Search';
          displayValue = `"${value}"`;
          color = 'green';
          break;
        
        case 'category':
          label = 'Category';
          displayValue = categoryOptions[value] || value;
          color = 'blue';
          break;
        
        case 'sortBy':
          label = 'Sort by';
          displayValue = value.charAt(0).toUpperCase() + value.slice(1);
          color = 'purple';
          break;
        
        case 'sortOrder':
          label = 'Order';
          displayValue = value === 'asc' ? 'Ascending' : 'Descending';
          color = 'purple';
          break;
        
        case 'priceRange':
          if (Array.isArray(value) && (value[0] > 0 || value[1] < 10000)) {
            label = 'Price';
            displayValue = `$${value[0]} - $${value[1]}`;
            color = 'yellow';
          }
          break;
        
        case 'apyRange':
          if (Array.isArray(value) && (value[0] > 0 || value[1] < 20)) {
            label = 'APY';
            displayValue = `${value[0]}% - ${value[1]}%`;
            color = 'yellow';
          }
          break;
        
        case 'availabilityFilter':
          if (Array.isArray(value) && value.length > 0) {
            label = 'Availability';
            displayValue = value.map(v => {
              switch (v) {
                case 'high': return 'High (>50%)';
                case 'medium': return 'Medium (20-50%)';
                case 'low': return 'Low (1-20%)';
                case 'sold-out': return 'Sold Out';
                default: return v;
              }
            }).join(', ');
            color = 'indigo';
          }
          break;
        
        default:
          // Handle custom filters
          if (typeof value === 'string' || typeof value === 'number') {
            label = key.charAt(0).toUpperCase() + key.slice(1);
            displayValue = String(value);
          }
          break;
      }

      if (label && displayValue) {
        badges.push({
          key,
          label,
          value: displayValue,
          color,
          onRemove: () => onRemoveFilter(key)
        });
      }
    });

    return badges;
  }, [filters, onRemoveFilter, categoryOptions, excludeKeys]);
};