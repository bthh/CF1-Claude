import React, { Suspense, ComponentType } from 'react';
import { RouteObject } from 'react-router-dom';
import { SkeletonLoader } from '../LoadingStates/SkeletonLoader';
import { TransitionWrapper } from '../LoadingStates/TransitionWrapper';

// Lazy loading wrapper with enhanced loading states
const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingComponent?: ComponentType,
  errorComponent?: ComponentType<{ retry: () => void }>
) => {
  const LazyComponent = React.lazy(() => 
    importFunc().catch(error => {
      console.error('Failed to load component:', error);
      // Retry logic for failed imports
      return importFunc();
    })
  );

  const WrappedComponent = React.forwardRef<any, any>((props, ref) => {
    const [hasError, setHasError] = React.useState(false);

    const handleRetry = () => {
      setHasError(false);
      // Force component remount
      window.location.reload();
    };

    if (hasError && errorComponent) {
      const ErrorComponent = errorComponent;
      return <ErrorComponent retry={handleRetry} />;
    }

    const LoadingComponent = loadingComponent || DefaultLoadingComponent;

    return (
      <Suspense fallback={<LoadingComponent />}>
        <TransitionWrapper type="slideUp" duration={0.3}>
          <LazyComponent {...(props as any)} />
        </TransitionWrapper>
      </Suspense>
    );
  });

  WrappedComponent.displayName = `LazyComponent(${(LazyComponent as any).displayName || 'Unknown'})`;
  
  return WrappedComponent;
};

// Default loading component
const DefaultLoadingComponent: React.FC = () => (
  <div className="p-6 space-y-4">
    <SkeletonLoader variant="text" className="h-8 w-1/3" />
    <SkeletonLoader variant="rectangular" className="h-64 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SkeletonLoader variant="rectangular" className="h-32" />
      <SkeletonLoader variant="rectangular" className="h-32" />
    </div>
  </div>
);

// Error boundary component
const LazyErrorComponent: React.FC<{ retry: () => void }> = ({ retry }) => (
  <div className="flex flex-col items-center justify-center min-h-64 p-6">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Failed to Load Component
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        There was an error loading this page. Please try again.
      </p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

// Specific loading components for different page types
const DashboardLoading: React.FC = () => (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <SkeletonLoader variant="text" className="h-8 w-48" />
      <SkeletonLoader variant="rectangular" className="h-10 w-32 rounded-lg" />
    </div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <SkeletonLoader variant="text" className="h-4 w-20 mb-2" />
          <SkeletonLoader variant="text" className="h-8 w-32" />
        </div>
      ))}
    </div>
    
    {/* Chart */}
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <SkeletonLoader variant="text" className="h-6 w-40 mb-4" />
      <SkeletonLoader variant="rectangular" className="h-64" />
    </div>
  </div>
);

const MarketplaceLoading: React.FC = () => (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <SkeletonLoader variant="text" className="h-8 w-48" />
      <div className="flex space-x-3">
        <SkeletonLoader variant="rectangular" className="h-10 w-24 rounded-lg" />
        <SkeletonLoader variant="rectangular" className="h-10 w-24 rounded-lg" />
      </div>
    </div>
    
    {/* Filters */}
    <div className="flex space-x-4">
      {[...Array(5)].map((_, i) => (
        <SkeletonLoader key={i} variant="rectangular" className="h-10 w-20 rounded-lg" />
      ))}
    </div>
    
    {/* Asset Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <SkeletonLoader variant="rectangular" className="h-48 w-full mb-4 rounded-lg" />
          <SkeletonLoader variant="text" className="h-6 w-3/4 mb-2" />
          <SkeletonLoader variant="text" className="h-4 w-1/2 mb-4" />
          <div className="flex justify-between items-center">
            <SkeletonLoader variant="text" className="h-6 w-20" />
            <SkeletonLoader variant="rectangular" className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PortfolioLoading: React.FC = () => (
  <div className="p-6 space-y-6">
    {/* Portfolio Overview */}
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <SkeletonLoader variant="text" className="h-6 w-40 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center">
            <SkeletonLoader variant="text" className="h-8 w-24 mx-auto mb-2" />
            <SkeletonLoader variant="text" className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
    
    {/* Holdings Table */}
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <SkeletonLoader variant="text" className="h-6 w-32 mb-4" />
      <SkeletonLoader variant="card" lines={5} />
    </div>
  </div>
);

// Lazy loaded components
export const LazyDashboard = createLazyComponent(
  () => import('../../pages/Dashboard'),
  DashboardLoading,
  LazyErrorComponent
);

export const LazyMarketplace = createLazyComponent(
  () => import('../../pages/Marketplace'),
  MarketplaceLoading,
  LazyErrorComponent
);

export const LazyPortfolio = createLazyComponent(
  () => import('../../pages/Portfolio'),
  PortfolioLoading,
  LazyErrorComponent
);

export const LazyLaunchpad = createLazyComponent(
  () => import('../../pages/Launchpad'),
  DefaultLoadingComponent,
  LazyErrorComponent
);

export const LazyCreateProposal = createLazyComponent(
  () => import('../../pages/CreateProposal'),
  DefaultLoadingComponent,
  LazyErrorComponent
);

