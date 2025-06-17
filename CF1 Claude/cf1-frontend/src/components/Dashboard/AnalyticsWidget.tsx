import React from 'react';
import { BarChart3, TrendingUp, Activity, Eye, ArrowRight, Users, DollarSign, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercentage } from '../../utils/format';

interface AnalyticsWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ size, isEditMode = false }) => {
  const navigate = useNavigate();

  // Mock data - replace with real data from store/API
  const analyticsStats = {
    totalTransactions: 15420,
    totalVolume: 89450000,
    avgTransactionSize: 5800,
    platformGrowth: 24.5,
    dailyActiveUsers: 3240,
    weeklyGrowth: 8.2,
    monthlyGrowth: 24.5,
    yearlyGrowth: 156.8,
    topMetrics: [
      { label: 'Platform Volume', value: formatCurrency(89450000), change: '+12.3%', trend: 'up' },
      { label: 'Active Users', value: '3,240', change: '+8.2%', trend: 'up' },
      { label: 'Avg Investment', value: formatCurrency(5800), change: '+5.1%', trend: 'up' },
      { label: 'Success Rate', value: '78.5%', change: '+2.1%', trend: 'up' }
    ],
    recentActivity: [
      { metric: 'New registrations', value: 156, timeframe: 'today' },
      { metric: 'Completed investments', value: 89, timeframe: 'today' },
      { metric: 'Proposal submissions', value: 12, timeframe: 'this week' },
      { metric: 'Governance votes', value: 1247, timeframe: 'this week' }
    ]
  };

  const handleNavigate = () => {
    navigate('/analytics');
  };

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h3>
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
              {analyticsStats.dailyActiveUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily Active Users</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">
              +{formatPercentage(analyticsStats.weeklyGrowth)}
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Analytics</h3>
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
              {formatCurrency(analyticsStats.totalVolume)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Growth</p>
            <p className="text-xl font-bold text-green-600">
              +{formatPercentage(analyticsStats.monthlyGrowth)}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Key Metrics</p>
          <div className="space-y-2">
            {analyticsStats.topMetrics.slice(0, 2).map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-900 dark:text-white truncate flex-1 pr-2">{metric.label}</span>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {metric.value}
                  </span>
                  <span className="text-xs text-green-600 whitespace-nowrap">{metric.change}</span>
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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Real-time platform metrics and insights</p>
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
            {formatCurrency(analyticsStats.totalVolume)}
          </p>
          <p className="text-xs text-green-600 mt-1">+12.3% this month</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <Users className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Daily Active Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analyticsStats.dailyActiveUsers.toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 mt-1">+{formatPercentage(analyticsStats.weeklyGrowth)} this week</p>
        </div>
        
        {size === 'full' && (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <Activity className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsStats.totalTransactions.toLocaleString()}
              </p>
              <p className="text-xs text-purple-600 mt-1">+15.7% this month</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <Target className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Transaction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analyticsStats.avgTransactionSize)}
              </p>
              <p className="text-xs text-orange-600 mt-1">+5.1% improvement</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Key Metrics */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Performance Metrics</h4>
          <div className="space-y-3">
            {analyticsStats.topMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metric.label}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">{metric.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Activity</h4>
          <div className="space-y-3">
            {analyticsStats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.metric}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.timeframe}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {activity.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;