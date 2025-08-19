// Security utilities for XSS protection and input sanitization
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
};

/**
 * Sanitize user input for safe display
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate and sanitize search queries
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') return '';
  
  return query
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .replace(/script/gi, '') // Remove script keyword
    .replace(/javascript/gi, '') // Remove javascript keyword
    .slice(0, 100) // Limit length
    .trim();
};

/**
 * Sanitize proposal and asset names
 */
export const sanitizeAssetName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .replace(/[<>'"&]/g, '') // Remove HTML/JS dangerous chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 200) // Reasonable length limit
    .trim();
};

/**
 * Validate URLs to prevent malicious redirects
 */
export const validateURL = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    
    // Only allow https and http protocols
    if (!['https:', 'http:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Block localhost and private IPs in production
    if (import.meta.env.PROD && (
      urlObj.hostname === 'localhost' ||
      urlObj.hostname.startsWith('192.168.') ||
      urlObj.hostname.startsWith('10.') ||
      urlObj.hostname.startsWith('172.')
    )) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Generate Content Security Policy header
 */
export const generateCSP = (): string => {
  const nonce = crypto.randomUUID();
  
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.neutron.org https://rpc-palvus.pion-1.ntrn.tech https://rest-palvus.pion-1.ntrn.tech",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');
  
  return csp;
};

/**
 * Security headers for enhanced protection
 */
export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': generateCSP(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
};

/**
 * Rate limiting utility for sensitive operations
 */
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);
    
    if (!userAttempts || now - userAttempts.lastAttempt > this.windowMs) {
      // Reset or initialize
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return { allowed: true, remaining: this.maxAttempts - 1 };
    }
    
    if (userAttempts.count >= this.maxAttempts) {
      return { allowed: false, remaining: 0 };
    }
    
    userAttempts.count++;
    userAttempts.lastAttempt = now;
    this.attempts.set(identifier, userAttempts);
    
    return { allowed: true, remaining: this.maxAttempts - userAttempts.count };
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Export rate limiter instances for different operations
export const adminOperationLimiter = new RateLimiter(3, 10 * 60 * 1000); // 3 attempts per 10 minutes
export const searchLimiter = new RateLimiter(100, 60 * 1000); // 100 searches per minute
export const loginLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

/**
 * Secure random string generation
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Input validation patterns
 */
export const ValidationPatterns = {
  // Safe text input (no HTML/JS)
  safeText: /^[a-zA-Z0-9\s\-_.!?()]{1,200}$/,
  
  // Asset names and descriptions
  assetName: /^[a-zA-Z0-9\s\-_.&()]{1,100}$/,
  
  // Wallet addresses
  walletAddress: /^neutron[a-z0-9]{39}$/,
  
  // Proposal IDs
  proposalId: /^[a-zA-Z0-9_-]{1,50}$/,
  
  // Safe URLs
  safeUrl: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9.-_~!$&'()*+,;=:@%/?]*)?$/,
};

/**
 * Validate input against patterns
 */
export const validateInput = (input: string, pattern: RegExp): boolean => {
  return pattern.test(input);
};

export default {
  sanitizeHTML,
  sanitizeInput,
  sanitizeSearchQuery,
  sanitizeAssetName,
  validateURL,
  generateCSP,
  getSecurityHeaders,
  adminOperationLimiter,
  searchLimiter,
  loginLimiter,
  generateSecureToken,
  ValidationPatterns,
  validateInput,
};