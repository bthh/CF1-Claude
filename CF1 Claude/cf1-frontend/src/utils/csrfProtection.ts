/**
 * CF1 CSRF Protection Utilities
 * Implements Cross-Site Request Forgery protection for all forms
 */

import { SecurityUtils } from './secureStorage';

// Configuration
const IS_PRODUCTION = import.meta.env.MODE === 'production';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_COOKIE_NAME = 'cf1_csrf_token';
const CSRF_STORAGE_KEY = 'cf1_csrf_token';

/**
 * CSRF Token Manager
 */
export class CSRFManager {
  private static instance: CSRFManager;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  private constructor() {}

  static getInstance(): CSRFManager {
    if (!CSRFManager.instance) {
      CSRFManager.instance = new CSRFManager();
    }
    return CSRFManager.instance;
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    const token = SecurityUtils.generateSecureId(32);
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    this.token = token;
    this.tokenExpiry = expiryTime;
    
    // Store in secure storage
    this.storeToken(token, expiryTime);
    
    return token;
  }

  /**
   * Get current CSRF token (generate if needed)
   */
  getToken(): string {
    if (!this.token || this.isTokenExpired()) {
      return this.generateToken();
    }
    return this.token;
  }

  /**
   * Validate CSRF token
   */
  validateToken(providedToken: string): boolean {
    if (!this.token || this.isTokenExpired()) {
      return false;
    }
    
    // Use secure comparison to prevent timing attacks
    return SecurityUtils.secureCompare(this.token, providedToken);
  }

  /**
   * Check if current token is expired
   */
  private isTokenExpired(): boolean {
    return Date.now() >= this.tokenExpiry;
  }

  /**
   * Store token securely
   */
  private storeToken(token: string, expiry: number): void {
    try {
      const tokenData = {
        token,
        expiry,
        timestamp: Date.now()
      };
      
      if (IS_PRODUCTION) {
        // In production, store in httpOnly cookie via backend
        // For now, use localStorage with security warning
        console.warn('CSRF token stored in localStorage - use httpOnly cookies in production');
        localStorage.setItem(CSRF_STORAGE_KEY, JSON.stringify(tokenData));
      } else {
        // Development: localStorage is acceptable
        localStorage.setItem(CSRF_STORAGE_KEY, JSON.stringify(tokenData));
      }
    } catch (error) {
      console.error('Failed to store CSRF token:', error);
    }
  }

  /**
   * Load token from storage
   */
  private loadToken(): void {
    try {
      const storedData = localStorage.getItem(CSRF_STORAGE_KEY);
      if (storedData) {
        const tokenData = JSON.parse(storedData);
        if (tokenData.expiry > Date.now()) {
          this.token = tokenData.token;
          this.tokenExpiry = tokenData.expiry;
        } else {
          // Token expired, remove from storage
          localStorage.removeItem(CSRF_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load CSRF token:', error);
      localStorage.removeItem(CSRF_STORAGE_KEY);
    }
  }

  /**
   * Clear CSRF token
   */
  clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
    localStorage.removeItem(CSRF_STORAGE_KEY);
  }

  /**
   * Initialize CSRF manager
   */
  initialize(): void {
    this.loadToken();
    if (!this.token || this.isTokenExpired()) {
      this.generateToken();
    }
  }
}

/**
 * CSRF Protection Hook for React Components
 */
export class CSRFProtection {
  private static csrfManager = CSRFManager.getInstance();

  /**
   * Initialize CSRF protection
   */
  static initialize(): void {
    this.csrfManager.initialize();
  }

  /**
   * Get CSRF token for forms
   */
  static getToken(): string {
    return this.csrfManager.getToken();
  }

  /**
   * Add CSRF token to form data
   */
  static addTokenToFormData(formData: FormData): FormData {
    const token = this.getToken();
    formData.append('_csrf', token);
    return formData;
  }

  /**
   * Add CSRF token to JSON payload
   */
  static addTokenToJSON(data: any): any {
    const token = this.getToken();
    return {
      ...data,
      _csrf: token
    };
  }

  /**
   * Get CSRF headers for API requests
   */
  static getHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      [CSRF_HEADER_NAME]: token
    };
  }

  /**
   * Create secure form component wrapper
   */
  static createSecureForm(formProps: React.FormHTMLAttributes<HTMLFormElement>) {
    const token = this.getToken();
    
    return {
      ...formProps,
      children: [
        // Add hidden CSRF token field
        React.createElement('input', {
          key: 'csrf-token',
          type: 'hidden',
          name: '_csrf',
          value: token
        }),
        // Add original children
        ...(Array.isArray(formProps.children) ? formProps.children : [formProps.children])
      ]
    };
  }

  /**
   * Validate CSRF token from request
   */
  static validateToken(token: string): boolean {
    return this.csrfManager.validateToken(token);
  }

  /**
   * Clear CSRF token (logout)
   */
  static clearToken(): void {
    this.csrfManager.clearToken();
  }
}

/**
 * React Hook for CSRF protection
 */
export const useCSRFProtection = () => {
  const getToken = () => CSRFProtection.getToken();
  const getHeaders = () => CSRFProtection.getHeaders();
  const addTokenToJSON = (data: any) => CSRFProtection.addTokenToJSON(data);
  const addTokenToFormData = (formData: FormData) => CSRFProtection.addTokenToFormData(formData);
  
  return {
    getToken,
    getHeaders,
    addTokenToJSON,
    addTokenToFormData
  };
};

/**
 * Secure Fetch wrapper with CSRF protection
 */
export const secureApiCall = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const csrfHeaders = CSRFProtection.getHeaders();
  
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders,
      ...options.headers
    }
  };

  // Add CSRF token to body if it's a JSON request
  if (options.body && typeof options.body === 'string') {
    try {
      const bodyData = JSON.parse(options.body);
      const secureBody = CSRFProtection.addTokenToJSON(bodyData);
      secureOptions.body = JSON.stringify(secureBody);
    } catch (error) {
      // If body is not JSON, keep original
      console.warn('Could not parse request body as JSON for CSRF protection');
    }
  }

  try {
    const response = await fetch(url, secureOptions);
    
    // Check if CSRF token needs refresh
    if (response.headers.get('X-CSRF-Token-Refresh')) {
      const newToken = response.headers.get('X-New-CSRF-Token');
      if (newToken) {
        CSRFManager.getInstance().generateToken();
      }
    }
    
    return response;
  } catch (error) {
    console.error('Secure API call failed:', error);
    throw error;
  }
};

/**
 * Initialize CSRF protection when module loads
 */
CSRFProtection.initialize();

export default CSRFProtection;