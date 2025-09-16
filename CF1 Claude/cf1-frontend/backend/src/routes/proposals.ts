/**
 * CF1 Backend - Proposal Management Routes
 * Handles proposal creation, validation, and investment processing
 */

import express from 'express';
import { Request, Response } from 'express';
import { requireAdmin, requirePermission, logAdminOperation, AdminAuthenticatedRequest } from '../middleware/adminAuth';
import { 
  validateFinancialTransaction, 
  requireMultiSignature, 
  createAuditTrail, 
  realTimeFraudMonitoring 
} from '../middleware/adminFinancialSecurity';

const router = express.Router();

// Platform configuration - should match frontend config
const PLATFORM_CONFIG = {
  platformFee: 2.5,
  maxInvestmentAmount: 100000,
  minInvestmentAmount: 100,
  minTokenPrice: 0.01, // $0.01 minimum token price
  defaultLockupPeriod: 12,
  complianceRequired: true,
  maintenanceMode: false,
  registrationOpen: true,
  maxInvestorsPerProposal: 500,
  fundingDeadlineRange: {
    minDays: 14,
    maxDays: 120
  }
};

// Proposal interface
interface ProposalData {
  assetName: string;
  assetType: string;
  category: string;
  customCategory?: string;
  location: string;
  description: string;
  targetAmount: string; // Will be converted to number
  tokenPrice: string; // Will be converted to number
  totalSupply: string; // Will be converted to number
  minimumInvestment: string; // Will be converted to number
  expectedAPY: string;
  fundingDeadline: string;
  riskFactors: string;
  useOfFunds: string;
}

interface Investment {
  proposalId: string;
  investorAddress: string;
  amount: number;
  timestamp: string;
  tokens?: number;
  status?: string;
}

// Mock database for proposals and investments
const proposals: Map<string, any> = new Map();
const investments: Map<string, Investment[]> = new Map();

// Production proposals start empty - no mock data
// Proposals are added only through legitimate API calls from frontend

/**
 * Calculate minimum investment based on funding goal and max investors
 */
function calculateMinimumInvestment(fundingGoal: number): number {
  return Math.ceil(fundingGoal / PLATFORM_CONFIG.maxInvestorsPerProposal);
}

/**
 * Calculate total supply based on funding goal and token price
 */
function calculateTotalSupply(fundingGoal: number, tokenPrice: number): number {
  return Math.floor(fundingGoal / tokenPrice);
}

/**
 * Validate proposal financial terms
 */
function validateProposalFinancials(proposal: {
  targetAmount: number;
  tokenPrice: number;
  fundingDays: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate token price
  if (proposal.tokenPrice < PLATFORM_CONFIG.minTokenPrice) {
    errors.push(`Token price must be at least $${PLATFORM_CONFIG.minTokenPrice.toFixed(2)}`);
  }
  
  // Validate funding deadline
  if (proposal.fundingDays < PLATFORM_CONFIG.fundingDeadlineRange.minDays) {
    errors.push(`Funding deadline must be at least ${PLATFORM_CONFIG.fundingDeadlineRange.minDays} days`);
  }
  
  if (proposal.fundingDays > PLATFORM_CONFIG.fundingDeadlineRange.maxDays) {
    errors.push(`Funding deadline cannot exceed ${PLATFORM_CONFIG.fundingDeadlineRange.maxDays} days`);
  }
  
  // Validate target amount
  if (proposal.targetAmount <= 0) {
    errors.push('Target funding amount must be greater than zero');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * GET /api/v1/proposals
 * List all proposals
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const proposalList = Array.from(proposals.values());
    
    res.json({
      success: true,
      data: proposalList,
      total: proposalList.length
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch proposals'
    });
  }
});

