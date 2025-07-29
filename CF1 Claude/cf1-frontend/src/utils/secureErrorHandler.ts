/**
 * CF1 Secure Error Handler
 * Prevents information disclosure in error messages
 */

import { SecurityUtils } from './secureStorage';

// Production security configuration
const IS_PRODUCTION = import.meta.env.MODE === 'production';
const ERROR_REPORTING_ENABLED = import.meta.env.VITE_ERROR_REPORTING === 'true';

/**
 * Error types and their security classifications
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SecureError {
  id: string;
  message: string;
  code: string;
  severity: ErrorSeverity;
  timestamp: number;
  context?: string;
  userMessage: string;
  reportable: boolean;
}

/**
 * Secure Error Handler Class
 */
export class SecureErrorHandler {
  private static errorLog: SecureError[] = [];
  private static readonly MAX_ERROR_LOG_SIZE = 100;
  private static readonly SENSITIVE_PATTERNS = [
    /password/i,
    /token/i,
    /secret/i,
    /key/i,
    /credential/i,
    /auth/i,
    /session/i,
    /private/i,
    /internal/i,
    /debug/i,
    /stack/i,
    /trace/i,
    /file:\/\//i,
    /http:\/\/localhost/i,
    /127\.0\.0\.1/i,
    /\.env/i,
    /config/i
  ];

  /**
   * Process and sanitize error for user display
   */
  static handle(error: Error | unknown, context?: string): SecureError {
    const errorId = SecurityUtils.generateSecureId(16);
    const timestamp = Date.now();
    
    // Extract error information safely
    const originalMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Classify error severity
    const severity = this.classifyErrorSeverity(originalMessage, errorStack);
    
    // Generate secure error code
    const errorCode = this.generateErrorCode(originalMessage, context);
    
    // Sanitize error message
    const sanitizedMessage = this.sanitizeErrorMessage(originalMessage);
    
    // Create user-friendly message
    const userMessage = this.createUserMessage(errorCode, severity);
    
    // Determine if error should be reported
    const reportable = this.shouldReportError(severity, originalMessage);
    
    const secureError: SecureError = {
      id: errorId,
      message: sanitizedMessage,
      code: errorCode,
      severity,
      timestamp,
      context,
      userMessage,
      reportable
    };
    
    // Log error securely
    this.logError(secureError, originalMessage, errorStack);
    
    // Report error if needed
    if (reportable && ERROR_REPORTING_ENABLED) {
      this.reportError(secureError, originalMessage, errorStack);
    }
    
    return secureError;
  }

  /**
   * Classify error severity based on content
   */
  private static classifyErrorSeverity(message: string, stack?: string): ErrorSeverity {
    const lowerMessage = message.toLowerCase();
    
    // Critical errors
    if (lowerMessage.includes('security') || 
        lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('forbidden') ||
        lowerMessage.includes('csrf') ||
        lowerMessage.includes('authentication')) {
      return ErrorSeverity.CRITICAL;
    }
    
    // High severity errors
    if (lowerMessage.includes('database') ||
        lowerMessage.includes('connection') ||
        lowerMessage.includes('server') ||
        lowerMessage.includes('internal')) {
      return ErrorSeverity.HIGH;
    }
    
    // Medium severity errors
    if (lowerMessage.includes('validation') ||
        lowerMessage.includes('invalid') ||
        lowerMessage.includes('missing')) {
      return ErrorSeverity.MEDIUM;
    }
    
    // Default to low
    return ErrorSeverity.LOW;
  }

  /**
   * Generate secure error code
   */
  private static generateErrorCode(message: string, context?: string): string {
    // Create a hash of the error message and context
    const input = `${message}${context || ''}`;
    const hash = this.simpleHash(input);
    
    // Return first 8 characters of hash
    return `CF1_${hash.substring(0, 8).toUpperCase()}`;
  }

  /**
   * Simple hash function for error codes
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Sanitize error message to prevent information disclosure
   */
  private static sanitizeErrorMessage(message: string): string {
    if (!IS_PRODUCTION) {
      // In development, show full error for debugging
      return message;
    }
    
    // Remove sensitive information
    let sanitized = message;
    
    // Remove file paths
    sanitized = sanitized.replace(/\/[^\s]+/g, '[PATH_REMOVED]');
    
    // Remove URLs
    sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL_REMOVED]');
    
