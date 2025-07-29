// Enhanced error handling and recovery mechanisms
import React, { Component, ReactNode } from 'react';

export interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'ui' | 'logic' | 'permission' | 'timeout' | 'unknown';
  context?: Record<string, any>;
  recovered?: boolean;
  retryCount?: number;
}

export interface ErrorBoundaryFallback {
  error: Error;
  errorInfo: any;
  retry: () => void;
  resetErrorBoundary: () => void;
}

class ErrorHandler {
  private errors: ErrorInfo[] = [];
  private maxErrors = 100;
  private sessionId: string;
  private retryAttempts: Map<string, number> = new Map();
  private circuitBreakers: Map<string, { failures: number; lastFailure: number; state: 'open' | 'closed' | 'half-open' }> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        category: 'logic',
        severity: 'high',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        category: 'logic',
        severity: 'high',
        context: {
          reason: event.reason
        }
      });
    });

    // Catch network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.captureNetworkError(args[0], response.status, response.statusText);
        }
        return response;
      } catch (error) {
        this.captureNetworkError(args[0], 0, (error as Error).message);
        throw error;
      }
    };
  }

  captureError(errorData: Partial<ErrorInfo>): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const error: ErrorInfo = {
      id: errorId,
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity: errorData.severity || 'medium',
      category: errorData.category || 'unknown',
      context: errorData.context || {},
      recovered: false,
      retryCount: 0,
      ...errorData
    };

    this.errors.push(error);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (import.meta.env.MODE === 'development') {
      console.group(`🚨 Error Captured: ${error.id}`);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.log('Context:', error.context);
      console.log('Severity:', error.severity);
      console.groupEnd();
    }

    // Send to monitoring service
    this.sendToMonitoring(error);

    // Auto-recovery attempts
    this.attemptRecovery(error);

    return errorId;
  }

  private captureNetworkError(url: any, status: number, statusText: string): void {
    const urlString = typeof url === 'string' ? url : url.toString();
    
    this.captureError({
      message: `Network error: ${status} ${statusText}`,
      category: 'network',
      severity: status >= 500 ? 'high' : 'medium',
      context: {
        url: urlString,
        status,
        statusText
      }
    });

    // Update circuit breaker
    this.updateCircuitBreaker(urlString, false);
  }

  private async sendToMonitoring(error: ErrorInfo): Promise<void> {
    try {
      // In a real app, this would send to a monitoring service like Sentry
      if (import.meta.env.MODE === 'production') {
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error)
        });
      }
    } catch (e) {
      console.warn('Failed to send error to monitoring service:', e);
    }
  }

  private attemptRecovery(error: ErrorInfo): void {
    switch (error.category) {
      case 'network':
        this.handleNetworkErrorRecovery(error);
        break;
      case 'ui':
        this.handleUIErrorRecovery(error);
        break;
      case 'timeout':
        this.handleTimeoutRecovery(error);
        break;
      default:
        // Generic recovery
        this.scheduleRetry(error.id, () => {
          console.log(`Attempting recovery for error: ${error.id}`);
        }, 5000);
    }
  }

  private handleNetworkErrorRecovery(error: ErrorInfo): void {
    const url = error.context?.url;
    if (!url) return;

    const circuitBreaker = this.getCircuitBreaker(url);
    if (circuitBreaker.state === 'open') {
      console.log(`Circuit breaker open for ${url}, skipping retry`);
      return;
    }

    // Exponential backoff retry
    const retryCount = this.retryAttempts.get(error.id) || 0;
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

    this.scheduleRetry(error.id, async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          this.markErrorRecovered(error.id);
          this.updateCircuitBreaker(url, true);
        }
      } catch (e) {
        this.incrementRetryCount(error.id);
        if (retryCount < 3) {
          this.handleNetworkErrorRecovery(error);
        }
      }
    }, delay);
  }

  private handleUIErrorRecovery(error: ErrorInfo): void {
    // For UI errors, try to refresh the problematic component
    this.scheduleRetry(error.id, () => {
      const event = new CustomEvent('cf1:ui-error-recovery', {
        detail: { errorId: error.id, context: error.context }
      });
      window.dispatchEvent(event);
    }, 1000);
  }

  private handleTimeoutRecovery(error: ErrorInfo): void {
    // For timeout errors, try again with increased timeout
    const retryCount = this.retryAttempts.get(error.id) || 0;
    const increasedTimeout = (error.context?.timeout || 5000) * (retryCount + 1);

    this.scheduleRetry(error.id, () => {
      const event = new CustomEvent('cf1:timeout-retry', {
        detail: { errorId: error.id, timeout: increasedTimeout }
      });
      window.dispatchEvent(event);
    }, 2000);
  }

  private scheduleRetry(errorId: string, retryFn: () => void | Promise<void>, delay: number): void {
    setTimeout(async () => {
      try {
        await retryFn();
      } catch (e) {
        console.warn(`Retry failed for error ${errorId}:`, e);
      }
    }, delay);
  }

  private markErrorRecovered(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.recovered = true;
      console.log(`✅ Error recovered: ${errorId}`);
    }
  }

  private incrementRetryCount(errorId: string): void {
    const currentCount = this.retryAttempts.get(errorId) || 0;
    this.retryAttempts.set(errorId, currentCount + 1);

    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.retryCount = currentCount + 1;
    }
  }

  private getCircuitBreaker(url: string) {
    if (!this.circuitBreakers.has(url)) {
      this.circuitBreakers.set(url, {
        failures: 0,
        lastFailure: 0,
        state: 'closed'
      });
    }
    return this.circuitBreakers.get(url)!;
  }

  private updateCircuitBreaker(url: string, success: boolean): void {
    const breaker = this.getCircuitBreaker(url);
    const now = Date.now();

    if (success) {
      breaker.failures = 0;
      breaker.state = 'closed';
    } else {
      breaker.failures++;
      breaker.lastFailure = now;

      // Open circuit after 5 failures
      if (breaker.failures >= 5) {
        breaker.state = 'open';
        console.warn(`Circuit breaker opened for ${url}`);
        
        // Try to close after 30 seconds
        setTimeout(() => {
          breaker.state = 'half-open';
        }, 30000);
      }
    }
  }

  // Public API
  getErrors(filters?: {
    severity?: ErrorInfo['severity'];
    category?: ErrorInfo['category'];
    recovered?: boolean;
    since?: number;
  }): ErrorInfo[] {
    let filtered = this.errors;

    if (filters) {
      if (filters.severity) {
        filtered = filtered.filter(e => e.severity === filters.severity);
      }
      if (filters.category) {
        filtered = filtered.filter(e => e.category === filters.category);
      }
      if (filters.recovered !== undefined) {
        filtered = filtered.filter(e => e.recovered === filters.recovered);
      }
      if (filters.since) {
        filtered = filtered.filter(e => e.timestamp >= filters.since);
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  getErrorStats(): {
    total: number;
    recovered: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const total = this.errors.length;
    const recovered = this.errors.filter(e => e.recovered).length;
    
    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    this.errors.forEach(error => {
      byCategory[error.category] = (byCategory[error.category] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return { total, recovered, byCategory, bySeverity };
  }

  clearErrors(): void {
    this.errors = [];
    this.retryAttempts.clear();
  }

  exportErrors(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      timestamp: Date.now(),
      errors: this.errors,
      stats: this.getErrorStats()
    }, null, 2);
  }
}

// React Error Boundary

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallback>;
  onError?: (error: Error, errorInfo: any) => void;
  isolate?: boolean; // Prevent error from bubbling up
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any): void {
    const errorId = errorHandler.captureError({
      message: error.message,
      stack: error.stack,
      category: 'ui',
      severity: 'high',
      context: {
        componentStack: errorInfo.componentStack,
        retryCount: this.retryCount
      }
    });

    this.setState({ error, errorInfo, errorId });
    this.props.onError?.(error, errorInfo);

    // Auto-retry for certain types of errors
    if (this.retryCount < this.maxRetries && this.shouldAutoRetry(error)) {
      setTimeout(() => {
        this.handleRetry();
      }, 1000 * (this.retryCount + 1));
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    // Retry for network-related UI errors
    return error.message.includes('ChunkLoadError') || 
           error.message.includes('Loading chunk') ||
           error.message.includes('Network Error');
  }

  private handleRetry = (): void => {
    this.retryCount++;
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    
    if (this.state.errorId) {
      errorHandler.incrementRetryCount(this.state.errorId);
    }
  };

  private resetErrorBoundary = (): void => {
    this.retryCount = 0;
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retry={this.handleRetry}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorBoundaryFallback> = ({
  error,
  retry,
  resetErrorBoundary
}) => (
  <div className="min-h-64 flex items-center justify-center p-6">
    <div className="text-center space-y-4 max-w-md">
      <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Something went wrong
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400">
        {error.message || 'An unexpected error occurred'}
      </p>
      
      <div className="flex justify-center space-x-3">
        <button
          onClick={retry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>
      
      {import.meta.env.MODE === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// React hooks for error handling
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error | string, context?: Record<string, any>) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;
    
    return errorHandler.captureError({
      message: errorMessage,
      stack,
      category: 'logic',
      severity: 'medium',
      context
    });
  }, []);

  return { handleError };
};

export const useAsyncError = () => {
  const [, setState] = React.useState();
  
  const throwError = React.useCallback((error: Error) => {
    setState(() => {
      throw error;
    });
  }, []);

  return throwError;
};

// Error boundary wrapper HOC
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorBoundaryFallback>
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));
};

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Export types
export type { ErrorInfo, ErrorBoundaryFallback };

// Utility functions
export const captureException = (error: Error, context?: Record<string, any>): string => {
  return errorHandler.captureError({
    message: error.message,
    stack: error.stack,
    category: 'logic',
    severity: 'high',
    context
  });
};

export const captureMessage = (message: string, severity: ErrorInfo['severity'] = 'medium', context?: Record<string, any>): string => {
  return errorHandler.captureError({
    message,
    category: 'logic',
    severity,
    context
  });
};

export const withRetry = async <T extends unknown>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        captureException(lastError, { retryAttempt: i });
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
};