/**
 * GET /api/v1/proposals/:id
 * Get specific proposal by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const proposal = proposals.get(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found',
        code: 'PROPOSAL_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch proposal'
    });
  }
});

/**
 * POST /api/v1/proposals
 * Create new proposal with server-side validation
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const proposalData: ProposalData = req.body;
    
    // Parse numeric values
    const targetAmount = parseFloat(proposalData.targetAmount.replace(/[^\d.]/g, ''));
    const tokenPrice = parseFloat(proposalData.tokenPrice.replace(/[^\d.]/g, ''));
    const expectedAPY = parseFloat(proposalData.expectedAPY.replace(/[^\d.]/g, ''));
    
    // Calculate funding days from deadline
    const fundingDeadline = new Date(proposalData.fundingDeadline);
    const today = new Date();
    const fundingDays = Math.ceil((fundingDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Server-side validation
    const validation = validateProposalFinancials({
      targetAmount,
      tokenPrice,
      fundingDays
    });
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Proposal validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.errors
      });
    }
    
    // Recalculate values on server-side (ignore user input for security)
    const calculatedMinimumInvestment = calculateMinimumInvestment(targetAmount);
    const calculatedTotalSupply = calculateTotalSupply(targetAmount, tokenPrice);
    
    // Generate proposal ID
    const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create proposal object
    const proposal = {
      id: proposalId,
      asset_details: {
        name: proposalData.assetName,
        asset_type: proposalData.assetType,
        category: proposalData.category,
        custom_category: proposalData.customCategory,
        location: proposalData.location,
        description: proposalData.description
      },
      financial_terms: {
        target_amount: targetAmount,
        token_price: tokenPrice,
        total_shares: calculatedTotalSupply, // Server-calculated
        minimum_investment: calculatedMinimumInvestment, // Server-calculated
        expected_apy: expectedAPY,
        funding_deadline: proposalData.fundingDeadline
      },
      funding_status: {
        raised_amount: 0,
        investor_count: 0,
        unique_investors: new Set(),
        is_funded: false,
        tokens_minted: false
      },
      documents: {
        business_plan: proposalData.assetName,
        risk_factors: proposalData.riskFactors,
        use_of_funds: proposalData.useOfFunds
      },
      status: 'Active',
      creator: req.headers['x-creator-address'] || 'mock_creator_address',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store proposal
    proposals.set(proposalId, proposal);
    
    // Initialize investments array for this proposal
    investments.set(proposalId, []);
    
    console.log(`Proposal created: ${proposalId}`, {
      targetAmount,
      tokenPrice,
      calculatedMinimumInvestment,
      calculatedTotalSupply
    });
    
    res.status(201).json({
      success: true,
      data: proposal,
      message: 'Proposal created successfully'
    });
    
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create proposal',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/v1/proposals/:id/invest
 * Process investment with mandatory checks
 */
