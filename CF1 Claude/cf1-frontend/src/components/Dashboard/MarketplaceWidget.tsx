import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercentage } from '../../utils/format';

interface MarketplaceWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const MarketplaceWidget: React.FC<MarketplaceWidgetProps> = ({ size, isEditMode = false }) => {
  const navigate = useNavigate();

  // Mock data - replace with real data from store/API
  const marketStats = {
    totalVolume: 12450000,
    activeAssets: 156,
    avgReturn: 12.5,
    topAssets: [
      { name: 'Green Energy Fund', return: 18.5, volume: 2340000, trend: 'up' },
      { name: 'Tech Innovation', return: 15.2, volume: 1850000, trend: 'up' },
      { name: 'Real Estate Portfolio', return: 8.7, volume: 1560000, trend: 'down' },
    ]
  };

  const handleNavigate = () => {
    navigate('/marketplace');
  };

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Marketplace</h3>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="space-y-3 flex-1">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(marketStats.totalVolume)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {marketStats.activeAssets} Active Assets
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Marketplace Overview</h3>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(marketStats.totalVolume)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Return</p>
            <p className="text-xl font-bold text-green-600">
              +{formatPercentage(marketStats.avgReturn)}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Top Assets</p>
          <div className="space-y-2">
            {marketStats.topAssets.slice(0, 2).map((asset, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-900 dark:text-white truncate flex-1 pr-2">{asset.name}</span>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {asset.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium whitespace-nowrap ${
                    asset.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(asset.return)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Large and Full size
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Marketplace Dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Real-time market activity and performance</p>
        </div>
        {!isEditMode && (
          <button 
            onClick={handleNavigate}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      
      <div className={`grid ${size === 'full' ? 'grid-cols-4' : 'grid-cols-2'} gap-4 mb-6`}>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <DollarSign className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(marketStats.totalVolume)}
          </p>
          <p className="text-xs text-green-600 mt-1">+12.3% this month</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <Activity className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Assets</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {marketStats.activeAssets}
          </p>
          <p className="text-xs text-blue-600 mt-1">23 new this week</p>
        </div>
        
        {size === 'full' && (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Return</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(marketStats.avgReturn)}
              </p>
              <p className="text-xs text-purple-600 mt-1">Above market avg</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <DollarSign className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Investors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                8,234
              </p>
              <p className="text-xs text-orange-600 mt-1">342 new this week</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Top Performing Assets</h4>
        <div className="space-y-3">
          {marketStats.topAssets.map((asset, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => navigate(`/marketplace/assets/${index + 1}`)}
            >
              <div className="flex-1 min-w-0 pr-3">
                <p className="font-medium text-gray-900 dark:text-white truncate">{asset.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Volume: {formatCurrency(asset.volume)}
                </p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {asset.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-lg font-bold whitespace-nowrap ${
                  asset.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(asset.return)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceWidget;