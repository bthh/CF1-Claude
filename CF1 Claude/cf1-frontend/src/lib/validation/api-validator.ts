/**
 * CF1 Frontend - API Response Validator
 * Utilities for runtime validation of API responses with Zod
 */

import { z } from 'zod';
import {
  BaseApiResponseSchema,
  ErrorResponseSchema,
  AuthResponseSchema,
  ProposalsResponseSchema,
  AnalysisResponseSchema,
  FeatureTogglesResponseSchema,
  AssetUpdatesResponseSchema
} from './api-schemas';

export class ApiValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: z.ZodError,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

/**
 * Generic API response validator
 */
export function validateApiResponse<T>(
  schema: z.ZodSchema<T>,
  response: unknown,
  context?: string
): T {
  try {
    return schema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const contextMsg = context ? ` (${context})` : '';
      console.error(`API Response Validation Error${contextMsg}:`, {
        errors: error.errors,
        response,
      });

      throw new ApiValidationError(
        `Invalid API response format${contextMsg}`,
        error,
        response
      );
    }
    throw error;
  }
}

/**
 * Safe API response validator that returns a result object
 */
export function safeValidateApiResponse<T>(
  schema: z.ZodSchema<T>,
  response: unknown,
  context?: string
): { success: true; data: T } | { success: false; error: string; details?: z.ZodError } {
  try {
    const data = schema.parse(response);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const contextMsg = context ? ` (${context})` : '';
      console.warn(`API Response Validation Warning${contextMsg}:`, {
        errors: error.errors,
        response,
      });

      return {
        success: false,
        error: `Invalid API response format${contextMsg}`,
        details: error
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

/**
 * Specific validators for common API endpoints
 */
export const ApiValidators = {
  auth: (response: unknown) => validateApiResponse(AuthResponseSchema, response, 'auth'),

  proposals: (response: unknown) => validateApiResponse(ProposalsResponseSchema, response, 'proposals'),

  analysis: (response: unknown) => validateApiResponse(AnalysisResponseSchema, response, 'analysis'),

  featureToggles: (response: unknown) => validateApiResponse(FeatureTogglesResponseSchema, response, 'feature-toggles'),

  assetUpdates: (response: unknown) => validateApiResponse(AssetUpdatesResponseSchema, response, 'asset-updates'),

  baseResponse: (response: unknown) => validateApiResponse(BaseApiResponseSchema, response, 'base'),

  errorResponse: (response: unknown) => validateApiResponse(ErrorResponseSchema, response, 'error'),
};

/**
 * Safe validators for common API endpoints
 */
export const SafeApiValidators = {
  auth: (response: unknown) => safeValidateApiResponse(AuthResponseSchema, response, 'auth'),

  proposals: (response: unknown) => safeValidateApiResponse(ProposalsResponseSchema, response, 'proposals'),

  analysis: (response: unknown) => safeValidateApiResponse(AnalysisResponseSchema, response, 'analysis'),

  featureToggles: (response: unknown) => safeValidateApiResponse(FeatureTogglesResponseSchema, response, 'feature-toggles'),

  assetUpdates: (response: unknown) => safeValidateApiResponse(AssetUpdatesResponseSchema, response, 'asset-updates'),

  baseResponse: (response: unknown) => safeValidateApiResponse(BaseApiResponseSchema, response, 'base'),

  errorResponse: (response: unknown) => safeValidateApiResponse(ErrorResponseSchema, response, 'error'),
};

/**
 * Middleware for fetch requests that automatically validates responses
 */
export function createValidatedFetch<T>(schema: z.ZodSchema<T>, context?: string) {
  return async (url: string | URL | Request, init?: RequestInit): Promise<T> => {
    const response = await fetch(url, init);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return validateApiResponse(schema, data, context);
  };
}

/**
 * Type-safe fetch wrapper with validation
 */
export async function fetchWithValidation<T>(
  url: string | URL | Request,
  schema: z.ZodSchema<T>,
  init?: RequestInit,
  context?: string
): Promise<T> {
  try {
    const response = await fetch(url, init);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return validateApiResponse(schema, data, context);
  } catch (error) {
    console.error('Validated fetch error:', error);
    throw error;
  }
}