import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, TrendingUp, Rocket, Trophy, DollarSign } from 'lucide-react';

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
  status: 'trending' | 'new' | 'ready-to-launch' | 'high-yield';
  volume24h?: number;
  performance?: number;
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
  tags
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    console.log('Spotlight asset clicked:', name, 'ID:', id);
    navigate(`/marketplace/assets/${id}`);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
      onClick={handleClick}
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

        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

interface SpotlightCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  filter: (assets: SpotlightAsset[]) => SpotlightAsset[];
}

const Performance: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');

  // All assets in one centralized array
  const allAssets: SpotlightAsset[] = [
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
      status: 'trending',
      volume24h: 2340000,
      performance: 8.5
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
      status: 'trending',
      volume24h: 1850000,
      performance: 6.2
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
      status: 'trending',
      volume24h: 1950000,
      performance: 12.1
    },
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
      status: 'new',
      volume24h: 980000,
      performance: 4.1
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
      status: 'new',
      volume24h: 650000,
      performance: 7.3
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
      status: 'new',
      volume24h: 1200000,
      performance: 9.8
    },
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
      status: 'ready-to-launch',
      volume24h: 0,
      performance: 0
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
      status: 'ready-to-launch',
      volume24h: 0,
      performance: 0
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
      apy: '22.5%',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
      tags: ['Biotech', 'Research'],
      status: 'high-yield',
      volume24h: 1800000,
      performance: 15.2
    },
    {
      id: '10',
      name: 'Cryptocurrency Mining Facility',
      type: 'Digital Infrastructure',
      location: 'Iceland',
      totalValue: '$3.8M',
      tokenPrice: '$190.00',
      tokensAvailable: 8000,
      totalTokens: 20000,
      apy: '25.3%',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?w=400&h=300&fit=crop',
      tags: ['Crypto', 'Mining'],
      status: 'high-yield',
      volume24h: 2100000,
      performance: 18.7
    },
    {
      id: '11',
      name: 'Oil & Gas Reserve',
      type: 'Energy',
      location: 'Texas, US',
      totalValue: '$7.2M',
      tokenPrice: '$360.00',
      tokensAvailable: 5000,
      totalTokens: 20000,
      apy: '21.8%',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      tags: ['Energy', 'Commodities'],
      status: 'high-yield',
      volume24h: 2800000,
      performance: 14.9
    }
  ];

  // Define the 4 dynamic categories with filtering logic
  const categories: SpotlightCategory[] = [
    {
      id: 'trending',
      title: 'Trending',
      subtitle: 'Hot Assets',
      icon: <Trophy className="w-5 h-5" />,
      iconColor: 'text-yellow-500',
      filter: (assets) => assets.filter(asset => 
        asset.volume24h && asset.volume24h > 1500000 && 
        asset.performance && asset.performance > 5
      ).slice(0, 6)
    },
    {
      id: 'new',
      title: 'New Launches',
      subtitle: 'Recently Added',
      icon: <Star className="w-5 h-5" />,
      iconColor: 'text-blue-500',
      filter: (assets) => assets.filter(asset => 
        asset.status === 'new'
      ).slice(0, 6)
    },
    {
      id: 'high-yield',
      title: 'High Yield',
      subtitle: 'Premium Returns',
      icon: <DollarSign className="w-5 h-5" />,
      iconColor: 'text-green-500',
      filter: (assets) => assets.filter(asset => 
        parseFloat(asset.apy.replace('%', '')) > 15
      ).sort((a, b) => 
        parseFloat(b.apy.replace('%', '')) - parseFloat(a.apy.replace('%', ''))
      ).slice(0, 6)
    },
    {
      id: 'ready-to-launch',
      title: 'Ready to Launch',
      subtitle: 'Coming Soon',
      icon: <Rocket className="w-5 h-5" />,
      iconColor: 'text-purple-500',
      filter: (assets) => assets.filter(asset => 
        asset.status === 'ready-to-launch'
      ).slice(0, 6)
    }
  ];

  // Get current category data
  const currentCategory = categories.find(cat => cat.id === selectedCategory) || categories[0];
  const displayedAssets = useMemo(() => 
    currentCategory.filter(allAssets), 
    [currentCategory, allAssets]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Spotlight</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Discover trending assets and premium investment opportunities across 4 dynamic categories.</p>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <span className={category.iconColor}>
                {category.icon}
              </span>
              <span>{category.title}</span>
              <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                {currentCategory.id === category.id ? displayedAssets.length : category.filter(allAssets).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Category Content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentCategory.title}</h2>
          <div className="flex items-center space-x-2">
            <span className={currentCategory.iconColor}>
              {currentCategory.icon}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{currentCategory.subtitle}</span>
          </div>
        </div>
        
        {displayedAssets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedAssets.map((asset) => (
              <SpotlightCard key={asset.id} {...asset} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <span className={`${currentCategory.iconColor} inline-block`}>
                {React.cloneElement(currentCategory.icon as React.ReactElement, { className: "w-16 h-16 mx-auto" })}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {currentCategory.title.toLowerCase()} assets found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for new assets in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Performance;