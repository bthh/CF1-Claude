// Performance monitoring and optimization utilities
import React from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  bundleSize?: number;
}

interface ComponentMetrics {
  name: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  propsChanges: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    this.setupPerformanceObservers();
  }

  private setupPerformanceObservers() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    // Long Task Observer
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`, entry);
            this.logPerformanceIssue('long-task', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (e) {
      console.warn('Long task observer not supported');
    }

    // Layout Shift Observer
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).value > 0.1) {
            console.warn(`Layout shift detected: ${(entry as any).value}`, entry);
            this.logPerformanceIssue('layout-shift', {
              value: (entry as any).value,
              startTime: entry.startTime
            });
          }
        }
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);
    } catch (e) {
      console.warn('Layout shift observer not supported');
    }

    // Largest Contentful Paint Observer
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry && lastEntry.startTime > 2500) {
          console.warn(`Slow LCP detected: ${lastEntry.startTime}ms`);
          this.logPerformanceIssue('slow-lcp', {
            time: lastEntry.startTime,
            element: (lastEntry as any).element
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }
  }

  startMonitoring(pageId: string) {
    this.isMonitoring = true;
    const startTime = performance.now();
    
    // Monitor memory usage
    const monitorMemory = () => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        this.updateMetrics(pageId, {
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        });
      }
    };

    monitorMemory();
    const memoryInterval = setInterval(monitorMemory, 5000);

    // Cleanup function
    return () => {
      clearInterval(memoryInterval);
      this.isMonitoring = false;
      const endTime = performance.now();
      this.updateMetrics(pageId, {
        loadTime: endTime - startTime
      });
    };
  }

  measureComponentRender(componentName: string, renderFn: () => void) {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    const existing = this.componentMetrics.get(componentName);
    if (existing) {
      existing.renderCount++;
      existing.lastRenderTime = renderTime;
      existing.averageRenderTime = 
        (existing.averageRenderTime * (existing.renderCount - 1) + renderTime) / existing.renderCount;
    } else {
      this.componentMetrics.set(componentName, {
        name: componentName,
        renderCount: 1,
        averageRenderTime: renderTime,
        lastRenderTime: renderTime,
        propsChanges: 0
      });
    }

    if (renderTime > 16) { // Longer than one frame
      console.warn(`Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }

    return renderTime;
  }

  measureInteraction(interactionType: string, callback: () => void | Promise<void>) {
    const startTime = performance.now();
    
    const finish = () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 100) {
        console.warn(`Slow interaction: ${interactionType} took ${duration.toFixed(2)}ms`);
        this.logPerformanceIssue('slow-interaction', {
          type: interactionType,
          duration
        });
      }
      
      return duration;
    };

    const result = callback();
    
    if (result instanceof Promise) {
      return result.finally(finish);
    } else {
      return finish();
    }
  }

  private updateMetrics(pageId: string, updates: Partial<PerformanceMetrics>) {
    const existing = this.metrics.get(pageId) || {
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
      memoryUsage: 0
    };
    
    this.metrics.set(pageId, { ...existing, ...updates });
  }

  private logPerformanceIssue(type: string, data: any) {
    // In a real app, this would send to analytics
    console.group(`Performance Issue: ${type}`);
    console.log('Data:', data);
    console.log('User Agent:', navigator.userAgent);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }

  getMetrics(pageId: string): PerformanceMetrics | undefined {
    return this.metrics.get(pageId);
  }

  getComponentMetrics(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values());
  }

  getSlowComponents(threshold = 16): ComponentMetrics[] {
    return this.getComponentMetrics().filter(
      metric => metric.averageRenderTime > threshold
    );
  }

  generateReport(): object {
    const vitals = this.getWebVitals();
    const components = this.getComponentMetrics();
    const slowComponents = this.getSlowComponents();
    
    return {
      timestamp: new Date().toISOString(),
      vitals,
      components: {
        total: components.length,
        slow: slowComponents.length,
        details: slowComponents
      },
      memory: (performance as any).memory ? {
        used: Math.round(((performance as any).memory.usedJSHeapSize / 1024 / 1024) * 100) / 100,
        total: Math.round(((performance as any).memory.totalJSHeapSize / 1024 / 1024) * 100) / 100,
        limit: Math.round(((performance as any).memory.jsHeapSizeLimit / 1024 / 1024) * 100) / 100
      } : null,
      recommendations: this.generateRecommendations(slowComponents)
    };
  }

  private getWebVitals() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      // First Contentful Paint
      fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      // Largest Contentful Paint
      lcp: performance.getEntriesByType('largest-contentful-paint').pop()?.startTime || 0,
      // Time to Interactive (approximation)
      tti: navigation ? navigation.domInteractive - navigation.navigationStart : 0,
      // Total Blocking Time (approximation)
      tbt: this.estimateTotalBlockingTime(),
      // Cumulative Layout Shift
      cls: this.calculateCLS()
    };
  }

  private estimateTotalBlockingTime(): number {
    // Simplified TBT calculation based on long tasks
    const longTasks = performance.getEntriesByType('longtask');
    return longTasks.reduce((total, task) => {
      const blockingTime = Math.max(0, task.duration - 50);
      return total + blockingTime;
    }, 0);
  }

  private calculateCLS(): number {
    // Simplified CLS calculation
    const layoutShifts = performance.getEntriesByType('layout-shift');
    return layoutShifts.reduce((total, shift) => {
      return total + (shift as any).value;
    }, 0);
  }

  private generateRecommendations(slowComponents: ComponentMetrics[]): string[] {
    const recommendations: string[] = [];
    
    if (slowComponents.length > 0) {
      recommendations.push(`Optimize ${slowComponents.length} slow components using React.memo() or useMemo()`);
    }
    
    const vitals = this.getWebVitals();
    if (vitals.lcp > 2500) {
      recommendations.push('Improve Largest Contentful Paint by optimizing images and critical resources');
    }
    
    if (vitals.cls > 0.1) {
      recommendations.push('Reduce Cumulative Layout Shift by setting image dimensions and avoiding dynamic content');
    }
    
    if (vitals.tbt > 300) {
      recommendations.push('Reduce Total Blocking Time by code splitting and optimizing JavaScript execution');
    }
    
    const memory = (performance as any).memory;
    if (memory && memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
      recommendations.push('High memory usage detected - consider implementing virtual scrolling or data pagination');
    }
    
    return recommendations;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
  }
}

// React hooks for performance monitoring
import { useEffect, useRef, useCallback } from 'react';

export const usePerformanceMonitor = (pageId: string) => {
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    monitorRef.current = new PerformanceMonitor();
    cleanupRef.current = monitorRef.current.startMonitoring(pageId);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (monitorRef.current) {
        monitorRef.current.cleanup();
      }
    };
  }, [pageId]);

  const measureRender = useCallback((componentName: string, renderFn: () => void) => {
    return monitorRef.current?.measureComponentRender(componentName, renderFn) || 0;
  }, []);

  const measureInteraction = useCallback((type: string, callback: () => void | Promise<void>) => {
    return monitorRef.current?.measureInteraction(type, callback);
  }, []);

  const getReport = useCallback(() => {
    return monitorRef.current?.generateReport();
  }, []);

  return { measureRender, measureInteraction, getReport };
};

export const useComponentPerformance = (componentName: string) => {
  const renderStartRef = useRef<number>(0);
  const { measureRender } = usePerformanceMonitor('component');

  const startMeasure = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  const endMeasure = useCallback(() => {
    if (renderStartRef.current > 0) {
      const duration = performance.now() - renderStartRef.current;
      measureRender(componentName, () => {});
      renderStartRef.current = 0;
      return duration;
    }
    return 0;
  }, [componentName, measureRender]);

  return { startMeasure, endMeasure };
};

// Bundle analyzer utility
export const analyzeBundleSize = async (): Promise<void> => {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  try {
    const { default: analyzer } = await import('webpack-bundle-analyzer');
    // This would typically be configured in the build process
    console.log('Bundle analysis available in development mode');
  } catch {
    console.log('Bundle analyzer not available');
  }
};

// Code splitting utilities
export const lazyLoad = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFunc);
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <React.Suspense fallback={fallback ? React.createElement(fallback) : <div>Loading...</div>}>
      <LazyComponent {...props} ref={ref} />
    </React.Suspense>
  ));
};

// Preload utilities
export const preloadRoute = (routePath: string): void => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = routePath;
  document.head.appendChild(link);
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Memory leak detection
export const detectMemoryLeaks = (): void => {
  let lastUsage = 0;
  let measurements = 0;

  const checkMemory = () => {
    if ((performance as any).memory) {
      const currentUsage = (performance as any).memory.usedJSHeapSize;
      
      if (measurements > 0) {
        const increase = currentUsage - lastUsage;
        const increasePercent = (increase / lastUsage) * 100;
        
        if (increasePercent > 20 && measurements > 5) {
          console.warn(`Potential memory leak detected: ${increasePercent.toFixed(2)}% increase in memory usage`);
          console.log(`Current usage: ${(currentUsage / 1024 / 1024).toFixed(2)}MB`);
        }
      }
      
      lastUsage = currentUsage;
      measurements++;
    }
  };

  // Check every 30 seconds
  const interval = setInterval(checkMemory, 30000);
  
  // Cleanup function
  return () => clearInterval(interval);
};

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React import for lazy loading
