import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Target, TrendingUp, Zap } from 'lucide-react';
import { InvestmentModal } from '../components/InvestmentModal';
import { useBusinessTracking } from '../hooks/useMonitoring';
import { AIAnalysisTab } from '../components/AIAnalysis/AIAnalysisTab';
import { useFeatureToggleStore } from '../store/featureToggleStore';
import { ProposalReviewDetail } from '../components/ProposalReviewDetail';
import { useSessionStore } from '../store/sessionStore';
import { useNotifications } from '../hooks/useNotifications';
import { useSubmissionStore } from '../store/submissionStore';
import { usePortfolioStore } from '../store/portfolioStore';
import { useWalletStore } from '../store/walletStore';
import { useDataModeStore } from '../store/dataModeStore';
import { useDemoModeStore } from '../store/demoModeStore';
import { getDemoLaunchpadProposals } from '../services/demoLaunchpadData';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { apiClient } from '../lib/api/client';

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showInvestModal, setShowInvestModal] = useState(false);
  const { trackProposal } = useBusinessTracking();
  const { selectedRole } = useSessionStore();
  const { success, error } = useNotifications();
  const [isInstantFunding, setIsInstantFunding] = useState(false);
  const { getSubmissionById, updateFundingStatus } = useSubmissionStore();
  const { isFeatureEnabled } = useFeatureToggleStore();
  const { addTransaction, addAsset } = usePortfolioStore();
  const { connection } = useWalletStore();
  const { isAdmin, isSuperAdmin, isOwner, currentAdmin } = useAdminAuth();
  const address = connection?.address;

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    // Use setTimeout to ensure scroll happens after rendering
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Fallback for browsers that don't support smooth behavior
      if (document.documentElement.scrollTop !== 0) {
        setTimeout(() => {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 100);
      }
    };
    
    // Execute scroll immediately and with small delay
    scrollToTop();
    setTimeout(scrollToTop, 50);
  }, [id]);

  // Track proposal view
  useEffect(() => {
    if (id) {
      const proposalTracking = trackProposal;
      proposalTracking.viewed(id);
    }
  }, [id, trackProposal]);

  // Fetch proposal data from backend (if it exists) on component mount
  useEffect(() => {
    const fetchProposalFromBackend = async () => {
      if (!id) return;
      
      try {
        const response = await fetch(`http://localhost:3001/api/v1/proposals/${id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Backend has this proposal, use backend data
            console.log('📊 Loading proposal from backend:', result.data);
            setProposalData({
              id: result.data.id,
              asset_details: result.data.asset_details,
              financial_terms: result.data.financial_terms,
              funding_status: {
                raised_amount: result.data.funding_status.total_raised?.toString() || '0',
                investor_count: result.data.funding_status.total_investors || 0,
                is_funded: result.data.funding_status.is_funded || false,
                tokens_minted: false,
              },
              status: result.data.status,
            });
          }
        } else {
          console.log('📝 Proposal not found in backend, using local submission data');
        }
      } catch (error) {
        console.log('📝 Backend not available, using local submission data');
      }
    };

    fetchProposalFromBackend();
  }, [id]);

  // Check for invest=true query parameter and auto-open modal
  useEffect(() => {
    const shouldOpenInvestModal = searchParams.get('invest') === 'true';
    if (shouldOpenInvestModal) {
      setShowInvestModal(true);
      // Remove the query parameter from the URL to clean it up
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('invest');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Check if user has admin privileges for instant funding with enhanced security
  const canInstantFund = (selectedRole === 'super_admin' || selectedRole === 'owner') && 
                         (isSuperAdmin || isOwner) && 
                         isAdmin;

  // Security validation function
  const validateAdminOperation = () => {
    // Enhanced security checks
    if (!canInstantFund) {
      return { valid: false, reason: 'Insufficient privileges' };
    }
    
    // Check admin authentication status
    if (!isAdmin || !currentAdmin) {
      return { valid: false, reason: 'No authenticated admin session' };
    }
    
    // Verify admin has proper role and permissions
    if (!isSuperAdmin && !isOwner) {
      return { valid: false, reason: 'Admin role insufficient for instant funding' };
    }
    
    // Check session role matches admin role
    if (!selectedRole || (selectedRole !== 'super_admin' && selectedRole !== 'owner')) {
      return { valid: false, reason: 'Session role mismatch with admin permissions' };
    }
    
    if (!proposalData || proposalData.funding_status?.is_funded) {
      return { valid: false, reason: 'Invalid proposal state' };
    }

    // Transaction amount validation
    const targetAmount = parseFloat(
      proposalData?.financial_terms?.target_amount?.toString() || 
      proposalData?.target_amount?.replace?.(/[^\d.]/g, '') || 
      '0'
    );
    
    if (targetAmount > 10000000) { // $10M limit for security
      return { valid: false, reason: 'Transaction amount exceeds security limits' };
    }
    
    return { valid: true, reason: 'Authorized' };
  };

  // Handle instant funding (Admin only) with enhanced security
  const handleInstantFund = async () => {
    // Multi-layer security validation
    const validation = validateAdminOperation();
    if (!validation.valid) {
      error('Access Denied', `Security validation failed: ${validation.reason}`);
      console.warn(`🔒 Admin instant fund blocked: ${validation.reason}`);
      return;
    }

    // Audit logging for security
    const auditLog = {
      action: 'admin_instant_fund',
      proposalId: id,
      userId: address || `admin_${selectedRole}_${Date.now()}`,
      role: selectedRole,
      timestamp: new Date().toISOString(),
      targetAmount: parseFloat(
        proposalData?.financial_terms?.target_amount?.toString() || 
        proposalData?.target_amount?.replace?.(/[^\d.]/g, '') || 
        '0'
      )
    };
    console.log('🔒 AUDIT LOG:', auditLog);

    setIsInstantFunding(true);
    try {
      console.log(`🚀 Calling instant fund API for proposal ${id} with security validation`);
      
      // Get submission data if this is a user submission
      const submission = id ? getSubmissionById(id) : null;
      
      // Prepare request body with submission data for auto-sync
      const requestBody = submission ? { submissionData: submission } : {};
      
      // In demo mode, simulate instant funding directly
      if (proposalData?.funding_status?.is_funded) {
        error('Already Funded', 'This proposal has already been funded and cannot be funded again.');
        return;
      }

      // Simulate backend response for demo mode
      const targetAmount = parseFloat(
        proposalData?.financial_terms?.target_amount?.toString() || 
        proposalData?.target_amount?.replace?.(/[^\d.]/g, '') || 
        '1000000'
      );
      const result = {
        success: true,
        data: {
          fundingStatus: {
            total_raised: targetAmount,
            total_investors: Math.floor(Math.random() * 50) + 10, // Random investors between 10-60
            is_funded: true
          },
          status: 'funded'
        }
      };
      
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

      // Add the funded asset to the current user's portfolio
      console.log('🔍 Debug - Wallet connection:', connection);
      console.log('🔍 Debug - Wallet address:', address);
      console.log('🔍 Debug - Proposal ID:', id);
      console.log('🔍 Debug - Address exists:', !!address);
      console.log('🔍 Debug - Connection exists:', !!connection);
      
      // For admin instant funding, use actual address if connected, otherwise use a system admin address
      const effectiveAddress = address || `neutron1admin_${selectedRole}_system_address`;
      
      if (effectiveAddress && id) {
        // Convert backend amounts to proper numbers (handle micro units)
        const targetAmount = parseFloat(proposalData.financial_terms?.target_amount?.toString() || '0');
        const backendAmount = result.data?.fundingStatus?.total_raised || targetAmount;
        
        // Convert micro units to standard dollars if needed
        const investmentAmount = backendAmount > 1000000 ? backendAmount / 1000000 : backendAmount;
        
        const transactionData = {
          type: 'investment' as const,
          assetId: id,
          assetName: proposalData.asset_details.name,
          amount: investmentAmount,
          shares: Math.floor(investmentAmount / 1000), // $1000 per share
          timestamp: new Date().toISOString(),
          status: 'completed' as const
        };
        
        console.log('🔍 Debug - Transaction data to add:', transactionData);
        console.log('🔍 Debug - Investment amount (converted):', investmentAmount);
        
        addTransaction(transactionData);
        
        // Also add the asset to the portfolio
        const assetData = {
          proposalId: id,
          name: proposalData.asset_details.name,
          type: proposalData.asset_details.asset_type || 'Real Estate',
          shares: Math.floor(investmentAmount / 1000), // $1000 per share
          currentValue: investmentAmount.toString(), // Start at invested amount
          totalInvested: investmentAmount.toString(),
          unrealizedGain: '0.00', // No gain initially
          unrealizedGainPercent: 0,
          apy: proposalData.financial_terms?.projected_apy || '12.0%',
          locked: true, // New assets are locked initially
          unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        };
        
        console.log('🏗️ Adding asset to portfolio:', assetData);
        addAsset(assetData);
        
        console.log(`📈 Added funded asset to portfolio for user ${effectiveAddress}`);
        console.log('📊 Portfolio transaction data added:', transactionData);
        console.log('🏢 Portfolio asset data added:', assetData);
        
        // Verify the transaction was added and processed correctly
        setTimeout(() => {
          const portfolioState = usePortfolioStore.getState();
          console.log('🔍 Debug - Portfolio state after adding:', portfolioState.transactions);
          
          // Check if transaction is visible in development assets
          if (useDataModeStore.getState().currentMode === 'development') {
            console.log('🔍 Debug - Checking development assets...');
            // Trigger a re-read of development assets to verify integration
            const portfolioData = require('../services/portfolioDataService');
            const devAssets = portfolioData.getDevelopmentAssets?.();
            console.log('🔍 Debug - Development assets after instant fund:', devAssets);
          }
        }, 500);
      } else {
        console.warn('⚠️ Debug - Cannot add to portfolio. Address:', effectiveAddress, 'ID:', id);
      }

      success(
        'Proposal Instantly Funded!',
        `${proposalData.asset_details.name} has been fully funded and is ready for finalization.`,
        { 
          duration: 5000,
          actionLabel: 'View Portfolio',
          onAction: () => navigate('/portfolio')
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
    // First check if this is a demo proposal
    const demoModeState = useDemoModeStore.getState();
    if (demoModeState.isEnabled && id?.startsWith('demo-')) {
      const demoProposals = getDemoLaunchpadProposals(demoModeState.scenario || 'sales_demo');
      const demoProposal = demoProposals.find(p => p.id === id);
      
      if (demoProposal) {
        // Convert demo proposal to proposal format
        const targetAmount = parseFloat(demoProposal.targetAmount.replace(/[^\d.]/g, ''));
        const raisedAmount = parseFloat(demoProposal.raisedAmount.replace(/[^\d.]/g, ''));
        const minimumInvestment = parseFloat(demoProposal.minimumInvestment.replace(/[^\d.]/g, ''));
        
        return {
          id: demoProposal.id,
          asset_details: {
            name: demoProposal.title,
            asset_type: demoProposal.category,
            category: demoProposal.category,
            location: demoProposal.location,
            description: demoProposal.description,
          },
          financial_terms: {
            target_amount: (targetAmount * 1000000).toString(),
            token_price: '1000000', // $1 in micro units
            total_shares: targetAmount,
            minimum_investment: (minimumInvestment * 1000000).toString(),
            expected_apy: demoProposal.expectedAPY,
            projected_apy: demoProposal.expectedAPY,
            funding_deadline: Date.now() / 1000 + (demoProposal.daysLeft * 86400),
          },
          funding_status: {
            total_raised: (raisedAmount * 1000000).toString(),
            raised_amount: (raisedAmount * 1000000).toString(),
            is_funded: demoProposal.status === 'funded',
            backer_count: demoProposal.backers,
          },
          status: demoProposal.status,
        };
      }
    }
    
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

  // Check if this proposal is in review status and should use review-focused layout
  const isInReview = ['submitted', 'under_review', 'changes_requested'].includes(
    proposal.status?.toLowerCase() || ''
  );

  // If this is accessed via /my-submissions route or is in review status, show review-focused view
  const isSubmissionView = window.location.pathname.includes('/my-submissions') || isInReview;

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

      {/* Conditional rendering based on view type */}
      {isSubmissionView ? (
        <ProposalReviewDetail proposal={proposal} showAdminComments={true} />
      ) : (
        <>
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
                <span className="font-medium text-gray-900 dark:text-white">{proposal.financial_terms.expected_apy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Minimum Investment</span>
                <span className="font-medium text-gray-900 dark:text-white">$1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Token Price</span>
                <span className="font-medium text-gray-900 dark:text-white">$1,000</span>
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

      {/* AI Analysis Section - Conditionally rendered based on feature toggle */}
      {isFeatureEnabled('launchpad_ai_analysis') && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Analysis</h2>
          <AIAnalysisTab proposalId={proposal.id} />
        </div>
      )}
        </>
      )}

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