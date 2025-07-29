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

// Chat rate limiting
const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 chat messages per minute
  message: 'Too many chat requests, please slow down'
});

/**
 * POST /api/v1/ai-analysis/chat
 * AI chat assistant for asset creators
 */
router.post('/chat', 
  chatRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { message, context, conversationId } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          error: 'Message is required',
          code: 'MISSING_MESSAGE'
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({
          error: 'Message too long (max 1000 characters)',
          code: 'MESSAGE_TOO_LONG'
        });
      }

      const chatResponse = await analysisService.handleChatMessage(message, context, conversationId);
      
      res.json({
        success: true,
        response: chatResponse.response,
        conversationId: chatResponse.conversationId,
        timestamp: chatResponse.timestamp,
        context: chatResponse.context
      });

    } catch (error) {
      console.error('Chat processing error:', error);
      res.status(500).json({
        error: 'Failed to process chat message',
        code: 'CHAT_PROCESSING_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/v1/ai-analysis/chat/suggestions
 * Get AI suggestions for asset creators
 */
router.post('/chat/suggestions',
  chatRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { assetType, context, requestType } = req.body;

      if (!assetType || typeof assetType !== 'string') {
        return res.status(400).json({
          error: 'Asset type is required',
          code: 'MISSING_ASSET_TYPE'
        });
      }

      const suggestions = await analysisService.generateSuggestions(assetType, context, requestType);
      
      res.json({
        success: true,
        suggestions,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Suggestions generation error:', error);
      res.status(500).json({
        error: 'Failed to generate suggestions',
        code: 'SUGGESTIONS_GENERATION_FAILED'
      });
    }
  }
);

export default router;