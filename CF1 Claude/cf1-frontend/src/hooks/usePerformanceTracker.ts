/**
 * React Hook for Performance Tracking
 * Easy-to-use hook for tracking component performance
 */

import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor, usePerformanceMonitor } from '../utils/performanceMonitoring';

/**
 * Hook for tracking component render performance
 */
export const useComponentPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>();
  const mountTime = useRef<number>();

  useEffect(() => {
    // Track component mount
    mountTime.current = performance.now();
    
    return () => {
      // Track component unmount
      if (mountTime.current) {
        const mountDuration = performance.now() - mountTime.current;
        performanceMonitor.trackComponentRender(`${componentName}_mount`, mountDuration);
      }
    };
  }, [componentName]);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartTime.current) {
      const renderDuration = performance.now() - renderStartTime.current;
      performanceMonitor.trackComponentRender(`${componentName}_render`, renderDuration);
      renderStartTime.current = undefined;
    }
  }, [componentName]);

  return { startRender, endRender };
};

/**
 * Hook for tracking user interactions
 */
export const useInteractionTracker = (componentName: string) => {
  const { trackUserInteraction } = usePerformanceMonitor();

  const trackClick = useCallback((elementName: string) => {
    trackUserInteraction('click', componentName, undefined);
  }, [componentName, trackUserInteraction]);

  const trackFormSubmit = useCallback((formName: string) => {
    trackUserInteraction('form_submit', componentName, undefined);
  }, [componentName, trackUserInteraction]);

  const trackScroll = useCallback(() => {
    trackUserInteraction('scroll', componentName, undefined);
  }, [componentName, trackUserInteraction]);

  const trackCustomInteraction = useCallback((action: string, duration?: number) => {
    trackUserInteraction(action, componentName, duration);
  }, [componentName, trackUserInteraction]);

  return {
    trackClick,
    trackFormSubmit,
    trackScroll,
    trackCustomInteraction
  };
};

/**
 * Hook for tracking API calls
 */
export const useAPIPerformanceTracker = () => {
  const { trackAPIResponse } = usePerformanceMonitor();

  const trackAPI = useCallback(<T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    method: string = 'GET'
  ): Promise<T> => {
    const startTime = performance.now();
    
    return apiCall()
      .then((result) => {
        const duration = performance.now() - startTime;
        trackAPIResponse(endpoint, duration, 200, method);
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        const status = error.response?.status || 500;
        trackAPIResponse(endpoint, duration, status, method);
        throw error;
      });
  }, [trackAPIResponse]);

  return { trackAPI };
};

/**
 * Hook for tracking blockchain operations
 */
export const useBlockchainPerformanceTracker = () => {
  const { trackBlockchainOperation } = usePerformanceMonitor();

  const trackTransaction = useCallback(<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    return operation()
      .then((result) => {
        const duration = performance.now() - startTime;
        trackBlockchainOperation(operationName, duration, true);
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        trackBlockchainOperation(operationName, duration, false);
        throw error;
      });
  }, [trackBlockchainOperation]);

  return { trackTransaction };
};

/**
 * Hook for tracking page load performance
 */
export const usePagePerformance = (pageName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.trackUserInteraction('page_view', pageName, loadTime);
    };

    // Track initial load
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad, { once: true });
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [pageName]);
};

/**
 * Hook for error tracking
 */
export const useErrorTracker = (componentName: string) => {
  const { trackError } = usePerformanceMonitor();

  const reportError = useCallback((error: Error) => {
    trackError(error, componentName);
  }, [componentName, trackError]);

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportError(new Error(event.message));
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      reportError(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [reportError]);

  return { reportError };
};

/**
 * Hook for comprehensive performance monitoring setup
 */
export const usePerformanceMonitoring = (
  componentName: string,
  options: {
    trackRenders?: boolean;
    trackInteractions?: boolean;
    trackErrors?: boolean;
    trackPageLoad?: boolean;
  } = {}
) => {
  const {
    trackRenders = true,
    trackInteractions = true,
    trackErrors = true,
    trackPageLoad = true
  } = options;

  // Component performance tracking
  const componentPerf = useComponentPerformance(componentName);
  
  // Interaction tracking
  const interactionTracker = useInteractionTracker(componentName);
  
  // Error tracking
  const errorTracker = useErrorTracker(componentName);

  // Page load tracking
  usePagePerformance(componentName);

  // API and blockchain tracking
  const apiTracker = useAPIPerformanceTracker();
  const blockchainTracker = useBlockchainPerformanceTracker();

  // Performance summary
  const getSummary = useCallback(() => {
    return performanceMonitor.getPerformanceSummary();
  }, []);

  return {
    // Component performance
    ...(trackRenders && componentPerf),
    
    // User interactions
    ...(trackInteractions && interactionTracker),
    
    // Error tracking
    ...(trackErrors && errorTracker),
    
    // API tracking
    ...apiTracker,
    
    // Blockchain tracking
    ...blockchainTracker,
    
    // Summary
    getSummary
  };
};