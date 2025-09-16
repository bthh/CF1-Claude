/**
 * CF1 Backend - Admin Routes  
 * Real data APIs for Platform Admin functionality
 */

import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { authenticate } from '../middleware/unifiedAuth';
import { requireAdminJWT } from '../middleware/adminAuth';
import { body, query, validationResult } from 'express-validator';
import { AuditLogger, AuditEventType } from '../middleware/auditLogger';

const router = express.Router();

// Middleware for admin access (both systems)
const requireAnyAdminAccess = (req: any, res: Response, next: any) => {
  // Check unified auth
  if (req.user && ['platform_admin', 'super_admin', 'owner'].includes(req.user.role)) {
    return next();
  }
  
  // Check old admin system
  if (req.adminUser && req.adminUser.permissions) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Admin access required',
    code: 'INSUFFICIENT_PERMISSIONS'
  });
};

// Apply both auth middlewares
router.use(authenticate);
router.use(requireAdminJWT);
router.use(requireAnyAdminAccess);

/**
 * GET /api/admin/users
 * Get all users with search and pagination
 */
router.get('/users', 
  [
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('role').optional().isIn(['investor', 'creator', 'platform_admin', 'super_admin', 'owner']),
    query('status').optional().isIn(['active', 'suspended', 'pending_verification', 'locked']),
    query('kycStatus').optional().isIn(['pending', 'verified', 'rejected', 'not_started'])
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userRepo = AppDataSource.getRepository(User);
      const { search, page = 1, limit = 20, role, status, kycStatus } = req.query;
      
      const queryBuilder = userRepo.createQueryBuilder('user');

      // Search by name or email
      if (search) {
        queryBuilder.andWhere(
          '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR user.displayName LIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Filter by role
      if (role) {
        queryBuilder.andWhere('user.role = :role', { role });
      }

      // Filter by account status
      if (status) {
        queryBuilder.andWhere('user.accountStatus = :status', { status });
      }

      // Filter by KYC status
      if (kycStatus) {
        queryBuilder.andWhere('user.kycStatus = :kycStatus', { kycStatus });
      }

      // Pagination
      const offset = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(offset).take(Number(limit));

      // Order by creation date
      queryBuilder.orderBy('user.createdAt', 'DESC');

      const [users, total] = await queryBuilder.getManyAndCount();

      // Log admin action
      AuditLogger.logEvent(
        AuditEventType.ADMIN_ACTION,
        'Admin viewed users list',
        req,
        { 
          adminUser: (req as any).user?.id || (req as any).adminUser?.username,
          search, page, limit, role, status, kycStatus, total 
        }
      );

      res.json({
        success: true,
        data: {
          users: users.map(user => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            fullName: user.fullName,
            role: user.role,
            accountStatus: user.accountStatus,
            kycStatus: user.kycStatus,
            emailVerified: user.emailVerified,
            walletAddress: user.walletAddress,
            primaryAuthMethod: user.primaryAuthMethod,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Admin get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      });
    }
  }
);

/**
 * PUT /api/admin/users/:id
 * Update user details (admin only)
 */
router.put('/users/:id',
  [
    body('role').optional().isIn(['investor', 'creator', 'platform_admin']), // Exclude super_admin and owner
    body('accountStatus').optional().isIn(['active', 'suspended', 'pending_verification', 'locked']),
    body('kycStatus').optional().isIn(['pending', 'verified', 'rejected', 'not_started']),
    body('firstName').optional().trim().isLength({ max: 50 }),
    body('lastName').optional().trim().isLength({ max: 50 }),
    body('displayName').optional().trim().isLength({ max: 100 })
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const userRepo = AppDataSource.getRepository(User);
      
      const user = await userRepo.findOne({ where: { id } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent platform admins from editing super_admin or owner roles
      // const _adminUser = (req as any).user || (req as any).adminUser;
      const isUnifiedAdmin = (req as any).user?.role;
      
      if (user.role === 'super_admin' || user.role === 'owner') {
        if (!isUnifiedAdmin || !['super_admin', 'owner'].includes((req as any).user?.role)) {
          return res.status(403).json({
            success: false,
            message: 'Cannot edit higher-level admin accounts'
          });
        }
      }

      // Update allowed fields
      const allowedUpdates = ['role', 'accountStatus', 'kycStatus', 'firstName', 'lastName', 'displayName'];
      const updates: any = {};
      
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid updates provided'
        });
      }

      await userRepo.update(id, updates);
      
      const updatedUser = await userRepo.findOne({ where: { id } });

      // Log admin action
      AuditLogger.logEvent(
        AuditEventType.ADMIN_ACTION,
        'Admin updated user',
        req,
        { 
          targetUserId: id, 
          updates,
          targetUserEmail: user.email
        }
      );

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            id: updatedUser!.id,
            email: updatedUser!.email,
            firstName: updatedUser!.firstName,
            lastName: updatedUser!.lastName,
            displayName: updatedUser!.displayName,
            role: updatedUser!.role,
            accountStatus: updatedUser!.accountStatus,
            kycStatus: updatedUser!.kycStatus
          }
        }
      });

    } catch (error) {
      console.error('Admin update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }
);

/**
 * GET /api/admin/kyc-submissions
 * Get KYC submissions for compliance review
 */
router.get('/kyc-submissions',
  [
    query('status').optional().isIn(['pending', 'verified', 'rejected']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userRepo = AppDataSource.getRepository(User);
      const { status, page = 1, limit = 20 } = req.query;
      
      const queryBuilder = userRepo.createQueryBuilder('user')
        .where('user.kycStatus != :notStarted', { notStarted: 'not_started' });

      // Filter by KYC status
      if (status) {
        queryBuilder.andWhere('user.kycStatus = :status', { status });
      }

      // Pagination
      const offset = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(offset).take(Number(limit));

      // Order by creation date (pending first, then by date)
      queryBuilder.orderBy('user.kycStatus', 'ASC')
                  .addOrderBy('user.createdAt', 'DESC');

      const [submissions, total] = await queryBuilder.getManyAndCount();

      // Log admin action
      AuditLogger.logEvent(
        AuditEventType.ADMIN_ACTION,
        'Admin viewed KYC submissions',
        (req as any).user?.id || (req as any).adminUser?.username,
        { status, page, limit, total }
      );

      res.json({
        success: true,
        data: {
          submissions: submissions.map(user => ({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            kycStatus: user.kycStatus,
            submittedAt: user.createdAt, // Using creation date as submission date
            lastUpdated: user.updatedAt,
            documents: [], // TODO: Add document references when KYC document system is implemented
            notes: null // TODO: Add admin notes when implemented
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Admin get KYC submissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get KYC submissions'
      });
    }
  }
);

/**
 * PUT /api/admin/kyc-submissions/:id
 * Update KYC status
 */
router.put('/kyc-submissions/:id',
  [
    body('status').isIn(['pending', 'verified', 'rejected']),
    body('notes').optional().isString().trim()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { status, notes } = req.body;
      const userRepo = AppDataSource.getRepository(User);
      
      const user = await userRepo.findOne({ where: { id } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.kycStatus === 'not_started') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update KYC status - user has not started KYC process'
        });
      }

      await userRepo.update(id, { kycStatus: status });
      
      const updatedUser = await userRepo.findOne({ where: { id } });

      // Log admin action
      AuditLogger.logEvent(
        AuditEventType.ADMIN_ACTION,
        'Admin updated KYC status',
        (req as any).user?.id || (req as any).adminUser?.username,
        { 
          targetUserId: id,
          targetUserEmail: user.email,
          oldStatus: user.kycStatus,
          newStatus: status,
          notes
        }
      );

      res.json({
        success: true,
        message: 'KYC status updated successfully',
        data: {
          submission: {
            id: updatedUser!.id,
            email: updatedUser!.email,
            fullName: updatedUser!.fullName,
            kycStatus: updatedUser!.kycStatus,
            lastUpdated: updatedUser!.updatedAt
          }
        }
      });

    } catch (error) {
      console.error('Admin update KYC status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update KYC status'
      });
    }
  }
);

/**
 * GET /api/admin/support-tickets
 * Get support tickets (placeholder for now)
 */
router.get('/support-tickets',
  [
    query('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  async (req: Request, res: Response) => {
    try {
      // For now, return empty array - will implement full support ticket system
      const { page = 1, limit = 20 } = req.query;

      // Log admin action
      AuditLogger.logEvent(
        AuditEventType.ADMIN_ACTION,
        'Admin viewed support tickets',
        (req as any).user?.id || (req as any).adminUser?.username,
        { page, limit }
      );

      res.json({
        success: true,
        data: {
          tickets: [], // Empty for now
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0
          }
        }
      });

    } catch (error) {
      console.error('Admin get support tickets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get support tickets'
      });
    }
  }
);

/**
 * POST /api/admin/support-tickets
 * Create a support ticket (for frontend submission)
 */
router.post('/support-tickets',
  [
    body('subject').isString().trim().isLength({ min: 1, max: 200 }),
    body('description').isString().trim().isLength({ min: 1, max: 2000 }),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('category').optional().isIn(['technical', 'account', 'kyc', 'investment', 'general'])
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { subject, description, priority = 'medium', category = 'general' } = req.body;
      const user = (req as any).user;
      
      // For now, just log the ticket creation - will implement database storage later
      const ticketData = {
        id: `ticket_${Date.now()}`,
        subject,
        description,
        priority,
        category,
        status: 'open',
        createdBy: user?.id || 'admin',
        createdByEmail: user?.email || 'admin@cf1.com',
        createdAt: new Date().toISOString()
      };

      // Log ticket creation
      AuditLogger.logEvent(
        AuditEventType.USER_ACTION,
        'Support ticket created',
        user?.id || 'admin',
        ticketData
      );

      console.log('[SUPPORT_TICKET_CREATED]', JSON.stringify(ticketData, null, 2));

      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        data: {
          ticket: ticketData
        }
      });

    } catch (error) {
      console.error('Create support ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create support ticket'
      });
    }
  }
);

export default router;