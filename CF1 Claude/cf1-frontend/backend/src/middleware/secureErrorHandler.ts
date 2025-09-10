/**
 * CF1 Backend - Secure Error Handler Middleware
 * Prevents information disclosure in error responses
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Production security configuration
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ERROR_REPORTING_ENABLED = process.env.ERROR_REPORTING === 'true';

/**
 * Error severity levels for backend classification
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Secure error structure for backend responses
 */
export interface SecureErrorResponse {
  success: false;
  error: string;
  code: string;
  severity: ErrorSeverity;
  timestamp: number;
  requestId: string;
  userMessage: string;
}

/**
 * Backend Secure Error Handler
 */
export class BackendSecureErrorHandler {
  private static errorLog: Array<{
    id: string;
    message: string;
    stack?: string;
    severity: ErrorSeverity;
    timestamp: number;
    requestId: string;
    path: string;
    method: string;
    userAgent?: string;
  }> = [];

  private static readonly MAX_ERROR_LOG_SIZE = 500;
  private static readonly SENSITIVE_PATTERNS = [
    // Only apply to error messages, not request bodies
    /file:\//i,
    /http:\/\/localhost/i,
    /127\.0\.0\.1/i,
    /\.env/i,
    /config/i,
    /database/i,
    /connection/i,
    /stack/i,
    /trace/i
  ];

  /**
   * Generate secure error ID for tracking
   */
  static generateErrorId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Generate request ID for error correlation
   */
  static generateRequestId(): string {
    return crypto.randomBytes(12).toString('hex');
  }

  /**
   * Classify error severity based on error content
   */
  static classifyErrorSeverity(error: Error, statusCode?: number): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    // Critical errors - security related
    if (message.includes('security') || 
        message.includes('unauthorized') ||
        message.includes('forbidden') ||
        message.includes('csrf') ||
        message.includes('authentication') ||
        message.includes('permission') ||
        statusCode === 401 ||
        statusCode === 403) {
      return ErrorSeverity.CRITICAL;
    }
    
    // High severity errors - system failures
    if (message.includes('database') ||
        message.includes('connection') ||
        message.includes('server') ||
        message.includes('internal') ||
        message.includes('timeout') ||
        statusCode === 500 ||
        statusCode === 503) {
      return ErrorSeverity.HIGH;
    }
    
    // Medium severity errors - business logic failures
    if (message.includes('validation') ||
        message.includes('invalid') ||
        message.includes('missing') ||
        message.includes('required') ||
        statusCode === 400 ||
        statusCode === 422) {
      return ErrorSeverity.MEDIUM;
    }
    
    // Low severity errors - client errors
    if (statusCode === 404 || statusCode === 409) {
      return ErrorSeverity.LOW;
    }
    
