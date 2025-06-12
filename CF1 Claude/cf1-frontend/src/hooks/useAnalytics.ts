import { useEffect, useCallback } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import { AnalyticsFilter, ExportOptions } from '../types/analytics';

/**
 * Custom hook for analytics data management
 * Provides easy access to analytics state and actions
 */
export const useAnalytics = () => {
  const {
    // State
    dashboard,
    isLoading,
    error,
    lastUpdated,
    platformMetrics,
    marketData,
    assetPerformances,
    activeFilter,
    preferences,
    
    // Actions
    setDashboard,
    updatePlatformMetrics,
    updateMarketData,
    updateAssetPerformances,
    setFilter,
    updatePreferences,
    setLoading,
    setError,
    clearError,
    fetchDashboardData,
    refreshData,
    exportData,
    addAlertRule,
    updateAlertRule,
    removeAlertRule,
    checkAlerts
  } = useAnalyticsStore();

  // Auto-refresh data based on preferences
  useEffect(() => {
    if (preferences.refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshData();
        checkAlerts();
      }, preferences.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [preferences.refreshInterval, refreshData, checkAlerts]);

  // Initial data fetch
  useEffect(() => {
    if (!dashboard) {
      fetchDashboardData();
    }
  }, [dashboard, fetchDashboardData]);

  // Filter change handler
  const updateFilter = useCallback((newFilter: Partial<AnalyticsFilter>) => {
    setFilter(newFilter);
    fetchDashboardData({ ...activeFilter, ...newFilter });
  }, [activeFilter, setFilter, fetchDashboardData]);

  // Export handler with loading state
  const handleExport = useCallback(async (options: ExportOptions) => {
    setLoading(true);
    try {
      const blob = await exportData(options);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cf1-analytics-${Date.now()}.${options.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Export failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [exportData, setLoading, setError]);

  // Utility functions for common calculations
  const getMetricChange = useCallback((current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, []);

  const formatCurrency = useCallback((amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  }, []);

  const formatNumber = useCallback((value: number, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }, []);

  // Quick access to specific metrics
  const getTopPerformingAssets = useCallback((limit = 5) => {
    return dashboard?.marketInsights.topPerformingAssets.slice(0, limit) || [];
  }, [dashboard]);

  const getTotalPortfolioValue = useCallback(() => {
    return dashboard?.userAnalytics.portfolioValue || 0;
  }, [dashboard]);

  const getTotalReturns = useCallback(() => {
    return dashboard?.userAnalytics.totalReturns || 0;
  }, [dashboard]);

  const getPortfolioROI = useCallback(() => {
    const analytics = dashboard?.userAnalytics;
    if (!analytics || analytics.totalInvested === 0) return 0;
    return ((analytics.portfolioValue - analytics.totalInvested) / analytics.totalInvested) * 100;
  }, [dashboard]);

  // Data transformation helpers
  const getChartData = useCallback((dataKey: keyof typeof dashboard) => {
    if (!dashboard) return [];
    
    const data = dashboard[dataKey];
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  }, [dashboard]);

  const getTimeRangeLabel = useCallback((range: AnalyticsFilter['timeRange']) => {
    const labels = {
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 3 Months',
      '1y': 'Last Year',
      'all': 'All Time'
    };
    return labels[range] || labels['30d'];
  }, []);

  return {
    // State
    dashboard,
    isLoading,
    error,
    lastUpdated,
    platformMetrics,
    marketData,
    assetPerformances,
    activeFilter,
    preferences,
    
    // Actions
    updateFilter,
    updatePreferences,
    refreshData,
    handleExport,
    clearError,
    
    // Alert Management
    addAlertRule,
    updateAlertRule,
    removeAlertRule,
    checkAlerts,
    
    // Utility Functions
    getMetricChange,
    formatCurrency,
    formatPercentage,
    formatNumber,
    
    // Quick Access
    getTopPerformingAssets,
    getTotalPortfolioValue,
    getTotalReturns,
    getPortfolioROI,
    getChartData,
    getTimeRangeLabel,
    
    // Computed Values
    hasData: !!dashboard,
    isStale: lastUpdated ? (Date.now() - new Date(lastUpdated).getTime()) > preferences.refreshInterval * 2 : false,
    totalAssets: dashboard?.platformMetrics.totalAssets || 0,
    totalUsers: dashboard?.platformMetrics.totalUsers || 0,
    totalValueLocked: dashboard?.platformMetrics.totalValueLocked || 0,
    averageAPY: dashboard?.platformMetrics.averageAPY || 0
  };
};

/**
 * Hook for specific metric tracking with real-time updates
 */
export const useMetricTracker = (metricKey: string, alertThreshold?: number) => {
  const { platformMetrics, addAlertRule, checkAlerts } = useAnalytics();
  
  const currentValue = platformMetrics ? (platformMetrics as any)[metricKey] : null;
  
  useEffect(() => {
    if (alertThreshold && currentValue !== null) {
      // Auto-create alert rule if threshold is provided
      addAlertRule({
        name: `Auto Alert: ${metricKey}`,
        metric: metricKey,
        condition: 'above',
        threshold: alertThreshold,
        enabled: true,
        notification: {
          email: false,
          push: true,
          sms: false
        }
      });
    }
  }, [metricKey, alertThreshold, currentValue, addAlertRule]);

  useEffect(() => {
    checkAlerts();
  }, [currentValue, checkAlerts]);

  return {
    value: currentValue,
    isAboveThreshold: alertThreshold ? currentValue > alertThreshold : false,
    threshold: alertThreshold
  };
};

/**
 * Hook for performance calculations
 */
export const usePerformanceCalculations = () => {
  const { dashboard } = useAnalytics();
  
  const calculatePortfolioMetrics = useCallback(() => {
    const userAnalytics = dashboard?.userAnalytics;
    if (!userAnalytics) return null;
    
    const { portfolioValue, totalInvested, performanceMetrics } = userAnalytics;
    
    return {
      totalReturn: portfolioValue - totalInvested,
      totalReturnPercent: totalInvested > 0 ? ((portfolioValue - totalInvested) / totalInvested) * 100 : 0,
      dailyChange: performanceMetrics.roi / 365, // Approximate daily change
      winLossRatio: performanceMetrics.totalLosses > 0 ? performanceMetrics.totalGains / performanceMetrics.totalLosses : Infinity,
      ...performanceMetrics
    };
  }, [dashboard]);
  
  return {
    portfolioMetrics: calculatePortfolioMetrics(),
    calculatePortfolioMetrics
  };
};