router.post('/:id/invest', (req: Request, res: Response) => {
  try {
    const { id: proposalId } = req.params;
    const { amount, investorAddress } = req.body;
    
    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid investment amount',
        code: 'INVALID_AMOUNT'
      });
    }
    
    if (!investorAddress) {
      return res.status(400).json({
        success: false,
        error: 'Investor address is required',
        code: 'INVALID_INVESTOR'
      });
    }
    
    // Get proposal
    const proposal = proposals.get(proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found',
        code: 'PROPOSAL_NOT_FOUND'
      });
    }
    
    // Check if proposal is still active
    if (proposal.status !== 'Active') {
      return res.status(400).json({
        success: false,
        error: 'Proposal is not accepting investments',
        code: 'PROPOSAL_INACTIVE'
      });
    }
    
    // Get existing investments for this proposal
    const proposalInvestments = investments.get(proposalId) || [];
    
    // MANDATORY CHECK 1: Minimum Investment Enforcement
    const minimumInvestment = proposal.financial_terms.minimum_investment;
    if (amount < minimumInvestment) {
      return res.status(400).json({
        success: false,
        error: `Investment amount is below the minimum required of $${minimumInvestment.toLocaleString()}`,
        code: 'BELOW_MINIMUM_INVESTMENT',
        details: {
          minimumRequired: minimumInvestment,
          providedAmount: amount
        }
      });
    }
    
    // MANDATORY CHECK 2: Max Investor Cap Enforcement
    const uniqueInvestors = new Set(proposalInvestments.map(inv => inv.investorAddress));
    const isExistingInvestor = uniqueInvestors.has(investorAddress);
    
    if (!isExistingInvestor && uniqueInvestors.size >= PLATFORM_CONFIG.maxInvestorsPerProposal) {
      return res.status(400).json({
        success: false,
        error: 'Maximum investor limit reached',
        code: 'MAX_INVESTORS_REACHED',
        details: {
          maxInvestors: PLATFORM_CONFIG.maxInvestorsPerProposal,
          currentInvestors: uniqueInvestors.size
        }
      });
    }
    
    // Check funding goal not exceeded
    const currentRaised = proposalInvestments.reduce((total, inv) => total + inv.amount, 0);
    if (currentRaised + amount > proposal.financial_terms.target_amount) {
      return res.status(400).json({
        success: false,
        error: 'Investment would exceed funding goal',
        code: 'EXCEEDS_FUNDING_GOAL',
        details: {
          targetAmount: proposal.financial_terms.target_amount,
          currentRaised,
          requestedAmount: amount,
          availableAmount: proposal.financial_terms.target_amount - currentRaised
        }
      });
    }
    
    // Create investment record
    const investment: Investment = {
      proposalId,
      investorAddress,
      amount,
      timestamp: new Date().toISOString()
    };
    
    // Add investment
    proposalInvestments.push(investment);
    investments.set(proposalId, proposalInvestments);
    
    // Update proposal funding status
    const newRaisedAmount = currentRaised + amount;
    const newUniqueInvestors = new Set(proposalInvestments.map(inv => inv.investorAddress));
    
    proposal.funding_status.raised_amount = newRaisedAmount;
    proposal.funding_status.investor_count = proposalInvestments.length;
    proposal.funding_status.unique_investors = newUniqueInvestors;
    proposal.funding_status.is_funded = newRaisedAmount >= proposal.financial_terms.target_amount;
    proposal.updated_at = new Date().toISOString();
    
    // Update proposal status if fully funded
    if (proposal.funding_status.is_funded) {
      proposal.status = 'Funded';
    }
    
    proposals.set(proposalId, proposal);
    
    console.log(`Investment processed: ${proposalId}`, {
      investorAddress,
      amount,
      isNewInvestor: !isExistingInvestor,
      totalRaised: newRaisedAmount,
      uniqueInvestors: newUniqueInvestors.size
    });
    
    res.json({
      success: true,
      data: {
        investment,
        proposal: {
          id: proposalId,
          raisedAmount: newRaisedAmount,
          investorCount: proposalInvestments.length,
          uniqueInvestors: newUniqueInvestors.size,
          isFunded: proposal.funding_status.is_funded,
          status: proposal.status
        }
      },
      message: 'Investment processed successfully'
    });
    
  } catch (error) {
    console.error('Error processing investment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process investment',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/v1/proposals/:id/investments
 * Get investments for a specific proposal
 */
router.get('/:id/investments', (req: Request, res: Response) => {
  try {
    const { id: proposalId } = req.params;
    
    const proposal = proposals.get(proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
    
    const proposalInvestments = investments.get(proposalId) || [];
    
    res.json({
      success: true,
      data: {
        proposalId,
        investments: proposalInvestments,
        summary: {
          totalInvestments: proposalInvestments.length,
          uniqueInvestors: new Set(proposalInvestments.map(inv => inv.investorAddress)).size,
          totalRaised: proposalInvestments.reduce((total, inv) => total + inv.amount, 0)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investments'
    });
  }
});

/**
 * GET /api/v1/platform-config
 * Get platform configuration
 */
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: PLATFORM_CONFIG
  });
});

/**
 * POST /api/v1/proposals/sync-submission
 * Sync an approved user submission to the backend proposals database
 */
router.post('/sync-submission', (req: Request, res: Response) => {
  try {
    const submissionData = req.body;
    
    console.log('🔄 Syncing user submission to backend:', submissionData.id);
    
    // Validate required fields
    if (!submissionData.id || !submissionData.assetName || !submissionData.targetAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required submission data',
        code: 'INVALID_SUBMISSION_DATA'
      });
    }
    
    // Parse financial values
    const targetAmount = parseFloat(submissionData.targetAmount.replace(/[^\d.]/g, '')) || 0;
    const tokenPrice = parseFloat(submissionData.tokenPrice || '0') || 1;
    const minimumInvestment = parseFloat(submissionData.minimumInvestment || '0') || 100;
    const expectedAPY = parseFloat(submissionData.expectedAPY || '0') || 0;
    
    // Calculate total shares
    const totalShares = Math.floor(targetAmount / tokenPrice);
    
    // Create backend proposal from submission data
    const proposal = {
      id: submissionData.id,
      asset_details: {
        name: submissionData.assetName,
        asset_type: submissionData.assetType || 'Unknown',
        category: submissionData.category || 'Other',
        location: submissionData.location || 'Location not specified',
        description: submissionData.description || 'No description available'
      },
      financial_terms: {
        target_amount: targetAmount,
        token_price: tokenPrice,
        total_shares: totalShares,
        minimum_investment: minimumInvestment,
        expected_apy: expectedAPY,
        funding_deadline: submissionData.fundingDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      funding_status: {
        total_raised: 0,
        total_investors: 0,
        is_funded: false,
        percentage_funded: 0
      },
      documents: {
        business_plan: submissionData.businessPlan || '',
        financial_projections: submissionData.financialProjections || '',
        legal_documents: submissionData.legalDocuments || '',
        asset_valuation: submissionData.assetValuation || '',
        risk_factors: submissionData.riskFactors || '',
        use_of_funds: submissionData.useOfFunds || ''
      },
      status: 'Active',
      creator: 'user_submission',
      submission_date: submissionData.submissionDate,
      review_date: submissionData.reviewDate,
      review_comments: submissionData.reviewComments,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store in backend proposals database
    proposals.set(submissionData.id, proposal);
    
    // Initialize investments array
    investments.set(submissionData.id, []);
    
    console.log(`✅ User submission ${submissionData.id} synced to backend proposals database`);
    
    res.json({
      success: true,
      message: 'Submission synced successfully',
      data: proposal
    });
    
  } catch (error) {
    console.error('Error syncing submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync submission',
      code: 'SYNC_ERROR'
    });
  }
});

