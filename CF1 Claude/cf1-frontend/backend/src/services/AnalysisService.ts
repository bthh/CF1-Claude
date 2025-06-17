/**
 * CF1 Backend - Analysis Service
 * Handles proposal analysis workflow and AI service integration
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { ProposalAnalysis, AnalysisStatus } from '../models/ProposalAnalysis';
import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';

interface AIAnalysisRequest {
  proposalId: string;
  documentFile: Buffer;
  webhookUrl: string;
}

interface AIAnalysisResponse {
  proposalId: string;
  summary: string;
  potential_strengths: string[];
  areas_for_consideration: string[];
  complexity_score: number;
  processing_time_seconds: number;
}

interface WebhookPayload {
  proposalId: string;
  status: 'completed' | 'failed';
  analysis?: AIAnalysisResponse;
  error?: string;
  timestamp: string;
}

export class AnalysisService {
  private repository: Repository<ProposalAnalysis>;
  private aiServiceUrl: string;
  private aiServiceApiKey: string;
  private webhookSecret: string;

  constructor() {
    this.repository = AppDataSource.getRepository(ProposalAnalysis);
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    this.aiServiceApiKey = process.env.AI_SERVICE_API_KEY || 'dev-api-key';
    this.webhookSecret = process.env.WEBHOOK_SECRET || 'dev-webhook-secret';
  }

  /**
   * Initiate analysis for a proposal document
   */
  async initiateAnalysis(proposalId: string, documentFile: Buffer): Promise<ProposalAnalysis> {
    try {
      // Calculate document hash for deduplication
      const documentHash = crypto.createHash('sha256').update(documentFile).digest('hex');

      // Check if analysis already exists
      let analysis = await this.repository.findOne({ 
        where: { proposalId } 
      });

      if (analysis) {
        // If analysis exists and is complete, return it
        if (analysis.isComplete()) {
          return analysis;
        }
        
        // If analysis is in progress, return current status
        if (analysis.isProcessing()) {
          return analysis;
        }
        
        // If analysis failed or we have a new document, restart
        analysis.status = AnalysisStatus.PENDING;
        analysis.documentHash = documentHash;
        analysis.errorMessage = null;
      } else {
        // Create new analysis record
        analysis = this.repository.create({
          proposalId,
          status: AnalysisStatus.PENDING,
          documentHash
        });
      }

      await this.repository.save(analysis);

      // Send document to AI service asynchronously
      this.processAnalysisAsync(proposalId, documentFile);

      return analysis;

    } catch (error) {
      console.error(`Failed to initiate analysis for proposal ${proposalId}:`, error);
      throw new Error('Failed to initiate analysis');
    }
  }

  /**
   * Get analysis results for a proposal
   */
  async getAnalysis(proposalId: string): Promise<ProposalAnalysis | null> {
    return this.repository.findOne({ 
      where: { proposalId } 
    });
  }

  /**
   * Handle webhook from AI service
   */
  async handleWebhook(payload: WebhookPayload, signature: string): Promise<void> {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    const { proposalId, status, analysis, error } = payload;

    const existingAnalysis = await this.repository.findOne({ 
      where: { proposalId } 
    });

    if (!existingAnalysis) {
      console.error(`Received webhook for unknown proposal: ${proposalId}`);
      return;
    }

    if (status === 'completed' && analysis) {
      // Update analysis with results
      existingAnalysis.status = AnalysisStatus.COMPLETED;
      existingAnalysis.summary = analysis.summary;
      existingAnalysis.potentialStrengths = analysis.potential_strengths;
      existingAnalysis.areasForConsideration = analysis.areas_for_consideration;
      existingAnalysis.complexityScore = analysis.complexity_score;
      existingAnalysis.processingTimeSeconds = analysis.processing_time_seconds;
      existingAnalysis.errorMessage = null;

    } else if (status === 'failed') {
      // Update analysis with error
      existingAnalysis.status = AnalysisStatus.FAILED;
      existingAnalysis.errorMessage = error || 'Analysis failed';
    }

    await this.repository.save(existingAnalysis);

    console.log(`Analysis ${status} for proposal ${proposalId}`);
  }

  /**
   * Get analysis statistics
   */
  async getAnalysisStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    failed: number;
    averageComplexity: number;
    averageProcessingTime: number;
  }> {
    const [
      total,
      completed,
      pending,
      failed,
      avgComplexity,
      avgProcessingTime
    ] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { status: AnalysisStatus.COMPLETED } }),
      this.repository.count({ where: { status: AnalysisStatus.PENDING } }),
      this.repository.count({ where: { status: AnalysisStatus.FAILED } }),
      this.repository
        .createQueryBuilder('analysis')
        .select('AVG(analysis.complexityScore)', 'avg')
        .where('analysis.status = :status', { status: AnalysisStatus.COMPLETED })
        .getRawOne(),
      this.repository
        .createQueryBuilder('analysis')
        .select('AVG(analysis.processingTimeSeconds)', 'avg')
        .where('analysis.status = :status', { status: AnalysisStatus.COMPLETED })
        .getRawOne()
    ]);

    return {
      total,
      completed,
      pending,
      failed,
      averageComplexity: parseFloat(avgComplexity?.avg || '0'),
      averageProcessingTime: parseFloat(avgProcessingTime?.avg || '0')
    };
  }

  /**
   * Process analysis asynchronously
   */
  private async processAnalysisAsync(proposalId: string, documentFile: Buffer): Promise<void> {
    try {
      // Update status to in progress
      await this.repository.update(
        { proposalId },
        { status: AnalysisStatus.IN_PROGRESS }
      );

      // Build webhook URL for receiving results
      const webhookUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/ai-analysis/webhook`;

      // Create form data for file upload
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', documentFile, {
        filename: `${proposalId}.pdf`,
        contentType: 'application/pdf'
      });
      formData.append('proposal_id', proposalId);
      formData.append('webhook_url', webhookUrl);

      // Send request to AI service
      const response: AxiosResponse = await axios.post(
        `${this.aiServiceUrl}/api/v1/analyze-proposal-async`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.aiServiceApiKey}`
          },
          timeout: 30000
        }
      );

      if (response.status !== 202) {
        throw new Error(`AI service responded with status ${response.status}`);
      }

      console.log(`Analysis initiated for proposal ${proposalId}`);

    } catch (error) {
      console.error(`Failed to process analysis for proposal ${proposalId}:`, error);
      
      // Update status to failed
      await this.repository.update(
        { proposalId },
        { 
          status: AnalysisStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      );
    }
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: WebhookPayload, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      return signature === this.webhookSecret || signature === expectedSignature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}