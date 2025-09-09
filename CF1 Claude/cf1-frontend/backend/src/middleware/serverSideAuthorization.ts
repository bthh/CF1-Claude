/**
 * CF1 Backend - Server-Side Authorization Middleware
 * Prevents client-side authorization bypass with comprehensive server-side validation
 */

import { Request, Response, NextFunction } from 'express';
import { AdminAuthenticatedRequest } from './adminAuth';
import { AuditLogger, AuditEventType } from './auditLogger';

// Role definitions with hierarchical permissions
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  INVESTOR = 'investor',
  CREATOR = 'creator',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// Permission definitions
export enum Permission {
  // Proposal permissions
  VIEW_PROPOSALS = 'view_proposals',
  CREATE_PROPOSALS = 'create_proposals',
  EDIT_PROPOSALS = 'edit_proposals',
  DELETE_PROPOSALS = 'delete_proposals',
  APPROVE_PROPOSALS = 'approve_proposals',
  INSTANT_FUND_PROPOSALS = 'instant_fund_proposals',
  
  // Investment permissions
  MAKE_INVESTMENTS = 'make_investments',
  VIEW_INVESTMENTS = 'view_investments',
  MANAGE_INVESTMENTS = 'manage_investments',
  
  // Governance permissions
  VIEW_GOVERNANCE = 'view_governance',
  CREATE_GOVERNANCE_PROPOSALS = 'create_governance_proposals',
  VOTE_GOVERNANCE = 'vote_governance',
  EXECUTE_GOVERNANCE = 'execute_governance',
  
  // Admin permissions
  VIEW_ADMIN_DASHBOARD = 'view_admin_dashboard',
  MANAGE_USERS = 'manage_users',
  MANAGE_PLATFORM = 'manage_platform',
  VIEW_ANALYTICS = 'view_analytics',
  FINANCIAL_OPERATIONS = 'financial_operations',
  
  // System permissions
  SYSTEM_MAINTENANCE = 'system_maintenance',
  AUDIT_LOGS = 'audit_logs',
  SECURITY_SETTINGS = 'security_settings'
}

// Role-Permission Matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.GUEST]: [
    Permission.VIEW_PROPOSALS
  ],
  
  [UserRole.USER]: [
    Permission.VIEW_PROPOSALS,
    Permission.VIEW_GOVERNANCE
  ],
  
  [UserRole.INVESTOR]: [
    Permission.VIEW_PROPOSALS,
    Permission.MAKE_INVESTMENTS,
    Permission.VIEW_INVESTMENTS,
    Permission.VIEW_GOVERNANCE,
    Permission.VOTE_GOVERNANCE
  ],
  
  [UserRole.CREATOR]: [
    Permission.VIEW_PROPOSALS,
    Permission.CREATE_PROPOSALS,
    Permission.EDIT_PROPOSALS,
    Permission.MAKE_INVESTMENTS,
    Permission.VIEW_INVESTMENTS,
    Permission.VIEW_GOVERNANCE,
    Permission.VOTE_GOVERNANCE,
    Permission.CREATE_GOVERNANCE_PROPOSALS
  ],
  
  [UserRole.MODERATOR]: [
    Permission.VIEW_PROPOSALS,
    Permission.CREATE_PROPOSALS,
    Permission.EDIT_PROPOSALS,
    Permission.APPROVE_PROPOSALS,
    Permission.MAKE_INVESTMENTS,
    Permission.VIEW_INVESTMENTS,
    Permission.MANAGE_INVESTMENTS,
    Permission.VIEW_GOVERNANCE,
    Permission.VOTE_GOVERNANCE,
    Permission.CREATE_GOVERNANCE_PROPOSALS,
    Permission.VIEW_ADMIN_DASHBOARD,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.ADMIN]: [
    Permission.VIEW_PROPOSALS,
    Permission.CREATE_PROPOSALS,
    Permission.EDIT_PROPOSALS,
    Permission.APPROVE_PROPOSALS,
    Permission.MAKE_INVESTMENTS,
    Permission.VIEW_INVESTMENTS,
    Permission.MANAGE_INVESTMENTS,
    Permission.VIEW_GOVERNANCE,
    Permission.VOTE_GOVERNANCE,
    Permission.CREATE_GOVERNANCE_PROPOSALS,
    Permission.VIEW_ADMIN_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.DELETE_PROPOSALS,
    Permission.INSTANT_FUND_PROPOSALS,
    Permission.EXECUTE_GOVERNANCE,
    Permission.MANAGE_USERS,
    Permission.MANAGE_PLATFORM,
    Permission.FINANCIAL_OPERATIONS,
    Permission.AUDIT_LOGS
  ],
  
  [UserRole.SUPER_ADMIN]: [
    Permission.VIEW_PROPOSALS,
    Permission.CREATE_PROPOSALS,
    Permission.EDIT_PROPOSALS,
    Permission.APPROVE_PROPOSALS,
    Permission.MAKE_INVESTMENTS,
    Permission.VIEW_INVESTMENTS,
    Permission.MANAGE_INVESTMENTS,
    Permission.VIEW_GOVERNANCE,
    Permission.VOTE_GOVERNANCE,
    Permission.CREATE_GOVERNANCE_PROPOSALS,
    Permission.VIEW_ADMIN_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.DELETE_PROPOSALS,
    Permission.INSTANT_FUND_PROPOSALS,
    Permission.EXECUTE_GOVERNANCE,
    Permission.MANAGE_USERS,
    Permission.MANAGE_PLATFORM,
    Permission.FINANCIAL_OPERATIONS,
    Permission.AUDIT_LOGS,
    Permission.SYSTEM_MAINTENANCE,
    Permission.SECURITY_SETTINGS
  ]
};

