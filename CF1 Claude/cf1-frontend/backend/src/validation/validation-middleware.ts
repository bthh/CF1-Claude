/**
 * CF1 Backend - Validation Middleware
 * Express middleware for request validation using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export class RequestValidationError extends Error {
  constructor(
    public errors: ValidationError[],
    public statusCode: number = 400
  ) {
    super('Request validation failed');
    this.name = 'RequestValidationError';
  }
}

/**
 * Convert Zod errors to our validation error format
 */
function formatZodErrors(zodError: z.ZodError): ValidationError[] {
  return zodError.errors.map(error => ({
    field: error.path.join('.'),
    message: error.message,
    code: error.code,
  }));
}

/**
 * Generic validation middleware factory
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const validatedData = schema.parse(data);

      // Attach validated data to request
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'query') {
        req.query = validatedData as any;
      } else {
        req.params = validatedData as any;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = formatZodErrors(error);

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors,
        });
        return;
      }

      // Unexpected error
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Validate request body
 */
export const validateBody = <T>(schema: z.ZodSchema<T>) =>
  validateRequest(schema, 'body');

/**
 * Validate query parameters
 */
export const validateQuery = <T>(schema: z.ZodSchema<T>) =>
  validateRequest(schema, 'query');

/**
 * Validate route parameters
 */
export const validateParams = <T>(schema: z.ZodSchema<T>) =>
  validateRequest(schema, 'params');

/**
 * Safe validation that doesn't throw errors
 */
export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: formatZodErrors(error) };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Unknown validation error', code: 'unknown' }],
    };
  }
}

/**
 * Validation middleware for file uploads
 */
export function validateFileUpload(
  allowedTypes: string[],
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'File is required',
        code: 'FILE_REQUIRED',
      });
    }

    // Check file type
    if (!allowedTypes.includes(req.file!.mimetype)) {
      res.status(400).json({
        success: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        code: 'INVALID_FILE_TYPE',
      });
    }

    // Check file size
    if (req.file!.size > maxSizeBytes) {
      res.status(400).json({
        success: false,
        error: `File size too large. Maximum size: ${maxSizeBytes / (1024 * 1024)}MB`,
        code: 'FILE_TOO_LARGE',
      });
    }

    next();
  };
}

/**
 * Combine multiple validation middlewares
 */
export function validateMultiple(...middlewares: Array<(req: Request, res: Response, next: NextFunction) => void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let index = 0;

    function runNext(): void {
      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index++];
      middleware(req, res, runNext);
    }

    runNext();
  };
}

/**
 * Custom validation for specific business rules
 */
export function validateBusinessRule(
  validator: (req: Request) => boolean | Promise<boolean>,
  errorMessage: string,
  errorCode: string = 'BUSINESS_RULE_VIOLATION'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isValid = await validator(req);

      if (!isValid) {
        res.status(400).json({
          success: false,
          error: errorMessage,
          code: errorCode,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Business rule validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}