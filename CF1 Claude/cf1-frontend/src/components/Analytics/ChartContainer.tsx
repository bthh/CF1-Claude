import React from 'react';
import { MoreVertical, Download, Maximize2 } from 'lucide-react';
import { SkeletonCard } from '../Loading/Skeleton';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  actions?: React.ReactNode;
  onDownload?: () => void;
  onExpand?: () => void;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  isLoading = false,
  actions,
  onDownload,
  onExpand
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
          {actions}
          
          {(onDownload || onExpand) && (
            <div className="relative group">
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-44 sm:w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                {onDownload && (
                  <button
                    onClick={onDownload}
                    className="flex items-center space-x-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg"
                  >
                    <Download className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span>Download Chart</span>
                  </button>
                )}
                {onExpand && (
                  <button
                    onClick={onExpand}
                    className="flex items-center space-x-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 last:rounded-b-lg"
                  >
                    <Maximize2 className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span>Expand View</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Chart Content */}
      <div className="w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};