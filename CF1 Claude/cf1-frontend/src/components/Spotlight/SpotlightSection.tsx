import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, Star, Flame, Clock, MapPin, DollarSign, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SpotlightAsset {
  id: string;
  name: string;
  type: string;
  location: string;
  totalValue: string;
  raisedAmount: string;
  raisedPercentage: number;
  apy: string;
  backers: number;
  daysLeft: number;
  imageUrl: string;
  tags: string[];
  category: 'trending' | 'featured' | 'hot' | 'ending-soon';
  isNew?: boolean;
  verified?: boolean;
  premiumBadge?: string;
}

const spotlightData: SpotlightAsset[] = [
  // Trending Section
  {
    id: 'trending_1',
    name: 'Manhattan Premium Office Tower',
    type: 'Commercial Real Estate',
    location: 'New York, NY',
    totalValue: '$15,000,000',
    raisedAmount: '$12,750,000',
    raisedPercentage: 85,
    apy: '12.5%',
    backers: 847,
    daysLeft: 12,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    tags: ['Prime Location', 'Blue Chip Tenant', 'AAA Rated'],
    category: 'trending',
    verified: true,
    premiumBadge: 'Institutional Grade'
  },
  {
    id: 'trending_2',
    name: 'Solar Energy Project Nevada',
    type: 'Renewable Energy',
    location: 'Nevada, USA',
    totalValue: '$8,500,000',
    raisedAmount: '$6,800,000',
    raisedPercentage: 80,
    apy: '14.2%',
    backers: 532,
    daysLeft: 8,
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
    tags: ['Green Energy', 'Government Backed', 'Tax Benefits'],
    category: 'trending',
    verified: true
  },
  {
    id: 'trending_3',
    name: 'Vintage Wine Collection Series A',
    type: 'Collectibles',
    location: 'Bordeaux, France',
    totalValue: '$2,200,000',
    raisedAmount: '$1,760,000',
    raisedPercentage: 80,
    apy: '18.7%',
    backers: 234,
    daysLeft: 15,
    imageUrl: 'https://images.unsplash.com/photo-1506377247380-78c93cc7ed3b?w=800&h=600&fit=crop',
    tags: ['Rare Collection', 'Expert Curated', 'Insurance Included'],
    category: 'trending',
    verified: true
  },
  // Featured Section
  {
    id: 'featured_1',
    name: 'Miami Beach Luxury Resort',
    type: 'Hospitality Real Estate',
    location: 'Miami Beach, FL',
    totalValue: '$25,000,000',
    raisedAmount: '$18,750,000',
    raisedPercentage: 75,
    apy: '16.8%',
    backers: 1240,
    daysLeft: 22,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
    tags: ['Oceanfront', 'Luxury Brand', 'High Occupancy'],
    category: 'featured',
    verified: true,
    premiumBadge: 'Flagship Property'
  },
  {
    id: 'featured_2',
    name: 'Tesla Supercharger Network Expansion',
    type: 'Infrastructure',
    location: 'California, USA',
    totalValue: '$12,000,000',
    raisedAmount: '$8,400,000',
    raisedPercentage: 70,
    apy: '15.3%',
    backers: 892,
    daysLeft: 18,
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop',
    tags: ['EV Infrastructure', 'Growth Sector', 'Partnership'],
    category: 'featured',
    verified: true,
    isNew: true
  },
  // Hot Section
  {
    id: 'hot_1',
    name: 'Rare Earth Mining Operation',
    type: 'Natural Resources',
    location: 'Montana, USA',
    totalValue: '$6,800,000',
    raisedAmount: '$6,120,000',
    raisedPercentage: 90,
    apy: '22.4%',
    backers: 456,
    daysLeft: 5,
    imageUrl: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=800&h=600&fit=crop',
    tags: ['Critical Minerals', 'Strategic Resource', 'Supply Chain'],
    category: 'hot',
    verified: true
  },
  {
    id: 'hot_2',
    name: 'AI Data Center Portfolio',
    type: 'Technology Infrastructure',
    location: 'Austin, TX',
    totalValue: '$18,500,000',
    raisedAmount: '$16,650,000',
    raisedPercentage: 90,
    apy: '19.6%',
    backers: 1100,
    daysLeft: 3,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    tags: ['AI Infrastructure', 'Cloud Computing', 'High Demand'],
    category: 'hot',
    verified: true,
    premiumBadge: 'Tech Leader'
  },
  // Ending Soon
  {
    id: 'ending_1',
    name: 'European Logistics Hub',
    type: 'Industrial Real Estate',
    location: 'Rotterdam, Netherlands',
    totalValue: '$9,200,000',
    raisedAmount: '$7,820,000',
    raisedPercentage: 85,
    apy: '13.7%',
    backers: 623,
    daysLeft: 2,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
    tags: ['Strategic Location', 'E-commerce Growth', 'Long-term Lease'],
    category: 'ending-soon',
    verified: true
  }
];

