import React from 'react';
import { Star, MapPin, DollarSign, TrendingUp, Clock, Rocket, Trophy } from 'lucide-react';

interface SpotlightAsset {
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
  status: 'trending' | 'new' | 'ready-to-launch';
}

const SpotlightCard: React.FC<SpotlightAsset> = ({
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
  tags,
  status
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer">
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
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
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
            <span className="font-medium">{tokensAvailable.toLocaleString()} / {totalTokens.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

const Performance: React.FC = () => {
  const trendingAssets: SpotlightAsset[] = [
    {
      id: '1',
      name: 'AI Data Center Complex',
      type: 'Technology Infrastructure',
      location: 'Austin, TX',
      totalValue: '$3.2M',
      tokenPrice: '$125.00',
      tokensAvailable: 8500,
      totalTokens: 20000,
      apy: '15.2%',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
      tags: ['AI', 'Infrastructure'],
      status: 'trending'
    },
    {
      id: '2',
      name: 'Renewable Energy Farm',
      type: 'Green Energy',
      location: 'California, US',
      totalValue: '$2.1M',
      tokenPrice: '$85.50',
      tokensAvailable: 12300,
      totalTokens: 25000,
      apy: '12.8%',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
      tags: ['Renewable', 'ESG'],
      status: 'trending'
    },
    {
      id: '3',
      name: 'Semiconductor Manufacturing',
      type: 'Technology',
      location: 'Taiwan',
      totalValue: '$2.5M',
      tokenPrice: '$310.25',
      tokensAvailable: 3400,
      totalTokens: 8000,
      apy: '18.5%',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
      tags: ['Tech', 'Manufacturing'],
      status: 'trending'
    }
  ];

  const newAssets: SpotlightAsset[] = [
    {
      id: '4',
      name: 'Electric Vehicle Fleet',
      type: 'Transportation',
      location: 'Detroit, MI',
      totalValue: '$2.1M',
      tokenPrice: '$95.75',
      tokensAvailable: 18750,
      totalTokens: 22000,
      apy: '10.3%',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop',
      tags: ['EV', 'Transport'],
      status: 'new'
    },
    {
      id: '5',
      name: 'Urban Vertical Farm',
      type: 'Agriculture Tech',
      location: 'Singapore',
      totalValue: '$1.2M',
      tokenPrice: '$67.90',
      tokensAvailable: 14600,
      totalTokens: 18000,
      apy: '13.7%',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
      tags: ['AgTech', 'Sustainable'],
      status: 'new'
    },
    {
      id: '6',
      name: 'Quantum Computing Lab',
      type: 'Research & Development',
      location: 'Boston, MA',
      totalValue: '$4.5M',
      tokenPrice: '$225.00',
      tokensAvailable: 16000,
      totalTokens: 20000,
      apy: '14.2%',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      tags: ['Quantum', 'R&D'],
      status: 'new'
    }
  ];

  const readyToLaunchAssets: SpotlightAsset[] = [
    {
      id: '7',
      name: 'Luxury Hotel Portfolio',
      type: 'Hospitality',
      location: 'Miami, FL',
      totalValue: '$3.0M',
      tokenPrice: '$200.00',
      tokensAvailable: 15000,
      totalTokens: 15000,
      apy: '11.5%',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop',
      tags: ['Hospitality', 'Luxury'],
      status: 'ready-to-launch'
    },
    {
      id: '8',
      name: 'Space Technology Fund',
      type: 'Aerospace',
      location: 'Cape Canaveral, FL',
      totalValue: '$5.8M',
      tokenPrice: '$290.00',
      tokensAvailable: 20000,
      totalTokens: 20000,
      apy: '16.8%',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=400&h=300&fit=crop',
      tags: ['Space', 'Innovation'],
      status: 'ready-to-launch'
    },
    {
      id: '9',
      name: 'Biotech Research Center',
      type: 'Biotechnology',
      location: 'San Diego, CA',
      totalValue: '$6.2M',
      tokenPrice: '$310.00',
      tokensAvailable: 20000,
      totalTokens: 20000,
      apy: '19.5%',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
      tags: ['Biotech', 'Research'],
      status: 'ready-to-launch'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Spotlight</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Discover trending assets and premium investment opportunities.</p>
        </div>
      </div>

      {/* Trending Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trending</h2>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Hot Assets</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trendingAssets.map((asset) => (
            <SpotlightCard key={asset.id} {...asset} />
          ))}
        </div>
      </div>

      {/* New Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New</h2>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Latest Launches</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {newAssets.map((asset) => (
            <SpotlightCard key={asset.id} {...asset} />
          ))}
        </div>
      </div>

      {/* Ready to Launch Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ready to Launch</h2>
          <div className="flex items-center space-x-2">
            <Rocket className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Coming Soon</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {readyToLaunchAssets.map((asset) => (
            <SpotlightCard key={asset.id} {...asset} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Performance;