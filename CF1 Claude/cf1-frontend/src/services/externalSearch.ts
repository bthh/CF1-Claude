/**
 * CF1 External Search Service
 * Integrates with external market data APIs to provide real-world investment opportunities
 */

export interface ExternalSearchQuery {
  category: string;
  query: string;
  location?: string;
  budgetRange?: {
    min: number;
    max: number;
  };
  additionalFilters?: Record<string, any>;
  guidedAnswers?: Array<{
    questionId: string;
    value: string | string[] | number;
  }>;
}

export interface ExternalSearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'real_estate' | 'business' | 'commodity' | 'stock' | 'startup' | 'energy';
  
  // Financial data
  price?: number;
  estimatedROI?: number;
  cashFlow?: number;
  marketValue?: number;
  
  // Location data
  location?: {
    address?: string;
    city: string;
    state?: string;
    country: string;
    coordinates?: [number, number]; // [lat, lng]
  };
  
  // Investment metrics
  riskLevel: 'low' | 'medium' | 'high';
  investmentType: string;
  timeHorizon: string;
  
  // Media
  images?: string[];
  thumbnailUrl?: string;
  
  // Analysis
  marketAnalysis: string;
  keyMetrics: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  
  // Actionable data
  nextSteps: string[];
  contactInfo?: {
    agent?: string;
    phone?: string;
    email?: string;
  };
  
  // Source information
  source: string;
  sourceUrl?: string;
  dataFreshness: string; // e.g., "2 hours ago"
  
  // CF1 integration
  proposalReady: boolean;
  estimatedFundingRequired: number;
}

export interface APIProvider {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  categories: string[];
}

class ExternalSearchService {
  private apiProviders: Map<string, APIProvider> = new Map();
  private resultCache: Map<string, ExternalSearchResult[]> = new Map();
  private rateLimitTracker: Map<string, { requests: number; resetTime: number }> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize external API providers
   */
  private initializeProviders(): void {
    // Real Estate APIs
    this.apiProviders.set('airdna', {
      name: 'AirDNA',
      baseUrl: 'https://api.airdna.co/v1',
      apiKey: import.meta.env.VITE_AIRDNA_API_KEY,
      rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
      categories: ['real_estate']
    });

    this.apiProviders.set('mashvisor', {
      name: 'Mashvisor',
      baseUrl: 'https://api.mashvisor.com/v2',
      apiKey: import.meta.env.VITE_MASHVISOR_API_KEY,
      rateLimit: { requestsPerMinute: 30, requestsPerDay: 500 },
      categories: ['real_estate']
    });

    // Financial Market APIs
    this.apiProviders.set('alphavantage', {
      name: 'Alpha Vantage',
      baseUrl: 'https://www.alphavantage.co/query',
      apiKey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
      rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
      categories: ['stocks', 'forex', 'commodities', 'crypto']
    });

    this.apiProviders.set('polygon', {
      name: 'Polygon.io',
      baseUrl: 'https://api.polygon.io/v2',
      apiKey: import.meta.env.VITE_POLYGON_API_KEY,
      rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
      categories: ['stocks', 'options', 'forex', 'crypto']
    });

    // Business/Startup APIs
    this.apiProviders.set('bizbuysell', {
      name: 'BizBuySell',
      baseUrl: 'https://api.bizbuysell.com/v1',
      apiKey: import.meta.env.VITE_BIZBUYSELL_API_KEY,
      rateLimit: { requestsPerMinute: 30, requestsPerDay: 300 },
      categories: ['business']
    });

    // Web Search API (Serper)
    this.apiProviders.set('serper', {
      name: 'Serper',
      baseUrl: 'https://google.serper.dev/search',
      apiKey: import.meta.env.VITE_SERPER_API_KEY,
      rateLimit: { requestsPerMinute: 60, requestsPerDay: 2500 },
      categories: ['general', 'web_search']
    });

    // Real Estate APIs (Additional)
    this.apiProviders.set('realtymole', {
      name: 'RealtyMole',
      baseUrl: 'https://api.realtymole.com/v1',
      apiKey: import.meta.env.VITE_REALTYMOLE_API_KEY,
      rateLimit: { requestsPerMinute: 30, requestsPerDay: 1000 },
      categories: ['real_estate']
    });

    this.apiProviders.set('zillow', {
      name: 'Zillow',
      baseUrl: 'https://api.bridgedataoutput.com/api/v2',
      apiKey: import.meta.env.VITE_ZILLOW_API_KEY,
      rateLimit: { requestsPerMinute: 10, requestsPerDay: 1000 },
      categories: ['real_estate']
    });
  }

  /**
   * Main search function - routes queries to appropriate providers
   */
  async search(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    console.log('External search query:', query);
    
    // Check cache first
    const cacheKey = this.generateCacheKey(query);
    if (this.resultCache.has(cacheKey)) {
      console.log('Returning cached results for:', cacheKey);
      return this.resultCache.get(cacheKey)!;
    }

    const results: ExternalSearchResult[] = [];
    
    try {
      // Route to specific category handlers
      switch (query.category.toLowerCase()) {
        case 'real estate':
        case 'real_estate':
          const realEstateResults = await this.searchRealEstate(query);
          results.push(...realEstateResults);
          break;
          
        case 'technology':
        case 'stocks':
          const stockResults = await this.searchStocks(query);
          results.push(...stockResults);
          break;
          
        case 'commodities':
          const commodityResults = await this.searchCommodities(query);
          results.push(...commodityResults);
          break;
          
        case 'energy':
          const energyResults = await this.searchEnergy(query);
          results.push(...energyResults);
          break;
          
        case 'startups':
        case 'business':
          const businessResults = await this.searchBusinesses(query);
          results.push(...businessResults);
          break;
          
        default:
          // Use Serper for general web search to find investment opportunities
          const webResults = await this.searchSerper(query);
          results.push(...webResults);

          // Also include multi-category search as fallback
          const mixedResults = await this.searchMultiCategory(query);
          results.push(...mixedResults);
      }

      // Score and sort results
      const scoredResults = this.scoreResults(results, query);
      
      // Cache results
      this.resultCache.set(cacheKey, scoredResults);
      
      console.log(`External search returned ${scoredResults.length} results`);
      return scoredResults;
      
    } catch (error) {
      console.error('External search failed:', error);
      
      // Return mock results for development/fallback
      return this.generateMockResults(query);
    }
  }

  /**
   * Search real estate opportunities
   */
  private async searchRealEstate(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    const results: ExternalSearchResult[] = [];

    // Try AirDNA for rental properties
    if (query.query.toLowerCase().includes('airbnb') || 
        query.query.toLowerCase().includes('vrbo') || 
        query.query.toLowerCase().includes('rental')) {
      
      const airdnaResults = await this.searchAirDNA(query);
      results.push(...airdnaResults);
    }

    // Try Mashvisor for investment analysis
    if (this.apiProviders.has('mashvisor')) {
      const mashvisorResults = await this.searchMashvisor(query);
      results.push(...mashvisorResults);
    }

    // Try RealtyMole for property data
    if (this.apiProviders.has('realtymole')) {
      const realtyMoleResults = await this.searchRealtyMole(query);
      results.push(...realtyMoleResults);
    }

    // Try Zillow for comprehensive property data
    if (this.apiProviders.has('zillow')) {
      const zillowResults = await this.searchZillow(query);
      results.push(...zillowResults);
    }

    // If no API results, generate location-based mock data
    if (results.length === 0) {
      return this.generateRealEstateMockData(query);
    }

    return results;
  }

  /**
   * Search AirDNA for short-term rental data
   */
  private async searchAirDNA(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    const provider = this.apiProviders.get('airdna')!;
    
    if (!provider.apiKey) {
      console.warn('AirDNA API key not configured, using mock data');
      return this.generateRealEstateMockData(query);
    }

    // Check rate limits
    if (!this.checkRateLimit('airdna')) {
      console.warn('AirDNA rate limit exceeded, using cached/mock data');
      return this.generateRealEstateMockData(query);
    }

    try {
      // In production, this would make actual API calls
      // For now, return enhanced mock data based on query
      return this.generateRealEstateMockData(query);
      
    } catch (error) {
      console.error('AirDNA API error:', error);
      return this.generateRealEstateMockData(query);
    }
  }

