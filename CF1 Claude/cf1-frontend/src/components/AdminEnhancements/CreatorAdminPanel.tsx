import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText,
  Eye,
  Edit,
  Check,
  X,
  AlertTriangle,
  Clock,
  BarChart3,
  Settings,
  MessageSquare
} from 'lucide-react';
import { AnimatedButton, AnimatedCounter } from '../LoadingStates/TransitionWrapper';
import { SwipeableModal } from '../GestureComponents/SwipeableModal';
import { SkeletonLoader } from '../LoadingStates/SkeletonLoader';

interface Proposal {
  id: string;
  title: string;
  description: string;
  assetType: string;
  targetAmount: number;
  raisedAmount: number;
  investorCount: number;
  status: 'draft' | 'pending' | 'active' | 'funded' | 'rejected';
  createdAt: number;
  fundingDeadline: number;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadedAt: number;
    verified: boolean;
  }>;
}

interface Analytics {
  totalProposals: number;
  activeProposals: number;
  totalFunding: number;
  averageReturn: number;
  investorGrowth: number;
  conversionRate: number;
}

interface Message {
  id: string;
  from: string;
  subject: string;
  message: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
}

export const CreatorAdminPanel: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'proposals' | 'analytics' | 'messages'>('overview');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalytics({
        totalProposals: 23,
        activeProposals: 8,
        totalFunding: 4250000,
        averageReturn: 14.2,
        investorGrowth: 28.5,
        conversionRate: 73.8
      });

      setProposals([
        {
          id: '1',
          title: 'Green Energy Solar Farm',
          description: 'Large-scale solar installation in Arizona desert with 25-year power purchase agreement',
          assetType: 'Renewable Energy',
          targetAmount: 2500000,
          raisedAmount: 1847000,
          investorCount: 342,
          status: 'active',
          createdAt: Date.now() - 2592000000, // 30 days ago
          fundingDeadline: Date.now() + 1209600000, // 14 days from now
          riskLevel: 'medium',
          expectedReturn: 12.5,
          documents: [
            { id: '1', name: 'Environmental Impact Report.pdf', type: 'pdf', uploadedAt: Date.now() - 86400000, verified: true },
            { id: '2', name: 'Financial Projections.xlsx', type: 'excel', uploadedAt: Date.now() - 172800000, verified: true },
            { id: '3', name: 'Site Survey.pdf', type: 'pdf', uploadedAt: Date.now() - 259200000, verified: false }
          ]
        },
        {
          id: '2',
          title: 'Downtown Commercial Property',
          description: 'Mixed-use development in prime downtown location with retail and office space',
          assetType: 'Commercial Real Estate',
          targetAmount: 5000000,
          raisedAmount: 3200000,
          investorCount: 156,
          status: 'active',
          createdAt: Date.now() - 1728000000, // 20 days ago
          fundingDeadline: Date.now() + 2592000000, // 30 days from now
          riskLevel: 'high',
          expectedReturn: 18.3,
          documents: [
            { id: '4', name: 'Property Valuation.pdf', type: 'pdf', uploadedAt: Date.now() - 345600000, verified: true },
            { id: '5', name: 'Architectural Plans.dwg', type: 'cad', uploadedAt: Date.now() - 432000000, verified: true }
          ]
        },
        {
          id: '3',
          title: 'Organic Farm Investment',
          description: 'Sustainable agriculture project focusing on organic produce for local markets',
          assetType: 'Agriculture',
          targetAmount: 850000,
          raisedAmount: 425000,
          investorCount: 89,
          status: 'pending',
          createdAt: Date.now() - 864000000, // 10 days ago
          fundingDeadline: Date.now() + 1814400000, // 21 days from now
          riskLevel: 'low',
          expectedReturn: 9.8,
          documents: [
            { id: '6', name: 'Business Plan.pdf', type: 'pdf', uploadedAt: Date.now() - 518400000, verified: false },
            { id: '7', name: 'Soil Analysis.pdf', type: 'pdf', uploadedAt: Date.now() - 604800000, verified: true }
          ]
        }
      ]);

      setMessages([
        {
          id: '1',
          from: 'Platform Review Team',
          subject: 'Document Verification Required',
          message: 'Your Organic Farm Investment proposal requires additional documentation for soil quality verification.',
          timestamp: Date.now() - 3600000,
          priority: 'high',
          read: false
        },
        {
          id: '2',
          from: 'Investor Relations',
          subject: 'Investor Question - Solar Farm',
          message: 'An investor has asked about the maintenance schedule for the solar panels. Please provide additional details.',
          timestamp: Date.now() - 7200000,
          priority: 'medium',
          read: false
        },
        {
          id: '3',
          from: 'Legal Team',
          subject: 'Contract Review Complete',
          message: 'The legal review for your Downtown Commercial Property proposal has been completed and approved.',
          timestamp: Date.now() - 14400000,
          priority: 'low',
          read: true
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load creator data:', error);
      setLoading(false);
    }
  };

  const handleProposalAction = async (proposalId: string, action: 'approve' | 'reject' | 'edit') => {
    console.log(`${action} proposal ${proposalId}`);
    // In a real app, this would call the backend
    if (action === 'approve') {
      setProposals(prev => 
        prev.map(p => p.id === proposalId ? { ...p, status: 'active' } : p)
      );
    } else if (action === 'reject') {
      setProposals(prev => 
        prev.map(p => p.id === proposalId ? { ...p, status: 'rejected' } : p)
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 dark:bg-green-900/20';
      case 'pending': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20';
      case 'funded': return 'text-blue-700 bg-blue-100 dark:bg-blue-900/20';
      case 'rejected': return 'text-red-700 bg-red-100 dark:bg-red-900/20';
      case 'draft': return 'text-gray-700 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'proposals', label: 'My Proposals', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'messages', label: 'Messages', icon: MessageSquare }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader variant="text" className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <SkeletonLoader variant="rectangular" className="h-24" />
            </div>
          ))}
        </div>
        <SkeletonLoader variant="rectangular" className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Settings className="w-6 h-6 mr-3 text-blue-600" />
            Creator Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your proposals and track performance
          </p>
        </div>
        <AnimatedButton
          onClick={() => console.log('Create new proposal')}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>New Proposal</span>
        </AnimatedButton>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Proposals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={analytics.totalProposals} />
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-green-600">{analytics.activeProposals}</span> currently active
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Funding</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $<AnimatedCounter value={analytics.totalFunding} decimals={0} />
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600">
              +{analytics.investorGrowth}% investor growth
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Return</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={analytics.averageReturn} decimals={1} suffix="%" />
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {analytics.conversionRate}% conversion rate
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={messages.filter(m => !m.read).length} />
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-red-600">{messages.filter(m => m.priority === 'high' && !m.read).length}</span> high priority
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasNotification = tab.id === 'messages' && messages.filter(m => !m.read).length > 0;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {hasNotification && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'proposals' && (
              <motion.div
                key="proposals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {proposal.title}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                              {proposal.status}
                            </span>
                            <span className={`text-sm font-medium ${getRiskColor(proposal.riskLevel)}`}>
                              {proposal.riskLevel} risk
                            </span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {proposal.description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Target</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                ${proposal.targetAmount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Raised</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                ${proposal.raisedAmount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Investors</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {proposal.investorCount}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Expected Return</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {proposal.expectedReturn}%
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-500 mb-1">
                              <span>Funding Progress</span>
                              <span>{Math.round((proposal.raisedAmount / proposal.targetAmount) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (proposal.raisedAmount / proposal.targetAmount) * 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Documents Status */}
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              Documents: {proposal.documents.filter(d => d.verified).length}/{proposal.documents.length} verified
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              Deadline: {new Date(proposal.fundingDeadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-6">
                          <AnimatedButton
                            onClick={() => {
                              setSelectedProposal(proposal);
                              setShowProposalModal(true);
                            }}
                            variant="secondary"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </AnimatedButton>

                          <AnimatedButton
                            onClick={() => console.log('Edit proposal', proposal.id)}
                            variant="secondary"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </AnimatedButton>

                          {proposal.status === 'pending' && (
                            <>
                              <AnimatedButton
                                onClick={() => handleProposalAction(proposal.id, 'approve')}
                                variant="primary"
                                size="sm"
                                className="flex items-center space-x-1"
                              >
                                <Check className="w-4 h-4" />
                                <span>Approve</span>
                              </AnimatedButton>

                              <AnimatedButton
                                onClick={() => handleProposalAction(proposal.id, 'reject')}
                                variant="danger"
                                size="sm"
                                className="flex items-center space-x-1"
                              >
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </AnimatedButton>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border rounded-lg transition-colors ${
                      message.read 
                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50' 
                        : 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            From: {message.from}
                          </span>
                          {!message.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          {message.subject}
                        </h4>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {message.message}
                        </p>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!message.read && (
                          <AnimatedButton
                            onClick={() => {
                              setMessages(prev => 
                                prev.map(m => m.id === message.id ? { ...m, read: true } : m)
                              );
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            Mark Read
                          </AnimatedButton>
                        )}
                        
                        <AnimatedButton
                          onClick={() => console.log('Reply to message', message.id)}
                          variant="primary"
                          size="sm"
                        >
                          Reply
                        </AnimatedButton>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Proposal Detail Modal */}
      <SwipeableModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        title="Proposal Details"
        className="max-w-4xl mx-auto"
      >
        {selectedProposal && (
          <div className="p-6 space-y-6">
            {/* Proposal Overview */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedProposal.title}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProposal.status)}`}>
                    {selectedProposal.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {selectedProposal.description}
                </p>
              </div>
            </div>

            {/* Funding Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Funding Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Raised:</span>
                    <span>${selectedProposal.raisedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Target:</span>
                    <span>${selectedProposal.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (selectedProposal.raisedAmount / selectedProposal.targetAmount) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {Math.round((selectedProposal.raisedAmount / selectedProposal.targetAmount) * 100)}% Complete
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Investment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Expected Return:</span>
                    <span className="font-medium">{selectedProposal.expectedReturn}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Level:</span>
                    <span className={`font-medium ${getRiskColor(selectedProposal.riskLevel)}`}>
                      {selectedProposal.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Asset Type:</span>
                    <span className="font-medium">{selectedProposal.assetType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investors:</span>
                    <span className="font-medium">{selectedProposal.investorCount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(selectedProposal.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span>{new Date(selectedProposal.fundingDeadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Remaining:</span>
                    <span className="font-medium">
                      {Math.max(0, Math.ceil((selectedProposal.fundingDeadline - Date.now()) / (1000 * 60 * 60 * 24)))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Documents</h4>
              <div className="space-y-3">
                {selectedProposal.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.verified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/20">
                          <Check className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      )}
                      <AnimatedButton
                        onClick={() => console.log('View document', doc.id)}
                        variant="secondary"
                        size="sm"
                      >
                        View
                      </AnimatedButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SwipeableModal>
    </div>
  );
};