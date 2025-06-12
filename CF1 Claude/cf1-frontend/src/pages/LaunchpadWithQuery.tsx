// CF1 Platform - Launchpad Page with React Query Integration
// Example of using React Query hooks for data fetching and caching

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, TrendingUp, Clock, Target } from 'lucide-react';
import { useProposalsQuery, usePrefetchProposal } from '../hooks/queries';

interface Filters {
  category: string;
  status: string;
  sortBy: 'newest' | 'funded' | 'deadline' | 'apy';
  searchTerm: string;
}

const LaunchpadWithQuery: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    status: 'all',
    sortBy: 'newest',
    searchTerm: ''
  });

  // Use React Query to fetch proposals with caching
  const {
    data: proposalsData,
    isLoading,
    isError,
    error,
    refetch,
    isStale
  } = useProposalsQuery(filters);

  // Prefetch hook for better UX
  const prefetchProposal = usePrefetchProposal();

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMouseEnter = (proposalId: string) => {
    // Prefetch proposal details on hover for instant navigation
    prefetchProposal(proposalId);
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount) / 1000000;
    return num >= 1000000 
      ? `$${(num / 1000000).toFixed(1)}M`
      : num >= 1000 
      ? `$${(num / 1000).toFixed(1)}K`
      : `$${num.toFixed(0)}`;
  };

  const formatProgress = (raised: string, target: string) => {
    const raisedNum = parseFloat(raised);
    const targetNum = parseFloat(target);
    return Math.round((raisedNum / targetNum) * 100);
  };

  const formatTimeLeft = (deadline: number) => {
    const now = Date.now() / 1000;
    const timeLeft = deadline - now;
    const days = Math.floor(timeLeft / 86400);
    return days > 0 ? `${days} days left` : 'Expired';
  };

  const proposals = proposalsData?.proposals || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Launchpad</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover and invest in tokenized real-world assets
            {isStale && (
              <span className="ml-2 text-yellow-600 dark:text-yellow-400 text-sm">
                (Data may be outdated - refreshing...)
              </span>
            )}
          </p>
        </div>
        
        <Link 
          to="/launchpad/create"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Proposal</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search proposals..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
            </div>
            
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Technology">Technology</option>
              <option value="Green Energy">Green Energy</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as Filters['sortBy'])}
            >
              <option value="newest">Newest</option>
              <option value="funded">Most Funded</option>
              <option value="deadline">Ending Soon</option>
              <option value="apy">Highest APY</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <Filter className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading proposals...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="text-red-600 dark:text-red-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-medium">Error loading proposals</h3>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
              <button
                onClick={() => refetch()}
                className="text-red-700 dark:text-red-300 underline text-sm mt-2 hover:text-red-900 dark:hover:text-red-100"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proposals Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal) => (
            <Link
              key={proposal.id}
              to={`/launchpad/proposal/${proposal.id}`}
              onMouseEnter={() => handleMouseEnter(proposal.id)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 group"
            >
              {/* Asset Image Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-blue-600 dark:text-blue-300 text-4xl font-bold">
                  {proposal.asset_details.name.charAt(0)}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {proposal.asset_details.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {proposal.asset_details.location} • {proposal.asset_details.asset_type}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                    {proposal.asset_details.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Target</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatAmount(proposal.financial_terms.target_amount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">APY</p>
                      <p className="font-semibold text-green-600">
                        {proposal.financial_terms.expected_apy}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatProgress(proposal.funding_status.raised_amount, proposal.financial_terms.target_amount)}% funded
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {proposal.funding_status.investor_count} investors
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${formatProgress(proposal.funding_status.raised_amount, proposal.financial_terms.target_amount)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {formatTimeLeft(proposal.financial_terms.funding_deadline)}
                    </span>
                  </div>
                  <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                    {proposal.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && proposals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Target className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No proposals found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your filters or search terms.
          </p>
          <button
            onClick={() => setFilters({ category: 'all', status: 'all', sortBy: 'newest', searchTerm: '' })}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Cache Status for Development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Cache status: {isStale ? 'Stale' : 'Fresh'} | 
          Total proposals: {proposalsData?.total || 0}
        </div>
      )}
    </div>
  );
};

export default LaunchpadWithQuery;