export const LazyAssetDetail = createLazyComponent(
  () => import('../../pages/AssetDetail'),
  DefaultLoadingComponent,
  LazyErrorComponent
);

export const LazyAnalytics = createLazyComponent(
  () => import('../../pages/Analytics'),
  DefaultLoadingComponent,
  LazyErrorComponent
);

export const LazyPortfolioTransactions = createLazyComponent(
  () => import('../../pages/PortfolioTransactions'),
  PortfolioLoading,
  LazyErrorComponent
);

export const LazyProfile = createLazyComponent(
  () => import('../../pages/Profile'),
  DefaultLoadingComponent,
  LazyErrorComponent
);

export const LazyProfileVerification = createLazyComponent(
  () => import('../../pages/Verification'),
  DefaultLoadingComponent,
  LazyErrorComponent
);

export const LazyGovernance = createLazyComponent(
  () => import('../../pages/Governance'),
  DefaultLoadingComponent,
  LazyErrorComponent
);

export const LazyMarketSimulation = createLazyComponent(
  () => import('../MarketSimulation/LiveMarketDisplay'),
  DefaultLoadingComponent,
  LazyErrorComponent
);


export const LazyPerformanceDashboard = createLazyComponent(
  () => import('../Performance/PerformanceDashboard'),
  DefaultLoadingComponent,
  LazyErrorComponent
);

// Admin components (lazy loaded separately for security)
export const LazyAdminDashboard = createLazyComponent(
  () => import('../../pages/PlatformAdmin'),
  DefaultLoadingComponent,
  LazyErrorComponent
);

export const LazyAdminUsers = createLazyComponent(
  () => import('../../pages/AdminUsers'),
  DefaultLoadingComponent,
  LazyErrorComponent
);

export const LazyAdminAssets = createLazyComponent(
  () => import('../../pages/AdminAssets'),
  DefaultLoadingComponent,
  LazyErrorComponent
);

// Route prefetching utility
export const prefetchRoute = async (routeName: string): Promise<void> => {
  const routeLoaders: Record<string, () => Promise<any>> = {
    dashboard: () => import('../../pages/Dashboard'),
    marketplace: () => import('../../pages/Marketplace'),
    portfolio: () => import('../../pages/Portfolio'),
    launchpad: () => import('../../pages/Launchpad'),
    analytics: () => import('../../pages/Analytics'),
    profile: () => import('../../pages/Profile'),
    governance: () => import('../../pages/Governance')
  };

  const loader = routeLoaders[routeName];
  if (loader) {
    try {
      await loader();
      console.log(`Prefetched route: ${routeName}`);
    } catch (error) {
      console.warn(`Failed to prefetch route: ${routeName}`, error);
    }
  }
};

// Intelligent prefetching based on user behavior
export const usePrefetchOnHover = () => {
  const [prefetchedRoutes, setPrefetchedRoutes] = React.useState<Set<string>>(new Set());

  const handleMouseEnter = React.useCallback((routeName: string) => {
    if (!prefetchedRoutes.has(routeName)) {
      prefetchRoute(routeName);
      setPrefetchedRoutes(prev => new Set([...prev, routeName]));
    }
  }, [prefetchedRoutes]);

  return { handleMouseEnter };
};

// Bundle size estimation
export const getBundleInfo = (): Promise<{ size: number; gzipSize: number }> => {
  return new Promise((resolve) => {
    // This would be populated by the build process
    fetch('/bundle-info.json')
      .then(response => response.json())
      .then(resolve)
      .catch(() => resolve({ size: 0, gzipSize: 0 }));
  });
};

// Performance-aware routing
export const PerformanceAwareRoute: React.FC<{
  component: React.ComponentType;
  threshold?: number;
  fallback?: React.ComponentType;
}> = ({ component: Component, threshold = 3000, fallback: Fallback }) => {
  const [isSlowConnection, setIsSlowConnection] = React.useState(false);

  React.useEffect(() => {
    // Check connection speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType) {
        const slowTypes = ['slow-2g', '2g'];
        setIsSlowConnection(slowTypes.includes(connection.effectiveType));
      }
    }

    // Check loading performance
    const startTime = performance.now();
    const checkPerformance = () => {
      const loadTime = performance.now() - startTime;
      if (loadTime > threshold) {
        setIsSlowConnection(true);
      }
    };

    setTimeout(checkPerformance, 1000);
  }, [threshold]);

  if (isSlowConnection && Fallback) {
    return <Fallback />;
  }

  return <Component />;
};

// Preload critical routes on app start
export const preloadCriticalRoutes = async (): Promise<void> => {
  const criticalRoutes = ['dashboard', 'marketplace'];
  
  await Promise.allSettled(
    criticalRoutes.map(route => prefetchRoute(route))
  );
};

// Route analytics
export const trackRoutePerformance = (routeName: string) => {
  const startTime = performance.now();
  
  return () => {
    const loadTime = performance.now() - startTime;
    
    // Send to analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_load_time', {
        event_category: 'Performance',
        event_label: routeName,
        value: Math.round(loadTime)
      });
    }
    
    console.log(`Route ${routeName} loaded in ${loadTime.toFixed(2)}ms`);
  };
};