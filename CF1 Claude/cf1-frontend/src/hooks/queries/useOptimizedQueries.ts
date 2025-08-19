/**
 * Optimized React Query Hooks with Performance Enhancements
 * Provides intelligent caching, background updates, and performance monitoring
 */

import { 
  useQuery, 
  useMutation, 
  useInfiniteQuery, 
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions,
  QueryClient,
  useQueryClient
} from '@tanstack/react-query';
import { performanceMonitor } from '../../utils/performanceMonitoring';
import { useMobileOptimizations } from '../useMobileOptimizations';

// Enhanced query options with performance optimizations
export interface OptimizedQueryOptions<TData, TError = Error> extends UseQueryOptions<TData, TError> {
  enableBackgroundRefetch?: boolean;
  enableOfflineSupport?: boolean;
  cacheTime?: number;
  staleTime?: number;
  maxRetries?: number;
  retryOnMount?: boolean;
  performanceTracking?: boolean;
  preloadRelated?: string[];
  adaptiveStaleTime?: boolean;
}

// Create optimized query client configuration
export const createOptimizedQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default cache time: 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 10 minutes after component unmount
        gcTime: 10 * 60 * 1000,
        // Retry failed requests up to 3 times
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as any).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 3;
        },
        // Refetch on window focus
        refetchOnWindowFocus: true,
        // Don't refetch on reconnect for better performance
        refetchOnReconnect: false,
        // Network mode for offline support
        networkMode: 'offlineFirst'
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        // Network mode for offline support
        networkMode: 'offlineFirst'
      }
    }
  });
};

// Optimized query hook with performance monitoring
export const useOptimizedQuery = <TData, TError = Error>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: OptimizedQueryOptions<TData, TError> = {}
) => {
  const queryClient = useQueryClient();
  const mobileOpts = useMobileOptimizations();
  
  // Adaptive configuration based on device capabilities
  const adaptiveOptions: UseQueryOptions<TData, TError> = {
    ...options,
    // Adaptive stale time based on connection
    staleTime: options.adaptiveStaleTime ? 
      getAdaptiveStaleTime(mobileOpts.connectionInfo) : 
      options.staleTime,
    
    // Reduce retry attempts on slow connections
    retry: mobileOpts.isSlowConnection ? 1 : (options.maxRetries || 3),
    
    // Disable background refetch on slow connections
    refetchOnWindowFocus: mobileOpts.isSlowConnection ? false : 
      (options.enableBackgroundRefetch ?? true),
    
    // Longer cache time on mobile to reduce requests
    gcTime: mobileOpts.isMobile ? 
      (options.cacheTime || 15 * 60 * 1000) : 
      (options.cacheTime || 10 * 60 * 1000)
  };

  const result = useQuery({
    queryKey,
    queryFn: async () => {
      const startTime = performance.now();
      
      try {
        const data = await queryFn();
        
        // Track successful query performance
        if (options.performanceTracking !== false) {
          const duration = performance.now() - startTime;
          performanceMonitor.trackAPIResponse(
            queryKey.join('/'),
            duration,
            200,
            'GET'
          );
        }

        // Preload related queries
        if (options.preloadRelated) {
          preloadRelatedQueries(queryClient, options.preloadRelated, data);
        }
        
        return data;
      } catch (error) {
        // Track failed query performance
        if (options.performanceTracking !== false) {
          const duration = performance.now() - startTime;
          performanceMonitor.trackAPIResponse(
            queryKey.join('/'),
            duration,
            500,
            'GET'
          );
        }
        throw error;
      }
    },
    ...adaptiveOptions
  });

  return result;
};

// Optimized infinite query for large datasets
export const useOptimizedInfiniteQuery = <TData, TError = Error>(
  queryKey: string[],
  queryFn: ({ pageParam }: { pageParam?: any }) => Promise<TData>,
  options: UseInfiniteQueryOptions<TData, TError> & OptimizedQueryOptions<TData, TError> = {}
) => {
  const mobileOpts = useMobileOptimizations();
  
  // Adaptive page size based on device capabilities
  const getPageSize = () => {
    if (mobileOpts.isLowEndDevice) return 10;
    if (mobileOpts.isSlowConnection) return 15;
    if (mobileOpts.isMobile) return 20;
    return 25;
  };

  const result = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const startTime = performance.now();
      
      try {
        const data = await queryFn({ pageParam });
        
        // Track performance
        if (options.performanceTracking !== false) {
          const duration = performance.now() - startTime;
          performanceMonitor.trackAPIResponse(
            `${queryKey.join('/')}/page-${pageParam}`,
            duration,
            200,
            'GET'
          );
        }
        
        return data;
      } catch (error) {
        if (options.performanceTracking !== false) {
          const duration = performance.now() - startTime;
          performanceMonitor.trackAPIResponse(
            `${queryKey.join('/')}/page-${pageParam}`,
            duration,
            500,
            'GET'
          );
        }
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, pages) => {
      // Adaptive next page logic
      const pageSize = getPageSize();
      const hasMore = Array.isArray(lastPage) ? 
        lastPage.length === pageSize : 
        lastPage?.hasMore;
      
      return hasMore ? pages.length : undefined;
    },
    staleTime: getAdaptiveStaleTime(mobileOpts.connectionInfo),
    gcTime: mobileOpts.isMobile ? 15 * 60 * 1000 : 10 * 60 * 1000,
    ...options
  });

  return result;
};

// Optimized mutation with retry logic and performance tracking
export const useOptimizedMutation = <TData, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TError, TVariables> & {
    performanceTracking?: boolean;
    invalidateQueries?: string[][];
    optimisticUpdate?: {
      queryKey: string[];
      updater: (variables: TVariables, oldData: any) => any;
    };
  } = {}
) => {
  const queryClient = useQueryClient();
  const mobileOpts = useMobileOptimizations();

  const result = useMutation({
    mutationFn: async (variables: TVariables) => {
      const startTime = performance.now();
      
      try {
        const data = await mutationFn(variables);
        
        // Track successful mutation
        if (options.performanceTracking !== false) {
          const duration = performance.now() - startTime;
          performanceMonitor.trackAPIResponse(
            'mutation',
            duration,
            200,
            'POST'
          );
        }
        
        return data;
      } catch (error) {
        // Track failed mutation  
        if (options.performanceTracking !== false) {
          const duration = performance.now() - startTime;
          performanceMonitor.trackAPIResponse(
            'mutation',
            duration,
            500,
            'POST'
          );
        }
        throw error;
      }
    },
    onMutate: async (variables) => {
      // Optimistic updates
      if (options.optimisticUpdate) {
        await queryClient.cancelQueries({ queryKey: options.optimisticUpdate.queryKey });
        
        const previousData = queryClient.getQueryData(options.optimisticUpdate.queryKey);
        
        queryClient.setQueryData(
          options.optimisticUpdate.queryKey,
          (old: any) => options.optimisticUpdate!.updater(variables, old)
        );
        
        return { previousData };
      }
      
      return options.onMutate?.(variables);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (options.optimisticUpdate && context?.previousData) {
        queryClient.setQueryData(
          options.optimisticUpdate.queryKey,
          context.previousData
        );
      }
      
      options.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options.onSuccess?.(data, variables, context);
    },
    // Reduce retries on slow connections
    retry: mobileOpts.isSlowConnection ? 0 : 1,
    ...options
  });

  return result;
};

