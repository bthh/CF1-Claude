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
        return <span className="bg-success-100 text-success-800 text-xs px-2 py-1 rounded-full">Active</span>;
      case 'funded':
        return <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">Funded</span>;
      case 'upcoming':
        return <span className="bg-warning-100 text-warning-800 text-xs px-2 py-1 rounded-full">Coming Soon</span>;
    }
  };

  return (
    <div 
      className="card-hover p-6 cursor-pointer"
      onClick={() => navigate(`/launchpad/proposal/${id}`)}
    >
      <div className="aspect-video bg-secondary-100 rounded-lg mb-4 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
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
            <span className="text-secondary-600 text-xs font-medium">{category}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-secondary-900 text-lg">{title}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-secondary-600 line-clamp-2">{description}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-600">
            <span className="bg-secondary-100 px-2 py-1 rounded-full">{category}</span>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-secondary-600">Target Amount</p>
            <p className="font-semibold text-secondary-900">{targetAmount}</p>
          </div>
          <div>
            <p className="text-secondary-600">Expected APY</p>
            <p className="font-semibold text-success-600">{expectedAPY}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-secondary-600">Raised: {raisedAmount}</span>
            <span className="font-medium">{raisedPercentage}%</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full" 
              style={{ width: `${raisedPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-secondary-600">
              <Users className="w-4 h-4" />
              <span>{backers} backers</span>
            </div>
            <div className="flex items-center space-x-1 text-secondary-600">
              <Clock className="w-4 h-4" />
              <span>{daysLeft} days left</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-secondary-200">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-secondary-600">Minimum Investment</span>
            <span className="font-semibold text-secondary-900">{minimumInvestment}</span>
          </div>
          <button 
            className="w-full btn-primary py-2" 
            disabled={status !== 'active'}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/launchpad/proposal/${id}`);
            }}
          >
            {status === 'active' ? 'View Details' : status === 'funded' ? 'View Details' : 'View Details'}
          </button>
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
          <h1 className="text-3xl font-bold text-secondary-900">Launchpad</h1>
          <p className="text-secondary-600 mt-1">Discover and fund new tokenized asset proposals</p>
        </div>
        <button 
          onClick={() => navigate('/launchpad/create')}
          className="btn-primary px-4 py-2 h-10 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Proposal</span>
        </button>
      </div>

      {/* Stats Section Divider */}
      <div className="border-t border-secondary-200"></div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-3">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">$12.8M</p>
            <p className="text-sm text-secondary-600">Total Raised</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-lg mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">18</p>
            <p className="text-sm text-secondary-600">Active Proposals</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-lg mx-auto mb-3">
              <Users className="w-6 h-6 text-warning-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">1,247</p>
            <p className="text-sm text-secondary-600">Total Investors</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-danger-100 rounded-lg mx-auto mb-3">
              <Calendar className="w-6 h-6 text-danger-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">9.4%</p>
            <p className="text-sm text-secondary-600">Avg. Expected APY</p>
          </div>
        </div>
      </div>

      {/* Categories & Proposals Section Divider */}
      <div className="border-t border-secondary-200"></div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold text-secondary-900 mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-sm">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-secondary-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Success Rate</span>
                <span className="font-medium text-success-600">94%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Avg. Funding Time</span>
                <span className="font-medium">21 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Min. Investment</span>
                <span className="font-medium">$500</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="card">
            <div className="border-b border-secondary-200">
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
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700'
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
                  <div className="w-16 h-16 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-secondary-400" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No proposals found</h3>
                  <p className="text-secondary-600">Try adjusting your filters or check back later for new opportunities.</p>
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