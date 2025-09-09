/**
 * CF1 Backend - Database Configuration
 * TypeORM configuration for SQLite database
 */

import { DataSource } from 'typeorm';
import { ProposalAnalysis } from '../models/ProposalAnalysis';
import { FeatureToggle } from '../models/FeatureToggle';
import { User } from '../models/User';
import { AdminUser } from '../entities/AdminUser';
import path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

// Determine database path based on environment
const getDatabasePath = (): string => {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  
  // In production (Railway), use app/data directory
  if (isProduction) {
    return '/app/data/cf1.db';
  }
  
  // In development, use relative path
  return path.join(__dirname, '../../data/cf1.db');
};

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: getDatabasePath(),
  entities: [ProposalAnalysis, FeatureToggle, User, AdminUser],
  synchronize: true, // Always auto-create tables since we're using SQLite
  logging: isDevelopment,
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  migrationsRun: true
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log(`🔧 Initializing database at: ${getDatabasePath()}`);
    
    // Ensure data directory exists before initializing database
    const dbPath = getDatabasePath();
    const dataDir = path.dirname(dbPath);
    const fs = require('fs');
    
    if (!fs.existsSync(dataDir)) {
      console.log(`📁 Creating data directory: ${dataDir}`);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Initialize default admin users with retry mechanism
    let adminInitRetries = 3;
    while (adminInitRetries > 0) {
      try {
        const { AdminUserService } = require('../services/AdminUserService');
        const adminUserService = new AdminUserService();
        await adminUserService.initializeDefaultAdmins();
        console.log('✅ Default admin users initialized');
        break;
      } catch (error) {
        adminInitRetries--;
        console.warn(`⚠️ Admin user initialization attempt failed (${3 - adminInitRetries}/3):`, error);
        
        if (adminInitRetries === 0) {
          console.error('❌ Admin user initialization failed after 3 attempts');
          // Don't throw error - let the app start without admin users
        } else {
          // Wait 1 second before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
};