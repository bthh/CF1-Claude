/**
 * CF1 Frontend - Validated API Service
 * Example service showing integration with Zod validation
 */

import { z } from 'zod';
import {
  AssetUpdatesResponseSchema,
  ProposalsResponseSchema,
  AuthResponseSchema,
  FeatureTogglesResponseSchema,
  type AssetUpdatesResponse,
  type ProposalsResponse,
  type AuthResponse,
  type FeatureTogglesResponse,
} from '../lib/validation/api-schemas';

import {
  fetchWithValidation,
  ApiValidators,
  SafeApiValidators,
  ApiValidationError,
} from '../lib/validation/api-validator';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Enhanced asset service with runtime validation
 */
export class ValidatedApiService {
  private static instance: ValidatedApiService;

  static getInstance(): ValidatedApiService {
    if (!ValidatedApiService.instance) {
      ValidatedApiService.instance = new ValidatedApiService();
    }
    return ValidatedApiService.instance;
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  /**
   * Create headers with authentication
   */
  private createHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Login with validated response
   */
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await fetchWithValidation(
        `${API_BASE_URL}/api/auth/login`,
        AuthResponseSchema,
        {
          method: 'POST',
          headers: this.createHeaders(),
          body: JSON.stringify(credentials),
        },
        'login'
      );

      // Store auth token if login successful
      if (response.success && response.accessToken) {
        localStorage.setItem('authToken', response.accessToken);
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Fetch proposals with validation
   */
  async fetchProposals(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ProposalsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);

      const url = `${API_BASE_URL}/api/v1/proposals${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

      return await fetchWithValidation(
        url,
        ProposalsResponseSchema,
        {
          method: 'GET',
          headers: this.createHeaders(),
        },
        'proposals'
      );
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      throw error;
    }
  }

  /**
   * Fetch asset updates with validation
   */
  async fetchAssetUpdates(): Promise<AssetUpdatesResponse> {
    try {
      return await fetchWithValidation(
        `${API_BASE_URL}/api/creator-toolkit/asset-updates`,
        AssetUpdatesResponseSchema,
        {
          method: 'GET',
          headers: this.createHeaders(),
        },
        'asset-updates'
      );
    } catch (error) {
      console.error('Failed to fetch asset updates:', error);
      throw error;
    }
  }

  /**
   * Fetch feature toggles with validation
   */
  async fetchFeatureToggles(): Promise<FeatureTogglesResponse> {
    try {
      return await fetchWithValidation(
        `${API_BASE_URL}/api/feature-toggles`,
        FeatureTogglesResponseSchema,
        {
          method: 'GET',
          headers: this.createHeaders(),
        },
        'feature-toggles'
      );
    } catch (error) {
      console.error('Failed to fetch feature toggles:', error);
      throw error;
    }
  }

  /**
   * Safe API call with graceful error handling
   */
  async safeApiCall<T>(
    url: string,
    schema: z.ZodSchema<T>,
    options?: RequestInit,
    context?: string
  ): Promise<{ success: true; data: T } | { success: false; error: string; isValidationError: boolean }> {
    try {
      const data = await fetchWithValidation(url, schema, options, context);
      return { success: true, data };
    } catch (error) {
      const isValidationError = error instanceof ApiValidationError;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      console.error(`API call failed (${context || url}):`, error);

      return {
        success: false,
        error: errorMessage,
        isValidationError,
      };
    }
  }

  /**
   * Example of handling validation errors gracefully
   */
  async fetchProposalsWithGracefulFallback(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ProposalsResponse> {
    const result = await SafeApiValidators.proposals(
      await fetch(`${API_BASE_URL}/api/v1/proposals`, {
        method: 'GET',
        headers: this.createHeaders(),
      }).then(res => res.json())
    );

    if (result.success) {
      return result.data;
    }

    // Handle validation error - return fallback data or re-throw
    console.warn('API response validation failed, using fallback data');

    // Return a fallback response that matches the schema
    return {
      success: true,
      data: [],
      total: 0,
      page: params?.page || 1,
      limit: params?.limit || 20,
    };
  }

  /**
   * Batch API calls with validation
   */
  async fetchDashboardData(): Promise<{
    proposals: ProposalsResponse;
    assetUpdates: AssetUpdatesResponse;
    featureToggles: FeatureTogglesResponse;
  }> {
    try {
      const [proposals, assetUpdates, featureToggles] = await Promise.all([
        this.fetchProposals({ limit: 5 }),
        this.fetchAssetUpdates(),
        this.fetchFeatureToggles(),
      ]);

      return {
        proposals,
        assetUpdates,
        featureToggles,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  /**
   * Create a proposal with request validation
   */
  async createProposal(proposalData: {
    title: string;
    description: string;
    type: 'governance' | 'funding' | 'parameter_change' | 'upgrade';
  }): Promise<AuthResponse> {
    // Validate request data before sending
    const CreateProposalRequestSchema = z.object({
      title: z.string().min(1).max(200),
      description: z.string().min(10),
      type: z.enum(['governance', 'funding', 'parameter_change', 'upgrade']),
    });

    try {
      // Validate request data
      const validatedData = CreateProposalRequestSchema.parse(proposalData);

      return await fetchWithValidation(
        `${API_BASE_URL}/api/v1/proposals`,
        AuthResponseSchema, // This would be a proper proposal response schema in practice
        {
          method: 'POST',
          headers: this.createHeaders(),
          body: JSON.stringify(validatedData),
        },
        'create-proposal'
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid proposal data: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const validatedApiService = ValidatedApiService.getInstance();

// Export individual methods for use in React hooks or other contexts
export const {
  login,
  fetchProposals,
  fetchAssetUpdates,
  fetchFeatureToggles,
  fetchDashboardData,
  createProposal,
} = validatedApiService;