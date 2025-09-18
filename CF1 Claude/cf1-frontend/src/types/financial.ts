// CF1 Platform - Financial Type Definitions
// Enterprise-grade TypeScript for institutional financial applications

/**
 * Precise decimal type for financial calculations
 * Prevents floating-point precision errors in monetary calculations
 */
export type FinancialDecimal = string; // Always use string representation for precise decimals

/**
 * Currency codes following ISO 4217 standard
 */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY';

/**
 * Blockchain native token identifiers
 */
export type TokenDenom = 'untrn' | 'uatom' | 'uosmo' | string;

/**
 * Investment amount with strict validation
 */
export interface InvestmentAmount {
  readonly amount: FinancialDecimal;
  readonly currency: CurrencyCode;
  readonly precision: number; // Number of decimal places
  readonly formatted: string; // Human-readable format
}

/**
 * Blockchain transaction amount
 */
export interface BlockchainAmount {
  readonly amount: FinancialDecimal;
  readonly denom: TokenDenom;
  readonly decimals: number;
}

/**
 * Portfolio value calculation with audit trail
 */
export interface PortfolioValue {
  readonly totalValue: InvestmentAmount;
  readonly totalInvested: InvestmentAmount;
  readonly unrealizedGain: InvestmentAmount;
  readonly realizedGain: InvestmentAmount;
  readonly gainPercent: number;
  readonly calculatedAt: string; // ISO timestamp
  readonly calculationMethod: 'mark_to_market' | 'cost_basis' | 'fair_value';
}

/**
 * Asset performance metrics with type safety
 */
export interface AssetPerformanceMetrics {
  readonly roi: number; // Return on Investment percentage
  readonly apy: number; // Annual Percentage Yield
  readonly volatility: number; // Price volatility measure
  readonly sharpeRatio: number; // Risk-adjusted return
  readonly maxDrawdown: number; // Maximum observed loss
  readonly beta: number; // Systematic risk measure
  readonly alpha: number; // Excess return measure
  readonly calculationPeriod: {
    readonly start: string;
    readonly end: string;
  };
}

/**
 * Financial transaction record with complete audit trail
 */
export interface FinancialTransaction {
  readonly id: string;
  readonly type: 'investment' | 'dividend' | 'withdrawal' | 'fee' | 'transfer';
  readonly status: 'pending' | 'confirmed' | 'settled' | 'failed' | 'cancelled';
  readonly amount: InvestmentAmount;
  readonly assetId: string;
  readonly userId: string;
  readonly blockchainTxHash?: string;
  readonly timestamp: string;
  readonly settlementDate?: string;
  readonly fees: InvestmentAmount[];
  readonly metadata: Record<string, unknown>;
  readonly auditTrail: TransactionAuditEntry[];
}

/**
 * Transaction audit entry for compliance tracking
 */
export interface TransactionAuditEntry {
  readonly timestamp: string;
  readonly action: string;
  readonly userId: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly details: Record<string, unknown>;
}

/**
 * Investment proposal with financial validation
 */
