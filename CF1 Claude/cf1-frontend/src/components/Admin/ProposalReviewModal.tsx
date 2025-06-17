import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  DollarSign,
  Calendar,
  MapPin,
  Target,
  Percent,
  User,
  Download,
  ExternalLink,
  Save
} from 'lucide-react';
import { ProposalQueueItem } from './ProposalQueue';

interface ProposalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalQueueItem | null;
  proposalDetails?: any; // Additional details from the store
  onStatusChange: (proposalId: string, newStatus: ProposalQueueItem['status'], comments: string) => void;
  onSaveComments?: (proposalId: string, comments: string) => void; // New function for saving comments only
}

const ProposalReviewModal: React.FC<ProposalReviewModalProps> = ({
  isOpen,
  onClose,
  proposal,
  proposalDetails,
  onStatusChange,
  onSaveComments
}) => {
  const [reviewComments, setReviewComments] = useState('');
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'request_changes' | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleActionClick = (action: 'approve' | 'reject' | 'request_changes') => {
    setSelectedAction(action);
    setShowConfirmation(true);
  };

  const handleConfirmAction = () => {
    if (!proposal || !selectedAction || !reviewComments.trim()) return;

    const statusMap = {
      approve: 'approved' as const,
      reject: 'rejected' as const,
      request_changes: 'changes_requested' as const
    };

    onStatusChange(proposal.id, statusMap[selectedAction], reviewComments);
    onClose();
    setReviewComments('');
    setSelectedAction(null);
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedAction(null);
  };

  const handleSaveComments = () => {
    if (!proposal || !reviewComments.trim()) return;
    
    if (onSaveComments) {
      onSaveComments(proposal.id, reviewComments);
      // Show success feedback but don't close modal
      alert('Comments saved successfully!');
    }
  };

  if (!isOpen || !proposal) return null;

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
        return 'bg-green-600 hover:bg-green-700';
      case 'reject':
        return 'bg-red-600 hover:bg-red-700';
      case 'request_changes':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve':
        return <CheckCircle className="w-4 h-4" />;
      case 'reject':
        return <XCircle className="w-4 h-4" />;
      case 'request_changes':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Review {proposal.type === 'launchpad' ? 'Asset' : 'Governance'} Proposal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Submitted {new Date(proposal.submissionDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Proposal Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {proposal.title}
                </p>
              </div>
              
              {proposal.creator && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Creator
                  </label>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">{proposal.creator}</span>
                  </div>
                </div>
              )}
              
              {proposal.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <span className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-full text-sm">
                    {proposal.category}
                  </span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <span className="inline-block bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded-full text-sm">
                  {proposal.status.replace('_', ' ').charAt(0).toUpperCase() + proposal.status.replace('_', ' ').slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Information (for Launchpad proposals) */}
          {proposal.type === 'launchpad' && (proposal.targetAmount || proposal.expectedAPY) && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Financial Terms
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {proposal.targetAmount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Amount
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      {proposal.targetAmount}
                    </p>
                  </div>
                )}
                
                {proposal.expectedAPY && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expected APY
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      {proposal.expectedAPY}%
                    </p>
                  </div>
                )}
                
                {proposalDetails?.minimumInvestment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Minimum Investment
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${proposalDetails.minimumInvestment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {proposal.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-gray-900 dark:text-white leading-relaxed">
                  {proposal.description}
                </p>
              </div>
            </div>
          )}

          {/* Additional Details (from proposalDetails) */}
          {proposalDetails && (
            <div className="space-y-4">
              {proposalDetails.riskFactors && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Risk Factors
                  </h3>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-gray-900 dark:text-white">
                      {proposalDetails.riskFactors}
                    </p>
                  </div>
                </div>
              )}

              {proposalDetails.useOfFunds && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Use of Funds
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-gray-900 dark:text-white">
                      {proposalDetails.useOfFunds}
                    </p>
                  </div>
                </div>
              )}

              {/* Documents */}
              {(proposalDetails.businessPlan || proposalDetails.financialProjections || 
                proposalDetails.legalDocuments || proposalDetails.assetValuation) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Uploaded Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {proposalDetails.businessPlan && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-900 dark:text-white">Business Plan</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {proposalDetails.financialProjections && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-900 dark:text-white">Financial Projections</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {proposalDetails.legalDocuments && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-900 dark:text-white">Legal Documents</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {proposalDetails.assetValuation && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-900 dark:text-white">Asset Valuation</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Review Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Review Comments *
            </label>
            <textarea
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="Enter your review comments here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Comments are required for all review actions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!showConfirmation ? (
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              
              {/* Save Comments Button - Available for all proposals */}
              <button
                onClick={handleSaveComments}
                disabled={!reviewComments.trim()}
                className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Save Comments</span>
              </button>
              
              {(proposal.status === 'submitted' || proposal.status === 'under_review' || proposal.status === 'changes_requested') && (
                <>
                  <button
                    onClick={() => handleActionClick('request_changes')}
                    disabled={!reviewComments.trim()}
                    className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getActionColor('request_changes')}`}
                  >
                    {getActionIcon('request_changes')}
                    <span>Request Changes</span>
                  </button>
                  
                  <button
                    onClick={() => handleActionClick('reject')}
                    disabled={!reviewComments.trim()}
                    className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getActionColor('reject')}`}
                  >
                    {getActionIcon('reject')}
                    <span>Reject</span>
                  </button>
                  
                  <button
                    onClick={() => handleActionClick('approve')}
                    disabled={!reviewComments.trim()}
                    className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getActionColor('approve')}`}
                  >
                    {getActionIcon('approve')}
                    <span>Approve</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 px-6 py-4 border-t border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                  Confirm {selectedAction?.replace('_', ' ')} action for "{proposal.title}"?
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors ${getActionColor(selectedAction || '')}`}
                >
                  {getActionIcon(selectedAction || '')}
                  <span>Confirm {selectedAction?.replace('_', ' ')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalReviewModal;