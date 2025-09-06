import React from 'react';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Building2,
  FileText,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react';

interface ProposalReviewDetailProps {
  proposal: any;
  showAdminComments?: boolean;
}

export const ProposalReviewDetail: React.FC<ProposalReviewDetailProps> = ({ 
  proposal, 
  showAdminComments = true 
}) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
      case 'under_review':
        return {
          icon: <Clock className="w-6 h-6" />,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          darkColor: 'dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800',
          label: 'Under Review',
          description: 'This proposal is currently being reviewed by our team. We\'ll notify you once the review is complete.',
          bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
        };
      case 'approved':
      case 'active':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          color: 'text-green-600 bg-green-50 border-green-200',
          darkColor: 'dark:text-green-400 dark:bg-green-900/20 dark:border-green-800',
          label: 'Approved & Live',
          description: 'Congratulations! Your proposal has been approved and is now accepting investments.',
          bgGradient: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-6 h-6" />,
          color: 'text-red-600 bg-red-50 border-red-200',
          darkColor: 'dark:text-red-400 dark:bg-red-900/20 dark:border-red-800',
          label: 'Not Approved',
          description: 'Your proposal was not approved at this time. Please review the feedback below and consider resubmitting.',
          bgGradient: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'
        };
      case 'changes_requested':
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          darkColor: 'dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800',
          label: 'Changes Requested',
          description: 'Please address the requested changes below and resubmit your proposal for review.',
          bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20'
        };
      default:
        return {
          icon: <Clock className="w-6 h-6" />,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          darkColor: 'dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-800',
          label: 'Pending',
          description: 'Your proposal is in the review queue.',
          bgGradient: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20'
        };
    }
  };

  const statusConfig = getStatusConfig(proposal.status || 'submitted');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mock review comments for demo (in real app, this would come from submission store)
  const mockReviewComments = {
    submitted: null,
    under_review: "Your proposal is currently being reviewed by our compliance team. We're evaluating the financial projections and legal documentation. Expected completion: 2-3 business days.",
    approved: "Excellent proposal! The financial projections are well-researched, and the asset has strong fundamentals. The business plan demonstrates clear understanding of the market opportunity. Approved for public funding.",
    rejected: "Unfortunately, we cannot approve this proposal at this time. The projected returns appear unrealistic given current market conditions, and the business plan lacks sufficient detail on risk mitigation strategies. Please revise and resubmit.",
    changes_requested: "We're interested in this proposal but need additional information before approval: 1) Please provide updated tenant lease agreements for the commercial property, 2) Include environmental impact assessment, 3) Revise financial projections to account for recent market volatility."
  };

  const reviewComments = showAdminComments ? mockReviewComments[proposal.status?.toLowerCase() as keyof typeof mockReviewComments] : null;

  return (
    <div className="space-y-6">
      {/* Status Overview - Prominent Display */}
      <div className={`border-2 rounded-2xl p-8 ${statusConfig.bgGradient} ${statusConfig.color} ${statusConfig.darkColor}`}>
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              {statusConfig.icon}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{statusConfig.label}</h2>
              <div className="text-right">
                <div className="text-sm opacity-75">Review Status</div>
                <div className="font-semibold">{proposal.status || 'Submitted'}</div>
              </div>
            </div>
            
            <p className="text-lg mb-6 opacity-90">
              {statusConfig.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <div>
                  <div className="font-medium">Submitted</div>
                  <div className="opacity-75">
                    {proposal.submissionDate ? formatDate(proposal.submissionDate) : 'Recently'}
                  </div>
                </div>
              </div>
              
              {proposal.reviewDate && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Reviewed</div>
                    <div className="opacity-75">{formatDate(proposal.reviewDate)}</div>
                  </div>
                </div>
              )}
              
              {proposal.estimatedReviewDate && proposal.status === 'submitted' && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Expected Decision</div>
                    <div className="opacity-75">{formatDate(proposal.estimatedReviewDate)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Comments Section - Only show if there are comments */}
      {reviewComments && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>Review Comments</span>
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-700 border-l-4 border-blue-500 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    CF1 Review Team
                  </div>
                  {proposal.reviewDate && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(proposal.reviewDate)}
                    </div>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {reviewComments}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps Section */}
      {proposal.status !== 'approved' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>What Happens Next?</span>
          </h3>
          
          <div className="space-y-4">
            {proposal.status === 'submitted' && (
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Initial Review</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Our compliance team will review your documentation and financial projections.
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Decision Notification</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  You'll receive an email and in-app notification with our decision.
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Go Live</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  If approved, your proposal will be published for public investment.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Summary Card - Review-focused */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>Proposal Summary</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              ${typeof proposal.financial_terms?.target_amount === 'string' 
                ? (parseInt(proposal.financial_terms.target_amount) / 1000000).toFixed(1) + 'M'
                : proposal.targetAmount || '5.0M'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Target Amount</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {proposal.financial_terms?.expected_apy || proposal.expectedAPY || '12.5%'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Expected APY</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              ${typeof proposal.financial_terms?.token_price === 'string'
                ? (parseInt(proposal.financial_terms.token_price) / 1000000).toFixed(0)
                : proposal.tokenPrice || '1,000'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Token Price</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {proposal.asset_details?.location || proposal.location || 'Seattle, WA'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Location</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            {proposal.asset_details?.name || proposal.assetName || 'Downtown Seattle Office Building'}
          </h4>
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            {proposal.asset_details?.description || proposal.description || 
             'Premium Class A office building in downtown Seattle with high-quality tenants and excellent location.'}
          </p>
        </div>
      </div>

      {/* Documentation Status */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Documentation Review</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { 
              name: 'Business Plan', 
              status: 'uploaded',
              file: proposal.businessPlan || 'business_plan.pdf'
            },
            { 
              name: 'Financial Projections', 
              status: 'uploaded',
              file: proposal.financialProjections || 'financial_projections.pdf'
            },
            { 
              name: 'Legal Documents', 
              status: 'uploaded',
              file: proposal.legalDocuments || 'legal_documents.pdf'
            },
            { 
              name: 'Asset Valuation', 
              status: 'uploaded',
              file: proposal.assetValuation || 'asset_valuation.pdf'
            }
          ].map((doc) => (
            <div key={doc.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{doc.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{doc.file}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Uploaded</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProposalReviewDetail;