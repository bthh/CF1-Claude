/**
 * CF1 Backend - Main Application
 * Express server for AI analysis integration
 */

// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { initializeDatabase, closeDatabase, AppDataSource } from './config/database';
import analysisRoutes from './routes/analysis';
import creatorToolkitRoutes from './routes/creatorToolkit';
import assetsRoutes from './routes/assets';
import proposalsRoutes from './routes/proposals';
import governanceRoutes from './routes/governance';
import adminAuthRoutes from './routes/adminAuth';
import adminRoutes from './routes/admin';
import adminUsersRoutes from './routes/adminUsers';
import featureToggleRoutes from './routes/featureToggles';
import authRoutes from './routes/auth';
import { handleValidationError } from './middleware/validation';
import { generateCSRFToken, csrfErrorHandler } from './middleware/csrfProtection';
import { secureErrorHandler, requestIdMiddleware } from './middleware/secureErrorHandler';
import { AuditLogger, auditMiddleware, AuditEventType } from './middleware/auditLogger';
import { serverSideAuthorization } from './middleware/serverSideAuthorization';

// Environment variables already loaded at the top

const app = express();
const PORT = process.env.PORT || 3001;

// Security and middleware with CSP configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://rwa2.netlify.app", "wss://rwa2.netlify.app"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());

// CORS configuration for multiple origins
const allowedOrigins = [
  'https://rwa2.netlify.app',
  'https://app.cf1platform.com',
  'https://cf1platform.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With']
}));

// Cookie parser for CSRF tokens
app.use(cookieParser());

// Request ID middleware for error tracking
app.use(requestIdMiddleware);

// Audit logging for all requests
app.use(auditMiddleware(AuditEventType.API_REQUEST));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CSRF protection for all routes
app.use(generateCSRFToken);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'cf1-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Direct admin auth endpoints (completely bypass all middleware)
app.post('/admin-login', async (req, res) => {
  try {
    const { AdminUserService } = require('./services/AdminUserService');
    const adminUserService = new AdminUserService();
    const { username, password } = req.body;
    
    console.log(`🔍 Admin login attempt: ${username}`);
    const authenticatedUser = await adminUserService.authenticateUser(username, password);
    
    if (!authenticatedUser) {
      console.log(`❌ Admin login failed: ${username}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Generate JWT token
    const { generateAdminJWT } = require('./middleware/adminAuth');
    const token = generateAdminJWT(authenticatedUser.username, authenticatedUser.permissions);
    
    console.log(`✅ Admin login success: ${username}`);
    res.json({
      success: true,
      token,
      expiresIn: '24h',
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
});

// Admin auth routes BEFORE authorization middleware
app.use('/api/admin/auth', adminAuthRoutes);

// Manual database setup endpoint for production troubleshooting  
app.get('/setup-database', async (req, res) => {
  try {
    console.log('🔧 Manual database setup requested');
    
    // Force table synchronization
    await AppDataSource.synchronize();
    console.log('✅ Tables synchronized');
    
    // Initialize admin users
    const { AdminUserService } = require('./services/AdminUserService');
    const adminUserService = new AdminUserService();
    await adminUserService.initializeDefaultAdmins();
    
    res.json({
      success: true,
      message: 'Database setup completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database setup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Test admin credentials endpoint
app.post('/test-admin-credentials', async (req, res) => {
  try {
    const { AdminUserService } = require('./services/AdminUserService');
    const adminUserService = new AdminUserService();
    const { username, password } = req.body;
    
    console.log(`🔍 Testing credentials for: ${username}`);
    
    // Find user
    const user = await adminUserService.findByEmailOrUsername(username);
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        username,
        availableUsers: 'Check server logs'
      });
    }
    
    // Test authentication
    const authenticated = await adminUserService.authenticateUser(username, password);
    
    res.json({
      success: !!authenticated,
      message: authenticated ? 'Credentials valid' : 'Credentials invalid',
      user: authenticated ? {
        username: authenticated.username,
        email: authenticated.email,
        role: authenticated.role
      } : null
    });
    
  } catch (error) {
    console.error('Credential test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Admin routes BEFORE server-side authorization (they use their own admin JWT auth)
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin', adminRoutes);

// Feature toggles BEFORE server-side authorization (public read, admin write)
app.use('/feature-toggles', featureToggleRoutes);

// Server-side authorization for all other /api routes
app.use('/api', serverSideAuthorization);

// Test endpoint to verify authorization is disabled
app.get('/api/test-auth', (req, res) => {
  res.json({
    success: true,
    message: 'Authorization bypassed successfully',
    timestamp: new Date().toISOString()
  });
});

// API routes (these will go through authorization)
app.use('/api/auth', authRoutes);
app.use('/api/v1/proposals', proposalsRoutes);
app.use('/api/v1/governance', governanceRoutes);
app.use('/api/v1/ai-analysis', analysisRoutes);
app.use('/api/creator-toolkit', creatorToolkitRoutes);
app.use('/api/v1/assets', assetsRoutes);

// Error handling middleware (order matters!)
app.use(handleValidationError);
app.use(csrfErrorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl,
    timestamp: Date.now(),
    requestId: req.headers['x-request-id'] as string
  });
});

// Global secure error handler (must be last)
app.use(secureErrorHandler);

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Log system startup
    AuditLogger.logEvent(AuditEventType.SYSTEM_STARTUP, 'CF1 Backend server starting', undefined, {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 CF1 Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      // Log system shutdown
      AuditLogger.logEvent(AuditEventType.SYSTEM_SHUTDOWN, 'CF1 Backend server shutting down', undefined, {
        signal,
        timestamp: Date.now()
      });
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          await closeDatabase();
          console.log('Database connection closed');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          AuditLogger.logEvent(AuditEventType.SYSTEM_ERROR, 'Error during shutdown', undefined, {
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;