// Resource-specific access control
interface ResourceAccess {
  resource: string;
  action: string;
  permission: Permission;
  additionalChecks?: (req: Request, resource: any) => boolean;
}

// API endpoint to permission mapping
const ENDPOINT_PERMISSIONS: Record<string, ResourceAccess[]> = {
  // Proposal endpoints
  'GET:/api/v1/proposals': [
    { resource: 'proposals', action: 'list', permission: Permission.VIEW_PROPOSALS }
  ],
  'GET:/api/v1/proposals/:id': [
    { resource: 'proposals', action: 'view', permission: Permission.VIEW_PROPOSALS }
  ],
  'POST:/api/v1/proposals': [
    { resource: 'proposals', action: 'create', permission: Permission.CREATE_PROPOSALS }
  ],
  'PUT:/api/v1/proposals/:id': [
    { 
      resource: 'proposals', 
      action: 'edit', 
      permission: Permission.EDIT_PROPOSALS,
      additionalChecks: (req: Request, proposal: any) => {
        // Users can only edit their own proposals unless they're admin
        const userRole = (req as any).userRole;
        const userId = (req as any).userId;
        return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN || 
               proposal.creator === userId;
      }
    }
  ],
  'DELETE:/api/v1/proposals/:id': [
    { resource: 'proposals', action: 'delete', permission: Permission.DELETE_PROPOSALS }
  ],
  'POST:/api/v1/proposals/:id/admin/instant-fund': [
    { resource: 'proposals', action: 'instant_fund', permission: Permission.INSTANT_FUND_PROPOSALS }
  ],
  
  // Investment endpoints
  'POST:/api/v1/proposals/:id/invest': [
    { resource: 'investments', action: 'create', permission: Permission.MAKE_INVESTMENTS }
  ],
  'GET:/api/v1/proposals/:id/investments': [
    { resource: 'investments', action: 'view', permission: Permission.VIEW_INVESTMENTS }
  ],
  
  // Governance endpoints
  'GET:/api/v1/governance': [
    { resource: 'governance', action: 'list', permission: Permission.VIEW_GOVERNANCE }
  ],
  'POST:/api/v1/governance': [
    { resource: 'governance', action: 'create', permission: Permission.CREATE_GOVERNANCE_PROPOSALS }
  ],
  'POST:/api/v1/governance/:id/vote': [
    { resource: 'governance', action: 'vote', permission: Permission.VOTE_GOVERNANCE }
  ],
  'POST:/api/v1/governance/:id/execute': [
    { resource: 'governance', action: 'execute', permission: Permission.EXECUTE_GOVERNANCE }
  ],
  
  // Admin endpoints
  'GET:/api/admin/dashboard': [
    { resource: 'admin', action: 'dashboard', permission: Permission.VIEW_ADMIN_DASHBOARD }
  ],
  'GET:/api/admin/users': [
    { resource: 'admin', action: 'users', permission: Permission.MANAGE_USERS }
  ],
  'GET:/api/admin/analytics': [
    { resource: 'admin', action: 'analytics', permission: Permission.VIEW_ANALYTICS }
  ],
  'POST:/api/admin/financial': [
    { resource: 'admin', action: 'financial', permission: Permission.FINANCIAL_OPERATIONS }
  ]
};

