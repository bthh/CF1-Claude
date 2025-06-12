import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface PriceHistoryPoint {
  date: string;
  price: number;
  volume: number;
}

interface PriceChartProps {
  data: PriceHistoryPoint[];
  currentPrice: string;
  priceChange24h: string;
  volume24h: string;
  className?: string;
  onTimeframeChange?: (timeframe: '7D' | '1M' | '3M' | '1Y') => void;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  currentPrice,
  priceChange24h,
  volume24h,
  className = '',
  onTimeframeChange
}) => {
  const [timeframe, setTimeframe] = useState<'7D' | '1M' | '3M' | '1Y'>('7D');

  // Filter data based on timeframe
  const getFilteredData = () => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let cutoffDate: Date;

    switch (timeframe) {
      case '7D':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '1Y':
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        return data;
    }

    return data.filter(point => new Date(point.date) >= cutoffDate);
  };

  const filteredData = getFilteredData();

  const handleTimeframeChange = (newTimeframe: '7D' | '1M' | '3M' | '1Y') => {
    setTimeframe(newTimeframe);
    onTimeframeChange?.(newTimeframe);
  };

  // Calculate chart dimensions and scaling using filtered data
  const maxPrice = filteredData.length > 0 ? Math.max(...filteredData.map(d => d.price)) : 0;
  const minPrice = filteredData.length > 0 ? Math.min(...filteredData.map(d => d.price)) : 0;
  const priceRange = maxPrice - minPrice || 1; // Avoid division by zero
  const chartHeight = 200;
  const chartWidth = 400;
  const padding = { top: 10, right: 10, bottom: 30, left: 35 };

  // Generate SVG path for price line using filtered data
  const generatePath = () => {
    if (filteredData.length < 2) return '';

    return filteredData.map((point, index) => {
      const x = padding.left + (index / (filteredData.length - 1)) * (chartWidth - padding.left - padding.right);
      const y = padding.top + ((maxPrice - point.price) / priceRange) * (chartHeight - padding.top - padding.bottom);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const isPositive = priceChange24h.startsWith('+');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Price Chart
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentPrice}
            </div>
            <div className={`flex items-center space-x-1 ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">{priceChange24h}</span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['7D', '1M', '3M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                timeframe === tf
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative">
        {filteredData.length >= 2 ? (
          <div className="relative h-64 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              className="absolute inset-0"
            >
              {/* Axis lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-gray-300 dark:text-gray-600"
                  />
                </pattern>
              </defs>
              
              {/* Chart area background */}
              <rect 
                x={padding.left} 
                y={padding.top} 
                width={chartWidth - padding.left - padding.right} 
                height={chartHeight - padding.top - padding.bottom} 
                fill="url(#grid)" 
              />
              
              {/* Axis lines */}
              <line 
                x1={padding.left} 
                y1={chartHeight - padding.bottom} 
                x2={chartWidth - padding.right} 
                y2={chartHeight - padding.bottom} 
                stroke="currentColor" 
                strokeWidth="1" 
                className="text-gray-400 dark:text-gray-500"
              />
              <line 
                x1={padding.left} 
                y1={padding.top} 
                x2={padding.left} 
                y2={chartHeight - padding.bottom} 
                stroke="currentColor" 
                strokeWidth="1" 
                className="text-gray-400 dark:text-gray-500"
              />

              {/* Price line */}
              <path
                d={generatePath()}
                fill="none"
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth="2"
                className="drop-shadow-sm"
              />

              {/* Data points */}
              {filteredData.map((point, index) => {
                const x = padding.left + (index / (filteredData.length - 1)) * (chartWidth - padding.left - padding.right);
                const y = padding.top + ((maxPrice - point.price) / priceRange) * (chartHeight - padding.top - padding.bottom);
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={isPositive ? '#10B981' : '#EF4444'}
                    className="hover:r-4 transition-all cursor-pointer"
                  >
                    <title>{`${point.date}: $${point.price.toFixed(2)}`}</title>
                  </circle>
                );
              })}

              {/* Area under curve */}
              <path
                d={`${generatePath()} L ${chartWidth - padding.right} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`}
                fill={isPositive ? '#10B981' : '#EF4444'}
                fillOpacity="0.1"
              />
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-1 top-4 bottom-8 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>${maxPrice.toFixed(2)}</span>
              <span>${((maxPrice + minPrice) / 2).toFixed(2)}</span>
              <span>${minPrice.toFixed(2)}</span>
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-2 left-9 right-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              {filteredData.length > 0 && (
                <>
                  <span>{new Date(filteredData[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  {filteredData.length > 2 && (
                    <span>{new Date(filteredData[Math.floor(filteredData.length / 2)].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  )}
                  <span>{new Date(filteredData[filteredData.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </>
              )}
            </div>
          </div>
        ) : (
          // Placeholder when no data
          <div className="h-64 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Price chart data will be available soon
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">24h Volume</p>
          <p className="font-bold text-lg text-gray-900 dark:text-white">{volume24h}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">High</p>
          <p className="font-bold text-lg text-gray-900 dark:text-white">
            ${maxPrice.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Low</p>
          <p className="font-bold text-lg text-gray-900 dark:text-white">
            ${minPrice.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};