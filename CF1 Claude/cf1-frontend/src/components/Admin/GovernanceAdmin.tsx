import React, { useState } from 'react';
import { Vote, FileText, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import ProposalQueue, { ProposalQueueItem } from './ProposalQueue';
import ProposalReviewModal from './ProposalReviewModal';
import { useGovernanceStore } from '../../store/governanceStore';

interface GovernanceAdminProps {
  selectedSubTab: string;
  setSelectedSubTab: (tab: string) => void;
}

const GovernanceAdmin: React.FC<GovernanceAdminProps> = ({ selectedSubTab, setSelectedSubTab }) => {
  const { 
    getProposalsForAdmin, 
    getProposalsByStatus, 
    updateProposalStatus,
    approveProposal,
    rejectProposal,
    requestChanges,
    saveReviewComments
  } = useGovernanceStore();
  
  const [selectedProposal, setSelectedProposal] = useState<ProposalQueueItem | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Get real governance proposals from store
  const allGovernanceProposals = getProposalsForAdmin();
  const approvedProposals = getProposalsByStatus('approved');
  const rejectedProposals = getProposalsByStatus('rejected');
  const activeProposals = getProposalsByStatus('active');
  
  // Convert to ProposalQueueItem format
  const governanceProposals: ProposalQueueItem[] = [
    ...allGovernanceProposals,
    ...approvedProposals,
    ...rejectedProposals,
    ...activeProposals
  ].map(proposal => ({
    id: proposal.id,
    title: proposal.title,
    creator: proposal.proposedBy,
    status: proposal.status as ProposalQueueItem['status'],
    submissionDate: proposal.submissionDate,
    category: proposal.proposalType,
    description: proposal.description,
    type: 'governance' as const
  }));
  
  const pendingGovernanceProposals = allGovernanceProposals.length;
  const approvedGovernanceProposals = approvedProposals.length + activeProposals.length;
  const rejectedGovernanceProposals = rejectedProposals.length;
  const totalGovernanceProposals = governanceProposals.length;
  
  const handleReviewProposal = (proposalId: string) => {
    const proposal = governanceProposals.find(p => p.id === proposalId);
    if (proposal) {
      setSelectedProposal(proposal);
      setIsReviewModalOpen(true);
    }
  };
  
  const handleStatusChange = (proposalId: string, newStatus: ProposalQueueItem['status'], comments?: string) => {
    // Use the appropriate governance store function based on the new status
    switch (newStatus) {
      case 'approved':
        approveProposal(proposalId, comments);
        break;
      case 'rejected':
        rejectProposal(proposalId, comments);
        break;
      case 'changes_requested':
        requestChanges(proposalId, comments);
        break;
      default:
        updateProposalStatus(proposalId, newStatus, comments);
    }
    
    setIsReviewModalOpen(false);
    setSelectedProposal(null);
  };

  const handleSaveComments = (proposalId: string, comments: string) => {
    saveReviewComments(proposalId, comments);
  };

  // Sub-navigation for Governance section
  const subTabs = [
    { 
      id: 'proposals', 
      label: 'Governance Proposals', 
      icon: <FileText className="w-4 h-4" />, 
      count: pendingGovernanceProposals,
      color: 'teal' 
    }
    // Future: Add more subtabs like 'voting', 'parameters', etc.
  ];

  return (
    <div className="space-y-6">
      {/* Governance Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/10 dark:to-cyan-900/10 rounded-2xl p-6 border border-teal-200 dark:border-teal-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
            <Vote className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Governance Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage governance proposals and platform decisions</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-teal-600">{pendingGovernanceProposals}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{approvedGovernanceProposals}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-red-600">{rejectedGovernanceProposals}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{totalGovernanceProposals}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 border border-gray-200 dark:border-gray-700 shadow-lg">
        <nav className="flex gap-2" role="tablist">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSubTab(tab.id)}
              role="tab"
              aria-selected={selectedSubTab === tab.id}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative ${
                selectedSubTab === tab.id
                  ? `bg-${tab.color}-600 text-white shadow-lg transform scale-105`
                  : `text-gray-600 dark:text-gray-400 hover:bg-${tab.color}-50 dark:hover:bg-${tab.color}-900/20 hover:text-${tab.color}-600 dark:hover:text-${tab.color}-400`
              }`}
            >
              <div className={`p-1 rounded-lg ${
                selectedSubTab === tab.id
                  ? 'bg-white/20'
                  : `bg-${tab.color}-100 dark:bg-${tab.color}-900/30`
              }`}>
                {tab.icon}
              </div>
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                  selectedSubTab === tab.id
                    ? 'bg-white/20 text-white'
                    : `bg-${tab.color}-100 dark:bg-${tab.color}-900/50 text-${tab.color}-600 dark:text-${tab.color}-400`
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      {selectedSubTab === 'proposals' && (
        <ProposalQueue
          proposals={governanceProposals}
          onReview={handleReviewProposal}
          onStatusChange={handleStatusChange}
          type="governance"
        />
      )}

      {/* Review Modal */}
      <ProposalReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedProposal(null);
        }}
        proposal={selectedProposal}
        onStatusChange={handleStatusChange}
        onSaveComments={handleSaveComments}
      />
    </div>
  );
};

export default GovernanceAdmin;