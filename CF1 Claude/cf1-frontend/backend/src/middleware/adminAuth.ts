/**
 * CF1 Backend - Admin Authentication Middleware
 * Provides secure admin authentication for production deployment
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { auditAuth, auditSecurity, AuditEventType, AuditLogger } from './auditLogger';
import { AdminUserService } from '../services/AdminUserService';

// Secure admin authentication configuration - NO DEFAULT VALUES
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Additional admin users (Brock and Brian)
const BROCK_PASSWORD_HASH = process.env.BROCK_PASSWORD_HASH;
const BRIAN_PASSWORD_HASH = process.env.BRIAN_PASSWORD_HASH;

// Define admin users with their credentials and permissions (supports both username and email)
const ADMIN_USERS: { [key: string]: { passwordHash: string; permissions: string[]; role: string; displayName: string } } = {
  cf1admin: {
    passwordHash: ADMIN_PASSWORD_HASH!,
    permissions: ['admin', 'governance', 'proposals', 'users', 'super_admin'],
    role: 'super_admin',
    displayName: 'CF1 Admin'
  },
  'admin@cf1platform.com': {
    passwordHash: ADMIN_PASSWORD_HASH!,
    permissions: ['admin', 'governance', 'proposals', 'users', 'super_admin'],
    role: 'super_admin',
    displayName: 'CF1 Admin'
  },
  brock: {
    passwordHash: BROCK_PASSWORD_HASH || '',
    permissions: ['admin', 'governance', 'proposals', 'users', 'super_admin'],
    role: 'super_admin',
    displayName: 'Brock'
  },
  'bthardwick@gmail.com': {
    passwordHash: BROCK_PASSWORD_HASH || '',
    permissions: ['admin', 'governance', 'proposals', 'users', 'super_admin'],
    role: 'super_admin',
    displayName: 'Brock'
  },
  brian: {
    passwordHash: BRIAN_PASSWORD_HASH || '',
    permissions: ['admin', 'governance', 'proposals', 'users', 'super_admin'],
    role: 'super_admin',
    displayName: 'Brian'
  },
  'brian@cf1platform.com': {
    passwordHash: BRIAN_PASSWORD_HASH || '',
    permissions: ['admin', 'governance', 'proposals', 'users', 'super_admin'],
    role: 'super_admin',
    displayName: 'Brian'
  }
};

// Validate required environment variables at startup
if (!ADMIN_API_KEY) {
  throw new Error('ADMIN_API_KEY environment variable is required');
}
if (!ADMIN_USERNAME) {
  throw new Error('ADMIN_USERNAME environment variable is required');
}
if (!ADMIN_PASSWORD_HASH) {
  throw new Error('ADMIN_PASSWORD_HASH environment variable is required');
}
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Validate JWT secret strength
if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

export interface AdminAuthenticatedRequest extends Request {
  adminUser?: {
    username: string;
    permissions: string[];
  };
}

/**
 * Middleware for API key authentication
 */
export const requireAdminApiKey = (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Admin API key required',
      code: 'MISSING_API_KEY'
    });
  }
  
  if (apiKey !== ADMIN_API_KEY) {
    // Log failed authentication attempt
    auditSecurity.breachAttempt(req, {
      attemptType: 'invalid_api_key',
      providedKey: Array.isArray(apiKey) ? apiKey[0]?.substring(0, 8) + '...' : apiKey?.substring(0, 8) + '...' // Log only first 8 characters
    });
    
    return res.status(401).json({
      success: false,
      error: 'Invalid admin API key',
      code: 'INVALID_API_KEY'
    });
  }
  
  // Set admin user context
  req.adminUser = {
    username: ADMIN_USERNAME,
    permissions: ['admin', 'governance', 'proposals', 'users']
  };
  
  // Log successful admin authentication
  AuditLogger.logEvent(AuditEventType.ADMIN_LOGIN, 'Admin API key authentication successful', req, {
    username: ADMIN_USERNAME,
    authMethod: 'api_key'
  });
  
  next();
};

/**
 * Middleware for basic authentication
 */
export const requireAdminBasicAuth = async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      success: false,
      error: 'Admin basic authentication required',
      code: 'MISSING_BASIC_AUTH'
    });
  }
  
  const base64Credentials = authHeader.replace('Basic ', '');
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  
  // Validate credentials securely
  if (username !== ADMIN_USERNAME) {
    // Log failed authentication attempt
    auditAuth.loginFailure(req, username, 'invalid_username');
    
    return res.status(401).json({
      success: false,
      error: 'Invalid admin credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }
  
  // Use bcrypt to compare password hash
  const isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!isPasswordValid) {
    // Log failed authentication attempt
    auditAuth.loginFailure(req, username, 'invalid_password');
    
    return res.status(401).json({
      success: false,
      error: 'Invalid admin credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }
  
  // Set admin user context
  req.adminUser = {
    username: ADMIN_USERNAME,
    permissions: ['admin', 'governance', 'proposals', 'users']
  };
  
  next();
};

/**
 * Middleware for JWT authentication (production implementation)
 */
export const requireAdminJWT = (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Admin JWT token required',
      code: 'MISSING_JWT'
    });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET!) as any;
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        error: 'JWT token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // Set admin user context from JWT payload
    req.adminUser = {
      username: decoded.username,
      permissions: decoded.permissions || ['admin', 'governance', 'proposals', 'users']
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid JWT token',
      code: 'INVALID_JWT'
    });
  }
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (permission: string) => {
  return (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }
    
    if (!req.adminUser.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Permission '${permission}' required`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};

/**
 * Default admin authentication (uses JWT in production, API key in development)
 */
export const requireAdmin = process.env.NODE_ENV === 'production' ? requireAdminJWT : requireAdminApiKey;

/**
 * Admin login endpoint to generate JWT token
 */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password required',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    // Use database service to authenticate user
    const adminUserService = new AdminUserService();
    const authenticatedUser = await adminUserService.authenticateUser(username, password);
    
    if (!authenticatedUser) {
      // Log failed login attempt
      auditAuth.loginFailure(req, username, 'invalid_credentials');
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Generate JWT token with user permissions
    const token = generateAdminJWT(authenticatedUser.username, authenticatedUser.permissions);
    
    // Log successful login with audit system
    auditAuth.loginSuccess(req, username);
    
    res.json({
      success: true,
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: {
        id: authenticatedUser.id,
        username: authenticatedUser.username,
        permissions: authenticatedUser.permissions,
        role: authenticatedUser.role,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        lastLoginAt: authenticatedUser.lastLoginAt
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Rate limiting for admin operations
 */
export const adminRateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  const requests = new Map<string, number[]>();
  
  return (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = req.adminUser?.username || req.ip;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key)!;
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      // Log rate limit violation
      auditSecurity.rateLimitHit(req, req.path, maxRequests);
      
      return res.status(429).json({
        success: false,
        error: 'Admin rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: windowMs / 1000
      });
    }
    
    validRequests.push(now);
    requests.set(key, validRequests);
    
    next();
  };
};

/**
 * Generate JWT token for admin user
 */
export const generateAdminJWT = (username: string, permissions: string[] = ['admin', 'governance', 'proposals', 'users']) => {
  const payload = {
    username,
    permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  return jwt.sign(payload, JWT_SECRET!);
};

/**
 * Hash password for admin user (utility function)
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate secure API key
 */
export const generateSecureApiKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Logging middleware for admin operations
 */
export const logAdminOperation = (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  const operation = `${req.method} ${req.path}`;
  const admin = req.adminUser?.username || 'unknown';
  
  // Log admin operation with comprehensive audit system
  AuditLogger.logEvent(AuditEventType.ADMIN_SYSTEM_ACTION, `Admin operation: ${operation}`, req, {
    adminUsername: admin,
    operation,
    requestBody: req.body,
    requestQuery: req.query,
    requestParams: req.params
  });
  
  next();
};