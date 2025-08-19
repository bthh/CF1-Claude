import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Vote, Clock, Users, CheckCircle, XCircle, AlertCircle, TrendingUp, Eye, Calendar, Search } from 'lucide-react';
import { useGovernanceStore, type GovernanceProposal } from '../store/governanceStore';
import { useTokenHoldingStore } from '../store/tokenHoldingStore';
import { useSimulatedLoading } from '../hooks/useLoading';
import { SkeletonProposalCard, SkeletonStats } from '../components/Loading/Skeleton';
import { useGovernanceData } from '../services/governanceDataService';
import { useDataMode } from '../store/dataModeStore';

const GovernanceProposalCard: React.FC<GovernanceProposal> = ({
  id,
  title,
  description,
  assetName,
  assetType,
  proposalType,
  status,
  votesFor,
  votesAgainst,
  totalVotes,
  quorumRequired,
  timeLeft,
  proposedBy,
  createdDate,
  impact,
  requiredAmount,
  userVoted
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/governance/proposal/${id}`);
  };
  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;
  const quorumPercentage = (totalVotes / quorumRequired) * 100;

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">Active Voting</span>;
      case 'passed':
        return <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">Passed</span>;
      case 'rejected':
        return <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full">Rejected</span>;
      case 'pending':
        return <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">Pending</span>;
    }
  };

  const getProposalTypeIcon = () => {
    switch (proposalType) {
      case 'dividend':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'renovation':
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'sale':
        return <Eye className="w-5 h-5 text-red-600" />;
      case 'management':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'expansion':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      default:
        return <Vote className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getProposalTypeColor = () => {
    switch (proposalType) {
      case 'dividend':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'renovation':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'sale':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      case 'management':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700';
      case 'expansion':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
      onClick={handleClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getProposalTypeColor()}`}>
                {getProposalTypeIcon()}
                <span className="capitalize">{proposalType}</span>
              </span>
              {getStatusBadge()}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{assetName} • {assetType}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Proposed by</p>
            <p className="font-medium text-gray-900 dark:text-white">{proposedBy}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Created</p>
            <p className="font-medium text-gray-900 dark:text-white">{createdDate}</p>
          </div>
          {requiredAmount && (
            <>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Required Amount</p>
                <p className="font-medium text-gray-900 dark:text-white">{requiredAmount}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Expected Impact</p>
                <p className="font-medium text-green-600">{impact}</p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Voting Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">{totalVotes} / {quorumRequired} votes</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-900 dark:text-white">For ({votesFor})</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{forPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-500 dark:bg-green-400 h-2 rounded-full" 
                style={{ width: `${forPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-gray-900 dark:text-white">Against ({votesAgainst})</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{againstPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-red-500 dark:bg-red-400 h-2 rounded-full" 
                style={{ width: `${againstPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Quorum Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{Math.min(quorumPercentage, 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${quorumPercentage >= 100 ? 'bg-green-500 dark:bg-green-400' : 'bg-yellow-500 dark:bg-yellow-400'}`}
                style={{ width: `${Math.min(quorumPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-5 h-5" />
            <span>{timeLeft}</span>
          </div>
          {userVoted ? (
            <span className={`text-sm px-3 py-1 rounded-full ${
              userVoted === 'for' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              You voted {userVoted}
            </span>
          ) : status === 'active' ? (
            <button 
              className="btn-primary text-sm px-4 py-1"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Vote Now
            </button>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Voting ended</span>
          )}
        </div>
      </div>
    </div>
  );
};

const Governance: React.FC = () => {
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<'active' | 'passed' | 'rejected' | 'all'>('active');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { holdings } = useTokenHoldingStore();
  
  // Data mode integration
  const { proposals, stats, currentMode, isEmpty } = useGovernanceData();
  const { isDemo } = useDataMode();
  
  // Get user's asset IDs for filtering private proposals
  const userAssetIds = useMemo(() => 
    holdings.filter(h => h.balance > 0).map(h => h.assetId), 
    [holdings]
  );
  
  // Simulate loading state for proposals
  const { isLoading, data: loadedProposals } = useSimulatedLoading(proposals, 1200);

  // Set tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/governance/active') {
      setSelectedTab('active');
    } else if (path === '/governance/passed') {
      setSelectedTab('passed');
    } else if (path === '/governance/rejected') {
      setSelectedTab('rejected');
    } else if (path === '/governance' || path === '/governance/my-votes') {
      // Treat base governance route and my-votes view as "All"
      setSelectedTab('all');
    } else {
      setSelectedTab('active'); // default
    }
    
  }, [location.pathname]);

  // Calculate proposal type counts dynamically
  const proposalTypes = [
    { id: 'all', name: 'All Types', count: (loadedProposals || []).length },
    { id: 'dividend', name: 'Dividend Distribution', count: (loadedProposals || []).filter(p => p.proposalType === 'dividend').length },
    { id: 'renovation', name: 'Property Improvements', count: (loadedProposals || []).filter(p => p.proposalType === 'renovation').length },
    { id: 'management', name: 'Management Changes', count: (loadedProposals || []).filter(p => p.proposalType === 'management').length },
    { id: 'expansion', name: 'Business Expansion', count: (loadedProposals || []).filter(p => p.proposalType === 'expansion').length },
    { id: 'sale', name: 'Asset Sale', count: (loadedProposals || []).filter(p => p.proposalType === 'sale').length }
  ];

  const filteredProposals = (loadedProposals || []).filter(proposal => {
    const matchesTab = selectedTab === 'all' || proposal.status === selectedTab;
    const matchesType = selectedType === 'all' || proposal.proposalType === selectedType;
    const matchesSearch = searchTerm === '' || 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.proposedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesType && matchesSearch;
  });

  const tabCounts = {
    active: (loadedProposals || []).filter(p => p.status === 'active').length,
    passed: (loadedProposals || []).filter(p => p.status === 'passed').length,
    rejected: (loadedProposals || []).filter(p => p.status === 'rejected').length,
    all: (loadedProposals || []).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Voting</h1>
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
          <p className="text-gray-600 dark:text-gray-400 mt-1">Participate in asset voting decisions and proposals</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">1,247</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your Voting Power</p>
        </div>
      </div>

      {/* Stats Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-600"></div>

      {isLoading ? (
        <SkeletonStats count={4} />
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-3">
                <Vote className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Proposals</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">89%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Participation Rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg mx-auto mb-3">
                <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingVotes}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Your Vote</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-lg mx-auto mb-3">
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">7</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Days Avg. Duration</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Proposals Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-600"></div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Proposal Types</h3>
            <div className="space-y-2">
              {proposalTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                    selectedType === type.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <span className="text-sm">{type.name}</span>
                  <span className="text-xs">{type.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Assets</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Manhattan Office</p>
                <p className="font-medium">450 tokens</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Gold Vault</p>
                <p className="font-medium">580 tokens</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Art Collection</p>
                <p className="font-medium">125 tokens</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Wine Collection</p>
                <p className="font-medium">92 tokens</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 dark:border-gray-600">
              <nav className="flex space-x-8 px-6">
                {([
                  { key: 'active', label: 'Active', count: tabCounts.active, to: '/governance/active' },
                  { key: 'passed', label: 'Passed', count: tabCounts.passed, to: '/governance/passed' },
                  { key: 'rejected', label: 'Rejected', count: tabCounts.rejected, to: '/governance/rejected' },
                  { key: 'all', label: 'All', count: tabCounts.all, to: '/governance' }
                ] as Array<{ key: 'active' | 'passed' | 'rejected' | 'all'; label: string; count: number; to: string }>).map((tab) => (
                  <Link
                    key={tab.key}
                    to={tab.to}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.key
                        ? 'border-blue-500 dark:border-blue-400 text-blue-600'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </Link>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search proposals by title, description, asset, or proposer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {searchTerm && (
                  <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      Found {filteredProposals.length} proposal{filteredProposals.length !== 1 ? 's' : ''} matching "{searchTerm}"
                    </p>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonProposalCard key={index} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {filteredProposals.map((proposal) => (
                      <GovernanceProposalCard key={proposal.id} {...proposal} />
                    ))}
                  </div>

                  {filteredProposals.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Vote className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm ? 'No proposals found' : 'No governance proposals yet'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {searchTerm 
                          ? `No proposals match your search for "${searchTerm}"`
                          : currentMode === 'production' 
                            ? "No live governance proposals available yet. Switch to Demo mode to explore sample proposals."
                            : currentMode === 'development'
                              ? "No development governance proposals created yet. Create proposals or switch to Demo mode."
                              : "No demo governance proposals available."
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
                        <div className="space-y-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Want to explore governance features? Try our demo mode with sample proposals.
                          </p>
                          <button
                            onClick={() => window.location.href = '/super-admin'}
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Switch to Demo Mode</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Governance;