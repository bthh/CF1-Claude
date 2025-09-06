import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Vote, Clock, Users, CheckCircle, XCircle, AlertCircle, AlertTriangle, TrendingUp, Eye, Calendar, Search, Plus, Filter, ChevronDown, X } from 'lucide-react';
import { useGovernanceStore, type GovernanceProposal } from '../store/governanceStore';
import { useTokenHoldingStore } from '../store/tokenHoldingStore';
import { useSimulatedLoading } from '../hooks/useLoading';
import { SkeletonProposalCard } from '../components/Loading/Skeleton';
import { useGovernanceData } from '../services/governanceDataService';
import { useDataMode } from '../store/dataModeStore';
import { getAssetImage } from '../utils/assetImageUtils';

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
  userVoted,
  reviewComments,
  reviewDate,
  reviewedBy
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
      case 'submitted':
        return <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">Under Review</span>;
      case 'under_review':
        return <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">In Review</span>;
      case 'changes_requested':
        return <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>Needs Attention</span>
        </span>;
      case 'approved':
        return <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">Approved</span>;
      default:
        return <span className="bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">{status}</span>;
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

  // Determine if this is a review status proposal
  const isReviewStatus = ['submitted', 'under_review', 'changes_requested', 'approved'].includes(status);

  return (
    <div 
      className={`bg-white dark:bg-gray-800 border ${
        status === 'changes_requested' 
          ? 'border-yellow-300 dark:border-yellow-600' 
          : 'border-gray-200 dark:border-gray-700'
      } rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer`}
      onClick={handleClick}
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          {/* Asset Image */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img 
                src={getAssetImage(assetName, assetType)} 
                alt={assetName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.className = "w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center";
                    parent.innerHTML = `<span class="text-gray-600 dark:text-gray-400 font-semibold">${assetName.charAt(0)}</span>`;
                  }
                }}
              />
            </div>
          </div>

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

        {/* Review Status Content */}
        {isReviewStatus ? (
          <div className="space-y-3">
            {status === 'changes_requested' && reviewComments && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Admin Feedback</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 line-clamp-2">
                      {reviewComments}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {(status === 'submitted' || status === 'under_review') && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Your proposal is being reviewed by platform administrators
                  </p>
                </div>
              </div>
            )}

            {reviewDate && reviewedBy && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Reviewed by {reviewedBy} on {new Date(reviewDate).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          /* Voting Status Content */
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
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            {isReviewStatus ? (
              status === 'changes_requested' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>Action required</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Under review</span>
                </>
              )
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span>{timeLeft}</span>
              </>
            )}
          </div>
          
          {isReviewStatus ? (
            status === 'changes_requested' ? (
              <button 
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-1 rounded-lg font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/governance/create?edit=${id}`);
                }}
              >
                Edit Proposal
              </button>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {status === 'approved' ? 'Ready for voting' : 'Awaiting review'}
              </span>
            )
          ) : (
            userVoted ? (
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
            )
          )}
        </div>
      </div>
    </div>
  );
};

const Governance: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMainTab, setSelectedMainTab] = useState<'all' | 'my-proposals' | 'my-votes' | 'drafts'>('all');
  const [selectedTab, setSelectedTab] = useState<'active' | 'passed' | 'rejected' | 'in-review'>('active');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['all']);
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['all']);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const assetDropdownRef = useRef<HTMLDivElement>(null);
  
  const { holdings } = useTokenHoldingStore();
  const { getDrafts } = useGovernanceStore();
  
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
    } else {
      setSelectedTab('active'); // default
    }
  }, [location.pathname]);

  // Calculate proposal type counts dynamically with memoization
  const proposalTypes = useMemo(() => {
    const proposals = loadedProposals || [];
    return [
      { id: 'all', name: 'All Types', count: proposals.length },
      { id: 'dividend', name: 'Dividend Distribution', count: proposals.filter(p => p.proposalType === 'dividend').length },
      { id: 'renovation', name: 'Property Improvements', count: proposals.filter(p => p.proposalType === 'renovation').length },
      { id: 'management', name: 'Management Changes', count: proposals.filter(p => p.proposalType === 'management').length },
      { id: 'expansion', name: 'Business Expansion', count: proposals.filter(p => p.proposalType === 'expansion').length },
      { id: 'sale', name: 'Asset Sale', count: proposals.filter(p => p.proposalType === 'sale').length }
    ];
  }, [loadedProposals]);

  // User assets data
  const userAssets = useMemo(() => [
    { id: 'all', name: 'All Assets', tokens: 0, count: loadedProposals?.length || 0 },
    { id: 'manhattan-office', name: 'Manhattan Office', tokens: 450, count: loadedProposals?.filter(p => p.assetName === 'Manhattan Office').length || 0 },
    { id: 'gold-vault', name: 'Gold Vault', tokens: 580, count: loadedProposals?.filter(p => p.assetName === 'Gold Vault').length || 0 },
    { id: 'art-collection', name: 'Art Collection', tokens: 125, count: loadedProposals?.filter(p => p.assetName === 'Art Collection').length || 0 },
    { id: 'wine-collection', name: 'Wine Collection', tokens: 92, count: loadedProposals?.filter(p => p.assetName === 'Wine Collection').length || 0 }
  ], [loadedProposals]);

  // Handler functions for multi-select dropdowns
  const handleTypeToggle = (typeId: string) => {
    if (typeId === 'all') {
      setSelectedTypes(['all']);
    } else {
      setSelectedTypes(prev => {
        const newSelection = prev.filter(id => id !== 'all');
        if (newSelection.includes(typeId)) {
          const filtered = newSelection.filter(id => id !== typeId);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newSelection, typeId];
        }
      });
    }
  };

  const handleAssetToggle = (assetId: string) => {
    if (assetId === 'all') {
      setSelectedAssets(['all']);
    } else {
      setSelectedAssets(prev => {
        const newSelection = prev.filter(id => id !== 'all');
        if (newSelection.includes(assetId)) {
          const filtered = newSelection.filter(id => id !== assetId);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newSelection, assetId];
        }
      });
    }
  };

  const handleClearTypes = () => {
    setSelectedTypes(['all']);
    setIsTypeDropdownOpen(false);
  };

  const handleClearAssets = () => {
    setSelectedAssets(['all']);
    setIsAssetDropdownOpen(false);
  };

  const getSelectedTypesDisplay = () => {
    if (selectedTypes.includes('all')) {
      return 'All Types';
    }
    if (selectedTypes.length === 1) {
      const type = proposalTypes.find(t => t.id === selectedTypes[0]);
      return type?.name || 'Types';
    }
    return `${selectedTypes.length} Types`;
  };

  const getSelectedAssetsDisplay = () => {
    if (selectedAssets.includes('all')) {
      return 'All Assets';
    }
    if (selectedAssets.length === 1) {
      const asset = userAssets.find(a => a.id === selectedAssets[0]);
      return asset?.name || 'Assets';
    }
    return `${selectedAssets.length} Assets`;
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (assetDropdownRef.current && !assetDropdownRef.current.contains(event.target as Node)) {
        setIsAssetDropdownOpen(false);
      }
    };

    if (isTypeDropdownOpen || isAssetDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTypeDropdownOpen, isAssetDropdownOpen]);

  const filteredProposals = useMemo(() => {
    const proposals = loadedProposals || [];
    return proposals.filter(proposal => {
      // Filter by main tab
      let matchesMainTab = true;
      if (selectedMainTab === 'my-proposals') {
        matchesMainTab = proposal.proposedBy === 'You' || proposal.proposedBy === 'Current User'; // Mock logic
      } else if (selectedMainTab === 'my-votes') {
        matchesMainTab = proposal.userVoted !== null;
      } else if (selectedMainTab === 'drafts') {
        matchesMainTab = false; // No governance drafts implemented yet
      }
      
      const matchesTab = selectedTab === 'in-review' 
        ? (proposal.status === 'submitted' || proposal.status === 'pending' || proposal.status === 'under_review' || proposal.status === 'changes_requested')
        : proposal.status === selectedTab;
      const matchesType = selectedTypes.includes('all') || selectedTypes.includes(proposal.proposalType);
      const matchesAsset = selectedAssets.includes('all') || 
        selectedAssets.some(assetId => {
          const asset = userAssets.find(a => a.id === assetId);
          return asset && proposal.assetName === asset.name;
        });
      const matchesSearch = searchTerm === '' || 
        proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.proposedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesMainTab && matchesTab && matchesType && matchesAsset && matchesSearch;
    });
  }, [loadedProposals, selectedMainTab, selectedTab, selectedTypes, selectedAssets, searchTerm, userAssets]);

  // Main tab counts
  const mainTabCounts = useMemo(() => {
    const proposals = loadedProposals || [];
    const drafts = getDrafts();
    return {
      all: proposals.length,
      myProposals: proposals.filter(p => p.proposedBy === 'You' || p.proposedBy === 'Current User').length, // Mock logic
      myVotes: proposals.filter(p => p.userVoted !== null).length,
      drafts: drafts.length // Get actual drafts count from governance store
    };
  }, [loadedProposals, getDrafts]);

  const tabCounts = useMemo(() => {
    const proposals = loadedProposals || [];
    
    // Filter proposals based on selected main tab first
    let tabProposals = proposals;
    if (selectedMainTab === 'my-proposals') {
      tabProposals = proposals.filter(p => p.proposedBy === 'You' || p.proposedBy === 'Current User');
    } else if (selectedMainTab === 'my-votes') {
      tabProposals = proposals.filter(p => p.userVoted !== null);
    }
    
    const baseCounts = {
      active: tabProposals.filter(p => p.status === 'active').length,
      passed: tabProposals.filter(p => p.status === 'passed').length,
      rejected: tabProposals.filter(p => p.status === 'rejected').length
    };
    
    // Add in-review count only for My Proposals tab
    if (selectedMainTab === 'my-proposals') {
      return {
        ...baseCounts,
        'in-review': tabProposals.filter(p => p.status === 'submitted' || p.status === 'pending' || p.status === 'under_review' || p.status === 'changes_requested').length
      };
    }
    
    return baseCounts;
  }, [loadedProposals, selectedMainTab]);

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
        <button
          onClick={() => navigate('/governance/create')}
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
              { key: 'all', label: 'All Proposals', count: mainTabCounts.all },
              { key: 'my-proposals', label: 'My Proposals', count: mainTabCounts.myProposals },
              { key: 'my-votes', label: 'My Votes', count: mainTabCounts.myVotes },
              { key: 'drafts', label: 'Drafts', count: mainTabCounts.drafts }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === 'drafts') {
                    navigate('/governance/drafts');
                  } else {
                    setSelectedMainTab(tab.key as any);
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
        {(selectedMainTab === 'all' || selectedMainTab === 'my-proposals' || selectedMainTab === 'my-votes') && (
          <div className="border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between px-6 py-4">
              <nav className="flex space-x-8">
                {(() => {
                  const baseTabs = [
                    { key: 'active', label: 'Active', count: tabCounts.active },
                    { key: 'passed', label: 'Passed', count: tabCounts.passed },
                    { key: 'rejected', label: 'Rejected', count: tabCounts.rejected }
                  ];
                  
                  // Add In Review tab only for My Proposals
                  if (selectedMainTab === 'my-proposals') {
                    baseTabs.splice(1, 0, { key: 'in-review', label: 'In Review', count: (tabCounts as any)['in-review'] || 0 });
                  }
                  
                  return baseTabs;
                })().map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.key
                        ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
              
              {/* Filter Dropdowns */}
              <div className="flex items-center space-x-3">
                {/* Proposal Types Dropdown */}
                <div className="relative" ref={typeDropdownRef}>
                  <button
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Filter className="w-4 h-4" />
                    <span>{getSelectedTypesDisplay()}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isTypeDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Proposal Types</span>
                          {!selectedTypes.includes('all') && (
                            <button
                              onClick={handleClearTypes}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {proposalTypes.map((type) => (
                            <label
                              key={type.id}
                              className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                            >
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedTypes.includes(type.id)}
                                  onChange={() => handleTypeToggle(type.id)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{type.name}</span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{type.count}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Your Assets Dropdown */}
                <div className="relative" ref={assetDropdownRef}>
                  <button
                    onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Users className="w-4 h-4" />
                    <span>{getSelectedAssetsDisplay()}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isAssetDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isAssetDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Your Assets</span>
                          {!selectedAssets.includes('all') && (
                            <button
                              onClick={handleClearAssets}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {userAssets.map((asset) => (
                            <label
                              key={asset.id}
                              className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                            >
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedAssets.includes(asset.id)}
                                  onChange={() => handleAssetToggle(asset.id)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{asset.name}</span>
                                  {asset.tokens > 0 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{asset.tokens} tokens</span>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{asset.count}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
  );
};

export default Governance;