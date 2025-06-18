import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Star, MapPin, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { useSimulatedLoading } from '../hooks/useLoading';
import { SkeletonCard, SkeletonStats } from '../components/Loading/Skeleton';
import { Card, StatusBadge, Button } from '../components/UI';

interface AssetListingProps {
  id: string;
  name: string;
  type: string;
  location: string;
  totalValue: string;
  tokenPrice: string;
  tokensAvailable: number;
  totalTokens: number;
  apy: string;
  rating: number;
  imageUrl?: string;
  tags: string[];
}

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const categories = [
    { id: 'all', name: 'All Assets', count: 24 },
    { id: 'real-estate', name: 'Real Estate', count: 12 },
    { id: 'precious-metals', name: 'Precious Metals', count: 5 },
    { id: 'art', name: 'Art & Collectibles', count: 4 },
    { id: 'vehicles', name: 'Luxury Vehicles', count: 3 }
  ];

  // Mock assets data
  const mockAssets: AssetListingProps[] = [
    {
      id: '1',
      name: 'Manhattan Office Complex',
      type: 'Commercial Real Estate',
      location: 'New York, NY',
      totalValue: '$2.5M',
      tokenPrice: '$100',
      tokensAvailable: 15000,
      totalTokens: 25000,
      apy: '8.5%',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      tags: ['Prime Location', 'High Yield']
    },
    {
      id: '2',
      name: 'Gold Bullion Vault',
      type: 'Precious Metals',
      location: 'Swiss Bank',
      totalValue: '$1.2M',
      tokenPrice: '$50',
      tokensAvailable: 8000,
      totalTokens: 24000,
      apy: '6.2%',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop',
      tags: ['Stable', 'Inflation Hedge']
    },
    {
      id: '3',
      name: 'Modern Art Collection',
      type: 'Fine Art',
      location: 'Private Gallery',
      totalValue: '$800K',
      tokenPrice: '$200',
      tokensAvailable: 2000,
      totalTokens: 4000,
      apy: '12.3%',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      tags: ['Appreciation', 'Exclusive']
    },
    {
      id: '4',
      name: 'Luxury Car Fleet',
      type: 'Collectible Vehicles',
      location: 'Monaco',
      totalValue: '$1.8M',
      tokenPrice: '$150',
      tokensAvailable: 5000,
      totalTokens: 12000,
      apy: '9.1%',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop',
      tags: ['Collectible', 'Rental Income']
    },
    {
      id: '5',
      name: 'Miami Beach Resort',
      type: 'Hospitality Real Estate',
      location: 'Miami, FL',
      totalValue: '$5.2M',
      tokenPrice: '$250',
      tokensAvailable: 12000,
      totalTokens: 20800,
      apy: '11.2%',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop',
      tags: ['Tourism', 'Seasonal Income']
    },
    {
      id: '6',
      name: 'Silver Mining Rights',
      type: 'Natural Resources',
      location: 'Colorado, US',
      totalValue: '$950K',
      tokenPrice: '$75',
      tokensAvailable: 7500,
      totalTokens: 12667,
      apy: '7.8%',
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop',
      tags: ['Mining', 'Commodity']
    }
  ];
  
  // Simulate loading state with mock data
  const { isLoading, data: assets } = useSimulatedLoading(mockAssets, 1500);

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
      (selectedCategory === 'precious-metals' && asset.type.toLowerCase().includes('metals')) ||
      (selectedCategory === 'art' && (asset.type.toLowerCase().includes('art') || asset.type.toLowerCase().includes('collectibles'))) ||
      (selectedCategory === 'vehicles' && asset.type.toLowerCase().includes('vehicles'));

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Discover and invest in tokenized real-world assets</p>
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
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{mockAssets.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. APY</p>
                <p className="text-lg font-semibold text-green-600">8.7%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">$12.4M</p>
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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assets found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm 
                      ? `No assets match your search for "${searchTerm}"`
                      : "No assets available"
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