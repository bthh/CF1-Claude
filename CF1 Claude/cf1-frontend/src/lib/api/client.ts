import { SecureErrorHandler } from '../../utils/secureErrorHandler';
import { CSRFProtection } from '../../utils/csrfProtection';
import { performanceMonitor } from '../../utils/performanceMonitoring';

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

  async request<T = any>(
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
      // Handle different error types
      let status = 500;
      if (error && typeof error === 'object') {
        const errorObj = error as any;
        if (errorObj.response?.status) {
          status = errorObj.response.status;
        } else if (errorObj.status) {
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