export interface InvestmentProposal {
  readonly id: string;
  readonly basicInfo: {
    readonly title: string;
    readonly description: string;
    readonly assetType: string;
    readonly creatorName: string;
  };
  readonly financialTerms: {
    readonly targetAmount: InvestmentAmount;
    readonly tokenPrice: InvestmentAmount;
    readonly totalShares: number;
    readonly minimumInvestment: InvestmentAmount;
    readonly maximumInvestment?: InvestmentAmount;
    readonly expectedApy: number;
    readonly fundingDeadline: string;
    readonly lockupPeriod: number; // Days
    readonly dividendFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  };
  readonly riskMetrics: {
    readonly riskLevel: 'low' | 'medium' | 'high';
    readonly riskFactors: string[];
    readonly creditRating?: string;
    readonly liquidityScore: number;
    readonly volatilityEstimate: number;
  };
  readonly compliance: {
    readonly regCfCompliant: boolean;
    readonly sec506bCompliant: boolean;
    readonly accreditedOnly: boolean;
    readonly maxNonAccreditedInvestors: number;
    readonly stateExemptions: string[];
  };
  readonly fundingStatus: ProposalFundingStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Proposal funding status with precise tracking
 */
export interface ProposalFundingStatus {
  readonly raisedAmount: InvestmentAmount;
  readonly targetAmount: InvestmentAmount;
  readonly percentageFunded: number;
  readonly investorCount: number;
  readonly isFunded: boolean;
  readonly tokensIssued: boolean;
  readonly investors: ProposalInvestor[];
  readonly fundingHistory: FundingEvent[];
}

/**
 * Individual investor in a proposal
 */
export interface ProposalInvestor {
  readonly userId: string;
  readonly walletAddress: string;
  readonly investmentAmount: InvestmentAmount;
  readonly sharesAllocated: number;
  readonly isAccredited: boolean;
  readonly investmentDate: string;
  readonly verificationLevel: 'basic' | 'verified' | 'accredited';
}

/**
 * Funding event record
 */
export interface FundingEvent {
  readonly timestamp: string;
  readonly type: 'investment' | 'refund' | 'milestone';
  readonly amount: InvestmentAmount;
  readonly investorId: string;
  readonly transactionId: string;
  readonly metadata: Record<string, unknown>;
}

/**
 * Portfolio position with complete tracking
 */
export interface PortfolioPosition {
  readonly assetId: string;
  readonly proposalId: string;
  readonly userId: string;
  readonly shares: number;
  readonly costBasis: InvestmentAmount;
  readonly currentValue: InvestmentAmount;
  readonly unrealizedGain: InvestmentAmount;
  readonly realizedGain: InvestmentAmount;
  readonly dividendsReceived: InvestmentAmount;
  readonly performanceMetrics: AssetPerformanceMetrics;
  readonly isLocked: boolean;
  readonly lockupExpiryDate?: string;
  readonly acquisitionDate: string;
  readonly lastValuationDate: string;
}

/**
 * Financial calculation utilities with type safety
 */
export interface FinancialCalculations {
  calculateROI: (
    currentValue: InvestmentAmount,
    initialInvestment: InvestmentAmount
  ) => number;

  calculateAPY: (
    currentValue: InvestmentAmount,
    initialInvestment: InvestmentAmount,
    timeHeld: number // Days
  ) => number;

  calculateCompoundInterest: (
    principal: InvestmentAmount,
    rate: number,
    periods: number,
    compounding: 'daily' | 'monthly' | 'quarterly' | 'annually'
  ) => InvestmentAmount;

  calculatePortfolioValue: (
    positions: PortfolioPosition[]
  ) => PortfolioValue;

  calculateRiskMetrics: (
    priceHistory: number[],
    benchmarkHistory?: number[]
  ) => AssetPerformanceMetrics;
}

/**
 * Regulatory compliance types
 */
export interface RegulatoryLimits {
  readonly maxInvestmentPerOffering: InvestmentAmount;
  readonly maxAnnualInvestment: InvestmentAmount;
  readonly currentYearInvested: InvestmentAmount;
  readonly availableToInvest: InvestmentAmount;
  readonly limitBasis: 'income_based' | 'net_worth_based' | 'accredited_unlimited';
  readonly calculatedAt: string;
  readonly expiresAt: string;
}

/**
 * Investment eligibility check result
 */
export interface InvestmentEligibilityResult {
  readonly eligible: boolean;
  readonly maxInvestmentAmount: InvestmentAmount;
  readonly reasons: string[];
  readonly requiredVerificationLevel?: 'basic' | 'verified' | 'accredited';
  readonly blockedUntil?: string;
  readonly regulatoryLimits: RegulatoryLimits;
}

/**
 * Financial API response types
 */
export interface FinancialApiResponse<T> {
  readonly data: T;
  readonly success: boolean;
  readonly error?: string;
  readonly metadata: {
    readonly timestamp: string;
    readonly requestId: string;
    readonly processingTime: number;
  };
}

/**
 * Type guards for financial data validation
 */
export const FinancialTypeGuards = {
  isValidAmount: (value: unknown): value is InvestmentAmount => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'amount' in value &&
      'currency' in value &&
      'precision' in value &&
      'formatted' in value
    );
  },

  isValidTransaction: (value: unknown): value is FinancialTransaction => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'type' in value &&
      'status' in value &&
      'amount' in value &&
      'timestamp' in value
    );
  },

  isValidProposal: (value: unknown): value is InvestmentProposal => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'basicInfo' in value &&
      'financialTerms' in value &&
      'fundingStatus' in value
    );
  }
} as const;

