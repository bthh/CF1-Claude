// CF1 Platform - API Type Definitions
// Strict TypeScript for all API interactions

import {
  InvestmentProposal,
  FinancialTransaction,
  PortfolioPosition,
  PortfolioValue,
  InvestmentAmount,
  InvestmentEligibilityResult,
  FinancialApiResponse
} from './financial';
import { UserVerificationState, VerificationLevel } from './verification';
import { AnalyticsDashboard, UserAnalytics } from './analytics';

/**
 * Base API configuration interface
 */
export interface ApiRequestConfig {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
  readonly timeout?: number;
  readonly retries?: number;
  readonly retryDelay?: number;
}

/**
 * Enhanced API response with strict typing
 */
export interface ApiResponse<T = unknown> {
  readonly data?: T;
  readonly error?: string;
  readonly success: boolean;
  readonly metadata?: {
    readonly timestamp: string;
    readonly requestId: string;
    readonly processingTime: number;
  };
}

/**
 * Proposal API types
 */
export namespace ProposalAPI {
  export interface ListParams {
    readonly page?: number;
    readonly limit?: number;
    readonly status?: InvestmentProposal['fundingStatus']['isFunded'];
    readonly assetType?: string;
    readonly sortBy?: 'created_at' | 'target_amount' | 'funding_deadline';
    readonly sortOrder?: 'asc' | 'desc';
  }

  export interface CreateRequest {
    readonly basicInfo: {
      readonly title: string;
      readonly description: string;
      readonly assetType: string;
      readonly creatorName: string;
    };
    readonly assetDetails: {
      readonly name: string;
      readonly category: string;
      readonly location: string;
      readonly description: string;
    };
    readonly financialTerms: {
      readonly targetAmount: number;
      readonly tokenPrice: string;
      readonly totalShares: number;
      readonly minimumInvestment: number;
      readonly expectedApy: string;
      readonly fundingDeadline: number;
    };
  }

  export interface UpdateRequest extends Partial<CreateRequest> {
    readonly id: string;
  }

  export interface InvestRequest {
    readonly amount: number;
    readonly verificationLevel: VerificationLevel;
    readonly acceptedTerms: boolean;
    readonly accreditedInvestor?: boolean;
  }

  export interface InvestResponse {
    readonly transactionId: string;
    readonly status: 'pending' | 'confirmed' | 'failed';
    readonly blockchainTxHash?: string;
    readonly estimatedSettlement: string;
  }

  export interface ListResponse {
    readonly proposals: InvestmentProposal[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  }
}

/**
 * Portfolio API types
 */
export namespace PortfolioAPI {
  export interface OverviewResponse {
    readonly portfolioValue: PortfolioValue;
    readonly positions: PortfolioPosition[];
    readonly recentTransactions: FinancialTransaction[];
    readonly performanceSummary: {
      readonly todayChange: InvestmentAmount;
      readonly weekChange: InvestmentAmount;
      readonly monthChange: InvestmentAmount;
      readonly yearChange: InvestmentAmount;
    };
  }

  export interface InvestmentsResponse {
    readonly positions: PortfolioPosition[];
    readonly summary: PortfolioValue;
    readonly assetAllocation: Array<{
      readonly assetType: string;
      readonly percentage: number;
      readonly value: InvestmentAmount;
    }>;
  }

  export interface TransactionsParams {
    readonly page?: number;
    readonly limit?: number;
    readonly type?: FinancialTransaction['type'];
    readonly status?: FinancialTransaction['status'];
    readonly startDate?: string;
    readonly endDate?: string;
  }

  export interface TransactionsResponse {
    readonly transactions: FinancialTransaction[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
  }
}

/**
 * Governance API types
 */
export namespace GovernanceAPI {
  export interface GovernanceProposal {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly type: 'parameter_change' | 'upgrade' | 'text_proposal' | 'spend_proposal';
    readonly status: 'voting' | 'passed' | 'rejected' | 'failed' | 'deposit_period';
    readonly votingStartTime: string;
    readonly votingEndTime: string;
    readonly totalVotes: {
      readonly yes: number;
      readonly no: number;
      readonly abstain: number;
      readonly noWithVeto: number;
    };
    readonly proposer: string;
    readonly createdAt: string;
  }

  export interface VoteRequest {
    readonly vote: 'yes' | 'no' | 'abstain' | 'no_with_veto';
    readonly memo?: string;
  }

  export interface VoteResponse {
    readonly transactionId: string;
    readonly status: 'pending' | 'confirmed' | 'failed';
    readonly blockchainTxHash?: string;
  }

  export interface ProposalsResponse {
    readonly proposals: GovernanceProposal[];
    readonly userVotes: Record<string, string>; // proposalId -> vote
  }
}

/**
 * User API types
 */
export namespace UserAPI {
  export interface UserProfile {
    readonly id: string;
    readonly walletAddress: string;
    readonly email?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly verificationLevel: VerificationLevel;
    readonly isAccredited: boolean;
    readonly kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
    readonly preferences: {
      readonly notifications: {
        readonly email: boolean;
        readonly push: boolean;
        readonly sms: boolean;
      };
      readonly language: string;
      readonly timezone: string;
      readonly currency: string;
    };
    readonly createdAt: string;
    readonly updatedAt: string;
  }

  export interface UpdateProfileRequest {
    readonly email?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly preferences?: Partial<UserProfile['preferences']>;
  }

  export interface VerificationStatusResponse {
    readonly verificationState: UserVerificationState;
    readonly nextSteps: string[];
    readonly estimatedCompletionTime: string;
  }

  export interface VerificationSubmitRequest {
    readonly level: VerificationLevel;
    readonly data: Record<string, unknown>;
    readonly documents?: Array<{
      readonly type: string;
      readonly fileName: string;
      readonly content: string; // Base64 encoded
    }>;
  }

  export interface VerificationSubmitResponse {
    readonly submissionId: string;
    readonly status: 'submitted' | 'processing' | 'completed' | 'failed';
    readonly estimatedProcessingTime: string;
  }
}

/**
 * Analytics API types
 */
export namespace AnalyticsAPI {
  export interface PortfolioAnalyticsParams {
    readonly timeRange?: '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
    readonly includeProjections?: boolean;
    readonly currency?: string;
  }

  export interface PortfolioAnalyticsResponse {
    readonly userAnalytics: UserAnalytics;
    readonly benchmarkComparison: {
      readonly sp500: number;
      readonly bondIndex: number;
      readonly reMarketIndex: number;
    };
    readonly projections?: {
      readonly month: InvestmentAmount;
      readonly quarter: InvestmentAmount;
      readonly year: InvestmentAmount;
    };
  }

  export interface MarketAnalyticsResponse {
    readonly platformAnalytics: AnalyticsDashboard;
    readonly marketTrends: {
      readonly growthSectors: string[];
      readonly decliningMetrics: string[];
      readonly emergingOpportunities: string[];
    };
  }
}

/**
 * Admin API types
 */
export namespace AdminAPI {
  export interface AdminUser {
    readonly id: string;
    readonly username: string;
    readonly email: string;
    readonly role: 'super_admin' | 'platform_admin' | 'creator_admin';
    readonly permissions: string[];
    readonly isActive: boolean;
    readonly lastLoginAt?: string;
    readonly createdAt: string;
  }

  export interface LoginRequest {
    readonly username: string;
    readonly password: string;
    readonly rememberMe?: boolean;
  }

  export interface LoginResponse {
    readonly token: string;
    readonly user: AdminUser;
    readonly expiresAt: string;
    readonly permissions: string[];
  }

  export interface UsersListResponse {
    readonly users: AdminUser[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
  }

  export interface CreateUserRequest {
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly role: AdminUser['role'];
    readonly permissions?: string[];
  }

  export interface UpdateUserRequest {
    readonly email?: string;
    readonly role?: AdminUser['role'];
    readonly permissions?: string[];
    readonly isActive?: boolean;
  }
}

/**
 * AI Analysis API types
 */
export namespace AIAnalysisAPI {
  export interface AnalysisRequest {
    readonly proposalId: string;
    readonly documentIds: string[];
    readonly analysisType: 'comprehensive' | 'financial' | 'legal' | 'risk';
  }

  export interface AnalysisResponse {
    readonly analysisId: string;
    readonly status: 'pending' | 'processing' | 'completed' | 'failed';
    readonly results?: {
      readonly score: number;
      readonly confidence: number;
      readonly riskFactors: string[];
      readonly strengths: string[];
      readonly concerns: string[];
      readonly financialProjections?: Record<string, number>;
      readonly legalCompliance?: {
        readonly regCfCompliant: boolean;
        readonly issues: string[];
      };
    };
    readonly processedAt?: string;
    readonly estimatedCompletion?: string;
  }
}

/**
 * Type-safe API client interface
 */
export interface TypedApiClient {
  // Proposals
  proposals: {
    list: (params?: ProposalAPI.ListParams) => Promise<ApiResponse<ProposalAPI.ListResponse>>;
    get: (id: string) => Promise<ApiResponse<InvestmentProposal>>;
    create: (data: ProposalAPI.CreateRequest) => Promise<ApiResponse<InvestmentProposal>>;
    update: (id: string, data: ProposalAPI.UpdateRequest) => Promise<ApiResponse<InvestmentProposal>>;
    delete: (id: string) => Promise<ApiResponse<void>>;
    invest: (id: string, data: ProposalAPI.InvestRequest) => Promise<ApiResponse<ProposalAPI.InvestResponse>>;
    checkEligibility: (id: string, amount: number) => Promise<ApiResponse<InvestmentEligibilityResult>>;
  };

  // Portfolio
  portfolio: {
    overview: () => Promise<ApiResponse<PortfolioAPI.OverviewResponse>>;
    investments: () => Promise<ApiResponse<PortfolioAPI.InvestmentsResponse>>;
    transactions: (params?: PortfolioAPI.TransactionsParams) => Promise<ApiResponse<PortfolioAPI.TransactionsResponse>>;
  };

  // Governance
  governance: {
    proposals: () => Promise<ApiResponse<GovernanceAPI.ProposalsResponse>>;
    vote: (proposalId: string, data: GovernanceAPI.VoteRequest) => Promise<ApiResponse<GovernanceAPI.VoteResponse>>;
  };

  // User
  user: {
    profile: () => Promise<ApiResponse<UserAPI.UserProfile>>;
    updateProfile: (data: UserAPI.UpdateProfileRequest) => Promise<ApiResponse<UserAPI.UserProfile>>;
    verification: {
      status: () => Promise<ApiResponse<UserAPI.VerificationStatusResponse>>;
      submit: (data: UserAPI.VerificationSubmitRequest) => Promise<ApiResponse<UserAPI.VerificationSubmitResponse>>;
    };
  };

  // Analytics
  analytics: {
    portfolio: (params?: AnalyticsAPI.PortfolioAnalyticsParams) => Promise<ApiResponse<AnalyticsAPI.PortfolioAnalyticsResponse>>;
    market: () => Promise<ApiResponse<AnalyticsAPI.MarketAnalyticsResponse>>;
  };

  // Admin
  admin: {
    login: (data: AdminAPI.LoginRequest) => Promise<ApiResponse<AdminAPI.LoginResponse>>;
    users: {
      list: (page?: number, limit?: number) => Promise<ApiResponse<AdminAPI.UsersListResponse>>;
      create: (data: AdminAPI.CreateUserRequest) => Promise<ApiResponse<AdminAPI.AdminUser>>;
      update: (id: string, data: AdminAPI.UpdateUserRequest) => Promise<ApiResponse<AdminAPI.AdminUser>>;
      delete: (id: string) => Promise<ApiResponse<void>>;
    };
  };

  // AI Analysis
  ai: {
    analyze: (data: AIAnalysisAPI.AnalysisRequest) => Promise<ApiResponse<AIAnalysisAPI.AnalysisResponse>>;
    getAnalysis: (analysisId: string) => Promise<ApiResponse<AIAnalysisAPI.AnalysisResponse>>;
  };
}

/**
 * API error types for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR', { fieldErrors });
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class RateLimitError extends ApiError {
  constructor(
    message = 'Rate limit exceeded',
    public readonly retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR', { retryAfter });
  }
}

/**
 * Type guards for API responses
 */
export const ApiTypeGuards = {
  isSuccessResponse: <T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } => {
    return response.success && response.data !== undefined;
  },

  isErrorResponse: <T>(response: ApiResponse<T>): response is ApiResponse<T> & { error: string } => {
    return !response.success && response.error !== undefined;
  },

  isApiError: (error: unknown): error is ApiError => {
    return error instanceof ApiError;
  },

  isValidProposal: (data: unknown): data is InvestmentProposal => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      'basicInfo' in data &&
      'financialTerms' in data &&
      'fundingStatus' in data
    );
  },
} as const;