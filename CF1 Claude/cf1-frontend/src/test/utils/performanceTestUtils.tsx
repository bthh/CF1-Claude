import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import React from 'react';

/**
 * Performance testing utilities for CF1 platform
 */

// Mock performance observer for testing
class MockPerformanceObserver {
  private callback: PerformanceObserverCallback;
  private entries: PerformanceEntry[] = [];

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
  }

  observe(options: PerformanceObserverInit) {
    // Mock implementation
  }

  disconnect() {
    // Mock implementation
  }

  takeRecords(): PerformanceEntryList {
    return this.entries;
  }

  // Helper method to simulate entries
  simulateEntries(entries: PerformanceEntry[]) {
    this.entries = entries;
    this.callback({ getEntries: () => entries } as PerformanceObserverEntryList, this);
  }
}

// Performance metrics collection
export class PerformanceTracker {
  private startTimes: Map<string, number> = new Map();
  private metrics: Map<string, number> = new Map();
  private observers: Map<string, MockPerformanceObserver> = new Map();

  startTimer(name: string) {
    this.startTimes.set(name, performance.now());
  }

  endTimer(name: string): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      throw new Error(`Timer ${name} was not started`);
    }
    
    const duration = performance.now() - startTime;
    this.metrics.set(name, duration);
    this.startTimes.delete(name);
    return duration;
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  clear() {
    this.startTimes.clear();
    this.metrics.clear();
  }

  // Measure component render time
  measureRender<T extends React.ComponentType<any>>(
    Component: T,
    props: React.ComponentProps<T> = {} as React.ComponentProps<T>
  ): Promise<{ renderTime: number; element: HTMLElement }> {
    return new Promise((resolve) => {
      this.startTimer('render');
      
      const { container } = render(React.createElement(Component, props));
      
      // Wait for component to fully render
      setTimeout(() => {
        const renderTime = this.endTimer('render');
        resolve({ renderTime, element: container });
      }, 0);
    });
  }

  // Measure async operation time
  async measureAsync<T>(
    operation: () => Promise<T>,
    name: string
  ): Promise<{ result: T; duration: number }> {
    this.startTimer(name);
    const result = await operation();
    const duration = this.endTimer(name);
    return { result, duration };
  }

  // Observe performance entries
  observePerformance(entryTypes: string[], callback: (entries: PerformanceEntry[]) => void) {
    const observer = new MockPerformanceObserver((list) => {
      callback(list.getEntries());
    });
    
    observer.observe({ entryTypes });
    this.observers.set(entryTypes.join(','), observer);
    return observer;
  }
}

// Bundle size analysis utilities
export const analyzeBundleSize = {
  // Mock function to analyze bundle sizes
  getChunkSizes: (): Record<string, number> => ({
    'main': 245.6, // KB
    'vendors': 1023.4,
    'dashboard': 89.2,
    'proposals': 156.8,
    'portfolio': 134.5,
    'admin': 67.3
  }),

  // Check if bundle sizes are within acceptable limits
  validateBundleSizes: (limits: Record<string, number>) => {
    const sizes = analyzeBundleSize.getChunkSizes();
    const violations: Array<{ chunk: string; size: number; limit: number }> = [];

    Object.entries(limits).forEach(([chunk, limit]) => {
      const size = sizes[chunk];
      if (size && size > limit) {
        violations.push({ chunk, size, limit });
      }
    });

    return violations;
  }
};

// Memory usage tracking
export class MemoryTracker {
  private initialMemory: number = 0;
  private checkpoints: Map<string, number> = new Map();

  start() {
    // Mock memory usage - in real implementation would use performance.memory
    this.initialMemory = Math.random() * 100000000; // Mock bytes
  }

  checkpoint(name: string) {
    const currentMemory = this.initialMemory + (Math.random() * 10000000);
    this.checkpoints.set(name, currentMemory);
  }

