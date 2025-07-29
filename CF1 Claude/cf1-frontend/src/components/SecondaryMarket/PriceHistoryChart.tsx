import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PricePoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceHistoryChartProps {
  data: PricePoint[];
  height?: number;
  width?: number;
  timeframe?: '1d' | '7d' | '30d' | '90d' | '1y';
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  data,
  height = 300,
  width = 500,
  timeframe = '30d'
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const prices = data.map(d => d.close);
    const volumes = data.map(d => d.volume);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const maxVolume = Math.max(...volumes);
    
    const priceRange = maxPrice - minPrice;
    const padding = 20;
    const chartHeight = height - 80; // Leave space for volume bars
    const volumeHeight = 60;

    return {
      minPrice,
      maxPrice,
      priceRange,
      maxVolume,
      padding,
      chartHeight,
      volumeHeight,
      points: data.map((point, index) => {
        const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
        const y = padding + ((maxPrice - point.close) / priceRange) * (chartHeight - 2 * padding);
        const volumeY = height - volumeHeight + ((maxVolume - point.volume) / maxVolume) * volumeHeight;
        
        return {
          x,
          y,
          volumeY,
          ...point
        };
      })
    };
  }, [data, height, width]);

  const pathData = useMemo(() => {
    if (!chartData) return '';
    
    return chartData.points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');
  }, [chartData]);

  const areaPath = useMemo(() => {
    if (!chartData) return '';
    
    const linePath = pathData;
    const lastPoint = chartData.points[chartData.points.length - 1];
    const firstPoint = chartData.points[0];
    
    return `${linePath} L ${lastPoint.x} ${height - chartData.volumeHeight} L ${firstPoint.x} ${height - chartData.volumeHeight} Z`;
  }, [pathData, chartData, height]);

  const currentPrice = data?.[data.length - 1]?.close || 0;
  const previousPrice = data?.[data.length - 2]?.close || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

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
    return volume.toString();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    switch (timeframe) {
      case '1d':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case '30d':
      case '90d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '1y':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!chartData || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg"
        style={{ height, width }}
      >
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">No price data available</p>
        </div>
      </div>
    );
  }

  const isPositive = priceChange >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(currentPrice)}
            </span>
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}{formatPrice(priceChange)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {timeframe.toUpperCase()} Price Chart
          </p>
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
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-600"
                strokeWidth="1"
                opacity="0.3"
              />
            </pattern>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity="0.05"
              />
            </linearGradient>
          </defs>

          {/* Background grid */}
          <rect width={width} height={height - chartData.volumeHeight} fill="url(#grid)" />

          {/* Price area */}
          <path
            d={areaPath}
            fill="url(#priceGradient)"
            stroke="none"
          />

          {/* Price line */}
          <path
            d={pathData}
            fill="none"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Volume bars */}
          {chartData.points.map((point, index) => (
            <rect
              key={index}
              x={point.x - 2}
              y={point.volumeY}
              width="4"
              height={height - point.volumeY}
              fill="currentColor"
              className="text-gray-400 dark:text-gray-500"
              opacity="0.6"
            />
          ))}

          {/* Data points */}
          {chartData.points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill={isPositive ? "#10b981" : "#ef4444"}
                stroke="white"
                strokeWidth="2"
                className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              />
              
              {/* Tooltip on hover */}
              <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <rect
                  x={point.x - 40}
                  y={point.y - 60}
                  width="80"
                  height="50"
                  fill="black"
                  opacity="0.8"
                  rx="4"
                />
                <text
                  x={point.x}
                  y={point.y - 35}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {formatPrice(point.close)}
                </text>
                <text
                  x={point.x}
                  y={point.y - 20}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  Vol: {formatVolume(point.volume)}
                </text>
              </g>
            </g>
          ))}

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const price = chartData.minPrice + (chartData.priceRange * ratio);
            const y = chartData.padding + ((1 - ratio) * (chartData.chartHeight - 2 * chartData.padding));
            
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
                  {formatPrice(price)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {chartData.points
            .filter((_, index) => index % Math.ceil(chartData.points.length / 6) === 0)
            .map((point, index) => (
              <text
                key={index}
                x={point.x}
                y={height - chartData.volumeHeight + 15}
                textAnchor="middle"
                fill="currentColor"
                className="text-gray-600 dark:text-gray-400"
                fontSize="10"
              >
                {formatDate(point.timestamp)}
              </text>
            ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className={`w-3 h-0.5 ${isPositive ? 'bg-green-600' : 'bg-red-600'}`}></div>
              <span className="text-gray-600 dark:text-gray-400">Price</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-2 bg-gray-400 opacity-60"></div>
              <span className="text-gray-600 dark:text-gray-400">Volume</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">High</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatPrice(chartData.maxPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Low</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatPrice(chartData.minPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Volume</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatVolume(data.reduce((sum, point) => sum + point.volume, 0))}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Range</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatPrice(chartData.priceRange)}
          </p>
        </div>
      </div>
    </div>
  );
};