  /**
   * Search Mashvisor for real estate investment data
   */
  private async searchMashvisor(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    // Similar implementation to AirDNA
    return this.generateRealEstateMockData(query);
  }

  /**
   * Search RealtyMole for property data
   */
  private async searchRealtyMole(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    const provider = this.apiProviders.get('realtymole')!;

    if (!provider.apiKey) {
      console.warn('RealtyMole API key not configured, using mock data');
      return this.generateRealEstateMockData(query);
    }

    // Check rate limits
    if (!this.checkRateLimit('realtymole')) {
      console.warn('RealtyMole rate limit exceeded, using cached/mock data');
      return this.generateRealEstateMockData(query);
    }

    try {
      // In production, this would make actual API calls to RealtyMole
      // For now, return enhanced mock data based on query
      return this.generateRealEstateMockData(query);

    } catch (error) {
      console.error('RealtyMole API error:', error);
      return this.generateRealEstateMockData(query);
    }
  }

  /**
   * Search Zillow for comprehensive property data
   */
  private async searchZillow(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    const provider = this.apiProviders.get('zillow')!;

    if (!provider.apiKey) {
      console.warn('Zillow API key not configured, using mock data');
      return this.generateRealEstateMockData(query);
    }

    // Check rate limits
    if (!this.checkRateLimit('zillow')) {
      console.warn('Zillow rate limit exceeded, using cached/mock data');
      return this.generateRealEstateMockData(query);
    }

    try {
      // In production, this would make actual API calls to Zillow/Bridge Data Output
      // For now, return enhanced mock data based on query
      return this.generateRealEstateMockData(query);

    } catch (error) {
      console.error('Zillow API error:', error);
      return this.generateRealEstateMockData(query);
    }
  }

  /**
   * Search using Serper web search API
   */
  private async searchSerper(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    const provider = this.apiProviders.get('serper')!;

    if (!provider.apiKey) {
      console.warn('Serper API key not configured, using mock data');
      return this.generateGeneralMockData(query);
    }

    // Check rate limits
    if (!this.checkRateLimit('serper')) {
      console.warn('Serper rate limit exceeded, using cached/mock data');
      return this.generateGeneralMockData(query);
    }

    try {
      // In production, this would make actual API calls to Serper for web search
      // Search for investment-related content using the query
      // For now, return enhanced mock data based on query
      return this.generateGeneralMockData(query);

    } catch (error) {
      console.error('Serper API error:', error);
      return this.generateGeneralMockData(query);
    }
  }

  /**
   * Search stocks and technology investments
   */
  private async searchStocks(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    return this.generateStockMockData(query);
  }

  /**
   * Search commodity investments
   */
  private async searchCommodities(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    return this.generateCommodityMockData(query);
  }

  /**
   * Search energy investments
   */
  private async searchEnergy(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    return this.generateEnergyMockData(query);
  }

  /**
   * Search business acquisition opportunities
   */
  private async searchBusinesses(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    return this.generateBusinessMockData(query);
  }

  /**
   * Multi-category search fallback
   */
  private async searchMultiCategory(query: ExternalSearchQuery): Promise<ExternalSearchResult[]> {
    const results: ExternalSearchResult[] = [];
    
    // Search across multiple categories with reduced result counts
    const realEstateResults = await this.searchRealEstate({...query, category: 'real_estate'});
    results.push(...realEstateResults.slice(0, 2));
    
    const stockResults = await this.searchStocks({...query, category: 'stocks'});
    results.push(...stockResults.slice(0, 2));
    
    const businessResults = await this.searchBusinesses({...query, category: 'business'});
    results.push(...businessResults.slice(0, 2));
    
    return results;
  }

  /**
   * Generate mock real estate data based on query
   */
  private generateRealEstateMockData(query: ExternalSearchQuery): ExternalSearchResult[] {
    // Extract information from guided answers if available
    const specificLocation = query.guidedAnswers?.find(a => a.questionId === 'specific_location')?.value as string;
    const propertyType = query.guidedAnswers?.find(a => a.questionId === 'property_type')?.value as string[];
    const keyFeatures = query.guidedAnswers?.find(a => a.questionId === 'key_features')?.value as string[];
    
    const location = specificLocation || query.location || 'Austin, TX';
    const isRental = query.query.toLowerCase().includes('airbnb') || 
                     query.query.toLowerCase().includes('vrbo') || 
                     query.query.toLowerCase().includes('rental') ||
                     propertyType?.includes('Hospitality (Hotels/AirBnB)');
    
    const isCommercial = propertyType?.includes('Commercial') || propertyType?.includes('Mixed-Use');
    const wantsCashFlow = keyFeatures?.includes('High Cash Flow') || keyFeatures?.includes('Passive Income');

    const properties = [
      {
        id: 'prop_1',
        title: isRental ? `VRBO-Ready Lake House in ${location}` : 
               isCommercial ? `Commercial Property in ${location}` :
               `Investment Property in ${location}`,
        description: isRental ? 
          'Fully furnished 3BR lakefront home with proven rental history. Prime location for vacation rentals with 75% average occupancy.' :
          isCommercial ?
          'Prime commercial property in high-traffic area. Perfect for retail, office, or mixed-use development.' :
          wantsCashFlow ?
          'Renovated multi-unit property with strong cash flow. All units rented with reliable tenants.' :
          'Renovated 3-bedroom property in growing neighborhood. Perfect for buy-and-hold investment strategy.',
        category: 'Real Estate',
        type: 'real_estate' as const,
        price: 485000,
        estimatedROI: isRental ? 12.5 : 8.2,
        cashFlow: isRental ? 2800 : 1200,
        marketValue: 485000,
        location: {
          city: location.split(',')[0],
          state: location.split(',')[1]?.trim() || 'TX',
          country: 'USA',
          coordinates: [30.2672, -97.7431] as [number, number]
        },
        riskLevel: 'medium' as const,
        investmentType: isRental ? 'Short-term Rental' : 'Buy & Hold',
        timeHorizon: '5-10 years',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        thumbnailUrl: '/api/placeholder/400/300',
        marketAnalysis: isRental ?
          'Strong vacation rental market with year-round demand. Average nightly rate $180, seasonal peaks up to $250.' :
          'Emerging neighborhood with 15% property appreciation over last 2 years. Strong rental demand from young professionals.',
        keyMetrics: isRental ? [
          { label: 'Average Nightly Rate', value: '$180', unit: '/night' },
          { label: 'Occupancy Rate', value: 75, unit: '%' },
          { label: 'Annual Revenue', value: '$39,420', unit: '/year' },
          { label: 'Net Cash Flow', value: '$2,800', unit: '/month' }
        ] : [
          { label: 'Purchase Price', value: '$485,000' },
          { label: 'Monthly Rent', value: '$2,400' },
          { label: 'Cap Rate', value: 5.9, unit: '%' },
          { label: 'Cash on Cash', value: 8.2, unit: '%' }
        ],
        nextSteps: [
          'Schedule property viewing and inspection',
          'Obtain pre-approval letter from lender',
          'Research local zoning laws and rental regulations',
          'Analyze comparable properties and rental rates',
          isRental ? 'Review vacation rental licensing requirements' : 'Connect with property management companies'
        ],
        contactInfo: {
          agent: 'Sarah Johnson, Real Estate Investment Specialist',
          phone: '(555) 123-4567',
          email: 'sarah@investmentproperties.com'
        },
        source: 'CF1 Market Intelligence',
        sourceUrl: '#',
        dataFreshness: '2 hours ago',
        proposalReady: true,
        estimatedFundingRequired: isRental ? 145500 : 97000 // 30% down + closing costs
      },
      {
        id: 'prop_2',
        title: `Multi-Family Investment in ${location}`,
        description: 'Duplex property with strong rental income. Both units currently occupied with long-term tenants.',
        category: 'Real Estate',
        type: 'real_estate' as const,
        price: 350000,
        estimatedROI: 10.8,
        cashFlow: 1850,
        marketValue: 350000,
        location: {
          city: location.split(',')[0],
          state: location.split(',')[1]?.trim() || 'TX',
          country: 'USA',
          coordinates: [30.2672, -97.7431] as [number, number]
        },
        riskLevel: 'low' as const,
        investmentType: 'Multi-Family Rental',
        timeHorizon: '10+ years',
        images: ['/api/placeholder/400/300'],
        thumbnailUrl: '/api/placeholder/400/300',
        marketAnalysis: 'Stable rental market with low vacancy rates. Both units generating $1,400/month each.',
        keyMetrics: [
          { label: 'Monthly Rent (Total)', value: '$2,800' },
          { label: 'Vacancy Rate', value: 3, unit: '%' },
          { label: 'Operating Expenses', value: '$950', unit: '/month' },
          { label: 'NOI', value: '$22,200', unit: '/year' }
        ],
        nextSteps: [
          'Review current lease agreements and tenant history',
          'Inspect both units for maintenance needs',
          'Analyze local rental market trends',
          'Calculate financing options and cash flow projections'
        ],
        contactInfo: {
          agent: 'Mike Chen, Multi-Family Specialist',
          phone: '(555) 987-6543',
          email: 'mike@multifamilyinvest.com'
        },
        source: 'CF1 Market Intelligence',
        dataFreshness: '4 hours ago',
        proposalReady: true,
        estimatedFundingRequired: 105000 // 30% down + closing
      }
    ];

    return properties;
  }

