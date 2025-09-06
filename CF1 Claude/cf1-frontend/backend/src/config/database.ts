/**
 * CF1 Backend - Database Configuration
 * TypeORM configuration for SQLite database
 */

import { DataSource } from 'typeorm';
import { ProposalAnalysis } from '../models/ProposalAnalysis';
import { FeatureToggle } from '../models/FeatureToggle';
import { User } from '../models/User';
import path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || path.join(__dirname, '../../data/cf1.db'),
  entities: [ProposalAnalysis, FeatureToggle, User],
  synchronize: isDevelopment, // Auto-create tables in development
  logging: isDevelopment,
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  migrationsRun: true
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Ensure data directory exists
    const dataDir = path.dirname(AppDataSource.options.database as string);
    const fs = require('fs');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
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