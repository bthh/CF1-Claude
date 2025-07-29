/**
 * Global Error Boundary - Enhanced Error Handling
 * Comprehensive error boundaries for bulletproof error handling
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react';
import { performanceMonitor } from '../../utils/performanceMonitoring';
import { SecureErrorHandler } from '../../utils/secureErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'feature';
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  errorBoundaryId: string;
}

/**
 * Enhanced Error Boundary with comprehensive error handling
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorBoundaryId: `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update state with error details
    this.setState({
      errorInfo,
      errorId
    });

    // Track error with performance monitor
    performanceMonitor.trackError(error, this.props.context || 'ErrorBoundary');

    // Process error through secure error handler
    const secureError = SecureErrorHandler.handle(error, `Error Boundary: ${this.props.context || 'Unknown'}`);

    // Log comprehensive error information
    console.group(`🚨 Error Boundary Caught Error [${errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Boundary ID:', this.state.errorBoundaryId);
    console.error('Context:', this.props.context);
    console.error('Level:', this.props.level);
    console.error('Secure Error:', secureError);
    console.groupEnd();

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to external error tracking service in production
    if (import.meta.env.MODE === 'production') {
      this.reportError(error, errorInfo, errorId);
    }
  }

  /**
   * Report error to external service
   */
  private reportError = async (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    try {
      const errorReport = {
        errorId,
        boundaryId: this.state.errorBoundaryId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        context: this.props.context,
        level: this.props.level,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        retryCount: this.retryCount
      };

      // Send to error reporting service
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport)
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  /**
   * Retry rendering - attempt to recover from error
   */
  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      
      console.log(`🔄 Retrying error boundary (attempt ${this.retryCount}/${this.maxRetries})`);
      
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: undefined
      });
    } else {
      console.warn('⚠️ Max retries reached for error boundary');
    }
  };

  /**
   * Reset error boundary state
   */
  private handleReset = () => {
    this.retryCount = 0;
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined
    });
  };

  /**
   * Navigate to safe route
   */
  private handleNavigateHome = () => {
    window.location.href = '/';
  };

  /**
   * Reload the entire page
   */
  private handleReload = () => {
    window.location.reload();
  };

  /**
   * Render fallback UI based on error level
   */
  private renderFallbackUI = () => {
    const { level = 'component', context } = this.props;
    const { error, errorInfo, errorId } = this.state;

    if (this.props.fallback && error && errorInfo) {
      return this.props.fallback(error, errorInfo);
    }

    // Different UI based on error boundary level
    switch (level) {
      case 'page':
        return this.renderPageLevelError();
      case 'feature':
        return this.renderFeatureLevelError();
      case 'component':
      default:
        return this.renderComponentLevelError();
    }
  };

  /**
   * Render page-level error (full page replacement)
   */
  private renderPageLevelError = () => {
    const { error, errorId } = this.state;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Something went wrong
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We encountered an unexpected error. Our team has been notified and is working to fix it.
          </p>

          {import.meta.env.MODE === 'development' && error && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Error Details:</h3>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-32">
                {error.message}
              </pre>
            </div>
          )}

          {errorId && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Error ID: {errorId}
            </p>
          )}

          <div className="space-y-3">
            {this.retryCount < this.maxRetries && (
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            )}
            
            <button
              onClick={this.handleNavigateHome}
              className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </button>

            <button
              onClick={this.handleReload}
              className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render feature-level error (replaces feature section)
   */
  private renderFeatureLevelError = () => {
    const { context, level } = this.props;
    const { error, errorId } = this.state;

    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6 m-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
              {context} Error
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              This feature is temporarily unavailable due to an unexpected error.
            </p>

            {import.meta.env.MODE === 'development' && error && (
              <details className="mt-3">
                <summary className="text-xs text-red-500 cursor-pointer">Show Error Details</summary>
                <pre className="text-xs text-red-600 dark:text-red-400 mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded overflow-auto max-h-32">
                  {error.message}
                </pre>
              </details>
            )}

            <div className="flex items-center space-x-3 mt-4">
              {this.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="flex items-center space-x-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-medium transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
              
              <button
                onClick={this.handleReset}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
              >
                Reset
              </button>
            </div>

            {errorId && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                Error ID: {errorId}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render component-level error (inline error display)
   */
  private renderComponentLevelError = () => {
    const { context } = this.props;
    const { error, errorId } = this.state;

    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded p-4 m-2">
        <div className="flex items-start space-x-2">
          <Bug className="w-4 h-4 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-red-800 dark:text-red-200">
              Component Error
            </p>
            {context && (
              <p className="text-xs text-red-600 dark:text-red-400">
                in {context}
              </p>
            )}

            {import.meta.env.MODE === 'development' && error && (
              <pre className="text-xs text-red-600 dark:text-red-400 mt-1 p-1 bg-red-100 dark:bg-red-900/20 rounded overflow-auto max-h-20">
                {error.message}
              </pre>
            )}

            <div className="flex items-center space-x-2 mt-2">
              {this.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-medium transition-colors"
                >
                  Retry
                </button>
              )}
            </div>

            {errorId && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                ID: {errorId}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.renderFallbackUI();
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with error boundaries
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <GlobalErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Hook for programmatic error reporting
 */
export const useErrorBoundary = () => {
  const reportError = (error: Error, context?: string) => {
    // Trigger error boundary by throwing
    throw error;
  };

  return { reportError };
};

export default GlobalErrorBoundary;