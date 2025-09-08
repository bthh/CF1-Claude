/**
 * CF1 Backend - Admin User Management Routes
 * CRUD operations for admin user management
 */

import express from 'express';
import { requireAdminJWT, AdminAuthenticatedRequest } from '../middleware/adminAuth';
import { AdminUserService } from '../services/AdminUserService';
import { AuditLogger, AuditEventType } from '../middleware/auditLogger';

const router = express.Router();

// All routes require admin JWT authentication
router.use(requireAdminJWT);

// Permission check middleware - only super_admin and owner can manage admin users
const requireSuperAdminOrOwner = (req: AdminAuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  if (!req.adminUser) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    });
  }

  const hasPermission = req.adminUser.permissions.includes('manage_admin_users') ||
                       req.adminUser.permissions.includes('all') ||
                       req.adminUser.permissions.includes('super_admin');

  if (!hasPermission) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to manage admin users',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }

  next();
};

/**
 * GET /api/admin/users - List all admin users
 */
router.get('/', requireSuperAdminOrOwner, async (req: AdminAuthenticatedRequest, res) => {
  try {
    const adminUserService = new AdminUserService();
    const adminUsers = await adminUserService.getAllAdminUsers();
    
    // Return safe user objects (no password hashes)
    const safeUsers = adminUsers.map(user => user.toSafeObject());
    
    AuditLogger.logEvent(AuditEventType.DATA_ACCESS, 'Admin users list accessed', req, {
      action: 'list_admin_users',
      count: safeUsers.length,
      adminUser: req.adminUser?.username
    });
    
    res.json({
      success: true,
      users: safeUsers
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin users',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * POST /api/admin/users - Create new admin user
 */
router.post('/', requireSuperAdminOrOwner, async (req: AdminAuthenticatedRequest, res) => {
  try {
    const { email, username, password, name, role, permissions, walletAddress, phoneNumber, notes } = req.body;
    
    // Validate required fields
    if (!email || !username || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, username, password, name, role',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Validate role
    const validRoles = ['super_admin', 'creator_admin', 'platform_admin', 'owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: ' + validRoles.join(', '),
        code: 'INVALID_ROLE'
      });
    }
    
    const adminUserService = new AdminUserService();
    const newUser = await adminUserService.createAdminUser({
      email,
      username,
      password,
      name,
      role,
      permissions: permissions || ['admin'],
      walletAddress,
      phoneNumber,
      notes
    });
    
    AuditLogger.logEvent(AuditEventType.USER_CREATED, 'New admin user created', req, {
      action: 'create_admin_user',
      adminUser: req.adminUser?.username,
      createdUserId: newUser.id,
      createdUserEmail: newUser.email,
      createdUserRole: newUser.role
    });
    
    res.status(201).json({
      success: true,
      user: newUser.toSafeObject()
    });
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
        code: 'USER_EXISTS'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create admin user',
      code: 'CREATE_ERROR'
    });
  }
});

/**
 * PUT /api/admin/users/:id - Update admin user
 */
router.put('/:id', requireSuperAdminOrOwner, async (req: AdminAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updates.id;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    // If password is being updated, handle it specially
    if (updates.password) {
      updates.passwordHash = updates.password;
      delete updates.password;
    }
    
    const adminUserService = new AdminUserService();
    const updatedUser = await adminUserService.updateAdminUser(id, updates);
    
    AuditLogger.logEvent(AuditEventType.USER_UPDATED, 'Admin user updated', req, {
      adminUser: req.adminUser?.username,
      action: 'update_admin_user',
      updatedUserId: id,
      updatedUserEmail: updatedUser.email,
      updatedFields: Object.keys(updates)
    });
    
    res.json({
      success: true,
      user: updatedUser.toSafeObject()
    });
  } catch (error: any) {
    console.error('Error updating admin user:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update admin user',
      code: 'UPDATE_ERROR'
    });
  }
});

/**
 * DELETE /api/admin/users/:id - Delete admin user
 */
router.delete('/:id', requireSuperAdminOrOwner, async (req: AdminAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion
    const adminUserService = new AdminUserService();
    const userToDelete = await adminUserService.findByEmailOrUsername(req.adminUser?.username || '');
    
    if (userToDelete && userToDelete.id === id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own admin account',
        code: 'CANNOT_DELETE_SELF'
      });
    }
    
    await adminUserService.deleteAdminUser(id);
    
    AuditLogger.logEvent(AuditEventType.USER_DELETED, 'Admin user deleted', req, {
      adminUser: req.adminUser?.username,
      action: 'delete_admin_user',
      deletedUserId: id
    });
    
    res.json({
      success: true,
      message: 'Admin user deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete admin user',
      code: 'DELETE_ERROR'
    });
  }
});

/**
 * POST /api/admin/users/initialize - Initialize default admin users
 */
router.post('/initialize', requireSuperAdminOrOwner, async (req: AdminAuthenticatedRequest, res) => {
  try {
    const adminUserService = new AdminUserService();
    await adminUserService.initializeDefaultAdmins();
    
    AuditLogger.logEvent(AuditEventType.SYSTEM_CONFIG, 'Default admin users initialized', req, {
      adminUser: 'system',
      action: 'initialize_default_admins'
    });
    
    res.json({
      success: true,
      message: 'Default admin users initialized'
    });
  } catch (error) {
    console.error('Error initializing default admin users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize default admin users',
      code: 'INIT_ERROR'
    });
  }
});

export default router;