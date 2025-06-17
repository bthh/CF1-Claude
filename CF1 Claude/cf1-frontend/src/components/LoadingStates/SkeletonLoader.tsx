import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  lines?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  lines = 1,
  animation = 'pulse'
}) => {
  const baseClasses = `bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${
    animation === 'pulse' ? 'animate-pulse' : 
    animation === 'wave' ? 'animate-wave' : ''
  }`;

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
    card: 'rounded-xl'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : width // Last line is shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Specific skeleton components for common UI patterns
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <SkeletonLoader key={`header-${index}`} height="2rem" variant="rectangular" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div 
        key={`row-${rowIndex}`} 
        className="grid gap-4" 
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLoader 
            key={`cell-${rowIndex}-${colIndex}`} 
            height="1.5rem" 
            variant="rectangular" 
          />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ hasImage?: boolean }> = ({ hasImage = false }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
    {hasImage && (
      <SkeletonLoader height="12rem" variant="rectangular" className="mb-4" />
    )}
    <SkeletonLoader height="1.5rem" width="75%" variant="text" className="mb-2" />
    <SkeletonLoader height="1rem" variant="text" lines={3} className="mb-4" />
    <div className="flex justify-between items-center">
      <SkeletonLoader height="2rem" width="6rem" variant="rectangular" />
      <SkeletonLoader height="2rem" width="4rem" variant="rectangular" />
    </div>
  </div>
);

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = "20rem" }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex justify-between items-center mb-6">
      <SkeletonLoader height="1.5rem" width="8rem" variant="text" />
      <SkeletonLoader height="2rem" width="6rem" variant="rectangular" />
    </div>
    <SkeletonLoader height={height} variant="rectangular" />
    <div className="grid grid-cols-4 gap-4 mt-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="text-center">
          <SkeletonLoader height="1rem" variant="text" className="mb-1" />
          <SkeletonLoader height="1.5rem" width="3rem" variant="text" className="mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-4 mb-6">
      <SkeletonLoader width="4rem" height="4rem" variant="circular" />
      <div className="flex-1">
        <SkeletonLoader height="1.5rem" width="8rem" variant="text" className="mb-2" />
        <SkeletonLoader height="1rem" width="12rem" variant="text" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index}>
          <SkeletonLoader height="1rem" width="4rem" variant="text" className="mb-1" />
          <SkeletonLoader height="1.5rem" width="6rem" variant="text" />
        </div>
      ))}
    </div>
  </div>
);

// Wave animation CSS (to be added to global styles)
export const skeletonAnimationCSS = `
@keyframes wave {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-wave {
  animation: wave 2s linear infinite;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  background-size: 200px 100%;
}

.dark .animate-wave {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}
`;