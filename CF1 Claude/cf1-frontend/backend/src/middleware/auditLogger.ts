/**
 * CF1 Backend - Comprehensive Audit Logger
 * Tracks all user actions and system events for compliance and security
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Production configuration
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const AUDIT_STORAGE_ENABLED = process.env.AUDIT_STORAGE_ENABLED !== 'false';
const AUDIT_RETENTION_DAYS = parseInt(process.env.AUDIT_RETENTION_DAYS || '2555'); // 7 years default

/**
 * Audit event types for comprehensive tracking
 */
export enum AuditEventType {
  // Authentication events
  AUTH_LOGIN_SUCCESS = 'auth.login.success',
  AUTH_LOGIN_FAILURE = 'auth.login.failure',
  AUTH_LOGOUT = 'auth.logout',
  AUTH_TOKEN_REFRESH = 'auth.token.refresh',
  AUTH_SESSION_EXPIRED = 'auth.session.expired',
  
  // Admin actions
  ADMIN_LOGIN = 'admin.login',
  ADMIN_LOGOUT = 'admin.logout',
  ADMIN_CONFIG_CHANGE = 'admin.config.change',
  ADMIN_USER_ACTION = 'admin.user.action',
  ADMIN_SYSTEM_ACTION = 'admin.system.action',
  ADMIN_ACTION = 'admin.action',
  
  // User actions
  USER_ACTION = 'user.action',
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  
  // Proposal management
  PROPOSAL_CREATE = 'proposal.create',
  PROPOSAL_UPDATE = 'proposal.update',
  PROPOSAL_DELETE = 'proposal.delete',
  PROPOSAL_SUBMIT = 'proposal.submit',
  PROPOSAL_APPROVE = 'proposal.approve',
  PROPOSAL_REJECT = 'proposal.reject',
  PROPOSAL_INVEST = 'proposal.invest',
  
  // Asset management
  ASSET_CREATE = 'asset.create',
  ASSET_UPDATE = 'asset.update',
  ASSET_DELETE = 'asset.delete',
  ASSET_TRANSFER = 'asset.transfer',
  ASSET_LOCK = 'asset.lock',
  ASSET_UNLOCK = 'asset.unlock',
  
  // Governance events
  GOVERNANCE_PROPOSAL_CREATE = 'governance.proposal.create',
  GOVERNANCE_VOTE_CAST = 'governance.vote.cast',
  GOVERNANCE_PROPOSAL_EXECUTE = 'governance.proposal.execute',
  
  // Financial events
  FINANCIAL_DEPOSIT = 'financial.deposit',
  FINANCIAL_WITHDRAWAL = 'financial.withdrawal',
  FINANCIAL_TRANSFER = 'financial.transfer',
  FINANCIAL_FEE_PAYMENT = 'financial.fee.payment',
  
  // Security events
  SECURITY_BREACH_ATTEMPT = 'security.breach.attempt',
  SECURITY_RATE_LIMIT_HIT = 'security.rate_limit.hit',
  SECURITY_CSRF_VIOLATION = 'security.csrf.violation',
  SECURITY_UNAUTHORIZED_ACCESS = 'security.unauthorized.access',
  SECURITY_SUSPICIOUS_ACTIVITY = 'security.suspicious.activity',
  
  // System events
  SYSTEM_ERROR = 'system.error',
  SYSTEM_STARTUP = 'system.startup',
  SYSTEM_SHUTDOWN = 'system.shutdown',
  SYSTEM_HEALTH_CHECK = 'system.health.check',
  
  // Data events
  DATA_EXPORT = 'data.export',
  DATA_IMPORT = 'data.import',
  DATA_BACKUP = 'data.backup',
  DATA_RESTORE = 'data.restore',
  DATA_ACCESS = 'data.access',
  
  // System configuration
  SYSTEM_CONFIG = 'system.config',
  
  // Compliance events
  COMPLIANCE_KYC_SUBMIT = 'compliance.kyc.submit',
  COMPLIANCE_KYC_APPROVE = 'compliance.kyc.approve',
  COMPLIANCE_KYC_REJECT = 'compliance.kyc.reject',
  COMPLIANCE_REPORT_GENERATE = 'compliance.report.generate',
  
  // API events
  API_REQUEST = 'api.request',
  API_RESPONSE = 'api.response',
  API_ERROR = 'api.error',
  API_RATE_LIMIT = 'api.rate_limit'
}

