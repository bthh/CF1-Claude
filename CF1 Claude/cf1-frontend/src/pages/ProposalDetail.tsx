import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Target, TrendingUp, Zap } from 'lucide-react';
import { InvestmentModal } from '../components/InvestmentModal';
import { useBusinessTracking } from '../hooks/useMonitoring';
import { AIAnalysisTab } from '../components/AIAnalysis/AIAnalysisTab';
import { useSessionStore } from '../store/sessionStore';
import { useNotifications } from '../hooks/useNotifications';
import { useSubmissionStore } from '../store/submissionStore';

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showInvestModal, setShowInvestModal] = useState(false);
  const { trackProposal } = useBusinessTracking();
  const { selectedRole } = useSessionStore();
  const { success, error } = useNotifications();
  const [isInstantFunding, setIsInstantFunding] = useState(false);
  const { getSubmissionById, updateFundingStatus } = useSubmissionStore();

  // Track proposal view
  useEffect(() => {
    if (id) {
      const proposalTracking = trackProposal;
      proposalTracking.viewed(id);
    }
  }, [id, trackProposal]);

  // Check if user has admin privileges for instant funding
  const canInstantFund = selectedRole === 'super_admin' || selectedRole === 'owner' || selectedRole === 'platform_admin';

  // Handle instant funding (Admin only)
  const handleInstantFund = async () => {
    if (!canInstantFund) {
      error('Access Denied', 'You do not have permission to perform this action.');
      return;
    }

    setIsInstantFunding(true);
    try {
      console.log(`🚀 Calling instant fund API for proposal ${id}`);
      
      // Get submission data if this is a user submission
      const submission = id ? getSubmissionById(id) : null;
      
      // Prepare request body with submission data for auto-sync
      const requestBody = submission ? { submissionData: submission } : {};
      
      // Call backend API to instantly fund the proposal
      const response = await fetch(`http://localhost:3001/api/v1/proposals/${id}/admin/instant-fund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authorization header when auth is implemented
          // 'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fund proposal');
      }
      
      console.log('✅ Instant fund successful:', result);
      console.log('🔍 Backend funding status response:', result.data.fundingStatus);
      
      // Update local state with the backend response
      setProposalData(prev => ({
        ...prev,
        funding_status: {
          ...prev.funding_status,
          raised_amount: result.data.fundingStatus.total_raised,
          investor_count: result.data.fundingStatus.total_investors,
          is_funded: result.data.fundingStatus.is_funded,
        },
        status: result.data.status
      }));

      // If this is a user submission, update the submission store with funding status
      if (submission && id) {
        const targetAmount = parseFloat(submission.targetAmount?.replace(/[^\d.]/g, '') || '0');
        
        const newFundingStatus = {
          raisedAmount: result.data.fundingStatus.total_raised || targetAmount,
          raisedPercentage: result.data.fundingStatus.is_funded ? 100 : Math.round((result.data.fundingStatus.total_raised / targetAmount) * 100),
          investorCount: result.data.fundingStatus.total_investors || 1,
          isFunded: result.data.fundingStatus.is_funded,
          status: result.data.fundingStatus.is_funded ? 'funded' : 'active'
        };
        
        console.log(`🔄 Updating submission store funding status for ${id}:`, newFundingStatus);
        updateFundingStatus(id, newFundingStatus);
        console.log(`✅ Submission store update called for ${id}`);
        
        // Verify the update by checking the store
        setTimeout(() => {
          const updatedSubmission = getSubmissionById(id);
          console.log(`🔍 Verified submission after update:`, updatedSubmission?.fundingStatus);
        }, 100);
      }

      success(
        'Proposal Instantly Funded!',
        `${proposalData.asset_details.name} has been fully funded and is ready for finalization.`,
        { 
          duration: 5000,
          actionLabel: 'View Details',
          onAction: () => window.location.reload()
        }
      );
    } catch (err) {
      console.error('❌ Instant fund error:', err);
      error('Funding Failed', err instanceof Error ? err.message : 'An error occurred while processing the instant funding.');
    } finally {
      setIsInstantFunding(false);
    }
  };

  // Proposal data state (to allow updates)
  const [proposalData, setProposalData] = useState(() => {
    // Check if this is a user submission
    const submission = id ? getSubmissionById(id) : null;
    
    if (submission) {
      // Convert submission to proposal format
      const targetAmount = parseFloat(submission.targetAmount?.replace(/[^\d.]/g, '') || '0');
      const tokenPrice = parseFloat(submission.tokenPrice || '0');
      const minimumInvestment = parseFloat(submission.minimumInvestment || '0');
      
      return {
        id: submission.id,
        asset_details: {
          name: submission.assetName || 'Untitled Proposal',
          asset_type: submission.assetType || 'Unknown Type',
          category: submission.category || 'Other',
          location: submission.location || 'Location not specified',
          description: submission.description || 'No description available',
        },
        financial_terms: {
          target_amount: (targetAmount * 1000000).toString(), // Convert to micro units
          token_price: (tokenPrice * 1000000).toString(), // Convert to micro units
          total_shares: Math.floor(targetAmount / tokenPrice),
          minimum_investment: (minimumInvestment * 1000000).toString(), // Convert to micro units
          expected_apy: `${submission.expectedAPY || '0'}%`,
          funding_deadline: submission.fundingDeadline ? new Date(submission.fundingDeadline).getTime() / 1000 : Date.now() / 1000 + 86400 * 30,
        },
        funding_status: {
          raised_amount: (targetAmount * 0.5 * 1000000).toString(), // 50% funded as demo
          investor_count: 25,
          is_funded: false,
          tokens_minted: false,
        },
        status: 'Active',
      };
    }
    
    // Default fallback data for non-user submissions
    return {
      id: id || '1',
      asset_details: {
        name: 'Downtown Seattle Office',
        asset_type: 'Commercial Real Estate',
        category: 'Real Estate',
        location: 'Seattle, WA',
        description: 'Premium Class A office building',
      },
      financial_terms: {
        target_amount: '5000000000000',
        token_price: '1000000000',
        total_shares: 5000,
        minimum_investment: '1000000000',
        expected_apy: '12.5%',
        funding_deadline: Date.now() / 1000 + 86400 * 30,
      },
      funding_status: {
        raised_amount: '2500000000000',
        investor_count: 25,
        is_funded: false,
        tokens_minted: false,
      },
      status: 'Active',
    };
  });

  // Use proposalData instead of proposal for the rest of the component
  const proposal = proposalData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/launchpad')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {proposal.asset_details.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {proposal.asset_details.location} • {proposal.asset_details.asset_type}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Admin: Instant Fund Button (Platform Admin/Super Admin/Owner) */}
          {canInstantFund && proposal.status === 'Active' && !proposal.funding_status.is_funded && (
            <button
              onClick={handleInstantFund}
              disabled={isInstantFunding}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              {isInstantFunding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Funding...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Admin: Instant Fund</span>
                </>
              )}
            </button>
          )}

          {/* Regular Invest Button */}
          <button
            onClick={() => setShowInvestModal(true)}
            disabled={proposal.funding_status.is_funded}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              proposal.funding_status.is_funded
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {proposal.funding_status.is_funded ? 'Fully Funded' : 'Invest Now'}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target Amount</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">$5.0M</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Raised</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${proposal.funding_status.is_funded ? '5.0M' : '2.5M'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Investors</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {proposal.funding_status.investor_count}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Days Left</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">30</p>
            </div>
          </div>
        </div>
      </div>

      {/* Funding Progress */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Funding Progress</h2>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">
              {proposal.funding_status.is_funded ? '100%' : '50%'} 
              ({proposal.funding_status.is_funded ? '$5.0M' : '$2.5M'} of $5.0M)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                proposal.funding_status.is_funded ? 'bg-green-600' : 'bg-blue-600'
              }`} 
              style={{ width: proposal.funding_status.is_funded ? '100%' : '50%' }}
            ></div>
          </div>
          {proposal.funding_status.is_funded && (
            <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400 text-sm font-medium mt-3">
              <Zap className="w-4 h-4" />
              <span>Fully Funded - Ready for Finalization!</span>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About This Investment</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {proposal.asset_details.description}. This is a premium investment opportunity 
          in commercial real estate with strong fundamentals and experienced management.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Investment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Expected APY</span>
                <span className="font-medium text-green-600">{proposal.financial_terms.expected_apy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Minimum Investment</span>
                <span className="font-medium">$1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Token Price</span>
                <span className="font-medium">$1,000</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Key Highlights</h3>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>• Prime downtown location</li>
              <li>• AAA-rated tenants</li>
              <li>• 95%+ occupancy rate</li>
              <li>• Recent renovations completed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Analysis</h2>
        <AIAnalysisTab proposalId={proposal.id} />
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={showInvestModal}
        onClose={() => setShowInvestModal(false)}
        proposal={proposal}
        onSuccess={() => {
          setShowInvestModal(false);
          // Show success message or refresh data
        }}
      />
    </div>
  );
};

export default ProposalDetail;