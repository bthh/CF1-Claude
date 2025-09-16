/**
 * CF1 Backend - Analysis Service
 * Handles proposal analysis workflow and AI service integration
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { ProposalAnalysis, AnalysisStatus } from '../models/ProposalAnalysis';
import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';

// interface _AIAnalysisRequest {
//   proposalId: string;
//   documentFile: Buffer;
//   webhookUrl: string;
// }

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
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
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
      console.log(`🚀 Starting analysis for proposal ${proposalId}, file size: ${documentFile.length} bytes`);
      
      // Update status to in progress
      await this.repository.update(
        { proposalId },
        { status: AnalysisStatus.IN_PROGRESS }
      );

      // Build webhook URL for receiving results
      const webhookUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/ai-analysis/webhook`;
      console.log(`🔗 Webhook URL: ${webhookUrl}`);
      console.log(`🎯 AI Service URL: ${this.aiServiceUrl}`);

      // Create form data for file upload
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', documentFile, {
        filename: `${proposalId}.txt`,
        contentType: 'text/plain'
      });
      formData.append('proposal_id', proposalId);
      formData.append('webhook_url', webhookUrl);

      console.log(`📤 Sending request to AI service...`);

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

      console.log(`📡 AI service response: ${response.status} ${response.statusText}`);
      console.log(`📋 Response data:`, response.data);

      if (response.status !== 202) {
        throw new Error(`AI service responded with status ${response.status}`);
      }

      console.log(`✅ Analysis initiated successfully for proposal ${proposalId}`);

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
   * Handle AI chat message for creators
   */
  async handleChatMessage(message: string, context?: any, conversationId?: string): Promise<{
    response: string;
    conversationId: string;
    timestamp: string;
    context?: any;
  }> {
    try {
      console.log(`💬 Processing chat message: "${message.substring(0, 50)}..."`);
      
      // Use the existing CF1 AI Analyzer service for chat
      const chatResponse = await this.sendChatToAIService(message, context, conversationId);
      
      return {
        response: chatResponse,
        conversationId: conversationId || `chat_${Date.now()}`,
        timestamp: new Date().toISOString(),
        context
      };

    } catch (error) {
      console.error('Chat processing error:', error);
      
      // Fallback to contextual response if AI service fails
      const fallbackResponse = this.generateContextualFallback(message, context);
      
      return {
        response: fallbackResponse,
        conversationId: conversationId || `chat_${Date.now()}`,
        timestamp: new Date().toISOString(),
        context
      };
    }
  }

  /**
   * Generate AI suggestions for asset creators
   */
  async generateSuggestions(assetType: string, context?: any, requestType?: string): Promise<{
    suggestions: string[];
    category: string;
  }> {
    try {
      console.log(`💡 Generating suggestions for ${assetType} (${requestType})`);
      
      // Try to get suggestions from AI service
      const suggestions = await this.getAISuggestions(assetType, context, requestType);
      
      return {
        suggestions,
        category: requestType || 'general'
      };

    } catch (error) {
      console.error('Suggestions generation error:', error);
      
      // Fallback to predefined suggestions
      const fallbackSuggestions = this.getFallbackSuggestions(assetType, requestType);
      
      return {
        suggestions: fallbackSuggestions,
        category: requestType || 'general'
      };
    }
  }

  /**
   * Send chat message to AI service
   */
  private async sendChatToAIService(message: string, context?: any, conversationId?: string): Promise<string> {
    try {
      // Use the dedicated chat endpoint
      const response = await axios.post(
        `${this.aiServiceUrl}/api/v1/chat`,
        {
          message,
          context,
          conversation_id: conversationId || `chat_${Date.now()}`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.aiServiceApiKey}`
          },
          timeout: 15000
        }
      );

      // Extract AI response from the dedicated chat endpoint
      if (response.data && response.data.response) {
        return response.data.response;
      }
      
      throw new Error('Invalid response format from AI service');

    } catch (error) {
      console.error('AI service chat error:', error);
      // Always use our intelligent fallback when AI service fails
      return this.generateIntelligentResponse(message, context);
    }
  }

  /**
   * Generate intelligent response when AI service is unavailable
   */
  private generateIntelligentResponse(message: string, context?: any): string {
    const lowerMessage = message.toLowerCase();
    const assetType = context?.assetType || 'asset';
    
    // Simple factual questions - shorter responses
    if (lowerMessage.includes('minimum investment') || lowerMessage.includes('min investment')) {
      return `The minimum investment on CF1 is typically $100-$1,000 depending on the asset. Check the specific proposal details for exact minimums. This aligns with SEC Reg CF accessibility requirements.`;
    }
    
    if (lowerMessage.includes('maximum') && (lowerMessage.includes('raise') || lowerMessage.includes('funding'))) {
      return `Under SEC Regulation CF, you can raise up to $5 million in a 12-month period. This limit applies across all crowdfunding platforms combined.`;
    }
    
    if (lowerMessage.includes('how long') || lowerMessage.includes('timeline')) {
      return `Typical funding campaigns run 30-90 days. Proposal review takes 5-10 business days. Token minting occurs after successful funding completion and regulatory waiting periods.`;
    }
    
    // Complex strategic questions - detailed responses
    if (lowerMessage.includes('proposal') || lowerMessage.includes('create')) {
      return `Creating a compelling ${assetType} proposal requires a strategic approach across multiple dimensions:

**Core Documentation Framework:**
1. **Executive Summary** (2-3 pages): Lead with your unique value proposition, highlighting what differentiates your ${assetType} from market alternatives. Include key financials, funding goal, and expected returns.

2. **Financial Projections** (5-year model): Develop conservative, moderate, and optimistic scenarios. Include detailed assumptions, sensitivity analysis, and benchmark comparisons. Investors expect 12-18% IRR minimum for most tokenized assets.

3. **Risk Assessment & Mitigation**: Document operational, market, regulatory, and liquidity risks. For each risk, provide specific mitigation strategies with timelines and responsible parties.

4. **Regulatory Compliance Framework**: Ensure SEC Reg CF compliance including audited financials (if raising >$1.07M), ongoing reporting obligations, and investor disclosure requirements.

**Asset-Specific Considerations for ${assetType}:**
${this.getAssetSpecificGuidance(assetType)}

**Implementation Timeline:**
- Week 1-2: Complete documentation and legal review
- Week 3: Platform submission and initial review
- Week 4-5: Address regulatory feedback and finalize listing
- Weeks 6-12: Active funding period with investor engagement

Would you like me to dive deeper into any specific aspect of the proposal development process?`;
    }
    
    // Simple funding questions
    if ((lowerMessage.includes('how much') || lowerMessage.includes('funding goal')) && !lowerMessage.includes('strategy')) {
      return `Set your funding goal based on: (1) Asset acquisition/development costs, (2) Operating capital needs, (3) Platform fees (2.5%), and (4) 10-20% contingency. Most successful campaigns raise $500K-$3M. Avoid over-raising as it dilutes returns.`;
    }
    
    // Complex funding strategy questions
    if (lowerMessage.includes('funding') || lowerMessage.includes('invest') || lowerMessage.includes('money')) {
      return `Developing an effective funding strategy for your ${assetType} requires careful consideration across multiple factors:

**Funding Structure & Goals:**
- Calculate precise capital requirements: acquisition costs + development/improvement capital + operating reserves + platform fees (2.5%) + 15% contingency
- Consider phased funding approach for larger projects (initial raise for acquisition, follow-on for improvements)
- Structure pricing to target 12-18% IRR for investors while maintaining operational flexibility

**Investor Targeting & Marketing:**
- Identify your ideal investor profile: individual vs. institutional, risk tolerance, investment size preferences
- Develop compelling investment thesis highlighting unique value drivers and competitive advantages
- Create professional marketing materials: executive summary, financial projections, virtual property tours (for real estate), technical specifications

**Regulatory & Legal Framework:**
- Ensure SEC Reg CF compliance with proper disclosures and ongoing reporting commitments
- Structure legal ownership through SPV (Special Purpose Vehicle) for asset protection and clear investor rights
- Implement proper token mechanics with clear utility and governance rights

**Use of Funds Transparency:**
${this.getUseOfFundsGuidance(assetType)}

**Investor Relations Strategy:**
- Establish quarterly reporting schedule with financial and operational updates
- Implement investor portal for document access and communication
- Plan distribution strategy and timing for investor returns

Would you like me to elaborate on any specific aspect of the funding strategy?`;
    }
    
    // Compliance and legal questions
    if (lowerMessage.includes('complian') || lowerMessage.includes('legal') || lowerMessage.includes('regulat')) {
      return `For regulatory compliance with your ${assetType}:

**Key Requirements:**
- SEC Regulation CF disclosure requirements
- Annual and ongoing reporting obligations
- Investor communication standards
- Financial record keeping

**Best Practices:**
- Maintain transparent communication with investors
- Document all material changes to the asset
- Provide timely financial updates
- Keep detailed records of all transactions

Would you like specific guidance on any compliance requirement?`;
    }
    
    // Performance and optimization
    if (lowerMessage.includes('perform') || lowerMessage.includes('optim') || lowerMessage.includes('improve')) {
      return `To optimize your ${assetType} performance:

**Operational Excellence:**
- Regular performance monitoring and reporting
- Proactive maintenance and management
- Cost optimization strategies
- Revenue enhancement opportunities

**Investor Relations:**
- Consistent communication schedules
- Transparent performance reporting
- Quick response to investor inquiries
- Regular strategy updates

The CF1 platform provides tools to help track and improve asset performance.`;
    }
    
    // Market and competitive analysis
    if (lowerMessage.includes('market') || lowerMessage.includes('compet') || lowerMessage.includes('analysis')) {
      return `For ${assetType} market analysis:

**Market Research:**
- Industry trends and growth projections
- Competitive landscape analysis
- Regulatory environment assessment
- Investor demand evaluation

**Strategic Positioning:**
- Unique value proposition development
- Competitive advantages identification
- Market timing considerations
- Pricing strategy optimization

Consider conducting thorough market research to strengthen your investment proposition.`;
    }
    
    // General financial questions
    if (lowerMessage.includes('financ') || lowerMessage.includes('revenue') || lowerMessage.includes('profit')) {
      return `For ${assetType} financial management:

**Financial Planning:**
- Detailed revenue projections
- Comprehensive expense modeling
- Cash flow management
- ROI calculations and tracking

**Reporting Standards:**
- Regular financial statements
- Performance metrics tracking
- Variance analysis and explanations
- Forward-looking guidance

Maintain accurate financial records and provide regular updates to investors through the CF1 platform.`;
    }
    
    // Default contextual response
    return `Thank you for your question about "${message}". 

For ${assetType} management on the CF1 platform, I recommend focusing on:

• **Transparency**: Keep investors informed with regular updates
• **Compliance**: Ensure all regulatory requirements are met
• **Performance**: Monitor key metrics and optimize operations
• **Communication**: Maintain professional investor relations

Could you provide more specific details about what aspect you'd like help with? I can offer more targeted guidance based on your particular situation.`;
  }

  /**
   * Get asset-specific guidance for proposal creation
   */
  private getAssetSpecificGuidance(assetType: string): string {
    const lowerAssetType = assetType.toLowerCase();
    
    if (lowerAssetType.includes('real estate') || lowerAssetType.includes('property')) {
      return `- Property appraisals from certified appraisers (required within 90 days)
- Market analysis showing comparable sales and rental yields
- Property management agreements and operating history
- Environmental assessments and property condition reports
- Title insurance and legal documentation
- Location analysis including demographic and economic trends`;
    }
    
    if (lowerAssetType.includes('renewable') || lowerAssetType.includes('solar') || lowerAssetType.includes('wind')) {
      return `- Engineering studies and feasibility analysis
- Power Purchase Agreements (PPAs) or off-take contracts
- Environmental impact assessments and permits
- Equipment warranties and performance guarantees
- Grid interconnection agreements and utility approvals
- Federal/state tax incentive eligibility documentation`;
    }
    
    if (lowerAssetType.includes('technology') || lowerAssetType.includes('tech')) {
      return `- Intellectual property portfolio and patent documentation
- Market traction metrics and user adoption data
- Technical architecture and scalability documentation
- Competitive analysis and differentiation strategy
- Revenue model validation and customer acquisition costs
- Development roadmap and technical milestones`;
    }
    
    return `- Market analysis and competitive positioning
- Operational history and performance metrics
- Asset valuation from qualified professionals
- Regulatory compliance documentation
- Management team experience and track record
- Clear monetization strategy and revenue projections`;
  }

  /**
   * Get use of funds guidance based on asset type
   */
  private getUseOfFundsGuidance(assetType: string): string {
    const lowerAssetType = assetType.toLowerCase();
    
    if (lowerAssetType.includes('real estate') || lowerAssetType.includes('property')) {
      return `- Property acquisition (70-80% of funds)
- Renovation/improvement capital (10-15%)
- Working capital and reserves (5-10%)
- Legal, due diligence, and platform fees (3-5%)
- Provide detailed breakdown of renovation scope and expected value creation`;
    }
    
    if (lowerAssetType.includes('renewable') || lowerAssetType.includes('solar') || lowerAssetType.includes('wind')) {
      return `- Equipment procurement and installation (75-85%)
- Grid connection and infrastructure (5-10%)
- Permitting, legal, and development costs (5-8%)
- Working capital and contingency (5-10%)
- Detail expected capacity, energy output, and revenue projections`;
    }
    
    if (lowerAssetType.includes('technology') || lowerAssetType.includes('tech')) {
      return `- Product development and R&D (40-60%)
- Marketing and customer acquisition (20-30%)
- Team expansion and operations (15-25%)
- Legal, IP protection, and compliance (5-10%)
- Provide development milestones and user acquisition targets`;
    }
    
    return `- Asset acquisition/development (60-80%)
- Operational improvements and optimization (10-20%)
- Working capital and reserves (5-15%)
- Legal, regulatory, and platform costs (5-10%)
- Include specific timelines and success metrics for each category`;
  }

  /**
   * Generate contextual fallback response
   */
  private generateContextualFallback(message: string, context?: any): string {
    const lowerMessage = message.toLowerCase();
    
    // Asset creation help
    if (lowerMessage.includes('create') || lowerMessage.includes('proposal')) {
      return "I can help you create compelling asset proposals. Key elements include: clear value proposition, realistic financial projections, transparent risk assessment, and regulatory compliance. Would you like specific guidance on any of these areas?";
    }
    
    // Compliance questions
    if (lowerMessage.includes('complian') || lowerMessage.includes('legal') || lowerMessage.includes('regulat')) {
      return "For regulatory compliance, ensure you: 1) Clearly disclose all risks, 2) Provide accurate financial projections, 3) Follow SEC Regulation CF guidelines, 4) Maintain transparent investor communications. Would you like details about any specific compliance requirement?";
    }
    
    // Investor relations
    if (lowerMessage.includes('investor') || lowerMessage.includes('communication')) {
      return "Effective investor relations include: regular updates on asset performance, transparent communication about challenges and opportunities, timely distribution of returns, and responsive support. What specific aspect of investor relations would you like help with?";
    }
    
    // Marketing and promotion
    if (lowerMessage.includes('market') || lowerMessage.includes('promot') || lowerMessage.includes('advertis')) {
      return "When marketing your asset: focus on the unique value proposition, highlight your team's expertise, provide clear financial projections, and ensure all marketing materials comply with securities regulations. Remember, no general solicitation for Regulation D offerings.";
    }
    
    // Default contextual response
    const assetType = context?.assetType || 'asset';
    return `I understand you're asking about "${message}" for your ${assetType}. Based on best practices for asset tokenization, I recommend focusing on transparency, compliance, and clear communication with stakeholders. Could you be more specific about what aspect you'd like help with?`;
  }

  /**
   * Get AI suggestions from service
   */
  private async getAISuggestions(_assetType: string, _context?: any, _requestType?: string): Promise<string[]> {
    // This would call the AI service for suggestions
    // For now, return smart fallbacks
    throw new Error('AI suggestions service not implemented yet');
  }

  /**
   * Get fallback suggestions based on asset type and request type
   */
  private getFallbackSuggestions(assetType: string, _requestType?: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      'real_estate': [
        'Provide detailed property appraisals and market analysis',
        'Include clear photos and virtual tours of the property',
        'Highlight location advantages and growth potential',
        'Show comparable sales and rental income data',
        'Detail maintenance and management plans'
      ],
      'renewable_energy': [
        'Include engineering reports and feasibility studies',
        'Provide power purchase agreements (PPAs) if available',
        'Show energy production projections and environmental impact',
        'Detail maintenance schedules and warranty coverage',
        'Highlight government incentives and tax benefits'
      ],
      'technology': [
        'Demonstrate market traction and user adoption',
        'Provide technical architecture and security measures',
        'Show intellectual property portfolio and patents',
        'Include competitive analysis and differentiation',
        'Detail scalability plans and growth strategy'
      ],
      'default': [
        'Provide transparent and realistic financial projections',
        'Include detailed risk assessment and mitigation strategies',
        'Show clear use of funds and milestone timeline',
        'Highlight management team experience and track record',
        'Ensure all regulatory compliance requirements are met'
      ]
    };

    const assetKey = assetType.toLowerCase().replace(/\s+/g, '_');
    return suggestions[assetKey] || suggestions['default'];
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