/**
 * Authorization manager
 */
export class AuthorizationManager {
  /**
   * Check if a role has a specific permission
   */
  static hasPermission(role: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if user can access a specific endpoint
   */
  static canAccessEndpoint(
    role: UserRole, 
    method: string, 
    path: string, 
    req?: Request, 
    resource?: any
  ): { authorized: boolean; reason?: string } {
    const endpointKey = `${method}:${path}`;
    const resourceAccess = ENDPOINT_PERMISSIONS[endpointKey];

    if (!resourceAccess) {
      // If endpoint not explicitly configured, allow for basic endpoints
      const basicEndpoints = ['/health', '/api/config', '/auth', '/admin/auth'];
      if (basicEndpoints.some(endpoint => path.startsWith(endpoint))) {
        return { authorized: true };
      }
      return { authorized: false, reason: 'Endpoint not configured for authorization' };
    }

    // Check each required permission
    for (const access of resourceAccess) {
      if (!this.hasPermission(role, access.permission)) {
        return { 
          authorized: false, 
          reason: `Missing required permission: ${access.permission}` 
        };
      }

      // Additional resource-specific checks
      if (access.additionalChecks && req && resource) {
        if (!access.additionalChecks(req, resource)) {
          return { 
            authorized: false, 
            reason: 'Failed resource-specific authorization check' 
          };
        }
      }
    }

    return { authorized: true };
  }

  /**
   * Extract user role from request
   */
  static extractUserRole(req: Request): UserRole {
    // Check admin user first
    const adminReq = req as AdminAuthenticatedRequest;
    if (adminReq.adminUser) {
      return UserRole.ADMIN; // Could be enhanced to check for super_admin
    }

    // Check regular user role
    const userRole = (req as any).userRole || (req as any).user?.role;
    if (userRole && Object.values(UserRole).includes(userRole)) {
      return userRole as UserRole;
    }

    // Default to guest for unauthenticated requests
    return UserRole.GUEST;
  }

  /**
   * Normalize path for endpoint matching
   */
  static normalizePath(path: string): string {
    // Replace path parameters with placeholders
    return path
      .replace(/\/[a-f0-9-]{36}/g, '/:id') // UUIDs
      .replace(/\/prop_[a-zA-Z0-9_]+/g, '/:id') // Proposal IDs
      .replace(/\/\d+/g, '/:id') // Numeric IDs
      .replace(/\/[a-zA-Z0-9_-]+$/g, '/:id'); // Generic IDs at end
  }
}

/**
 * Server-side authorization middleware
 */
export const serverSideAuthorization = (req: Request, res: Response, next: NextFunction) => {
  try {
    const method = req.method;
    const originalPath = req.path;
    const normalizedPath = AuthorizationManager.normalizePath(originalPath);
    const userRole = AuthorizationManager.extractUserRole(req);
    
    // Log authorization attempt
    AuditLogger.logEvent(
      AuditEventType.API_REQUEST,
      'Authorization check',
      req,
      {
        method,
        originalPath,
        normalizedPath,
        userRole,
        userAgent: req.get('user-agent'),
        ipAddress: req.ip
      }
    );

    // Check authorization
    const authResult = AuthorizationManager.canAccessEndpoint(
      userRole, 
      method, 
      normalizedPath, 
      req
    );

    if (!authResult.authorized) {
      // Log unauthorized access attempt
      AuditLogger.logEvent(
        AuditEventType.SECURITY_UNAUTHORIZED_ACCESS,
        'Unauthorized access attempt',
        req,
        {
          method,
          path: originalPath,
          userRole,
          reason: authResult.reason,
          requiredEndpoint: `${method}:${normalizedPath}`
        }
      );

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'UNAUTHORIZED_ACCESS',
        details: {
          requiredPermissions: ENDPOINT_PERMISSIONS[`${method}:${normalizedPath}`]?.map(a => a.permission) || [],
          userRole,
          reason: authResult.reason
        }
      });
    }

