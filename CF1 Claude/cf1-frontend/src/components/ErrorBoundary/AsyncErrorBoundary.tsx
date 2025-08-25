/**
 * Async Error Boundary
 * Handles errors from async operations and promises
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Wifi } from 'lucide-react';
import { performanceMonitor } from '../../utils/performanceMonitoring';

interface AsyncError {
  id: string;
  error: Error;
  timestamp: number;
  retryCount: number;
  context?: string;
}

interface Props {
  children: ReactNode;
  fallback?: (error: AsyncError, retry: () => void) => ReactNode;
  onError?: (error: AsyncError) => void;
  maxRetries?: number;
  retryDelay?: number;
  context?: string;
}

/**
 * Async Error Boundary for handling promise rejections and async errors
 */
export const AsyncErrorBoundary: React.FC<Props> = ({
  children,
  fallback,
  onError,
  maxRetries = 3,
  retryDelay = 1000,
  context
}) => {
  const [asyncError, setAsyncError] = useState<AsyncError | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      
      // Handle Vite HMR WebSocket errors gracefully (common in development)
      if (error.message.includes('WebSocket closed without opened') || 
          error.message.includes('WebSocket connection') ||
          error.stack?.includes('vite/client')) {
        console.warn('⚠️ Vite HMR WebSocket error (handled by AsyncErrorBoundary):', error.message);
        event.preventDefault();
        return; // Don't create error state for WebSocket issues
      }
      
      handleAsyncError(error, 'unhandled_rejection');
      event.preventDefault(); // Prevent console error
    };

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAsyncError = (error: Error, errorContext?: string) => {
    const asyncErrorObj: AsyncError = {
      id: `async_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      timestamp: Date.now(),
      retryCount: asyncError?.retryCount || 0,
      context: errorContext || context
    };

    setAsyncError(asyncErrorObj);

    // Track error with performance monitor
    performanceMonitor.trackError(error, `Async: ${errorContext || context || 'Unknown'}`);

    // Call custom error handler
    if (onError) {
      onError(asyncErrorObj);
    }

    // Log error
    console.group(`🔥 Async Error [${asyncErrorObj.id}]`);
    console.error('Error:', error);
    console.error('Context:', errorContext || context);
    console.error('Retry Count:', asyncErrorObj.retryCount);
    console.error('Online Status:', isOnline);
    console.groupEnd();
  };

  const handleRetry = () => {
    if (!asyncError) return;

    if (asyncError.retryCount < maxRetries) {
      console.log(`🔄 Retrying async operation (attempt ${asyncError.retryCount + 1}/${maxRetries})`);
      
      // Update retry count
      setAsyncError(prev => prev ? { ...prev, retryCount: prev.retryCount + 1 } : null);
      
      // Wait for retry delay then clear error
      setTimeout(() => {
        setAsyncError(null);
      }, retryDelay);
    } else {
      console.warn('⚠️ Max retries reached for async operation');
    }
  };

  const handleReset = () => {
    setAsyncError(null);
  };

  const getErrorType = (error: Error): string => {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'network';
    }
    if (error.name === 'AbortError') {
      return 'timeout';
    }
    if (error.message.includes('JSON')) {
      return 'parsing';
    }
    return 'unknown';
  };

  const getErrorIcon = (error: Error) => {
    const errorType = getErrorType(error);
    
    switch (errorType) {
      case 'network':
        return <Wifi className="w-5 h-5 text-red-500" />;
      case 'timeout':
        return <RefreshCw className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getErrorMessage = (error: Error): string => {
    const errorType = getErrorType(error);
    
    switch (errorType) {
      case 'network':
        return isOnline 
          ? 'Network request failed. Please check your connection and try again.'
          : 'You are currently offline. Please check your internet connection.';
      case 'timeout':
        return 'The request timed out. Please try again.';
      case 'parsing':
        return 'Failed to process the server response. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const renderFallback = () => {
    if (!asyncError) return null;

    // Use custom fallback if provided
    if (fallback) {
      return fallback(asyncError, handleRetry);
    }

    const canRetry = asyncError.retryCount < maxRetries;
    const errorMessage = getErrorMessage(asyncError.error);
    const errorIcon = getErrorIcon(asyncError.error);

    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 m-4">
        <div className="flex items-start space-x-3">
          {errorIcon}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
              {!isOnline ? 'Connection Lost' : 'Operation Failed'}
            </h3>
            
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errorMessage}
            </p>

            {asyncError.context && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Context: {asyncError.context}
              </p>
            )}

            {import.meta.env.MODE === 'development' && (
              <details className="mt-2">
                <summary className="text-xs text-red-500 cursor-pointer">
                  Show Technical Details
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-400 mt-1 p-2 bg-red-100 dark:bg-red-900/20 rounded overflow-auto max-h-32">
                  {asyncError.error.stack || asyncError.error.message}
                </pre>
              </details>
            )}

            <div className="flex items-center space-x-3 mt-4">
              {canRetry && (
                <button
                  onClick={handleRetry}
                  disabled={!isOnline && getErrorType(asyncError.error) === 'network'}
                  className="flex items-center space-x-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded font-medium transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Try Again ({asyncError.retryCount + 1}/{maxRetries})</span>
                </button>
              )}
              
              <button
                onClick={handleReset}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>

            {!isOnline && (
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  📡 You are currently offline. Some features may be unavailable.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Create error reporting context for child components
  const errorReporter = {
    reportAsyncError: handleAsyncError,
    isOnline,
    hasError: !!asyncError
  };

  return (
    <AsyncErrorContext.Provider value={errorReporter}>
      {asyncError ? renderFallback() : children}
    </AsyncErrorContext.Provider>
  );
};

// Context for accessing async error reporting
const AsyncErrorContext = React.createContext<{
  reportAsyncError: (error: Error, context?: string) => void;
  isOnline: boolean;
  hasError: boolean;
} | null>(null);

/**
 * Hook for reporting async errors
 */
export const useAsyncErrorHandler = () => {
  const context = React.useContext(AsyncErrorContext);
  
  if (!context) {
    throw new Error('useAsyncErrorHandler must be used within AsyncErrorBoundary');
  }
  
  return context;
};

/**
 * HOC for wrapping async operations with error handling
 */
export const withAsyncErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  config?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <AsyncErrorBoundary {...config}>
      <Component {...props} />
    </AsyncErrorBoundary>
  );
  
  WrappedComponent.displayName = `withAsyncErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Utility function to wrap promises with error boundary reporting
 */
export const withAsyncErrorHandling = <T,>(
  promise: Promise<T>,
  context?: string,
  errorHandler?: (error: Error, context?: string) => void
): Promise<T> => {
  return promise.catch((error) => {
    if (errorHandler) {
      errorHandler(error, context);
    }
    throw error; // Re-throw to maintain promise chain
  });
};

export default AsyncErrorBoundary;