import React, { useState } from 'react';
import { Vote, Clock, Users, CheckCircle, XCircle, AlertCircle, TrendingUp, Eye, Calendar } from 'lucide-react';

interface ProposalProps {
  id: string;
  title: string;
  description: string;
  assetName: string;
  assetType: string;
  proposalType: 'dividend' | 'renovation' | 'sale' | 'management' | 'expansion';
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorumRequired: number;
  timeLeft: string;
  proposedBy: string;
  createdDate: string;
  endDate: string;
  userVoted?: 'for' | 'against' | null;
  impact: string;
  requiredAmount?: string;
}

const GovernanceProposal: React.FC<ProposalProps> = ({
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer">
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
            <span className="font-medium">{totalVotes} / {quorumRequired} votes</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>For ({votesFor})</span>
              </div>
              <span className="font-medium">{forPercentage.toFixed(1)}%</span>
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
                <span>Against ({votesAgainst})</span>
              </div>
              <span className="font-medium">{againstPercentage.toFixed(1)}%</span>
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
              <span className="font-medium">{Math.min(quorumPercentage, 100).toFixed(1)}%</span>
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
            <button className="btn-primary text-sm px-4 py-1">
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
  const [selectedTab, setSelectedTab] = useState<'active' | 'passed' | 'rejected' | 'all'>('active');
  const [selectedType, setSelectedType] = useState('all');

  const proposalTypes = [
    { id: 'all', name: 'All Types', count: 12 },
    { id: 'dividend', name: 'Dividend Distribution', count: 4 },
    { id: 'renovation', name: 'Property Improvements', count: 3 },
    { id: 'management', name: 'Management Changes', count: 2 },
    { id: 'expansion', name: 'Business Expansion', count: 2 },
    { id: 'sale', name: 'Asset Sale', count: 1 }
  ];

  const proposals: ProposalProps[] = [
    {
      id: '1',
      title: 'Q4 Dividend Distribution',
      description: 'Proposal to distribute quarterly dividends of $2.50 per token based on rental income from Manhattan Office Complex.',
      assetName: 'Manhattan Office Complex',
      assetType: 'Commercial Real Estate',
      proposalType: 'dividend',
      status: 'active',
      votesFor: 1247,
      votesAgainst: 156,
      totalVotes: 1403,
      quorumRequired: 1500,
      timeLeft: '5 days left',
      proposedBy: 'Asset Manager',
      createdDate: 'Dec 3, 2024',
      endDate: 'Dec 10, 2024',
      impact: '+$2.50/token',
      userVoted: null
    },
    {
      id: '2',
      title: 'Lobby Renovation Project',
      description: 'Modernize the main lobby with new marble flooring, LED lighting, and digital directory system to increase property value.',
      assetName: 'Miami Beach Resort',
      assetType: 'Hospitality Real Estate',
      proposalType: 'renovation',
      status: 'active',
      votesFor: 892,
      votesAgainst: 234,
      totalVotes: 1126,
      quorumRequired: 1200,
      timeLeft: '12 days left',
      proposedBy: 'Property Manager',
      createdDate: 'Nov 28, 2024',
      endDate: 'Dec 15, 2024',
      impact: '+8% property value',
      requiredAmount: '$150,000',
      userVoted: 'for'
    },
    {
      id: '3',
      title: 'Change Property Management Company',
      description: 'Switch to a new property management firm with better track record and lower fees to improve net returns.',
      assetName: 'Gold Bullion Vault',
      assetType: 'Precious Metals',
      proposalType: 'management',
      status: 'passed',
      votesFor: 2156,
      votesAgainst: 344,
      totalVotes: 2500,
      quorumRequired: 2000,
      timeLeft: 'Ended',
      proposedBy: 'Token Holder',
      createdDate: 'Nov 15, 2024',
      endDate: 'Nov 30, 2024',
      impact: '-0.5% fees',
      userVoted: 'for'
    },
    {
      id: '4',
      title: 'Expand Wine Storage Facility',
      description: 'Add temperature-controlled storage units to accommodate additional wine inventory and increase revenue potential.',
      assetName: 'Rare Wine Collection',
      assetType: 'Collectibles',
      proposalType: 'expansion',
      status: 'active',
      votesFor: 567,
      votesAgainst: 123,
      totalVotes: 690,
      quorumRequired: 800,
      timeLeft: '8 days left',
      proposedBy: 'Collection Manager',
      createdDate: 'Dec 1, 2024',
      endDate: 'Dec 12, 2024',
      impact: '+15% capacity',
      requiredAmount: '$75,000',
      userVoted: null
    },
    {
      id: '5',
      title: 'Partial Asset Sale - Classic Cars',
      description: 'Sell 3 vehicles from the classic car collection to realize gains and redistribute proceeds to token holders.',
      assetName: 'Classic Car Collection',
      assetType: 'Luxury Vehicles',
      proposalType: 'sale',
      status: 'rejected',
      votesFor: 234,
      votesAgainst: 1456,
      totalVotes: 1690,
      quorumRequired: 1500,
      timeLeft: 'Ended',
      proposedBy: 'Token Holder',
      createdDate: 'Nov 20, 2024',
      endDate: 'Dec 5, 2024',
      impact: '$45,000 distribution',
      userVoted: 'against'
    },
    {
      id: '6',
      title: 'Emergency Maintenance Fund',
      description: 'Establish a reserve fund for emergency repairs and maintenance to ensure proper asset preservation.',
      assetName: 'Multiple Assets',
      assetType: 'General',
      proposalType: 'management',
      status: 'active',
      votesFor: 1123,
      votesAgainst: 67,
      totalVotes: 1190,
      quorumRequired: 1000,
      timeLeft: '3 days left',
      proposedBy: 'Platform Manager',
      createdDate: 'Dec 4, 2024',
      endDate: 'Dec 9, 2024',
      impact: '2% of value reserved',
      requiredAmount: '$50,000',
      userVoted: null
    }
  ];

  const filteredProposals = proposals.filter(proposal => {
    const matchesTab = selectedTab === 'all' || proposal.status === selectedTab;
    const matchesType = selectedType === 'all' || proposal.proposalType === selectedType;
    return matchesTab && matchesType;
  });

  const tabCounts = {
    active: proposals.filter(p => p.status === 'active').length,
    passed: proposals.filter(p => p.status === 'passed').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
    all: proposals.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Governance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Participate in asset governance decisions and voting</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">1,247</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your Voting Power</p>
        </div>
      </div>

      {/* Stats Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-600"></div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-3">
              <Vote className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
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
            <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
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
                {[
                  { key: 'active', label: 'Active', count: tabCounts.active },
                  { key: 'passed', label: 'Passed', count: tabCounts.passed },
                  { key: 'rejected', label: 'Rejected', count: tabCounts.rejected },
                  { key: 'all', label: 'All', count: tabCounts.all }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key as 'active' | 'passed' | 'rejected' | 'all')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.key
                        ? 'border-blue-500 dark:border-blue-400 text-blue-600'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {filteredProposals.map((proposal) => (
                  <GovernanceProposal key={proposal.id} {...proposal} />
                ))}
              </div>

              {filteredProposals.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Vote className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No proposals found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or check back later for new proposals.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Governance;