// Prefetch utilities
export const usePrefetch = () => {
  const queryClient = useQueryClient();
  const mobileOpts = useMobileOptimizations();

  const prefetchQuery = async <TData>(
    queryKey: string[],
    queryFn: () => Promise<TData>,
    options: { priority?: 'high' | 'normal' | 'low' } = {}
  ) => {
    // Skip prefetching on slow connections unless high priority
    if (mobileOpts.isSlowConnection && options.priority !== 'high') {
      return;
    }

    // Skip prefetching on low-end devices unless high priority
    if (mobileOpts.isLowEndDevice && options.priority !== 'high') {
      return;
    }

    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: getAdaptiveStaleTime(mobileOpts.connectionInfo)
      });
    } catch (error) {
      console.warn('Prefetch failed for:', queryKey, error);
    }
  };

  const prefetchInfiniteQuery = async <TData>(
    queryKey: string[],
    queryFn: ({ pageParam }: { pageParam?: any }) => Promise<TData>,
    options: { priority?: 'high' | 'normal' | 'low'; pages?: number } = {}
  ) => {
    if (mobileOpts.isSlowConnection && options.priority !== 'high') {
      return;
    }

    try {
      await queryClient.prefetchInfiniteQuery({
        queryKey,
        queryFn,
        initialPageParam: 0,
        pages: options.pages || 1,
        staleTime: getAdaptiveStaleTime(mobileOpts.connectionInfo)
      });
    } catch (error) {
      console.warn('Infinite prefetch failed for:', queryKey, error);
    }
  };

  return {
    prefetchQuery,
    prefetchInfiniteQuery
  };
};

// Utility functions
const getAdaptiveStaleTime = (connectionInfo: any): number => {
  if (!connectionInfo) return 5 * 60 * 1000; // 5 minutes default
  
  switch (connectionInfo.effectiveType) {
    case '2g':
    case 'slow-2g':
      return 15 * 60 * 1000; // 15 minutes for slow connections
    case '3g':
      return 10 * 60 * 1000; // 10 minutes
    case '4g':
    default:
      return 5 * 60 * 1000; // 5 minutes
  }
};

const preloadRelatedQueries = async (
  queryClient: QueryClient,
  relatedQueries: string[],
  data: any
) => {
  // Simple implementation - in real app, this would be more sophisticated
  relatedQueries.forEach(async (queryKey) => {
    try {
      // Extract IDs or other identifiers from data to preload related queries
      if (data && typeof data === 'object') {
        // Example: if data has an id, preload detail query
        if (data.id) {
          await queryClient.prefetchQuery({
            queryKey: [queryKey, data.id],
            queryFn: () => {
              // This would be replaced with actual API call
              return Promise.resolve({});
            },
            staleTime: 2 * 60 * 1000 // 2 minutes for preloaded data
          });
        }
      }
    } catch (error) {
      console.warn('Related query preload failed:', queryKey, error);
    }
  });
};

// Query key factories for consistency
export const queryKeys = {
  // Dashboard queries
  dashboard: ['dashboard'] as const,
  dashboardVariant: (variant: string) => [...queryKeys.dashboard, variant] as const,
  
  // Portfolio queries  
  portfolio: ['portfolio'] as const,
  portfolioAssets: () => [...queryKeys.portfolio, 'assets'] as const,
  portfolioTransactions: () => [...queryKeys.portfolio, 'transactions'] as const,
  portfolioPerformance: () => [...queryKeys.portfolio, 'performance'] as const,
  
  // Discovery queries
  discovery: ['discovery'] as const,
  discoveryVideos: () => [...queryKeys.discovery, 'videos'] as const,
  discoveryInsights: () => [...queryKeys.discovery, 'insights'] as const,
  discoveryDocs: () => [...queryKeys.discovery, 'docs'] as const,
  
  // Admin queries
  admin: ['admin'] as const,
  adminUsers: () => [...queryKeys.admin, 'users'] as const,
  adminAssets: () => [...queryKeys.admin, 'assets'] as const,
  adminTransactions: () => [...queryKeys.admin, 'transactions'] as const,
  
  // Market data queries
  market: ['market'] as const,
  marketData: (asset: string) => [...queryKeys.market, asset] as const,
  marketHistory: (asset: string, timeframe: string) => 
    [...queryKeys.market, asset, 'history', timeframe] as const
};

export default {
  useOptimizedQuery,
  useOptimizedInfiniteQuery,
  useOptimizedMutation,
  usePrefetch,
  queryKeys
};