    // Default to medium
    return ErrorSeverity.MEDIUM;
  }

  /**
   * Generate secure error code for client reference
   */
  static generateErrorCode(error: Error, context?: string): string {
    const input = `${error.message}${context || ''}${Date.now()}`;
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return `CF1_${hash.substring(0, 8).toUpperCase()}`;
  }

  /**
   * Sanitize error message to prevent information disclosure
   */
  static sanitizeErrorMessage(message: string, req?: Request): string {
    if (!IS_PRODUCTION) {
      // In development, show full error for debugging
      return message;
    }
    
    // Don't sanitize authentication errors - they need clear error messages
    if (req && (req.path.includes('/auth/') || req.path.includes('/admin/auth/'))) {
      // Only remove paths and URLs for auth endpoints, keep error details
      let sanitized = message;
      sanitized = sanitized.replace(/\/[^\s]+/g, '[PATH_REMOVED]');
      sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL_REMOVED]');
      sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REMOVED]');
      return sanitized.trim();
    }
    
    // Remove sensitive information in production for non-auth endpoints
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
    
    return sanitized.trim();
  }

  /**
   * Create user-friendly error message
   */
  static createUserMessage(severity: ErrorSeverity, errorCode: string): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return `A security error occurred. Please contact support with error code: ${errorCode}`;
      
      case ErrorSeverity.HIGH:
        return `A system error occurred. Please try again later or contact support with error code: ${errorCode}`;
      
      case ErrorSeverity.MEDIUM:
        return `There was a problem with your request. Please check your input and try again. Error code: ${errorCode}`;
      
      case ErrorSeverity.LOW:
      default:
        return `The requested resource was not found. Error code: ${errorCode}`;
    }
  }

  /**
   * Log error securely
   */
  static logError(
    error: Error,
    severity: ErrorSeverity,
    requestId: string,
    req: Request,
    sanitizedMessage: string
  ): void {
    const errorId = this.generateErrorId();
    
    // Add to in-memory log
    this.errorLog.push({
      id: errorId,
      message: sanitizedMessage,
      stack: IS_PRODUCTION ? undefined : error.stack,
      severity,
      timestamp: Date.now(),
      requestId,
      path: req.path,
      method: req.method,
      userAgent: req.get('user-agent')
    });
    
    // Keep log size manageable
    if (this.errorLog.length > this.MAX_ERROR_LOG_SIZE) {
      this.errorLog.shift();
    }
    
    // Console logging
    if (!IS_PRODUCTION) {
      console.group(`🔒 Backend Error [${requestId}]`);
      console.error('Error ID:', errorId);
      console.error('Original Message:', error.message);
      console.error('Sanitized Message:', sanitizedMessage);
      console.error('Severity:', severity);
      console.error('Path:', `${req.method} ${req.path}`);
      console.error('User Agent:', req.get('user-agent'));
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
      console.groupEnd();
    } else {
      // Production logging (minimal)
      console.error(`Error ${requestId}: ${sanitizedMessage} [${severity}]`);
    }
  }

  /**
   * Report error to external service
   */
  static async reportError(
    error: Error,
    severity: ErrorSeverity,
    requestId: string,
    req: Request
  ): Promise<void> {
    if (!ERROR_REPORTING_ENABLED) {
      return;
    }

    try {
      // In production, send to error reporting service
      if (IS_PRODUCTION) {
        // This would integrate with services like Sentry, LogRocket, etc.
        const errorData = {
          errorId: this.generateErrorId(),
          requestId,
          severity,
          sanitizedMessage: this.sanitizeErrorMessage(error.message),
          timestamp: Date.now(),
          path: req.path,
          method: req.method,
          userAgent: req.get('user-agent'),
          // Don't send original message or stack in production
        };

        // Example: Send to monitoring service
        // await fetch(process.env.ERROR_REPORTING_URL, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorData)
        // });

        console.log('Error reported to external service:', errorData);
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  /**
   * Handle and format error for API response
   */
  static async handleError(
    error: Error,
    req: Request,
    statusCode: number = 500
  ): Promise<SecureErrorResponse> {
    const requestId = req.headers['x-request-id'] as string || this.generateRequestId();
    const severity = this.classifyErrorSeverity(error, statusCode);
    const errorCode = this.generateErrorCode(error, req.path);
    const sanitizedMessage = this.sanitizeErrorMessage(error.message, req);
    const userMessage = this.createUserMessage(severity, errorCode);

    // Log error
    this.logError(error, severity, requestId, req, sanitizedMessage);

    // Report error if needed
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      await this.reportError(error, severity, requestId, req);
    }

    return {
      success: false,
      error: sanitizedMessage,
      code: errorCode,
      severity,
      timestamp: Date.now(),
      requestId,
      userMessage
    };
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byPath: Record<string, number>;
  } {
    const stats = {
      total: this.errorLog.length,
      bySeverity: {
        [ErrorSeverity.LOW]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.CRITICAL]: 0
      },
      byPath: {} as Record<string, number>
    };

    this.errorLog.forEach(error => {
      stats.bySeverity[error.severity]++;
      stats.byPath[error.path] = (stats.byPath[error.path] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error log
   */
  static clearErrorLog(): void {
    this.errorLog = [];
  }
}

/**
 * Express middleware for secure error handling
 */
export const secureErrorHandler = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // If response already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(error);
  }

  // Determine status code
  const statusCode = (error as any).statusCode || (error as any).status || 500;

  // Handle the error securely
  const secureError = await BackendSecureErrorHandler.handleError(error, req, statusCode);

  // Send secure error response
  res.status(statusCode).json(secureError);
};

/**
 * Middleware to add request ID to all requests
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string || BackendSecureErrorHandler.generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Async error wrapper for route handlers
 */
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  secureErrorHandler,
  requestIdMiddleware,
  asyncErrorHandler,
  BackendSecureErrorHandler
};