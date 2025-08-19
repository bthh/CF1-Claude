import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Star, MapPin, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMarketplaceAssets } from '../../services/demoMarketplaceData';
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
  className = "w-full h-32 object-cover rounded-lg",
  fallbackClassName = "w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg"
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
        <ImageIcon className="w-8 h-8 text-gray-400" />
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

interface EnhancedMarketplaceWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const EnhancedMarketplaceWidget: React.FC<EnhancedMarketplaceWidgetProps> = ({ 
  size, 
  isEditMode = false 
}) => {
  const navigate = useNavigate();
  const { assets, quickStats, isDemoMode, scenario } = useMarketplaceAssets();
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

  // If no marketplace data (not in demo mode and no real data), show empty state
  if (!isDemoMode && assets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col items-center justify-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Assets Available</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          Check back soon for new investment opportunities.
        </p>
        <button 
          onClick={() => navigate('/marketplace')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Marketplace
        </button>
      </div>
    );
  }

  const handleNavigate = () => {
    navigate('/marketplace');
  };

  const handleAssetClick = (assetId: string) => {
    navigate(`/marketplace/assets/${assetId}`);
  };

  const displayAssets = assets.slice(0, size === 'small' ? 2 : size === 'medium' ? 3 : size === 'large' ? 4 : 6);

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Marketplace</h3>
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
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quickStats.totalAssets}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Assets Available</p>
          </div>

          {displayAssets.map((asset) => (
            <div 
              key={asset.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => handleAssetClick(asset.id)}
            >
              <AssetImage
                src={asset.imageUrl}
                alt={asset.name}
                className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                fallbackClassName="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {asset.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {asset.type}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  {asset.apy}
                </p>
              </div>
            </div>
          ))}

          {isDemoMode && (
            <div className="text-center mt-2">
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Marketplace</h3>
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
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {quickStats.totalAssets}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Assets</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">
              {quickStats.avgAPY}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg APY</p>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {displayAssets.map((asset) => (
            <div 
              key={asset.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => handleAssetClick(asset.id)}
            >
              <AssetImage
                src={asset.imageUrl}
                alt={asset.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                fallbackClassName="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {asset.name}
                </p>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {asset.location}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-green-600">
                  {asset.apy}
                </p>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-500">{asset.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Large and Full size - Professional asset showcase
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Investment Marketplace</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Professional-grade tokenized assets
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
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {quickStats.totalAssets}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available Assets</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {quickStats.avgAPY}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average APY</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {quickStats.totalVolume}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Volume</p>
        </div>
      </div>

      {/* Featured Assets Grid with Professional Images */}
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Featured Assets</h4>
        <div className={`grid ${size === 'full' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'} gap-3 h-full overflow-y-auto`}>
          {displayAssets.map((asset) => (
            <div 
              key={asset.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors group"
              onClick={() => handleAssetClick(asset.id)}
            >
              {/* Professional Asset Image */}
              <div className="mb-2 aspect-[3/2] relative overflow-hidden rounded-lg">
                <AssetImage
                  src={asset.imageUrl}
                  alt={asset.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                  fallbackClassName="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center rounded-lg"
                />
              </div>

              {/* Asset Details */}
              <div className="space-y-1">
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white text-xs truncate group-hover:text-blue-600 transition-colors">
                    {asset.name}
                  </h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate text-[10px]">
                    {asset.type}
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  <MapPin className="w-2 h-2 text-gray-400 flex-shrink-0" />
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {asset.location}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-2 h-2 text-yellow-400 fill-current" />
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">{asset.rating}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-600">
                      {asset.apy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Token Price</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {asset.tokenPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Available</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {asset.tokensAvailable.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Asset Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {asset.tags.slice(0, 2).map((tag, index) => (
                    <span 
                      key={index}
                      className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMarketplaceWidget;