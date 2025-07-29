import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Building, Activity,
  RefreshCw, Download, BarChart3, PieChart, Database, Zap, Target,
  AlertTriangle, CheckCircle, Clock, Globe, LineChart, Brain,
  Filter, Calendar, Eye, Settings, ChevronDown, ChevronUp,
  ArrowUp, ArrowDown, Minus, Sparkles, Shield, Award
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { AnalyticsFilter } from '../../types/analytics';
import { MetricCard } from './MetricCard';
import { ChartContainer } from './ChartContainer';
import { PerformanceChart } from './PerformanceChart';
import { AllocationChart } from './AllocationChart';
import { TimeRangeSelector } from './TimeRangeSelector';
import { SkeletonCard } from '../Loading/Skeleton';

interface AdvancedMetric {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  changeDirection: 'up' | 'down' | 'neutral';
  trend: number[];
  format: 'currency' | 'percentage' | 'number' | 'duration';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  target?: number;
  benchmark?: number;
  category: 'performance' | 'risk' | 'liquidity' | 'growth' | 'compliance';
}

interface PredictiveInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  actionable: boolean;
  priority: number;
}

interface RealTimeEvent {
  id: string;
  timestamp: string;
  type: 'transaction' | 'proposal' | 'market' | 'compliance' | 'system';
  title: string;
  description: string;
  value?: number;
  status: 'success' | 'warning' | 'error' | 'info';
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const {
    dashboard,
    isLoading,
    error,
    lastUpdated,
    activeFilter,
    updateFilter,
    refreshData,
    formatCurrency,
    formatPercentage,
    formatNumber
  } = useAnalytics();

  const { checkForUpdates, simulateChange } = useRealTimeUpdates();
  
  // Mock real-time events for the analytics dashboard
  const realTimeEvents = [
    {
      id: 'event_1',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      type: 'transaction' as const,
      title: 'Large Investment',
      description: 'Solar Energy Project received $250K investment',
      value: 250000,
      status: 'success' as const
    }
  ];
  const isConnected = true;

  const [activeView, setActiveView] = useState<'overview' | 'deep-dive' | 'predictive' | 'real-time'>('overview');
  const [selectedMetricCategory, setSelectedMetricCategory] = useState<'all' | 'performance' | 'risk' | 'liquidity' | 'growth' | 'compliance'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  // Generate advanced metrics with real-time data and predictions
  const advancedMetrics: AdvancedMetric[] = useMemo(() => [
    {
      id: 'total_value_locked',
      label: 'Total Value Locked',
      value: formatCurrency(dashboard?.platformMetrics?.totalValueLocked || 0),
      previousValue: dashboard?.platformMetrics?.totalValueLocked ? dashboard.platformMetrics.totalValueLocked * 0.95 : 0,
      change: 5.2,
      changeDirection: 'up',
      trend: [85, 87, 89, 92, 95, 100],
      format: 'currency',
      status: 'excellent',
      target: (dashboard?.platformMetrics?.totalValueLocked || 0) * 1.1,
      benchmark: 50000000,
      category: 'performance'
    },
    {
      id: 'active_proposals',
      label: 'Active Proposals',
      value: dashboard?.governanceAnalytics?.activeProposals || 0,
      previousValue: (dashboard?.governanceAnalytics?.activeProposals || 0) - 3,
      change: 12.5,
      changeDirection: 'up',
      trend: [45, 47, 44, 48, 52, 56],
      format: 'number',
      status: 'good',
      target: 75,
      benchmark: 50,
      category: 'growth'
    },
    {
      id: 'avg_funding_time',
      label: 'Avg Funding Time',
      value: '28 days',
      previousValue: 32,
      change: -12.5,
      changeDirection: 'up', // Lower is better for funding time
      trend: [35, 33, 31, 30, 29, 28],
      format: 'duration',
      status: 'excellent',
      target: 25,
      benchmark: 30,
      category: 'performance'
    },
    {
      id: 'success_rate',
      label: 'Funding Success Rate',
      value: formatPercentage(0.847),
      previousValue: 0.821,
      change: 2.6,
      changeDirection: 'up',
      trend: [78, 81, 83, 84, 85, 84.7],
      format: 'percentage',
      status: 'excellent',
      target: 0.9,
      benchmark: 0.75,
      category: 'performance'
    },
    {
      id: 'risk_score',
      label: 'Platform Risk Score',
      value: formatPercentage(0.12),
      previousValue: 0.15,
      change: -20,
      changeDirection: 'up', // Lower risk is better
      trend: [18, 16, 14, 13, 13, 12],
      format: 'percentage',
      status: 'good',
      target: 0.1,
      benchmark: 0.2,
      category: 'risk'
    },
    {
      id: 'liquidity_ratio',
      label: 'Liquidity Ratio',
      value: formatPercentage(0.23),
      previousValue: 0.19,
      change: 21.1,
      changeDirection: 'up',
      trend: [18, 19, 20, 21, 22, 23],
      format: 'percentage',
      status: 'good',
      target: 0.25,
      benchmark: 0.2,
      category: 'liquidity'
    },
    {
      id: 'compliance_score',
      label: 'Compliance Score',
      value: formatPercentage(0.96),
      previousValue: 0.94,
      change: 2.1,
      changeDirection: 'up',
      trend: [92, 93, 94, 95, 95, 96],
      format: 'percentage',
      status: 'excellent',
      target: 0.98,
      benchmark: 0.9,
      category: 'compliance'
    },
    {
      id: 'investor_retention',
      label: 'Investor Retention',
      value: formatPercentage(0.78),
      previousValue: 0.75,
      change: 4.0,
      changeDirection: 'up',
      trend: [72, 74, 75, 76, 77, 78],
      format: 'percentage',
      status: 'good',
      target: 0.85,
      benchmark: 0.7,
      category: 'growth'
    }
  ], [dashboard, formatCurrency, formatPercentage]);

  // Generate predictive insights using AI-like analysis
  const predictiveInsights: PredictiveInsight[] = useMemo(() => [
    {
      id: 'growth_prediction',
      type: 'prediction',
      title: 'Platform Growth Acceleration',
      description: 'Based on current trends, expect 35% growth in TVL over next quarter driven by renewable energy sector demand.',
      confidence: 87,
      impact: 'high',
      timeframe: '3 months',
      actionable: true,
      priority: 1
    },
    {
      id: 'market_opportunity',
      type: 'opportunity',
      title: 'Real Estate Market Opportunity',
      description: 'Commercial real estate tokenization shows 40% higher success rates. Consider targeted marketing campaign.',
      confidence: 73,
      impact: 'medium',
      timeframe: '6 weeks',
      actionable: true,
      priority: 2
    },
    {
      id: 'risk_alert',
      type: 'alert',
      title: 'Concentration Risk Warning',
      description: 'Technology sector now represents 45% of platform TVL. Diversification recommended to reduce sector risk.',
      confidence: 91,
      impact: 'medium',
      timeframe: 'Immediate',
      actionable: true,
      priority: 3
    },
    {
      id: 'optimization_rec',
      type: 'recommendation',
      title: 'Funding Process Optimization',
      description: 'Implementing automated compliance checks could reduce average funding time by 15% and improve success rates.',
      confidence: 82,
      impact: 'high',
      timeframe: '2 months',
      actionable: true,
      priority: 4
    }
  ], []);

  // Generate real-time events simulation
  const simulatedRealTimeEvents: RealTimeEvent[] = useMemo(() => [
    {
      id: 'event_1',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      type: 'transaction',
      title: 'Large Investment',
      description: 'Solar Energy Project received $250K investment',
      value: 250000,
      status: 'success'
    },
    {
      id: 'event_2',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      type: 'proposal',
      title: 'New Proposal Submitted',
      description: 'Commercial Real Estate - Downtown Office Complex',
      status: 'info'
    },
    {
      id: 'event_3',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      type: 'compliance',
      title: 'Compliance Check Passed',
      description: 'Wind Farm Project passed automated SEC compliance review',
      status: 'success'
    },
    {
      id: 'event_4',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      type: 'market',
      title: 'Market Movement',
      description: 'Renewable energy sector up 3.2% today',
      status: 'success'
    }
  ], []);

