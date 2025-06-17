import React, { useState } from 'react';
import { Target, FileText, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useSubmissionStore } from '../../store/submissionStore';
import ProposalQueue, { ProposalQueueItem } from './ProposalQueue';
import ProposalReviewModal from './ProposalReviewModal';

interface LaunchpadAdminProps {
  selectedSubTab: string;
  setSelectedSubTab: (tab: string) => void;
}

const LaunchpadAdmin: React.FC<LaunchpadAdminProps> = ({ selectedSubTab, setSelectedSubTab }) => {
  const { getSubmissionsByStatus, updateSubmissionStatus, saveReviewComments } = useSubmissionStore();
  const [selectedProposal, setSelectedProposal] = useState<ProposalQueueItem | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Get proposals by status
  const submittedProposals = getSubmissionsByStatus('submitted');
  const underReviewProposals = getSubmissionsByStatus('under_review');
  const approvedProposals = getSubmissionsByStatus('approved');
  const rejectedProposals = getSubmissionsByStatus('rejected');
  const changesRequestedProposals = getSubmissionsByStatus('changes_requested');
  
  const pendingCount = submittedProposals.length + underReviewProposals.length + changesRequestedProposals.length;
  const totalProposals = submittedProposals.length + underReviewProposals.length + approvedProposals.length + rejectedProposals.length + changesRequestedProposals.length;

  // Convert submissions to ProposalQueueItem format
  const allProposals: ProposalQueueItem[] = [
    ...submittedProposals,
    ...underReviewProposals,
    ...approvedProposals,
    ...rejectedProposals,
    ...changesRequestedProposals
  ].map(submission => ({
    id: submission.id,
    title: submission.assetName || 'Untitled Asset',
    creator: 'Asset Creator', // TODO: Add createdBy field to SubmittedProposal interface
    status: submission.status as ProposalQueueItem['status'],
    submissionDate: submission.submissionDate,
    category: submission.assetType,
    targetAmount: submission.targetAmount ? `$${Number(submission.targetAmount.replace(/,/g, '')).toLocaleString()}` : undefined,
    expectedAPY: submission.expectedAPY ? submission.expectedAPY.toString() : undefined,
    description: submission.businessPlan || submission.useOfFunds,
    type: 'launchpad' as const
  }));

  const handleReviewProposal = (proposalId: string) => {
    const proposal = allProposals.find(p => p.id === proposalId);
    if (proposal) {
      setSelectedProposal(proposal);
      setIsReviewModalOpen(true);
    }
  };

  const handleStatusChange = (proposalId: string, newStatus: ProposalQueueItem['status'], comments?: string) => {
    updateSubmissionStatus(proposalId, newStatus, comments);
    setIsReviewModalOpen(false);
    setSelectedProposal(null);
  };

  const handleSaveComments = (proposalId: string, comments: string) => {
    saveReviewComments(proposalId, comments);
  };

  // Sub-navigation for Launchpad section
  const subTabs = [
    { 
      id: 'proposals', 
      label: 'Asset Proposals', 
      icon: <FileText className="w-4 h-4" />, 
      count: pendingCount,
      color: 'orange' 
    }
    // Future: Add more subtabs like 'settings', 'metrics', etc.
  ];

  return (
    <div className="space-y-6">
      {/* Launchpad Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Launchpad Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage asset tokenization proposals and approvals</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{approvedProposals.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-red-600">{rejectedProposals.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{totalProposals}</div>
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
          proposals={allProposals}
          onReview={handleReviewProposal}
          onStatusChange={handleStatusChange}
          type="launchpad"
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

export default LaunchpadAdmin;