/**
 * POST /api/v1/proposals/:id/admin/instant-fund
 * Admin shortcut to instantly fund a proposal - NOW WITH ENHANCED SECURITY
 */
router.post('/:id/admin/instant-fund',
  requireAdmin,
  requirePermission('proposals'),
  realTimeFraudMonitoring,
  validateFinancialTransaction,
  requireMultiSignature,
  createAuditTrail,
  logAdminOperation,
  (req: AdminAuthenticatedRequest, res: Response) => {
    const proposalId = req.params.id;
    
    console.log(`🚀 Admin ${req.adminUser?.username} instant funding proposal ${proposalId}`);
  
  // First, check if it's a submission-based proposal that needs to be created
  if (!proposals.has(proposalId)) {
    console.log(`⚠️ Proposal ${proposalId} not found in backend database. Checking if it can be auto-synced from frontend...`);
    
    // For instant fund operations, we'll accept the proposal data from the frontend request body
    // This allows the frontend to sync the submission data when calling instant fund
    const submissionData = req.body.submissionData;
    
    if (submissionData) {
      console.log('🔄 Auto-syncing user submission for instant fund operation...');
      
      try {
        // Parse financial values
        const targetAmount = parseFloat(submissionData.targetAmount?.replace(/[^\d.]/g, '')) || 0;
        const tokenPrice = parseFloat(submissionData.tokenPrice || '0') || 1;
        const minimumInvestment = parseFloat(submissionData.minimumInvestment || '0') || 100;
        const expectedAPY = parseFloat(submissionData.expectedAPY || '0') || 0;
        
        // Calculate total shares
        const totalShares = Math.floor(targetAmount / tokenPrice);
        
        // Create backend proposal from submission data
        const proposal = {
          id: proposalId,
          asset_details: {
            name: submissionData.assetName || 'User Submission',
            asset_type: submissionData.assetType || 'Unknown',
            category: submissionData.category || 'Other',
            location: submissionData.location || 'Location not specified',
            description: submissionData.description || 'No description available'
          },
          financial_terms: {
            target_amount: targetAmount,
            token_price: tokenPrice,
            total_shares: totalShares,
            minimum_investment: minimumInvestment,
            expected_apy: expectedAPY,
            funding_deadline: submissionData.fundingDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          funding_status: {
            total_raised: 0,
            total_investors: 0,
            is_funded: false,
            percentage_funded: 0
          },
          documents: {
            business_plan: submissionData.businessPlan || '',
            financial_projections: submissionData.financialProjections || '',
            legal_documents: submissionData.legalDocuments || '',
            asset_valuation: submissionData.assetValuation || '',
            risk_factors: submissionData.riskFactors || '',
            use_of_funds: submissionData.useOfFunds || ''
          },
          status: 'Active',
          creator: 'user_submission',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Store in backend proposals database
        proposals.set(proposalId, proposal);
        investments.set(proposalId, []);
        
        console.log(`✅ User submission ${proposalId} auto-synced for instant fund operation`);
      } catch (syncError) {
        console.error('Error auto-syncing submission:', syncError);
        return res.status(500).json({
          success: false,
          error: 'Failed to auto-sync submission data for instant funding',
          code: 'SYNC_ERROR'
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found and no submission data provided for auto-sync',
        code: 'PROPOSAL_NOT_FOUND',
        details: {
          proposalId,
          suggestion: 'Include submissionData in the request body to auto-sync user submissions'
        }
      });
    }
  }
  
  const proposal = proposals.get(proposalId)!;
  
  // Check if proposal is in active state
  if (proposal.status !== 'Active') {
    return res.status(400).json({
      success: false,
      error: `Cannot fund proposal in ${proposal.status} state. Only Active proposals can be funded.`
    });
  }
  
  try {
    // Calculate remaining amount needed to fully fund
    // Handle both string and number formats
    let targetAmount;
    if (typeof proposal.financial_terms.target_amount === 'string') {
      targetAmount = parseFloat(proposal.financial_terms.target_amount.replace(/[$,]/g, ''));
    } else {
      targetAmount = proposal.financial_terms.target_amount;
    }
    
    const currentRaised = proposal.funding_status.total_raised || 0;
    const remainingAmount = Math.max(0, targetAmount - currentRaised);
    
    // SECURITY ENHANCEMENT: Add amount to request body for middleware validation
    if (!req.body.amount) {
      req.body.amount = remainingAmount;
    }
    
    console.log(`🔒 SECURE INSTANT FUND - Target: $${targetAmount}, Current: $${currentRaised}, Remaining: $${remainingAmount}`);
    console.log(`🔒 Security Transaction ID: ${req.transactionId}, Risk Score: ${req.riskScore}/100`);
    
    // Create mock investment to complete funding
    if (remainingAmount > 0) {
      const mockInvestment: Investment = {
        proposalId,
        investorAddress: 'admin_mock_investor',
        amount: remainingAmount,
        timestamp: new Date().toISOString(),
        tokens: Math.floor(remainingAmount / (typeof proposal.financial_terms.token_price === 'string' ? parseFloat(proposal.financial_terms.token_price.replace(/[$,]/g, '')) : proposal.financial_terms.token_price)),
        status: 'completed'
      };
      
      // Add to investments
      if (!investments.has(proposalId)) {
        investments.set(proposalId, []);
      }
      investments.get(proposalId)!.push(mockInvestment);
      
      // Update proposal funding status
      proposal.funding_status.total_raised = targetAmount;
      proposal.funding_status.total_investors += 1;
      proposal.funding_status.is_funded = true;
      proposal.funding_status.percentage_funded = 100;
    }
    
    // *** CRITICAL: Trigger state transition to Funded ***
    proposal.status = 'Funded';
    
    // Update the proposals map
    proposals.set(proposalId, proposal);
    
    console.log(`✅ Proposal ${proposalId} status changed to: ${proposal.status}`);
    console.log(`✅ Funding status: $${proposal.funding_status.total_raised} / $${targetAmount} (${proposal.funding_status.percentage_funded}%)`);
    
    // TODO: In production, trigger additional workflows:
    // - Mint tokens
    // - Send notifications to investors
    // - Initialize governance
    // - Set up dividend distribution
    
    res.json({
      success: true,
      message: 'Proposal instantly funded by admin',
      data: {
        proposalId,
        status: proposal.status,
        fundingStatus: {
          total_raised: proposal.funding_status.total_raised,
          total_investors: proposal.funding_status.total_investors,
          is_funded: proposal.funding_status.is_funded,
          percentage_funded: proposal.funding_status.percentage_funded
        },
        mockInvestmentAmount: remainingAmount
      }
    });
    
  } catch (error) {
    console.error('Error in instant fund:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fund proposal',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;