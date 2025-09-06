import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Gift, Target, Calendar, Eye, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useEnhancedPortfolioData } from '../../services/demoPortfolioData';
import { useRewardsStore } from '../../store/rewardsStore';
import { getAssetImage } from '../../utils/assetImageUtils';
import AllTiersModal from './AllTiersModal';

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

// Static performance data to avoid glitching
const performanceData = [
  { month: 'Jan', value: 85000, target: 90000, dividends: 245.50, monthlyIncrease: 3500 },
  { month: 'Feb', value: 88500, target: 92000, dividends: 278.30, monthlyIncrease: 3500 },
  { month: 'Mar', value: 94200, target: 95000, dividends: 312.75, monthlyIncrease: 5700 },
  { month: 'Apr', value: 101300, target: 98000, dividends: 356.20, monthlyIncrease: 7100 },
  { month: 'May', value: 108750, target: 102000, dividends: 398.45, monthlyIncrease: 7450 },
  { month: 'Jun', value: 118420, target: 106000, dividends: 445.80, monthlyIncrease: 9670 },
  { month: 'Jul', value: 125680, target: 110000, dividends: 492.25, monthlyIncrease: 7260 }
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
  const [selectedAssetForTiers, setSelectedAssetForTiers] = useState<{id: string, name: string, tokens: number} | null>(null);
  
  // Get enhanced portfolio data with tier information
  const { assets, summary } = useEnhancedPortfolioData();
  
  // Get rewards data from the rewards store with error handling
  const { totalRewardsEarned = 0, totalMonthlyRewards = 0 } = useRewardsStore();
  
  // Parse portfolio data from the new service (memoized to prevent re-renders)
  const portfolioData = React.useMemo(() => {
    if (!summary || assets.length === 0) {
      return {
        totalValue: 0,
        totalInvested: 0,
        totalGains: 0,
        totalGainsPercent: 0,
        totalRewards: 0,
        totalRewardsYield: 0,
        monthlyRewards: 0,
        assetsCount: 0,
        monthlyGrowth: 0,
        yearlyGrowth: 0
      };
    }

    const totalValue = parseFloat(summary.totalValue.replace(/[$,]/g, '')) || 0;
    const totalInvested = parseFloat(summary.totalInvested.replace(/[$,]/g, '')) || 0;
    const totalGains = parseFloat(summary.totalGain.replace(/[$,+]/g, '')) || 0;
    const totalGainsPercent = parseFloat(summary.totalGainPercent.replace(/[%+]/g, '')) || 0;

    // Calculate rewards yield as percentage of total value
    const rewardsYield = totalValue > 0 ? (totalRewardsEarned / totalValue * 100) : 0;

    return {
      totalValue,
      totalInvested,
      totalGains,
      totalGainsPercent,
      totalRewards: totalRewardsEarned,
      totalRewardsYield: rewardsYield,
      monthlyRewards: totalMonthlyRewards,
      assetsCount: assets.length,
      monthlyGrowth: 8.34,
      yearlyGrowth: 34.12
    };
  }, [summary, assets.length, totalRewardsEarned, totalMonthlyRewards]);
  
  // Convert assets to allocation data (memoized)
  const assetAllocation = React.useMemo(() => {
    if (!assets.length || portfolioData.totalValue === 0) return [];
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
    return assets.reduce((acc, asset, index) => {
      const value = parseFloat(asset.currentValue.replace(/[$,]/g, '')) || 0;
      if (value > 0) {
        acc.push({
          name: asset.type,
          value: value,
          percentage: (value / portfolioData.totalValue * 100),
          color: colors[index % colors.length]
        });
      }
      return acc;
    }, [] as any[]);
  }, [assets, portfolioData.totalValue]);
  
  // Get first 5 assets for display (memoized)
  const displayAssets = React.useMemo(() => {
    if (!assets.length) return [];
    
    return assets
      .map(asset => ({
        ...asset,
        value: parseFloat(asset.currentValue.replace(/[$,]/g, '')) || 0,
        invested: parseFloat(asset.purchaseValue.replace(/[$,]/g, '')) || 0,
        gain: parseFloat(asset.change.replace(/[$,+]/g, '')) || 0,
        gainPercent: parseFloat(asset.changePercent.replace(/[%+]/g, '')) || 0,
        performance: asset.isPositive ? (parseFloat(asset.changePercent.replace(/[%+]/g, '')) > 20 ? 'excellent' : 'good') : 'poor',
        // Use consistent asset images across the platform with error handling
        imageUrl: asset.imageUrl || (function() {
          try {
            return getAssetImage(asset.id || asset.name, asset.type);
          } catch (error) {
            console.warn('Error getting asset image:', error);
            return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=300&fit=crop';
          }
        })()
      }))
      .slice(0, 5); // Show first 5 assets
  }, [assets]);

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
            <Gift className="w-8 h-8 text-purple-500" />
            <span className="text-purple-500 text-sm font-medium">Rewards</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Rewards</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolioData.totalRewards)}
            </p>
            <p className="text-purple-500 text-sm">
              {portfolioData.totalRewardsYield.toFixed(2)}% yield
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
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
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
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'value' ? 'Portfolio Value' : 
                    name === 'target' ? 'Target' :
                    name === 'dividends' ? 'Monthly Dividends' : 
                    'Monthly Increase'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
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
                <Area
                  type="monotone"
                  dataKey="dividends"
                  stroke="#A855F7"
                  strokeWidth={1}
                  fill="transparent"
                  yAxisId="right"
                />
                <Area
                  type="monotone"
                  dataKey="monthlyIncrease"
                  stroke="#10B981"
                  strokeWidth={1}
                  fill="transparent"
                  yAxisId="right"
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

      {/* Your Assets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Assets</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">All your tokenized asset investments</p>
          </div>
          <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300">
            <Eye className="w-4 h-4" />
            <span>View All ({assets.length})</span>
          </button>
        </div>

        <div className="space-y-4">
          {displayAssets.map((asset, index) => (
            <div
              key={asset.id}
              className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => setSelectedAssetForTiers({id: asset.id, name: asset.name, tokens: asset.tokens})}
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img 
                    src={asset.imageUrl} 
                    alt={asset.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.className = "w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold";
                        parent.innerHTML = `#${index + 1}`;
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {asset.name}
                      </p>
                      {asset.userTier && (
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: asset.userTier.colorScheme?.primary || '#F3F4F6',
                            color: asset.userTier.colorScheme?.secondary || '#6B7280'
                          }}
                        >
                          {asset.userTier.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {asset.type} • {asset.tokens} tokens
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {asset.currentValue}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${asset.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {asset.changePercent}
                      </span>
                      {asset.isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Invested: {asset.purchaseValue}</span>
                  {asset.userTier?.rewards[0] && (
                    <span className="text-blue-600 dark:text-blue-400">
                      {asset.userTier.rewards[0].title}
                    </span>
                  )}
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


      {/* All Tiers Modal */}
      {selectedAssetForTiers && (
        <AllTiersModal
          isOpen={!!selectedAssetForTiers}
          onClose={() => setSelectedAssetForTiers(null)}
          assetId={selectedAssetForTiers.id}
          assetName={selectedAssetForTiers.name}
          userTokens={selectedAssetForTiers.tokens}
        />
      )}
    </div>
  );
};