import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Target, TrendingUp, Calendar, MapPin, Eye, Plus, Search, CheckCircle, Filter, ChevronDown, X } from 'lucide-react';
import { SpotlightSection } from '../components/Spotlight/SpotlightSection';
import { useLaunchpadData, LaunchpadProposal } from '../services/launchpadDataService';
import { useDataMode } from '../store/dataModeStore';
import { useSubmissionStore } from '../store/submissionStore';
import { getAssetImage } from '../utils/assetImageUtils';

interface ProposalCardProps extends LaunchpadProposal {
  isUserSubmission?: boolean;
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
  status,
  isUserSubmission = false,
  source
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

  const handleViewDetailsClick = () => {
    navigate(`/launchpad/proposal/${id}`);
  };

  const handleInvestClick = () => {
    navigate(`/launchpad/proposal/${id}?invest=true`);
  };

  return (
    <div className="card-responsive hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex items-start justify-between mb-responsive">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img
              src={getAssetImage(title, category)}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.className = "w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center";
                  parent.innerHTML = `<span class="text-white text-xs font-bold">${title.charAt(0)}</span>`;
                }
              }}
            />
          </div>
          <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">{category}</span>
          {source && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              {source.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">{title}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">{description}</p>
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
            <span className="font-medium text-gray-900 dark:text-white">{raisedPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
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
              <span>{backers}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{daysLeft} days left</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-auto">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600 dark:text-gray-400">Minimum Investment</span>
            <span className="font-semibold text-gray-900 dark:text-white">{minimumInvestment}</span>
          </div>
          <div className="flex space-x-2">
            <button
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg py-2 text-sm font-medium transition-colors"
              onClick={handleViewDetailsClick}
            >
              View Details
            </button>
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg py-2 text-sm font-medium transition-colors"
              disabled={status !== 'active'}
              onClick={handleInvestClick}
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
  const [selectedMainTab, setSelectedMainTab] = useState<'all' | 'submissions' | 'drafts'>('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'active' | 'funded' | 'upcoming'>('active');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Data mode integration
  const { proposals, stats, currentMode, isEmpty } = useLaunchpadData();
  const { isDemo } = useDataMode();
  const { submissions, getDrafts } = useSubmissionStore();

  // Categories based on proposals matching current status tab
  const statusFilteredProposals = proposals.filter(p => p.status === selectedStatusTab);
  const categories = [
    { id: 'all', name: 'All Categories', count: statusFilteredProposals.length },
    { id: 'real-estate', name: 'Real Estate', count: statusFilteredProposals.filter(p => p.category.toLowerCase().includes('real estate')).length },
    { id: 'precious-metals', name: 'Precious Metals', count: statusFilteredProposals.filter(p => p.category.toLowerCase().includes('metals')).length },
    { id: 'art', name: 'Art & Collectibles', count: statusFilteredProposals.filter(p => p.category.toLowerCase().includes('art')).length },
    { id: 'vehicles', name: 'Luxury Vehicles', count: statusFilteredProposals.filter(p => p.category.toLowerCase().includes('vehicles')).length },
    { id: 'commodities', name: 'Commodities', count: statusFilteredProposals.filter(p => p.category.toLowerCase().includes('commodities')).length }
  ].filter(cat => cat.count > 0 || cat.id === 'all');

  const filteredProposals = proposals.filter(proposal => {
    const matchesStatusTab = proposal.status === selectedStatusTab;
    const matchesCategory = selectedCategories.includes('all') || 
      selectedCategories.some(cat => 
        proposal.category.toLowerCase().includes(cat.replace('-', ' '))
      );
    const matchesSearch = searchTerm === '' || 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatusTab && matchesCategory && matchesSearch;
  });

  // Category selection handlers
  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
    } else {
      setSelectedCategories(prev => {
        const newSelection = prev.filter(id => id !== 'all');
        if (newSelection.includes(categoryId)) {
          const filtered = newSelection.filter(id => id !== categoryId);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newSelection, categoryId];
        }
      });
    }
  };

  const handleClearCategories = () => {
    setSelectedCategories(['all']);
    setIsDropdownOpen(false);
  };

  const getSelectedCategoriesDisplay = () => {
    if (selectedCategories.includes('all')) {
      return 'All Categories';
    }
    if (selectedCategories.length === 1) {
      const category = categories.find(cat => cat.id === selectedCategories[0]);
      return category?.name || 'Categories';
    }
    return `${selectedCategories.length} Categories`;
  };

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const mainTabCounts = {
    all: proposals.length,
    submissions: submissions.filter(s => s.status !== 'draft').length,
    drafts: getDrafts().length
  };

  const statusTabCounts = {
    active: proposals.filter(p => p.status === 'active').length,
    funded: proposals.filter(p => p.status === 'funded').length,
    upcoming: proposals.filter(p => p.status === 'upcoming').length
  };

  return (
    <div className="space-y-responsive">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="heading-responsive-xl">Launchpad</h1>
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
            Discover and invest in emerging asset opportunities
          </p>
        </div>
        <button
          onClick={() => navigate('/launchpad/create')}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Proposal</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200 dark:border-gray-600">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Proposals', count: mainTabCounts.all, route: '/launchpad' },
              { key: 'submissions', label: 'My Submissions', count: mainTabCounts.submissions, route: '/my-submissions' },
              { key: 'drafts', label: 'Drafts', count: mainTabCounts.drafts, route: '/launchpad/drafts' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === 'all') {
                    setSelectedMainTab(tab.key as any);
                  } else {
                    navigate(tab.route);
                  }
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedMainTab === tab.key
                    ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between px-6 py-4">
            <nav className="flex space-x-8">
              {[
                { key: 'active', label: 'Active', count: statusTabCounts.active },
                { key: 'funded', label: 'Funded', count: statusTabCounts.funded },
                { key: 'upcoming', label: 'Upcoming', count: statusTabCounts.upcoming }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatusTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedStatusTab === tab.key
                      ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
            
            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Filter className="w-4 h-4" />
                <span>{getSelectedCategoriesDisplay()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Categories</span>
                      {!selectedCategories.includes('all') && (
                        <button
                          onClick={handleClearCategories}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category.id)}
                              onChange={() => handleCategoryToggle(category.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{category.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search proposals by title, description, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProposals.map((proposal) => (
              <ProposalCard key={proposal.id} {...proposal} isUserSubmission={proposal.source === 'development'} />
            ))}
          </div>

          {filteredProposals.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No proposals found' : 'No proposals available'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? `No proposals match your search for "${searchTerm}"`
                  : currentMode === 'production' 
                    ? "No live proposals available yet. Switch to Demo mode to explore sample proposals."
                    : currentMode === 'development'
                      ? "No development proposals created yet. Create a proposal or switch to Demo mode."
                      : "No demo proposals available."
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700 font-medium mr-4"
                >
                  Clear search
                </button>
              )}
              {!searchTerm && currentMode !== 'demo' && (
                <div className="space-x-4">
                  <button
                    onClick={() => navigate('/launchpad/create')}
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Proposal</span>
                  </button>
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
      </div>
    </div>
  );
};

export default Launchpad;