  const filteredMetrics = selectedMetricCategory === 'all' 
    ? advancedMetrics 
    : advancedMetrics.filter(metric => metric.category === selectedMetricCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getChangeIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading && !dashboard) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              Advanced Analytics
              <Sparkles className="w-5 h-5 ml-2 text-yellow-500" />
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Real-time connected' : 'Offline mode'}</span>
              </div>
              <span>Last updated: {formatTimestamp(lastUpdated || new Date().toISOString())}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh:</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-10 h-6 rounded-full transition-colors ${
                autoRefresh ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                autoRefresh ? 'translate-x-5' : 'translate-x-1'
              }`}></div>
            </button>
          </div>
          
          <button
            onClick={() => refreshData()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'deep-dive', label: 'Deep Dive', icon: Database },
          { id: 'predictive', label: 'AI Insights', icon: Brain },
          { id: 'real-time', label: 'Live Feed', icon: Activity }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === tab.id
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Metric Category Filter */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
            <select
              value={selectedMetricCategory}
              onChange={(e) => setSelectedMetricCategory(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Metrics</option>
              <option value="performance">Performance</option>
              <option value="risk">Risk Management</option>
              <option value="liquidity">Liquidity</option>
              <option value="growth">Growth</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>

          {/* Advanced Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMetrics.map((metric) => (
              <div
                key={metric.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(metric.changeDirection)}
                      <span className={`text-sm font-medium ${
                        metric.changeDirection === 'up' ? 'text-green-600' : 
                        metric.changeDirection === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.change?.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Mini trend chart */}
                  <div className="flex items-end space-x-1 h-8">
                    {metric.trend.map((value, index) => (
                      <div
                        key={index}
                        className="bg-blue-500 rounded-sm flex-1"
                        style={{ height: `${(value / Math.max(...metric.trend)) * 100}%` }}
                      ></div>
                    ))}
                  </div>

                  {/* Target progress */}
                  {metric.target && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Target</span>
                        <span>{typeof metric.target === 'number' ? formatNumber(metric.target) : metric.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, ((typeof metric.value === 'number' ? metric.value : 0) / (metric.target || 1)) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Platform Performance Trends" subtitle="TVL and Activity Over Time">
              <PerformanceChart 
                data={[
                  { name: 'Jan', value: 45 },
                  { name: 'Feb', value: 52 },
                  { name: 'Mar', value: 48 },
                  { name: 'Apr', value: 61 },
                  { name: 'May', value: 55 },
                  { name: 'Jun', value: 67 }
                ]}
              />
            </ChartContainer>

            <ChartContainer title="Asset Allocation" subtitle="Distribution by Asset Type">
              <AllocationChart 
                data={dashboard?.userAnalytics?.assetAllocation?.map(allocation => ({
                  name: allocation.name,
                  value: allocation.value,
                  color: allocation.name === 'Real Estate' ? '#3b82f6' :
                         allocation.name === 'Technology' ? '#10b981' :
                         allocation.name === 'Renewable Energy' ? '#f59e0b' : '#8b5cf6'
                })) || [
                  { name: 'Real Estate', value: 45000, color: '#3b82f6' },
                  { name: 'Technology', value: 35000, color: '#10b981' },
                  { name: 'Renewable Energy', value: 25000, color: '#f59e0b' },
                  { name: 'Healthcare', value: 20000, color: '#8b5cf6' }
                ]}
              />
            </ChartContainer>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeView === 'predictive' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                AI-Powered Insights & Predictions
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced analytics powered by machine learning to predict trends, identify opportunities, and recommend optimizations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictiveInsights.map((insight) => (
              <div
                key={insight.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {insight.type === 'prediction' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                    {insight.type === 'recommendation' && <Target className="w-5 h-5 text-green-600" />}
                    {insight.type === 'alert' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                    {insight.type === 'opportunity' && <Sparkles className="w-5 h-5 text-purple-600" />}
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                      {insight.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {insight.impact} impact
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {insight.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {insight.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Confidence: {insight.confidence}%</span>
                    <span>Timeframe: {insight.timeframe}</span>
                  </div>
                  {insight.actionable && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Take Action
                    </button>
                  )}
                </div>

                {/* Confidence meter */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Confidence Level</span>
                    <span>{insight.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        insight.confidence >= 80 ? 'bg-green-600' :
                        insight.confidence >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${insight.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Tab */}
      {activeView === 'real-time' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Live Activity Feed
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {simulatedRealTimeEvents.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      event.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                      event.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                      event.status === 'error' ? 'bg-red-100 dark:bg-red-900/20' :
                      'bg-blue-100 dark:bg-blue-900/20'
                    }`}>
                      {event.type === 'transaction' && <DollarSign className={`w-5 h-5 ${
                        event.status === 'success' ? 'text-green-600' : 'text-gray-600'
                      }`} />}
                      {event.type === 'proposal' && <Building className="w-5 h-5 text-blue-600" />}
                      {event.type === 'compliance' && <Shield className="w-5 h-5 text-green-600" />}
                      {event.type === 'market' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                      {event.type === 'system' && <Settings className="w-5 h-5 text-gray-600" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {event.description}
                      </p>
                      {event.value && (
                        <p className="text-sm font-medium text-green-600 mt-2">
                          {formatCurrency(event.value)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};