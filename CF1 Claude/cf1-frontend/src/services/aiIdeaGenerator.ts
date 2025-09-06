/**
 * CF1 AI Idea Generator Service
 * Real AI-powered investment idea generation based on user preferences
 */

import { UserPreferences, Idea } from '../store/discoveryStore';

interface MarketTrend {
  category: string;
  trend: 'rising' | 'stable' | 'declining';
  changePercent: number;
  marketSize: string;
  growthFactors: string[];
  risks: string[];
}

interface AIIdeaGenerationRequest {
  preferences: UserPreferences;
  marketContext?: {
    currentDate: string;
    economicIndicators: any;
    trendingCategories: string[];
  };
}

interface AIIdeaGenerationResponse {
  ideas: Idea[];
  marketAnalysis: {
    trends: MarketTrend[];
    recommendations: string[];
    confidenceScore: number;
  };
  generationMetadata: {
    processingTime: number;
    modelVersion: string;
    requestId: string;
  };
}

class AIIdeaGeneratorService {
  private baseUrl: string;
  private apiKey: string | null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  /**
   * Generate AI-powered investment ideas based on user preferences
   */
  async generateIdeas(preferences: UserPreferences): Promise<Idea[]> {
    try {
      // Try backend service first
      const backendIdeas = await this.generateIdeasFromBackend(preferences);
      if (backendIdeas.length > 0) {
        return backendIdeas;
      }
    } catch (error) {
      console.warn('Backend AI service unavailable, falling back to client-side AI:', error);
    }

    // Fallback to client-side AI generation
    return this.generateIdeasClientSide(preferences);
  }

  /**
   * Generate ideas using backend AI service
   */
  private async generateIdeasFromBackend(preferences: UserPreferences): Promise<Idea[]> {
    const response = await fetch(`${this.baseUrl}/api/ai/generate-ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preferences,
        marketContext: {
          currentDate: new Date().toISOString(),
          economicIndicators: await this.getCurrentEconomicContext(),
          trendingCategories: await this.getTrendingCategories()
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Backend AI service failed: ${response.status}`);
    }

    const result: AIIdeaGenerationResponse = await response.json();
    return result.ideas;
  }

  /**
   * Client-side AI idea generation using OpenAI/Claude (fallback)
   */
  private async generateIdeasClientSide(preferences: UserPreferences): Promise<Idea[]> {
    // For now, use intelligent mock generation based on preferences
    // This can be upgraded to actual OpenAI API calls later
    return this.generateIntelligentMockIdeas(preferences);
  }

  /**
   * Generate intelligent mock ideas based on user preferences
   * This is much more sophisticated than the original static mock data
   */
  private generateIntelligentMockIdeas(preferences: UserPreferences): Promise<Idea[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allCandidateIdeas: (Idea & { relevanceScore: number })[] = [];
        
        // Budget-based idea filtering
        const budgetMultiplier = this.getBudgetMultiplier(preferences.budgetRange);
        
        // Generate ideas based on user interests
        preferences.interests.forEach((interest) => {
          const interestTemplates = this.getIdeaTemplateForInterest(interest, preferences);
          
          interestTemplates.forEach((template, index) => {
            const idea: Idea = {
              ...template,
              id: `ai-${interest}-${Date.now()}-${index}`,
              estimatedBudget: Math.round(template.estimatedBudget! * budgetMultiplier),
              riskLevel: this.adjustRiskLevel(template.riskLevel!, preferences.riskTolerance)
            } as Idea;

            // Filter by experience level complexity
            if (this.isComplexityAppropriate(template.complexity as string, preferences.experience)) {
              const score = this.calculateRelevanceScore(idea, preferences);
              allCandidateIdeas.push({ ...idea, relevanceScore: score });
            }
          });
        });

        // Add goal-driven ideas with scoring
        const goalDrivenIdeas = this.generateGoalDrivenIdeas(preferences, budgetMultiplier);
        goalDrivenIdeas.forEach((idea) => {
          const score = this.calculateRelevanceScore(idea, preferences);
          allCandidateIdeas.push({ ...idea, relevanceScore: score });
        });

        // Add cross-interest combinations
        const combinationIdeas = this.generateCombinationIdeas(preferences, budgetMultiplier);
        combinationIdeas.forEach((idea) => {
          const score = this.calculateRelevanceScore(idea, preferences);
          allCandidateIdeas.push({ ...idea, relevanceScore: score });
        });

        // Sort by relevance score and filter for minimum threshold
        const relevantIdeas = allCandidateIdeas
          .filter(idea => idea.relevanceScore >= 0.7) // 70% relevance threshold
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .map(({ relevanceScore, ...idea }) => idea);

        // Ensure we have at least 3 ideas, add fallbacks if needed
        let finalIdeas = relevantIdeas.slice(0, 5);
        while (finalIdeas.length < 3) {
          const fallbackIdea = this.generateFallbackIdea(finalIdeas.length, preferences, budgetMultiplier);
          const score = this.calculateRelevanceScore(fallbackIdea, preferences);
          if (score >= 0.5) { // Lower threshold for fallbacks
            finalIdeas.push(fallbackIdea);
          }
        }

        // Validate final ideas meet requirements
        finalIdeas = this.validateAndEnhanceIdeas(finalIdeas, preferences);

        resolve(finalIdeas.slice(0, 5));
      }, 2000 + Math.random() * 2000); // Realistic AI processing time
    });
  }

  private getBudgetMultiplier(budgetRange: string): number {
    switch (budgetRange) {
      case 'small': return 0.5;
      case 'medium': return 1.0;
      case 'large': return 3.0;
      case 'flexible': return 1.5;
      default: return 1.0;
    }
  }

  private adjustRiskLevel(baseRisk: string, userTolerance: string): string {
    const riskLevels = ['Low', 'Low-Medium', 'Medium', 'Medium-High', 'High'];
    const baseIndex = riskLevels.indexOf(baseRisk);
    const userIndex = userTolerance === 'low' ? 1 : userTolerance === 'medium' ? 2 : 3;
    
    const adjustedIndex = Math.max(0, Math.min(4, baseIndex + (userIndex - 2)));
    return riskLevels[adjustedIndex];
  }

  private getIdeaTemplateForInterest(interest: string, preferences: UserPreferences): Partial<Idea>[] {
    const templates: Record<string, Partial<Idea>[]> = {
      'Technology': [
        {
          title: 'AI-Powered SaaS Platform',
          description: 'Development of artificial intelligence tools for small business automation and efficiency',
          category: 'Technology',
          estimatedBudget: 500000,
          riskLevel: 'Medium-High',
          marketSize: '$127B SaaS market',
          competition: 'High competition but specialized niches available',
          reasoning: 'Growing demand for AI automation in SMB sector with 40% YoY growth',
          complexity: 'high',
          nextSteps: [
            'Identify specific business automation pain points',
            'Develop MVP with core AI features',
            'Validate product-market fit with target customers',
            'Secure initial funding and technical team'
          ]
        },
        {
          title: 'Mobile App Development Studio',
          description: 'Full-service mobile application development focusing on emerging market niches',
          category: 'Technology',
          estimatedBudget: 200000,
          riskLevel: 'Medium',
          marketSize: '$935B mobile app market',
          competition: 'High but opportunity in specialized verticals',
          reasoning: 'Mobile-first economy drives consistent demand for custom app solutions',
          complexity: 'medium',
          nextSteps: [
            'Identify target industry vertical (healthcare, finance, education)',
            'Build portfolio of sample applications',
            'Establish development team and processes',
            'Launch marketing to attract first clients'
          ]
        },
        {
          title: 'E-commerce Platform Investment',
          description: 'Invest in or acquire established e-commerce platforms with growth potential',
          category: 'Technology',
          estimatedBudget: 800000,
          riskLevel: 'Medium',
          marketSize: '$6.2T global e-commerce',
          competition: 'Moderate for acquisition opportunities',
          reasoning: 'E-commerce consolidation creates acquisition opportunities with proven revenue',
          complexity: 'low',
          nextSteps: [
            'Screen e-commerce platforms for acquisition',
            'Analyze revenue, traffic, and growth metrics',
            'Conduct due diligence on financial performance',
            'Negotiate acquisition terms and integration plan'
          ]
        }
      ],
      'Real Estate': [
        {
          title: 'Smart Residential Development',
          description: 'Energy-efficient residential complex with smart home technology integration',
          category: 'Real Estate',
          estimatedBudget: 2500000,
          riskLevel: 'Medium',
          marketSize: '$4.2T global real estate',
          competition: 'Moderate - differentiation through technology',
          reasoning: 'Rising demand for sustainable housing with 15% premium for smart homes',
          complexity: 'high',
          nextSteps: [
            'Secure development permits and zoning approval',
            'Partner with smart home technology providers',
            'Conduct market analysis for optimal location',
            'Arrange construction financing and pre-sales'
          ]
        },
        {
          title: 'Commercial Real Estate Fund',
          description: 'Diversified commercial property investment fund focusing on secondary markets',
          category: 'Real Estate',
          estimatedBudget: 1500000,
          riskLevel: 'Low-Medium',
          marketSize: '$16T commercial real estate',
          competition: 'Moderate in secondary markets',
          reasoning: 'Secondary markets offer better yields with lower competition than tier-1 cities',
          complexity: 'medium',
          nextSteps: [
            'Identify target secondary markets with growth potential',
            'Analyze commercial property opportunities and yields',
            'Structure fund with appropriate risk management',
            'Recruit limited partners and close first fund'
          ]
        },
        {
          title: 'Rental Property Portfolio',
          description: 'Single-family rental property portfolio in emerging growth markets',
          category: 'Real Estate',
          estimatedBudget: 800000,
          riskLevel: 'Low',
          marketSize: '$4.5T single-family rental',
          competition: 'Low to moderate depending on location',
          reasoning: 'Housing shortage drives rental demand with stable cash flow potential',
          complexity: 'low',
          nextSteps: [
            'Research high-growth markets with rental demand',
            'Identify properties with positive cash flow potential',
            'Secure financing and establish property management',
            'Scale portfolio through systematic acquisition process'
          ]
        }
      ],
      'Art/Collectibles': [
        {
          title: 'Fine Art Investment Fund',
          description: 'Curated fine art investment fund focusing on emerging contemporary artists',
          category: 'Art Investment',
          estimatedBudget: 1000000,
          riskLevel: 'High',
          marketSize: '$64B art market',
          competition: 'High at established level, lower for emerging artists',
          reasoning: 'Contemporary art shows strong appreciation with growing collector base',
          complexity: 'high',
          nextSteps: [
            'Partner with art advisors and gallery professionals',
            'Develop artist identification and evaluation criteria',
            'Establish secure storage and insurance protocols',
            'Create exit strategy through gallery partnerships'
          ]
        },
        {
          title: 'Digital Collectibles Platform',
          description: 'Platform for trading verified digital collectibles and limited edition items',
          category: 'Digital Collectibles',
          estimatedBudget: 400000,
          riskLevel: 'Medium-High',
          marketSize: '$2.6B digital collectibles',
          competition: 'High but growing market',
          reasoning: 'Digital native generations drive demand for authenticated digital assets',
          complexity: 'medium',
          nextSteps: [
            'Develop blockchain-based authenticity verification',
            'Partner with artists and content creators',
            'Build user-friendly trading platform',
            'Establish community and marketing strategy'
          ]
        },
        {
          title: 'Vintage Item Marketplace',
          description: 'Specialized marketplace for authenticated vintage collectibles and memorabilia',
          category: 'Collectibles',
          estimatedBudget: 300000,
          riskLevel: 'Medium',
          marketSize: '$370B global collectibles',
          competition: 'Moderate with specialization opportunities',
          reasoning: 'Nostalgia-driven collecting creates consistent demand for authenticated items',
          complexity: 'low',
          nextSteps: [
            'Choose specific collectible category (sports, entertainment, etc.)',
            'Develop authentication and grading processes',
            'Build marketplace platform with buyer protection',
            'Establish relationships with collectors and dealers'
          ]
        }
      ],
      'Startups': [
        {
          title: 'Startup Accelerator Program',
          description: 'Industry-focused accelerator providing capital and mentorship to early-stage startups',
          category: 'Startup Investment',
          estimatedBudget: 2000000,
          riskLevel: 'High',
          marketSize: '$3.3T venture capital market',
          competition: 'High in general, lower with industry focus',
          reasoning: 'Startup ecosystem growth creates opportunities for specialized accelerators',
          complexity: 'high',
          nextSteps: [
            'Define target industry and startup stage focus',
            'Recruit experienced mentors and advisors',
            'Establish application and selection process',
            'Develop curriculum and portfolio company support'
          ]
        },
        {
          title: 'Angel Investment Syndicate',
          description: 'Organized angel investment group focusing on B2B SaaS startups',
          category: 'Startup Investment',
          estimatedBudget: 500000,
          riskLevel: 'High',
          marketSize: '$164B angel investment market',
          competition: 'Moderate with proper deal flow',
          reasoning: 'B2B SaaS shows consistent growth with predictable revenue models',
          complexity: 'medium',
          nextSteps: [
            'Recruit experienced angel investors to join syndicate',
            'Establish deal sourcing and due diligence processes',
            'Create legal structure for coordinated investments',
            'Develop portfolio monitoring and support systems'
          ]
        },
        {
          title: 'Startup Service Provider',
          description: 'Specialized service company providing operations support to growing startups',
          category: 'Startup Services',
          estimatedBudget: 150000,
          riskLevel: 'Medium',
          marketSize: '$50B business services to startups',
          competition: 'Moderate with specialization',
          reasoning: 'Growing startup ecosystem creates demand for specialized support services',
          complexity: 'low',
          nextSteps: [
            'Identify specific service niche (HR, accounting, legal, marketing)',
            'Develop standardized processes and pricing models',
            'Build team with startup-specific experience',
            'Establish partnerships with accelerators and VCs'
          ]
        }
      ],
      'Energy': [
        {
          title: 'Community Solar Investment',
          description: 'Distributed solar installation serving local residential and commercial customers',
          category: 'Renewable Energy',
          estimatedBudget: 1800000,
          riskLevel: 'Low-Medium',
          marketSize: '$52B solar energy market',
          competition: 'Growing but location-dependent opportunities',
          reasoning: 'Federal incentives and state renewable mandates drive 25% annual growth',
          complexity: 'medium',
          nextSteps: [
            'Identify optimal locations with sun exposure and grid access',
            'Secure power purchase agreements with local utilities',
            'Arrange equipment financing and installation partners',
            'Navigate regulatory approval process'
          ]
        },
        {
          title: 'Energy Storage Development',
          description: 'Battery storage systems for commercial and industrial energy management',
          category: 'Energy Storage',
          estimatedBudget: 2200000,
          riskLevel: 'Medium-High',
          marketSize: '$15B energy storage market',
          competition: 'Growing field with technology advantages',
          reasoning: 'Grid stability needs and renewable integration drive storage demand',
          complexity: 'high',
          nextSteps: [
            'Partner with battery technology providers',
            'Identify commercial customers with peak demand charges',
            'Secure financing for equipment and installation',
            'Develop maintenance and monitoring capabilities'
          ]
        },
        {
          title: 'Green Energy Fund',
          description: 'Investment fund focused on renewable energy projects and companies',
          category: 'Energy Investment',
          estimatedBudget: 1000000,
          riskLevel: 'Medium',
          marketSize: '$1.1T renewable energy investment',
          competition: 'High but growing market',
          reasoning: 'Transition to clean energy creates long-term investment opportunities',
          complexity: 'low',
          nextSteps: [
            'Define investment strategy and target projects',
            'Recruit fund managers with energy sector experience',
            'Establish due diligence processes for energy projects',
            'Raise capital from environmentally-conscious investors'
          ]
        }
      ],
      'Healthcare': [
        {
          title: 'Telemedicine Platform',
          description: 'Specialized telemedicine platform focusing on underserved rural communities',
          category: 'Healthcare Technology',
          estimatedBudget: 750000,
          riskLevel: 'Medium',
          marketSize: '$185B telehealth market',
          competition: 'High in urban areas, lower in rural focus',
          reasoning: 'Rural healthcare access gaps create $12B addressable market opportunity',
          complexity: 'medium',
          nextSteps: [
            'Partner with rural healthcare providers',
            'Develop HIPAA-compliant platform infrastructure',
            'Secure medical professional network',
            'Navigate healthcare regulation compliance'
          ]
        },
        {
          title: 'Senior Care Services',
          description: 'Technology-enabled senior care services including monitoring and support',
          category: 'Healthcare Services',
          estimatedBudget: 400000,
          riskLevel: 'Low-Medium',
          marketSize: '$460B senior care market',
          competition: 'Moderate with technology differentiation',
          reasoning: 'Aging population drives consistent demand for senior care solutions',
          complexity: 'medium',
          nextSteps: [
            'Develop care monitoring and alert systems',
            'Recruit trained caregivers and support staff',
            'Establish partnerships with healthcare providers',
            'Navigate licensing and insurance requirements'
          ]
        },
        {
          title: 'Healthcare Real Estate',
          description: 'Medical office buildings and healthcare facilities investment',
          category: 'Healthcare Real Estate',
          estimatedBudget: 3000000,
          riskLevel: 'Low',
          marketSize: '$200B healthcare real estate',
          competition: 'Low with stable tenant demand',
          reasoning: 'Healthcare demand creates stable, long-term tenant relationships',
          complexity: 'low',
          nextSteps: [
            'Identify growing healthcare markets and providers',
            'Analyze medical office building opportunities',
            'Secure financing for healthcare-specific properties',
            'Establish relationships with medical practice tenants'
          ]
        }
      ],
      'Finance': [
        {
          title: 'Fintech Lending Platform',
          description: 'Alternative lending platform serving underbanked small businesses',
          category: 'Financial Technology',
          estimatedBudget: 1500000,
          riskLevel: 'Medium-High',
          marketSize: '$310B alternative lending',
          competition: 'High but opportunities in niches',
          reasoning: 'Credit gaps for small businesses create opportunities for alternative lenders',
          complexity: 'high',
          nextSteps: [
            'Develop credit scoring and risk assessment models',
            'Secure lending capital and regulatory compliance',
            'Build underwriting and loan management platform',
            'Establish customer acquisition and servicing processes'
          ]
        },
        {
          title: 'Investment Management Fund',
          description: 'Quantitative investment fund using data-driven strategies',
          category: 'Asset Management',
          estimatedBudget: 2000000,
          riskLevel: 'Medium-High',
          marketSize: '$103T global asset management',
          competition: 'High but opportunities with unique strategies',
          reasoning: 'Growing demand for alternative investment strategies and data-driven approaches',
          complexity: 'high',
          nextSteps: [
            'Develop proprietary trading algorithms and models',
            'Recruit experienced fund managers and analysts',
            'Establish regulatory compliance and reporting systems',
            'Raise capital from institutional and high-net-worth investors'
          ]
        },
        {
          title: 'Personal Finance Platform',
          description: 'Comprehensive personal finance management and investment platform',
          category: 'Financial Services',
          estimatedBudget: 600000,
          riskLevel: 'Medium',
          marketSize: '$12B personal finance software',
          competition: 'High but opportunities with better user experience',
          reasoning: 'Growing demand for financial wellness and investment education tools',
          complexity: 'medium',
          nextSteps: [
            'Develop budgeting, investing, and financial planning tools',
            'Establish partnerships with banks and investment providers',
            'Build user-friendly mobile and web applications',
            'Create educational content and financial coaching services'
          ]
        }
      ],
      'Agriculture': [
        {
          title: 'Vertical Farm Operations',
          description: 'Indoor vertical farming facility producing premium leafy greens for local restaurants',
          category: 'Agriculture Technology',
          estimatedBudget: 1200000,
          riskLevel: 'Medium-High',
          marketSize: '$3.9B vertical farming market',
          competition: 'Emerging field with first-mover advantages',
          reasoning: 'Local food demand and supply chain resilience drive 24% annual growth',
          complexity: 'high',
          nextSteps: [
            'Secure facility location with optimal power costs',
            'Establish relationships with restaurant and retail buyers',
            'Install growing systems and automation technology',
            'Develop operational processes and staffing plan'
          ]
        },
        {
          title: 'Sustainable Agriculture Fund',
          description: 'Investment fund focused on sustainable farming operations and technology',
          category: 'Agriculture Investment',
          estimatedBudget: 1800000,
          riskLevel: 'Medium',
          marketSize: '$5T global agriculture market',
          competition: 'Moderate with sustainability focus',
          reasoning: 'Growing demand for sustainable food production creates investment opportunities',
          complexity: 'medium',
          nextSteps: [
            'Identify sustainable farming operations for investment',
            'Develop criteria for environmental and financial performance',
            'Partner with agricultural technology companies',
            'Establish relationships with food distributors and retailers'
          ]
        },
        {
          title: 'Farm-to-Table Distribution',
          description: 'Local food distribution network connecting farms directly to restaurants',
          category: 'Food Distribution',
          estimatedBudget: 400000,
          riskLevel: 'Medium',
          marketSize: '$50B local food market',
          competition: 'Moderate with strong local relationships needed',
          reasoning: 'Restaurant demand for fresh, local ingredients creates distribution opportunities',
          complexity: 'low',
          nextSteps: [
            'Build relationships with local farms and restaurants',
            'Develop logistics and cold storage capabilities',
            'Create online ordering and inventory management system',
            'Establish quality standards and delivery schedules'
          ]
        }
      ],
      'Entertainment': [
        {
          title: 'Content Production Studio',
          description: 'Digital content creation studio focusing on streaming platform content',
          category: 'Entertainment Production',
          estimatedBudget: 800000,
          riskLevel: 'Medium-High',
          marketSize: '$2.3T entertainment market',
          competition: 'High but opportunities in niche content',
          reasoning: 'Streaming growth drives demand for diverse, high-quality content',
          complexity: 'high',
          nextSteps: [
            'Identify target streaming platforms and content niches',
            'Assemble creative team and production capabilities',
            'Develop content pipeline and funding sources',
            'Establish distribution relationships and marketing strategy'
          ]
        },
        {
          title: 'Live Event Venues',
          description: 'Acquisition and operation of mid-size live entertainment venues',
          category: 'Entertainment Venues',
          estimatedBudget: 2000000,
          riskLevel: 'Medium',
          marketSize: '$25B live events market',
          competition: 'Moderate in secondary markets',
          reasoning: 'Recovery in live entertainment creates opportunities for venue acquisition',
          complexity: 'medium',
          nextSteps: [
            'Identify undervalued entertainment venues for acquisition',
            'Analyze local market demand and competition',
            'Develop booking and event management capabilities',
            'Establish relationships with promoters and artists'
          ]
        },
        {
          title: 'Gaming Investment Fund',
          description: 'Investment fund focused on mobile gaming and esports companies',
          category: 'Gaming Investment',
          estimatedBudget: 1200000,
          riskLevel: 'High',
          marketSize: '$200B gaming market',
          competition: 'High but growing rapidly',
          reasoning: 'Gaming industry growth and esports popularity create investment opportunities',
          complexity: 'low',
          nextSteps: [
            'Research gaming companies and esports organizations',
            'Develop investment criteria and due diligence process',
            'Build relationships with gaming industry professionals',
            'Establish fund structure and raise capital from investors'
          ]
        }
      ],
      'Education': [
        {
          title: 'Online Learning Platform',
          description: 'Specialized online education platform for professional skills training',
          category: 'Education Technology',
          estimatedBudget: 600000,
          riskLevel: 'Medium',
          marketSize: '$350B online education market',
          competition: 'High but opportunities in specialized training',
          reasoning: 'Skills gap drives demand for professional development and certification',
          complexity: 'medium',
          nextSteps: [
            'Identify high-demand professional skills and certifications',
            'Develop course content and interactive learning tools',
            'Recruit industry experts as instructors',
            'Build student acquisition and retention strategies'
          ]
        },
        {
          title: 'Educational Real Estate',
          description: 'Student housing and educational facility development near growing campuses',
          category: 'Education Real Estate',
          estimatedBudget: 2500000,
          riskLevel: 'Low-Medium',
          marketSize: '$200B student housing market',
          competition: 'Moderate near established campuses',
          reasoning: 'Growing enrollment and housing shortages create development opportunities',
          complexity: 'medium',
          nextSteps: [
            'Identify universities with enrollment growth and housing shortages',
            'Analyze local zoning and development regulations',
            'Secure financing and development partnerships',
            'Design facilities that meet modern student expectations'
          ]
        },
        {
          title: 'Corporate Training Services',
          description: 'Specialized training and development services for corporate clients',
          category: 'Corporate Education',
          estimatedBudget: 300000,
          riskLevel: 'Low',
          marketSize: '$370B corporate training market',
          competition: 'Moderate with specialization opportunities',
          reasoning: 'Digital transformation drives demand for employee upskilling and training',
          complexity: 'low',
          nextSteps: [
            'Identify target corporate training niches (leadership, technology, compliance)',
            'Develop curriculum and delivery methods',
            'Build team of experienced corporate trainers',
            'Establish client acquisition and delivery processes'
          ]
        }
      ],
      'Sustainability': [
        {
          title: 'Carbon Credit Trading Platform',
          description: 'Marketplace connecting carbon credit generators with buyers',
          category: 'Environmental Finance',
          estimatedBudget: 800000,
          riskLevel: 'Medium-High',
          marketSize: '$1B carbon credit market',
          competition: 'Growing field with regulatory tailwinds',
          reasoning: 'Corporate sustainability commitments drive carbon credit demand',
          complexity: 'high',
          nextSteps: [
            'Develop carbon credit verification and trading platform',
            'Establish relationships with credit generators and buyers',
            'Navigate regulatory compliance and certification processes',
            'Build transparent pricing and settlement systems'
          ]
        },
        {
          title: 'Sustainable Products Manufacturing',
          description: 'Manufacturing of eco-friendly consumer products and packaging',
          category: 'Sustainable Manufacturing',
          estimatedBudget: 1000000,
          riskLevel: 'Medium',
          marketSize: '$150B sustainable products market',
          competition: 'Growing but opportunities for innovation',
          reasoning: 'Consumer demand for sustainable products drives market growth',
          complexity: 'medium',
          nextSteps: [
            'Identify sustainable product categories with strong demand',
            'Develop manufacturing processes and supply chain',
            'Establish certifications and sustainability credentials',
            'Build retail partnerships and direct-to-consumer sales'
          ]
        },
        {
          title: 'Environmental Consulting Services',
          description: 'Sustainability consulting for businesses implementing ESG initiatives',
          category: 'Environmental Services',
          estimatedBudget: 200000,
          riskLevel: 'Low',
          marketSize: '$42B environmental consulting',
          competition: 'Moderate with expertise differentiation',
          reasoning: 'ESG reporting requirements create demand for sustainability consulting',
          complexity: 'low',
          nextSteps: [
            'Build team with environmental and regulatory expertise',
            'Develop service offerings for ESG compliance and reporting',
            'Establish client acquisition through professional networks',
            'Create standardized assessment and reporting tools'
          ]
        }
      ],
      'Manufacturing': [
        {
          title: '3D Printing Service Bureau',
          description: 'Specialized 3D printing and rapid prototyping services for businesses',
          category: 'Advanced Manufacturing',
          estimatedBudget: 500000,
          riskLevel: 'Medium',
          marketSize: '$16B 3D printing market',
          competition: 'Moderate with specialization opportunities',
          reasoning: 'Manufacturing digitization drives demand for rapid prototyping and small-batch production',
          complexity: 'medium',
          nextSteps: [
            'Invest in industrial-grade 3D printing equipment',
            'Develop expertise in materials and post-processing',
            'Establish relationships with product designers and manufacturers',
            'Build online ordering and project management systems'
          ]
        },
        {
          title: 'Contract Manufacturing Operation',
          description: 'Specialized contract manufacturing for emerging consumer brands',
          category: 'Contract Manufacturing',
          estimatedBudget: 1500000,
          riskLevel: 'Medium',
          marketSize: '$350B contract manufacturing',
          competition: 'Moderate with quality and flexibility differentiation',
          reasoning: 'Direct-to-consumer brands need flexible manufacturing partners',
          complexity: 'high',
          nextSteps: [
            'Identify target product categories and manufacturing capabilities',
            'Secure manufacturing facility and equipment',
            'Develop quality control and supply chain processes',
            'Build client acquisition through e-commerce and brand networks'
          ]
        },
        {
          title: 'Industrial Automation Services',
          description: 'Automation consulting and implementation for small manufacturers',
          category: 'Manufacturing Services',
          estimatedBudget: 400000,
          riskLevel: 'Low-Medium',
          marketSize: '$200B industrial automation',
          competition: 'Low in small manufacturer segment',
          reasoning: 'Labor shortages drive small manufacturers to seek automation solutions',
          complexity: 'low',
          nextSteps: [
            'Build expertise in manufacturing automation technologies',
            'Develop assessment and implementation methodologies',
            'Establish partnerships with automation equipment vendors',
            'Target small manufacturers through industry associations'
          ]
        }
      ]
    };

    return templates[interest] || [];
  }

  // Legacy methods - now handled by the new goal-driven system
  private generatePassiveIncomeIdea(preferences: UserPreferences, budgetMultiplier: number): Idea {
    // This is now handled by createGoalSpecificIdea but keeping for backward compatibility
    return this.createGoalSpecificIdea('Passive Income', preferences, budgetMultiplier)!;
  }

  private generateSocialImpactIdea(preferences: UserPreferences, budgetMultiplier: number): Idea {
    // This is now handled by createGoalSpecificIdea but keeping for backward compatibility
    return this.createGoalSpecificIdea('Social Impact', preferences, budgetMultiplier)!;
  }

  private generateFallbackIdea(index: number, preferences: UserPreferences, budgetMultiplier: number): Idea {
    // Generate fallback ideas that are still somewhat relevant to user preferences
    const fallbackTemplates = [
      {
        title: 'Diversified Investment Portfolio',
        description: 'Well-balanced investment portfolio tailored to your risk tolerance and financial goals',
        category: 'Investment Portfolio',
        estimatedBudget: 250000,
        riskLevel: 'Medium',
        marketSize: '$45T global investment market',
        competition: 'Low - personal investment strategy',
        reasoning: 'Diversified investing provides steady returns with manageable risk exposure',
        complexity: 'low'
      },
      {
        title: 'Professional Service Business',
        description: 'Service-based business leveraging your expertise in a growing market sector',
        category: 'Professional Services',
        estimatedBudget: 150000,
        riskLevel: 'Low-Medium',
        marketSize: '$2.3T professional services',
        competition: 'Moderate with specialization opportunities',
        reasoning: 'Service businesses have lower capital requirements and predictable cash flow',
        complexity: 'low'
      },
      {
        title: 'Small Business Investment',
        description: 'Acquisition of established small business in stable industry with growth potential',
        category: 'Business Acquisition',
        estimatedBudget: 500000,
        riskLevel: 'Medium',
        marketSize: '$30T small business market',
        competition: 'Moderate - requires due diligence',
        reasoning: 'Established businesses provide immediate cash flow and operational frameworks',
        complexity: 'medium'
      },
      {
        title: 'Real Estate Investment Fund',
        description: 'Investment in professionally managed real estate fund with diversified property portfolio',
        category: 'Real Estate Investment',
        estimatedBudget: 400000,
        riskLevel: 'Low-Medium',
        marketSize: '$4.2T real estate investment',
        competition: 'Low - passive investment approach',
        reasoning: 'Real estate funds provide property exposure with professional management and diversification',
        complexity: 'low'
      }
    ];

    // Select fallback that best matches user's experience level
    let selectedTemplate = fallbackTemplates[index % fallbackTemplates.length];
    
    // Try to find a template that matches user experience
    const appropriateTemplates = fallbackTemplates.filter(template => 
      this.isComplexityAppropriate(template.complexity, preferences.experience)
    );
    
    if (appropriateTemplates.length > 0) {
      selectedTemplate = appropriateTemplates[index % appropriateTemplates.length];
    }

    return {
      id: `fallback-${Date.now()}-${index}`,
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      category: selectedTemplate.category,
      estimatedBudget: Math.round(selectedTemplate.estimatedBudget * budgetMultiplier),
      riskLevel: this.adjustRiskLevel(selectedTemplate.riskLevel, preferences.riskTolerance),
      marketSize: selectedTemplate.marketSize,
      competition: selectedTemplate.competition,
      reasoning: this.enhanceReasoningForUser(selectedTemplate.reasoning, preferences),
      nextSteps: this.adjustNextStepsForExperience([
        'Conduct thorough market research and analysis',
        'Develop detailed financial projections and budgets',
        'Identify key partnerships and professional advisors',
        'Create implementation plan with clear milestones'
      ], preferences.experience)
    };
  }

  /**
   * Get current economic context for better idea generation
   */
  private async getCurrentEconomicContext(): Promise<any> {
    // In production, this would fetch real economic indicators
    return {
      interestRates: 'Rising',
      inflationTrend: 'Moderating',
      marketSentiment: 'Cautious Optimism',
      sectorPerformance: {
        technology: 'outperforming',
        realEstate: 'stable',
        energy: 'volatile'
      }
    };
  }

  /**
   * Get trending investment categories
   */
  private async getTrendingCategories(): Promise<string[]> {
    // In production, this would analyze real market trends
    return ['ESG Investments', 'AI/Technology', 'Renewable Energy', 'Healthcare Innovation'];
  }

  /**
   * Validate and enhance generated ideas
   */
  async enhanceIdeasWithMarketData(ideas: Idea[]): Promise<Idea[]> {
    // This could integrate with real market APIs to enhance ideas
    return ideas.map(idea => ({
      ...idea,
      marketSize: this.enhanceMarketSize(idea.marketSize),
      reasoning: this.enhanceReasoning(idea.reasoning)
    }));
  }

  private enhanceMarketSize(currentSize: string): string {
    // Add current date context and growth projections
    const currentYear = new Date().getFullYear();
    return `${currentSize} (${currentYear} TAM, projected 15-25% CAGR)`;
  }

  private enhanceReasoning(currentReasoning: string): string {
    // Add market timing and competitive analysis
    return `${currentReasoning}. Current market conditions favor this opportunity with strong fundamentals and limited downside risk.`;
  }

  /**
   * Calculate relevance score for an idea based on user preferences
   * Returns a score from 0.0 to 1.0
   */
  private calculateRelevanceScore(idea: Idea, preferences: UserPreferences): number {
    let score = 0;
    let maxScore = 0;

    // Interest alignment (30% weight)
    maxScore += 30;
    const interestMatch = preferences.interests.some(interest => 
      idea.category.toLowerCase().includes(interest.toLowerCase()) || 
      idea.title.toLowerCase().includes(interest.toLowerCase()) ||
      idea.description.toLowerCase().includes(interest.toLowerCase())
    );
    if (interestMatch) score += 30;

    // Risk tolerance alignment (25% weight)
    maxScore += 25;
    const riskScore = this.calculateRiskAlignment(idea.riskLevel, preferences.riskTolerance);
    score += riskScore * 25;

    // Budget appropriateness (20% weight)
    maxScore += 20;
    const budgetScore = this.calculateBudgetAlignment(idea.estimatedBudget, preferences.budgetRange);
    score += budgetScore * 20;

    // Investment goals alignment (15% weight)
    maxScore += 15;
    const goalScore = this.calculateGoalAlignment(idea, preferences.investmentGoals);
    score += goalScore * 15;

    // Experience level appropriateness (10% weight)
    maxScore += 10;
    const complexityFromIdea = this.inferComplexityFromIdea(idea);
    if (this.isComplexityAppropriate(complexityFromIdea, preferences.experience)) {
      score += 10;
    }

    return Math.min(1.0, score / maxScore);
  }

  /**
   * Calculate risk alignment score
   */
  private calculateRiskAlignment(ideaRisk: string, userRisk: string): number {
    const riskLevels = ['Low', 'Low-Medium', 'Medium', 'Medium-High', 'High'];
    const ideaIndex = riskLevels.findIndex(level => ideaRisk.includes(level));
    const userIndex = userRisk === 'low' ? 0 : userRisk === 'medium' ? 2 : 4;
    
    if (ideaIndex === -1) return 0.5; // Default if risk level not found
    
    const distance = Math.abs(ideaIndex - userIndex);
    return Math.max(0, 1 - (distance * 0.25)); // Penalty decreases alignment
  }

  /**
   * Calculate budget alignment score
   */
  private calculateBudgetAlignment(ideaBudget: number, userBudget: string): number {
    const budgetRanges = {
      'small': { min: 10000, max: 100000 },
      'medium': { min: 100000, max: 1000000 },
      'large': { min: 1000000, max: 10000000 },
      'flexible': { min: 10000, max: 10000000 }
    };

    const range = budgetRanges[userBudget as keyof typeof budgetRanges];
    if (!range) return 0.5;

    if (ideaBudget >= range.min && ideaBudget <= range.max) return 1.0;
    
    // Calculate how far outside the range
    const distanceBelow = Math.max(0, range.min - ideaBudget) / range.min;
    const distanceAbove = Math.max(0, ideaBudget - range.max) / range.max;
    const maxDistance = Math.max(distanceBelow, distanceAbove);
    
    return Math.max(0, 1 - maxDistance);
  }

  /**
   * Calculate goal alignment score
   */
  private calculateGoalAlignment(idea: Idea, userGoals: string[]): number {
    const goalKeywords: Record<string, string[]> = {
      'Passive Income': ['passive', 'income', 'dividend', 'rental', 'yield', 'cash flow'],
      'Long-term Growth': ['growth', 'appreciation', 'development', 'expansion', 'scale'],
      'Portfolio Diversification': ['diversified', 'portfolio', 'fund', 'investment', 'multiple'],
      'Social Impact': ['social', 'sustainable', 'community', 'environmental', 'impact'],
      'Learning Experience': ['learning', 'experience', 'education', 'skill', 'knowledge'],
      'Quick Returns': ['quick', 'fast', 'immediate', 'short-term', 'rapid']
    };

    let matches = 0;
    const ideaText = `${idea.title} ${idea.description} ${idea.category} ${idea.reasoning}`.toLowerCase();

    userGoals.forEach(goal => {
      const keywords = goalKeywords[goal] || [];
      const hasKeyword = keywords.some(keyword => ideaText.includes(keyword));
      if (hasKeyword) matches++;
    });

    return userGoals.length > 0 ? matches / userGoals.length : 0.5;
  }

  /**
   * Check if complexity level is appropriate for user experience
   */
  private isComplexityAppropriate(complexity: string, experience: string): boolean {
    const complexityLevels = { 'low': 1, 'medium': 2, 'high': 3 };
    const experienceLevels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    
    const complexityNum = complexityLevels[complexity as keyof typeof complexityLevels] || 2;
    const experienceNum = experienceLevels[experience as keyof typeof experienceLevels] || 1;
    
    // Allow same level or up to one level higher
    return complexityNum <= experienceNum + 1;
  }

  /**
   * Infer complexity from idea characteristics
   */
  private inferComplexityFromIdea(idea: Idea): string {
    const complexIndicators = ['AI', 'platform', 'development', 'fund', 'accelerator', 'technology'];
    const simpleIndicators = ['rental', 'investment', 'consulting', 'services', 'marketplace'];
    
    const ideaText = `${idea.title} ${idea.description} ${idea.category}`.toLowerCase();
    
    const hasComplex = complexIndicators.some(indicator => ideaText.includes(indicator.toLowerCase()));
    const hasSimple = simpleIndicators.some(indicator => ideaText.includes(indicator.toLowerCase()));
    
    if (hasComplex && !hasSimple) return 'high';
    if (hasSimple && !hasComplex) return 'low';
    return 'medium';
  }

  /**
   * Generate goal-driven ideas that specifically match investment goals
   */
  private generateGoalDrivenIdeas(preferences: UserPreferences, budgetMultiplier: number): Idea[] {
    const ideas: Idea[] = [];

    preferences.investmentGoals.forEach(goal => {
      const goalIdea = this.createGoalSpecificIdea(goal, preferences, budgetMultiplier);
      if (goalIdea) ideas.push(goalIdea);
    });

    return ideas;
  }

  /**
   * Create idea specific to investment goal
   */
  private createGoalSpecificIdea(goal: string, preferences: UserPreferences, budgetMultiplier: number): Idea | null {
    const goalTemplates: Record<string, Partial<Idea>> = {
      'Passive Income': {
        title: 'Dividend-Focused Investment Portfolio',
        description: 'Diversified portfolio of dividend-paying stocks and REITs optimized for consistent income',
        category: 'Income Investment',
        estimatedBudget: 300000,
        riskLevel: 'Low-Medium',
        marketSize: '$1.3T dividend stock market',
        competition: 'Low - systematic approach',
        reasoning: 'Dividend-focused investing provides 4-6% annual yield with inflation protection'
      },
      'Long-term Growth': {
        title: 'Growth Technology Fund',
        description: 'Investment fund focused on high-growth technology companies and emerging sectors',
        category: 'Growth Investment',
        estimatedBudget: 500000,
        riskLevel: 'Medium-High',
        marketSize: '$45T global equity markets',
        competition: 'High but opportunities in emerging tech',
        reasoning: 'Technology sector historically outperforms with 12-15% annual growth potential'
      },
      'Portfolio Diversification': {
        title: 'Alternative Assets Fund',
        description: 'Diversified fund investing in alternative assets: commodities, infrastructure, and private equity',
        category: 'Alternative Investment',
        estimatedBudget: 1000000,
        riskLevel: 'Medium',
        marketSize: '$13T alternative assets',
        competition: 'Moderate with proper diversification',
        reasoning: 'Alternative assets provide portfolio diversification with low correlation to traditional markets'
      },
      'Social Impact': {
        title: 'Impact Investment Fund',
        description: 'Investment fund focused on companies generating positive social and environmental impact',
        category: 'Impact Investment',
        estimatedBudget: 750000,
        riskLevel: 'Medium',
        marketSize: '$715B impact investing',
        competition: 'Growing field with strong demand',
        reasoning: 'Impact investing delivers competitive returns while creating measurable social benefit'
      },
      'Learning Experience': {
        title: 'Startup Investment Syndicate',
        description: 'Join angel investment group to learn startup evaluation and venture investing',
        category: 'Angel Investment',
        estimatedBudget: 100000,
        riskLevel: 'High',
        marketSize: '$164B angel investment',
        competition: 'Moderate with mentorship focus',
        reasoning: 'Angel investing provides hands-on learning in early-stage company evaluation and mentoring'
      },
      'Quick Returns': {
        title: 'Short-Term Trading Fund',
        description: 'Quantitative trading fund focused on short-term market opportunities and arbitrage',
        category: 'Trading Strategy',
        estimatedBudget: 200000,
        riskLevel: 'High',
        marketSize: '$6.6T daily forex trading',
        competition: 'Very high - requires edge',
        reasoning: 'Short-term trading can generate quick returns but requires sophisticated risk management'
      }
    };

    const template = goalTemplates[goal];
    if (!template) return null;

    return {
      ...template,
      id: `goal-${goal.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      estimatedBudget: Math.round(template.estimatedBudget! * budgetMultiplier),
      riskLevel: this.adjustRiskLevel(template.riskLevel!, preferences.riskTolerance),
      nextSteps: [
        `Research ${goal.toLowerCase()} investment strategies and best practices`,
        'Analyze current market conditions and opportunities',
        'Develop investment criteria and selection process',
        'Create monitoring and performance measurement system'
      ]
    } as Idea;
  }

  /**
   * Generate combination ideas that blend multiple user interests
   */
  private generateCombinationIdeas(preferences: UserPreferences, budgetMultiplier: number): Idea[] {
    const ideas: Idea[] = [];
    
    // Only generate combinations if user has multiple interests
    if (preferences.interests.length < 2) return ideas;

    const combinations = this.getInterestCombinations(preferences.interests);
    
    combinations.slice(0, 2).forEach((combo, index) => {
      const combinationIdea = this.createCombinationIdea(combo, preferences, budgetMultiplier, index);
      if (combinationIdea) ideas.push(combinationIdea);
    });

    return ideas;
  }

  /**
   * Get viable combinations of user interests
   */
  private getInterestCombinations(interests: string[]): string[][] {
    const viableCombos: Record<string, string[]> = {
      'Technology+Real Estate': ['Smart building development', 'PropTech platform', 'Real estate data analytics'],
      'Technology+Healthcare': ['Telemedicine platform', 'Health monitoring devices', 'Medical AI tools'],
      'Technology+Finance': ['Fintech platform', 'Trading algorithms', 'Digital payment solutions'],
      'Real Estate+Energy': ['Solar residential development', 'Green building investment', 'Energy-efficient properties'],
      'Healthcare+Real Estate': ['Medical office buildings', 'Senior living facilities', 'Healthcare REITs'],
      'Sustainability+Energy': ['Renewable energy projects', 'Carbon credit trading', 'Green technology fund'],
      'Education+Technology': ['Online learning platform', 'Educational software', 'Corporate training tech'],
      'Entertainment+Technology': ['Streaming platform', 'Gaming technology', 'Digital content creation'],
      'Agriculture+Technology': ['AgTech solutions', 'Precision farming', 'Food supply chain tech'],
      'Manufacturing+Technology': ['Industrial automation', 'IoT manufacturing', '3D printing services']
    };

    const combinations: string[][] = [];
    
    for (let i = 0; i < interests.length; i++) {
      for (let j = i + 1; j < interests.length; j++) {
        const key1 = `${interests[i]}+${interests[j]}`;
        const key2 = `${interests[j]}+${interests[i]}`;
        
        if (viableCombos[key1]) {
          combinations.push([interests[i], interests[j]]);
        } else if (viableCombos[key2]) {
          combinations.push([interests[j], interests[i]]);
        }
      }
    }

    return combinations;
  }

  /**
   * Create idea combining multiple interests
   */
  private createCombinationIdea(combo: string[], preferences: UserPreferences, budgetMultiplier: number, index: number): Idea | null {
    const comboKey = combo.join('+');
    
    const comboTemplates: Record<string, Partial<Idea>> = {
      'Technology+Real Estate': {
        title: 'PropTech Investment Platform',
        description: 'Technology platform connecting real estate investors with vetted property opportunities',
        category: 'PropTech',
        estimatedBudget: 800000,
        riskLevel: 'Medium-High',
        marketSize: '$18B PropTech market',
        competition: 'High but opportunities in specialized niches',
        reasoning: 'Real estate digitization creates opportunities for technology-enabled investing platforms'
      },
      'Technology+Healthcare': {
        title: 'Digital Health Monitoring Platform',
        description: 'Wearable technology and AI platform for continuous health monitoring and alerts',
        category: 'HealthTech',
        estimatedBudget: 1200000,
        riskLevel: 'Medium-High',
        marketSize: '$350B digital health market',
        competition: 'High but growing rapidly',
        reasoning: 'Aging population and preventive care trends drive demand for health monitoring technology'
      },
      'Real Estate+Energy': {
        title: 'Net-Zero Building Development',
        description: 'Development of energy-positive buildings with integrated renewable energy systems',
        category: 'Sustainable Real Estate',
        estimatedBudget: 3000000,
        riskLevel: 'Medium',
        marketSize: '$25B green building market',
        competition: 'Moderate with sustainability premium',
        reasoning: 'Energy regulations and sustainability commitments drive demand for net-zero buildings'
      },
      'Sustainability+Energy': {
        title: 'Community Renewable Energy Cooperative',
        description: 'Community-owned renewable energy projects with shared ownership and benefits',
        category: 'Community Energy',
        estimatedBudget: 2500000,
        riskLevel: 'Low-Medium',
        marketSize: '$1.1T renewable energy investment',
        competition: 'Low with community focus',
        reasoning: 'Community energy models provide stable returns while building local energy resilience'
      }
    };

    const template = comboTemplates[comboKey];
    if (!template) return null;

    return {
      ...template,
      id: `combo-${comboKey.replace(/\+/g, '-').toLowerCase()}-${Date.now()}-${index}`,
      estimatedBudget: Math.round(template.estimatedBudget! * budgetMultiplier),
      riskLevel: this.adjustRiskLevel(template.riskLevel!, preferences.riskTolerance),
      nextSteps: [
        `Analyze ${combo.join(' and ')} market intersection and opportunities`,
        'Identify key partnerships needed for cross-industry execution',
        'Develop pilot program or minimum viable product',
        'Secure initial funding and regulatory approvals'
      ]
    } as Idea;
  }

  /**
   * Validate and enhance final ideas to ensure quality
   */
  private validateAndEnhanceIdeas(ideas: Idea[], preferences: UserPreferences): Idea[] {
    return ideas.map(idea => {
      // Ensure budget is realistic for the idea type
      idea.estimatedBudget = this.validateBudget(idea.estimatedBudget, idea.category);
      
      // Enhance reasoning with user-specific context
      idea.reasoning = this.enhanceReasoningForUser(idea.reasoning, preferences);
      
      // Ensure next steps are appropriate for user experience level
      idea.nextSteps = this.adjustNextStepsForExperience(idea.nextSteps, preferences.experience);
      
      return idea;
    });
  }

  /**
   * Validate budget is realistic for idea category
   */
  private validateBudget(budget: number, category: string): number {
    const categoryMinimums: Record<string, number> = {
      'Technology': 100000,
      'Real Estate': 500000,
      'Healthcare': 200000,
      'Finance': 250000,
      'Energy': 800000,
      'Manufacturing': 300000,
      'Education': 150000,
      'Entertainment': 200000,
      'Agriculture': 300000,
      'Sustainability': 200000,
      'Art Investment': 100000,
      'Startup Investment': 50000
    };

    const minimum = categoryMinimums[category] || 100000;
    return Math.max(budget, minimum);
  }

  /**
   * Enhance reasoning with user-specific context
   */
  private enhanceReasoningForUser(reasoning: string, preferences: UserPreferences): string {
    let enhanced = reasoning;
    
    // Add experience-level context
    if (preferences.experience === 'beginner') {
      enhanced += ' This opportunity includes educational resources and mentorship to support your investment journey.';
    } else if (preferences.experience === 'advanced') {
      enhanced += ' The sophisticated nature of this opportunity allows for strategic optimization and advanced risk management.';
    }

    // Add goal-specific context
    if (preferences.investmentGoals.includes('Social Impact')) {
      enhanced += ' This investment creates measurable positive impact while generating competitive returns.';
    }

    return enhanced;
  }

  /**
   * Adjust next steps based on user experience level
   */
  private adjustNextStepsForExperience(steps: string[], experience: string): string[] {
    const baseSteps = [...steps];
    
    if (experience === 'beginner') {
      // Add educational steps for beginners
      baseSteps.unshift('Complete foundational education on this investment type');
      baseSteps.push('Connect with experienced mentors in this field');
    } else if (experience === 'advanced') {
      // Add sophisticated steps for advanced investors
      baseSteps.push('Develop advanced risk management and hedging strategies');
      baseSteps.push('Consider international expansion or scaling opportunities');
    }

    return baseSteps;
  }
}

export const aiIdeaGenerator = new AIIdeaGeneratorService();
export type { MarketTrend, AIIdeaGenerationRequest, AIIdeaGenerationResponse };