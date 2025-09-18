/**
 * Optimized Admin Table with Virtualization and Performance Features
 * High-performance table for large admin datasets
 */

import React, { memo, useMemo, useCallback, useState } from 'react';
import { Search, Filter, Download, ChevronDown, MoreVertical } from 'lucide-react';
import { VirtualizedTable, VirtualizedTableColumn } from '../UI/VirtualizedList';
import CF1Button from '../UI/CF1Button';
import { SearchInput } from '../UI/SearchInput';
import { useOptimizedSearch } from '../../hooks/useOptimizedSearch';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceTracker';

export interface AdminTableItem {
  id: string | number;
  [key: string]: any;
}

export interface AdminTableAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: AdminTableItem) => void;
  variant?: 'default' | 'destructive' | 'ghost';
  disabled?: (item: AdminTableItem) => boolean;
}

export interface AdminTableFilter {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  type: 'select' | 'multi-select' | 'date-range';
}

export interface OptimizedAdminTableProps {
  data: AdminTableItem[];
  columns: VirtualizedTableColumn<AdminTableItem>[];
  title: string;
  description?: string;
  searchFields?: string[];
  filters?: AdminTableFilter[];
  actions?: AdminTableAction[];
  bulkActions?: AdminTableAction[];
  exportConfig?: {
    enabled: boolean;
    filename?: string;
    format?: 'csv' | 'xlsx' | 'json';
  };
  pagination?: {
    enabled: boolean;
    pageSize?: number;
  };
  containerHeight?: number;
  rowHeight?: number;
  onRowClick?: (item: AdminTableItem) => void;
  onBulkAction?: (action: AdminTableAction, selectedItems: AdminTableItem[]) => void;
  className?: string;
}

const OptimizedAdminTable: React.FC<OptimizedAdminTableProps> = memo(({
  data,
  columns,
  title,
  description,
  searchFields = [],
  filters = [],
  actions = [],
  bulkActions = [],
  exportConfig,
  pagination,
  containerHeight = 600,
  rowHeight = 60,
  onRowClick,
  onBulkAction,
  className = ''
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [sortColumn, setSortColumn] = useState<string>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Performance monitoring
  const { trackCustomInteraction } = usePerformanceMonitoring('OptimizedAdminTable');

  // Filter data based on active filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => {
          const itemValue = item[key];
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          return itemValue === value;
        });
      }
    });

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, activeFilters, sortColumn, sortDirection]);

  // Search functionality
  const {
    query: searchQuery,
    results: searchResults,
    isSearching,
    setQuery: setSearchQuery,
    clearSearch
  } = useOptimizedSearch({
    data: filteredData,
    options: {
      searchFields: searchFields.length > 0 ? searchFields : Object.keys(data[0] || {}),
      debounceMs: 300,
      maxResults: 1000,
      enableCache: true
    }
  });

  // Final data to display
  const displayData = searchQuery ? searchResults.map(r => r.item) : filteredData;

  // Handle row selection
  const handleRowSelect = useCallback((item: AdminTableItem, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(item.id);
      } else {
        newSet.delete(item.id);
      }
      return newSet;
    });
    trackCustomInteraction?.('row_selected', 0);
  }, [trackCustomInteraction]);

  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedItems(new Set(displayData.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
    trackCustomInteraction?.('select_all_toggled', 0);
  }, [displayData, trackCustomInteraction]);

  // Handle sorting
  const handleSort = useCallback((columnKey: string, direction: 'asc' | 'desc') => {
    setSortColumn(columnKey);
    setSortDirection(direction);
    trackCustomInteraction?.('column_sorted', 0);
  }, [trackCustomInteraction]);

  // Handle bulk actions
  const handleBulkAction = useCallback((action: AdminTableAction) => {
    const selectedItemsArray = displayData.filter(item => selectedItems.has(item.id));
    onBulkAction?.(action, selectedItemsArray);
    setSelectedItems(new Set()); // Clear selection after action
    trackCustomInteraction?.('bulk_action_executed', 0);
  }, [displayData, selectedItems, onBulkAction, trackCustomInteraction]);

  // Handle export
  const handleExport = useCallback(() => {
    trackCustomInteraction?.('data_exported', 0);
    
    if (!exportConfig?.enabled) return;

    const dataToExport = selectedItems.size > 0 
      ? displayData.filter(item => selectedItems.has(item.id))
      : displayData;

    const exportData = dataToExport.map(item => {
      const exportItem: any = {};
      columns.forEach(col => {
        exportItem[col.header] = item[col.key] || '';
      });
      return exportItem;
    });

    // Simple CSV export
    if (exportConfig.format === 'csv' || !exportConfig.format) {
      const headers = columns.map(col => col.header).join(',');
      const rows = exportData.map(item => 
        Object.values(item).map(val => `"${val}"`).join(',')
      ).join('\n');
      
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = exportConfig.filename || `${title.toLowerCase()}-export.csv`;
      a.click();
      
      URL.revokeObjectURL(url);
    }
  }, [
    exportConfig,
    selectedItems,
    displayData,
    columns,
    title,
    trackCustomInteraction
  ]);

  // Enhanced columns with selection and actions
  const enhancedColumns = useMemo(() => {
    const cols: VirtualizedTableColumn<AdminTableItem>[] = [];

    // Selection column
    if (bulkActions.length > 0) {
      cols.push({
        key: '_select',
        header: (
          <input
            type="checkbox"
            checked={selectedItems.size === displayData.length && displayData.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
        ) as any,
        width: 50,
        render: (item) => (
          <input
            type="checkbox"
            checked={selectedItems.has(item.id)}
            onChange={(e) => handleRowSelect(item, e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
        )
      });
    }

    // Add original columns
    cols.push(...columns);

    // Actions column
    if (actions.length > 0) {
      cols.push({
        key: '_actions',
        header: 'Actions',
        width: 120,
        render: (item) => (
          <div className="flex items-center space-x-1">
            {actions.slice(0, 2).map(action => {
              const Icon = action.icon;
              const disabled = action.disabled?.(item) || false;
              
              return (
                <CF1Button
                  key={action.id}
                  size="sm"
                  variant={action.variant || 'ghost'}
                  onClick={() => action.onClick(item)}
                  disabled={disabled}
                  className="px-2"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                </CF1Button>
              );
            })}
            
            {actions.length > 2 && (
              <CF1Button size="sm" variant="ghost" className="px-2">
                <MoreVertical className="w-4 h-4" />
              </CF1Button>
            )}
          </div>
        )
      });
    }

    return cols;
  }, [
    columns,
    actions,
    bulkActions.length,
    selectedItems,
    displayData.length,
    handleSelectAll,
    handleRowSelect
  ]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {exportConfig?.enabled && (
              <CF1Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </CF1Button>
            )}
            
            {filters.length > 0 && (
              <CF1Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </CF1Button>
            )}
          </div>
        </div>

        {/* Search and Bulk Actions */}
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Search..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full"
            />
          </div>

          {selectedItems.size > 0 && bulkActions.length > 0 && (
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedItems.size} selected
              </span>
              {bulkActions.map(action => {
                const Icon = action.icon;
                return (
                  <CF1Button
                    key={action.id}
                    size="sm"
                    variant={action.variant || 'outline'}
                    onClick={() => handleBulkAction(action)}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-1" />}
                    {action.label}
                  </CF1Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Data Stats */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {displayData.length} of {data.length} items
          {searchQuery && ` • Searching for "${searchQuery}"`}
          {isSearching && ' • Searching...'}
        </div>
      </div>

      {/* Filters (if enabled) */}
      {showFilters && filters.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map(filter => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {filter.label}
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  value={activeFilters[filter.key] || 'all'}
                  onChange={(e) => setActiveFilters(prev => ({
                    ...prev,
                    [filter.key]: e.target.value === 'all' ? undefined : e.target.value
                  }))}
                >
                  <option value="all">All {filter.label}</option>
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Virtualized Table */}
      <div className="overflow-hidden">
        <VirtualizedTable
          items={displayData}
          columns={enhancedColumns}
          itemHeight={rowHeight}
          containerHeight={containerHeight}
          onRowClick={onRowClick}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
      </div>
    </div>
  );
});

OptimizedAdminTable.displayName = 'OptimizedAdminTable';

export default OptimizedAdminTable;