/**
 * Platform Configuration Service
 * Manages platform-wide settings and validation rules
 */

export interface PlatformConfig {
  platformFee: number;
  maxInvestmentAmount: number;
  minInvestmentAmount: number;
  minTokenPrice: number; // Minimum token price in USD
  defaultLockupPeriod: number;
  complianceRequired: boolean;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  maxInvestorsPerProposal: number;
  fundingDeadlineRange: {
    minDays: number;
    maxDays: number;
  };
}

// Default platform configuration
const DEFAULT_CONFIG: PlatformConfig = {
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

// Current configuration state
let currentConfig: PlatformConfig = { ...DEFAULT_CONFIG };

/**
 * Get current platform configuration
 */
export function getPlatformConfig(): PlatformConfig {
  return { ...currentConfig };
}

/**
 * Update platform configuration
 */
export function updatePlatformConfig(updates: Partial<PlatformConfig>): void {
  currentConfig = { ...currentConfig, ...updates };
}

/**
 * Reset to default configuration
 */
export function resetPlatformConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
}

/**
 * Calculate minimum investment based on funding goal and max investors
 */
export function calculateMinimumInvestment(
  fundingGoal: number,
  maxInvestors: number = currentConfig.maxInvestorsPerProposal
): number {
  return Math.ceil(fundingGoal / maxInvestors);
}

/**
 * Calculate total supply based on funding goal and token price
 */
export function calculateTotalSupply(
  fundingGoal: number,
  tokenPrice: number
): number {
  return Math.floor(fundingGoal / tokenPrice);
}

/**
 * Validate token price against platform minimum
 */
export function validateTokenPrice(tokenPrice: number): {
  isValid: boolean;
  error?: string;
} {
  if (tokenPrice < currentConfig.minTokenPrice) {
    return {
      isValid: false,
      error: `Token price must be at least $${currentConfig.minTokenPrice.toFixed(2)}`
    };
  }
  return { isValid: true };
}

/**
 * Generate funding deadline options based on platform settings
 */
export function getFundingDeadlineOptions(): Array<{
  value: number;
  label: string;
  date: string;
}> {
  const options: Array<{
    value: number;
    label: string;
    date: string;
  }> = [];
  
  const today = new Date();
  
  for (let days = currentConfig.fundingDeadlineRange.minDays; 
       days <= currentConfig.fundingDeadlineRange.maxDays; 
       days += 1) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + days);
    
    options.push({
      value: days,
      label: `${days} Days`,
      date: targetDate.toISOString().split('T')[0] // YYYY-MM-DD format
    });
  }
  
  return options;
}

/**
 * Get validation rules for proposal creation
 */
export function getProposalValidationRules() {
  return {
    minTokenPrice: currentConfig.minTokenPrice,
    maxInvestors: currentConfig.maxInvestorsPerProposal,
    minFundingDays: currentConfig.fundingDeadlineRange.minDays,
    maxFundingDays: currentConfig.fundingDeadlineRange.maxDays,
    minInvestment: currentConfig.minInvestmentAmount,
    maxInvestment: currentConfig.maxInvestmentAmount
  };
}

/**
 * Validate proposal financial terms
 */
export function validateProposalFinancials(proposal: {
  targetAmount: number;
  tokenPrice: number;
  fundingDays: number;
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate token price
  const tokenPriceValidation = validateTokenPrice(proposal.tokenPrice);
  if (!tokenPriceValidation.isValid) {
    errors.push(tokenPriceValidation.error!);
  }
  
  // Validate funding deadline
  if (proposal.fundingDays < currentConfig.fundingDeadlineRange.minDays) {
    errors.push(`Funding deadline must be at least ${currentConfig.fundingDeadlineRange.minDays} days`);
  }
  
  if (proposal.fundingDays > currentConfig.fundingDeadlineRange.maxDays) {
    errors.push(`Funding deadline cannot exceed ${currentConfig.fundingDeadlineRange.maxDays} days`);
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