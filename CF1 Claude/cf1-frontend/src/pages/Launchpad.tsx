import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Target, TrendingUp, Calendar, MapPin, Eye, Plus } from 'lucide-react';

interface ProposalCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  targetAmount: string;
  raisedAmount: string;
  raisedPercentage: number;
  backers: number;
  daysLeft: number;
  expectedAPY: string;
  minimumInvestment: string;
  imageUrl?: string;
  status: 'active' | 'funded' | 'upcoming';
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  id,
  title,
  description,
  category,
  location,
  targetAmount,
  raisedAmount,
  raisedPercentage,
  backers,
  daysLeft,
  expectedAPY,
  minimumInvestment,
  imageUrl,
  status
}) => {
  const navigate = useNavigate();
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs px-2 py-1 rounded-full">Active</span>;
      case 'funded':
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs px-2 py-1 rounded-full">Funded</span>;
      case 'upcoming':
        return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs px-2 py-1 rounded-full">Coming Soon</span>;
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
      onClick={() => navigate(`/launchpad/proposal/${id}`)}
    >
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center mx-auto mb-2">
              {category.includes('Real Estate') ? (
                <div className="w-8 h-8 bg-blue-500 rounded-sm"></div>
              ) : category.includes('Collectibles') || category.includes('Wine') ? (
                <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
              ) : category.includes('Natural Resources') || category.includes('Gold') ? (
                <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
              ) : category.includes('Vehicles') ? (
                <div className="w-8 h-8 bg-red-500 rounded-lg"></div>
              ) : category.includes('Art') ? (
                <div className="w-8 h-8 bg-indigo-500 rounded-sm transform rotate-45"></div>
              ) : (
                <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
              )}
            </div>
            <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">{category}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{title}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{description}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{category}</span>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Target Amount</p>
            <p className="font-semibold text-gray-900 dark:text-white">{targetAmount}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Expected APY</p>
            <p className="font-semibold text-green-600">{expectedAPY}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Raised: {raisedAmount}</span>
            <span className="font-medium">{raisedPercentage}%</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${raisedPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{backers} backers</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{daysLeft} days left</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600 dark:text-gray-400">Minimum Investment</span>
            <span className="font-semibold text-gray-900 dark:text-white">{minimumInvestment}</span>
          </div>
          <div className="flex space-x-2">
            <button 
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg py-2 text-sm font-medium transition-colors" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/launchpad/proposal/${id}`);
              }}
            >
              View Details
            </button>
            <button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg py-2 text-sm font-medium transition-colors" 
              disabled={status !== 'active'}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/launchpad/proposal/${id}?invest=true`);
              }}
            >
              {status === 'active' ? 'Invest' : status === 'funded' ? 'Funded' : 'Coming Soon'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Launchpad: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'active' | 'funded' | 'upcoming'>('active');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories', count: 18 },
    { id: 'real-estate', name: 'Real Estate', count: 8 },
    { id: 'precious-metals', name: 'Precious Metals', count: 3 },
    { id: 'art', name: 'Art & Collectibles', count: 4 },
    { id: 'vehicles', name: 'Luxury Vehicles', count: 2 },
    { id: 'commodities', name: 'Commodities', count: 1 }
  ];

  const proposals: ProposalCardProps[] = [
    {
      id: '1',
      title: 'Downtown Seattle Office Building',
      description: 'Prime commercial real estate in the heart of Seattle\'s business district. Fully leased with AAA tenants and long-term contracts.',
      category: 'Commercial Real Estate',
      location: 'Seattle, WA',
      targetAmount: '$3.2M',
      raisedAmount: '$2.1M',
      raisedPercentage: 66,
      backers: 127,
      daysLeft: 12,
      expectedAPY: '9.2%',
      minimumInvestment: '$500',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
      status: 'active'
    },
    {
      id: '2',
      title: 'Rare Wine Collection Portfolio',
      description: 'Curated collection of vintage wines from premier vineyards. Professional storage and authentication included.',
      category: 'Collectibles',
      location: 'Napa Valley, CA',
      targetAmount: '$850K',
      raisedAmount: '$680K',
      raisedPercentage: 80,
      backers: 89,
      daysLeft: 8,
      expectedAPY: '11.5%',
      minimumInvestment: '$1,000',
      imageUrl: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=600&h=400&fit=crop',
      status: 'active'
    },
    {
      id: '3',
      title: 'Industrial Gold Mining Operation',
      description: 'Established gold mining operation with proven reserves and modern extraction equipment.',
      category: 'Natural Resources',
      location: 'Nevada, US',
      targetAmount: '$5.5M',
      raisedAmount: '$4.2M',
      raisedPercentage: 76,
      backers: 203,
      daysLeft: 15,
      expectedAPY: '8.8%',
      minimumInvestment: '$2,500',
      imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
      status: 'active'
    },
    {
      id: '4',
      title: 'Miami Luxury Condominium Complex',
      description: 'High-end residential development in prime Miami Beach location with ocean views and premium amenities.',
      category: 'Residential Real Estate',
      location: 'Miami, FL',
      targetAmount: '$4.8M',
      raisedAmount: '$4.8M',
      raisedPercentage: 100,
      backers: 156,
      daysLeft: 0,
      expectedAPY: '10.3%',
      minimumInvestment: '$1,500',
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
      status: 'funded'
    },
    {
      id: '5',
      title: 'Classic Car Collection',
      description: 'Portfolio of authenticated classic automobiles with documented provenance and expert maintenance.',
      category: 'Luxury Vehicles',
      location: 'Various Locations',
      targetAmount: '$1.2M',
      raisedAmount: '$0',
      raisedPercentage: 0,
      backers: 0,
      daysLeft: 30,
      expectedAPY: '7.5%',
      minimumInvestment: '$2,000',
      imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop',
      status: 'upcoming'
    },
    {
      id: '6',
      title: 'European Art Masterpieces',
      description: 'Collection of verified authentic artworks from renowned European artists, professionally appraised and insured.',
      category: 'Fine Art',
      location: 'Private Gallery',
      targetAmount: '$2.2M',
      raisedAmount: '$1.5M',
      raisedPercentage: 68,
      backers: 94,
      daysLeft: 18,
      expectedAPY: '13.1%',
      minimumInvestment: '$5,000',
      imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop',
      status: 'active'
    }
  ];

  const filteredProposals = proposals.filter(proposal => {
    const matchesTab = proposal.status === selectedTab;
    const matchesCategory = selectedCategory === 'all' || 
      proposal.category.toLowerCase().includes(selectedCategory.replace('-', ' '));
    return matchesTab && matchesCategory;
  });

  const tabCounts = {
    active: proposals.filter(p => p.status === 'active').length,
    funded: proposals.filter(p => p.status === 'funded').length,
    upcoming: proposals.filter(p => p.status === 'upcoming').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Launchpad</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Discover and fund new tokenized asset proposals</p>
        </div>
        <button 
          onClick={() => navigate('/launchpad/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors px-4 py-2 h-10 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Proposal</span>
        </button>
      </div>

      {/* Stats Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-600"></div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$12.8M</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Raised</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">18</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Proposals</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg mx-auto mb-3">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Investors</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg mx-auto mb-3">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">9.4%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Expected APY</p>
          </div>
        </div>
      </div>

      {/* Categories & Proposals Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-600"></div>

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
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-800'
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
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="font-medium text-green-600">94%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Avg. Funding Time</span>
                <span className="font-medium">21 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Min. Investment</span>
                <span className="font-medium">$500</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 dark:border-gray-600">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'active', label: 'Active', count: tabCounts.active },
                  { key: 'funded', label: 'Funded', count: tabCounts.funded },
                  { key: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key as 'active' | 'funded' | 'upcoming')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} {...proposal} />
                ))}
              </div>

              {filteredProposals.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-secondary-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No proposals found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or check back later for new opportunities.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Launchpad;