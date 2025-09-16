/**
 * CF1 Backend - Admin Financial Security Middleware
 * Advanced security controls for admin financial operations
 */

import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AdminAuthenticatedRequest } from './adminAuth';
import { AuditLogger, auditFinancial, AuditEventType } from './auditLogger';

// Configuration from environment
const MAX_TRANSACTION_AMOUNT = parseFloat(process.env.MAX_ADMIN_TRANSACTION_AMOUNT || '1000000'); // $1M default
const DAILY_TRANSACTION_LIMIT = parseFloat(process.env.DAILY_ADMIN_TRANSACTION_LIMIT || '5000000'); // $5M daily
const MULTI_SIG_THRESHOLD = parseFloat(process.env.MULTI_SIG_THRESHOLD || '100000'); // $100k threshold
const FRAUD_DETECTION_ENABLED = process.env.FRAUD_DETECTION_ENABLED !== 'false';
const REQUIRE_REGULATORY_COMPLIANCE = process.env.REQUIRE_REGULATORY_COMPLIANCE !== 'false';

// Transaction tracking for rate limiting and fraud detection
interface TransactionRecord {
  id: string;
  adminUser: string;
  amount: number;
  timestamp: number;
  proposalId?: string;
  riskScore: number;
  approved: boolean;
  multiSigRequired: boolean;
  signatures: string[];
}

class AdminFinancialSecurityManager {
  private static transactions: Map<string, TransactionRecord> = new Map();
  private static dailyTotals: Map<string, { amount: number; date: string }> = new Map();
  private static suspiciousActivityFlags: Map<string, number> = new Map();

