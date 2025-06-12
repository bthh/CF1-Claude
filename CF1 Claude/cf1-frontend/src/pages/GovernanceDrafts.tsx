import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Send, 
  AlertTriangle, 
  Clock, 
  FileText,
  TrendingUp,
  Users,
  Eye,
  DollarSign
} from 'lucide-react';
import { useGovernanceStore, type GovernanceProposal } from '../store/governanceStore';

const DraftCard: React.FC<GovernanceProposal & { onEdit: () => void; onDelete: () => void; onSubmit: () => void; }> = ({
  id,
  title,
  description,
  assetName,
  assetType,
  proposalType,
  createdDate,
  requiredAmount,
  impact,
  onEdit,
  onDelete,
  onSubmit
}) => {
  const getProposalTypeIcon = () => {
    switch (proposalType) {
      case 'dividend':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'renovation':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'sale':
        return <DollarSign className="w-5 h-5 text-red-600" />;
      case 'management':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'expansion':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
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
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'expansion':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getProposalTypeColor()}`}>
                {getProposalTypeIcon()}
                <span className="capitalize">{proposalType}</span>
              </span>
              <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">
                Draft
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
              {title || 'Untitled Draft'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{assetName} • {assetType}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {description || 'No description provided'}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Created</p>
            <p className="font-medium text-gray-900 dark:text-white">{createdDate}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Expected Impact</p>
            <p className="font-medium text-green-600">{impact || 'Not specified'}</p>
          </div>
          {requiredAmount && (
            <div className="col-span-2">
              <p className="text-gray-600 dark:text-gray-400">Required Amount</p>
              <p className="font-medium text-gray-900 dark:text-white">{requiredAmount}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Saved as draft</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Edit draft"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete draft"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onSubmit}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GovernanceDrafts: React.FC = () => {
  const navigate = useNavigate();
  const { getDrafts, deleteDraft, submitDraft } = useGovernanceStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const drafts = getDrafts();

  const handleEditDraft = (draftId: string) => {
    navigate(`/governance/create?draft=${draftId}`);
  };

  const handleDeleteDraft = (draftId: string) => {
    deleteDraft(draftId);
    setShowDeleteConfirm(null);
  };

  const handleSubmitDraft = (draftId: string) => {
    const result = submitDraft(draftId);
    if (result.success && result.proposalId) {
      alert('Draft submitted successfully!');
      navigate(`/governance/proposal/${result.proposalId}`);
    } else {
      alert(`Failed to submit draft: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/governance')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Governance Drafts</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your saved proposal drafts
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{drafts.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Saved Drafts</p>
        </div>
      </div>

      {/* Drafts Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        {drafts.length > 0 ? (
          <div className="p-6">
            <div className="space-y-6">
              {drafts.map((draft) => (
                <DraftCard
                  key={draft.id}
                  {...draft}
                  onEdit={() => handleEditDraft(draft.id)}
                  onDelete={() => setShowDeleteConfirm(draft.id)}
                  onSubmit={() => handleSubmitDraft(draft.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No drafts saved</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start creating a governance proposal to save it as a draft.
            </p>
            <button
              onClick={() => navigate('/governance/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Create New Proposal
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Draft</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this draft? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDraft(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernanceDrafts;