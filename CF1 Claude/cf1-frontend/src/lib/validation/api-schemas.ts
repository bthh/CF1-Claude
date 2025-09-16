/**
 * CF1 Frontend - API Response Validation Schemas
 * Zod schemas for runtime validation of API responses
 */

import { z } from 'zod';

// Base API Response Schema
export const BaseApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  code: z.string().optional(),
});

// User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  walletAddress: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  role: z.enum(['investor', 'creator', 'super_admin', 'owner']),
  permissions: z.array(z.string()).optional(),
  emailVerified: z.boolean(),
  walletVerified: z.boolean(),
  kycStatus: z.enum(['pending', 'verified', 'rejected', 'not_started']),
  accountStatus: z.enum(['active', 'suspended', 'pending_verification', 'locked']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Auth Response Schema
export const AuthResponseSchema = BaseApiResponseSchema.extend({
  user: UserProfileSchema.optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresIn: z.string().optional(),
});

// Proposal Schema
export const ProposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  creator: z.string(),
  status: z.enum(['draft', 'active', 'passed', 'rejected', 'expired']),
  type: z.enum(['governance', 'funding', 'parameter_change', 'upgrade']),
  totalVotes: z.number(),
  yesVotes: z.number(),
  noVotes: z.number(),
  abstainVotes: z.number(),
  quorum: z.number(),
  threshold: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Proposals List Response Schema
export const ProposalsResponseSchema = BaseApiResponseSchema.extend({
  data: z.array(ProposalSchema).optional(),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

// Analysis Response Schema
export const AnalysisResponseSchema = BaseApiResponseSchema.extend({
  analysis: z.object({
    id: z.string(),
    proposalId: z.string(),
    summary: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
    confidence: z.number().min(0).max(1),
    keyFindings: z.array(z.string()),
    recommendations: z.array(z.string()),
    financialImpact: z.object({
      estimatedCost: z.number().optional(),
      roi: z.number().optional(),
      timeframe: z.string().optional(),
    }).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }).optional(),
});

// Feature Toggle Schema
export const FeatureToggleSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
  description: z.string().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  userGroups: z.array(z.string()).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
});

// Feature Toggles Response Schema
export const FeatureTogglesResponseSchema = BaseApiResponseSchema.extend({
  features: z.array(FeatureToggleSchema).optional(),
});

// Asset Update Schema
export const AssetUpdateSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  assetType: z.enum(['equity', 'bond', 'real_estate', 'commodity', 'crypto']),
  value: z.number(),
  change: z.number(),
  changePercentage: z.number(),
  lastUpdated: z.string(),
  source: z.string().optional(),
});

// Asset Updates Response Schema
export const AssetUpdatesResponseSchema = BaseApiResponseSchema.extend({
  data: z.array(AssetUpdateSchema).optional(),
  total: z.number().optional(),
});

// Error Response Schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
});

// Generic Data Response Schema
export const DataResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  BaseApiResponseSchema.extend({
    data: dataSchema.optional(),
  });

// Type exports
export type BaseApiResponse = z.infer<typeof BaseApiResponseSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type Proposal = z.infer<typeof ProposalSchema>;
export type ProposalsResponse = z.infer<typeof ProposalsResponseSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
export type FeatureToggle = z.infer<typeof FeatureToggleSchema>;
export type FeatureTogglesResponse = z.infer<typeof FeatureTogglesResponseSchema>;
export type AssetUpdate = z.infer<typeof AssetUpdateSchema>;
export type AssetUpdatesResponse = z.infer<typeof AssetUpdatesResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;