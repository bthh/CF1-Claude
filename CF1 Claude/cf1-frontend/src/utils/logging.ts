// Comprehensive logging and monitoring system

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  category: string;
  userId?: string;
  sessionId: string;
  context?: Record<string, any>;
  stackTrace?: string;
  source: {
    file?: string;
    function?: string;
    line?: number;
    component?: string;
  };
  metadata: {
    userAgent: string;
    url: string;
    referrer: string;
    platform: string;
    viewport: {
      width: number;
      height: number;
    };
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxEntries: number;
  batchSize: number;
  flushInterval: number;
  enablePerformanceLogging: boolean;
  enableUserActionLogging: boolean;
  enableNetworkLogging: boolean;
  sensitiveFields: string[];
}

class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private sessionId: string;
  private userId?: string;
  private flushTimer?: NodeJS.Timeout;
  private performanceObserver?: PerformanceObserver;
  private mutationObserver?: MutationObserver;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: import.meta.env.MODE === 'development',
      enableRemote: import.meta.env.MODE === 'production',
      maxEntries: 1000,
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      enablePerformanceLogging: true,
      enableUserActionLogging: true,
      enableNetworkLogging: true,
      sensitiveFields: ['password', 'token', 'apiKey', 'secret', 'privateKey'],
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.setupAutoFlush();
    this.setupPerformanceMonitoring();
    this.setupUserActionLogging();
    this.setupNetworkLogging();
    this.setupUnloadHandler();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.config.sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    category: string,
    context?: Record<string, any>,
    source?: Partial<LogEntry['source']>
  ): LogEntry {
    const sanitizedContext = context ? this.sanitizeData(context) : undefined;
    
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      category,
      userId: this.userId,
      sessionId: this.sessionId,
      context: sanitizedContext,
      source: {
        component: this.getCurrentComponent(),
        ...source
      },
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        platform: navigator.platform,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };
  }

  private getCurrentComponent(): string {
    // Try to extract component name from React stack
    const error = new Error();
    const stack = error.stack;
    
    if (stack) {
      const lines = stack.split('\n');
      for (const line of lines) {
        const match = line.match(/at (\w+)/);
        if (match && match[1] && !['Logger', 'Object', 'eval'].includes(match[1])) {
          return match[1];
        }
      }
    }
    
    return 'Unknown';
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private addEntry(entry: LogEntry): void {
    this.entries.push(entry);

    // Maintain max entries limit
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }

    // Console logging
    if (this.config.enableConsole && this.shouldLog(entry.level)) {
      this.logToConsole(entry);
    }

    // Trigger flush if batch size reached
    if (this.entries.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${LogLevel[entry.level]}] [${entry.category}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.context);
        break;
      case LogLevel.INFO:
        console.info(message, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.context);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.context);
        if (entry.stackTrace) {
          console.error('Stack trace:', entry.stackTrace);
        }
        break;
    }
  }

  private setupAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceLogging || typeof window === 'undefined') {
      return;
    }

    // Navigation timing
    if (window.performance && window.performance.navigation) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = window.performance.timing;
          this.info('page-performance', 'Page load completed', {
            loadTime: timing.loadEventEnd - timing.navigationStart,
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint()
          });
        }, 0);
      });
    }

    // Performance observer for long tasks
    if (window.PerformanceObserver) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask' && entry.duration > 50) {
              this.warn('performance', 'Long task detected', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          }
        });

        this.performanceObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        this.debug('logger', 'Performance observer not supported');
      }
    }
  }

  private getFirstPaint(): number {
    const entries = window.performance.getEntriesByName('first-paint');
    return entries.length > 0 ? entries[0].startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const entries = window.performance.getEntriesByName('first-contentful-paint');
    return entries.length > 0 ? entries[0].startTime : 0;
  }

  private setupUserActionLogging(): void {
    if (!this.config.enableUserActionLogging || typeof window === 'undefined') {
      return;
    }

    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target) {
        const actionData = {
          tag: target.tagName.toLowerCase(),
          id: target.id,
          className: target.className,
          text: target.textContent?.substring(0, 100),
          coordinates: { x: event.clientX, y: event.clientY }
        };

        this.debug('user-action', 'Element clicked', actionData);
      }
    }, { passive: true });

    // Form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      if (form) {
        this.info('user-action', 'Form submitted', {
          formId: form.id,
          formAction: form.action,
          formMethod: form.method
        });
      }
    });

    // Input focus tracking for UX analysis
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        this.debug('user-action', 'Input focused', {
          inputType: (target as HTMLInputElement).type,
          inputId: target.id,
          inputName: (target as HTMLInputElement).name
        });
      }
    }, { passive: true });
  }

  private setupNetworkLogging(): void {
    if (!this.config.enableNetworkLogging || typeof window === 'undefined') {
      return;
    }

    // Fetch interception
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.info('network', 'HTTP request completed', {
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          statusText: response.statusText,
          duration: endTime - startTime,
          headers: Object.fromEntries(response.headers.entries())
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.error('network', 'HTTP request failed', {
          url,
          method: args[1]?.method || 'GET',
          duration: endTime - startTime,
          error: (error as Error).message
        });

        throw error;
      }
    };

    // XMLHttpRequest interception
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      (this as any)._startTime = performance.now();
      (this as any)._method = method;
      (this as any)._url = url;
      return originalXHROpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      this.addEventListener('loadend', () => {
        const endTime = performance.now();
        const duration = endTime - (this as any)._startTime;
        
        logger.info('network', 'XHR request completed', {
          url: (this as any)._url,
          method: (this as any)._method,
          status: this.status,
          statusText: this.statusText,
          duration
        });
      });

      return originalXHRSend.call(this, ...args);
    };
  }

  private setupUnloadHandler(): void {
    if (typeof window === 'undefined') return;

    // Flush logs before page unload
    window.addEventListener('beforeunload', () => {
      this.flush(true); // Force synchronous flush
    });

    // Flush logs when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }

  // Public API
  debug(category: string, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, category, context);
    this.addEntry(entry);
  }

  info(category: string, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, category, context);
    this.addEntry(entry);
  }

  warn(category: string, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, category, context);
    this.addEntry(entry);
  }

  error(category: string, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, category, {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message
    });
    
    if (error?.stack) {
      entry.stackTrace = error.stack;
    }
    
    this.addEntry(entry);
  }

  critical(category: string, message: string, context?: Record<string, any>, error?: Error): void {
    const entry = this.createLogEntry(LogLevel.CRITICAL, message, category, {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message
    });
    
    if (error?.stack) {
      entry.stackTrace = error.stack;
    }
    
    this.addEntry(entry);
    this.flush(true); // Immediately flush critical logs
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.info('auth', 'User ID set', { userId });
  }

  setLogLevel(level: LogLevel): void {
    this.config.level = level;
    this.info('logger', 'Log level changed', { level: LogLevel[level] });
  }

  async flush(synchronous = false): Promise<void> {
    if (!this.config.enableRemote || this.entries.length === 0) {
      return;
    }

    const entriesToFlush = [...this.entries];
    this.entries = [];

    const payload = {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      entries: entriesToFlush
    };

    try {
      if (synchronous && navigator.sendBeacon) {
        // Use sendBeacon for synchronous sending during page unload
        navigator.sendBeacon(
          this.config.remoteEndpoint || '/api/logs',
          JSON.stringify(payload)
        );
      } else {
        // Use fetch for normal async sending
        await fetch(this.config.remoteEndpoint || '/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }
    } catch (error) {
      // Re-add entries back to queue if sending failed
      this.entries = [...entriesToFlush, ...this.entries];
      
      if (this.config.enableConsole) {
        console.error('Failed to send logs to remote endpoint:', error);
      }
    }
  }

  getLogs(filters?: {
    level?: LogLevel;
    category?: string;
    since?: number;
    limit?: number;
  }): LogEntry[] {
    let filtered = [...this.entries];

    if (filters) {
      if (filters.level !== undefined) {
        filtered = filtered.filter(entry => entry.level >= filters.level!);
      }
      
      if (filters.category) {
        filtered = filtered.filter(entry => entry.category === filters.category);
      }
      
      if (filters.since) {
        filtered = filtered.filter(entry => entry.timestamp >= filters.since!);
      }
      
      if (filters.limit) {
        filtered = filtered.slice(-filters.limit);
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  getStats(): {
    totalEntries: number;
    entriesByLevel: Record<string, number>;
    entriesByCategory: Record<string, number>;
    sessionDuration: number;
  } {
    const entriesByLevel: Record<string, number> = {};
    const entriesByCategory: Record<string, number> = {};

    this.entries.forEach(entry => {
      const levelName = LogLevel[entry.level];
      entriesByLevel[levelName] = (entriesByLevel[levelName] || 0) + 1;
      entriesByCategory[entry.category] = (entriesByCategory[entry.category] || 0) + 1;
    });

    const sessionStart = this.entries.length > 0 ? this.entries[0].timestamp : Date.now();
    const sessionDuration = Date.now() - sessionStart;

    return {
      totalEntries: this.entries.length,
      entriesByLevel,
      entriesByCategory,
      sessionDuration
    };
  }

  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      userId: this.userId,
      config: this.config,
      stats: this.getStats(),
      entries: this.entries
    }, null, 2);
  }

  clearLogs(): void {
    this.entries = [];
    this.info('logger', 'Log entries cleared');
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    this.flush(true);
  }
}

// Create singleton instance
export const logger = new Logger();

// React hook for logging
import { useEffect, useRef } from 'react';

export const useLogger = (category: string) => {
  const componentName = useRef<string>();

  useEffect(() => {
    // Get component name from React DevTools or stack trace
    const error = new Error();
    const stack = error.stack;
    if (stack) {
      const match = stack.match(/at (\w+)/);
      componentName.current = match?.[1] || 'UnknownComponent';
    }
  }, []);

  return {
    debug: (message: string, context?: Record<string, any>) => 
      logger.debug(category, message, { ...context, component: componentName.current }),
    
    info: (message: string, context?: Record<string, any>) => 
      logger.info(category, message, { ...context, component: componentName.current }),
    
    warn: (message: string, context?: Record<string, any>) => 
      logger.warn(category, message, { ...context, component: componentName.current }),
    
    error: (message: string, context?: Record<string, any>, error?: Error) => 
      logger.error(category, message, { ...context, component: componentName.current }, error),
    
    critical: (message: string, context?: Record<string, any>, error?: Error) => 
      logger.critical(category, message, { ...context, component: componentName.current }, error)
  };
};

// Performance measurement utilities
export const measurePerformance = <T>(
  name: string,
  fn: () => T,
  category = 'performance'
): T => {
  const startTime = performance.now();
  
  try {
    const result = fn();
    
    // Handle async functions
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime;
        logger.info(category, `Async operation "${name}" completed`, { duration });
      }) as T;
    }
    
    const duration = performance.now() - startTime;
    logger.info(category, `Operation "${name}" completed`, { duration });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(category, `Operation "${name}" failed`, { duration }, error as Error);
    throw error;
  }
};

// User action tracking
export const trackUserAction = (
  action: string,
  details?: Record<string, any>
): void => {
  logger.info('user-action', action, details);
};

// Business event tracking
export const trackBusinessEvent = (
  event: string,
  properties?: Record<string, any>
): void => {
  logger.info('business-event', event, properties);
};

// Export types and utilities
export type { LogEntry, LoggerConfig };
export { LogLevel };