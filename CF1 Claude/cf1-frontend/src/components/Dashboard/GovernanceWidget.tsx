import React from 'react';
import { Vote, Users, Clock, CheckCircle, XCircle, ArrowRight, Scale, Gavel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo, formatPercentage } from '../../utils/format';

interface GovernanceWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const GovernanceWidget: React.FC<GovernanceWidgetProps> = ({ size, isEditMode = false }) => {
  const navigate = useNavigate();

  // Mock data - replace with real data from store/API
  const governanceStats = {
    activeProposals: 8,
    totalVoters: 1247,
    avgTurnout: 67.3,
    lastVote: '2 hours ago',
    proposals: [
      {
        id: 1,
        title: 'Increase Platform Fee to 3%',
        status: 'active',
        votesFor: 892,
        votesAgainst: 345,
        totalVotes: 1237,
        endTime: '2 days',
        participation: 72.4
      },
      {
        id: 2,
        title: 'Add Stablecoin Support',
        status: 'active',
        votesFor: 1456,
        votesAgainst: 234,
        totalVotes: 1690,
        endTime: '5 days',
        participation: 89.2
      },
      {
        id: 3,
        title: 'Quarterly Treasury Report',
        status: 'passed',
        votesFor: 1623,
        votesAgainst: 145,
        totalVotes: 1768,
        endTime: 'Ended',
        participation: 94.1
      }
    ]
  };

  const handleNavigate = () => {
    navigate('/governance');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'passed': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Governance</h3>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="space-y-3 flex-1">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {governanceStats.activeProposals}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Votes</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <Vote className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatPercentage(governanceStats.avgTurnout)} Turnout
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Governance Activity</h3>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Votes</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {governanceStats.activeProposals}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Turnout</p>
            <p className="text-lg font-bold text-purple-600">
              {formatPercentage(governanceStats.avgTurnout)}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Proposals</p>
          <div className="space-y-1 overflow-hidden">
            {governanceStats.proposals.slice(0, 2).map((proposal) => (
              <div key={proposal.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-900 dark:text-white truncate flex-1 pr-2">
                    {proposal.title}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${getStatusColor(proposal.status)}`}>
                    {proposal.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{proposal.totalVotes} votes</span>
                  <span>{proposal.endTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Large and Full size
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Governance Dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Community voting and proposal management</p>
        </div>
        {!isEditMode && (
          <button 
            onClick={handleNavigate}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      
      <div className={`grid ${size === 'full' ? 'grid-cols-4' : 'grid-cols-2'} gap-4 mb-6`}>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <Vote className="w-6 h-6 text-purple-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Proposals</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {governanceStats.activeProposals}
          </p>
          <p className="text-xs text-purple-600 mt-1">2 ending soon</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <Users className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Voters</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {governanceStats.totalVoters.toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 mt-1">+8% this month</p>
        </div>
        
        {size === 'full' && (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <Scale className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Turnout</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(governanceStats.avgTurnout)}
              </p>
              <p className="text-xs text-green-600 mt-1">Above target</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <Clock className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Vote</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {governanceStats.lastVote}
              </p>
              <p className="text-xs text-orange-600 mt-1">High activity</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Proposals</h4>
        <div className="space-y-3">
          {governanceStats.proposals.map((proposal) => (
            <div key={proposal.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1">{proposal.title}</h5>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{proposal.totalVotes.toLocaleString()} votes</span>
                    <span>{formatPercentage(proposal.participation)} participation</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(proposal.status)}`}>
                    {proposal.status}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{proposal.endTime}</span>
                </div>
              </div>
              
              {proposal.status === 'active' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600 dark:text-gray-400">For: {proposal.votesFor.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-gray-600 dark:text-gray-400">Against: {proposal.votesAgainst.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-l-full" 
                        style={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
                      ></div>
                    </div>
                    <div 
                      className="absolute top-0 right-0 bg-red-600 h-2 rounded-r-full"
                      style={{ width: `${(proposal.votesAgainst / proposal.totalVotes) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GovernanceWidget;