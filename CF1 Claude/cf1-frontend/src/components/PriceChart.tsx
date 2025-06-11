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
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  currentPrice,
  priceChange24h,
  volume24h,
  className = ''
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M' | '3M' | '1Y'>('7D');

  // Calculate chart dimensions and scaling
  const maxPrice = Math.max(...data.map(d => d.price));
  const minPrice = Math.min(...data.map(d => d.price));
  const priceRange = maxPrice - minPrice;
  const chartHeight = 200;
  const chartWidth = 400;

  // Generate SVG path for price line
  const generatePath = () => {
    if (data.length < 2) return '';

    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
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
          {(['1D', '7D', '1M', '3M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
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
        {data.length >= 2 ? (
          <div className="relative h-48 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="overflow-visible"
            >
              {/* Grid lines */}
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
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Price line */}
              <path
                d={generatePath()}
                fill="none"
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth="2"
                className="drop-shadow-sm"
              />

              {/* Data points */}
              {data.map((point, index) => {
                const x = (index / (data.length - 1)) * chartWidth;
                const y = chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
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
                d={`${generatePath()} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                fill={isPositive ? '#10B981' : '#EF4444'}
                fillOpacity="0.1"
              />
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>${maxPrice.toFixed(2)}</span>
              <span>${((maxPrice + minPrice) / 2).toFixed(2)}</span>
              <span>${minPrice.toFixed(2)}</span>
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 dark:text-gray-400 px-4">
              {data.map((point, index) => (
                index % Math.ceil(data.length / 5) === 0 && (
                  <span key={index}>
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )
              ))}
            </div>
          </div>
        ) : (
          // Placeholder when no data
          <div className="h-48 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
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