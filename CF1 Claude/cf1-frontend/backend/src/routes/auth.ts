/**
 * CF1 Backend - Authentication Routes
 * Handles registration, login, password reset, and user management
 */

import express, { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { authenticate, optionalAuth, rateLimit, AuthenticatedRequest } from '../middleware/unifiedAuth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const authService = new AuthService();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit(10, 15 * 60 * 1000); // 10 requests per 15 minutes
const strictRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes

/**
 * POST /api/auth/register
 * Register a new user with email/password
 */
router.post('/register', 
  authRateLimit,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
    body('acceptedTerms').isBoolean().custom(value => value === true)
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

      const result = await authService.register(req.body);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Login with email/password
 */
router.post('/login',
  authRateLimit,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
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

      const clientIp = req.ip || req.connection.remoteAddress;
      const result = await authService.login(req.body, clientIp);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      });
    }
  }
);

/**
 * POST /api/auth/wallet-login
 * Authenticate with wallet address (for backward compatibility)
 */
router.post('/wallet-login',
  authRateLimit,
  [
    body('walletAddress').notEmpty().isLength({ min: 40 })
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

      const { walletAddress, signature } = req.body;
      const result = await authService.authenticateWallet(walletAddress, signature);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: 'Wallet authentication successful',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      console.error('Wallet login error:', error);
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Wallet authentication failed'
      });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    const result = await authService.refreshToken(refreshToken);

    // Update refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Token refresh failed'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and clear cookies
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Initiate password reset process
 */
router.post('/forgot-password',
  strictRateLimit,
  [
    body('email').isEmail().normalizeEmail()
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

      const { email } = req.body;
      await authService.initiatePasswordReset(email);

      // Always return success to prevent user enumeration
      res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    } catch (error) {
      console.error('Password reset initiation error:', error);
      // Don't reveal the actual error to prevent information disclosure
      res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }
  }
);

/**
 * POST /api/auth/reset-password
 * Complete password reset with token
 */
router.post('/reset-password',
  strictRateLimit,
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 })
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

      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed'
      });
    }
  }
);

/**
 * POST /api/auth/verify-email
 * Verify email address with token
 */
router.post('/verify-email',
  [
    body('token').notEmpty()
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

      const { token } = req.body;
      await authService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully. Your account is now active.'
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Email verification failed'
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.walletAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          profileImageUrl: user.profileImageUrl,
          role: user.role,
          authMethod: user.primaryAuthMethod,
          emailVerified: user.emailVerified,
          accountStatus: user.accountStatus,
          kycStatus: user.kycStatus,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

/**
 * POST /api/auth/link-wallet
 * Link wallet address to existing email account
 */
router.post('/link-wallet',
  authenticate,
  [
    body('walletAddress').notEmpty().isLength({ min: 40 })
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const { walletAddress } = req.body;
      const updatedUser = await authService.linkWallet(req.user.id, walletAddress);

      res.json({
        success: true,
        message: 'Wallet linked successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            walletAddress: updatedUser.walletAddress,
            authMethod: updatedUser.primaryAuthMethod
          }
        }
      });
    } catch (error) {
      console.error('Link wallet error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to link wallet'
      });
    }
  }
);

export default router;