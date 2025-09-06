import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight, BarChart3, Clock } from 'lucide-react';
import { useDiscoveryStore } from '../../store/discoveryStore';
import Card from '../UI/Card';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';

const MarketInsights: React.FC = () => {
  const { marketInsights, loading, loadMarketInsights } = useDiscoveryStore();

  useEffect(() => {
    if (marketInsights.length === 0) {
      loadMarketInsights();
    }
  }, [marketInsights.length, loadMarketInsights]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'down':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Market Intelligence
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Stay ahead of market trends with real-time insights and analysis. 
          Discover emerging opportunities across different asset categories.
        </p>
      </div>

      {/* Market Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {marketInsights.map((insight) => (
          <Card key={insight.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getTrendColor(insight.trend)}`}>
                  {getTrendIcon(insight.trend)}
                </div>
                <div>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    {insight.category}
                  </span>
                </div>
              </div>
              <div className={`text-right ${
                insight.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                insight.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                'text-gray-600 dark:text-gray-400'
              }`}>
                <div className="font-bold">
                  {insight.trend === 'up' ? '+' : insight.trend === 'down' ? '-' : ''}
                  {Math.abs(insight.changePercent)}%
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {insight.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {insight.summary}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {insight.timestamp}
              </div>
              <div>
                {insight.source}
              </div>
            </div>

            <Button variant="outline" size="small" className="w-full text-gray-700 dark:text-gray-300">
              Read Full Analysis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        ))}
      </div>

      {/* Market Overview Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
            Market Overview
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              12
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              Categories Trending Up
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              $2.3B
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              New Capital This Month
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              23%
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              Average Growth Rate
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MarketInsights;