/**
 * Risk levels for audit events
 */
export enum AuditRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Audit event structure
 */
export interface AuditEvent {
  id: string;
  timestamp: number;
  eventType: AuditEventType;
  riskLevel: AuditRiskLevel;
  userId?: string;
  userRole?: string;
  sessionId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details: Record<string, any>;
  metadata: {
    path: string;
    method: string;
    statusCode?: number;
    duration?: number;
    size?: number;
  };
  compliance: {
    retention: number; // Unix timestamp for when to purge
    classification: 'public' | 'internal' | 'confidential' | 'restricted';
    requiresReview: boolean;
  };
}

/**
 * Comprehensive Audit Logger
 */
export class AuditLogger {
  private static auditLog: AuditEvent[] = [];
  private static readonly MAX_MEMORY_LOG_SIZE = 10000;
  private static readonly SENSITIVE_FIELDS = [
    'password',
    'token',
    'secret',
    'key',
    'credential',
    'authorization',
    'cookie',
    'session',
    'private_key',
    'mnemonic',
    'seed'
  ];

  /**
   * Generate unique audit event ID
   */
  static generateEventId(): string {
    return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Sanitize sensitive data from audit details
   */
  static sanitizeAuditData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = Array.isArray(data) ? [] : {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      // Check if field contains sensitive information
      if (this.SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        (sanitized as any)[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        (sanitized as any)[key] = this.sanitizeAuditData(value);
      } else {
        (sanitized as any)[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Determine risk level based on event type
   */
  static determineRiskLevel(eventType: AuditEventType): AuditRiskLevel {
    const criticalEvents = [
      AuditEventType.SECURITY_BREACH_ATTEMPT,
      AuditEventType.SECURITY_UNAUTHORIZED_ACCESS,
      AuditEventType.ADMIN_SYSTEM_ACTION,
      AuditEventType.FINANCIAL_WITHDRAWAL,
      AuditEventType.ASSET_TRANSFER
    ];

    const highEvents = [
      AuditEventType.AUTH_LOGIN_FAILURE,
      AuditEventType.SECURITY_CSRF_VIOLATION,
      AuditEventType.SECURITY_RATE_LIMIT_HIT,
      AuditEventType.PROPOSAL_APPROVE,
      AuditEventType.PROPOSAL_REJECT,
      AuditEventType.ADMIN_CONFIG_CHANGE
    ];

    const mediumEvents = [
      AuditEventType.AUTH_LOGIN_SUCCESS,
      AuditEventType.PROPOSAL_CREATE,
      AuditEventType.PROPOSAL_UPDATE,
      AuditEventType.GOVERNANCE_VOTE_CAST,
      AuditEventType.FINANCIAL_DEPOSIT
    ];

    if (criticalEvents.includes(eventType)) {
      return AuditRiskLevel.CRITICAL;
    } else if (highEvents.includes(eventType)) {
      return AuditRiskLevel.HIGH;
    } else if (mediumEvents.includes(eventType)) {
      return AuditRiskLevel.MEDIUM;
    } else {
      return AuditRiskLevel.LOW;
    }
  }

  /**
   * Calculate retention period based on event type and regulations
   */
  static calculateRetentionPeriod(eventType: AuditEventType, riskLevel: AuditRiskLevel): number {
    const baseRetention = AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000; // Convert to milliseconds
    const now = Date.now();

    // Financial and compliance events require longer retention
    if (eventType.startsWith('financial.') || eventType.startsWith('compliance.')) {
      return now + (baseRetention * 2); // Double retention for financial/compliance
    }

    // Critical events require extended retention
    if (riskLevel === AuditRiskLevel.CRITICAL) {
      return now + (baseRetention * 1.5); // 1.5x retention for critical events
    }

    // Standard retention
    return now + baseRetention;
  }

  /**
   * Log an audit event
   */
  static logEvent(
    eventType: AuditEventType,
    action: string,
    req?: Request,
    details: Record<string, any> = {},
    resourceInfo?: { resource?: string; resourceId?: string }
  ): AuditEvent {
    const riskLevel = this.determineRiskLevel(eventType);
    const eventId = this.generateEventId();
    const timestamp = Date.now();
    const retentionPeriod = this.calculateRetentionPeriod(eventType, riskLevel);

    // Extract user and session info from request
    const userId = req ? (req as any).user?.id || (req as any).userId : undefined;
    const userRole = req ? (req as any).user?.role || (req as any).userRole : undefined;
    const sessionId = req ? (req as any).sessionId : undefined;
    const requestId = req ? req.headers['x-request-id'] as string : undefined;

    const auditEvent: AuditEvent = {
      id: eventId,
      timestamp,
      eventType,
      riskLevel,
      userId,
      userRole,
      sessionId,
      requestId,
      ipAddress: req ? req.ip || req.connection.remoteAddress : undefined,
      userAgent: req ? req.get('user-agent') : undefined,
      action,
      resource: resourceInfo?.resource,
      resourceId: resourceInfo?.resourceId,
      details: this.sanitizeAuditData(details),
      metadata: {
        path: req ? req.path : '',
        method: req ? req.method : '',
        statusCode: undefined, // Will be set by response middleware
        duration: undefined, // Will be calculated by response middleware
        size: undefined // Will be set by response middleware
      },
      compliance: {
        retention: retentionPeriod,
        classification: this.classifyEvent(eventType, riskLevel),
        requiresReview: riskLevel === AuditRiskLevel.CRITICAL || riskLevel === AuditRiskLevel.HIGH
      }
    };

    // Store in memory log
    this.auditLog.push(auditEvent);

    // Keep memory log size manageable
    if (this.auditLog.length > this.MAX_MEMORY_LOG_SIZE) {
      this.auditLog.shift();
    }

    // Console logging for development
    if (!IS_PRODUCTION) {
      console.log(`📝 Audit Event [${eventType}]`, {
        id: eventId,
        action,
        riskLevel,
        userId,
        resource: resourceInfo?.resource,
        timestamp: new Date(timestamp).toISOString()
      });
    }

    // In production, this would write to persistent storage
    if (AUDIT_STORAGE_ENABLED && IS_PRODUCTION) {
      this.persistAuditEvent(auditEvent);
    }

    return auditEvent;
  }

  /**
   * Classify event for compliance purposes
   */
  private static classifyEvent(eventType: AuditEventType, riskLevel: AuditRiskLevel): 'public' | 'internal' | 'confidential' | 'restricted' {
    if (riskLevel === AuditRiskLevel.CRITICAL) {
      return 'restricted';
    } else if (riskLevel === AuditRiskLevel.HIGH) {
      return 'confidential';
    } else if (eventType.startsWith('financial.') || eventType.startsWith('compliance.')) {
      return 'confidential';
    } else if (eventType.startsWith('admin.') || eventType.startsWith('security.')) {
      return 'internal';
    } else {
      return 'internal';
    }
  }

  /**
   * Persist audit event to storage (placeholder for production implementation)
   */
  private static async persistAuditEvent(auditEvent: AuditEvent): Promise<void> {
    try {
      // In production, this would write to:
      // - Database (PostgreSQL, MongoDB)
      // - Log files (structured JSON)
      // - External audit service (Splunk, ELK Stack)
      // - Cloud storage (S3, Azure Blob)
      
      console.log('Persisting audit event:', auditEvent.id);
    } catch (error) {
      console.error('Failed to persist audit event:', error);
    }
  }

  /**
   * Get audit events by criteria
   */
  static getAuditEvents(criteria: {
    userId?: string;
    eventType?: AuditEventType;
    riskLevel?: AuditRiskLevel;
    startTime?: number;
    endTime?: number;
    limit?: number;
  }): AuditEvent[] {
    let events = this.auditLog;

    // Apply filters
    if (criteria.userId) {
      events = events.filter(event => event.userId === criteria.userId);
    }

    if (criteria.eventType) {
      events = events.filter(event => event.eventType === criteria.eventType);
    }

    if (criteria.riskLevel) {
      events = events.filter(event => event.riskLevel === criteria.riskLevel);
    }

    if (criteria.startTime) {
      events = events.filter(event => event.timestamp >= criteria.startTime!);
    }

    if (criteria.endTime) {
      events = events.filter(event => event.timestamp <= criteria.endTime!);
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (criteria.limit) {
      events = events.slice(0, criteria.limit);
    }

    return events;
  }

  /**
   * Get audit statistics
   */
  static getAuditStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByRiskLevel: Record<AuditRiskLevel, number>;
    eventsRequiringReview: number;
  } {
    const stats = {
      totalEvents: this.auditLog.length,
      eventsByType: {} as Record<string, number>,
      eventsByRiskLevel: {
        [AuditRiskLevel.LOW]: 0,
        [AuditRiskLevel.MEDIUM]: 0,
        [AuditRiskLevel.HIGH]: 0,
        [AuditRiskLevel.CRITICAL]: 0
      },
      eventsRequiringReview: 0
    };

    this.auditLog.forEach(event => {
      // Count by event type
      stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1;

      // Count by risk level
      stats.eventsByRiskLevel[event.riskLevel]++;

      // Count events requiring review
      if (event.compliance.requiresReview) {
        stats.eventsRequiringReview++;
      }
    });

    return stats;
  }

  /**
   * Clear expired audit events
   */
  static clearExpiredEvents(): void {
    const now = Date.now();
    this.auditLog = this.auditLog.filter(event => event.compliance.retention > now);
  }

  /**
   * Export audit events for compliance reporting
   */
  static exportAuditData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.auditLog, null, 2);
    } else if (format === 'csv') {
      // Simple CSV export for compliance
      const headers = ['timestamp', 'eventType', 'riskLevel', 'userId', 'action', 'resource'];
      const rows = this.auditLog.map(event => [
        new Date(event.timestamp).toISOString(),
        event.eventType,
        event.riskLevel,
        event.userId || '',
        event.action,
        event.resource || ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return '';
  }
}

/**
 * Express middleware for automatic audit logging
 */
export const auditMiddleware = (eventType: AuditEventType, action?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalSend = res.send;
    
    // Override res.send to capture response details
    res.send = function(body: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log the audit event
      const auditEvent = AuditLogger.logEvent(
        eventType,
        action || `${req.method} ${req.path}`,
        req,
        {
          requestBody: req.body,
          requestQuery: req.query,
          requestParams: req.params,
          responseBody: IS_PRODUCTION ? '[REDACTED]' : body
        }
      );

      // Update metadata
      auditEvent.metadata.statusCode = res.statusCode;
      auditEvent.metadata.duration = duration;
      auditEvent.metadata.size = typeof body === 'string' ? body.length : JSON.stringify(body).length;

      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Convenience functions for common audit events
 */
export const auditAuth = {
  loginSuccess: (req: Request, userId: string) => 
    AuditLogger.logEvent(AuditEventType.AUTH_LOGIN_SUCCESS, 'User login successful', req, { userId }),
    
  loginFailure: (req: Request, attemptedUsername: string, reason: string) => 
    AuditLogger.logEvent(AuditEventType.AUTH_LOGIN_FAILURE, 'User login failed', req, { attemptedUsername, reason }),
    
  logout: (req: Request, userId: string) => 
    AuditLogger.logEvent(AuditEventType.AUTH_LOGOUT, 'User logout', req, { userId })
};

export const auditSecurity = {
  breachAttempt: (req: Request, details: Record<string, any>) => 
    AuditLogger.logEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, 'Security breach attempt detected', req, details),
    
  rateLimitHit: (req: Request, endpoint: string, limit: number) => 
    AuditLogger.logEvent(AuditEventType.SECURITY_RATE_LIMIT_HIT, 'Rate limit exceeded', req, { endpoint, limit }),
    
  csrfViolation: (req: Request, details: Record<string, any>) => 
    AuditLogger.logEvent(AuditEventType.SECURITY_CSRF_VIOLATION, 'CSRF violation detected', req, details)
};

export const auditFinancial = {
  deposit: (req: Request, amount: number, asset: string, userId: string) => 
    AuditLogger.logEvent(AuditEventType.FINANCIAL_DEPOSIT, 'Financial deposit', req, { amount, asset, userId }),
    
  withdrawal: (req: Request, amount: number, asset: string, userId: string) => 
    AuditLogger.logEvent(AuditEventType.FINANCIAL_WITHDRAWAL, 'Financial withdrawal', req, { amount, asset, userId }),
    
  transfer: (req: Request, amount: number, asset: string, fromUserId: string, toUserId: string) => 
    AuditLogger.logEvent(AuditEventType.FINANCIAL_TRANSFER, 'Financial transfer', req, { amount, asset, fromUserId, toUserId })
};

export default {
  AuditLogger,
  auditMiddleware,
  auditAuth,
  auditSecurity,
  auditFinancial,
  AuditEventType,
  AuditRiskLevel
};