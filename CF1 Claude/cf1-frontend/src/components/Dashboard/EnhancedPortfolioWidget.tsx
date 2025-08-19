import React, { useState, useEffect } from 'react';
import { PieChart, TrendingUp, TrendingDown, ArrowRight, Target, Wallet, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercentage } from '../../utils/format';
import { usePortfolioData } from '../../services/demoPortfolioData';
import { preloadAssetImages } from '../../services/assetImageService';

// Professional Asset Image Component with fallback handling
interface AssetImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

const AssetImage: React.FC<AssetImageProps> = ({ 
  src, 
  alt, 
  className = "w-12 h-12 rounded-lg object-cover",
  fallbackClassName = "w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  if (!src || imageError) {
    return (
      <div className={fallbackClassName}>
        <ImageIcon className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={fallbackClassName}>
          <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded-lg w-full h-full"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'absolute inset-0 opacity-0' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

// Enhanced Pie Chart Component
interface PieChartComponentProps {
  data: Array<{
    name: string;
    value: number;
    allocation: number;
    color: string;
  }>;
  size?: number;
  showLabels?: boolean;
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({ 
  data, 
  size = 200,
  showLabels = true 
}) => {
  const radius = size * 0.4;
  const center = size / 2;
  
  // Calculate angles for each segment
  let cumulativePercentage = 0;
  const segments = data.map((item) => {
    const startAngle = cumulativePercentage * 3.6;
    const endAngle = (cumulativePercentage + item.allocation) * 3.6;
    cumulativePercentage += item.allocation;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const largeArcFlag = item.allocation > 50 ? 1 : 0;
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const pathData = [
      'M', center, center,
      'L', x1, y1,
      'A', radius, radius, 0, largeArcFlag, 1, x2, y2,
      'Z'
    ].join(' ');
    
    return {
      ...item,
      pathData,
      startAngle,
      endAngle
    };
  });
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {segments.map((segment, index) => (
          <g key={index}>
            <path
              d={segment.pathData}
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          </g>
        ))}
        
        <circle
          cx={center}
          cy={center}
          r={radius * 0.6}
          fill="white"
          className="dark:fill-gray-800"
        />
        
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="text-xs font-semibold fill-gray-900 dark:fill-white"
        >
          Portfolio
        </text>
        <text
          x={center}
          y={center + 8}
          textAnchor="middle"
          className="text-xs fill-gray-500 dark:fill-gray-400"
        >
          Allocation
        </text>
      </svg>
      
      {showLabels && (
        <div className="grid grid-cols-2 gap-2 mt-4 w-full max-w-xs">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-gray-900 dark:text-white truncate block">
                  {item.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatPercentage(item.allocation)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface EnhancedPortfolioWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const EnhancedPortfolioWidget: React.FC<EnhancedPortfolioWidgetProps> = ({ 
  size, 
  isEditMode = false 
}) => {
  const navigate = useNavigate();
  const { assets, summary, isDemoMode, scenario } = usePortfolioData();
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Preload asset images for smooth demo experience
  useEffect(() => {
    if (isDemoMode && assets.length > 0) {
      const assetTypes = assets.map(asset => asset.type);
      preloadAssetImages(assetTypes)
        .then(() => setImagesPreloaded(true))
        .catch(console.warn);
    }
  }, [isDemoMode, assets]);

  // If no portfolio data (not in demo mode and no real data), show empty state
  if (!isDemoMode && assets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col items-center justify-center">
        <Wallet className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Portfolio Yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          Start investing to see your portfolio performance here.
        </p>
        <button 
          onClick={() => navigate('/marketplace')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Explore Investments
        </button>
      </div>
    );
  }

  // Convert asset data to pie chart format
  const totalValue = assets.reduce((sum, asset) => {
    const value = parseFloat(asset.currentValue.replace(/[$,]/g, ''));
    return sum + value;
  }, 0);

  const pieChartData = assets.map((asset, index) => {
    const value = parseFloat(asset.currentValue.replace(/[$,]/g, ''));
    const allocation = (value / totalValue) * 100;
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];
    
    return {
      name: asset.name,
      value,
      allocation,
      color: colors[index % colors.length]
    };
  });

  const handleNavigate = () => {
    navigate('/portfolio');
  };

  const getTrendIcon = (isPositive: boolean) => {
    return isPositive ? 
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
              {summary.totalValue}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            {getTrendIcon(summary.isPositive)}
            <span className={`text-sm ${summary.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalGainPercent}
            </span>
          </div>

          {isDemoMode && (
            <div className="text-center">
              <p className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                Demo: {scenario?.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          )}
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
              {summary.totalValue}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Gain</p>
            <p className={`text-lg font-bold ${summary.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalGainPercent}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-center">
            <PieChartComponent 
              data={pieChartData} 
              size={120} 
              showLabels={false}
            />
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
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your investment performance and holdings
            {isDemoMode && (
              <span className="ml-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-xs">
                Demo Mode: {scenario?.replace('_', ' ')}
              </span>
            )}
          </p>
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
            {summary.totalValue}
          </p>
          <p className="text-xs text-blue-600 mt-1">+5.2% this week</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Gain</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.totalGain}
          </p>
          <p className={`text-xs mt-1 ${summary.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {summary.totalGainPercent}
          </p>
        </div>
        
        {size === 'full' && (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <Target className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Investments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {assets.length}
              </p>
              <p className="text-xs text-purple-600 mt-1">Well diversified</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <PieChart className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Best Performer</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {assets[0]?.changePercent || '+0%'}
              </p>
              <p className="text-xs text-orange-600 mt-1">{assets[0]?.name || 'No data'}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Asset Holdings</h4>
        <div className={`${size === 'full' ? 'grid grid-cols-2 gap-6' : 'flex flex-col'} h-full`}>
          
          {/* Pie Chart */}
          <div className={`${size === 'full' ? 'flex justify-center items-center' : 'mb-4'}`}>
            <PieChartComponent 
              data={pieChartData} 
              size={size === 'full' ? 200 : 160} 
              showLabels={size !== 'full'}
            />
          </div>
          
          {/* Asset List with Professional Images */}
          <div className={`${size === 'full' ? 'flex-1' : ''} space-y-3 ${size === 'full' ? 'overflow-y-auto' : ''}`}>
            {assets.map((asset, index) => (
              <div 
                key={asset.id} 
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/marketplace/assets/${asset.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center flex-1 min-w-0 pr-3">
                    {/* Professional Asset Image */}
                    <AssetImage
                      src={asset.imageUrl}
                      alt={asset.name}
                      className="w-10 h-10 rounded-lg object-cover mr-3 flex-shrink-0"
                      fallbackClassName="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white truncate">{asset.name}</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {asset.type} • {asset.tokens} tokens
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {asset.currentValue}
                    </p>
                    <div className="flex items-center space-x-1 justify-end">
                      {getTrendIcon(asset.isPositive)}
                      <span className={`text-sm font-medium whitespace-nowrap ${
                        asset.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {asset.changePercent}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* APY and Progress Bar */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>APY: {asset.apy}</span>
                  <span>{asset.changePercent} gain</span>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default EnhancedPortfolioWidget;