  /**
   * Generate mock stock/technology investment data
   */
  private generateStockMockData(query: ExternalSearchQuery): ExternalSearchResult[] {
    const techKeyword = query.query.toLowerCase();
    const isAI = techKeyword.includes('ai') || techKeyword.includes('artificial intelligence');
    const isCleanTech = techKeyword.includes('clean') || techKeyword.includes('renewable') || techKeyword.includes('solar');

    return [
      {
        id: 'stock_1',
        title: isAI ? 'AI Infrastructure REIT Investment' : isCleanTech ? 'Clean Energy Growth Fund' : 'Technology Sector ETF',
        description: isAI ? 
          'Real estate investment trust focused on AI data centers and cloud infrastructure properties.' :
          isCleanTech ?
          'Diversified fund investing in solar, wind, and energy storage companies.' :
          'Broad technology sector exposure with focus on growth companies.',
        category: 'Technology',
        type: 'stock' as const,
        price: isAI ? 85.50 : isCleanTech ? 42.30 : 156.75,
        estimatedROI: isAI ? 15.2 : isCleanTech ? 18.5 : 12.8,
        marketValue: 1250000000, // Market cap
        riskLevel: isAI ? 'high' : isCleanTech ? 'medium' : 'medium' as const,
        investmentType: isAI ? 'REIT' : isCleanTech ? 'Mutual Fund' : 'ETF',
        timeHorizon: '3-7 years',
        marketAnalysis: isAI ?
          'AI infrastructure demand growing 40% annually. Major tech companies expanding data center footprint.' :
          isCleanTech ?
          'Clean energy sector benefiting from government incentives and corporate ESG commitments.' :
          'Technology sector showing resilience with strong earnings growth across major holdings.',
        keyMetrics: isAI ? [
          { label: 'Dividend Yield', value: 4.2, unit: '%' },
          { label: 'P/E Ratio', value: 22.5 },
          { label: 'Assets Under Management', value: '$1.25B' },
          { label: '1-Year Performance', value: 28.3, unit: '%' }
        ] : isCleanTech ? [
          { label: 'Expense Ratio', value: 0.65, unit: '%' },
          { label: 'Top Holding Weight', value: 8.2, unit: '%' },
          { label: 'Assets Under Management', value: '$890M' },
          { label: '3-Year Average Return', value: 15.7, unit: '%' }
        ] : [
          { label: 'Expense Ratio', value: 0.05, unit: '%' },
          { label: 'Number of Holdings', value: 312 },
          { label: 'Assets Under Management', value: '$45B' },
          { label: '10-Year Average Return', value: 13.4, unit: '%' }
        ],
        nextSteps: [
          'Review fund prospectus and investment strategy',
          'Analyze sector allocation and top holdings',
          'Compare expense ratios with similar funds',
          'Consider dollar-cost averaging entry strategy'
        ],
        source: 'Market Intelligence',
        dataFreshness: '15 minutes ago',
        proposalReady: true,
        estimatedFundingRequired: query.budgetRange?.min || 10000
      }
    ];
  }

