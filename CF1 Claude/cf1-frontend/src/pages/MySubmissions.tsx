import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Download,
  Filter,
  Plus,
  Building2,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useSubmissionStore, type SubmittedProposal } from '../store/submissionStore';

const MySubmissions: React.FC = () => {
  const navigate = useNavigate();
  const { submissions } = useSubmissionStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');


  // Filter submissions based on status
  const filteredSubmissions = submissions.filter(submission => 
    statusFilter === 'all' || submission.status === statusFilter
  );

  // Sort submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
    } else {
      return a.status.localeCompare(b.status);
    }
  });

  const getStatusConfig = (status: SubmittedProposal['status']) => {
    switch (status) {
      case 'submitted':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          darkColor: 'dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800',
          label: 'Submitted'
        };
      case 'under_review':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          darkColor: 'dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800',
          label: 'Under Review'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-green-600 bg-green-50 border-green-200',
          darkColor: 'dark:text-green-400 dark:bg-green-900/20 dark:border-green-800',
          label: 'Approved'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'text-red-600 bg-red-50 border-red-200',
          darkColor: 'dark:text-red-400 dark:bg-red-900/20 dark:border-red-800',
          label: 'Rejected'
        };
      case 'changes_requested':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          darkColor: 'dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800',
          label: 'Changes Requested'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          darkColor: 'dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-800',
          label: 'Unknown'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDays = (estimatedDate?: string) => {
    if (!estimatedDate) return null;
    
    const now = new Date();
    const estimated = new Date(estimatedDate);
    const diffTime = estimated.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Review overdue';
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Submissions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your proposal submissions and review status
          </p>
        </div>
        <button
          onClick={() => navigate('/launchpad/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Proposal</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {submissions.length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Under Review</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {submissions.filter(s => s.status === 'under_review' || s.status === 'submitted').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {submissions.filter(s => s.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${submissions.reduce((sum, s) => sum + parseFloat(s.targetAmount.replace(/,/g, '') || '0'), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="changes_requested">Changes Requested</option>
            </select>
            
            <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredSubmissions.length} of {submissions.length} submissions
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {sortedSubmissions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No submissions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {statusFilter === 'all' 
                ? "You haven't submitted any proposals yet." 
                : `No submissions with status "${statusFilter}" found.`}
            </p>
            <button
              onClick={() => navigate('/launchpad/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Your First Proposal</span>
            </button>
          </div>
        ) : (
          sortedSubmissions.map((submission) => {
            const statusConfig = getStatusConfig(submission.status);
            const estimatedDays = getEstimatedDays(submission.estimatedReviewDate);
            
            return (
              <div
                key={submission.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {submission.assetName}
                      </h3>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color} ${statusConfig.darkColor}`}>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Category</p>
                        <p className="font-medium text-gray-900 dark:text-white">{submission.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Target Amount</p>
                        <p className="font-medium text-gray-900 dark:text-white">${submission.targetAmount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Expected APY</p>
                        <p className="font-medium text-gray-900 dark:text-white">{submission.expectedAPY}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Submitted</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(submission.submissionDate)}</p>
                      </div>
                    </div>
                    
                    {estimatedDays && submission.status === 'submitted' && (
                      <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                        <Calendar className="w-4 h-4" />
                        <span>{estimatedDays}</span>
                      </div>
                    )}
                    
                    {submission.reviewComments && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Review Comments:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{submission.reviewComments}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => navigate(`/my-submissions/${submission.id}`)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MySubmissions;