/**
 * CF1 Backend - Validation Middleware
 * Request validation and sanitization
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validate proposal ID parameter
 */
export const validateProposalId = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    proposalId: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Proposal ID must contain only alphanumeric characters, hyphens, and underscores',
        'string.min': 'Proposal ID must not be empty',
        'string.max': 'Proposal ID must not exceed 100 characters'
      })
  });

  const { error } = schema.validate(req.params);
  
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
      code: 'INVALID_PROPOSAL_ID'
    });
  }

  next();
};

/**
 * Validate webhook payload
 */
export const validateWebhook = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    proposalId: Joi.string().required(),
    status: Joi.string().valid('completed', 'failed').required(),
    analysis: Joi.object({
      proposalId: Joi.string().required(),
      summary: Joi.string().required(),
      potential_strengths: Joi.array().items(Joi.string()).required(),
      areas_for_consideration: Joi.array().items(Joi.string()).required(),
      complexity_score: Joi.number().integer().min(1).max(10).required(),
      processing_time_seconds: Joi.number().min(0).required()
    }).when('status', {
      is: 'completed',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    error: Joi.string().when('status', {
      is: 'failed',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    timestamp: Joi.string().isoDate().required()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
      code: 'INVALID_WEBHOOK_PAYLOAD'
    });
  }

  next();
};

/**
 * General error handler for validation
 */
export const handleValidationError = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      error: 'Only PDF files are supported',
      code: 'INVALID_FILE_TYPE'
    });
  }

  if (error.message.includes('File too large')) {
    return res.status(400).json({
      error: 'File size exceeds 10MB limit',
      code: 'FILE_TOO_LARGE'
    });
  }

  next(error);
};