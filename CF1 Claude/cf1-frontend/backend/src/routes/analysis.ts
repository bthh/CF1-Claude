/**
 * CF1 Backend - Analysis Routes
 * API endpoints for AI proposal analysis
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { AnalysisService } from '../services/AnalysisService';
import { validateProposalId, validateWebhook } from '../middleware/validation';
import rateLimit from 'express-rate-limit';

const router = Router();
const analysisService = new AnalysisService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF files and text files for testing
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported'));
    }
  }
});

// Rate limiting
const analysisRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many analysis requests, please try again later'
});

/**
 * POST /api/v1/ai-analysis/proposals/:proposalId/analyze
 * Initiate AI analysis for a proposal document
 */
router.post('/proposals/:proposalId/analyze', 
  analysisRateLimit,
  validateProposalId,
  upload.single('document'),
  async (req: Request, res: Response) => {
    try {
      const { proposalId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          error: 'PDF document is required',
          code: 'MISSING_DOCUMENT'
        });
      }

      // Check file size
      if (req.file.size === 0) {
        return res.status(400).json({
          error: 'Empty file provided',
          code: 'EMPTY_FILE'
        });
      }

      // Initiate analysis
      const analysis = await analysisService.initiateAnalysis(
        proposalId,
        req.file.buffer
      );

      res.status(202).json({
        message: 'Analysis initiated',
        proposalId,
        status: analysis.status,
        analysisId: analysis.id
      });

    } catch (error) {
      console.error('Analysis initiation error:', error);
      res.status(500).json({
        error: 'Failed to initiate analysis',
        code: 'ANALYSIS_INITIATION_FAILED'
      });
    }
  }
);

/**
 * GET /api/v1/ai-analysis/proposals/:proposalId/results
 * Get AI analysis results for a proposal
 */
router.get('/proposals/:proposalId/results',
  validateProposalId,
  async (req: Request, res: Response) => {
    try {
      const { proposalId } = req.params;
      
      const analysis = await analysisService.getAnalysis(proposalId);
      
      if (!analysis) {
        return res.status(404).json({
          error: 'Analysis not found',
          code: 'ANALYSIS_NOT_FOUND',
          proposalId
        });
      }

      res.json(analysis.toResponse());

    } catch (error) {
      console.error('Analysis retrieval error:', error);
      res.status(500).json({
        error: 'Failed to retrieve analysis',
        code: 'ANALYSIS_RETRIEVAL_FAILED'
      });
    }
  }
);

/**
 * POST /api/v1/ai-analysis/webhook
 * Webhook endpoint for receiving AI analysis results
 */
router.post('/webhook',
  validateWebhook,
  async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-cf1-signature'] as string;
      
      if (!signature) {
        return res.status(401).json({
          error: 'Missing signature',
          code: 'MISSING_SIGNATURE'
        });
      }

      await analysisService.handleWebhook(req.body, signature);
      
      res.status(200).json({ received: true });

    } catch (error) {
      console.error('Webhook processing error:', error);
      
      if (error instanceof Error && error.message === 'Invalid webhook signature') {
        return res.status(401).json({
          error: 'Invalid signature',
          code: 'INVALID_SIGNATURE'
        });
      }

      res.status(500).json({
        error: 'Webhook processing failed',
        code: 'WEBHOOK_PROCESSING_FAILED'
      });
    }
  }
);

/**
 * GET /api/v1/ai-analysis/stats
 * Get analysis statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await analysisService.getAnalysisStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      code: 'STATS_RETRIEVAL_FAILED'
    });
  }
});

export default router;