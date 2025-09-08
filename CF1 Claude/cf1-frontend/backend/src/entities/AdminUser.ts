/**
 * CF1 Backend - Admin User Entity
 * Database-driven admin user management
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({
    type: 'simple-enum',
    enum: ['super_admin', 'creator_admin', 'platform_admin', 'owner'],
    default: 'creator_admin'
  })
  role!: string;

  @Column('simple-array')
  permissions!: string[];

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  walletAddress?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to check permissions
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission) || this.permissions.includes('all');
  }

  // Helper method to get safe user data (no password hash)
  toSafeObject() {
    const { passwordHash, ...safeUser } = this;
    return safeUser;
  }
}