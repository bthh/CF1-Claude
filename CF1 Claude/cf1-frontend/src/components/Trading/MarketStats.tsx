import React from 'react';
import { TrendingUp, BarChart3, Users, Activity } from 'lucide-react';
import { useTradingStore } from '../../store/tradingStore';
import { formatCurrency } from '../../utils/format';

const MarketStats: React.FC = () => {
  const { marketStats, loading } = useTradingStore();

  if (loading || !marketStats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg h-16 animate-pulse"></div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: '24h Volume',
      value: formatCurrency(marketStats.totalVolume24h),
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      change: '+12.3%',
      isPositive: true
    },
    {
      label: '24h Trades',
      value: marketStats.totalTrades24h.toLocaleString(),
      icon: <Activity className="w-5 h-5 text-green-600" />,
      change: '+8.7%',
      isPositive: true
    },
    {
      label: 'Active Orders',
      value: marketStats.activeOrders.toLocaleString(),
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      change: '+15.2%',
      isPositive: true
    },
    {
      label: 'Total Assets',
      value: marketStats.totalAssets.toLocaleString(),
      icon: <Users className="w-5 h-5 text-orange-600" />,
      change: '+2 new',
      isPositive: true
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {stat.label}
            </span>
            {stat.icon}
          </div>
          
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <div className={`flex items-center space-x-1 text-xs ${
              stat.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3" />
              <span>{stat.change}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketStats;