import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import { useTradingStore } from '../../store/tradingStore';
import { formatCurrency, formatPercentage } from '../../utils/format';

const AssetList: React.FC = () => {
  const { 
    assets, 
    selectedAsset, 
    loading, 
    setSelectedAsset, 
    loadAssets 
  } = useTradingStore();

  useEffect(() => {
    if (assets.length === 0) {
      loadAssets();
    }
  }, [assets.length, loadAssets]);

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Available Assets
          </h3>
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Asset List */}
      <div className="p-6 space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => handleAssetSelect(asset)}
            className={`p-4 rounded-xl cursor-pointer transition-all ${
              selectedAsset?.id === asset.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700'
                : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Asset Image */}
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                {asset.imageUrl ? (
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                )}
              </div>

              {/* Asset Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {asset.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {asset.symbol}
                    </p>
                  </div>
                  {asset.verified && (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center ml-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(asset.currentPrice)}
                  </span>
                  <div className={`flex items-center space-x-1 ${
                    asset.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {asset.priceChange24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="text-xs font-medium">
                      {formatPercentage(Math.abs(asset.priceChange24h))}
                    </span>
                  </div>
                </div>

                {/* Volume */}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Available: {asset.availableSupply}</span>
                  <span>Vol: {formatCurrency(asset.volume24h)}</span>
                </div>

                {/* Category */}
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full capitalize">
                    {asset.category.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
          Load More Assets
        </button>
      </div>
    </div>
  );
};

export default AssetList;