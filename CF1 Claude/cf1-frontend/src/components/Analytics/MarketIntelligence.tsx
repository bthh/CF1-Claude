import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Eye, AlertCircle, Star, Activity, BarChart3, PieChart } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { MetricCard } from './MetricCard';
import { ChartContainer } from './ChartContainer';
import { PerformanceChart } from './PerformanceChart';
import { AllocationChart } from './AllocationChart';
import { AssetPerformance } from '../../types/analytics';

interface MarketSentimentProps {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  volatilityIndex: number;
  liquidityScore: number;
}

const MarketSentimentCard: React.FC<MarketSentimentProps> = ({
  sentiment,
  volatilityIndex,
  liquidityScore
}) => {
  const getSentimentColor = () => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 dark:text-green-400';
      case 'bearish': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-5 h-5" />;
      case 'bearish': return <TrendingDown className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Sentiment</h3>
      
      <div className="space-y-4">
        <div className={`flex items-center space-x-3 ${getSentimentColor()}`}>
          {getSentimentIcon()}
          <div>
            <p className="font-semibold text-lg capitalize">{sentiment}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current market outlook</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Volatility Index</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {(volatilityIndex * 100).toFixed(1)}%
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full ${
                  volatilityIndex < 0.15 ? 'bg-green-500' : 
                  volatilityIndex < 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(volatilityIndex * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Liquidity Score</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {(liquidityScore * 100).toFixed(0)}%
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full ${
                  liquidityScore > 0.8 ? 'bg-green-500' : 
                  liquidityScore > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${liquidityScore * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AssetInsightCardProps {
  asset: AssetPerformance;
  rank: number;
  type: 'top' | 'trending' | 'worst';
}

const AssetInsightCard: React.FC<AssetInsightCardProps> = ({ asset, rank, type }) => {
  const getTypeColor = () => {
    switch (type) {
      case 'top': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'trending': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'worst': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'top': return <Star className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'trending': return <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'worst': return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default: return null;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getTypeColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">#{rank}</span>
          {getTypeIcon()}
        </div>
        <span className={`text-sm font-semibold ${
          asset.changePercent > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {asset.changePercent > 0 ? '+' : ''}{asset.changePercent.toFixed(1)}%
        </span>
      </div>
      
      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{asset.name}</h4>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{asset.type}</p>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">Value</span>
        <span className="font-medium text-gray-900 dark:text-white">
          ${(asset.currentValue / 1000000).toFixed(2)}M
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs mt-1">
        <span className="text-gray-600 dark:text-gray-400">APY</span>
        <span className="font-medium text-gray-900 dark:text-white">{asset.apy}%</span>
      </div>
    </div>
  );
};

export const MarketIntelligence: React.FC = () => {
  const { dashboard, isLoading, formatCurrency, formatNumber } = useAnalytics();
  const [selectedView, setSelectedView] = useState<'overview' | 'assets' | 'sectors'>('overview');

  const marketInsights = dashboard?.marketInsights;
  const platformMetrics = dashboard?.platformMetrics;

  if (!marketInsights || !platformMetrics) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Market Intelligence Loading
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Gathering market data and insights...
        </p>
      </div>
    );
  }

  const sectorPerformance = [
    { name: 'Real Estate', value: 35, change: 8.2, volume: 45000000 },
    { name: 'Precious Metals', value: 25, change: 12.1, volume: 28000000 },
    { name: 'Art & Collectibles', value: 20, change: 15.7, volume: 15000000 },
    { name: 'Luxury Vehicles', value: 12, change: -2.3, volume: 8000000 },
    { name: 'Other Assets', value: 8, change: 5.4, volume: 4000000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Intelligence</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time market insights and asset analysis
          </p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              selectedView === 'overview'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('assets')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              selectedView === 'assets'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Assets
          </button>
          <button
            onClick={() => setSelectedView('sectors')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              selectedView === 'sectors'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sectors
          </button>
        </div>
      </div>

      {/* Market Overview */}
      {selectedView === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Market Cap"
              value={formatCurrency(platformMetrics.totalValueLocked)}
              change={5.2}
              trend="up"
              icon={<BarChart3 className="w-6 h-6" />}
              color="blue"
            />
            <MetricCard
              title="24h Volume"
              value={formatCurrency(platformMetrics.monthlyVolume / 30)}
              change={12.5}
              trend="up"
              icon={<Activity className="w-6 h-6" />}
              color="green"
            />
            <MetricCard
              title="Active Assets"
              value={formatNumber(platformMetrics.totalAssets)}
              change={3.7}
              trend="up"
              icon={<PieChart className="w-6 h-6" />}
              color="purple"
            />
            <MetricCard
              title="Avg. Yield"
              value={`${platformMetrics.averageAPY.toFixed(1)}%`}
              change={-0.3}
              trend="down"
              icon={<TrendingUp className="w-6 h-6" />}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartContainer
                title="Market Performance"
                subtitle="Platform-wide value trends"
                isLoading={isLoading}
              >
                <PerformanceChart
                  data={marketInsights.topPerformingAssets.map((asset, index) => ({
                    name: asset.name.substring(0, 8),
                    value: asset.currentValue / 1000000,
                  }))}
                  height={300}
                  color="#3b82f6"
                />
              </ChartContainer>
            </div>
            
            <MarketSentimentCard
              sentiment={marketInsights.marketSentiment}
              volatilityIndex={marketInsights.volatilityIndex}
              liquidityScore={marketInsights.liquidityScore}
            />
          </div>
        </>
      )}

      {/* Asset Performance */}
      {selectedView === 'assets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performers</h3>
            <div className="space-y-3">
              {marketInsights.topPerformingAssets.slice(0, 5).map((asset, index) => (
                <AssetInsightCard
                  key={asset.id}
                  asset={asset}
                  rank={index + 1}
                  type="top"
                />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trending Assets</h3>
            <div className="space-y-3">
              {marketInsights.trendingAssets.slice(0, 5).map((asset, index) => (
                <AssetInsightCard
                  key={asset.id}
                  asset={asset}
                  rank={index + 1}
                  type="trending"
                />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Underperformers</h3>
            <div className="space-y-3">
              {marketInsights.worstPerformingAssets.slice(0, 5).map((asset, index) => (
                <AssetInsightCard
                  key={asset.id}
                  asset={asset}
                  rank={index + 1}
                  type="worst"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sector Analysis */}
      {selectedView === 'sectors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer
            title="Sector Allocation"
            subtitle="Market share by asset type"
            isLoading={isLoading}
          >
            <AllocationChart
              data={sectorPerformance.map(sector => ({
                name: sector.name,
                value: sector.value,
                color: sector.change > 0 ? '#10b981' : '#ef4444'
              }))}
              height={300}
            />
          </ChartContainer>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sector Performance</h3>
            <div className="space-y-4">
              {sectorPerformance.map((sector, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{sector.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sector.value}% of market
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 ${
                      sector.change > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {sector.change > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {sector.change > 0 ? '+' : ''}{sector.change.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      ${(sector.volume / 1000000).toFixed(1)}M volume
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Market Alerts */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Market Intelligence Insights
            </h3>
            <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
              <p>• Real estate assets showing strong momentum with 8.2% sector growth</p>
              <p>• Precious metals experiencing increased volatility (+12.1% this period)</p>
              <p>• Art & collectibles leading performance with 15.7% gains</p>
              <p>• Market sentiment remains {marketInsights.marketSentiment} with healthy liquidity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};