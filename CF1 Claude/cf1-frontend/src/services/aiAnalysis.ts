/**
 * CF1 Frontend - AI Analysis Service
 * Integration with CF1 Backend for AI proposal analysis
 */

interface AIAnalysisResult {
  proposalId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  summary?: string;
  potentialStrengths?: string[];
  areasForConsideration?: string[];
  complexityScore?: number;
  processingTimeSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

interface AIAnalysisStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  averageComplexity: number;
  averageProcessingTime: number;
}

class AIAnalysisService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  }

  /**
   * Initiate AI analysis for a proposal document
   */
  async initiateAnalysis(proposalId: string, documentFile: File): Promise<{ success: boolean; message: string; analysisId?: string }> {
    try {
      const formData = new FormData();
      formData.append('document', documentFile);

      const response = await fetch(`${this.baseUrl}/api/v1/ai-analysis/proposals/${proposalId}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Analysis failed with status ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message,
        analysisId: result.analysisId
      };

    } catch (error) {
      console.error('Failed to initiate AI analysis:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to initiate analysis'
      };
    }
  }

  /**
   * Get AI analysis results for a proposal
   */
  async getAnalysis(proposalId: string): Promise<AIAnalysisResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ai-analysis/proposals/${proposalId}/results`);

      if (response.status === 404) {
        return null; // Analysis not found
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch analysis: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Failed to fetch AI analysis:', error);
      return null;
    }
  }

  /**
   * Get AI analysis statistics
   */
  async getAnalysisStats(): Promise<AIAnalysisStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ai-analysis/stats`);

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Failed to fetch analysis stats:', error);
      return null;
    }
  }

  /**
   * Poll for analysis completion
   */
  async pollForCompletion(
    proposalId: string, 
    onUpdate?: (analysis: AIAnalysisResult) => void,
    maxAttempts: number = 30,
    intervalMs: number = 5000
  ): Promise<AIAnalysisResult | null> {
    let attempts = 0;

    return new Promise((resolve) => {
      const poll = async () => {
        attempts++;
        
        const analysis = await this.getAnalysis(proposalId);
        
        if (analysis) {
          onUpdate?.(analysis);
          
          // Check if analysis is complete or failed
          if (analysis.status === 'completed' || analysis.status === 'failed') {
            resolve(analysis);
            return;
          }
        }

        // Continue polling if not complete and under max attempts
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs);
        } else {
          resolve(null); // Timeout
        }
      };

      poll();
    });
  }

  /**
   * Check if a document type is suitable for AI analysis
   */
  isSuitableForAnalysis(file: File): boolean {
    // Check file type
    if (file.type !== 'application/pdf') {
      return false;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return false;
    }

    return true;
  }

  /**
   * Get analysis readiness score based on uploaded documents
   */
  getAnalysisReadiness(documents: {
    businessPlan?: File | null;
    financialProjections?: File | null;
    legalDocuments?: File | null;
    assetValuation?: File | null;
  }): {
    score: number;
    maxScore: number;
    recommendations: string[];
    bestDocument?: File;
  } {
    const recommendations: string[] = [];
    let score = 0;
    const maxScore = 4;
    let bestDocument: File | undefined;

    // Business Plan (highest priority for analysis)
    if (documents.businessPlan && this.isSuitableForAnalysis(documents.businessPlan)) {
      score += 1;
      bestDocument = bestDocument || documents.businessPlan;
    } else if (!documents.businessPlan) {
      recommendations.push('Upload a business plan for comprehensive analysis');
    }

    // Financial Projections (second priority)
    if (documents.financialProjections && this.isSuitableForAnalysis(documents.financialProjections)) {
      score += 1;
      bestDocument = bestDocument || documents.financialProjections;
    } else if (!documents.financialProjections) {
      recommendations.push('Include financial projections for better risk assessment');
    }

    // Asset Valuation (third priority)
    if (documents.assetValuation && this.isSuitableForAnalysis(documents.assetValuation)) {
      score += 1;
      bestDocument = bestDocument || documents.assetValuation;
    } else if (!documents.assetValuation) {
      recommendations.push('Add asset valuation for market analysis insights');
    }

    // Legal Documents (fourth priority)
    if (documents.legalDocuments && this.isSuitableForAnalysis(documents.legalDocuments)) {
      score += 1;
      bestDocument = bestDocument || documents.legalDocuments;
    } else if (!documents.legalDocuments) {
      recommendations.push('Upload legal documents for compliance review');
    }

    return {
      score,
      maxScore,
      recommendations,
      bestDocument
    };
  }
}

export const aiAnalysisService = new AIAnalysisService();
export type { AIAnalysisResult, AIAnalysisStats };