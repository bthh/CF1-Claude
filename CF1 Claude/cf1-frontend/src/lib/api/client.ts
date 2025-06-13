import { ErrorHandler } from '../errorHandler';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '';
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

      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          ...this.defaultHeaders,
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
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

  async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await this.fetchWithRetry(url, config);

      // Handle non-2xx responses
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
      // Let ErrorHandler process the error
      ErrorHandler.handle(error, `API Request: ${config.method || 'GET'} ${endpoint}`);

      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  async put<T = any>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  async patch<T = any>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data });
  }

  async delete<T = any>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
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

// Export type-safe API endpoints
export const api = {
  proposals: {
    list: (params?: any) => apiClient.get('/api/proposals', { body: params }),
    get: (id: string) => apiClient.get(`/api/proposals/${id}`),
    create: (data: any) => apiClient.post('/api/proposals', data),
    update: (id: string, data: any) => apiClient.put(`/api/proposals/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/proposals/${id}`),
    invest: (id: string, amount: number) => apiClient.post(`/api/proposals/${id}/invest`, { amount }),
  },
  portfolio: {
    overview: () => apiClient.get('/api/portfolio/overview'),
    investments: () => apiClient.get('/api/portfolio/investments'),
    transactions: () => apiClient.get('/api/portfolio/transactions'),
  },
  governance: {
    proposals: () => apiClient.get('/api/governance/proposals'),
    vote: (proposalId: string, vote: string) => apiClient.post(`/api/governance/proposals/${proposalId}/vote`, { vote }),
  },
  user: {
    profile: () => apiClient.get('/api/user/profile'),
    updateProfile: (data: any) => apiClient.patch('/api/user/profile', data),
    verification: {
      status: () => apiClient.get('/api/user/verification/status'),
      submit: (level: string, data: any) => apiClient.post('/api/user/verification/submit', { level, data }),
    },
  },
  analytics: {
    portfolio: (timeRange?: string) => apiClient.get('/api/analytics/portfolio', { body: { timeRange } }),
    market: () => apiClient.get('/api/analytics/market'),
  },
};