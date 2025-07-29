import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Building, Activity, RefreshCw, Download, BarChart3, PieChart, Database, Eye } from 'lucide-react';
import { AnalyticsFilter } from '../../types/analytics';
import { useAnalyticsData } from '../../services/analyticsDataService';
import { useDataMode } from '../../store/dataModeStore';
import { MetricCard } from './MetricCard';
import { ChartContainer } from './ChartContainer';
import { PerformanceChart } from './PerformanceChart';
import { AllocationChart } from './AllocationChart';
import { PlatformGrowthChart } from './PlatformGrowthChart';
import { PortfolioPerformance } from './PortfolioPerformance';
import { MarketIntelligence } from './MarketIntelligence';
import { DataExport } from './DataExport';
import { SkeletonCard } from '../Loading/Skeleton';

export const AnalyticsDashboard: React.FC = () => {
  // Data mode integration
  const { analytics, currentMode, isEmpty } = useAnalyticsData();
  const { isDemo } = useDataMode();
  
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'platform' | 'export'>('overview');
  const [activeFilter, setActiveFilter] = useState<AnalyticsFilter>({ 
    timeRange: '30d',
    assetTypes: [],
    riskLevels: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated] = useState<string>(new Date().toISOString());

  const handleTimeRangeChange = (timeRange: AnalyticsFilter['timeRange']) => {
    setActiveFilter({ 
      timeRange,
      assetTypes: [],
      riskLevels: []
    });
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate export
      const data = JSON.stringify(analytics, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cf1-analytics-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  const getTimeRangeLabel = (range: AnalyticsFilter['timeRange']) => {
    const labels = {
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days', 
      '30d': 'Last 30 Days',
      '90d': 'Last 3 Months',
      '1y': 'Last Year',
      'all': 'All Time'
    };
    return labels[range] || labels['30d'];
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Error Loading Analytics
        </h3>
        <p className="text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const platformMetrics = analytics;
  const userAnalytics = null; // Analytics service doesn't provide user analytics yet
  const marketInsights = null; // Analytics service doesn't provide market insights yet

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            {isDemo && (
              <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                <Eye className="w-4 h-4" />
                <span className="font-medium">DEMO MODE</span>
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {currentMode.toUpperCase()}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Platform performance and insights • {getTimeRangeLabel(activeFilter.timeRange)}
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={activeFilter.timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value as AnalyticsFilter['timeRange'])}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => setActiveTab('export')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'portfolio'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Portfolio</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('platform')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'platform'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4" />
              <span>Platform</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Export</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {isEmpty && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No analytics data available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {currentMode === 'production' 
                  ? "No live analytics data available yet. Switch to Demo mode to explore sample analytics."
                  : currentMode === 'development'
                    ? "No development analytics data created yet. Create proposals and investments to generate analytics data."
                    : "No demo analytics data available."
                }
              </p>
              {currentMode !== 'demo' && (
                <button
                  onClick={() => window.location.href = '/super-admin'}
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span>Switch to Demo Mode</span>
                </button>
              )}
            </div>
          )}
          
          {!isEmpty && (
            <>
              {/* Platform Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : platformMetrics ? (
                  <>
                    <MetricCard
                      title="Total Value Locked"
                      value={platformMetrics.platformMetrics.totalVolume}
                      change={5.2}
                      trend="up"
                      icon={<DollarSign className="w-6 h-6" />}
                      color="blue"
                    />
                    <MetricCard
                      title="Active Users"
                      value={formatNumber(platformMetrics.platformMetrics.totalUsers)}
                      change={8.1}
                      trend="up"
                      icon={<Users className="w-6 h-6" />}
                      color="green"
                    />
                    <MetricCard
                      title="Total Assets"
                      value={formatNumber(platformMetrics.platformMetrics.totalAssets)}
                      change={3.7}
                      trend="up"
                      icon={<Building className="w-6 h-6" />}
                      color="purple"
                    />
                    <MetricCard
                      title="Average APY"
                      value={platformMetrics.platformMetrics.avgAPY}
                      change={-0.3}
                      trend="down"
                      icon={<TrendingUp className="w-6 h-6" />}
                      color="orange"
                    />
                  </>
                ) : null}
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Growth Chart */}
                <ChartContainer
                  title="Platform Growth"
                  subtitle="Value Locked by Asset Category"
                  isLoading={isLoading}
                >
                  <PlatformGrowthChart
                    data={[
                      { category: 'Real Estate', value: 45.2, count: 12 },
                      { category: 'Renewable Energy', value: 28.7, count: 8 },
                      { category: 'Collectibles', value: 18.5, count: 6 },
                      { category: 'Infrastructure', value: 12.1, count: 4 },
                      { category: 'Technology', value: 8.9, count: 3 },
                      { category: 'Agriculture', value: 6.6, count: 2 }
                    ]}
                    height={300}
                  />
                </ChartContainer>

                {/* Portfolio Allocation */}
                <ChartContainer
                  title="Asset Allocation"
                  subtitle="Portfolio distribution by asset type"
                  isLoading={isLoading}
                >
                  <AllocationChart
                    data={[]}
                    height={300}
                  />
                </ChartContainer>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                  <>
                    <MetricCard
                      title="Daily Active Users"
                      value={formatNumber(Math.floor(platformMetrics?.platformMetrics.totalUsers * 0.3) || 0)}
                      change={2.1}
                      trend="up"
                      icon={<Activity className="w-6 h-6" />}
                      color="indigo"
                    />
                    <MetricCard
                      title="Monthly Volume"
                      value={platformMetrics?.platformMetrics.totalVolume || "$0"}
                      change={12.5}
                      trend="up"
                      icon={<TrendingUp className="w-6 h-6" />}
                      color="teal"
                    />
                    <MetricCard
                      title="Total Proposals"
                      value={formatNumber(platformMetrics?.platformMetrics.totalProposals || 0)}
                      change={6.8}
                      trend="up"
                      icon={<DollarSign className="w-6 h-6" />}
                      color="cyan"
                    />
                  </>
                )}
              </div>

              {/* Performance Insights - Commented out until user analytics service is available */}
              {/* {userAnalytics && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Portfolio Performance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(userAnalytics.portfolioValue)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(userAnalytics.totalReturns)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Returns</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatPercentage(userAnalytics.performanceMetrics.roi)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ROI</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {formatPercentage(userAnalytics.performanceMetrics.winRate * 100)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Top Performing Assets - Commented out until market insights service is available */}
              {/* {marketInsights?.topPerformingAssets && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Top Performing Assets
                  </h3>
                  <div className="space-y-4">
                    {marketInsights.topPerformingAssets.slice(0, 5).map((asset, index) => (
                      <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{asset.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{asset.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(asset.currentValue)}
                          </p>
                          <div className="flex items-center space-x-1">
                            {asset.changePercent > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm ${
                              asset.changePercent > 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                              {formatPercentage(Math.abs(asset.changePercent))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </>
          )}
        </>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && <PortfolioPerformance />}

      {/* Platform Tab */}
      {activeTab === 'platform' && <MarketIntelligence />}

      {/* Export Tab */}
      {activeTab === 'export' && <DataExport />}
    </div>
  );
};