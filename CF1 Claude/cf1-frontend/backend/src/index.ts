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

// Security and middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
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

// Server-side authorization for all API endpoints
app.use('/api', serverSideAuthorization);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'cf1-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Manual database setup endpoint for production troubleshooting
app.post('/setup-database', async (req, res) => {
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/v1/proposals', proposalsRoutes);
app.use('/api/v1/governance', governanceRoutes);
app.use('/api/v1/ai-analysis', analysisRoutes);
app.use('/api/creator-toolkit', creatorToolkitRoutes);
app.use('/api/v1/assets', assetsRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/feature-toggles', featureToggleRoutes);

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