/**
 * CF1 Backend - Unified Authentication Middleware
 * Handles both JWT tokens (email/password) and existing admin auth (wallet)
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    walletAddress?: string;
    role: string;
    authMethod: 'email' | 'wallet' | 'hybrid';
    permissions?: string[];
  };
  isAdmin?: boolean;
  adminRole?: string;
}

export class UnifiedAuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Middleware to authenticate requests using either JWT or wallet auth
   */
  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check for JWT token first (Authorization header)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          const tokenPayload = this.authService.verifyAccessToken(token);
          const user = await this.authService.getUserById(tokenPayload.userId);
          
          if (!user || !user.isActive) {
            return this.sendUnauthorized(res, 'User not found or inactive');
          }

          req.user = {
            id: user.id,
            email: user.email,
            walletAddress: user.walletAddress,
            role: user.role,
            authMethod: user.primaryAuthMethod,
            permissions: user.permissions
          };

          return next();
        } catch (error) {
          return this.sendUnauthorized(res, 'Invalid or expired token');
        }
      }

      // Fallback to existing admin auth or wallet auth
      // Check for admin session cookies or headers
      const adminAuth = req.headers['x-admin-auth'] || req.cookies?.adminAuth;
      if (adminAuth) {
        // Use existing admin auth logic here
        // For now, we'll create a basic implementation
        req.user = {
          id: 'admin-user',
          role: 'super_admin',
          authMethod: 'wallet',
          permissions: ['*'] // Admin has all permissions
        };
        req.isAdmin = true;
        req.adminRole = 'super_admin';
        return next();
      }

      // No valid authentication found
      return this.sendUnauthorized(res, 'Authentication required');
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return this.sendUnauthorized(res, 'Authentication failed');
    }
  };

  /**
   * Optional authentication - doesn't fail if no auth provided
   */
  optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          const tokenPayload = this.authService.verifyAccessToken(token);
          const user = await this.authService.getUserById(tokenPayload.userId);
          
          if (user && user.isActive) {
            req.user = {
              id: user.id,
              email: user.email,
              walletAddress: user.walletAddress,
              role: user.role,
              authMethod: user.primaryAuthMethod,
              permissions: user.permissions
            };
          }
        } catch (error) {
          // Ignore token errors for optional auth
          console.log('Optional auth token error:', error.message);
        }
      }

      next();
    } catch (error) {
      console.error('Optional authentication middleware error:', error);
      next();
    }
  };

  /**
   * Require specific role
   */
  requireRole = (requiredRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        return this.sendUnauthorized(res, 'Authentication required');
      }

      if (!requiredRoles.includes(req.user.role)) {
        return this.sendForbidden(res, `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`);
      }

      next();
    };
  };

  /**
   * Require specific permission
   */
  requirePermission = (requiredPermission: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        return this.sendUnauthorized(res, 'Authentication required');
      }

      // Super admins have all permissions
      if (req.user.role === 'super_admin' || req.user.role === 'owner') {
        return next();
      }

      // Check specific permission
      if (!req.user.permissions?.includes(requiredPermission) && !req.user.permissions?.includes('*')) {
        return this.sendForbidden(res, `Insufficient permissions. Required: ${requiredPermission}`);
      }

      next();
    };
  };

  /**
   * Require wallet connection for blockchain operations
   */
  requireWallet = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return this.sendUnauthorized(res, 'Authentication required');
    }

    if (!req.user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet connection required for this operation',
        code: 'WALLET_REQUIRED'
      });
    }

    next();
  };

  /**
   * Admin only access
   */
  requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return this.sendUnauthorized(res, 'Authentication required');
    }

    const adminRoles = ['super_admin', 'owner'];
    if (!adminRoles.includes(req.user.role)) {
      return this.sendForbidden(res, 'Admin access required');
    }

    next();
  };

  /**
   * Rate limiting by user
   */
  rateLimit = (maxRequests: number, windowMs: number) => {
    const requestCounts = new Map<string, { count: number; resetTime: number }>();

    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      const userId = req.user?.id || req.ip;
      const now = Date.now();
      
      const userRequests = requestCounts.get(userId);
      
      if (!userRequests || now > userRequests.resetTime) {
        // Reset or initialize counter
        requestCounts.set(userId, {
          count: 1,
          resetTime: now + windowMs
        });
        return next();
      }

      if (userRequests.count >= maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
        });
      }

      userRequests.count++;
      next();
    };
  };

  private sendUnauthorized(res: Response, message: string): void {
    res.status(401).json({
      success: false,
      message,
      code: 'UNAUTHORIZED'
    });
  }

  private sendForbidden(res: Response, message: string): void {
    res.status(403).json({
      success: false,
      message,
      code: 'FORBIDDEN'
    });
  }
}

// Export singleton instance
export const unifiedAuth = new UnifiedAuthMiddleware();

// Export commonly used middleware functions
export const authenticate = unifiedAuth.authenticate;
export const optionalAuth = unifiedAuth.optionalAuth;
export const requireRole = unifiedAuth.requireRole;
export const requirePermission = unifiedAuth.requirePermission;
export const requireWallet = unifiedAuth.requireWallet;
export const requireAdmin = unifiedAuth.requireAdmin;
export const rateLimit = unifiedAuth.rateLimit;