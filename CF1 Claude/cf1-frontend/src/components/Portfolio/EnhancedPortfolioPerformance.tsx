import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Target, Calendar, Download, Filter, ArrowUpRight, ArrowDownLeft, Zap, Award, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Area, AreaChart } from 'recharts';

interface PerformanceTabProps {
  className?: string;
}

const performanceMetrics = {
  totalReturn: 27.66,
  monthlyReturn: 8.34,
  annualizedReturn: 34.12,
  sharpeRatio: 1.84,
  maxDrawdown: -5.23,
  volatility: 18.45,
  alpha: 4.2,
  beta: 0.87
};

const performanceHistory = [
  { date: '2024-01', portfolio: 85000, benchmark: 84500, dividends: 450 },
  { date: '2024-02', portfolio: 88500, benchmark: 86200, dividends: 480 },
  { date: '2024-03', portfolio: 94200, benchmark: 89800, dividends: 520 },
  { date: '2024-04', portfolio: 101300, benchmark: 92100, dividends: 560 },
  { date: '2024-05', portfolio: 108750, benchmark: 95500, dividends: 590 },
  { date: '2024-06', portfolio: 118420, benchmark: 98200, dividends: 620 },
  { date: '2024-07', portfolio: 125680, benchmark: 101800, dividends: 650 }
];

const assetPerformance = [
  {
    name: 'Manhattan Premium Office Tower',
    type: 'Commercial Real Estate',
    return: 26.39,
    volatility: 12.3,
    sharpe: 2.14,
    allocation: 18.1,
    rating: 'A+',
    trend: 'up'
  },
  {
    name: 'Solar Energy Project Nevada',
    type: 'Renewable Energy',
    return: 26.14,
    volatility: 15.8,
    sharpe: 1.65,
    allocation: 15.1,
    rating: 'A',
    trend: 'up'
  },
  {
    name: 'Vintage Wine Collection Series A',
    type: 'Collectibles',
    return: 25.45,
    volatility: 22.1,
    sharpe: 1.15,
    allocation: 12.5,
    rating: 'B+',
    trend: 'up'
  },
  {
    name: 'Miami Beach Luxury Resort',
    type: 'Hospitality Real Estate',
    return: 18.59,
    volatility: 16.7,
    sharpe: 1.11,
    allocation: 11.3,
    rating: 'B+',
    trend: 'stable'
  },
  {
    name: 'Tesla Supercharger Network',
    type: 'Infrastructure',
    return: 15.23,
    volatility: 19.4,
    sharpe: 0.78,
    allocation: 9.6,
    rating: 'B',
    trend: 'down'
  }
];

const monthlyReturns = [
  { month: 'Jan', return: 4.2 },
  { month: 'Feb', return: 6.8 },
  { month: 'Mar', return: 8.1 },
  { month: 'Apr', return: 12.3 },
  { month: 'May', return: 9.7 },
  { month: 'Jun', return: 11.2 },
  { month: 'Jul', return: 8.9 }
];

const riskMetrics = [
  { metric: 'VaR (95%)', value: '-2.34%', status: 'good' },
  { metric: 'CVaR (95%)', value: '-3.78%', status: 'good' },
  { metric: 'Max Monthly Loss', value: '-1.23%', status: 'excellent' },
  { metric: 'Correlation to Market', value: '0.43', status: 'good' }
];

const formatPercent = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getRatingColor = (rating: string) => {
  if (rating.startsWith('A')) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
  if (rating.startsWith('B')) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
  return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': return 'text-green-600';
    case 'good': return 'text-blue-600';
    case 'warning': return 'text-yellow-600';
    case 'poor': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const EnhancedPortfolioPerformance: React.FC<PerformanceTabProps> = ({ className = '' }) => {
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');
  const [showBenchmark, setShowBenchmark] = useState(true);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <Award className="w-5 h-5 opacity-60" />
          </div>
          <div className="space-y-1">
            <p className="text-green-100 text-sm">Total Return</p>
            <p className="text-2xl font-bold">{formatPercent(performanceMetrics.totalReturn)}</p>
            <p className="text-green-100 text-sm">Since inception</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            <span className="text-blue-500 text-sm font-medium">Sharpe</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Sharpe Ratio</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {performanceMetrics.sharpeRatio}
            </p>
            <p className="text-blue-500 text-sm">Excellent risk-adjusted return</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <span className="text-orange-500 text-sm font-medium">Risk</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Max Drawdown</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPercent(performanceMetrics.maxDrawdown)}
            </p>
            <p className="text-orange-500 text-sm">Low risk exposure</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-purple-500" />
            <span className="text-purple-500 text-sm font-medium">Alpha</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Alpha Generation</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPercent(performanceMetrics.alpha)}
            </p>
            <p className="text-purple-500 text-sm">Outperforming market</p>
          </div>
        </motion.div>
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance vs Benchmark</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Portfolio performance compared to market benchmark</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showBenchmark}
                onChange={(e) => setShowBenchmark(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Show Benchmark</span>
            </label>
            
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    timeframe === period
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'dividends') return [`$${value}`, 'Monthly Dividends'];
                  return [formatCurrency(value), name === 'portfolio' ? 'Portfolio Value' : 'Benchmark'];
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="portfolio"
                fill="url(#portfolioGradient)"
                stroke="#3B82F6"
                strokeWidth={2}
              />
              {showBenchmark && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#6B7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
              <Bar
                yAxisId="right"
                dataKey="dividends"
                fill="#10B981"
                opacity={0.7}
                name="dividends"
              />
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Asset Performance and Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Performance</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Individual asset metrics</p>
            </div>
            <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="space-y-4">
            {assetPerformance.map((asset, index) => (
              <div
                key={asset.name}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {asset.name}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRatingColor(asset.rating)}`}>
                      {asset.rating}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {asset.type}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Return: </span>
                      <span className={`font-medium ${asset.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(asset.return)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sharpe: </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {asset.sharpe.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Allocation: </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {asset.allocation}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {asset.trend === 'up' ? (
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  ) : asset.trend === 'down' ? (
                    <ArrowDownLeft className="w-5 h-5 text-red-500" />
                  ) : (
                    <div className="w-5 h-5 bg-gray-400 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risk Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-6"
        >
          {/* Monthly Returns */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Returns</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Month-over-month performance</p>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReturns}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Monthly Return']}
                  />
                  <Bar
                    dataKey="return"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Portfolio risk metrics</p>
            </div>

            <div className="space-y-4">
              {riskMetrics.map((metric) => (
                <div key={metric.metric} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {metric.metric}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                      {metric.value}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      metric.status === 'excellent' ? 'bg-green-500' :
                      metric.status === 'good' ? 'bg-blue-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};