/**
 * CF1 Backend - User Entity
 * Supports both wallet-based and traditional email/password authentication
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type AuthMethod = 'wallet' | 'email' | 'hybrid';
export type KycStatus = 'pending' | 'verified' | 'rejected' | 'not_started';
export type UserRole = 'investor' | 'creator' | 'super_admin' | 'owner';
export type AccountStatus = 'active' | 'suspended' | 'pending_verification' | 'locked';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Authentication Methods
  @Column({ type: 'text', nullable: true })
  @Index()
  email?: string;

  @Column({ type: 'text', nullable: true })
  passwordHash?: string;

  @Column({ type: 'text', nullable: true })
  @Index()
  walletAddress?: string;

  @Column({ type: 'text', default: 'email' })
  primaryAuthMethod: AuthMethod;

  // Profile Information
  @Column({ type: 'text', nullable: true })
  firstName?: string;

  @Column({ type: 'text', nullable: true })
  lastName?: string;

  @Column({ type: 'text', nullable: true })
  displayName?: string;

  @Column({ type: 'text', nullable: true })
  profileImageUrl?: string;

  @Column({ type: 'text', nullable: true })
  phoneNumber?: string;

  // Verification and Status
  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'text', nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'datetime', nullable: true })
  emailVerificationExpiry?: Date;

  @Column({ type: 'text', default: 'not_started' })
  kycStatus: KycStatus;

  @Column({ type: 'text', default: 'pending_verification' })
  accountStatus: AccountStatus;

  // Role and Permissions
  @Column({ type: 'text', default: 'investor' })
  role: UserRole;

  @Column({ type: 'json', nullable: true })
  permissions?: string[];

  // Password Reset
  @Column({ type: 'text', nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'datetime', nullable: true })
  passwordResetExpiry?: Date;

  // Security
  @Column({ type: 'integer', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'datetime', nullable: true })
  accountLockedUntil?: Date;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'text', nullable: true })
  lastLoginIp?: string;

  // Metadata
  @Column({ type: 'json', nullable: true })
  preferences?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  referredBy?: string;

  @Column({ type: 'boolean', default: false })
  acceptedTerms: boolean;

  @Column({ type: 'datetime', nullable: true })
  termsAcceptedAt?: Date;

  // Blockchain Integration
  @Column({ type: 'text', nullable: true })
  connectedWallets?: string; // JSON array of connected wallet addresses

  @Column({ type: 'boolean', default: false })
  walletVerified: boolean;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed Properties
  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.displayName || this.email || this.walletAddress || 'Unknown User';
  }

  get isEmailUser(): boolean {
    return this.primaryAuthMethod === 'email' || this.primaryAuthMethod === 'hybrid';
  }

  get isWalletUser(): boolean {
    return this.primaryAuthMethod === 'wallet' || this.primaryAuthMethod === 'hybrid';
  }

  get isActive(): boolean {
    return this.accountStatus === 'active';
  }

  get isLocked(): boolean {
    return this.accountLockedUntil ? new Date() < this.accountLockedUntil : false;
  }

  get canPerformBlockchainOperations(): boolean {
    return this.isWalletUser && this.walletVerified && this.isActive;
  }

  // Helper Methods
  hasPermission(permission: string): boolean {
    if (!this.permissions) return false;
    return this.permissions.includes(permission);
  }

  addPermission(permission: string): void {
    if (!this.permissions) this.permissions = [];
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
    }
  }

  removePermission(permission: string): void {
    if (!this.permissions) return;
    this.permissions = this.permissions.filter(p => p !== permission);
  }

  incrementFailedLogins(): void {
    this.failedLoginAttempts++;
    
    // Lock account after 5 failed attempts for 30 minutes
    if (this.failedLoginAttempts >= 5) {
      this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
  }

  resetFailedLogins(): void {
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = null;
  }

  updateLastLogin(ip?: string): void {
    this.lastLoginAt = new Date();
    if (ip) this.lastLoginIp = ip;
  }

  // Validation Methods
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }
}