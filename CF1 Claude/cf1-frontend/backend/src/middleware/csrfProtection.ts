/**
 * CF1 Backend - CSRF Protection Middleware
 * Implements Cross-Site Request Forgery protection
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Configuration
const CSRF_SECRET = process.env.CSRF_SECRET || 'cf1-dev-csrf-secret-key-32-chars-min';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_COOKIE_NAME = 'cf1_csrf_token';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Validate CSRF secret
if (process.env.NODE_ENV === 'production' && CSRF_SECRET.length < 32) {
  throw new Error('CSRF_SECRET must be at least 32 characters in production');
}

/**
 * CSRF Token Manager
 */
export class CSRFTokenManager {
  /**
   * Generate a new CSRF token
   */
  static generateToken(): string {
    return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  }

  /**
   * Create token signature for validation
   */
  static createTokenSignature(token: string, timestamp: number): string {
    const data = `${token}:${timestamp}`;
    return crypto.createHmac('sha256', CSRF_SECRET).update(data).digest('hex');
  }

  /**
   * Create signed token with timestamp
   */
  static createSignedToken(): { token: string; signedToken: string; timestamp: number } {
    const token = this.generateToken();
    const timestamp = Date.now();
    const signature = this.createTokenSignature(token, timestamp);
    const signedToken = `${token}:${timestamp}:${signature}`;
    
    return { token, signedToken, timestamp };
  }

  /**
   * Validate signed token
   */
  static validateSignedToken(signedToken: string): boolean {
    try {
      const parts = signedToken.split(':');
      if (parts.length !== 3) {
        return false;
      }

      const [token, timestampStr, signature] = parts;
      const timestamp = parseInt(timestampStr, 10);

      // Check if token is expired
      if (Date.now() - timestamp > CSRF_TOKEN_EXPIRY) {
        return false;
      }

      // Verify signature
      const expectedSignature = this.createTokenSignature(token, timestamp);
      return this.secureCompare(signature, expectedSignature);
    } catch (error) {
      return false;
    }
  }

  /**
   * Secure string comparison to prevent timing attacks
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

/**
 * CSRF Protection Middleware
 */
export interface CSRFRequest extends Request {
  csrfToken?: string;
}

/**
 * Generate CSRF token middleware
 */
export const generateCSRFToken = (req: CSRFRequest, res: Response, next: NextFunction) => {
  const { token, signedToken } = CSRFTokenManager.createSignedToken();
  
  // Store token in request for access
  req.csrfToken = token;
  
  // Set secure cookie (production should use httpOnly)
  res.cookie(CSRF_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_TOKEN_EXPIRY
  });

  // Also provide in header for SPA access
  res.setHeader('X-CSRF-Token', token);
  
  next();
};

/**
 * Validate CSRF token middleware
 */
export const validateCSRFToken = (req: CSRFRequest, res: Response, next: NextFunction) => {
  // Skip validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get token from various sources
  const tokenFromHeader = req.headers[CSRF_HEADER_NAME.toLowerCase()] as string;
  const tokenFromBody = req.body?._csrf;
  const tokenFromQuery = req.query._csrf as string;
  
  const providedToken = tokenFromHeader || tokenFromBody || tokenFromQuery;
  
  if (!providedToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING'
    });
  }

  // Get signed token from cookie
  const signedToken = req.cookies[CSRF_COOKIE_NAME];
  
  if (!signedToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token invalid',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  // Validate signed token
  if (!CSRFTokenManager.validateSignedToken(signedToken)) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token expired or invalid',
      code: 'CSRF_TOKEN_EXPIRED'
    });
  }

  // Extract token from signed token and compare
  const tokenFromCookie = signedToken.split(':')[0];
  
  if (!CSRFTokenManager.validateSignedToken(signedToken) || 
      !CSRFTokenManager.secureCompare(providedToken, tokenFromCookie)) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token validation failed',
      code: 'CSRF_TOKEN_VALIDATION_FAILED'
    });
  }

  next();
};

/**
 * CSRF token refresh middleware
 */
export const refreshCSRFToken = (req: CSRFRequest, res: Response, next: NextFunction) => {
  const signedToken = req.cookies[CSRF_COOKIE_NAME];
  
  if (signedToken) {
    const parts = signedToken.split(':');
    if (parts.length === 3) {
      const timestamp = parseInt(parts[1], 10);
      const age = Date.now() - timestamp;
      
      // Refresh token if it's more than 12 hours old
      if (age > CSRF_TOKEN_EXPIRY / 2) {
        const { token, signedToken: newSignedToken } = CSRFTokenManager.createSignedToken();
        
        res.cookie(CSRF_COOKIE_NAME, newSignedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: CSRF_TOKEN_EXPIRY
        });
        
        res.setHeader('X-CSRF-Token-Refresh', 'true');
        res.setHeader('X-New-CSRF-Token', token);
      }
    }
  }
  
  next();
};

/**
 * CSRF protection for specific routes
 */
export const csrfProtection = [generateCSRFToken, validateCSRFToken];

/**
 * Safe methods that don't require CSRF protection
 */
export const csrfSafeMethods = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Custom CSRF validation for specific needs
 */
export const customCSRFValidation = (req: CSRFRequest): boolean => {
  const tokenFromHeader = req.headers[CSRF_HEADER_NAME.toLowerCase()] as string;
  const signedToken = req.cookies[CSRF_COOKIE_NAME];
  
  if (!tokenFromHeader || !signedToken) {
    return false;
  }
  
  if (!CSRFTokenManager.validateSignedToken(signedToken)) {
    return false;
  }
  
  const tokenFromCookie = signedToken.split(':')[0];
  return CSRFTokenManager.secureCompare(tokenFromHeader, tokenFromCookie);
};

/**
 * Express error handler for CSRF failures
 */
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }
  
  next(err);
};

/**
 * Utility function to check if request needs CSRF protection
 */
export const needsCSRFProtection = (req: Request): boolean => {
  // Skip CSRF for safe methods
  if (csrfSafeMethods.includes(req.method)) {
    return false;
  }
  
  // Skip CSRF for certain API endpoints (if configured)
  const exemptPaths = [
    '/api/health',
    '/api/admin/login' // Login endpoint handles CSRF differently
  ];
  
  return !exemptPaths.some(path => req.path.startsWith(path));
};

export default {
  generateCSRFToken,
  validateCSRFToken,
  refreshCSRFToken,
  csrfProtection,
  csrfErrorHandler,
  needsCSRFProtection,
  customCSRFValidation
};