  /**
   * Generate secure transaction ID
   */
  static generateTransactionId(): string {
    return `txn_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Calculate risk score for transaction
   */
  static calculateRiskScore(
    amount: number,
    adminUser: string,
    proposalId?: string,
    timeOfDay?: number
  ): number {
    let riskScore = 0;

    // Amount-based risk
    if (amount > 500000) riskScore += 40;
    else if (amount > 100000) riskScore += 20;
    else if (amount > 50000) riskScore += 10;

    // Time-based risk (transactions outside business hours)
    const hour = timeOfDay || new Date().getHours();
    if (hour < 6 || hour > 20) riskScore += 15;

    // Frequency-based risk
    const recentTransactions = this.getRecentTransactions(adminUser, 24 * 60 * 60 * 1000); // 24 hours
    if (recentTransactions.length > 10) riskScore += 25;
    if (recentTransactions.length > 5) riskScore += 15;

    // Suspicious activity history
    const suspiciousFlags = this.suspiciousActivityFlags.get(adminUser) || 0;
    riskScore += suspiciousFlags * 10;

    // Unknown proposal risk
    if (proposalId && !this.isKnownProposal(proposalId)) {
      riskScore += 20;
    }

    return Math.min(100, riskScore);
  }

  /**
   * Check if proposal is known/validated
   */
  static isKnownProposal(proposalId: string): boolean {
    // This would integrate with your proposal validation system
    // For now, basic validation
    return proposalId.startsWith('prop_') || proposalId.length > 10;
  }

  /**
   * Get recent transactions for an admin user
   */
  static getRecentTransactions(adminUser: string, timeWindowMs: number): TransactionRecord[] {
    const cutoff = Date.now() - timeWindowMs;
    return Array.from(this.transactions.values()).filter(
      tx => tx.adminUser === adminUser && tx.timestamp > cutoff
    );
  }

  /**
   * Check daily transaction limits
   */
  static checkDailyLimits(adminUser: string, amount: number): { allowed: boolean; reason?: string } {
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `${adminUser}:${today}`;
    const dailyTotal = this.dailyTotals.get(dailyKey) || { amount: 0, date: today };

    if (dailyTotal.amount + amount > DAILY_TRANSACTION_LIMIT) {
      return {
        allowed: false,
        reason: `Daily transaction limit exceeded. Current: $${dailyTotal.amount.toLocaleString()}, Limit: $${DAILY_TRANSACTION_LIMIT.toLocaleString()}`
      };
    }

    return { allowed: true };
  }

  /**
   * Update daily transaction totals
   */
  static updateDailyTotals(adminUser: string, amount: number): void {
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `${adminUser}:${today}`;
    const dailyTotal = this.dailyTotals.get(dailyKey) || { amount: 0, date: today };
    
    dailyTotal.amount += amount;
    this.dailyTotals.set(dailyKey, dailyTotal);
  }

  /**
   * Record transaction for audit and monitoring
   */
  static recordTransaction(transaction: TransactionRecord): void {
    this.transactions.set(transaction.id, transaction);
    
    // Update daily totals
    this.updateDailyTotals(transaction.adminUser, transaction.amount);

    // Clean up old transactions (keep 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    for (const [id, tx] of this.transactions.entries()) {
      if (tx.timestamp < thirtyDaysAgo) {
        this.transactions.delete(id);
      }
    }
  }

  /**
   * Fraud detection algorithms
   */
  static detectFraud(
    amount: number,
    adminUser: string,
    proposalId?: string
  ): { suspicious: boolean; reasons: string[]; riskScore: number } {
    const reasons: string[] = [];
    let suspicious = false;

    const riskScore = this.calculateRiskScore(amount, adminUser, proposalId);
    
    if (riskScore > 70) {
      suspicious = true;
      reasons.push('High risk score detected');
    }

    // Pattern detection
    const recentTransactions = this.getRecentTransactions(adminUser, 60 * 60 * 1000); // 1 hour
    if (recentTransactions.length > 3) {
      suspicious = true;
      reasons.push('Unusual transaction frequency');
    }

    // Amount pattern detection
    const recentAmounts = recentTransactions.map(tx => tx.amount);
    if (recentAmounts.length > 2 && recentAmounts.every(amt => Math.abs(amt - amount) < amount * 0.1)) {
      suspicious = true;
      reasons.push('Suspicious amount pattern detected');
    }

    // Time-based anomaly
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      suspicious = true;
      reasons.push('Transaction outside normal business hours');
    }

    return { suspicious, reasons, riskScore };
  }

  /**
   * Check regulatory compliance requirements
   */
  static checkRegulatoryCompliance(
    amount: number,
    _proposalId?: string
  ): { compliant: boolean; requirements: string[] } {
    const requirements: string[] = [];
    let compliant = true;

    // Large transaction reporting requirements
    if (amount > 10000) {
      requirements.push('Large transaction reporting required');
      // In production, this would trigger CTR (Currency Transaction Report) filing
    }

    // AML checks for large amounts
    if (amount > 50000) {
      requirements.push('Enhanced AML verification required');
      compliant = false; // Require manual approval for large amounts
    }

    // KYC requirements
    if (amount > 25000) {
      requirements.push('Enhanced KYC documentation required');
    }

    return { compliant, requirements };
  }
}

/**
 * Financial transaction validation middleware
 */
export const validateFinancialTransaction = (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, proposalId } = req.body;
    const adminUser = req.adminUser?.username || 'unknown';

    // Basic validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction amount',
        code: 'INVALID_AMOUNT'
      });
    }

    // Maximum transaction limit
    if (amount > MAX_TRANSACTION_AMOUNT) {
      auditFinancial.withdrawal(req, amount, 'USD', adminUser);
      return res.status(400).json({
        success: false,
        error: `Transaction amount exceeds maximum limit of $${MAX_TRANSACTION_AMOUNT.toLocaleString()}`,
        code: 'EXCEEDS_MAX_AMOUNT'
      });
    }

    // Daily limit check
    const dailyLimitCheck = AdminFinancialSecurityManager.checkDailyLimits(adminUser, amount);
    if (!dailyLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: dailyLimitCheck.reason,
        code: 'DAILY_LIMIT_EXCEEDED'
      });
    }

    // Fraud detection
    if (FRAUD_DETECTION_ENABLED) {
      const fraudCheck = AdminFinancialSecurityManager.detectFraud(amount, adminUser, proposalId);
      
      if (fraudCheck.suspicious) {
        // Log suspicious activity
        AuditLogger.logEvent(
          AuditEventType.SECURITY_SUSPICIOUS_ACTIVITY,
          'Suspicious financial transaction detected',
          req,
          {
            amount,
            proposalId,
            riskScore: fraudCheck.riskScore,
            reasons: fraudCheck.reasons,
            adminUser
          }
        );

        return res.status(403).json({
          success: false,
          error: 'Transaction flagged for suspicious activity',
          code: 'SUSPICIOUS_ACTIVITY',
          details: {
            riskScore: fraudCheck.riskScore,
            reasons: fraudCheck.reasons
          }
        });
      }
    }

    // Regulatory compliance check
    if (REQUIRE_REGULATORY_COMPLIANCE) {
      const complianceCheck = AdminFinancialSecurityManager.checkRegulatoryCompliance(amount, proposalId);
      
      if (!complianceCheck.compliant) {
        return res.status(422).json({
          success: false,
          error: 'Transaction requires additional regulatory compliance',
          code: 'COMPLIANCE_REQUIRED',
          details: {
            requirements: complianceCheck.requirements
          }
        });
      }

      // Add compliance requirements to request for processing
      req.complianceRequirements = complianceCheck.requirements;
    }

    // Generate transaction ID and store details
    const transactionId = AdminFinancialSecurityManager.generateTransactionId();
    const riskScore = AdminFinancialSecurityManager.calculateRiskScore(amount, adminUser, proposalId);
    const multiSigRequired = amount >= MULTI_SIG_THRESHOLD;

    const transaction: TransactionRecord = {
      id: transactionId,
      adminUser,
      amount,
      timestamp: Date.now(),
      proposalId,
      riskScore,
      approved: !multiSigRequired, // Auto-approve if multi-sig not required
      multiSigRequired,
      signatures: multiSigRequired ? [] : [adminUser]
    };

    AdminFinancialSecurityManager.recordTransaction(transaction);

    // Add transaction details to request
    req.transactionId = transactionId;
    req.riskScore = riskScore;
    req.multiSigRequired = multiSigRequired;

    // Log financial transaction audit
    auditFinancial.transfer(req, amount, 'USD', 'system', proposalId || 'instant_fund');

    next();

  } catch (error) {
    console.error('Error in financial transaction validation:', error);
    res.status(500).json({
      success: false,
      error: 'Financial validation error',
      code: 'VALIDATION_ERROR'
    });
  }
};

/**
 * Multi-signature requirement middleware
 */
export const requireMultiSignature = (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.multiSigRequired) {
    return next();
  }

  // In production, this would integrate with a proper multi-signature system
  // For now, we'll simulate the requirement
  const { multiSigApproval } = req.body;

  if (!multiSigApproval || !multiSigApproval.signatures || multiSigApproval.signatures.length < 2) {
    return res.status(403).json({
      success: false,
      error: 'Multi-signature approval required for this transaction amount',
      code: 'MULTI_SIG_REQUIRED',
      details: {
        threshold: MULTI_SIG_THRESHOLD,
        requiredSignatures: 2,
        providedSignatures: multiSigApproval?.signatures?.length || 0
      }
    });
  }

  // Validate signatures (in production, this would use cryptographic verification)
  const validSignatures = multiSigApproval.signatures.filter((sig: any) => 
    sig.signer && sig.signature && sig.timestamp
  );

  if (validSignatures.length < 2) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient valid signatures',
      code: 'INSUFFICIENT_SIGNATURES'
    });
  }

  // Log multi-signature approval
  AuditLogger.logEvent(
    AuditEventType.ADMIN_SYSTEM_ACTION,
    'Multi-signature transaction approved',
    req,
    {
      transactionId: req.transactionId,
      signatures: validSignatures.map((sig: any) => ({
        signer: sig.signer,
        timestamp: sig.timestamp
      }))
    }
  );

  next();
};

/**
 * Transaction audit trail middleware
 */
export const createAuditTrail = (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function(body: any) {
    // Log the complete transaction
    AuditLogger.logEvent(
      AuditEventType.FINANCIAL_TRANSFER,
      'Admin financial transaction completed',
      req,
      {
        transactionId: req.transactionId,
        amount: req.body.amount,
        proposalId: req.body.proposalId,
        riskScore: req.riskScore,
        multiSigRequired: req.multiSigRequired,
        complianceRequirements: req.complianceRequirements,
        responseStatus: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 300
      }
    );

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Real-time fraud monitoring
 */
export const realTimeFraudMonitoring = (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!FRAUD_DETECTION_ENABLED) {
    return next();
  }

  const { amount } = req.body;
  const adminUser = req.adminUser?.username || 'unknown';

  // Check for rapid successive transactions (velocity check)
  const recentTransactions = AdminFinancialSecurityManager.getRecentTransactions(adminUser, 5 * 60 * 1000); // 5 minutes
  if (recentTransactions.length >= 3) {
    AuditLogger.logEvent(
      AuditEventType.SECURITY_SUSPICIOUS_ACTIVITY,
      'High velocity transaction pattern detected',
      req,
      {
        recentTransactionCount: recentTransactions.length,
        timeWindow: '5 minutes',
        adminUser
      }
    );

    return res.status(429).json({
      success: false,
      error: 'Transaction velocity limit exceeded. Please wait before making another transaction.',
      code: 'VELOCITY_LIMIT_EXCEEDED'
    });
  }

  // Check for unusual patterns
  if (recentTransactions.length > 0) {
    const lastTransaction = recentTransactions[0];
    const timeDiff = Date.now() - lastTransaction.timestamp;
    
    // Flag if transactions are too close together
    if (timeDiff < 30000) { // 30 seconds
      AuditLogger.logEvent(
        AuditEventType.SECURITY_SUSPICIOUS_ACTIVITY,
        'Rapid sequential transactions detected',
        req,
        {
          timeBetweenTransactions: timeDiff,
          lastTransactionAmount: lastTransaction.amount,
          currentAmount: amount
        }
      );
    }
  }

  next();
};

// Extended AdminAuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      transactionId?: string;
      riskScore?: number;
      multiSigRequired?: boolean;
      complianceRequirements?: string[];
    }
  }
}

export default {
  validateFinancialTransaction,
  requireMultiSignature,
  createAuditTrail,
  realTimeFraudMonitoring,
  AdminFinancialSecurityManager
};