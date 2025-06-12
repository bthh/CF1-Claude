import { useState, useEffect, useCallback } from 'react';

export interface FilterState {
  searchTerm: string;
  category: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  priceRange: [number, number];
  apyRange: [number, number];
  availabilityFilter: string[];
  dateRange: {
    start: string;
    end: string;
  };
  customFilters: Record<string, any>;
}

interface UseFilterPreferencesOptions {
  storageKey: string;
  defaultFilters: Partial<FilterState>;
  autoSave?: boolean;
  debounceMs?: number;
}

export const useFilterPreferences = (options: UseFilterPreferencesOptions) => {
  const {
    storageKey,
    defaultFilters,
    autoSave = true,
    debounceMs = 500
  } = options;

  const [filters, setFilters] = useState<FilterState>(() => {
    // Load from localStorage on initialization
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...getDefaultFilters(),
            ...defaultFilters,
            ...parsed
          };
        }
      } catch (error) {
        console.warn('Failed to load filter preferences:', error);
      }
    }
    
    return {
      ...getDefaultFilters(),
      ...defaultFilters
    };
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Default filter structure
  function getDefaultFilters(): FilterState {
    return {
      searchTerm: '',
      category: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      priceRange: [0, 10000],
      apyRange: [0, 20],
      availabilityFilter: [],
      dateRange: {
        start: '',
        end: ''
      },
      customFilters: {}
    };
  }

  // Debounce filter changes for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters, debounceMs]);

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(debouncedFilters));
      } catch (error) {
        console.warn('Failed to save filter preferences:', error);
      }
    }
  }, [debouncedFilters, storageKey, autoSave]);

  // Update individual filter
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    const defaultState = {
      ...getDefaultFilters(),
      ...defaultFilters
    };
    setFilters(defaultState);
  }, [defaultFilters]);

  // Clear specific filter
  const clearFilter = useCallback(<K extends keyof FilterState>(key: K) => {
    const defaultState = {
      ...getDefaultFilters(),
      ...defaultFilters
    };
    updateFilter(key, defaultState[key]);
  }, [defaultFilters, updateFilter]);

  // Save current filters as a preset
  const savePreset = useCallback((name: string) => {
    try {
      const presets = JSON.parse(localStorage.getItem(`${storageKey}_presets`) || '{}');
      presets[name] = filters;
      localStorage.setItem(`${storageKey}_presets`, JSON.stringify(presets));
      return true;
    } catch (error) {
      console.warn('Failed to save filter preset:', error);
      return false;
    }
  }, [filters, storageKey]);

  // Load a saved preset
  const loadPreset = useCallback((name: string) => {
    try {
      const presets = JSON.parse(localStorage.getItem(`${storageKey}_presets`) || '{}');
      if (presets[name]) {
        setFilters(presets[name]);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to load filter preset:', error);
      return false;
    }
  }, [storageKey]);

  // Get all saved presets
  const getPresets = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(`${storageKey}_presets`) || '{}');
    } catch (error) {
      console.warn('Failed to get filter presets:', error);
      return {};
    }
  }, [storageKey]);

  // Delete a preset
  const deletePreset = useCallback((name: string) => {
    try {
      const presets = JSON.parse(localStorage.getItem(`${storageKey}_presets`) || '{}');
      delete presets[name];
      localStorage.setItem(`${storageKey}_presets`, JSON.stringify(presets));
      return true;
    } catch (error) {
      console.warn('Failed to delete filter preset:', error);
      return false;
    }
  }, [storageKey]);

  // Check if filters are different from defaults
  const hasActiveFilters = useCallback(() => {
    const defaultState = {
      ...getDefaultFilters(),
      ...defaultFilters
    };
    
    return Object.keys(filters).some(key => {
      const filterKey = key as keyof FilterState;
      const current = filters[filterKey];
      const defaultValue = defaultState[filterKey];
      
      if (Array.isArray(current) && Array.isArray(defaultValue)) {
        return JSON.stringify(current) !== JSON.stringify(defaultValue);
      }
      
      if (typeof current === 'object' && typeof defaultValue === 'object') {
        return JSON.stringify(current) !== JSON.stringify(defaultValue);
      }
      
      return current !== defaultValue;
    });
  }, [filters, defaultFilters]);

  // Get active filter count
  const getActiveFilterCount = useCallback(() => {
    const defaultState = {
      ...getDefaultFilters(),
      ...defaultFilters
    };
    
    let count = 0;
    
    // Count non-default filters
    Object.keys(filters).forEach(key => {
      const filterKey = key as keyof FilterState;
      const current = filters[filterKey];
      const defaultValue = defaultState[filterKey];
      
      if (filterKey === 'searchTerm' && current && current !== defaultValue) {
        count++;
      } else if (filterKey === 'category' && current !== defaultValue) {
        count++;
      } else if (filterKey === 'availabilityFilter' && Array.isArray(current) && current.length > 0) {
        count++;
      } else if (filterKey === 'priceRange' || filterKey === 'apyRange') {
        const [min, max] = current as [number, number];
        const [defaultMin, defaultMax] = defaultValue as [number, number];
        if (min !== defaultMin || max !== defaultMax) {
          count++;
        }
      } else if (filterKey === 'dateRange') {
        const range = current as { start: string; end: string };
        if (range.start || range.end) {
          count++;
        }
      }
    });
    
    return count;
  }, [filters, defaultFilters]);

  return {
    filters: debouncedFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter,
    savePreset,
    loadPreset,
    getPresets,
    deletePreset,
    hasActiveFilters: hasActiveFilters(),
    activeFilterCount: getActiveFilterCount(),
    
    // Immediate (non-debounced) filters for UI updates
    immediateFilters: filters,
    setImmediateFilter: updateFilter
  };
};