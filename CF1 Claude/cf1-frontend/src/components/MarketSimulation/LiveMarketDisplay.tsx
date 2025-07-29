import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, BarChart3 } from 'lucide-react';
import { marketSimulation, useMarketData, useMarketSummary } from '../../services/marketSimulation';
import { AnimatedCounter } from '../LoadingStates/TransitionWrapper';
import { SkeletonLoader } from '../LoadingStates/SkeletonLoader';

interface LiveMarketDisplayProps {
  className?: string;
  compact?: boolean;
}

export const LiveMarketDisplay: React.FC<LiveMarketDisplayProps> = ({
  className = '',
  compact = false
}) => {
  const summary = useMarketSummary();
  const [selectedAsset, setSelectedAsset] = useState<string>('residential-realestate');
  const assetData = useMarketData(selectedAsset);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}>
        <SkeletonLoader variant="text" className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonLoader variant="text" className="h-4 w-20" />
              <SkeletonLoader variant="text" className="h-8 w-32" />
            </div>
          ))}
        </div>
        <SkeletonLoader variant="rectangular" className="h-64" />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getTrendIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTrendColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const assets = marketSimulation.getAllAssets();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Live Market Data
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time asset prices and market trends
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Summary */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <DollarSign className="w-4 h-4 mr-1" />
              <span className="text-sm">Total Market Cap</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <AnimatedCounter 
                value={summary.totalMarketCap} 
                prefix="$" 
                decimals={0}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <BarChart3 className="w-4 h-4 mr-1" />
              <span className="text-sm">Avg 24h Change</span>
            </div>
            <div className={`text-2xl font-bold flex items-center ${getTrendColor(summary.avgChange24h)}`}>
              {getTrendIcon(summary.avgChange24h)}
              <AnimatedCounter 
                value={summary.avgChange24h} 
                suffix="%" 
                decimals={2}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Activity className="w-4 h-4 mr-1" />
              <span className="text-sm">Market Sentiment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  initial={{ width: '50%' }}
                  animate={{ width: `${summary.sentiment * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {(summary.sentiment * 100).toFixed(0)}%
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4 mr-1" />
              <span className="text-sm">Active Assets</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <AnimatedCounter value={summary.activeAssets} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Asset Selection */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Asset Performance
          </h4>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Asset Details */}
        <AnimatePresence mode="wait">
          {assetData && (
            <motion.div
              key={selectedAsset}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="space-y-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Current Price</span>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter 
                    value={assetData.price} 
                    prefix="$" 
                    decimals={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">24h Change</span>
                <div className={`text-2xl font-bold flex items-center ${getTrendColor(assetData.change24h)}`}>
                  {getTrendIcon(assetData.change24h)}
                  <span className="ml-1">
                    <AnimatedCounter 
                      value={assetData.change24h} 
                      suffix="%" 
                      decimals={2}
                    />
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Volume</span>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter 
                    value={assetData.volume} 
                    prefix="$" 
                    decimals={0}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Market Trends Grid */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          All Assets
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset, index) => {
            const latestData = asset.marketData[asset.marketData.length - 1];
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedAsset === asset.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setSelectedAsset(asset.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {asset.symbol}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {asset.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(latestData.price)}
                    </div>
                    <div className={`text-xs flex items-center ${getTrendColor(latestData.change24h)}`}>
                      {getTrendIcon(latestData.change24h)}
                      <span className="ml-1">{formatPercentage(latestData.change24h)}</span>
                    </div>
                  </div>
                </div>

                {/* Mini sparkline would go here */}
                <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">Mini Chart</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Market events ticker
export const MarketEventsTicker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [events, setEvents] = useState<Array<{
    id: string;
    type: 'price' | 'volume' | 'news';
    message: string;
    timestamp: number;
    severity: 'low' | 'medium' | 'high';
  }>>([]);

  useEffect(() => {
    const generateEvent = () => {
      const assets = marketSimulation.getAllAssets();
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const types = ['price', 'volume', 'news'] as const;
      const type = types[Math.floor(Math.random() * types.length)];
      
      let message = '';
      let severity: 'low' | 'medium' | 'high' = 'low';

      switch (type) {
        case 'price':
          const change = (Math.random() - 0.5) * 10;
          message = `${asset.symbol} ${change > 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}%`;
          severity = Math.abs(change) > 5 ? 'high' : Math.abs(change) > 2 ? 'medium' : 'low';
          break;
        case 'volume':
          message = `High trading volume detected for ${asset.symbol}`;
          severity = 'medium';
          break;
        case 'news':
          const newsEvents = [
            'Regulatory approval pending',
            'New partnership announced',
            'Market expansion planned',
            'Investor interest increasing'
          ];
          message = `${asset.symbol}: ${newsEvents[Math.floor(Math.random() * newsEvents.length)]}`;
          severity = 'low';
          break;
      }

      const newEvent = {
        id: `event_${Date.now()}_${Math.random()}`,
        type,
        message,
        timestamp: Date.now(),
        severity
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 9)]); // Keep only last 10 events
    };

    // Generate initial events
    for (let i = 0; i < 3; i++) {
      setTimeout(generateEvent, i * 1000);
    }

    // Continue generating events
    const interval = setInterval(generateEvent, 8000 + Math.random() * 4000); // 8-12 seconds
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Activity className="w-4 h-4 mr-2 text-blue-600" />
          Market Events
        </h4>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        <AnimatePresence>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                    {event.type.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {event.message}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {events.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Monitoring market events...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMarketDisplay;