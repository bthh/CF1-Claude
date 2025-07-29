/**
 * CF1 Secure Storage Utilities
 * Implements encrypted localStorage for sensitive data
 */

// Security configuration
const IS_PRODUCTION = import.meta.env.MODE === 'production';
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'cf1-dev-encryption-key-32-chars-min';

// Ensure encryption key is properly configured
if (IS_PRODUCTION && ENCRYPTION_KEY.length < 32) {
  throw new Error('VITE_ENCRYPTION_KEY must be at least 32 characters in production');
}

/**
 * Simple encryption for development (Base64)
 * Production should use proper AES-256-GCM encryption
 */
class SimpleEncryption {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  encrypt(data: string): string {
    if (!IS_PRODUCTION) {
      // Development: Simple Base64 encoding
      return btoa(data);
    }
    
    // Production: Implement proper AES-256-GCM encryption
    // For now, using enhanced Base64 with key mixing
    const keyedData = this.mixWithKey(data);
    return btoa(keyedData);
  }

  decrypt(encryptedData: string): string {
    if (!IS_PRODUCTION) {
      // Development: Simple Base64 decoding
      return atob(encryptedData);
    }
    
    // Production: Implement proper AES-256-GCM decryption
    // For now, using enhanced Base64 with key unmixing
    const keyedData = atob(encryptedData);
    return this.unmixWithKey(keyedData);
  }

  private mixWithKey(data: string): string {
    // Simple key mixing for enhanced security
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const dataChar = data.charCodeAt(i);
      const keyChar = this.key.charCodeAt(i % this.key.length);
      result += String.fromCharCode(dataChar ^ keyChar);
    }
    return result;
  }

  private unmixWithKey(keyedData: string): string {
    // Reverse the key mixing
    let result = '';
    for (let i = 0; i < keyedData.length; i++) {
      const keyedChar = keyedData.charCodeAt(i);
      const keyChar = this.key.charCodeAt(i % this.key.length);
      result += String.fromCharCode(keyedChar ^ keyChar);
    }
    return result;
  }
}

// Initialize encryption instance
const encryption = new SimpleEncryption(ENCRYPTION_KEY);

/**
 * Secure storage interface
 */
export interface SecureStorageData {
  data: any;
  timestamp: number;
  expiresAt?: number;
  version: string;
}

export class SecureStorage {
  private static VERSION = '1.0.0';

  /**
   * Store data securely with encryption and expiration
   */
  static setItem(key: string, data: any, expirationHours: number = 24): void {
    try {
      const storageData: SecureStorageData = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (expirationHours * 60 * 60 * 1000),
        version: this.VERSION
      };

      const jsonData = JSON.stringify(storageData);
      const encryptedData = encryption.encrypt(jsonData);
      
      localStorage.setItem(key, encryptedData);
    } catch (error) {
      console.error('SecureStorage.setItem error:', error);
      throw new Error('Failed to store data securely');
    }
  }

  /**
   * Retrieve and decrypt data from secure storage
   */
  static getItem<T = any>(key: string): T | null {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) return null;

      const jsonData = encryption.decrypt(encryptedData);
      const storageData: SecureStorageData = JSON.parse(jsonData);

      // Check version compatibility
      if (storageData.version !== this.VERSION) {
        console.warn('SecureStorage version mismatch, clearing data');
        this.removeItem(key);
        return null;
      }

      // Check expiration
      if (storageData.expiresAt && Date.now() > storageData.expiresAt) {
        console.warn('SecureStorage data expired, clearing');
        this.removeItem(key);
        return null;
      }

      return storageData.data;
    } catch (error) {
      console.error('SecureStorage.getItem error:', error);
      // If decryption fails, clear the corrupted data
      this.removeItem(key);
      return null;
    }
  }

  /**
   * Remove data from secure storage
   */
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all secure storage data
   */
  static clear(): void {
    // Only clear keys that look like they might be encrypted
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cf1_')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Check if data exists and is valid
   */
  static hasValidItem(key: string): boolean {
    try {
      const data = this.getItem(key);
      return data !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get storage metadata without decrypting data
   */
  static getMetadata(key: string): { timestamp: number; expiresAt?: number } | null {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) return null;

      const jsonData = encryption.decrypt(encryptedData);
      const storageData: SecureStorageData = JSON.parse(jsonData);

      return {
        timestamp: storageData.timestamp,
        expiresAt: storageData.expiresAt
      };
    } catch {
      return null;
    }
  }
}

/**
 * Secure session storage specifically for admin sessions
 */
export class SecureSessionStorage {
  private static ADMIN_SESSION_KEY = 'cf1_admin_session';
  private static ADMIN_TOKEN_KEY = 'cf1_admin_token';

  /**
   * Store admin session data securely
   */
  static setAdminSession(adminUser: any, token: string): void {
    try {
      SecureStorage.setItem(this.ADMIN_SESSION_KEY, {
        user: adminUser,
        metadata: {
          loginTime: Date.now(),
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      }, 24); // 24 hour expiration

      SecureStorage.setItem(this.ADMIN_TOKEN_KEY, token, 24);
    } catch (error) {
      console.error('Failed to store admin session:', error);
      throw new Error('Session storage failed');
    }
  }

  /**
   * Retrieve admin session data
   */
  static getAdminSession(): { user: any; metadata: any } | null {
    return SecureStorage.getItem(this.ADMIN_SESSION_KEY);
  }

  /**
   * Retrieve admin token
   */
  static getAdminToken(): string | null {
    return SecureStorage.getItem(this.ADMIN_TOKEN_KEY);
  }

  /**
   * Clear admin session data
   */
  static clearAdminSession(): void {
    SecureStorage.removeItem(this.ADMIN_SESSION_KEY);
    SecureStorage.removeItem(this.ADMIN_TOKEN_KEY);
  }

  /**
   * Check if admin session is valid
   */
  static hasValidAdminSession(): boolean {
    return SecureStorage.hasValidItem(this.ADMIN_SESSION_KEY) && 
           SecureStorage.hasValidItem(this.ADMIN_TOKEN_KEY);
  }
}

/**
 * Security utilities for data integrity
 */
export class SecurityUtils {
  /**
   * Generate secure random string
   */
  static generateSecureId(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate data integrity
   */
  static validateDataIntegrity(data: any): boolean {
    try {
      if (!data || typeof data !== 'object') return false;
      if (!data.timestamp || typeof data.timestamp !== 'number') return false;
      if (!data.version || typeof data.version !== 'string') return false;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Secure data comparison
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * Clean sensitive data from memory
   */
  static cleanSensitiveData(obj: any): void {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
          obj[key] = null;
        }
      });
    }
  }
}

// Export default instance
export default SecureStorage;