import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Star, MapPin, Clock, Image as ImageIcon } from 'lucide-react';
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
  className = "w-full h-48 object-cover rounded-lg",
  fallbackClassName = "w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center rounded-lg"
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
        <ImageIcon className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      {isLoading && (
        <div className={fallbackClassName}>
          <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded-lg w-full h-full"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'absolute inset-0 opacity-0' : ''} transition-transform duration-300 hover:scale-105`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

interface EnhancedSpotlightWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const EnhancedSpotlightWidget: React.FC<EnhancedSpotlightWidgetProps> = ({ 
  size, 
  isEditMode = false 
}) => {
  const navigate = useNavigate();
  const { assets, isDemoMode, scenario } = useMarketplaceAssets();
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Get spotlight assets (highest rated or featured assets)
  const spotlightAssets = assets
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Preload spotlight asset images for smooth demo experience
  useEffect(() => {
    if (isDemoMode && spotlightAssets.length > 0) {
      const assetTypes = spotlightAssets.map(asset => asset.type);
      preloadAssetImages(assetTypes)
        .then(() => setImagesPreloaded(true))
        .catch(console.warn);
    }
  }, [isDemoMode, spotlightAssets]);

  // Auto-rotate spotlight for larger widgets
  useEffect(() => {
    if (size === 'large' || size === 'full') {
      const interval = setInterval(() => {
        setCurrentSpotlightIndex((prev) => 
          (prev + 1) % Math.max(1, spotlightAssets.length)
        );
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [size, spotlightAssets.length]);

  // If no spotlight data, show empty state
  if (!isDemoMode && spotlightAssets.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 h-full flex flex-col items-center justify-center">
        <Star className="w-12 h-12 text-yellow-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Featured Assets</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          Check back soon for featured investment opportunities.
        </p>
        <button 
          onClick={() => navigate('/marketplace')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Explore Marketplace
        </button>
      </div>
    );
  }

  const currentAsset = spotlightAssets[currentSpotlightIndex];
  if (!currentAsset) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAssetClick = () => {
    navigate(`/marketplace/assets/${currentAsset.id}`);
  };

  const handleDotClick = (index: number) => {
    setCurrentSpotlightIndex(index);
  };

  if (size === 'small') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spotlight</h3>
          </div>
          {!isEditMode && (
            <button 
              onClick={() => navigate('/marketplace')}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All
            </button>
          )}
        </div>
        
        <div 
          className="flex-1 cursor-pointer group"
          onClick={handleAssetClick}
        >
          <div className="mb-3">
            <AssetImage
              src={currentAsset.imageUrl}
              alt={currentAsset.name}
              className="w-full h-20 object-cover rounded-lg group-hover:scale-105 transition-transform"
              fallbackClassName="w-full h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center rounded-lg"
            />
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 transition-colors">
              {currentAsset.name}
            </h4>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600 dark:text-gray-300">{currentAsset.rating}</span>
              </div>
              <span className="text-sm font-bold text-green-600">{currentAsset.apy}</span>
            </div>
          </div>
        </div>

        {isDemoMode && (
          <div className="text-center mt-2">
            <p className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
              Featured Demo Asset
            </p>
          </div>
        )}
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Featured Investment</h3>
          </div>
          {!isEditMode && (
            <button 
              onClick={() => navigate('/marketplace')}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All
            </button>
          )}
        </div>
        
        <div 
          className="flex-1 cursor-pointer group"
          onClick={handleAssetClick}
        >
          <div className="mb-3">
            <AssetImage
              src={currentAsset.imageUrl}
              alt={currentAsset.name}
              className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
              fallbackClassName="w-full h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 transition-colors">
                {currentAsset.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentAsset.type}
              </p>
            </div>

            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentAsset.location}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600 dark:text-gray-300">{currentAsset.rating}</span>
              </div>
              <span className="text-sm font-bold text-green-600">{currentAsset.apy}</span>
            </div>
          </div>
        </div>

        {/* Asset Navigation Dots */}
        {spotlightAssets.length > 1 && (
          <div className="flex justify-center space-x-2 mt-3">
            {spotlightAssets.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSpotlightIndex 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Large and Full size - Hero-style spotlight with professional imagery
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Star className="w-6 h-6 text-yellow-600 fill-current" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Investment Spotlight</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Featured high-performance assets
              {isDemoMode && (
                <span className="ml-2 text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-xs">
                  Demo: {scenario?.replace('_', ' ')}
                </span>
              )}
            </p>
          </div>
        </div>
        {!isEditMode && (
          <button 
            onClick={() => navigate('/marketplace')}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div 
        className="flex-1 cursor-pointer group relative"
        onClick={handleAssetClick}
      >
        {/* Hero Image */}
        <div className="relative mb-4">
          <AssetImage
            src={currentAsset.imageUrl}
            alt={currentAsset.name}
            className={`w-full ${size === 'full' ? 'h-64' : 'h-48'} object-cover rounded-xl group-hover:scale-105 transition-transform duration-500`}
            fallbackClassName={`w-full ${size === 'full' ? 'h-64' : 'h-48'} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center rounded-xl`}
          />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-white">{currentAsset.rating}</span>
                </div>
                <div className="bg-green-600/90 backdrop-blur-sm rounded-full px-2 py-1">
                  <span className="text-xs font-bold text-white">{currentAsset.apy} APY</span>
                </div>
              </div>
              <h4 className="text-white font-bold text-lg mb-1 group-hover:text-blue-200 transition-colors">
                {currentAsset.name}
              </h4>
              <div className="flex items-center space-x-1 text-white/80">
                <MapPin className="w-3 h-3" />
                <span className="text-sm">{currentAsset.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Token Price</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currentAsset.tokenPrice}
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currentAsset.tokensAvailable.toLocaleString()}
              </p>
            </div>
          </div>

          {size === 'full' && (
            <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Asset Highlights</p>
              <div className="flex flex-wrap gap-2">
                {currentAsset.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-blue-600/80 text-white px-2 py-1 rounded-full backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset Navigation */}
      {spotlightAssets.length > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20 dark:border-gray-700/50">
          <div className="flex space-x-2">
            {spotlightAssets.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSpotlightIndex 
                    ? 'bg-blue-600 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Auto-rotating every 5s</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSpotlightWidget;