import React from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercentage } from '../../utils/format';

interface TradingWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const TradingWidget: React.FC<TradingWidgetProps> = ({ size, isEditMode = false }) => {
  const navigate = useNavigate();

  // Mock data - replace with real data from store/API
  const tradingStats = {
    totalVolume24h: 458000,
    activeTrades: 127,
    topPairs: [
      { pair: 'RWA-1/USDC', price: 125.50, change: 5.2, volume: 85000 },
      { pair: 'RWA-2/USDC', price: 87.20, change: -2.1, volume: 62000 },
      { pair: 'RWA-3/USDC', price: 234.80, change: 8.7, volume: 45000 }
    ]
  };

  const handleNavigate = () => {
    navigate('/secondary-trading');
  };

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Trading</h3>
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
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(tradingStats.totalVolume24h)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">24h Volume</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {tradingStats.activeTrades} Active
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Trading Activity</h3>
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
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">24h Volume</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(tradingStats.totalVolume24h)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Trades</p>
            <p className="text-lg font-bold text-blue-600">
              {tradingStats.activeTrades}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Top Trading Pairs</p>
          <div className="space-y-1">
            {tradingStats.topPairs.slice(0, 2).map((pair, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs font-medium text-gray-900 dark:text-white">{pair.pair}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    ${pair.price.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-1">
                    {pair.change > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      pair.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(Math.abs(pair.change))}
                    </span>
                  </div>
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trading Dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Secondary market activity</p>
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
          <ArrowUpDown className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(tradingStats.totalVolume24h)}
          </p>
          <p className="text-xs text-blue-600 mt-1">+12.3% from yesterday</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <Activity className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Trades</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {tradingStats.activeTrades}
          </p>
          <p className="text-xs text-green-600 mt-1">89 completed today</p>
        </div>
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Top Trading Pairs</h4>
        <div className="space-y-3">
          {tradingStats.topPairs.map((pair, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{pair.pair}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Volume: {formatCurrency(pair.volume)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  ${pair.price.toFixed(2)}
                </p>
                <div className="flex items-center justify-end space-x-1">
                  {pair.change > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    pair.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {pair.change > 0 ? '+' : ''}{formatPercentage(pair.change)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingWidget;