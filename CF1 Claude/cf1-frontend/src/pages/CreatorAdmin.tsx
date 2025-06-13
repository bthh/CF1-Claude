import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Eye, 
  Play, 
  Pause, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useCosmJS } from '../hooks/useCosmJS';
import { useNotifications } from '../hooks/useNotifications';
import { formatAmount, formatPercentage, formatTimeAgo } from '../utils/format';

interface ProposalSummary {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'funded' | 'completed' | 'cancelled';
  fundingGoal: number;
  amountRaised: number;
  investorCount: number;
  daysRemaining: number;
  createdAt: string;
  tokenSymbol: string;
  complianceStatus: 'approved' | 'pending' | 'rejected';
}

interface TokenDistribution {
  id: string;
  proposalId: string;
  proposalTitle: string;
  totalTokens: number;
  distributedTokens: number;
  distributionDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  lockupPeriod: number;
}

interface CreatorAnalytics {
  totalProposals: number;
  activeProposals: number;
  totalFundsRaised: number;
  totalInvestors: number;
  successRate: number;
  avgFundingTime: number;
  topPerformingProposal: string;
  recentActivity: Array<{
    type: 'investment' | 'proposal_created' | 'distribution' | 'compliance';
    description: string;
    timestamp: string;
    amount?: number;
  }>;
}

const CreatorAdmin: React.FC = () => {
  const { currentAdmin, checkPermission } = useAdminAuth();
  const { isConnected } = useCosmJS();
  const { success, error } = useNotifications();
  
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [distributions, setDistributions] = useState<TokenDistribution[]>([]);
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'proposals' | 'distributions' | 'analytics'>('overview');

  useEffect(() => {
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await Promise.all([
        loadProposals(),
        loadDistributions(),
        loadAnalytics()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockProposals: ProposalSummary[] = [
      {
        id: '1',
        title: 'Green Energy Storage Facility',
        status: 'active',
        fundingGoal: 2000000,
        amountRaised: 1450000,
        investorCount: 87,
        daysRemaining: 15,
        createdAt: '2024-11-15T10:00:00Z',
        tokenSymbol: 'GESF',
        complianceStatus: 'approved'
      },
      {
        id: '2',
        title: 'Urban Agriculture Network',
        status: 'funded',
        fundingGoal: 1500000,
        amountRaised: 1500000,
        investorCount: 124,
        daysRemaining: 0,
        createdAt: '2024-10-20T14:30:00Z',
        tokenSymbol: 'UAN',
        complianceStatus: 'approved'
      },
      {
        id: '3',
        title: 'Solar Panel Manufacturing',
        status: 'draft',
        fundingGoal: 5000000,
        amountRaised: 0,
        investorCount: 0,
        daysRemaining: 45,
        createdAt: '2024-12-01T09:00:00Z',
        tokenSymbol: 'SPM',
        complianceStatus: 'pending'
      }
    ];
    
    setProposals(mockProposals);
  };

  const loadDistributions = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockDistributions: TokenDistribution[] = [
      {
        id: 'dist_1',
        proposalId: '2',
        proposalTitle: 'Urban Agriculture Network',
        totalTokens: 1500000,
        distributedTokens: 1500000,
        distributionDate: '2024-12-01T00:00:00Z',
        status: 'completed',
        lockupPeriod: 12
      },
      {
        id: 'dist_2',
        proposalId: '1',
        proposalTitle: 'Green Energy Storage Facility',
        totalTokens: 2000000,
        distributedTokens: 0,
        distributionDate: '2024-12-20T00:00:00Z',
        status: 'pending',
        lockupPeriod: 12
      }
    ];
    
    setDistributions(mockDistributions);
  };

  const loadAnalytics = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockAnalytics: CreatorAnalytics = {
      totalProposals: 3,
      activeProposals: 1,
      totalFundsRaised: 2950000,
      totalInvestors: 211,
      successRate: 66.7,
      avgFundingTime: 42,
      topPerformingProposal: 'Urban Agriculture Network',
      recentActivity: [
        {
          type: 'investment',
          description: 'New investment in Green Energy Storage Facility',
          timestamp: '2024-12-05T15:30:00Z',
          amount: 25000
        },
        {
          type: 'distribution',
          description: 'Token distribution completed for Urban Agriculture Network',
          timestamp: '2024-12-01T12:00:00Z'
        },
        {
          type: 'compliance',
          description: 'Compliance review completed for Green Energy Storage Facility',
          timestamp: '2024-11-28T09:15:00Z'
        }
      ]
    };
    
    setAnalytics(mockAnalytics);
  };

  const handleProposalAction = async (proposalId: string, action: 'edit' | 'pause' | 'resume' | 'delete') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (action === 'delete') {
        setProposals(prev => prev.filter(p => p.id !== proposalId));
        success('Proposal deleted successfully');
      } else {
        success(`Proposal ${action} action completed`);
        await loadProposals();
      }
    } catch (err) {
      error(`Failed to ${action} proposal`);
    }
  };

  const handleDistributionAction = async (distributionId: string, action: 'start' | 'pause' | 'cancel') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      success(`Distribution ${action} completed`);
      await loadDistributions();
    } catch (err) {
      error(`Failed to ${action} distribution`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'funded': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'completed': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'pending': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!currentAdmin || !checkPermission('view_proposals')) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the Creator Admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Creator Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your proposals, distributions, and view analytics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadCreatorData}
              className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'proposals', label: 'Proposals', icon: <Package className="w-4 h-4" /> },
              { id: 'distributions', label: 'Distributions', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {selectedTab === 'overview' && analytics && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Proposals</p>
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.totalProposals}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {analytics.activeProposals} active
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Funds Raised</p>
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${formatAmount(analytics.totalFundsRaised)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Across all proposals
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Investors</p>
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.totalInvestors}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Unique investors
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPercentage(analytics.successRate)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Funding success
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'investment' ? 'bg-green-100 dark:bg-green-900/20' :
                        activity.type === 'distribution' ? 'bg-blue-100 dark:bg-blue-900/20' :
                        activity.type === 'compliance' ? 'bg-purple-100 dark:bg-purple-900/20' :
                        'bg-gray-100 dark:bg-gray-900/20'
                      }`}>
                        {activity.type === 'investment' && <DollarSign className="w-4 h-4 text-green-600" />}
                        {activity.type === 'distribution' && <Package className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'compliance' && <CheckCircle className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                          {activity.amount && (
                            <span className="text-xs text-green-600 font-medium">
                              +${formatAmount(activity.amount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Proposals Tab */}
          {selectedTab === 'proposals' && (
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {proposal.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(proposal.status)}`}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Funding Progress</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${formatAmount(proposal.amountRaised)} / ${formatAmount(proposal.fundingGoal)}
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min((proposal.amountRaised / proposal.fundingGoal) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Investors</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {proposal.investorCount}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Days Remaining</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {proposal.daysRemaining}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Compliance</p>
                          <div className="flex items-center space-x-1">
                            {proposal.complianceStatus === 'approved' && <CheckCircle className={`w-4 h-4 ${getComplianceColor(proposal.complianceStatus)}`} />}
                            {proposal.complianceStatus === 'pending' && <Clock className={`w-4 h-4 ${getComplianceColor(proposal.complianceStatus)}`} />}
                            {proposal.complianceStatus === 'rejected' && <AlertTriangle className={`w-4 h-4 ${getComplianceColor(proposal.complianceStatus)}`} />}
                            <span className={`text-sm font-medium ${getComplianceColor(proposal.complianceStatus)}`}>
                              {proposal.complianceStatus.charAt(0).toUpperCase() + proposal.complianceStatus.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {checkPermission('edit_proposals') && (
                        <button
                          onClick={() => handleProposalAction(proposal.id, 'edit')}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit Proposal"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {proposal.status === 'active' && (
                        <button
                          onClick={() => handleProposalAction(proposal.id, 'pause')}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Pause Proposal"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      
                      {proposal.status === 'draft' && checkPermission('delete_proposals') && (
                        <button
                          onClick={() => handleProposalAction(proposal.id, 'delete')}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Proposal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Distributions Tab */}
          {selectedTab === 'distributions' && (
            <div className="space-y-6">
              {distributions.map((distribution) => (
                <div key={distribution.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {distribution.proposalTitle}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(distribution.status)}`}>
                          {distribution.status.replace('_', ' ').charAt(0).toUpperCase() + distribution.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tokens</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatAmount(distribution.totalTokens)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Distributed</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatAmount(distribution.distributedTokens)}
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                              style={{ width: `${(distribution.distributedTokens / distribution.totalTokens) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Distribution Date</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {new Date(distribution.distributionDate).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Lockup Period</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {distribution.lockupPeriod} months
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {distribution.status === 'pending' && checkPermission('manage_distribution') && (
                        <button
                          onClick={() => handleDistributionAction(distribution.id, 'start')}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Start Distribution"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      
                      {distribution.status === 'in_progress' && (
                        <button
                          onClick={() => handleDistributionAction(distribution.id, 'pause')}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Pause Distribution"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPercentage(analytics.successRate)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Success Rate
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Clock className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.avgFundingTime} days
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Avg. Funding Time
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(analytics.totalInvestors / analytics.totalProposals).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Avg. Investors per Proposal
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Performing Proposal
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {analytics.topPerformingProposal}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Highest funding completion rate
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CreatorAdmin;