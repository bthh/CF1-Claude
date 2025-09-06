import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Building2,
  MapPin,
  DollarSign,
  Target,
  Calendar,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import { useSubmissionStore } from '../store/submissionStore';
import { useNotifications } from '../hooks/useNotifications';

const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSubmissionById, deleteDraft } = useSubmissionStore();
  const { success, error } = useNotifications();

  const submission = id ? getSubmissionById(id) : null;

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Submission Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The submission you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/my-submissions')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to My Submissions
          </button>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'submitted':
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          darkColor: 'dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800',
          label: 'Submitted',
          description: 'Your proposal has been submitted and is awaiting initial review.'
        };
      case 'under_review':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          darkColor: 'dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800',
          label: 'Under Review',
          description: 'Our team is currently reviewing your proposal documentation and financials.'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-600 bg-green-50 border-green-200',
          darkColor: 'dark:text-green-400 dark:bg-green-900/20 dark:border-green-800',
          label: 'Approved',
          description: 'Congratulations! Your proposal has been approved and is now live for funding.'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5" />,
          color: 'text-red-600 bg-red-50 border-red-200',
          darkColor: 'dark:text-red-400 dark:bg-red-900/20 dark:border-red-800',
          label: 'Rejected',
          description: 'Your proposal was not approved at this time. Please review the feedback below.'
        };
      case 'changes_requested':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          darkColor: 'dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800',
          label: 'Changes Requested',
          description: 'Please address the requested changes and resubmit your proposal.'
        };
      case 'draft':
        return {
          icon: <Edit className="w-5 h-5" />,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          darkColor: 'dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800',
          label: 'Draft',
          description: 'This is a draft proposal that has not been submitted yet.'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          darkColor: 'dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-800',
          label: 'Unknown',
          description: 'Status unknown.'
        };
    }
  };

  const statusConfig = getStatusConfig(submission.status);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    if (submission.status === 'draft') {
      navigate(`/launchpad/create?draft=${submission.id}`);
    } else if (submission.status === 'changes_requested') {
      // For changes requested, could navigate to edit or show a modal
      navigate(`/launchpad/create?edit=${submission.id}`);
    }
  };

  const handleDelete = () => {
    if (submission.status === 'draft' && window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      deleteDraft(submission.id);
      success('Draft Deleted', 'Your draft has been successfully deleted.');
      navigate('/my-submissions');
    }
  };

  const handleViewLiveProposal = () => {
    // Navigate to the live proposal if it's approved
    navigate(`/launchpad/proposal/${submission.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/my-submissions')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {submission.assetName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {submission.location} • {submission.assetType}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Action buttons based on status */}
          {submission.status === 'draft' && (
            <>
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Continue Editing</span>
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Draft</span>
              </button>
            </>
          )}
          
          {submission.status === 'changes_requested' && (
            <button
              onClick={handleEdit}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Address Changes</span>
            </button>
          )}
          
          {submission.status === 'approved' && (
            <button
              onClick={handleViewLiveProposal}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>View Live Proposal</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className={`border rounded-xl p-6 ${statusConfig.color} ${statusConfig.darkColor}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {statusConfig.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{statusConfig.label}</h3>
            <p className="text-sm mb-4">{statusConfig.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Submitted:</span> {formatDate(submission.submissionDate)}
              </div>
              {submission.reviewDate && (
                <div>
                  <span className="font-medium">Reviewed:</span> {formatDate(submission.reviewDate)}
                </div>
              )}
              {submission.estimatedReviewDate && submission.status === 'submitted' && (
                <div>
                  <span className="font-medium">Estimated Review:</span> {formatDate(submission.estimatedReviewDate)}
                </div>
              )}
              {submission.source && (
                <div>
                  <span className="font-medium">Source:</span> {submission.source === 'backend' ? 'Backend System' : 'Local Submission'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Comments */}
      {submission.reviewComments && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Review Comments</span>
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {submission.reviewComments}
            </p>
            {submission.reviewDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Reviewed on {formatDate(submission.reviewDate)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Asset Details */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
          <Building2 className="w-5 h-5" />
          <span>Asset Details</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Asset Name</label>
                <p className="text-gray-900 dark:text-white">{submission.assetName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Asset Type</label>
                <p className="text-gray-900 dark:text-white">{submission.assetType}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                <p className="text-gray-900 dark:text-white">{submission.category}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </label>
                <p className="text-gray-900 dark:text-white">{submission.location}</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>Target Amount</span>
                </label>
                <p className="text-xl font-bold text-gray-900 dark:text-white">${submission.targetAmount}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Token Price</span>
                </label>
                <p className="text-gray-900 dark:text-white">${submission.tokenPrice}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Expected APY</label>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{submission.expectedAPY}%</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Funding Deadline</span>
                </label>
                <p className="text-gray-900 dark:text-white">
                  {submission.fundingDeadline ? new Date(submission.fundingDeadline).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description and Additional Info */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Description & Details</h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Asset Description</label>
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {submission.description || 'No description provided.'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Risk Factors</label>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                  {submission.riskFactors || 'No risk factors specified.'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Use of Funds</label>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                  {submission.useOfFunds || 'No fund usage details specified.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Documentation</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Business Plan', file: submission.businessPlan },
            { label: 'Financial Projections', file: submission.financialProjections },
            { label: 'Legal Documents', file: submission.legalDocuments },
            { label: 'Asset Valuation', file: submission.assetValuation }
          ].map((doc) => (
            <div key={doc.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {doc.file || 'Not uploaded'}
                </p>
              </div>
              {doc.file && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Funding Status (if approved) */}
      {submission.status === 'approved' && submission.fundingStatus && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Funding Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${submission.fundingStatus.raisedAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Raised</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {submission.fundingStatus.raisedPercentage}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {submission.fundingStatus.investorCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Investors</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  submission.fundingStatus.isFunded ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(submission.fundingStatus.raisedPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetail;