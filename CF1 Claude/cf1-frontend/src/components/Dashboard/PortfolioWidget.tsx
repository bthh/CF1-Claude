import React from 'react';
import { PieChart, TrendingUp, TrendingDown, DollarSign, ArrowRight, Target, Calendar, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercentage } from '../../utils/format';

interface PortfolioWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const PortfolioWidget: React.FC<PortfolioWidgetProps> = ({ size, isEditMode = false }) => {
  const navigate = useNavigate();

  // Mock data - replace with real data from store/API
  const portfolioStats = {
    totalValue: 45650,
    totalGain: 6780,
    gainPercentage: 17.4,
    activeInvestments: 12,
    assets: [
      {
        name: 'Green Energy Fund',
        value: 15420,
        allocation: 33.8,
        gain: 2340,
        gainPercent: 17.9,
        trend: 'up'
      },
      {
        name: 'Tech Innovation',
        value: 12650,
        allocation: 27.7,
        gain: 1890,
        gainPercent: 17.6,
        trend: 'up'
      },
      {
        name: 'Real Estate Portfolio',
        value: 9870,
        allocation: 21.6,
        gain: 1240,
        gainPercent: 14.4,
        trend: 'up'
      },
      {
        name: 'Healthcare Research',
        value: 5210,
        allocation: 11.4,
        gain: 890,
        gainPercent: 20.6,
        trend: 'up'
      },
      {
        name: 'Sustainable Agriculture',
        value: 2500,
        allocation: 5.5,
        gain: 420,
        gainPercent: 20.2,
        trend: 'up'
      }
    ]
  };

  const handleNavigate = () => {
    navigate('/portfolio');
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio</h3>
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
              {formatCurrency(portfolioStats.totalValue)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">
              +{formatPercentage(portfolioStats.gainPercentage)}
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
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Portfolio Summary</h3>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolioStats.totalValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Gain</p>
            <p className="text-lg font-bold text-green-600">
              +{formatPercentage(portfolioStats.gainPercentage)}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Top Holdings</p>
          <div className="space-y-1">
            {portfolioStats.assets.slice(0, 2).map((asset, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1 min-w-0 pr-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">
                    {asset.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatPercentage(asset.allocation)}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(asset.value)}
                  </p>
                  <div className="flex items-center space-x-1 justify-end">
                    {getTrendIcon(asset.trend)}
                    <span className="text-xs text-green-600 whitespace-nowrap">
                      +{formatPercentage(asset.gainPercent)}
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio Dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your investment performance and holdings</p>
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
          <Wallet className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(portfolioStats.totalValue)}
          </p>
          <p className="text-xs text-blue-600 mt-1">+5.2% this week</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Gain</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(portfolioStats.totalGain)}
          </p>
          <p className="text-xs text-green-600 mt-1">+{formatPercentage(portfolioStats.gainPercentage)}</p>
        </div>
        
        {size === 'full' && (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <Target className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Investments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {portfolioStats.activeInvestments}
              </p>
              <p className="text-xs text-purple-600 mt-1">Well diversified</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <PieChart className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Best Performer</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                +{formatPercentage(20.6)}
              </p>
              <p className="text-xs text-orange-600 mt-1">Healthcare Research</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Asset Allocation</h4>
        <div className="space-y-3">
          {portfolioStats.assets.map((asset, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0 pr-3">
                  <h5 className="font-medium text-gray-900 dark:text-white truncate">{asset.name}</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatPercentage(asset.allocation)} of portfolio
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(asset.value)}
                  </p>
                  <div className="flex items-center space-x-1 justify-end">
                    {getTrendIcon(asset.trend)}
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      asset.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      +{formatCurrency(asset.gain)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${asset.allocation}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioWidget;