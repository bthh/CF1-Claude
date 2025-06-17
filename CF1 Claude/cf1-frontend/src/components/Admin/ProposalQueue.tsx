import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  FileText,
  MoreVertical
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/format';

export interface ProposalQueueItem {
  id: string;
  title: string;
  creator?: string;
  creatorAddress?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'changes_requested';
  submissionDate: string;
  category?: string;
  targetAmount?: string;
  expectedAPY?: string;
  description?: string;
  type: 'launchpad' | 'governance';
}

interface ProposalQueueProps {
  proposals: ProposalQueueItem[];
  onReview: (proposalId: string) => void;
  onStatusChange: (proposalId: string, newStatus: ProposalQueueItem['status'], comments?: string) => void;
  type: 'launchpad' | 'governance';
}

const ProposalQueue: React.FC<ProposalQueueProps> = ({
  proposals,
  onReview,
  onStatusChange,
  type
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort proposals
  const filteredProposals = proposals
    .filter(proposal => {
      const matchesSearch = searchTerm === '' || 
        proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.creator?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusColor = (status: ProposalQueueItem['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'changes_requested':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: ProposalQueueItem['status']) => {
    switch (status) {
      case 'submitted':
        return <FileText className="w-4 h-4" />;
      case 'under_review':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'changes_requested':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const pendingCount = proposals.filter(p => 
    p.status === 'submitted' || p.status === 'under_review' || p.status === 'changes_requested'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {type === 'launchpad' ? 'Asset' : 'Governance'} Proposal Queue
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {pendingCount} proposal{pendingCount !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="changes_requested">Changes Requested</option>
            </select>
            
            {/* Sort Options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'date' | 'status' | 'title');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="status-asc">Status A-Z</option>
              <option value="status-desc">Status Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Proposals Found
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No proposals match your current filters.' 
                : `No ${type} proposals have been submitted yet.`
              }
            </p>
          </div>
        ) : (
          filteredProposals.map((proposal) => (
            <div key={proposal.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {proposal.title}
                        </h4>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                          {getStatusIcon(proposal.status)}
                          <span className="ml-1">{proposal.status.replace('_', ' ').charAt(0).toUpperCase() + proposal.status.replace('_', ' ').slice(1)}</span>
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {proposal.creator && (
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{proposal.creator}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatTimeAgo(proposal.submissionDate)}</span>
                        </div>
                        {proposal.category && (
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                            {proposal.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Info for Launchpad Proposals */}
                  {type === 'launchpad' && (proposal.targetAmount || proposal.expectedAPY) && (
                    <div className="flex flex-wrap gap-4 mb-3">
                      {proposal.targetAmount && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-3 h-3" />
                          <span>Target: {proposal.targetAmount}</span>
                        </div>
                      )}
                      {proposal.expectedAPY && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          APY: {proposal.expectedAPY}%
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {proposal.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {proposal.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => onReview(proposal.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProposalQueue;