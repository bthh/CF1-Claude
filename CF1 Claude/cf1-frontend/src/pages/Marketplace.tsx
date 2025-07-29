import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Star, MapPin, TrendingUp, SlidersHorizontal, Eye } from 'lucide-react';
import { useSimulatedLoading } from '../hooks/useLoading';
import { SkeletonCard, SkeletonStats } from '../components/Loading/Skeleton';
import { Card, StatusBadge, Button } from '../components/UI';
import { useMarketplaceData, AssetListing } from '../services/marketplaceDataService';
import { useDataMode } from '../store/dataModeStore';

// Import AssetListing type from demo service
type AssetListingProps = AssetListing;

const AssetListing: React.FC<AssetListingProps> = ({
  id,
  name,
  type,
  location,
  totalValue,
  tokenPrice,
  tokensAvailable,
  totalTokens,
  apy,
  rating,
  imageUrl,
  tags
}) => {
  const navigate = useNavigate();
  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
      onClick={() => navigate(`/marketplace/assets/${id}`)}
    >
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
        <img 
          src={imageUrl || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop`} 
          alt={name} 
          className="w-full h-full object-cover" 
        />
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{name}</h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-warning-400 fill-current" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{rating}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{type}</span>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Total Value</p>
            <p className="font-semibold text-gray-900 dark:text-white">{totalValue}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Token Price</p>
            <p className="font-semibold text-gray-900 dark:text-white">{tokenPrice}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Available</span>
            <span className="font-medium text-gray-900 dark:text-white">{tokensAvailable.toLocaleString()} / {totalTokens.toLocaleString()}</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${((totalTokens - tokensAvailable) / totalTokens) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{apy} APY</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/marketplace/assets/${id}`);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  // Data mode integration
  const { assets: marketplaceAssets, quickStats, currentMode, isEmpty } = useMarketplaceData();
  const { isDemo } = useDataMode();

  // Dynamic categories based on current assets
  const generateCategories = (assetList: AssetListing[]) => {
    const categoryCounts = assetList.reduce((acc, asset) => {
      const type = asset.type.toLowerCase();
      if (type.includes('real estate')) acc['real-estate'] = (acc['real-estate'] || 0) + 1;
      else if (type.includes('metal')) acc['precious-metals'] = (acc['precious-metals'] || 0) + 1;
      else if (type.includes('art') || type.includes('collectible')) acc['art'] = (acc['art'] || 0) + 1;
      else if (type.includes('vehicle')) acc['vehicles'] = (acc['vehicles'] || 0) + 1;
      else if (type.includes('energy') || type.includes('renewable')) acc['energy'] = (acc['energy'] || 0) + 1;
      else acc['other'] = (acc['other'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { id: 'all', name: 'All Assets', count: assetList.length },
      { id: 'real-estate', name: 'Real Estate', count: categoryCounts['real-estate'] || 0 },
      { id: 'precious-metals', name: 'Precious Metals', count: categoryCounts['precious-metals'] || 0 },
      { id: 'art', name: 'Art & Collectibles', count: categoryCounts['art'] || 0 },
      { id: 'vehicles', name: 'Luxury Vehicles', count: categoryCounts['vehicles'] || 0 },
      { id: 'energy', name: 'Energy & Infrastructure', count: categoryCounts['energy'] || 0 }
    ].filter(cat => cat.count > 0 || cat.id === 'all');
  };

  // Simulate loading state with demo-aware data
  const { isLoading, data: assets } = useSimulatedLoading(marketplaceAssets, 1500);
  
  const categories = generateCategories(assets || []);

  // Simple search and filter logic
  const filteredAssets = (assets || []).filter(asset => {
    // Search term filter
    const matchesSearch = !searchTerm || 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category filter
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'real-estate' && asset.type.toLowerCase().includes('real estate')) ||
      (selectedCategory === 'precious-metals' && asset.type.toLowerCase().includes('metal')) ||
      (selectedCategory === 'art' && (asset.type.toLowerCase().includes('art') || asset.type.toLowerCase().includes('collectible'))) ||
      (selectedCategory === 'vehicles' && asset.type.toLowerCase().includes('vehicle')) ||
      (selectedCategory === 'energy' && (asset.type.toLowerCase().includes('energy') || asset.type.toLowerCase().includes('renewable')));

    return matchesSearch && matchesCategory;
  });

  // Simple sort logic
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'apy':
        return parseFloat(b.apy.replace('%', '')) - parseFloat(a.apy.replace('%', ''));
      case 'price':
        return parseFloat(a.tokenPrice.replace('$', '').replace(',', '')) - parseFloat(b.tokenPrice.replace('$', '').replace(',', ''));
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
            {isDemo && (
              <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                <Eye className="w-4 h-4" />
                <span className="font-medium">DEMO MODE</span>
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {currentMode.toUpperCase()}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover and invest in tokenized real-world assets
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets by name, type, location, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">Name (A-Z)</option>
            <option value="apy">APY (High to Low)</option>
            <option value="price">Price (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Found {sortedAssets.length} asset{sortedAssets.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </p>
        </div>
      )}

      {/* Categories & Search Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-sm">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Assets</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{quickStats.totalAssets}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. APY</p>
                <p className="text-lg font-semibold text-green-600">{quickStats.avgAPY}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{quickStats.totalVolume}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {sortedAssets.length > 0 ? (
                sortedAssets.map((asset) => (
                  <AssetListing key={asset.id} {...asset} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchTerm ? 'No assets found' : 'No assets available'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm 
                      ? `No assets match your search for "${searchTerm}"`
                      : currentMode === 'production' 
                        ? "No live assets available yet. Switch to Demo mode to explore sample assets."
                        : currentMode === 'development'
                          ? "No development assets created yet. Create proposals via the Launchpad or switch to Demo mode."
                          : "No demo assets available."
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear search
                    </button>
                  )}
                  {!searchTerm && currentMode !== 'demo' && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Want to explore the platform features?
                      </p>
                      <button
                        onClick={() => navigate('/super-admin')}
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Switch to Demo Mode</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center mt-8 space-x-2">
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2">Previous</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2">1</button>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2">2</button>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2">3</button>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;