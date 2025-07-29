/**
 * CF1 Backend - Admin Authentication Routes
 * Secure JWT-based authentication for admin users
 */

import express from 'express';
import { 
  adminLogin, 
  requireAdminJWT, 
  logAdminOperation,
  AdminAuthenticatedRequest 
} from '../middleware/adminAuth';

const router = express.Router();

// Admin login endpoint
router.post('/login', adminLogin);

// Admin token verification endpoint
router.get('/verify', requireAdminJWT, (req: AdminAuthenticatedRequest, res) => {
  if (!req.adminUser) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    });
  }

  res.json({
    success: true,
    user: {
      username: req.adminUser.username,
      permissions: req.adminUser.permissions,
      role: 'admin', // Map to frontend role system
      address: req.body.walletAddress || null,
      name: req.adminUser.username,
      email: `${req.adminUser.username}@cf1admin.com`,
      createdAt: new Date().toISOString(),
      isActive: true
    }
  });
});

// Admin logout endpoint
router.post('/logout', requireAdminJWT, logAdminOperation, (req: AdminAuthenticatedRequest, res) => {
  // In a full implementation, you would invalidate the token here
  // For now, we'll just log the logout event
  console.log(`[ADMIN_LOGOUT] ${new Date().toISOString()} - ${req.adminUser?.username} - ${req.ip}`);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Admin session refresh endpoint
router.post('/refresh', requireAdminJWT, (req: AdminAuthenticatedRequest, res) => {
  if (!req.adminUser) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // Generate new token with extended expiration
  const { generateAdminJWT } = require('../middleware/adminAuth');
  const newToken = generateAdminJWT(req.adminUser.username, req.adminUser.permissions);
  
  res.json({
    success: true,
    token: newToken,
    expiresIn: '24h',
    user: {
      username: req.adminUser.username,
      permissions: req.adminUser.permissions,
      role: 'admin'
    }
  });
});

export default router;