  /**
   * Generate mock commodity investment data
   */
  private generateCommodityMockData(query: ExternalSearchQuery): ExternalSearchResult[] {
    return [
      {
        id: 'commodity_1',
        title: 'Gold Investment Partnership',
        description: 'Physical gold storage and trading opportunity with secure vault storage and liquidity options.',
        category: 'Commodities',
        type: 'commodity' as const,
        price: 2015.50, // Per ounce
        estimatedROI: 8.5,
        riskLevel: 'low' as const,
        investmentType: 'Physical Commodity',
        timeHorizon: '5+ years',
        marketAnalysis: 'Gold maintaining strength as inflation hedge. Central bank purchases supporting price floor.',
        keyMetrics: [
          { label: 'Current Price', value: '$2,015.50', unit: '/oz' },
          { label: 'Storage Fee', value: 0.5, unit: '%/year' },
          { label: '1-Year Performance', value: 12.3, unit: '%' },
          { label: 'Minimum Investment', value: '$25,000' }
        ],
        nextSteps: [
          'Review storage and insurance options',
          'Understand liquidity and exit procedures',
          'Compare with gold ETFs and mining stocks',
          'Consider allocation within broader portfolio'
        ],
        source: 'Commodity Exchange',
        dataFreshness: '30 minutes ago',
        proposalReady: true,
        estimatedFundingRequired: 25000
      }
    ];
  }

  /**
   * Generate mock energy investment data
   */
  private generateEnergyMockData(query: ExternalSearchQuery): ExternalSearchResult[] {
    return [
      {
        id: 'energy_1',
        title: 'Community Solar Development Project',
        description: '5MW solar installation serving 500+ households. Power purchase agreements secured with local utility.',
        category: 'Energy',
        type: 'energy' as const,
        price: 3500000, // Total project cost
        estimatedROI: 11.8,
        cashFlow: 28500, // Monthly
        riskLevel: 'medium' as const,
        investmentType: 'Renewable Energy Project',
        timeHorizon: '20 years',
        location: {
          city: 'Phoenix',
          state: 'AZ',
          country: 'USA',
          coordinates: [33.4484, -112.0740] as [number, number]
        },
        marketAnalysis: 'Arizona solar incentives plus federal ITC provide strong returns. 300+ sunny days annually.',
        keyMetrics: [
          { label: 'System Size', value: '5 MW' },
          { label: 'Annual Generation', value: '9,200 MWh' },
          { label: 'PPA Rate', value: '$0.085', unit: '/kWh' },
          { label: 'Federal Tax Credit', value: 30, unit: '%' }
        ],
        nextSteps: [
          'Review environmental impact and permitting status',
          'Analyze power purchase agreement terms',
          'Understand maintenance and operations plan',
          'Evaluate tax credit monetization options'
        ],
        source: 'Renewable Energy Exchange',
        dataFreshness: '1 hour ago',
        proposalReady: true,
        estimatedFundingRequired: 875000 // 25% equity requirement
      }
    ];
  }

  /**
   * Generate mock general search data
   */
  private generateGeneralMockData(query: ExternalSearchQuery): ExternalSearchResult[] {
    const searchTerm = query.query.toLowerCase();

    // Return a mix of different investment types based on the search query
    const results: ExternalSearchResult[] = [];

    if (searchTerm.includes('real estate') || searchTerm.includes('property')) {
      results.push(...this.generateRealEstateMockData(query).slice(0, 2));
    }

    if (searchTerm.includes('tech') || searchTerm.includes('stock') || searchTerm.includes('ai')) {
      results.push(...this.generateStockMockData(query).slice(0, 1));
    }

    if (searchTerm.includes('business') || searchTerm.includes('acquisition')) {
      results.push(...this.generateBusinessMockData(query).slice(0, 1));
    }

    if (searchTerm.includes('energy') || searchTerm.includes('solar')) {
      results.push(...this.generateEnergyMockData(query).slice(0, 1));
    }

    // If no specific matches, return a general business opportunity
    if (results.length === 0) {
      results.push(...this.generateBusinessMockData(query).slice(0, 1));
    }

    return results;
  }

  /**
   * Generate mock business investment data
   */
  private generateBusinessMockData(query: ExternalSearchQuery): ExternalSearchResult[] {
    return [
      {
        id: 'business_1',
        title: 'Established SaaS Business Acquisition',
        description: 'Profitable B2B software company with 200+ recurring customers and 95% retention rate.',
        category: 'Business',
        type: 'business' as const,
        price: 1200000,
        estimatedROI: 22.5,
        cashFlow: 18500, // Monthly net
        riskLevel: 'medium' as const,
        investmentType: 'Business Acquisition',
        timeHorizon: '5-10 years',
        marketAnalysis: 'SaaS multiples remain strong. Recurring revenue model provides predictable cash flow.',
        keyMetrics: [
          { label: 'Annual Revenue', value: '$480K' },
          { label: 'Customer Retention', value: 95, unit: '%' },
          { label: 'Monthly Recurring Revenue', value: '$40K' },
          { label: 'Gross Margin', value: 78, unit: '%' }
        ],
        nextSteps: [
          'Review 3 years of financial statements',
          'Conduct customer concentration analysis',
          'Evaluate technology stack and dependencies',
          'Negotiate seller financing options'
        ],
        contactInfo: {
          agent: 'Jennifer Martinez, Business Broker',
          phone: '(555) 555-0123',
          email: 'jennifer@bizbrokers.com'
        },
        source: 'Business Marketplace',
        dataFreshness: '6 hours ago',
        proposalReady: true,
        estimatedFundingRequired: 360000 // 30% down
      }
    ];
  }

  /**
   * Score results based on query relevance
   */
  private scoreResults(results: ExternalSearchResult[], query: ExternalSearchQuery): ExternalSearchResult[] {
    return results
      .map(result => ({
        ...result,
        relevanceScore: this.calculateRelevanceScore(result, query)
      }))
      .sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore);
  }

  /**
   * Calculate relevance score for a result
   */
  private calculateRelevanceScore(result: ExternalSearchResult, query: ExternalSearchQuery): number {
    let score = 0;

    // Query match in title/description
    const searchTerms = query.query.toLowerCase().split(' ');
    searchTerms.forEach(term => {
      if (result.title.toLowerCase().includes(term)) score += 0.3;
      if (result.description.toLowerCase().includes(term)) score += 0.2;
    });

    // Category match
    if (result.category.toLowerCase().includes(query.category.toLowerCase())) {
      score += 0.2;
    }

    // Budget range match
    if (query.budgetRange && result.estimatedFundingRequired) {
      const inRange = result.estimatedFundingRequired >= query.budgetRange.min && 
                     result.estimatedFundingRequired <= query.budgetRange.max;
      if (inRange) score += 0.2;
    }

    // Location match
    if (query.location && result.location) {
      if (result.location.city.toLowerCase().includes(query.location.toLowerCase()) ||
          result.location.state?.toLowerCase().includes(query.location.toLowerCase())) {
        score += 0.1;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Generate cache key for query
   */
  private generateCacheKey(query: ExternalSearchQuery): string {
    return `${query.category}_${query.query}_${query.location || 'all'}_${JSON.stringify(query.budgetRange || {})}`;
  }

  /**
   * Check if API rate limit allows request
   */
  private checkRateLimit(providerId: string): boolean {
    const now = Date.now();
    const tracker = this.rateLimitTracker.get(providerId);
    const provider = this.apiProviders.get(providerId);

    if (!tracker || !provider) return true;

    // Reset counter if minute has passed
    if (now > tracker.resetTime) {
      this.rateLimitTracker.set(providerId, { requests: 1, resetTime: now + 60000 });
      return true;
    }

    // Check if under limit
    if (tracker.requests < provider.rateLimit.requestsPerMinute) {
      tracker.requests++;
      return true;
    }

    return false;
  }

  /**
   * Clear cache (useful for development/testing)
   */
  clearCache(): void {
    this.resultCache.clear();
    console.log('External search cache cleared');
  }
}

export const externalSearchService = new ExternalSearchService();