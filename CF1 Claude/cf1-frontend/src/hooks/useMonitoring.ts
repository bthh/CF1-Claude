// CF1 Platform - Monitoring React Hook
// Easy-to-use monitoring integration for React components

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackBusinessEvent,
  measurePerformance,
  reportError,
  setUserContext,
  type UserContext
} from '../lib/monitoring';

// Hook for page tracking
export const usePageTracking = () => {
  const location = useLocation();
  const previousPath = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Skip tracking the same page
    if (currentPath === previousPath.current) return;
    
    // Determine page name from path
    const pageName = getPageNameFromPath(currentPath);
    
    // Track page view
    trackBusinessEvent.pageViewed(pageName, currentPath);
    
    previousPath.current = currentPath;
  }, [location]);
};

// Helper function to get readable page names
const getPageNameFromPath = (path: string): string => {
  const routes: Record<string, string> = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/dashboard/performance': 'Performance',
    '/dashboard/activity': 'Activity',
    '/marketplace': 'Marketplace',
    '/portfolio': 'Portfolio',
    '/portfolio/performance': 'Portfolio Performance',
    '/portfolio/transactions': 'Portfolio Transactions',
    '/launchpad': 'Launchpad',
    '/launchpad/create': 'Create Proposal',
    '/governance': 'Governance',
    '/profile': 'Profile',
    '/profile/settings': 'Settings',
  };

  // Handle dynamic routes
  if (path.startsWith('/marketplace/asset/')) return 'Asset Detail';
  if (path.startsWith('/launchpad/proposal/')) return 'Proposal Detail';
  
  return routes[path] || 'Unknown Page';
};

// Hook for user context tracking
export const useUserTracking = () => {
  const setUser = useCallback((userContext: UserContext) => {
    setUserContext(userContext);
  }, []);

  const clearUser = useCallback(() => {
    setUserContext({});
  }, []);

  return { setUser, clearUser };
};

// Hook for error boundary integration
export const useErrorTracking = () => {
  const trackError = useCallback((error: Error, errorInfo?: any) => {
    reportError(error, {
      componentStack: errorInfo?.componentStack,
      errorBoundary: true,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return { trackError };
};

// Hook for performance measurement
export const usePerformanceTracking = () => {
  const measureAsync = useCallback(<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    return measurePerformance(operation, fn);
  }, []);

  const measureSync = useCallback(<T>(
    operation: string,
    fn: () => T
  ): T => {
    const startTime = performance.now();
    
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      
      trackBusinessEvent.featureUsed(`${operation}_sync`, {
        duration,
        success: true
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      trackBusinessEvent.featureUsed(`${operation}_sync`, {
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }, []);

  return { measureAsync, measureSync };
};

// Hook for business event tracking
export const useBusinessTracking = () => {
  const trackInvestment = useCallback(() => ({
    started: (proposalId: string, amount: string) => {
      trackBusinessEvent.investmentStarted(proposalId, amount);
    },
    completed: (proposalId: string, amount: string, txHash: string) => {
      trackBusinessEvent.investmentCompleted(proposalId, amount, txHash);
    },
    failed: (proposalId: string, amount: string, error: string) => {
      trackBusinessEvent.investmentFailed(proposalId, amount, error);
    }
  }), []);

  const trackProposal = useCallback(() => ({
    viewed: (proposalId: string) => {
      trackBusinessEvent.proposalViewed(proposalId);
    },
    created: (proposalId: string, creator: string) => {
      trackBusinessEvent.proposalCreated(proposalId, creator);
    }
  }), []);

  const trackWallet = useCallback(() => ({
    connected: (address: string, walletType: string = 'keplr') => {
      trackBusinessEvent.walletConnected(address, walletType);
    },
    disconnected: (address: string) => {
      trackBusinessEvent.walletDisconnected(address);
    }
  }), []);

  const trackFeature = useCallback((featureName: string, context?: any) => {
    trackBusinessEvent.featureUsed(featureName, context);
  }, []);

  return {
    trackInvestment: trackInvestment(),
    trackProposal: trackProposal(),
    trackWallet: trackWallet(),
    trackFeature
  };
};

// Hook for component lifecycle tracking
export const useComponentTracking = (componentName: string) => {
  const mountTime = useRef<number>(Date.now());

  useEffect(() => {
    // Track component mount
    trackBusinessEvent.featureUsed('component_mounted', {
      componentName,
      timestamp: mountTime.current
    });

    return () => {
      // Track component unmount and duration
      const duration = Date.now() - mountTime.current;
      trackBusinessEvent.featureUsed('component_unmounted', {
        componentName,
        duration
      });
    };
  }, [componentName]);

  const trackInteraction = useCallback((interactionType: string, context?: any) => {
    trackBusinessEvent.featureUsed(`${componentName}_${interactionType}`, context);
  }, [componentName]);

  return { trackInteraction };
};

// Hook for form tracking
export const useFormTracking = (formName: string) => {
  const startTime = useRef<number | undefined>(undefined);

  const trackFormStart = useCallback(() => {
    startTime.current = Date.now();
    trackBusinessEvent.featureUsed('form_started', { formName });
  }, [formName]);

  const trackFormSubmit = useCallback((success: boolean, errors?: string[]) => {
    const duration = startTime.current ? Date.now() - startTime.current : 0;
    
    trackBusinessEvent.featureUsed('form_submitted', {
      formName,
      success,
      duration,
      errors
    });
  }, [formName]);

  const trackFieldInteraction = useCallback((fieldName: string, action: string) => {
    trackBusinessEvent.featureUsed('form_field_interaction', {
      formName,
      fieldName,
      action
    });
  }, [formName]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldInteraction
  };
};

// Custom hook for A/B testing support
export const useExperimentTracking = () => {
  const trackExperiment = useCallback((experimentName: string, variant: string, context?: any) => {
    trackBusinessEvent.featureUsed('experiment_viewed', {
      experimentName,
      variant,
      ...context
    });
  }, []);

  const trackConversion = useCallback((experimentName: string, variant: string, conversionType: string, value?: number) => {
    trackBusinessEvent.featureUsed('experiment_conversion', {
      experimentName,
      variant,
      conversionType,
      value
    });
  }, []);

  return { trackExperiment, trackConversion };
};