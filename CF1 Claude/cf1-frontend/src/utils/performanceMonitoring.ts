/**
 * CF1 Performance Monitoring System
 * Comprehensive performance tracking with Web Vitals and custom metrics
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

// Configuration
const PERFORMANCE_ENDPOINT = '/api/analytics/performance';
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds
const IS_PRODUCTION = import.meta.env.MODE === 'production';

/**
 * Performance metric types
 */
export enum MetricType {
  // Core Web Vitals
  CLS = 'cls',           // Cumulative Layout Shift
  FCP = 'fcp',           // First Contentful Paint
  LCP = 'lcp',           // Largest Contentful Paint
  TTFB = 'ttfb',         // Time to First Byte
  INP = 'inp',           // Interaction to Next Paint
  
  // Custom Metrics
  PAGE_LOAD = 'page_load',
  API_RESPONSE = 'api_response',
  USER_INTERACTION = 'user_interaction',
  BLOCKCHAIN_OPERATION = 'blockchain_operation',
  COMPONENT_RENDER = 'component_render',
  NAVIGATION = 'navigation',
  ERROR_RATE = 'error_rate',
  BUNDLE_SIZE = 'bundle_size'
}

/**
 * Performance event interface
 */
export interface PerformanceEvent {
  id: string;
  timestamp: number;
  type: MetricType;
  name: string;
  value: number;
  unit: string;
  url: string;
  userAgent: string;
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  context?: {
    userId?: string;
    sessionId?: string;
    feature?: string;
    component?: string;
    action?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Performance thresholds for alerting
 */
export const PERFORMANCE_THRESHOLDS = {
  [MetricType.LCP]: { good: 2500, poor: 4000 },      // ms
  [MetricType.FCP]: { good: 1800, poor: 3000 },      // ms
  [MetricType.CLS]: { good: 0.1, poor: 0.25 },       // score
  [MetricType.TTFB]: { good: 800, poor: 1800 },      // ms
  [MetricType.INP]: { good: 200, poor: 500 },        // ms
  [MetricType.PAGE_LOAD]: { good: 3000, poor: 5000 }, // ms
  [MetricType.API_RESPONSE]: { good: 1000, poor: 3000 }, // ms
  [MetricType.USER_INTERACTION]: { good: 100, poor: 300 } // ms
};

/**
 * Performance Monitoring Class
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private eventBuffer: PerformanceEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private flushTimer?: NodeJS.Timeout;
  private isInitialized = false;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupFlushTimer();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance monitoring
   */
  init(userId?: string): void {
    if (this.isInitialized) return;

    this.userId = userId;
    this.isInitialized = true;

    // Initialize Web Vitals tracking
    this.initWebVitals();

    // Track page load performance
    this.trackPageLoad();

    // Track navigation performance
    this.trackNavigation();

    // Track resource loading
    this.trackResourceLoading();

    console.log('🚀 Performance monitoring initialized');
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initWebVitals(): void {
    onCLS((metric) => this.handleWebVital(metric, MetricType.CLS));
    onFCP((metric) => this.handleWebVital(metric, MetricType.FCP));
    onLCP((metric) => this.handleWebVital(metric, MetricType.LCP));
    onTTFB((metric) => this.handleWebVital(metric, MetricType.TTFB));
    onINP((metric) => this.handleWebVital(metric, MetricType.INP));
  }

  /**
   * Handle Web Vital metric
   */
  private handleWebVital(metric: Metric, type: MetricType): void {
    const event: PerformanceEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      type,
      name: metric.name,
      value: metric.value,
      unit: type === MetricType.CLS ? 'score' : 'ms',
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      context: {
        userId: this.userId,
        sessionId: this.sessionId
      },
      metadata: {
        id: metric.id,
        delta: metric.delta,
        entries: metric.entries?.map(entry => ({
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration
        }))
      }
    };

    this.addEvent(event);
    this.checkThreshold(event);
  }

  /**
   * Track page load performance
   */
  private trackPageLoad(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;
        
        this.addEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: MetricType.PAGE_LOAD,
          name: 'page_load_complete',
          value: pageLoadTime,
          unit: 'ms',
          url: window.location.href,
          userAgent: navigator.userAgent,
          connection: this.getConnectionInfo(),
          context: {
            userId: this.userId,
            sessionId: this.sessionId
          },
          metadata: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            domInteractive: navigation.domInteractive - navigation.navigationStart,
            firstByte: navigation.responseStart - navigation.navigationStart,
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            ssl: navigation.connectEnd - navigation.secureConnectionStart
          }
        });
      }
    });
  }

  /**
   * Track navigation performance
   */
  private trackNavigation(): void {
    // Track route changes (for SPAs)
    let lastUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        const navigationTime = performance.now();
        
        this.addEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: MetricType.NAVIGATION,
          name: 'route_change',
          value: navigationTime,
          unit: 'ms',
          url: currentUrl,
          userAgent: navigator.userAgent,
          context: {
            userId: this.userId,
            sessionId: this.sessionId,
            feature: 'navigation'
          },
          metadata: {
            from: lastUrl,
            to: currentUrl
          }
        });
        
        lastUrl = currentUrl;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Track resource loading performance
   */
  private trackResourceLoading(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Only track important resources
          if (this.shouldTrackResource(resourceEntry.name)) {
            this.addEvent({
              id: this.generateEventId(),
              timestamp: Date.now(),
              type: MetricType.BUNDLE_SIZE,
              name: 'resource_load',
              value: resourceEntry.duration,
              unit: 'ms',
              url: window.location.href,
              userAgent: navigator.userAgent,
              context: {
                userId: this.userId,
                sessionId: this.sessionId
              },
              metadata: {
                resourceUrl: resourceEntry.name,
                resourceType: this.getResourceType(resourceEntry.name),
                transferSize: resourceEntry.transferSize,
                encodedBodySize: resourceEntry.encodedBodySize,
                decodedBodySize: resourceEntry.decodedBodySize
              }
            });
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Track API response time
   */
  trackAPIResponse(endpoint: string, duration: number, status: number, method: string = 'GET'): void {
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: MetricType.API_RESPONSE,
      name: 'api_call',
      value: duration,
      unit: 'ms',
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      context: {
        userId: this.userId,
        sessionId: this.sessionId,
        feature: 'api'
      },
      metadata: {
        endpoint,
        method,
        status,
        success: status >= 200 && status < 300
      }
    });
  }

  /**
   * Track user interactions
   */
  trackUserInteraction(action: string, component: string, duration?: number): void {
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: MetricType.USER_INTERACTION,
      name: action,
      value: duration || 0,
      unit: 'ms',
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        userId: this.userId,
        sessionId: this.sessionId,
        component,
        action
      }
    });
  }

  /**
   * Track blockchain operations
   */
  trackBlockchainOperation(operation: string, duration: number, success: boolean): void {
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: MetricType.BLOCKCHAIN_OPERATION,
      name: operation,
      value: duration,
      unit: 'ms',
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        userId: this.userId,
        sessionId: this.sessionId,
        feature: 'blockchain'
      },
      metadata: {
        success,
        operation
      }
    });
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, duration: number): void {
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: MetricType.COMPONENT_RENDER,
      name: 'component_render',
      value: duration,
      unit: 'ms',
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        userId: this.userId,
        sessionId: this.sessionId,
        component: componentName
      }
    });
  }

  /**
   * Track error rates
   */
  trackError(error: Error, component?: string): void {
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: MetricType.ERROR_RATE,
      name: 'error_occurred',
      value: 1,
      unit: 'count',
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        userId: this.userId,
        sessionId: this.sessionId,
        component
      },
      metadata: {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name
      }
    });
  }

  /**
   * Add event to buffer
   */
  private addEvent(event: PerformanceEvent): void {
    this.eventBuffer.push(event);

    // Flush if buffer is full
    if (this.eventBuffer.length >= BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Check performance thresholds and alert if needed
   */
  private checkThreshold(event: PerformanceEvent): void {
    const threshold = PERFORMANCE_THRESHOLDS[event.type];
    if (!threshold) return;

    let status: 'good' | 'needs_improvement' | 'poor';
    
    if (event.value <= threshold.good) {
      status = 'good';
    } else if (event.value <= threshold.poor) {
      status = 'needs_improvement';
    } else {
      status = 'poor';
    }

    if (status === 'poor') {
      console.warn(`⚠️ Poor performance detected: ${event.name} = ${event.value}${event.unit}`);
      
      // Send immediate alert for critical performance issues
      if (IS_PRODUCTION) {
        this.sendAlert(event, status);
      }
    }
  }

  /**
   * Send performance alert
   */
  private async sendAlert(event: PerformanceEvent, status: string): Promise<void> {
    try {
      await fetch('/api/alerts/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          status,
          severity: 'warning',
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }

  /**
   * Flush events to server
   */
  async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      if (IS_PRODUCTION) {
        await fetch(PERFORMANCE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events })
        });
      } else {
        // In development, log to console
        console.group('📊 Performance Events');
        events.forEach(event => {
          console.log(`${event.type}: ${event.name} = ${event.value}${event.unit}`);
        });
        console.groupEnd();
      }
    } catch (error) {
      console.error('Failed to send performance events:', error);
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...events);
    }
  }

  /**
   * Set up automatic flush timer
   */
  private setupFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, FLUSH_INTERVAL);
  }

  /**
   * Utility methods
   */
  private generateEventId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getConnectionInfo() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }
    
    return undefined;
  }

  private shouldTrackResource(url: string): boolean {
    // Track JavaScript, CSS, and important assets
    return /\.(js|css|woff|woff2|ttf|png|jpg|jpeg|svg|webp)$/.test(url) ||
           url.includes('chunk') ||
           url.includes('vendor');
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf)$/)) return 'font';
    return 'other';
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    eventsCount: number;
    averagePageLoad?: number;
    averageApiResponse?: number;
    errorRate?: number;
  } {
    const recentEvents = this.eventBuffer.slice(-100); // Last 100 events
    
    const pageLoadEvents = recentEvents.filter(e => e.type === MetricType.PAGE_LOAD);
    const apiEvents = recentEvents.filter(e => e.type === MetricType.API_RESPONSE);
    const errorEvents = recentEvents.filter(e => e.type === MetricType.ERROR_RATE);

    return {
      eventsCount: recentEvents.length,
      averagePageLoad: pageLoadEvents.length > 0 
        ? pageLoadEvents.reduce((sum, e) => sum + e.value, 0) / pageLoadEvents.length 
        : undefined,
      averageApiResponse: apiEvents.length > 0
        ? apiEvents.reduce((sum, e) => sum + e.value, 0) / apiEvents.length
        : undefined,
      errorRate: recentEvents.length > 0
        ? (errorEvents.length / recentEvents.length) * 100
        : undefined
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(); // Final flush
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Export React hooks for easy integration
export const usePerformanceMonitor = () => {
  return {
    trackAPIResponse: performanceMonitor.trackAPIResponse.bind(performanceMonitor),
    trackUserInteraction: performanceMonitor.trackUserInteraction.bind(performanceMonitor),
    trackBlockchainOperation: performanceMonitor.trackBlockchainOperation.bind(performanceMonitor),
    trackComponentRender: performanceMonitor.trackComponentRender.bind(performanceMonitor),
    trackError: performanceMonitor.trackError.bind(performanceMonitor),
    getPerformanceSummary: performanceMonitor.getPerformanceSummary.bind(performanceMonitor)
  };
};

export default performanceMonitor;