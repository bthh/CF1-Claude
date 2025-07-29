import React, { useState, useEffect } from 'react';
import { useDemoModeStore } from '../store/demoModeStore';

/**
 * Demo Data Service - Centralized service for managing demo vs real data
 * 
 * This service provides a unified interface for switching between demo and real data
 * based on the current demo mode configuration. It acts as a middleware layer
 * between components and data sources.
 */

// Generic interface for data services
export interface DataService<T> {
  getRealData(): Promise<T> | T;
  getDemoData(): Promise<T> | T;
}

// Demo data wrapper utility
export class DemoDataWrapper<T> {
  private realDataFn: () => Promise<T> | T;
  private demoDataFn: () => Promise<T> | T;

  constructor(
    realDataFn: () => Promise<T> | T,
    demoDataFn: () => Promise<T> | T
  ) {
    this.realDataFn = realDataFn;
    this.demoDataFn = demoDataFn;
  }

  async getData(): Promise<T> {
    const { isDemoMode, scenario, showRealisticNumbers, hideNegativeData, accelerateTimeframes } = useDemoModeStore.getState();
    
    if (!isDemoMode()) {
      return await Promise.resolve(this.realDataFn());
    }

    let demoData = await Promise.resolve(this.demoDataFn());

    // Apply demo mode transformations
    if (showRealisticNumbers) {
      demoData = this.makeDataRealistic(demoData);
    }

    if (hideNegativeData) {
      demoData = this.filterNegativeData(demoData);
    }

    if (accelerateTimeframes) {
      demoData = this.accelerateTimeframes(demoData);
    }

    // Apply scenario-specific transformations
    demoData = this.applyScenarioTransformations(demoData, scenario);

    return demoData;
  }

  private makeDataRealistic(data: T): T {
    // Apply realistic number formatting and ranges
    if (typeof data === 'object' && data !== null) {
      return this.transformObjectValues(data, (value) => {
        if (typeof value === 'number') {
          // Add slight randomization to make numbers look more realistic
          const variance = 0.02; // 2% variance
          const randomFactor = 1 + (Math.random() - 0.5) * variance;
          return Math.round(value * randomFactor * 100) / 100;
        }
        return value;
      });
    }
    return data;
  }

  private filterNegativeData(data: T): T {
    if (typeof data === 'object' && data !== null) {
      return this.transformObjectValues(data, (value, key) => {
        // Convert negative performance metrics to small positives
        if (typeof value === 'number' && value < 0) {
          if (typeof key === 'string' && (
            key.includes('return') || 
            key.includes('performance') || 
            key.includes('change') ||
            key.includes('growth')
          )) {
            return Math.random() * 0.05 + 0.01; // 1-6% positive
          }
        }
        return value;
      });
    }
    return data;
  }

  private accelerateTimeframes(data: T): T {
    if (typeof data === 'object' && data !== null) {
      return this.transformObjectValues(data, (value, key) => {
        // Modify date-related values to show compressed timeframes
        if (value instanceof Date) {
          // Compress 1 year to 1 month
          const now = new Date();
          const diffMs = now.getTime() - value.getTime();
          const compressedDiffMs = diffMs / 12; // 12x compression
          return new Date(now.getTime() - compressedDiffMs);
        }
        
        if (typeof key === 'string' && key.includes('duration') && typeof value === 'number') {
          return Math.max(1, Math.round(value / 12)); // Compress duration
        }
        
        return value;
      });
    }
    return data;
  }

  private applyScenarioTransformations(data: T, scenario: string): T {
    switch (scenario) {
      case 'investor_presentation':
        return this.optimizeForInvestors(data);
      case 'sales_demo':
        return this.optimizeForSales(data);
      case 'user_onboarding':
        return this.optimizeForOnboarding(data);
      default:
        return data;
    }
  }

  private optimizeForInvestors(data: T): T {
    // Enhance metrics that investors care about
    return this.transformObjectValues(data, (value, key) => {
      if (typeof value === 'number' && typeof key === 'string') {
        if (key.includes('apy') || key.includes('return')) {
          return Math.min(value * 1.2, 0.15); // Boost APY but cap at 15%
        }
        if (key.includes('volume') || key.includes('tvl')) {
          return value * 1.5; // Show higher volumes
        }
      }
      return value;
    });
  }

