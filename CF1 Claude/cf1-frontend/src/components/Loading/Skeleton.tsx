import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'h-4',
    rectangular: '',
    rounded: 'rounded-lg',
    circular: 'rounded-full'
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could implement wave animation with CSS
    none: ''
  };
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Preset skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        className={index === lines - 1 ? 'w-3/4' : 'w-full'}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-48 h-6" />
          <Skeleton variant="text" className="w-32 h-4" />
        </div>
        <Skeleton variant="rectangular" className="w-16 h-6 rounded-full" />
      </div>
      
      {/* Image placeholder */}
      <Skeleton variant="rectangular" className="w-full h-48 rounded-lg" />
      
      {/* Content */}
      <div className="space-y-3">
        <SkeletonText lines={2} />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton variant="text" className="w-20 h-3" />
            <Skeleton variant="text" className="w-24 h-5" />
          </div>
          <div className="space-y-1">
            <Skeleton variant="text" className="w-16 h-3" />
            <Skeleton variant="text" className="w-20 h-5" />
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton variant="text" className="w-16 h-3" />
            <Skeleton variant="text" className="w-12 h-3" />
          </div>
          <Skeleton variant="rectangular" className="w-full h-2 rounded-full" />
        </div>
        
        {/* Button */}
        <Skeleton variant="rectangular" className="w-full h-10 rounded-lg" />
      </div>
    </div>
  </div>
);

export const SkeletonProposalCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
    <div className="space-y-4">
      {/* Header with icons and status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton variant="circular" className="w-6 h-6" />
          <Skeleton variant="rectangular" className="w-24 h-5 rounded-full" />
        </div>
        <Skeleton variant="rectangular" className="w-16 h-5 rounded-full" />
      </div>
      
      {/* Title and description */}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full h-6" />
        <Skeleton variant="text" className="w-3/4 h-4" />
        <SkeletonText lines={2} className="text-sm" />
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-1">
            <Skeleton variant="text" className="w-20 h-3" />
            <Skeleton variant="text" className="w-16 h-4" />
          </div>
        ))}
      </div>
      
      {/* Voting progress */}
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton variant="text" className="w-20 h-4" />
              <Skeleton variant="text" className="w-12 h-4" />
            </div>
            <Skeleton variant="rectangular" className="w-full h-2 rounded-full" />
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
        <Skeleton variant="text" className="w-24 h-4" />
        <Skeleton variant="rectangular" className="w-20 h-8 rounded-lg" />
      </div>
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    {/* Table header */}
    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" className="w-24 h-4" />
        ))}
      </div>
    </div>
    
    {/* Table rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-600">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                variant="text" 
                className={colIndex === 0 ? "w-32 h-4" : "w-20 h-4"} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonStats: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
    <div className={`grid grid-cols-1 md:grid-cols-${count} gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="text-center">
          <Skeleton variant="circular" className="w-12 h-12 mx-auto mb-3" />
          <Skeleton variant="text" className="w-16 h-6 mx-auto mb-1" />
          <Skeleton variant="text" className="w-20 h-4 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);