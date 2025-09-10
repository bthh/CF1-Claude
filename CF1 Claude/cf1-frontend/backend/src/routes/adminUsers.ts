/**
 * CF1 Backend - Admin User Management Routes
 * CRUD operations for admin user management
 */

import express from 'express';
import { requireAdminJWT, AdminAuthenticatedRequest } from '../middleware/adminAuth';
import { AdminUserService } from '../services/AdminUserService';
import { AuthService } from '../services/AuthService';
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
 * GET /api/admin/all-users - List ALL users (both admin and regular users)
 */
router.get('/all-users', requireSuperAdminOrOwner, async (req: AdminAuthenticatedRequest, res) => {
  try {
    const adminUserService = new AdminUserService();
    const authService = new AuthService();
    
    // Fetch admin users
    const adminUsers = await adminUserService.getAllAdminUsers();
    
    // Fetch regular users 
    const regularUsers = await authService.getAllUsers();
    
    // Transform admin users to unified format
    const transformedAdminUsers = adminUsers.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      walletAddress: user.walletAddress || null,
      phoneNumber: user.phoneNumber || null,
      notes: user.notes || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      userType: 'admin' // Flag to identify user type
    }));
    
    // Transform regular users to unified format
    const transformedRegularUsers = regularUsers.map(user => ({
      id: user.id,
      email: user.email,
      username: user.email ? user.email.split('@')[0] : 'user',
      name: user.displayName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email?.split('@')[0] || 'User'),
      role: user.role || 'user',
      permissions: user.permissions || [],
      isActive: user.accountStatus === 'active',
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      walletAddress: user.walletAddress || null,
      phoneNumber: user.phoneNumber || null,
      notes: null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      userType: 'regular', // Flag to identify user type
      accountStatus: user.accountStatus,
      kycStatus: user.kycStatus,
      emailVerified: user.emailVerified
    }));
    
    // Combine all users
    const allUsers = [...transformedAdminUsers, ...transformedRegularUsers];
    
    // Sort by creation date (newest first)
    allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    AuditLogger.logEvent(AuditEventType.DATA_ACCESS, 'All users list accessed', req, {
      action: 'list_all_users',
      adminCount: adminUsers.length,
      regularCount: regularUsers.length,
      totalCount: allUsers.length,
      adminUser: req.adminUser?.username
    });
    
    res.json({
      success: true,
      users: allUsers,
      summary: {
        totalUsers: allUsers.length,
        adminUsers: adminUsers.length,
        regularUsers: regularUsers.length
      }
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all users',
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

/**
 * POST /api/admin/users/cleanup-mock - Remove mock/test users and fix real users
 */
router.post('/cleanup-mock', requireSuperAdminOrOwner, async (req: AdminAuthenticatedRequest, res) => {
  try {
    const authService = new AuthService();
    const adminUserService = new AdminUserService();
    
    // List of mock user IDs to remove (from the API response)
    const mockUsersToRemove = [
      '8002b26a-72e8-4185-a63a-f4c160ea2023', // tim@cf1platform.com
      'cba9bb88-962f-4f84-93b1-c69ca3ca4190', // brian@cf1platform.com (regular)
      '308637bc-899a-40ea-9f1f-e11c20339c48', // brock@cf1platform.com  
      'a61a6399-cd37-403d-b104-91ed301e4a0e', // theosu22@gmail.com
      '4a0de3e8-6972-4175-9ccf-c6e6c54f91a1', // neutron1demo...
      '0604d0d6-2bcb-4b13-9749-177a237a10de', // bthardwick@gmail.com (duplicate regular)
      '28c13a41-a3f9-467d-8ed0-2eb8b760a8c8', // neutron1abcdef...
      '1a10475d-ff63-4f51-bce1-0dc23caab1a6'  // test@example.com
    ];
    
    // Mock admin users to remove
    const mockAdminEmails = [
      'brian@cf1platform.com',
      'admin@cf1platform.com'
    ];
    
    let removedCount = 0;
    
    // Remove mock regular users
    for (const userId of mockUsersToRemove) {
      try {
        await authService.deleteUser(userId);
        removedCount++;
        console.log('Removed mock user:', userId);
      } catch (error) {
        console.log('Failed to remove user:', userId, error);
      }
    }
    
    // Remove mock admin users
    for (const email of mockAdminEmails) {
      try {
        await adminUserService.deleteAdminUserByEmail(email);
        removedCount++;
        console.log('Removed mock admin:', email);
      } catch (error) {
        console.log('Failed to remove admin:', email, error);
      }
    }
    
    // Fix t@t.com account - activate it
    try {
      const tUser = await authService.getUserByEmail('t@t.com');
      if (tUser) {
        await authService.activateUser(tUser.id);
        console.log('Activated t@t.com user');
      }
    } catch (error) {
      console.log('Failed to activate t@t.com:', error);
    }
    
    // Reset password for brian.d.towner@gmail.com
    try {
      const brianUser = await authService.getUserByEmail('brian.d.towner@gmail.com');
      if (brianUser) {
        await authService.resetUserPassword(brianUser.id, 'BrianCF1Admin2025!');
        console.log('Reset password for brian.d.towner@gmail.com');
      }
    } catch (error) {
      console.log('Failed to reset Brian password:', error);
    }
    
    AuditLogger.logEvent(AuditEventType.SYSTEM_CONFIG, 'Mock users cleanup performed', req, {
      adminUser: req.adminUser?.username,
      action: 'cleanup_mock_users',
      removedCount
    });
    
    res.json({
      success: true,
      message: `Cleanup completed. Removed ${removedCount} mock users.`,
      removedCount
    });
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup mock users',
      code: 'CLEANUP_ERROR'
    });
  }
});

export default router;