  private optimizeForSales(data: T): T {
    // Highlight features and capabilities
    return this.transformObjectValues(data, (value, key) => {
      if (typeof key === 'string') {
        if (key.includes('feature') || key.includes('capability')) {
          return true; // Enable all features for demo
        }
      }
      return value;
    });
  }

  private optimizeForOnboarding(data: T): T {
    // Simplify data for educational purposes
    return this.transformObjectValues(data, (value, key) => {
      if (typeof value === 'number' && typeof key === 'string') {
        if (key.includes('complexity') || key.includes('risk')) {
          return Math.min(value, 3); // Keep complexity low
        }
      }
      return value;
    });
  }

  private transformObjectValues(
    obj: any, 
    transformer: (value: any, key?: string | number) => any
  ): any {
    if (Array.isArray(obj)) {
      return obj.map((item, index) => 
        typeof item === 'object' && item !== null
          ? this.transformObjectValues(item, transformer)
          : transformer(item, index)
      );
    }

    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          result[key] = this.transformObjectValues(value, transformer);
        } else {
          result[key] = transformer(value, key);
        }
      }
      return result;
    }

    return transformer(obj);
  }
}

// Factory function for creating demo-aware data services
export function createDemoDataService<T>(
  realDataFn: () => Promise<T> | T,
  demoDataFn: () => Promise<T> | T
): () => Promise<T> {
  const wrapper = new DemoDataWrapper(realDataFn, demoDataFn);
  return () => wrapper.getData();
}

// Hook for demo-aware data fetching
export function useDemoData<T>(
  realDataFn: () => Promise<T> | T,
  demoDataFn: () => Promise<T> | T,
  dependencies: any[] = []
): T | null {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const wrapper = new DemoDataWrapper(realDataFn, demoDataFn);
        const result = await wrapper.getData();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return data;
}

// Utility functions for common data transformations
export const demoDataUtils = {
  /**
   * Creates a realistic variation of a number
   */
  varyNumber: (value: number, variance: number = 0.1): number => {
    const randomFactor = 1 + (Math.random() - 0.5) * variance;
    return Math.round(value * randomFactor * 100) / 100;
  },

  /**
   * Generates a realistic price trend
   */
  generatePriceTrend: (basePrice: number, days: number, volatility: number = 0.02): number[] => {
    const prices = [basePrice];
    let currentPrice = basePrice;

    for (let i = 1; i < days; i++) {
      const change = (Math.random() - 0.5) * volatility;
      currentPrice = Math.max(0.01, currentPrice * (1 + change));
      prices.push(Math.round(currentPrice * 100) / 100);
    }

    return prices;
  },

  /**
   * Creates realistic timestamps for demo data
   */
  generateTimestamps: (count: number, intervalHours: number = 24): string[] => {
    const timestamps = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const date = new Date(now.getTime() - (count - 1 - i) * intervalHours * 60 * 60 * 1000);
      timestamps.push(date.toISOString());
    }
    
    return timestamps;
  },

  /**
   * Formats currency values for demo display
   */
  formatDemoCurrency: (value: number, currency: string = 'USD'): string => {
    const { showRealisticNumbers } = useDemoModeStore.getState();
    
    if (!showRealisticNumbers) {
      // Use obvious test values
      return `${currency} ${Math.round(value)}`;
    }

    // Use realistic formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },

  /**
   * Creates realistic user data for demos
   */
  generateDemoUser: (id: string): any => {
    const { scenario } = useDemoModeStore.getState();
    
    const baseUser = {
      id,
      address: `neutron1demo${id.slice(-8)}`,
      verified: true,
      kycStatus: 'verified',
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    switch (scenario) {
      case 'investor_presentation':
        return {
          ...baseUser,
          name: 'Institutional Investor',
          type: 'institutional',
          totalInvested: demoDataUtils.varyNumber(500000),
          portfolioValue: demoDataUtils.varyNumber(625000),
        };
      
      case 'user_onboarding':
        return {
          ...baseUser,
          name: 'Demo User',
          type: 'individual',
          totalInvested: demoDataUtils.varyNumber(5000),
          portfolioValue: demoDataUtils.varyNumber(5250),
        };
        
      default:
        return baseUser;
    }
  }
};

export default {
  createDemoDataService,
  useDemoData,
  DemoDataWrapper,
  demoDataUtils
};