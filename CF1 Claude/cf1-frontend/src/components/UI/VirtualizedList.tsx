/**
 * Virtualized List Component for Large Data Sets
 * Optimizes performance by only rendering visible items
 */

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useRef, 
  useMemo,
  memo
} from 'react';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceTracker';

export interface VirtualizedListItem {
  id: string | number;
  height?: number;
  data: any;
}

export interface VirtualizedListProps<T extends VirtualizedListItem> {
  items: T[];
  itemHeight: number | ((item: T, index: number) => number);
  renderItem: (item: T, index: number, style: React.CSSProperties) => JSX.Element;
  containerHeight: number;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  onItemClick?: (item: T, index: number) => void;
  estimatedItemSize?: number;
  threshold?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

const VirtualizedList = memo(<T extends VirtualizedListItem>({
  items,
  itemHeight,
  renderItem,
  containerHeight,
  overscan = 5,
  className = '',
  onScroll,
  onItemClick,
  estimatedItemSize = 50,
  threshold = 100,
  getItemKey
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  
  // Performance monitoring
  const { trackCustomInteraction } = usePerformanceMonitoring('VirtualizedList');

  // Memoize item heights for dynamic sizing
  const itemHeights = useMemo(() => {
    if (typeof itemHeight === 'function') {
      return items.map((item, index) => itemHeight(item, index));
    }
    return new Array(items.length).fill(itemHeight);
  }, [items, itemHeight]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return itemHeights.reduce((sum, height) => sum + height, 0);
  }, [itemHeights]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    let startIndex = 0;
    let endIndex = 0;
    let accumulatedHeight = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      if (accumulatedHeight + itemHeights[i] > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += itemHeights[i];
    }

    // Find end index
    accumulatedHeight = 0;
    for (let i = 0; i < items.length; i++) {
      if (i >= startIndex) {
        if (accumulatedHeight > containerHeight + overscan * estimatedItemSize) {
          endIndex = Math.min(items.length - 1, i + overscan);
          break;
        }
      }
      if (i >= startIndex) {
        accumulatedHeight += itemHeights[i];
      }
    }

    if (endIndex === 0) {
      endIndex = items.length - 1;
    }

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, items.length, itemHeights, overscan, estimatedItemSize]);

  // Calculate offset for visible items
  const offsetY = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < visibleRange.startIndex; i++) {
      offset += itemHeights[i];
    }
    return offset;
  }, [visibleRange.startIndex, itemHeights]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Handle scroll with throttling
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const newScrollTop = element.scrollTop;
    const newScrollLeft = element.scrollLeft;

    // Throttle scroll updates
    if (Math.abs(newScrollTop - lastScrollTop.current) > threshold) {
      setScrollTop(newScrollTop);
      lastScrollTop.current = newScrollTop;

      // Track scroll performance
      trackCustomInteraction?.('scroll', 0);
    }

    setScrollLeft(newScrollLeft);
    onScroll?.(newScrollTop, newScrollLeft);

    // Clear existing timeout and set new one for scroll end
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      trackCustomInteraction?.('scroll_end', 0);
    }, 150);
  }, [threshold, onScroll, trackCustomInteraction]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      handleResize();
    }

    return () => {
      resizeObserver.disconnect();
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Handle item click with performance tracking
  const handleItemClick = useCallback((item: T, index: number) => {
    trackCustomInteraction?.('item_click', 0);
    onItemClick?.(item, visibleRange.startIndex + index);
  }, [onItemClick, visibleRange.startIndex, trackCustomInteraction]);

  // Generate item key
  const generateItemKey = useCallback((item: T, index: number) => {
    if (getItemKey) {
      return getItemKey(item, visibleRange.startIndex + index);
    }
    return item.id || `item-${visibleRange.startIndex + index}`;
  }, [getItemKey, visibleRange.startIndex]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height: containerHeight }}
    >
      <div
        ref={scrollElementRef}
        className="overflow-auto w-full h-full"
        onScroll={handleScroll}
        style={{ height: containerHeight }}
      >
        {/* Total height container for scrollbar */}
        <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
          {/* Visible items container */}
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {visibleItems.map((item, index) => {
              const itemStyle: React.CSSProperties = {
                height: itemHeights[visibleRange.startIndex + index],
                width: '100%',
                position: 'relative'
              };

              return (
                <div
                  key={generateItemKey(item, index)}
                  style={itemStyle}
                  onClick={() => handleItemClick(item, index)}
                >
                  {renderItem(item, visibleRange.startIndex + index, itemStyle)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

export default VirtualizedList;

// Hook for managing virtualized list state
export const useVirtualizedList = <T extends VirtualizedListItem>(
  initialItems: T[] = [],
  config: {
    itemHeight: number | ((item: T, index: number) => number);
    containerHeight: number;
    overscan?: number;
    estimatedItemSize?: number;
  }
) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Load more items (for infinite scrolling)
  const loadMore = useCallback(async (
    loadFunction: (offset: number, limit: number) => Promise<T[]>
  ) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newItems = await loadFunction(items.length, 50);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [items.length, isLoading, hasMore]);

  // Reset items
  const resetItems = useCallback((newItems: T[] = []) => {
    setItems(newItems);
    setHasMore(true);
  }, []);

  // Add items
  const addItems = useCallback((newItems: T[]) => {
    setItems(prev => [...prev, ...newItems]);
  }, []);

  // Remove item
  const removeItem = useCallback((itemId: string | number) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Update item
  const updateItem = useCallback((itemId: string | number, updates: Partial<T>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, []);

  return {
    items,
    isLoading,
    hasMore,
    loadMore,
    resetItems,
    addItems,
    removeItem,
    updateItem,
    config
  };
};

// Performance-optimized table virtualization
export interface VirtualizedTableColumn<T> {
  key: string;
  header: string;
  width: number | string;
  render: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface VirtualizedTableProps<T extends VirtualizedListItem> {
  items: T[];
  columns: VirtualizedTableColumn<T>[];
  itemHeight: number;
  containerHeight: number;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  onRowClick?: (item: T, index: number) => void;
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export const VirtualizedTable = memo(<T extends VirtualizedListItem>({
  items,
  columns,
  itemHeight,
  containerHeight,
  className = '',
  headerClassName = '',
  rowClassName = '',
  onRowClick,
  onSort,
  sortColumn,
  sortDirection
}: VirtualizedTableProps<T>) => {
  const renderItem = useCallback((item: T, index: number, style: React.CSSProperties) => {
    const rowClass = typeof rowClassName === 'function' 
      ? rowClassName(item, index)
      : rowClassName;

    return (
      <div 
        className={`flex items-center border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${rowClass}`}
        style={style}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className="px-4 py-2 flex-shrink-0"
            style={{ width: column.width }}
          >
            {column.render(item, index)}
          </div>
        ))}
      </div>
    );
  }, [columns, rowClassName]);

  const handleSort = useCallback((columnKey: string) => {
    if (!onSort) return;
    
    const newDirection = 
      sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
  }, [onSort, sortColumn, sortDirection]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className={`flex items-center bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 ${headerClassName}`}>
        {columns.map((column) => (
          <div
            key={column.key}
            className={`px-4 py-3 flex-shrink-0 font-medium text-gray-900 dark:text-white ${
              column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''
            }`}
            style={{ width: column.width }}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <div className="flex items-center space-x-1">
              <span>{column.header}</span>
              {column.sortable && sortColumn === column.key && (
                <span className="text-blue-500">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Virtualized rows */}
      <VirtualizedList
        items={items}
        itemHeight={itemHeight}
        renderItem={renderItem}
        containerHeight={containerHeight - 48} // Subtract header height
        onItemClick={onRowClick}
        getItemKey={(item, index) => `row-${item.id || index}`}
      />
    </div>
  );
});

VirtualizedTable.displayName = 'VirtualizedTable';