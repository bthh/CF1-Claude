/**
 * CF1 Backend - Admin User Service
 * Database operations for admin user management
 */

import { Repository } from 'typeorm';
import { AdminUser } from '../entities/AdminUser';
import { AppDataSource } from '../config/database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export class AdminUserService {
  private adminUserRepository: Repository<AdminUser>;

  constructor() {
    this.adminUserRepository = AppDataSource.getRepository(AdminUser);
  }

  /**
   * Create a new admin user
   */
  async createAdminUser(userData: {
    email: string;
    username: string;
    password: string;
    name: string;
    role: string;
    permissions: string[];
    walletAddress?: string;
    phoneNumber?: string;
    notes?: string;
    passwordHash?: string; // Optional pre-hashed password
  }): Promise<AdminUser> {
    // Check if email or username already exists
    const existingUser = await this.adminUserRepository.findOne({
      where: [
        { email: userData.email },
        { username: userData.username }
      ]
    });

    if (existingUser) {
      throw new Error('Admin user with this email or username already exists');
    }

    // Use provided hash or hash the password
    let passwordHash: string;
    if (userData.passwordHash) {
      // Use pre-hashed password (from Railway environment variables)
      passwordHash = userData.passwordHash;
    } else {
      // Hash the plain text password
      passwordHash = await bcrypt.hash(userData.password, 12);
    }

    // Create new admin user
    const adminUser = this.adminUserRepository.create({
      email: userData.email,
      username: userData.username,
      passwordHash,
      name: userData.name,
      role: userData.role,
      permissions: userData.permissions,
      walletAddress: userData.walletAddress,
      phoneNumber: userData.phoneNumber,
      notes: userData.notes,
      isActive: true
    });

    return await this.adminUserRepository.save(adminUser);
  }

  /**
   * Find admin user by email or username
   */
  async findByEmailOrUsername(identifier: string): Promise<AdminUser | null> {
    return await this.adminUserRepository.findOne({
      where: [
        { email: identifier },
        { username: identifier }
      ]
    });
  }

  /**
   * Authenticate admin user
   */
  async authenticateUser(identifier: string, password: string): Promise<AdminUser | null> {
    const user = await this.findByEmailOrUsername(identifier);
    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await this.adminUserRepository.save(user);

    return user;
  }

  /**
   * Get all admin users
   */
  async getAllAdminUsers(): Promise<AdminUser[]> {
    return await this.adminUserRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Update admin user
   */
  async updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const user = await this.adminUserRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('Admin user not found');
    }

    // If password is being updated, hash it
    if (updates.passwordHash && typeof updates.passwordHash === 'string') {
      updates.passwordHash = await bcrypt.hash(updates.passwordHash, 12);
    }

    Object.assign(user, updates);
    return await this.adminUserRepository.save(user);
  }

  /**
   * Delete admin user
   */
  async deleteAdminUser(id: string): Promise<void> {
    const result = await this.adminUserRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Admin user not found');
    }
  }

  /**
   * Initialize default admin users (for migration/setup)
   */
  async initializeDefaultAdmins(): Promise<void> {
    try {
      // First ensure the admin_users table exists
      await this.ensureAdminUsersTable();
      
      const existingAdmins = await this.adminUserRepository.count();
      if (existingAdmins > 0) {
        console.log(`✅ Admin users already initialized (count: ${existingAdmins})`);
        return; // Already have admin users
      }
      
      console.log('🔧 Initializing default admin users...');
    } catch (error) {
      console.error('❌ Error checking existing admin users:', error);
      
      // Try direct SQL approach as fallback
      console.log('🔄 Attempting direct SQL initialization...');
      return this.initializeAdminUsersDirectSQL();
    }

    // Create default admin users from environment variables if they exist
    const defaultAdmins = [
      {
        email: 'admin@cf1platform.com',
        username: process.env.ADMIN_USERNAME || 'cf1admin',
        password: process.env.ADMIN_PASSWORD || 'CF1Admin2025!',
        passwordHash: process.env.ADMIN_PASSWORD_HASH,
        name: 'CF1 System Admin',
        role: 'super_admin',
        permissions: ['admin', 'governance', 'proposals', 'users', 'super_admin']
      },
      {
        email: 'bthardwick@gmail.com',
        username: 'brock',
        password: process.env.BROCK_PASSWORD || 'BrockCF1Admin2025!',
        passwordHash: process.env.BROCK_PASSWORD_HASH,
        name: 'Brock',
        role: 'super_admin',
        permissions: ['admin', 'governance', 'proposals', 'users', 'super_admin']
      },
      {
        email: 'brian.d.towner@gmail.com',
        username: 'brian',
        password: process.env.BRIAN_PASSWORD || 'BrianCF1Admin2025!',
        passwordHash: process.env.BRIAN_PASSWORD_HASH,
        name: 'Brian',
        role: 'super_admin',
        permissions: ['admin', 'governance', 'proposals', 'users', 'super_admin']
      }
    ];

    let successCount = 0;
    for (const adminData of defaultAdmins) {
      try {
        await this.createAdminUser(adminData);
        console.log(`✅ Created default admin user: ${adminData.email}`);
        successCount++;
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          console.log(`ℹ️ Admin user ${adminData.email} already exists, skipping`);
        } else {
          console.error(`❌ Failed to create admin user ${adminData.email}:`, error);
        }
      }
    }
    
    console.log(`🎉 Admin initialization completed: ${successCount}/${defaultAdmins.length} users created`);
  }

  /**
   * Ensure admin_users table exists using raw SQL
   */
  private async ensureAdminUsersTable(): Promise<void> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      
      // Create table if it doesn't exist
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "admin_users" (
          "id" varchar PRIMARY KEY NOT NULL,
          "email" varchar NOT NULL,
          "username" varchar NOT NULL,
          "passwordHash" varchar NOT NULL,
          "name" varchar NOT NULL,
          "role" varchar NOT NULL DEFAULT 'creator_admin',
          "permissions" text NOT NULL,
          "isActive" boolean NOT NULL DEFAULT 1,
          "lastLoginAt" datetime,
          "walletAddress" varchar,
          "phoneNumber" varchar,
          "notes" varchar,
          "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create unique indexes
      await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_admin_users_email" ON "admin_users" ("email")`);
      await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_admin_users_username" ON "admin_users" ("username")`);
      
      await queryRunner.release();
      console.log('✅ Admin users table ensured via SQL');
    } catch (error) {
      console.warn('⚠️ Error ensuring admin_users table:', error);
    }
  }

  /**
   * Initialize admin users using direct SQL as fallback
   */
  private async initializeAdminUsersDirectSQL(): Promise<void> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      
      // First ensure table exists
      await this.ensureAdminUsersTable();
      
      // Check if any admin users exist
      const existingCount = await queryRunner.query(`SELECT COUNT(*) as count FROM admin_users`);
      if (existingCount[0]?.count > 0) {
        console.log(`✅ Admin users already exist via SQL (count: ${existingCount[0].count})`);
        await queryRunner.release();
        return;
      }
      
      // Pre-calculate password hashes
      const defaultPasswordHash1 = process.env.ADMIN_PASSWORD_HASH || await bcrypt.hash('CF1Admin2025!', 12);
      const defaultPasswordHash2 = process.env.BROCK_PASSWORD_HASH || await bcrypt.hash('BrockCF1Admin2025!', 12);
      const defaultPasswordHash3 = process.env.BRIAN_PASSWORD_HASH || await bcrypt.hash('BrianCF1Admin2025!', 12);
      
      // Create default admin users
      const admins = [
        {
          id: uuidv4(),
          email: 'admin@cf1platform.com',
          username: process.env.ADMIN_USERNAME || 'cf1admin',
          passwordHash: defaultPasswordHash1,
          name: 'CF1 System Admin',
          role: 'super_admin',
          permissions: 'admin,governance,proposals,users,super_admin'
        },
        {
          id: uuidv4(),
          email: 'bthardwick@gmail.com',
          username: 'brock',
          passwordHash: defaultPasswordHash2,
          name: 'Brock',
          role: 'super_admin',
          permissions: 'admin,governance,proposals,users,super_admin'
        },
        {
          id: uuidv4(),
          email: 'brian.d.towner@gmail.com',
          username: 'brian',
          passwordHash: defaultPasswordHash3,
          name: 'Brian',
          role: 'super_admin',
          permissions: 'admin,governance,proposals,users,super_admin'
        }
      ];
      
      for (const admin of admins) {
        await queryRunner.query(`
          INSERT INTO admin_users (id, email, username, passwordHash, name, role, permissions, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
        `, [admin.id, admin.email, admin.username, admin.passwordHash, admin.name, admin.role, admin.permissions]);
        
        console.log(`✅ Created admin user via SQL: ${admin.email}`);
      }
      
      await queryRunner.release();
      console.log(`🎉 SQL admin initialization completed: ${admins.length} users created`);
      
    } catch (error) {
      console.error('❌ SQL admin initialization failed:', error);
      throw error;
    }
  }
}