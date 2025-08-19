/**
 * Performance Budgets and Monitoring System
 * Implements performance budgets, regression detection, and alerting
 */

import { performanceMonitor, MetricType, PERFORMANCE_THRESHOLDS } from './performanceMonitoring';

// Performance budgets configuration
export interface PerformanceBudget {
  id: string;
  name: string;
  description: string;
  metrics: BudgetMetric[];
  routes?: string[];
  enabled: boolean;
  alertThreshold: number; // Percentage over budget to trigger alert
}

export interface BudgetMetric {
  type: MetricType;
  budget: number;
  unit: string;
  weight: number; // Importance weight (1-10)
  trend?: 'improving' | 'stable' | 'degrading';
}

export interface PerformanceAlert {
  id: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  budgetId: string;
  metric: MetricType;
  actual: number;
  budget: number;
  overBudget: number;
  route?: string;
  message: string;
}

export interface PerformanceReport {
  timestamp: number;
  budgets: Array<{
    id: string;
    name: string;
    status: 'pass' | 'warning' | 'fail';
    score: number;
    metrics: Array<{
      type: MetricType;
      actual: number;
      budget: number;
      status: 'pass' | 'warning' | 'fail';
      trend?: 'improving' | 'stable' | 'degrading';
    }>;
  }>;
  alerts: PerformanceAlert[];
  recommendations: string[];
}

// Default performance budgets
export const DEFAULT_PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  {
    id: 'core-web-vitals',
    name: 'Core Web Vitals',
    description: 'Essential user experience metrics',
    enabled: true,
    alertThreshold: 10, // 10% over budget
    metrics: [
      {
        type: MetricType.LCP,
        budget: 2500, // 2.5s
        unit: 'ms',
        weight: 10
      },
      {
        type: MetricType.FCP,
        budget: 1800, // 1.8s
        unit: 'ms',
        weight: 8
      },
      {
        type: MetricType.CLS,
        budget: 0.1, // 0.1 score
        unit: 'score',
        weight: 9
      },
      {
        type: MetricType.INP,
        budget: 200, // 200ms
        unit: 'ms',
        weight: 9
      },
      {
        type: MetricType.TTFB,
        budget: 800, // 800ms
        unit: 'ms',
        weight: 7
      }
    ]
  },
  {
    id: 'dashboard-performance',
    name: 'Dashboard Performance',
    description: 'Dashboard-specific performance metrics',
    routes: ['/dashboard', '/dashboard-v2'],
    enabled: true,
    alertThreshold: 15,
    metrics: [
      {
        type: MetricType.PAGE_LOAD,
        budget: 3000, // 3s
        unit: 'ms',
        weight: 9
      },
      {
        type: MetricType.COMPONENT_RENDER,
        budget: 100, // 100ms
        unit: 'ms',
        weight: 7
      },
      {
        type: MetricType.API_RESPONSE,
        budget: 1000, // 1s
        unit: 'ms',
        weight: 8
      }
    ]
  },
  {
    id: 'mobile-performance',
    name: 'Mobile Performance',
    description: 'Mobile-specific performance requirements',
    enabled: true,
    alertThreshold: 20,
    metrics: [
      {
        type: MetricType.LCP,
        budget: 3000, // 3s for mobile
        unit: 'ms',
        weight: 10
      },
      {
        type: MetricType.FCP,
        budget: 2200, // 2.2s for mobile
        unit: 'ms',
        weight: 8
      },
      {
        type: MetricType.USER_INTERACTION,
        budget: 150, // 150ms for touch interactions
        unit: 'ms',
        weight: 9
      }
    ]
  },
  {
    id: 'bundle-size',
    name: 'Bundle Size Budget',
    description: 'JavaScript bundle size limits',
    enabled: true,
    alertThreshold: 5,
    metrics: [
      {
        type: MetricType.BUNDLE_SIZE,
        budget: 250000, // 250KB initial bundle
        unit: 'bytes',
        weight: 8
      }
    ]
  }
];

class PerformanceBudgetManager {
  private budgets: PerformanceBudget[] = [];
  private alerts: PerformanceAlert[] = [];
  private measurements: Map<string, number[]> = new Map();
  private isInitialized = false;

  constructor() {
    this.budgets = [...DEFAULT_PERFORMANCE_BUDGETS];
  }

  /**
   * Initialize the performance budget system
   */
  init(): void {
    if (this.isInitialized) return;

    // Set up performance monitoring integration
    this.setupPerformanceMonitoring();
    
    // Start budget monitoring
    this.startBudgetMonitoring();
    
    // Set up periodic reporting
    this.setupPeriodicReporting();

    this.isInitialized = true;
    console.log('🎯 Performance Budget Manager initialized');
  }

  /**
   * Add a custom performance budget
   */
  addBudget(budget: PerformanceBudget): void {
    this.budgets.push(budget);
  }

  /**
   * Update an existing budget
   */
  updateBudget(budgetId: string, updates: Partial<PerformanceBudget>): void {
    const index = this.budgets.findIndex(b => b.id === budgetId);
    if (index !== -1) {
      this.budgets[index] = { ...this.budgets[index], ...updates };
    }
  }

  /**
   * Record a performance measurement
   */
  recordMeasurement(type: MetricType, value: number, route?: string): void {
    const key = route ? `${type}-${route}` : type;
    
    if (!this.measurements.has(key)) {
      this.measurements.set(key, []);
    }
    
    const measurements = this.measurements.get(key)!;
    measurements.push(value);
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }

    // Check budgets for this measurement
    this.checkBudgets(type, value, route);
  }

  /**
   * Check if a measurement violates any budgets
   */
  private checkBudgets(type: MetricType, value: number, route?: string): void {
    this.budgets
      .filter(budget => budget.enabled)
      .filter(budget => !budget.routes || !route || budget.routes.includes(route))
      .forEach(budget => {
        const metric = budget.metrics.find(m => m.type === type);
        if (!metric) return;

        const overBudget = ((value - metric.budget) / metric.budget) * 100;
        
        if (overBudget > budget.alertThreshold) {
          this.createAlert({
            budgetId: budget.id,
            metric: type,
            actual: value,
            budget: metric.budget,
            overBudget,
            route,
            severity: overBudget > 50 ? 'critical' : overBudget > 25 ? 'warning' : 'info'
          });
        }
      });
  }

  /**
   * Create a performance alert
   */
  private createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp' | 'message'>): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      message: this.generateAlertMessage(alertData),
      ...alertData
    };

    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }

    // Send alert to monitoring system
    this.sendAlert(alert);
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(alertData: Omit<PerformanceAlert, 'id' | 'timestamp' | 'message'>): string {
    const budget = this.budgets.find(b => b.id === alertData.budgetId);
    const budgetName = budget?.name || 'Unknown Budget';
    
    return `${budgetName}: ${alertData.metric} exceeded budget by ${alertData.overBudget.toFixed(1)}% ` +
           `(${alertData.actual}${alertData.budget < 1 ? '' : 'ms'} vs ${alertData.budget}${alertData.budget < 1 ? '' : 'ms'} budget)` +
           (alertData.route ? ` on ${alertData.route}` : '');
  }

  /**
   * Send alert to external monitoring
   */
  private sendAlert(alert: PerformanceAlert): void {
    // In production, send to monitoring service (Sentry, DataDog, etc.)
    if (import.meta.env.MODE === 'production') {
      // Example: Send to Sentry
      if (window.Sentry) {
        window.Sentry.addBreadcrumb({
          message: alert.message,
          level: alert.severity,
          category: 'performance',
          data: {
            budgetId: alert.budgetId,
            metric: alert.metric,
            actual: alert.actual,
            budget: alert.budget
          }
        });
      }
    } else {
      console.warn(`🚨 Performance Alert (${alert.severity}):`, alert.message);
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      budgets: [],
      alerts: [...this.alerts],
      recommendations: []
    };

    // Analyze each budget
    this.budgets.filter(b => b.enabled).forEach(budget => {
      const budgetReport = {
        id: budget.id,
        name: budget.name,
        status: 'pass' as 'pass' | 'warning' | 'fail',
        score: 100,
        metrics: [] as any[]
      };

      let totalWeight = 0;
      let weightedScore = 0;

      budget.metrics.forEach(metric => {
        const measurements = this.getMeasurements(metric.type);
        if (measurements.length === 0) return;

        const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
        const overBudget = ((avg - metric.budget) / metric.budget) * 100;
        
        let status: 'pass' | 'warning' | 'fail' = 'pass';
        let score = 100;

        if (overBudget > budget.alertThreshold * 2) {
          status = 'fail';
          score = Math.max(0, 100 - overBudget);
        } else if (overBudget > budget.alertThreshold) {
          status = 'warning';
          score = Math.max(50, 100 - overBudget / 2);
        }

        budgetReport.metrics.push({
          type: metric.type,
          actual: avg,
          budget: metric.budget,
          status,
          trend: this.calculateTrend(metric.type)
        });

        totalWeight += metric.weight;
        weightedScore += score * metric.weight;

        if (status === 'fail' || budgetReport.status === 'pass') {
          budgetReport.status = status;
        }
      });

      budgetReport.score = totalWeight > 0 ? weightedScore / totalWeight : 100;
      report.budgets.push(budgetReport);
    });

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  /**
   * Get measurements for a metric type
   */
  private getMeasurements(type: MetricType): number[] {
    const measurements: number[] = [];
    
    for (const [key, values] of this.measurements.entries()) {
      if (key.startsWith(type)) {
        measurements.push(...values);
      }
    }
    
    return measurements;
  }

  /**
   * Calculate performance trend
   */
  private calculateTrend(type: MetricType): 'improving' | 'stable' | 'degrading' {
    const measurements = this.getMeasurements(type);
    if (measurements.length < 10) return 'stable';

    const recent = measurements.slice(-5);
    const older = measurements.slice(-10, -5);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change < -5) return 'improving';
    if (change > 5) return 'degrading';
    return 'stable';
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(report: PerformanceReport): string[] {
    const recommendations: string[] = [];

    report.budgets.forEach(budget => {
      budget.metrics.forEach(metric => {
        if (metric.status === 'fail') {
          switch (metric.type) {
            case MetricType.LCP:
              recommendations.push('Optimize Largest Contentful Paint: Consider image compression, lazy loading, or CDN usage');
              break;
            case MetricType.FCP:
              recommendations.push('Improve First Contentful Paint: Minimize render-blocking resources and optimize CSS delivery');
              break;
            case MetricType.CLS:
              recommendations.push('Reduce Cumulative Layout Shift: Set dimensions for images and ads, avoid dynamic content insertion');
              break;
            case MetricType.INP:
              recommendations.push('Optimize Interaction to Next Paint: Reduce JavaScript execution time and debounce user inputs');
              break;
            case MetricType.BUNDLE_SIZE:
              recommendations.push('Reduce bundle size: Implement code splitting, tree shaking, and remove unused dependencies');
              break;
            case MetricType.API_RESPONSE:
              recommendations.push('Optimize API performance: Implement caching, reduce payload size, or optimize database queries');
              break;
          }
        }
      });
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Set up performance monitoring integration
   */
  private setupPerformanceMonitoring(): void {
    // Integrate with existing performance monitor
    const originalTrackAPI = performanceMonitor.trackAPIResponse.bind(performanceMonitor);
    performanceMonitor.trackAPIResponse = (endpoint: string, duration: number, status: number, method: string) => {
      originalTrackAPI(endpoint, duration, status, method);
      this.recordMeasurement(MetricType.API_RESPONSE, duration, endpoint);
    };

    const originalTrackComponent = performanceMonitor.trackComponentRender.bind(performanceMonitor);
    performanceMonitor.trackComponentRender = (componentName: string, duration: number) => {
      originalTrackComponent(componentName, duration);
      this.recordMeasurement(MetricType.COMPONENT_RENDER, duration);
    };
  }

  /**
   * Start budget monitoring
   */
  private startBudgetMonitoring(): void {
    // Monitor Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Monitor LCP
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMeasurement(MetricType.LCP, entry.startTime, window.location.pathname);
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // Monitor FCP
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.recordMeasurement(MetricType.FCP, entry.startTime, window.location.pathname);
            }
          }
        }).observe({ type: 'paint', buffered: true });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  /**
   * Set up periodic reporting
   */
  private setupPeriodicReporting(): void {
    // Generate report every 5 minutes
    setInterval(() => {
      const report = this.generateReport();
      
      // Send to analytics in production
      if (import.meta.env.MODE === 'production') {
        this.sendReportToAnalytics(report);
      } else {
        console.log('📊 Performance Report:', report);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Send report to analytics service
   */
  private sendReportToAnalytics(report: PerformanceReport): void {
    // In production, send to analytics service
    if (window.gtag) {
      window.gtag('event', 'performance_report', {
        event_category: 'Performance',
        event_label: 'Budget Report',
        custom_parameters: {
          budgets_passing: report.budgets.filter(b => b.status === 'pass').length,
          budgets_failing: report.budgets.filter(b => b.status === 'fail').length,
          alerts_count: report.alerts.length
        }
      });
    }
  }

  /**
   * Get current alerts
   */
  getAlerts(severity?: PerformanceAlert['severity']): PerformanceAlert[] {
    return severity ? 
      this.alerts.filter(a => a.severity === severity) :
      this.alerts;
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Get budget status
   */
  getBudgetStatus(budgetId: string): 'pass' | 'warning' | 'fail' | 'unknown' {
    const report = this.generateReport();
    const budget = report.budgets.find(b => b.id === budgetId);
    return budget?.status || 'unknown';
  }
}

// Export singleton instance
export const performanceBudgetManager = new PerformanceBudgetManager();

// Initialize on import
if (typeof window !== 'undefined') {
  performanceBudgetManager.init();
}

export default performanceBudgetManager;