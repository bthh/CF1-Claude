import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, Filter, Download, MoreVertical } from 'lucide-react';

interface TouchTableColumn {
  key: string;
  title: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  responsive?: 'always' | 'desktop' | 'tablet';
}

interface TouchTableProps {
  data: any[];
  columns: TouchTableColumn[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  mobileCardView?: boolean;
  exportable?: boolean;
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  actions?: React.ReactNode;
}

export const TouchTable: React.FC<TouchTableProps> = ({
  data,
  columns,
  title,
  searchable = true,
  filterable = false,
  sortable = true,
  paginated = true,
  pageSize = 10,
  mobileCardView = true,
  exportable = false,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  actions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // Sort data
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = paginated
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Get visible columns based on screen size
  const getVisibleColumns = () => {
    if (isMobile) {
      return columns.filter(col => 
        col.responsive === 'always' || !col.responsive
      ).slice(0, 2); // Show max 2 columns on mobile
    }
    return columns.filter(col => col.responsive !== 'desktop' || !isMobile);
  };

  const visibleColumns = getVisibleColumns();

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      columns.map(col => col.title).join(','),
      ...sortedData.map(row =>
        columns.map(col => `"${row[col.key] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'table'}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}>
        {title && (
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
        )}
        <div className="p-4 sm:p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Mobile card view
  if (isMobile && mobileCardView) {
    return (
      <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}>
        {/* Header */}
        {(title || searchable || actions) && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              <div className="flex items-center space-x-2">
                {actions}
                {exportable && (
                  <button
                    onClick={handleExport}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
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
            )}
          </div>
        )}

        {/* Cards */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedData.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
            </div>
          ) : (
            paginatedData.map((row, index) => (
              <div
                key={index}
                onClick={() => onRowClick?.(row)}
                className={`
                  p-4
                  space-y-3
                  transition-colors
                  touch-manipulation
                  ${onRowClick ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' : ''}
                `}
              >
                {columns.map(column => {
                  const value = row[column.key];
                  const displayValue = column.render ? column.render(value, row) : value;
                  
                  return (
                    <div key={column.key} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-0 mr-3">
                        {column.title}:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white text-right min-w-0 flex-1">
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {paginated && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
              </p>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      {(title || searchable || actions) && (
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            
            <div className="flex items-center space-x-3">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="
                      w-64
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
              )}
              
              {actions}
              
              {exportable && (
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div ref={tableRef} className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {visibleColumns.map(column => (
                <th
                  key={column.key}
                  className={`
                    px-4
                    sm:px-6
                    py-3
                    text-left
                    text-xs
                    font-medium
                    text-gray-500
                    dark:text-gray-400
                    uppercase
                    tracking-wider
                    ${column.sortable && sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none touch-manipulation' : ''}
                    ${column.className || ''}
                  `}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="px-6 py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    transition-colors
                    ${onRowClick ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' : ''}
                  `}
                >
                  {visibleColumns.map(column => {
                    const value = row[column.key];
                    const displayValue = column.render ? column.render(value, row) : value;
                    
                    return (
                      <td
                        key={column.key}
                        className={`
                          px-4
                          sm:px-6
                          py-4
                          whitespace-nowrap
                          text-sm
                          text-gray-900
                          dark:text-white
                          ${column.className || ''}
                        `}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </p>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`
                        px-3
                        py-2
                        text-sm
                        rounded-lg
                        transition-colors
                        touch-manipulation
                        ${currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};