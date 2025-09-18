import { SecureErrorHandler } from '../../utils/secureErrorHandler';
import { CSRFProtection } from '../../utils/csrfProtection';
import { performanceMonitor } from '../../utils/performanceMonitoring';
import {
  ApiResponse,
  ApiRequestConfig,
  TypedApiClient,
  ProposalAPI,
  PortfolioAPI,
  GovernanceAPI,
  UserAPI,
  AnalyticsAPI,
  AdminAPI,
  AIAnalysisAPI,
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ApiTypeGuards
} from '../../types/api';
import {
  InvestmentProposal,
  FinancialTransaction,
  InvestmentEligibilityResult
} from '../../types/financial';

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.defaultTimeout = 30000; // 30 seconds
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(
    url: string,
    config: ApiRequestConfig,
    attempt = 1
  ): Promise<Response> {
    const maxRetries = config.retries || 3;
    const retryDelay = config.retryDelay || 1000;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        config.timeout || this.defaultTimeout
      );

      // Get CSRF headers for non-GET requests
      const method = config.method || 'GET';
      const csrfHeaders = ['GET', 'HEAD', 'OPTIONS'].includes(method) ? {} : CSRFProtection.getHeaders();
      
      // Add CSRF token to body for non-GET requests
      let body = config.body;
      if (body && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        body = CSRFProtection.addTokenToJSON(body);
      }

      const response = await fetch(url, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...csrfHeaders,
          ...config.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        credentials: 'include', // Include cookies for CSRF tokens
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.fetchWithRetry(url, config, attempt + 1);
      }
      throw error;
    }
  }

  async request<T = unknown>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = performance.now();
    const method = config.method || 'GET';

    try {
      const response = await this.fetchWithRetry(url, config);
      const duration = performance.now() - startTime;

      // Track API performance
      performanceMonitor.trackAPIResponse(endpoint, duration, response?.status || 200, method);

      // Handle non-2xx responses
      if (!response) {
        throw new Error('Network request failed - no response received');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));

        throw new Error(errorData.message || errorData.error || 'Request failed');
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      // Track failed API performance
      const duration = performance.now() - startTime;
      // Handle different error types with proper typing
      let status = 500;
      if (error && typeof error === 'object') {
        const errorObj = error as Record<string, unknown>;
        if (
          errorObj.response &&
          typeof errorObj.response === 'object' &&
          errorObj.response !== null &&
          'status' in errorObj.response &&
          typeof errorObj.response.status === 'number'
        ) {
          status = errorObj.response.status;
        } else if ('status' in errorObj && typeof errorObj.status === 'number') {
          status = errorObj.status;
        }
      }
      performanceMonitor.trackAPIResponse(endpoint, duration, status, method);

      // Let SecureErrorHandler process the error
      const secureError = SecureErrorHandler.handle(error, `API Request: ${method} ${endpoint}`);

      return {
        error: secureError.userMessage,
        success: false,
      };
    }
  }

  // Convenience methods with strict typing
  async get<T = unknown>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = unknown>(endpoint: string, data?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  async put<T = unknown>(endpoint: string, data?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  async patch<T = unknown>(endpoint: string, data?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data });
  }

  async delete<T = unknown>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Set auth token
  setAuthToken(token: string | null): void {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Update base URL (useful for switching environments)
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export type-safe API endpoints implementing TypedApiClient interface
export const api: TypedApiClient = {
  proposals: {
    list: (params?: ProposalAPI.ListParams) =>
      apiClient.get<ProposalAPI.ListResponse>('/api/proposals', { body: params }),
    get: (id: string) =>
      apiClient.get<InvestmentProposal>(`/api/proposals/${id}`),
    create: (data: ProposalAPI.CreateRequest) =>
      apiClient.post<InvestmentProposal>('/api/proposals', data),
    update: (id: string, data: ProposalAPI.UpdateRequest) =>
      apiClient.put<InvestmentProposal>(`/api/proposals/${id}`, data),
    delete: (id: string) =>
      apiClient.delete<void>(`/api/proposals/${id}`),
    invest: (id: string, data: ProposalAPI.InvestRequest) =>
      apiClient.post<ProposalAPI.InvestResponse>(`/api/proposals/${id}/invest`, data),
    checkEligibility: (id: string, amount: number) =>
      apiClient.get<InvestmentEligibilityResult>(`/api/proposals/${id}/eligibility`, { body: { amount } }),
  },
  portfolio: {
    overview: () =>
      apiClient.get<PortfolioAPI.OverviewResponse>('/api/portfolio/overview'),
    investments: () =>
      apiClient.get<PortfolioAPI.InvestmentsResponse>('/api/portfolio/investments'),
    transactions: (params?: PortfolioAPI.TransactionsParams) =>
      apiClient.get<PortfolioAPI.TransactionsResponse>('/api/portfolio/transactions', { body: params }),
  },
  governance: {
    proposals: () =>
      apiClient.get<GovernanceAPI.ProposalsResponse>('/api/governance/proposals'),
    vote: (proposalId: string, data: GovernanceAPI.VoteRequest) =>
      apiClient.post<GovernanceAPI.VoteResponse>(`/api/governance/proposals/${proposalId}/vote`, data),
  },
  user: {
    profile: () =>
      apiClient.get<UserAPI.UserProfile>('/api/user/profile'),
    updateProfile: (data: UserAPI.UpdateProfileRequest) =>
      apiClient.patch<UserAPI.UserProfile>('/api/user/profile', data),
    verification: {
      status: () =>
        apiClient.get<UserAPI.VerificationStatusResponse>('/api/user/verification/status'),
      submit: (data: UserAPI.VerificationSubmitRequest) =>
        apiClient.post<UserAPI.VerificationSubmitResponse>('/api/user/verification/submit', data),
    },
  },
  analytics: {
    portfolio: (params?: AnalyticsAPI.PortfolioAnalyticsParams) =>
      apiClient.get<AnalyticsAPI.PortfolioAnalyticsResponse>('/api/analytics/portfolio', { body: params }),
    market: () =>
      apiClient.get<AnalyticsAPI.MarketAnalyticsResponse>('/api/analytics/market'),
  },
  admin: {
    login: (data: AdminAPI.LoginRequest) =>
      apiClient.post<AdminAPI.LoginResponse>('/api/admin/login', data),
    users: {
      list: (page = 1, limit = 50) =>
        apiClient.get<AdminAPI.UsersListResponse>(`/api/admin/users?page=${page}&limit=${limit}`),
      create: (data: AdminAPI.CreateUserRequest) =>
        apiClient.post<AdminAPI.AdminUser>('/api/admin/users', data),
      update: (id: string, data: AdminAPI.UpdateUserRequest) =>
        apiClient.put<AdminAPI.AdminUser>(`/api/admin/users/${id}`, data),
      delete: (id: string) =>
        apiClient.delete<void>(`/api/admin/users/${id}`),
    },
  },
  ai: {
    analyze: (data: AIAnalysisAPI.AnalysisRequest) =>
      apiClient.post<AIAnalysisAPI.AnalysisResponse>('/api/ai/analyze', data),
    getAnalysis: (analysisId: string) =>
      apiClient.get<AIAnalysisAPI.AnalysisResponse>(`/api/ai/analysis/${analysisId}`),
  },
};