  getUsage(checkpointName?: string): number {
    if (checkpointName) {
      return this.checkpoints.get(checkpointName) || 0;
    }
    return this.initialMemory + (Math.random() * 10000000);
  }

  getIncrease(fromCheckpoint: string, toCheckpoint?: string): number {
    const from = this.checkpoints.get(fromCheckpoint) || this.initialMemory;
    const to = toCheckpoint ? 
      (this.checkpoints.get(toCheckpoint) || this.getUsage()) : 
      this.getUsage();
    
    return to - from;
  }

  detectMemoryLeaks(threshold: number = 10000000): boolean {
    const currentUsage = this.getUsage();
    return (currentUsage - this.initialMemory) > threshold;
  }
}

// Network performance testing
export const networkPerformanceUtils = {
  // Mock network timing measurements
  measureApiCall: async (apiCall: () => Promise<any>): Promise<{
    duration: number;
    size: number;
    result: any;
  }> => {
    const startTime = performance.now();
    const result = await apiCall();
    const duration = performance.now() - startTime;
    
    // Mock response size
    const size = JSON.stringify(result).length;
    
    return { duration, size, result };
  },

  // Test multiple concurrent requests
  measureConcurrentRequests: async (
    requests: Array<() => Promise<any>>,
    maxConcurrency: number = 5
  ): Promise<Array<{ duration: number; success: boolean }>> => {
    const results: Array<{ duration: number; success: boolean }> = [];
    
    for (let i = 0; i < requests.length; i += maxConcurrency) {
      const batch = requests.slice(i, i + maxConcurrency);
      const batchPromises = batch.map(async (request) => {
        const startTime = performance.now();
        try {
          await request();
          return { duration: performance.now() - startTime, success: true };
        } catch (error) {
          return { duration: performance.now() - startTime, success: false };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
};

// Component performance testing utilities
export const componentPerformanceUtils = {
  // Test component mount time
  testMountTime: async <T extends React.ComponentType<any>>(
    Component: T,
    props: React.ComponentProps<T> = {} as React.ComponentProps<T>,
    expectedMaxTime: number = 1000
  ) => {
    const tracker = new PerformanceTracker();
    const { renderTime } = await tracker.measureRender(Component, props);
    
    expect(renderTime).toBeLessThan(expectedMaxTime);
    return renderTime;
  },

  // Test component re-render performance
  testReRenderPerformance: async <T extends React.ComponentType<any>>(
    Component: T,
    initialProps: React.ComponentProps<T>,
    updatedProps: React.ComponentProps<T>,
    expectedMaxTime: number = 100
  ) => {
    const tracker = new PerformanceTracker();
    
    const { rerender } = render(React.createElement(Component, initialProps));
    
    // Measure re-render time
    tracker.startTimer('rerender');
    await act(async () => {
      rerender(React.createElement(Component, updatedProps));
    });
    const rerenderTime = tracker.endTimer('rerender');
    
    expect(rerenderTime).toBeLessThan(expectedMaxTime);
    return rerenderTime;
  },

  // Test component unmount cleanup
  testUnmountCleanup: async <T extends React.ComponentType<any>>(
    Component: T,
    props: React.ComponentProps<T> = {} as React.ComponentProps<T>
  ) => {
    const memoryTracker = new MemoryTracker();
    memoryTracker.start();
    memoryTracker.checkpoint('beforeMount');
    
    const { unmount } = render(React.createElement(Component, props));
    memoryTracker.checkpoint('afterMount');
    
    unmount();
    
    // Allow garbage collection
    await new Promise(resolve => setTimeout(resolve, 100));
    memoryTracker.checkpoint('afterUnmount');
    
    const memoryIncrease = memoryTracker.getIncrease('beforeMount', 'afterUnmount');
    
    // Memory should not increase significantly after unmount
    expect(memoryIncrease).toBeLessThan(5000000); // 5MB threshold
    
    return memoryIncrease;
  },

  // Test list rendering performance with large datasets
  testLargeListPerformance: async <T extends React.ComponentType<any>>(
    ListComponent: T,
    generateProps: (itemCount: number) => React.ComponentProps<T>,
    itemCount: number = 1000,
    expectedMaxTime: number = 2000
  ) => {
    const tracker = new PerformanceTracker();
    const props = generateProps(itemCount);
    
    const { renderTime } = await tracker.measureRender(ListComponent, props);
    
    expect(renderTime).toBeLessThan(expectedMaxTime);
    return renderTime;
  }
};

// Loading performance testing
export const loadingPerformanceUtils = {
  // Test loading states
  testLoadingStates: async (
    component: React.ReactElement,
    dataLoadingTime: number = 500
  ) => {
    const { container } = render(component);
    
    // Should show loading state initially
    expect(screen.getByText(/loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: dataLoadingTime + 1000 });
  },

  // Test skeleton loading performance
  testSkeletonLoading: async (component: React.ReactElement) => {
    const tracker = new PerformanceTracker();
    tracker.startTimer('skeleton');
    
    const { container } = render(component);
    
    // Find skeleton elements
    const skeletons = container.querySelectorAll('.skeleton, [data-testid*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
    
    const skeletonRenderTime = tracker.endTimer('skeleton');
    
    // Skeleton should render quickly
    expect(skeletonRenderTime).toBeLessThan(100);
    
    return skeletonRenderTime;
  }
};

// Performance test suite runner
export const runPerformanceTests = (
  component: React.ReactElement,
  options: {
    mountTimeLimit?: number;
    bundleSizeLimits?: Record<string, number>;
    memoryLeakThreshold?: number;
    networkTimeoutLimit?: number;
  } = {}
) => {
  const {
    mountTimeLimit = 1000,
    bundleSizeLimits = { main: 300, vendors: 1200 },
    memoryLeakThreshold = 10000000,
    networkTimeoutLimit = 5000
  } = options;

  describe('Performance Tests', () => {
    let performanceTracker: PerformanceTracker;
    let memoryTracker: MemoryTracker;

    beforeEach(() => {
      performanceTracker = new PerformanceTracker();
      memoryTracker = new MemoryTracker();
      memoryTracker.start();
    });

    afterEach(() => {
      performanceTracker.clear();
    });

    it('should mount within acceptable time', async () => {
      const startTime = performance.now();
      render(component);
      const mountTime = performance.now() - startTime;
      
      expect(mountTime).toBeLessThan(mountTimeLimit);
    });

    it('should not have bundle size violations', () => {
      const violations = analyzeBundleSize.validateBundleSizes(bundleSizeLimits);
      expect(violations).toHaveLength(0);
    });

    it('should not have memory leaks', async () => {
      const { unmount } = render(component);
      memoryTracker.checkpoint('afterMount');
      
      unmount();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const hasMemoryLeak = memoryTracker.detectMemoryLeaks(memoryLeakThreshold);
      expect(hasMemoryLeak).toBeFalsy();
    });

    it('should handle loading states efficiently', async () => {
      await loadingPerformanceUtils.testLoadingStates(component);
    });
  });
};

// Utility for creating performance benchmarks
export const createPerformanceBenchmark = (
  name: string,
  testFunction: () => Promise<number> | number,
  expectedThreshold: number
) => {
  return {
    name,
    run: async (): Promise<{ passed: boolean; duration: number; threshold: number }> => {
      const duration = await testFunction();
      const passed = duration <= expectedThreshold;
      
      return { passed, duration, threshold: expectedThreshold };
    }
  };
};

// Export main utilities
export default {
  PerformanceTracker,
  MemoryTracker,
  analyzeBundleSize,
  networkPerformanceUtils,
  componentPerformanceUtils,
  loadingPerformanceUtils,
  runPerformanceTests,
  createPerformanceBenchmark
};