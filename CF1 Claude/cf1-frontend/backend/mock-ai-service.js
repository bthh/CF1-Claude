#!/usr/bin/env node

/**
 * Mock AI Service for CF1 Integration Testing
 * Simulates the CF1 AI Analyzer microservice for testing purposes
 */

const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const port = 8000;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

app.use(express.json());

// Mock AI analysis results
const mockAnalyses = [
  {
    summary: "This proposal presents a well-structured real estate investment opportunity with clear market positioning and realistic financial projections.",
    potential_strengths: [
      "Strong market demand in the target location",
      "Experienced management team with proven track record",
      "Conservative financial projections with built-in safety margins",
      "Clear exit strategy and liquidity provisions"
    ],
    areas_for_consideration: [
      "Market volatility could impact property values",
      "Regulatory changes may affect real estate investment regulations",
      "Interest rate fluctuations could impact financing costs",
      "Local economic conditions may affect rental demand"
    ],
    complexity_score: 7,
    processing_time_seconds: 15.3
  },
  {
    summary: "The proposal outlines an innovative technology venture with significant growth potential, though it carries higher risk due to market uncertainty.",
    potential_strengths: [
      "Innovative technology with competitive advantages",
      "Large addressable market with growth potential",
      "Strong intellectual property portfolio",
      "Experienced technical team"
    ],
    areas_for_consideration: [
      "High competition in the technology sector",
      "Regulatory uncertainty for emerging technologies",
      "Significant capital requirements for scaling",
      "Technology adoption risks and market timing"
    ],
    complexity_score: 9,
    processing_time_seconds: 22.7
  }
];

/**
 * POST /api/v1/analyze-proposal-async
 * Simulate async AI analysis
 */
app.post('/api/v1/analyze-proposal-async', upload.single('file'), async (req, res) => {
  try {
    const { proposal_id, webhook_url } = req.body;
    
    if (!req.file || !proposal_id || !webhook_url) {
      return res.status(400).json({
        error: 'Missing required fields: file, proposal_id, webhook_url'
      });
    }

    console.log(`🔄 Mock AI: Starting analysis for proposal ${proposal_id}`);
    console.log(`📄 Document size: ${req.file.size} bytes`);
    console.log(`🔗 Webhook URL: ${webhook_url}`);

    // Respond immediately to indicate analysis started
    res.status(202).json({
      message: 'Analysis initiated',
      proposal_id,
      estimated_completion: '15-30 seconds'
    });

    // Simulate processing delay (5-10 seconds)
    const processingTime = Math.random() * 5000 + 5000;
    
    setTimeout(async () => {
      try {
        // Select a random mock analysis
        const mockAnalysis = mockAnalyses[Math.floor(Math.random() * mockAnalyses.length)];
        
        // Prepare webhook payload
        const webhookPayload = {
          proposalId: proposal_id,
          status: 'completed',
          analysis: {
            proposalId: proposal_id,
            ...mockAnalysis
          },
          timestamp: new Date().toISOString()
        };

        // Generate webhook signature
        const webhookSecret = 'dev-webhook-secret';
        const signature = crypto
          .createHmac('sha256', webhookSecret)
          .update(JSON.stringify(webhookPayload))
          .digest('hex');

        // Send webhook to CF1 backend
        console.log(`🎯 Mock AI: Sending webhook for proposal ${proposal_id}`);
        
        const webhookResponse = await axios.post(webhook_url, webhookPayload, {
          headers: {
            'Content-Type': 'application/json',
            'X-CF1-Signature': signature
          },
          timeout: 10000
        });

        if (webhookResponse.status === 200) {
          console.log(`✅ Mock AI: Webhook delivered successfully for proposal ${proposal_id}`);
        } else {
          console.log(`⚠️ Mock AI: Webhook responded with status ${webhookResponse.status}`);
        }

      } catch (webhookError) {
        console.error(`❌ Mock AI: Failed to deliver webhook for proposal ${proposal_id}:`, webhookError.message);
        
        // Send failure webhook
        const failurePayload = {
          proposalId: proposal_id,
          status: 'failed',
          error: 'Internal processing error',
          timestamp: new Date().toISOString()
        };

        try {
          await axios.post(webhook_url, failurePayload, {
            headers: {
              'Content-Type': 'application/json',
              'X-CF1-Signature': 'dev-webhook-secret'
            },
            timeout: 5000
          });
        } catch (failureWebhookError) {
          console.error('❌ Mock AI: Failed to send failure webhook:', failureWebhookError.message);
        }
      }
    }, processingTime);

  } catch (error) {
    console.error('❌ Mock AI: Analysis initiation error:', error);
    res.status(500).json({
      error: 'Failed to initiate analysis',
      details: error.message
    });
  }
});

/**
 * GET /api/v1/health
 * Health check endpoint
 */
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CF1 Mock AI Analyzer',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`🧠 Mock CF1 AI Analyzer Service running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/v1/health`);
  console.log(`🔍 Analysis endpoint: http://localhost:${port}/api/v1/analyze-proposal-async`);
  console.log(`📝 Mock analyses available: ${mockAnalyses.length}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Mock AI Service shutting down gracefully...');
  process.exit(0);
});