    // Store authorization info in request for later use
    (req as any).authorization = {
      userRole,
      permissions: AuthorizationManager.getRolePermissions(userRole),
      authorized: true
    };

    next();

  } catch (error) {
    console.error('Authorization middleware error:', error);
    
    // Log authorization error
    AuditLogger.logEvent(
      AuditEventType.SYSTEM_ERROR,
      'Authorization middleware error',
      req,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    );

    res.status(500).json({
      success: false,
      error: 'Authorization system error',
      code: 'AUTHORIZATION_ERROR'
    });
  }
};

/**
 * Role-based access control middleware factory
 */
export const requireRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = AuthorizationManager.extractUserRole(req);
    
    // Check role hierarchy
    const roleHierarchy = Object.values(UserRole);
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    if (userRoleIndex < requiredRoleIndex) {
      AuditLogger.logEvent(
        AuditEventType.SECURITY_UNAUTHORIZED_ACCESS,
        'Insufficient role level',
        req,
        {
          userRole,
          requiredRole,
          path: req.path
        }
      );

      return res.status(403).json({
        success: false,
        error: `Role '${requiredRole}' or higher required`,
        code: 'INSUFFICIENT_ROLE',
        details: {
          userRole,
          requiredRole
        }
      });
    }

    next();
  };
};

/**
 * Permission-based access control middleware factory
 */
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = AuthorizationManager.extractUserRole(req);
    
    if (!AuthorizationManager.hasPermission(userRole, permission)) {
      AuditLogger.logEvent(
        AuditEventType.SECURITY_UNAUTHORIZED_ACCESS,
        'Missing required permission',
        req,
        {
          userRole,
          requiredPermission: permission,
          path: req.path
        }
      );

      return res.status(403).json({
        success: false,
        error: `Permission '${permission}' required`,
        code: 'MISSING_PERMISSION',
        details: {
          userRole,
          requiredPermission: permission,
          userPermissions: AuthorizationManager.getRolePermissions(userRole)
        }
      });
    }

    next();
  };
};

/**
 * Resource ownership validation middleware
 */
export const requireResourceOwnership = (resourceGetter: (req: Request) => any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = AuthorizationManager.extractUserRole(req);
    const userId = (req as any).userId;
    
    // Admins can access any resource
    if (userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) {
      return next();
    }

    const resource = resourceGetter(req);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found',
        code: 'RESOURCE_NOT_FOUND'
      });
    }

    // Check ownership
    if (resource.creator !== userId && resource.owner !== userId) {
      AuditLogger.logEvent(
        AuditEventType.SECURITY_UNAUTHORIZED_ACCESS,
        'Resource ownership violation',
        req,
        {
          userId,
          resourceId: resource.id,
          resourceOwner: resource.creator || resource.owner,
          path: req.path
        }
      );

      return res.status(403).json({
        success: false,
        error: 'You can only access your own resources',
        code: 'OWNERSHIP_VIOLATION'
      });
    }

    next();
  };
};

export default {
  serverSideAuthorization,
  requireRole,
  requirePermission,
  requireResourceOwnership,
  AuthorizationManager,
  UserRole,
  Permission
};