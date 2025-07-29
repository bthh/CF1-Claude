import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Activity, Target, Calendar, Eye, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

interface PortfolioOverviewProps {
  className?: string;
}

const portfolioData = {
  totalValue: 125680.50,
  totalInvested: 98450.00,
  totalGains: 27230.50,
  totalGainsPercent: 27.66,
  totalDividends: 3420.75,
  totalDividendsYield: 3.47,
  assetsCount: 8,
  monthlyGrowth: 8.34,
  yearlyGrowth: 34.12
};

const assetAllocation = [
  { name: 'Real Estate', value: 45680.50, percentage: 36.3, color: '#3B82F6' },
  { name: 'Renewable Energy', value: 28950.75, percentage: 23.0, color: '#10B981' },
  { name: 'Collectibles', value: 22340.25, percentage: 17.8, color: '#F59E0B' },
  { name: 'Infrastructure', value: 18720.00, percentage: 14.9, color: '#8B5CF6' },
  { name: 'Natural Resources', value: 9989.00, percentage: 8.0, color: '#EF4444' }
];

const performanceData = [
  { month: 'Jan', value: 85000, target: 90000 },
  { month: 'Feb', value: 88500, target: 92000 },
  { month: 'Mar', value: 94200, target: 95000 },
  { month: 'Apr', value: 101300, target: 98000 },
  { month: 'May', value: 108750, target: 102000 },
  { month: 'Jun', value: 118420, target: 106000 },
  { month: 'Jul', value: 125680, target: 110000 }
];

const topAssets = [
  {
    id: 'manhattan_office',
    name: 'Manhattan Premium Office Tower',
    type: 'Commercial Real Estate',
    value: 22750.00,
    invested: 18000.00,
    gain: 4750.00,
    gainPercent: 26.39,
    tokens: 73,
    dividend: 156.50,
    performance: 'excellent'
  },
  {
    id: 'solar_nevada',
    name: 'Solar Energy Project Nevada',
    type: 'Renewable Energy',
    value: 18920.50,
    invested: 15000.00,
    gain: 3920.50,
    gainPercent: 26.14,
    tokens: 147,
    dividend: 124.30,
    performance: 'excellent'
  },
  {
    id: 'vintage_wine',
    name: 'Vintage Wine Collection Series A',
    type: 'Collectibles',
    value: 15680.75,
    invested: 12500.00,
    gain: 3180.75,
    gainPercent: 25.45,
    tokens: 18,
    dividend: 0,
    performance: 'good'
  },
  {
    id: 'miami_resort',
    name: 'Miami Beach Luxury Resort',
    type: 'Hospitality Real Estate',
    value: 14230.25,
    invested: 12000.00,
    gain: 2230.25,
    gainPercent: 18.59,
    tokens: 68,
    dividend: 89.75,
    performance: 'good'
  }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatPercent = (percent: number) => {
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
};

export const EnhancedPortfolioOverview: React.FC<PortfolioOverviewProps> = ({ className = '' }) => {
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5 opacity-60" />
          </div>
          <div className="space-y-1">
            <p className="text-blue-100 text-sm">Total Portfolio Value</p>
            <p className="text-2xl font-bold">{formatCurrency(portfolioData.totalValue)}</p>
            <p className="text-blue-100 text-sm">
              {formatPercent(portfolioData.totalGainsPercent)} all time
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <ArrowUpRight className="w-8 h-8 text-green-500" />
            <span className="text-green-500 text-sm font-medium">Gains</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Gains</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolioData.totalGains)}
            </p>
            <p className="text-green-500 text-sm">
              {formatPercent(portfolioData.monthlyGrowth)} this month
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-purple-500" />
            <span className="text-purple-500 text-sm font-medium">Dividends</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Dividends</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolioData.totalDividends)}
            </p>
            <p className="text-purple-500 text-sm">
              {portfolioData.totalDividendsYield}% yield
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <PieChart className="w-8 h-8 text-orange-500" />
            <span className="text-orange-500 text-sm font-medium">Assets</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Portfolio Assets</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {portfolioData.assetsCount}
            </p>
            <p className="text-orange-500 text-sm">
              Across 5 categories
            </p>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Performance</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Value vs Target</p>
            </div>
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {['1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period as any)}
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

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'value' ? 'Portfolio Value' : 'Target'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#6B7280"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Asset Allocation Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Allocation</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Distribution across asset types</p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex-1 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={assetAllocation}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Value']}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {assetAllocation.map((item) => (
                <div key={item.name} className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.percentage}% • {formatCurrency(item.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Performing Assets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Assets</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Your best investments by performance</p>
          </div>
          <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300">
            <Eye className="w-4 h-4" />
            <span>View All</span>
          </button>
        </div>

        <div className="space-y-4">
          {topAssets.map((asset, index) => (
            <div
              key={asset.id}
              className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  #{index + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {asset.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {asset.type} • {asset.tokens} tokens
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(asset.value)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${asset.gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(asset.gainPercent)}
                      </span>
                      {asset.gain >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Invested: {formatCurrency(asset.invested)}</span>
                  <span>Dividend: {formatCurrency(asset.dividend)}</span>
                </div>

                {/* Performance Bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        asset.performance === 'excellent'
                          ? 'bg-green-500'
                          : asset.performance === 'good'
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{
                        width: `${asset.performance === 'excellent' ? 85 : asset.performance === 'good' ? 65 : 45}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};