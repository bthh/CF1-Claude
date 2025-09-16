/**
 * CF1 Backend - Request Validation Schemas
 * Zod schemas for runtime validation of incoming requests
 */

import { z } from 'zod';

// Auth Request Schemas
export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  displayName: z.string().min(1, 'Display name is required').optional(),
  acceptedTerms: z.boolean().refine(val => val === true, 'Terms must be accepted'),
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const WalletAuthRequestSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  signature: z.string().optional(),
  message: z.string().optional(),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// Proposal Request Schemas
export const CreateProposalRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['governance', 'funding', 'parameter_change', 'upgrade']),
  funding: z.object({
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().min(1, 'Currency is required'),
    recipient: z.string().min(1, 'Recipient is required'),
  }).optional(),
  parameters: z.record(z.any()).optional(),
  documents: z.array(z.string()).optional(),
});

export const VoteRequestSchema = z.object({
  proposalId: z.string().min(1, 'Proposal ID is required'),
  vote: z.enum(['yes', 'no', 'abstain']),
  amount: z.number().positive('Vote amount must be positive').optional(),
  reason: z.string().max(500, 'Reason too long').optional(),
});

// Analysis Request Schemas
export const AnalysisRequestSchema = z.object({
  proposalId: z.string().min(1, 'Proposal ID is required'),
  documentFile: z.any(), // File upload handling
  analysisType: z.enum(['risk', 'financial', 'technical', 'legal']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

// Admin Request Schemas
export const AdminLoginRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateUserRequestSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  displayName: z.string().min(1, 'Display name cannot be empty').optional(),
  role: z.enum(['investor', 'creator', 'super_admin', 'owner']).optional(),
  accountStatus: z.enum(['active', 'suspended', 'pending_verification', 'locked']).optional(),
  kycStatus: z.enum(['pending', 'verified', 'rejected', 'not_started']).optional(),
  permissions: z.array(z.string()).optional(),
});

export const FeatureToggleRequestSchema = z.object({
  key: z.string().min(1, 'Feature key is required'),
  enabled: z.boolean(),
  description: z.string().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  userGroups: z.array(z.string()).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
});

// Asset Update Request Schemas
export const AssetUpdateRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  assetType: z.enum(['equity', 'bond', 'real_estate', 'commodity', 'crypto']),
  value: z.number().positive('Value must be positive'),
  change: z.number(),
  source: z.string().optional(),
});

// Pagination Schemas
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const FilterQuerySchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
});

// Combined Query Schema
export const QueryParamsSchema = PaginationQuerySchema.merge(FilterQuerySchema);

// Type exports
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type WalletAuthRequest = z.infer<typeof WalletAuthRequestSchema>;
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>;
export type CreateProposalRequest = z.infer<typeof CreateProposalRequestSchema>;
export type VoteRequest = z.infer<typeof VoteRequestSchema>;
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type AdminLoginRequest = z.infer<typeof AdminLoginRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type FeatureToggleRequest = z.infer<typeof FeatureToggleRequestSchema>;
export type AssetUpdateRequest = z.infer<typeof AssetUpdateRequestSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type FilterQuery = z.infer<typeof FilterQuerySchema>;
export type QueryParams = z.infer<typeof QueryParamsSchema>;