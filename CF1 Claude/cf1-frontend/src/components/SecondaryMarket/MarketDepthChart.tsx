import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface MarketDepthChartProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  height?: number;
  width?: number;
}

export const MarketDepthChart: React.FC<MarketDepthChartProps> = ({
  bids,
  asks,
  height = 300,
  width = 600
}) => {
  const chartData = useMemo(() => {
    if (!bids.length && !asks.length) return null;

    // Calculate cumulative volumes
    let cumulativeBids = 0;
    let cumulativeAsks = 0;

    const bidData = bids
      .sort((a, b) => b.price - a.price) // Sort bids descending
      .map((bid) => {
        cumulativeBids += bid.quantity;
        return {
          price: bid.price,
          quantity: bid.quantity,
          cumulative: cumulativeBids
        };
      });

    const askData = asks
      .sort((a, b) => a.price - b.price) // Sort asks ascending
      .map((ask) => {
        cumulativeAsks += ask.quantity;
        return {
          price: ask.price,
          quantity: ask.quantity,
          cumulative: cumulativeAsks
        };
      });

    // Find price range
    const allPrices = [...bidData.map(b => b.price), ...askData.map(a => a.price)];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    // Find max cumulative volume
    const maxVolume = Math.max(
      bidData.length > 0 ? Math.max(...bidData.map(b => b.cumulative)) : 0,
      askData.length > 0 ? Math.max(...askData.map(a => a.cumulative)) : 0
    );

    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Calculate points for the chart
    const bidPoints = bidData.map((bid) => ({
      x: padding + ((bid.price - minPrice) / priceRange) * chartWidth,
      y: padding + chartHeight - (bid.cumulative / maxVolume) * chartHeight,
      ...bid
    }));

    const askPoints = askData.map((ask) => ({
      x: padding + ((ask.price - minPrice) / priceRange) * chartWidth,
      y: padding + chartHeight - (ask.cumulative / maxVolume) * chartHeight,
      ...ask
    }));

    return {
      bidPoints,
      askPoints,
      minPrice,
      maxPrice,
      priceRange,
      maxVolume,
      padding,
      chartWidth,
      chartHeight
    };
  }, [bids, asks, height, width]);

  const bidPath = useMemo(() => {
    if (!chartData || chartData.bidPoints.length === 0) return '';

    let path = `M ${chartData.padding} ${chartData.padding + chartData.chartHeight}`;
    
    chartData.bidPoints.forEach((point, index) => {
      if (index === 0) {
        path += ` L ${point.x} ${chartData.padding + chartData.chartHeight}`;
      }
      path += ` L ${point.x} ${point.y}`;
    });
    
    const lastBid = chartData.bidPoints[chartData.bidPoints.length - 1];
    path += ` L ${lastBid.x} ${chartData.padding + chartData.chartHeight}`;
    
    return path;
  }, [chartData]);

  const askPath = useMemo(() => {
    if (!chartData || chartData.askPoints.length === 0) return '';

    const firstAsk = chartData.askPoints[0];
    let path = `M ${firstAsk.x} ${chartData.padding + chartData.chartHeight}`;
    
    chartData.askPoints.forEach((point) => {
      path += ` L ${point.x} ${point.y}`;
    });
    
    const lastAsk = chartData.askPoints[chartData.askPoints.length - 1];
    path += ` L ${lastAsk.x} ${chartData.padding + chartData.chartHeight}`;
    
    return path;
  }, [chartData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toLocaleString();
  };

  if (!chartData) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg"
        style={{ height, width }}
      >
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">No market depth data available</p>
        </div>
      </div>
    );
  }

  // Calculate spread
  const bestBid = chartData.bidPoints.length > 0 ? Math.max(...chartData.bidPoints.map(b => b.price)) : 0;
  const bestAsk = chartData.askPoints.length > 0 ? Math.min(...chartData.askPoints.map(a => a.price)) : 0;
  const spread = bestAsk - bestBid;
  const spreadPercent = spread / bestBid * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Market Depth
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cumulative order book visualization
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">Spread</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatPrice(spread)}
          </div>
          <div className="text-xs text-gray-500">
            {spreadPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          width={width}
          height={height}
          className="overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="depthGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-600"
                strokeWidth="1"
                opacity="0.2"
              />
            </pattern>
            <linearGradient id="bidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="askGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Background grid */}
          <rect width={width} height={height} fill="url(#depthGrid)" />

          {/* Bid area */}
          <path
            d={bidPath}
            fill="url(#bidGradient)"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Ask area */}
          <path
            d={askPath}
            fill="url(#askGradient)"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Spread indicator */}
          {bestBid > 0 && bestAsk > 0 && (
            <g>
              <line
                x1={chartData.padding + ((bestBid - chartData.minPrice) / chartData.priceRange) * chartData.chartWidth}
                y1={chartData.padding}
                x2={chartData.padding + ((bestBid - chartData.minPrice) / chartData.priceRange) * chartData.chartWidth}
                y2={chartData.padding + chartData.chartHeight}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="4,2"
                opacity="0.8"
              />
              <line
                x1={chartData.padding + ((bestAsk - chartData.minPrice) / chartData.priceRange) * chartData.chartWidth}
                y1={chartData.padding}
                x2={chartData.padding + ((bestAsk - chartData.minPrice) / chartData.priceRange) * chartData.chartWidth}
                y2={chartData.padding + chartData.chartHeight}
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="4,2"
                opacity="0.8"
              />
            </g>
          )}

          {/* Y-axis labels (Volume) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const volume = chartData.maxVolume * ratio;
            const y = chartData.padding + chartData.chartHeight - (ratio * chartData.chartHeight);
            
            return (
              <g key={ratio}>
                <line
                  x1={chartData.padding}
                  y1={y}
                  x2={width - chartData.padding}
                  y2={y}
                  stroke="currentColor"
                  className="text-gray-200 dark:text-gray-600"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <text
                  x={chartData.padding - 5}
                  y={y + 4}
                  textAnchor="end"
                  fill="currentColor"
                  className="text-gray-600 dark:text-gray-400"
                  fontSize="10"
                >
                  {formatVolume(volume)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels (Price) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const price = chartData.minPrice + (chartData.priceRange * ratio);
            const x = chartData.padding + (ratio * chartData.chartWidth);
            
            return (
              <g key={ratio}>
                <line
                  x1={x}
                  y1={chartData.padding}
                  x2={x}
                  y2={chartData.padding + chartData.chartHeight}
                  stroke="currentColor"
                  className="text-gray-200 dark:text-gray-600"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <text
                  x={x}
                  y={height - chartData.padding + 15}
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-gray-600 dark:text-gray-400"
                  fontSize="10"
                >
                  {formatPrice(price)}
                </text>
              </g>
            );
          })}

          {/* Data points with tooltips */}
          {chartData.bidPoints.map((point, index) => (
            <g key={`bid-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
                className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              />
              <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <rect
                  x={point.x - 50}
                  y={point.y - 50}
                  width="100"
                  height="40"
                  fill="black"
                  opacity="0.8"
                  rx="4"
                />
                <text
                  x={point.x}
                  y={point.y - 30}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {formatPrice(point.price)}
                </text>
                <text
                  x={point.x}
                  y={point.y - 18}
                  textAnchor="middle"
                  fill="white"
                  fontSize="9"
                >
                  Vol: {formatVolume(point.cumulative)}
                </text>
              </g>
            </g>
          ))}

          {chartData.askPoints.map((point, index) => (
            <g key={`ask-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#ef4444"
                stroke="white"
                strokeWidth="2"
                className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              />
              <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <rect
                  x={point.x - 50}
                  y={point.y - 50}
                  width="100"
                  height="40"
                  fill="black"
                  opacity="0.8"
                  rx="4"
                />
                <text
                  x={point.x}
                  y={point.y - 30}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {formatPrice(point.price)}
                </text>
                <text
                  x={point.x}
                  y={point.y - 18}
                  textAnchor="middle"
                  fill="white"
                  fontSize="9"
                >
                  Vol: {formatVolume(point.cumulative)}
                </text>
              </g>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 text-xs shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-2 bg-green-600 rounded-sm"></div>
              <span className="text-gray-600 dark:text-gray-400">Bids (Buy Orders)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-2 bg-red-600 rounded-sm"></div>
              <span className="text-gray-600 dark:text-gray-400">Asks (Sell Orders)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Best Bid</p>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {formatPrice(bestBid)}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Best Ask</p>
          <div className="flex items-center space-x-1">
            <TrendingDown className="w-3 h-3 text-red-600" />
            <span className="text-sm font-medium text-red-600">
              {formatPrice(bestAsk)}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Bid Volume</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatVolume(chartData.bidPoints.reduce((sum, bid) => sum + bid.quantity, 0))}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Ask Volume</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatVolume(chartData.askPoints.reduce((sum, ask) => sum + ask.quantity, 0))}
          </p>
        </div>
      </div>
    </div>
  );
};