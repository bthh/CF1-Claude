/**
 * CF1 Backend - Authentication Service
 * Handles both traditional email/password and wallet authentication
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { User, AuthMethod, AccountStatus } from '../models/User';
import { Repository } from 'typeorm';

export interface LoginResponse {
  user: Omit<User, 'passwordHash' | 'passwordResetToken' | 'emailVerificationToken'>;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  acceptedTerms: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export class AuthService {
  private userRepository: Repository<User>;
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private saltRounds = 12;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.jwtSecret = process.env.JWT_SECRET || 'cf1-dev-secret-key-change-in-production';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'cf1-dev-refresh-secret-change-in-production';
  }

  /**
   * Register a new user with email/password
   */
  async register(registerData: RegisterRequest): Promise<LoginResponse> {
    const { email, password, firstName, lastName, acceptedTerms } = registerData;

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!User.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = User.validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    if (!acceptedTerms) {
      throw new Error('Terms of service must be accepted');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = this.userRepository.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      displayName: firstName && lastName ? `${firstName} ${lastName}` : email.split('@')[0],
      primaryAuthMethod: 'email' as AuthMethod,
      accountStatus: 'pending_verification' as AccountStatus,
      emailVerificationToken,
      emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      acceptedTerms,
      termsAcceptedAt: new Date(),
      role: 'investor' // Default role
    });

    const savedUser = await this.userRepository.save(user);

    // TODO: Send verification email
    console.log(`Email verification token for ${email}: ${emailVerificationToken}`);

    // Generate tokens
    const tokens = this.generateTokens(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens
    };
  }

  /**
   * Login with email/password
   */
  async login(loginData: LoginRequest, ip?: string): Promise<LoginResponse> {
    const { email, password } = loginData;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user || !user.passwordHash) {
      // Prevent user enumeration - same error for non-existent and wrong password
      throw new Error('Invalid email or password');
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    // Check if account is suspended
    if (user.accountStatus === 'suspended') {
      throw new Error('Account has been suspended');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      // Increment failed attempts
      user.incrementFailedLogins();
      await this.userRepository.save(user);
      throw new Error('Invalid email or password');
    }

    // Reset failed attempts on successful login
    user.resetFailedLogins();
    user.updateLastLogin(ip);

    // Activate account if it was pending verification (for demo purposes)
    if (user.accountStatus === 'pending_verification') {
      user.accountStatus = 'active';
    }

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  /**
   * Wallet authentication (for existing wallet users)
   */
  async authenticateWallet(walletAddress: string, signature?: string): Promise<LoginResponse> {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Find existing user by wallet address
    let user = await this.userRepository.findOne({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (!user) {
      // Create new user for this wallet
      user = this.userRepository.create({
        walletAddress: walletAddress.toLowerCase(),
        displayName: `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)}`,
        primaryAuthMethod: 'wallet' as AuthMethod,
        accountStatus: 'active' as AccountStatus,
        walletVerified: true,
        role: 'investor',
        acceptedTerms: true, // Assume wallet connection implies terms acceptance
        termsAcceptedAt: new Date()
      });

      user = await this.userRepository.save(user);
    } else {
      // Update last login
      user.updateLastLogin();
      await this.userRepository.save(user);
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  /**
   * Initiate password reset
   */
  async initiatePasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user || !user.passwordHash) {
      // Don't reveal whether user exists - just return success
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetExpiry;

    await this.userRepository.save(user);

    // TODO: Send password reset email
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!token || !newPassword) {
      throw new Error('Token and new password are required');
    }

    const passwordValidation = User.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token }
    });

    if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);

    // Update user
    user.passwordHash = passwordHash;
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    user.resetFailedLogins(); // Clear any failed attempts

    await this.userRepository.save(user);
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token }
    });

    if (!user || !user.emailVerificationExpiry || user.emailVerificationExpiry < new Date()) {
      throw new Error('Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    
    // Activate account if it was pending verification
    if (user.accountStatus === 'pending_verification') {
      user.accountStatus = 'active';
    }

    await this.userRepository.save(user);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret) as { userId: string; type: string };
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.userId }
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Link wallet to existing email account
   */
  async linkWallet(userId: string, walletAddress: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if wallet is already linked to another account
    const existingWalletUser = await this.userRepository.findOne({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (existingWalletUser && existingWalletUser.id !== userId) {
      throw new Error('Wallet is already linked to another account');
    }

    // Update user
    user.walletAddress = walletAddress.toLowerCase();
    user.primaryAuthMethod = user.primaryAuthMethod === 'email' ? 'hybrid' : user.primaryAuthMethod;
    user.walletVerified = true;

    return await this.userRepository.save(user);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId }
    });
  }

  /**
   * Get all regular users (for admin access)
   */
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
      order: {
        createdAt: 'DESC'
      }
    });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase() }
    });
  }

  /**
   * Get permissions for a given role
   */
  private getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'investor': [
        'view_proposals',
        'make_investments', 
        'view_investments',
        'view_governance',
        'vote_governance'
      ],
      'creator_admin': [
        'view_proposals',
        'create_proposals',
        'edit_proposals',
        'make_investments',
        'view_investments',
        'view_governance',
        'vote_governance',
        'create_governance_proposals',
        'view_admin_dashboard',
        'view_analytics'
      ],
      'platform_admin': [
        'view_proposals',
        'create_proposals',
        'edit_proposals',
        'approve_proposals',
        'make_investments',
        'view_investments',
        'manage_investments',
        'view_governance',
        'vote_governance',
        'create_governance_proposals',
        'execute_governance',
        'view_admin_dashboard',
        'manage_users',
        'manage_platform',
        'view_analytics',
        'financial_operations'
      ],
      'super_admin': [
        'view_proposals',
        'create_proposals',
        'edit_proposals',
        'approve_proposals',
        'delete_proposals',
        'instant_fund_proposals',
        'make_investments',
        'view_investments',
        'manage_investments',
        'view_governance',
        'vote_governance',
        'create_governance_proposals',
        'execute_governance',
        'view_admin_dashboard',
        'manage_users',
        'manage_platform',
        'view_analytics',
        'financial_operations',
        'system_maintenance',
        'audit_logs',
        'security_settings'
      ]
    };

    return rolePermissions[role] || rolePermissions['investor'];
  }

  /**
   * Update user role and associated permissions
   */
  async updateUserRole(userId: string, role: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Update role
    user.role = role;
    
    // Update permissions based on role
    user.permissions = this.getRolePermissions(role);
    
    await this.userRepository.save(user);
    return user;
  }

  /**
   * Delete user by ID
   */
  async deleteUser(userId: string): Promise<void> {
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) {
      throw new Error('User not found');
    }
  }

  /**
   * Activate user account
   */
  async activateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    
    user.accountStatus = 'active';
    user.emailVerified = true;
    await this.userRepository.save(user);
    return user;
  }

  /**
   * Suspend user account
   */
  async suspendUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    
    user.accountStatus = 'suspended';
    await this.userRepository.save(user);
    return user;
  }

  /**
   * Update user account status
   */
  async updateUserStatus(userId: string, status: AccountStatus): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    
    user.accountStatus = status;
    
    // If activating, also verify email
    if (status === 'active') {
      user.emailVerified = true;
    }
    
    await this.userRepository.save(user);
    return user;
  }

  /**
   * Update user KYC status
   */
  async updateUserKycStatus(userId: string, kycStatus: KycStatus): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    
    user.kycStatus = kycStatus;
    await this.userRepository.save(user);
    return user;
  }

  /**
   * Reset user password (admin function)
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);
    user.passwordHash = passwordHash;
    user.resetFailedLogins();
    
    await this.userRepository.save(user);
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      userId: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
      authMethod: user.primaryAuthMethod
    };

    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      this.jwtSecret,
      { expiresIn: '15m' } // 15 minutes
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.jwtRefreshSecret,
      { expiresIn: '7d' } // 7 days
    );

    return { accessToken, refreshToken };
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User): any {
    const { passwordHash, passwordResetToken, emailVerificationToken, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Verify JWT token
   */
  verifyAccessToken(token: string): { userId: string; email?: string; walletAddress?: string; role: string; authMethod: AuthMethod } {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as any;
      
      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return {
        userId: payload.userId,
        email: payload.email,
        walletAddress: payload.walletAddress,
        role: payload.role,
        authMethod: payload.authMethod
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}