interface SpotlightSectionProps {
  className?: string;
  mode?: 'full' | 'compact'; // full shows tabs + scrolling, compact focuses on scrolling
}

export const SpotlightSection: React.FC<SpotlightSectionProps> = ({ className = '', mode = 'full' }) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'featured' | 'hot' | 'ending-soon'>('trending');
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const tabs = [
    { id: 'trending' as const, label: 'Trending Now', icon: TrendingUp, color: 'blue' },
    { id: 'featured' as const, label: 'Featured', icon: Star, color: 'yellow' },
    { id: 'hot' as const, label: 'Hot Deals', icon: Flame, color: 'red' },
    { id: 'ending-soon' as const, label: 'Ending Soon', icon: Clock, color: 'orange' }
  ];

  const currentAssets = spotlightData.filter(asset => asset.category === activeTab);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = 320; // Approximate card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleTabScroll = (tabIndex: number) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = 320;
    const targetScroll = tabIndex * cardWidth;
    
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScrollUpdate = () => {
      setScrollPosition(container.scrollLeft);
    };

    container.addEventListener('scroll', handleScrollUpdate);
    return () => container.removeEventListener('scroll', handleScrollUpdate);
  }, []);

  const getTabColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      red: 'bg-red-500 text-white',
      orange: 'bg-orange-500 text-white'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Tabs */}
      <div className="flex flex-col space-y-4">
        {/* Only show full header in full mode */}
        {mode === 'full' && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Spotlight</h2>
              <p className="text-gray-600 dark:text-gray-400">Discover premium investment opportunities across categories</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleScroll('left')}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Compact mode navigation */}
        {mode === 'compact' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        handleTabScroll(index);
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? getTabColor(tab.color)
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      title={tab.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleScroll('left')}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Interactive Tabs - only show in full mode */}
        {mode === 'full' && (
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    handleTabScroll(index);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 flex-1 justify-center ${
                    isActive
                      ? getTabColor(tab.color)
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                  {isActive && (
                    <span className="bg-white bg-opacity-30 text-xs px-2 py-0.5 rounded-full">
                      {currentAssets.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Scrollable Cards Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <AnimatePresence>
            {currentAssets.map((asset, index) => (
              <motion.div
                key={`${activeTab}-${asset.id}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                onClick={() => navigate(`/marketplace/assets/${asset.id}`)}
              >
                {/* Image with Overlay */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex space-x-2">
                    {asset.verified && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                    {asset.isNew && (
                      <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                    {asset.premiumBadge && (
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                        {asset.premiumBadge}
                      </span>
                    )}
                  </div>

                  {/* Quick Stats Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-white text-sm font-medium">{asset.apy} APY</p>
                        <p className="text-white/80 text-xs">{asset.daysLeft} days left</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">{asset.raisedPercentage}% funded</p>
                        <p className="text-white/80 text-xs">{asset.backers} backers</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {asset.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{asset.type}</span>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span>{asset.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-900 dark:text-white font-medium">{asset.raisedAmount}</span>
                      <span className="text-gray-600 dark:text-gray-400">{asset.totalValue}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${asset.raisedPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{asset.backers} investors</span>
                    </div>
                    <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-4 space-x-1">
          {Array.from({ length: Math.ceil(currentAssets.length / 2) }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(scrollPosition / 640) === index
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              onClick={() => {
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTo({
                    left: index * 640,
                    behavior: 'smooth'
                  });
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <button
          onClick={() => navigate('/marketplace')}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span>Explore All Opportunities</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};