// We'll use the notification system when available
let notificationSystem: any = null;

export function setNotificationSystem(notifications: any) {
  notificationSystem = notifications;
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export class ErrorHandler {
  private static errorQueue: AppError[] = [];
  private static isProcessing = false;

  // Common error codes
  static readonly ErrorCodes = {
    // Network errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    
    // Blockchain errors
    WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
    INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
    TRANSACTION_FAILED: 'TRANSACTION_FAILED',
    CONTRACT_ERROR: 'CONTRACT_ERROR',
    
    // Business logic errors
    INVALID_INPUT: 'INVALID_INPUT',
    UNAUTHORIZED: 'UNAUTHORIZED',
    NOT_FOUND: 'NOT_FOUND',
    RATE_LIMITED: 'RATE_LIMITED',
    
    // System errors
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  };

  // User-friendly error messages
  private static errorMessages: Record<string, string> = {
    [ErrorHandler.ErrorCodes.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection.',
    [ErrorHandler.ErrorCodes.TIMEOUT]: 'Request timed out. Please try again.',
    [ErrorHandler.ErrorCodes.WALLET_NOT_CONNECTED]: 'Please connect your wallet to continue.',
    [ErrorHandler.ErrorCodes.INSUFFICIENT_FUNDS]: 'Insufficient funds in your wallet.',
    [ErrorHandler.ErrorCodes.TRANSACTION_FAILED]: 'Transaction failed. Please try again.',
    [ErrorHandler.ErrorCodes.CONTRACT_ERROR]: 'Smart contract error. Please contact support.',
    [ErrorHandler.ErrorCodes.INVALID_INPUT]: 'Invalid input. Please check your data.',
    [ErrorHandler.ErrorCodes.UNAUTHORIZED]: 'You are not authorized to perform this action.',
    [ErrorHandler.ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorHandler.ErrorCodes.RATE_LIMITED]: 'Too many requests. Please slow down.',
    [ErrorHandler.ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  };

  static handle(error: unknown, context?: string): void {
    const appError = this.parseError(error, context);
    this.logError(appError);
    this.queueError(appError);
    this.processErrorQueue();
  }

  private static parseError(error: unknown, context?: string): AppError {
    // Handle different error types
    if (error instanceof Error) {
      // Check for specific error patterns
      if (error.message.includes('Network')) {
        return {
          code: this.ErrorCodes.NETWORK_ERROR,
          message: this.errorMessages[this.ErrorCodes.NETWORK_ERROR],
          details: { originalError: error.message, context },
          severity: 'error'
        };
      }
      
      if (error.message.includes('timeout')) {
        return {
          code: this.ErrorCodes.TIMEOUT,
          message: this.errorMessages[this.ErrorCodes.TIMEOUT],
          details: { originalError: error.message, context },
          severity: 'warning'
        };
      }

      if (error.message.includes('wallet') || error.message.includes('Wallet')) {
        return {
          code: this.ErrorCodes.WALLET_NOT_CONNECTED,
          message: this.errorMessages[this.ErrorCodes.WALLET_NOT_CONNECTED],
          details: { originalError: error.message, context },
          severity: 'warning'
        };
      }

      if (error.message.includes('insufficient') || error.message.includes('Insufficient')) {
        return {
          code: this.ErrorCodes.INSUFFICIENT_FUNDS,
          message: this.errorMessages[this.ErrorCodes.INSUFFICIENT_FUNDS],
          details: { originalError: error.message, context },
          severity: 'error'
        };
      }

      if (error.message.includes('Rate limit')) {
        return {
          code: this.ErrorCodes.RATE_LIMITED,
          message: this.errorMessages[this.ErrorCodes.RATE_LIMITED],
          details: { originalError: error.message, context },
          severity: 'warning'
        };
      }
    }

    // Handle response errors
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as any).response;
      if (response?.status === 401) {
        return {
          code: this.ErrorCodes.UNAUTHORIZED,
          message: this.errorMessages[this.ErrorCodes.UNAUTHORIZED],
          details: { response, context },
          severity: 'error'
        };
      }
      if (response?.status === 404) {
        return {
          code: this.ErrorCodes.NOT_FOUND,
          message: this.errorMessages[this.ErrorCodes.NOT_FOUND],
          details: { response, context },
          severity: 'warning'
        };
      }
      if (response?.status === 429) {
        return {
          code: this.ErrorCodes.RATE_LIMITED,
          message: this.errorMessages[this.ErrorCodes.RATE_LIMITED],
          details: { response, context },
          severity: 'warning'
        };
      }
    }

    // Default error
    return {
      code: this.ErrorCodes.UNKNOWN_ERROR,
      message: this.errorMessages[this.ErrorCodes.UNKNOWN_ERROR],
      details: { error, context },
      severity: 'error'
    };
  }

  private static logError(error: AppError): void {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorHandler]', error);
    }

    // In production, send to monitoring service
    if (import.meta.env.PROD && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(error.message), {
        tags: {
          errorCode: error.code,
          severity: error.severity,
        },
        extra: error.details,
      });
    }
  }

  private static queueError(error: AppError): void {
    // Prevent duplicate errors
    const isDuplicate = this.errorQueue.some(
      e => e.code === error.code && Date.now() - (e.details?.timestamp || 0) < 5000
    );

    if (!isDuplicate) {
      this.errorQueue.push({
        ...error,
        details: {
          ...error.details,
          timestamp: Date.now(),
        },
      });
    }
  }

  private static async processErrorQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.errorQueue.length > 0) {
      const error = this.errorQueue.shift();
      if (error) {
        this.displayError(error);
        // Add delay between error displays
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    this.isProcessing = false;
  }

  private static displayError(error: AppError): void {
    // Use notification system if available
    if (notificationSystem) {
      const type = error.severity === 'critical' ? 'error' : error.severity;
      if (type === 'error') {
        notificationSystem.error('Error', error.message);
      } else if (type === 'warning') {
        notificationSystem.warning('Warning', error.message);
      } else {
        notificationSystem.info('Info', error.message);
      }
    } else {
      // Fallback to console if notification system not available
      console.error('[ErrorHandler]', error.message, error.details);
    }
  }

  // Utility method for React components
  static async asyncHandler<T>(
    promise: Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await promise;
    } catch (error) {
      this.handle(error, context);
      return null;
    }
  }
}

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.handle(event.reason, 'Unhandled Promise Rejection');
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  ErrorHandler.handle(event.error || event.message, 'Global Error');
  event.preventDefault();
});