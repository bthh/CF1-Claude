import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

interface UseLoadingOptions {
  initialLoading?: boolean;
  minLoadingTime?: number; // Minimum time to show loading state (prevents flashing)
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export const useLoading = (options: UseLoadingOptions = {}) => {
  const {
    initialLoading = false,
    minLoadingTime = 500,
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    data: null
  });

  const loadingStartTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    if (loading) {
      loadingStartTimeRef.current = Date.now();
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    } else {
      const elapsedTime = loadingStartTimeRef.current 
        ? Date.now() - loadingStartTimeRef.current 
        : minLoadingTime;
      
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        timeoutRef.current = setTimeout(() => {
          setState(prev => ({ ...prev, isLoading: false }));
        }, remainingTime);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [minLoadingTime]);

  const setError = useCallback((error: string | Error | null) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    
    if (error && onError) {
      onError(error instanceof Error ? error : new Error(errorMessage || 'Unknown error'));
    }
  }, [onError]);

  const setData = useCallback((data: any) => {
    setState(prev => ({ ...prev, data, error: null }));
    setLoading(false);
    
    if (onSuccess) {
      onSuccess(data);
    }
  }, [setLoading, onSuccess]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState({ isLoading: false, error: null, data: null });
  }, []);

  // Execute an async operation with loading state
  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: { 
      skipMinLoadingTime?: boolean;
      retryOnError?: boolean;
    }
  ): Promise<T | null> => {
    try {
      setLoading(true);
      const result = await operation();
      setData(result);
      return result;
    } catch (error) {
      setError(error as Error);
      
      if (options?.retryOnError) {
        // Could implement retry logic here
        console.log('Retry option enabled, but not implemented yet');
      }
      
      return null;
    }
  }, [setLoading, setData, setError]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    setData,
    reset,
    execute
  };
};

// Specialized hook for paginated data loading
export const usePaginatedLoading = (initialPage = 1, pageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [allData, setAllData] = useState<any[]>([]);
  
  const loadingState = useLoading({
    onSuccess: (newData) => {
      if (page === 1) {
        setAllData(newData.items || []);
      } else {
        setAllData(prev => [...prev, ...(newData.items || [])]);
      }
      setHasMore(newData.hasMore ?? false);
    }
  });

  const loadPage = useCallback(async (
    loadFunction: (page: number, pageSize: number) => Promise<any>,
    pageToLoad = page
  ) => {
    return loadingState.execute(() => loadFunction(pageToLoad, pageSize));
  }, [page, pageSize, loadingState]);

  const loadNextPage = useCallback(async (
    loadFunction: (page: number, pageSize: number) => Promise<any>
  ) => {
    if (!loadingState.isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await loadPage(loadFunction, nextPage);
    }
  }, [page, hasMore, loadingState.isLoading, loadPage]);

  const refresh = useCallback(async (
    loadFunction: (page: number, pageSize: number) => Promise<any>
  ) => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    await loadPage(loadFunction, 1);
  }, [loadPage]);

  return {
    ...loadingState,
    page,
    hasMore,
    allData,
    loadPage,
    loadNextPage,
    refresh,
    setPage
  };
};

// Hook for simulating loading states in development
export const useSimulatedLoading = (data: any, delay = 1000) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedData, setLoadedData] = useState(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => {
        setLoadedData(data);
        setIsLoading(false);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setLoadedData(data);
      setIsLoading(false);
    }
  }, [data, delay]);

  return { isLoading, data: loadedData };
};