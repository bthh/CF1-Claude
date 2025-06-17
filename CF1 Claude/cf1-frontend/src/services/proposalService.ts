/**
 * Proposal Service - API calls for proposal management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ProposalData {
  assetName: string;
  assetType: string;
  category: string;
  customCategory?: string;
  location: string;
  description: string;
  targetAmount: string;
  tokenPrice: string;
  totalSupply: string;
  minimumInvestment: string;
  expectedAPY: string;
  fundingDeadline: string;
  riskFactors: string;
  useOfFunds: string;
}

export interface Investment {
  proposalId: string;
  investorAddress: string;
  amount: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
}

/**
 * Create a new proposal
 */
export async function createProposal(proposalData: ProposalData): Promise<ApiResponse<any>> {
  try {
    console.log('Creating proposal:', proposalData);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Creator-Address': 'mock_creator_address' // In production, this would come from wallet
      },
      body: JSON.stringify(proposalData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Failed to create proposal:', result);
      return {
        success: false,
        error: result.error || 'Failed to create proposal',
        code: result.code,
        details: result.details
      };
    }

    console.log('Proposal created successfully:', result.data);
    return result;

  } catch (error) {
    console.error('Error creating proposal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create proposal'
    };
  }
}

/**
 * Invest in a proposal
 */
export async function investInProposal(
  proposalId: string, 
  amount: number, 
  investorAddress: string
): Promise<ApiResponse<any>> {
  try {
    console.log(`Investing in proposal ${proposalId}:`, { amount, investorAddress });
    
    const response = await fetch(`${API_BASE_URL}/api/v1/proposals/${proposalId}/invest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        investorAddress
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Failed to process investment:', result);
      return {
        success: false,
        error: result.error || 'Failed to process investment',
        code: result.code,
        details: result.details
      };
    }

    console.log('Investment processed successfully:', result.data);
    return result;

  } catch (error) {
    console.error('Error processing investment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process investment'
    };
  }
}

/**
 * Get proposal by ID
 */
export async function getProposal(proposalId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/proposals/${proposalId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to fetch proposal',
        code: result.code
      };
    }

    return result;

  } catch (error) {
    console.error('Error fetching proposal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch proposal'
    };
  }
}

/**
 * Get all proposals
 */
export async function getProposals(): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/proposals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to fetch proposals'
      };
    }

    return result;

  } catch (error) {
    console.error('Error fetching proposals:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch proposals'
    };
  }
}

/**
 * Get investments for a proposal
 */
export async function getProposalInvestments(proposalId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/proposals/${proposalId}/investments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to fetch investments'
      };
    }

    return result;

  } catch (error) {
    console.error('Error fetching investments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch investments'
    };
  }
}

/**
 * Validate proposal data before submission
 */
export function validateProposalData(data: ProposalData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Basic field validation
  if (!data.assetName?.trim()) errors.push('Asset name is required');
  if (!data.assetType?.trim()) errors.push('Asset type is required');
  if (!data.category?.trim()) errors.push('Category is required');
  if (!data.location?.trim()) errors.push('Location is required');
  if (!data.description?.trim()) errors.push('Description is required');
  if (!data.targetAmount?.trim()) errors.push('Target amount is required');
  if (!data.tokenPrice?.trim()) errors.push('Token price is required');
  if (!data.expectedAPY?.trim()) errors.push('Expected APY is required');
  if (!data.fundingDeadline?.trim()) errors.push('Funding deadline is required');
  if (!data.riskFactors?.trim()) errors.push('Risk factors are required');
  if (!data.useOfFunds?.trim()) errors.push('Use of funds is required');
  
  // Numeric validation
  const targetAmount = parseFloat(data.targetAmount?.replace(/[^\d.]/g, '') || '0');
  const tokenPrice = parseFloat(data.tokenPrice?.replace(/[^\d.]/g, '') || '0');
  
  if (targetAmount <= 0) errors.push('Target amount must be greater than zero');
  if (tokenPrice <= 0) errors.push('Token price must be greater than zero');
  
  return {
    isValid: errors.length === 0,
    errors
  };
}