    // Remove IP addresses
    sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REMOVED]');
    
    // Remove stack trace information
    sanitized = sanitized.replace(/\s+at\s+.*$/gm, '');
    
    // Remove sensitive patterns
    this.SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[SENSITIVE_INFO_REMOVED]');
    });
    
    return sanitized;
  }

  /**
   * Create user-friendly error message
   */
  private static createUserMessage(errorCode: string, severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return `A security error occurred. Please contact support with error code: ${errorCode}`;
      
      case ErrorSeverity.HIGH:
        return `A system error occurred. Please try again later or contact support with error code: ${errorCode}`;
      
      case ErrorSeverity.MEDIUM:
        return `There was a problem with your request. Please check your input and try again. Error code: ${errorCode}`;
      
      case ErrorSeverity.LOW:
      default:
        return `Something went wrong. Please try again. Error code: ${errorCode}`;
    }
  }

  /**
   * Determine if error should be reported
   */
  private static shouldReportError(severity: ErrorSeverity, message: string): boolean {
    // Always report critical and high severity errors
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      return true;
    }
    
    // Don't report common user errors
    const commonErrors = [
      'network error',
      'connection timeout',
      'not found',
      'validation failed'
    ];
    
    const lowerMessage = message.toLowerCase();
    return !commonErrors.some(common => lowerMessage.includes(common));
  }

  /**
   * Log error securely
   */
  private static logError(secureError: SecureError, originalMessage: string, stack?: string): void {
    // Add to in-memory log
    this.errorLog.push(secureError);
    
    // Keep log size manageable
    if (this.errorLog.length > this.MAX_ERROR_LOG_SIZE) {
      this.errorLog.shift();
    }
    
    // Console logging (development only)
    if (!IS_PRODUCTION) {
      console.group(`🔒 Secure Error [${secureError.code}]`);
      console.error('Original Message:', originalMessage);
      console.error('Sanitized Message:', secureError.message);
      console.error('User Message:', secureError.userMessage);
      console.error('Severity:', secureError.severity);
      console.error('Context:', secureError.context);
      if (stack) {
        console.error('Stack:', stack);
      }
      console.groupEnd();
    } else {
      // Production logging (minimal)
      console.error(`Error ${secureError.code}: ${secureError.userMessage}`);
    }
  }

  /**
   * Report error to external service
   */
  private static reportError(secureError: SecureError, originalMessage: string, stack?: string): void {
    // In production, send to error reporting service
    if (IS_PRODUCTION && ERROR_REPORTING_ENABLED) {
      try {
        // Send to external error reporting service
        // This would integrate with services like Sentry, LogRocket, etc.
        fetch('/api/errors/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            errorId: secureError.id,
            code: secureError.code,
            severity: secureError.severity,
            sanitizedMessage: secureError.message,
            context: secureError.context,
            timestamp: secureError.timestamp,
            userAgent: navigator.userAgent,
            url: window.location.href,
            // Don't send original message or stack in production
          })
        }).catch(err => {
          console.error('Failed to report error:', err);
        });
      } catch (err) {
        console.error('Error reporting failed:', err);
      }
    }
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): { total: number; bySeverity: Record<ErrorSeverity, number> } {
    const stats = {
      total: this.errorLog.length,
      bySeverity: {
        [ErrorSeverity.LOW]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.CRITICAL]: 0
      }
    };
    
    this.errorLog.forEach(error => {
      stats.bySeverity[error.severity]++;
    });
    
    return stats;
  }

  /**
   * Get recent errors (sanitized)
   */
  static getRecentErrors(limit: number = 10): SecureError[] {
    return this.errorLog
      .slice(-limit)
      .map(error => ({
        ...error,
        // Remove sensitive information even from logs
        message: IS_PRODUCTION ? error.userMessage : error.message
      }));
  }

  /**
   * Clear error log
   */
  static clearErrorLog(): void {
    this.errorLog = [];
  }
}

/**
 * React Hook for secure error handling
 */
export const useSecureErrorHandler = () => {
  const handleError = (error: Error | unknown, context?: string) => {
    return SecureErrorHandler.handle(error, context);
  };
  
  const getErrorStats = () => {
    return SecureErrorHandler.getErrorStats();
  };
  
  const getRecentErrors = (limit?: number) => {
    return SecureErrorHandler.getRecentErrors(limit);
  };
  
  return {
    handleError,
    getErrorStats,
    getRecentErrors
  };
};

/**
 * Error boundary helper
 */
export const createSecureErrorBoundary = (context: string) => {
  return (error: Error) => {
    return SecureErrorHandler.handle(error, context);
  };
};

export default SecureErrorHandler;