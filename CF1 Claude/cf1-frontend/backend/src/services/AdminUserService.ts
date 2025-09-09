/**
 * CF1 Backend - Admin User Service
 * Database operations for admin user management
 */

import { Repository } from 'typeorm';
import { AdminUser } from '../entities/AdminUser';
import { AppDataSource } from '../config/database';
import bcrypt from 'bcrypt';

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

    // Hash the password
    const passwordHash = await bcrypt.hash(userData.password, 12);

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
      const existingAdmins = await this.adminUserRepository.count();
      if (existingAdmins > 0) {
        console.log(`✅ Admin users already initialized (count: ${existingAdmins})`);
        return; // Already have admin users
      }
      
      console.log('🔧 Initializing default admin users...');
    } catch (error) {
      console.error('❌ Error checking existing admin users:', error);
      throw error;
    }

    // Create default admin users from environment variables if they exist
    const defaultAdmins = [
      {
        email: 'admin@cf1platform.com',
        username: process.env.ADMIN_USERNAME || 'cf1admin',
        password: process.env.ADMIN_PASSWORD || 'CF1Admin2025!',
        name: 'CF1 System Admin',
        role: 'super_admin',
        permissions: ['admin', 'governance', 'proposals', 'users', 'super_admin']
      },
      {
        email: 'bthardwick@gmail.com',
        username: 'brock',
        password: process.env.BROCK_PASSWORD || 'BrockCF1Admin2025!',
        name: 'Brock',
        role: 'super_admin',
        permissions: ['admin', 'governance', 'proposals', 'users', 'super_admin']
      },
      {
        email: 'brian@cf1platform.com',
        username: 'brian',
        password: process.env.BRIAN_PASSWORD || 'BrianCF1Admin2025!',
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
}