/**
 * Financial error types
 */
export class FinancialError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FinancialError';
  }
}

export class InsufficientFundsError extends FinancialError {
  constructor(
    available: InvestmentAmount,
    required: InvestmentAmount
  ) {
    super(
      `Insufficient funds: Available ${available.formatted}, Required ${required.formatted}`,
      'INSUFFICIENT_FUNDS',
      { available, required }
    );
  }
}

export class RegulatoryLimitExceededError extends FinancialError {
  constructor(
    limit: InvestmentAmount,
    attempted: InvestmentAmount
  ) {
    super(
      `Regulatory limit exceeded: Limit ${limit.formatted}, Attempted ${attempted.formatted}`,
      'REGULATORY_LIMIT_EXCEEDED',
      { limit, attempted }
    );
  }
}

/**
 * Financial utility functions
 */
export const FinancialUtils = {
  /**
   * Create a properly formatted InvestmentAmount
   */
  createAmount: (
    amount: string,
    currency: CurrencyCode,
    precision = 2
  ): InvestmentAmount => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(parseFloat(amount));

    return {
      amount,
      currency,
      precision,
      formatted,
    };
  },

  /**
   * Add two InvestmentAmounts with currency validation
   */
  addAmounts: (
    a: InvestmentAmount,
    b: InvestmentAmount
  ): InvestmentAmount => {
    if (a.currency !== b.currency) {
      throw new FinancialError(
        'Cannot add amounts with different currencies',
        'CURRENCY_MISMATCH',
        { currency1: a.currency, currency2: b.currency }
      );
    }

    const sum = (parseFloat(a.amount) + parseFloat(b.amount)).toFixed(Math.max(a.precision, b.precision));
    return FinancialUtils.createAmount(sum, a.currency, Math.max(a.precision, b.precision));
  },

  /**
   * Convert amount to blockchain format
   */
  toBlockchainAmount: (
    amount: InvestmentAmount,
    denom: TokenDenom,
    decimals = 6
  ): BlockchainAmount => {
    const multiplier = Math.pow(10, decimals);
    const atomicAmount = (parseFloat(amount.amount) * multiplier).toFixed(0);

    return {
      amount: atomicAmount,
      denom,
      decimals,
    };
  },

  /**
   * Validate investment amount against regulatory limits
   */
  validateInvestmentAmount: (
    amount: InvestmentAmount,
    limits: RegulatoryLimits
  ): InvestmentEligibilityResult => {
    const amountValue = parseFloat(amount.amount);
    const maxPerOffering = parseFloat(limits.maxInvestmentPerOffering.amount);
    const availableToInvest = parseFloat(limits.availableToInvest.amount);

    const eligible = amountValue <= maxPerOffering && amountValue <= availableToInvest;
    const maxInvestmentAmount = FinancialUtils.createAmount(
      Math.min(maxPerOffering, availableToInvest).toString(),
      amount.currency,
      amount.precision
    );

    const reasons: string[] = [];
    if (amountValue > maxPerOffering) {
      reasons.push(`Exceeds maximum per offering limit of ${limits.maxInvestmentPerOffering.formatted}`);
    }
    if (amountValue > availableToInvest) {
      reasons.push(`Exceeds available investment capacity of ${limits.availableToInvest.formatted}`);
    }

    return {
      eligible,
      maxInvestmentAmount,
      reasons,
      regulatoryLimits: limits,
    };
  },
} as const;