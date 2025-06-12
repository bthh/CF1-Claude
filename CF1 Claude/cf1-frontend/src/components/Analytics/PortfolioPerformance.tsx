import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Calendar, DollarSign, Percent, Clock, AlertTriangle } from 'lucide-react';
import { useAnalytics, usePerformanceCalculations } from '../../hooks/useAnalytics';
import { MetricCard } from './MetricCard';
import { ChartContainer } from './ChartContainer';
import { PerformanceChart } from './PerformanceChart';
import { AllocationChart } from './AllocationChart';
import { TimeRangeSelector } from './TimeRangeSelector';
import { AnalyticsFilter } from '../../types/analytics';

interface PerformanceMetric {
  label: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  description: string;
  color: 'green' | 'red' | 'blue' | 'purple' | 'orange' | 'indigo' | 'teal' | 'cyan';
}

export const PortfolioPerformance: React.FC = () => {
  const { 
    dashboard, 
    isLoading, 
    activeFilter, 
    updateFilter, 
    formatCurrency, 
    formatPercentage,
    getTimeRangeLabel 
  } = useAnalytics();
  
  const { portfolioMetrics } = usePerformanceCalculations();
  
  const [selectedMetric, setSelectedMetric] = useState<'returns' | 'risk' | 'allocation'>('returns');

  const userAnalytics = dashboard?.userAnalytics;

  if (!userAnalytics || !portfolioMetrics) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Portfolio Analytics Unavailable
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet and make investments to view detailed performance analytics.
        </p>
      </div>
    );
  }

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Total Return',
      value: formatCurrency(portfolioMetrics.totalReturn),
      change: portfolioMetrics.totalReturnPercent,
      trend: portfolioMetrics.totalReturn > 0 ? 'up' : 'down',
      description: 'Absolute profit/loss from all investments',
      color: portfolioMetrics.totalReturn > 0 ? 'green' : 'red'
    },
    {
      label: 'Return on Investment',
      value: formatPercentage(portfolioMetrics.totalReturnPercent),
      change: portfolioMetrics.dailyChange,
      trend: portfolioMetrics.totalReturnPercent > 0 ? 'up' : 'down',
      description: 'Percentage return on total invested capital',
      color: portfolioMetrics.totalReturnPercent > 0 ? 'green' : 'red'
    },
    {
      label: 'Sharpe Ratio',
      value: portfolioMetrics.sharpeRatio.toFixed(2),
      description: 'Risk-adjusted return measurement',
      color: portfolioMetrics.sharpeRatio > 1 ? 'green' : portfolioMetrics.sharpeRatio > 0.5 ? 'orange' : 'red'
    },
    {
      label: 'Win Rate',
      value: formatPercentage(portfolioMetrics.winRate * 100),
      description: 'Percentage of profitable investments',
      color: portfolioMetrics.winRate > 0.6 ? 'green' : portfolioMetrics.winRate > 0.4 ? 'orange' : 'red'
    },
    {
      label: 'Average Hold Time',
      value: `${portfolioMetrics.averageHoldTime} days`,
      description: 'Average time holding investments',
      color: 'blue'
    },
    {
      label: 'Max Drawdown',
      value: formatPercentage(portfolioMetrics.maxDrawdown * 100),
      description: 'Largest peak-to-trough decline',
      color: portfolioMetrics.maxDrawdown < 0.1 ? 'green' : portfolioMetrics.maxDrawdown < 0.2 ? 'orange' : 'red'
    }
  ];

  const riskMetrics = [
    {
      label: 'Portfolio Volatility',
      value: formatPercentage(portfolioMetrics.volatility * 100),
      description: 'Standard deviation of returns',
      color: (portfolioMetrics.volatility < 0.15 ? 'green' : portfolioMetrics.volatility < 0.25 ? 'orange' : 'red') as 'green' | 'orange' | 'red'
    },
    {
      label: 'Diversification Score',
      value: formatPercentage(userAnalytics.diversificationScore * 100),
      description: 'How well-diversified your portfolio is',
      color: (userAnalytics.diversificationScore > 0.7 ? 'green' : userAnalytics.diversificationScore > 0.5 ? 'orange' : 'red') as 'green' | 'orange' | 'red'
    },
    {
      label: 'Win/Loss Ratio',
      value: portfolioMetrics.winLossRatio === Infinity ? '∞' : portfolioMetrics.winLossRatio.toFixed(2),
      description: 'Ratio of total gains to total losses',
      color: (portfolioMetrics.winLossRatio > 2 ? 'green' : portfolioMetrics.winLossRatio > 1 ? 'orange' : 'red') as 'green' | 'orange' | 'red'
    }
  ];

  const handleTimeRangeChange = (timeRange: AnalyticsFilter['timeRange']) => {
    updateFilter({ timeRange });
  };

  const getMetricIcon = (metric: PerformanceMetric) => {
    switch (metric.label) {
      case 'Total Return':
      case 'Return on Investment':
        return <DollarSign className="w-6 h-6" />;
      case 'Sharpe Ratio':
      case 'Win Rate':
        return <Target className="w-6 h-6" />;
      case 'Average Hold Time':
        return <Clock className="w-6 h-6" />;
      case 'Max Drawdown':
      case 'Portfolio Volatility':
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <Percent className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Performance</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed analytics for {getTimeRangeLabel(activeFilter.timeRange)}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <TimeRangeSelector
            selected={activeFilter.timeRange}
            onChange={handleTimeRangeChange}
          />
          
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setSelectedMetric('returns')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                selectedMetric === 'returns'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Returns
            </button>
            <button
              onClick={() => setSelectedMetric('risk')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                selectedMetric === 'risk'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Risk
            </button>
            <button
              onClick={() => setSelectedMetric('allocation')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                selectedMetric === 'allocation'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Allocation
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(userAnalytics.portfolioValue)}
          change={portfolioMetrics.totalReturnPercent}
          trend={portfolioMetrics.totalReturn > 0 ? 'up' : 'down'}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
          subtitle="Total current value"
        />
        <MetricCard
          title="Total Invested"
          value={formatCurrency(userAnalytics.totalInvested)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          subtitle="Capital deployed"
        />
        <MetricCard
          title="Active Investments"
          value={userAnalytics.activeInvestments.toString()}
          icon={<Target className="w-6 h-6" />}
          color="green"
          subtitle="Current positions"
        />
        <MetricCard
          title="Risk Profile"
          value={userAnalytics.riskProfile.charAt(0).toUpperCase() + userAnalytics.riskProfile.slice(1)}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="orange"
          subtitle="Investment approach"
        />
      </div>

      {/* Performance Metrics */}
      {selectedMetric === 'returns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performanceMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.label}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              icon={getMetricIcon(metric)}
              color={metric.color}
              subtitle={metric.description}
            />
          ))}
        </div>
      )}

      {selectedMetric === 'risk' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {riskMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.label}
              value={metric.value}
              icon={getMetricIcon(metric)}
              color={metric.color}
              subtitle={metric.description}
            />
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <ChartContainer
          title="Portfolio Performance"
          subtitle="Value progression over time"
          isLoading={isLoading}
        >
          <PerformanceChart
            data={userAnalytics.investmentHistory.map(item => ({
              name: item.label || new Date(item.timestamp).toLocaleDateString(),
              value: item.value,
              timestamp: item.timestamp
            }))}
            height={300}
            color="#10b981"
            formatValue={(value) => formatCurrency(value)}
          />
        </ChartContainer>

        {/* Asset Allocation */}
        <ChartContainer
          title="Asset Allocation"
          subtitle="Current portfolio distribution"
          isLoading={isLoading}
        >
          <AllocationChart
            data={userAnalytics.assetAllocation}
            height={300}
            showLegend={true}
          />
        </ChartContainer>
      </div>

      {/* Performance Insights */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Strong Performance</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your portfolio is outperforming the market average with a {formatPercentage(portfolioMetrics.totalReturnPercent)} return.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Risk Management</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your Sharpe ratio of {portfolioMetrics.sharpeRatio.toFixed(2)} indicates {portfolioMetrics.sharpeRatio > 1 ? 'excellent' : 'good'} risk-adjusted returns.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Percent className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Diversification</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Portfolio is {userAnalytics.diversificationScore > 0.7 ? 'well' : 'moderately'} diversified across {userAnalytics.assetAllocation.length} asset classes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Investment Horizon</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Average holding period of {portfolioMetrics.averageHoldTime} days suggests a {portfolioMetrics.averageHoldTime > 365 ? 'long-term' : 'medium-term'} investment strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};