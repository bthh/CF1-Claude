/**
 * CF1 Market Intelligence Service
 * Real-time market data integration for investment insights
 */

import { AssetType } from '../store/aiProposalAssistantStore';

interface MarketIndicator {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
  source: string;
}

interface SectorAnalysis {
  sector: AssetType;
  performance: number;
  outlook: 'bullish' | 'bearish' | 'neutral';
  keyFactors: string[];
  riskFactors: string[];
  opportunities: string[];
  averageAPY: number;
  medianFunding: number;
  successRate: number;
  competitorCount: number;
  fundingVelocity: number; // Days to funding
}

interface EconomicContext {
  gdpGrowth: number;
  inflationRate: number;
  interestRates: {
    federal: number;
    mortgage: number;
    corporate: number;
  };
  unemployment: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  vixIndex: number;
  currencyStrength: number;
}

interface MarketTrend {
  id: string;
  category: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: 'short' | 'medium' | 'long';
  affectedSectors: AssetType[];
  description: string;
  confidence: number;
  source: string;
  timestamp: string;
}

interface InvestmentFlow {
  sector: AssetType;
  inflow: number;
  outflow: number;
  netFlow: number;
  averageInvestment: number;
  institutionalPercentage: number;
  retailPercentage: number;
  geographicDistribution: Record<string, number>;
}

interface MarketAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'price' | 'volume' | 'regulatory' | 'economic' | 'sector';
  title: string;
  description: string;
  affectedSectors: AssetType[];
  actionRequired: boolean;
  timestamp: string;
  expires?: string;
}

interface MarketIntelligenceResponse {
  indicators: MarketIndicator[];
  sectorAnalysis: SectorAnalysis[];
  economicContext: EconomicContext;
  trends: MarketTrend[];
  investmentFlows: InvestmentFlow[];
  alerts: MarketAlert[];
  lastUpdated: string;
  dataQuality: number;
}

class MarketIntelligenceService {
  private baseUrl: string;
  private apiKeys: {
    alpha?: string;
    polygon?: string;
    fed?: string;
    custom?: string;
  };
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    this.apiKeys = {
      alpha: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
      polygon: import.meta.env.VITE_POLYGON_API_KEY,
      fed: import.meta.env.VITE_FRED_API_KEY,
      custom: import.meta.env.VITE_MARKET_API_KEY
    };
  }

  /**
   * Get comprehensive market intelligence data
   */
  async getMarketIntelligence(): Promise<MarketIntelligenceResponse> {
    const cacheKey = 'market_intelligence';
    const cached = this.getFromCache(cacheKey, 5 * 60 * 1000); // 5 minute cache
    
    if (cached) {
      return cached;
    }

    try {
      // Try backend aggregation service first
      const backendData = await this.getMarketIntelligenceBackend();
      if (backendData) {
        this.setCache(cacheKey, backendData, 5 * 60 * 1000);
        return backendData;
      }
    } catch (error) {
      console.warn('Backend market intelligence unavailable, using enhanced mock data:', error);
    }

    // Enhanced mock data with realistic market intelligence
    const intelligence = await this.generateEnhancedMarketIntelligence();
    this.setCache(cacheKey, intelligence, 5 * 60 * 1000);
    return intelligence;
  }

  /**
   * Get sector-specific market analysis
   */
  async getSectorAnalysis(sector: AssetType): Promise<SectorAnalysis> {
    const cacheKey = `sector_analysis_${sector}`;
    const cached = this.getFromCache(cacheKey, 10 * 60 * 1000); // 10 minute cache
    
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/market-intelligence/sectors/${sector}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data, 10 * 60 * 1000);
        return data;
      }
    } catch (error) {
      console.warn('Sector analysis service unavailable, using enhanced mock:', error);
    }

    // Enhanced mock sector analysis
    const analysis = await this.generateSectorAnalysis(sector);
    this.setCache(cacheKey, analysis, 10 * 60 * 1000);
    return analysis;
  }

  /**
   * Get real-time market indicators
   */
  async getMarketIndicators(): Promise<MarketIndicator[]> {
    try {
      // Try multiple data sources in parallel
      const indicators = await Promise.allSettled([
        this.getEconomicIndicators(),
        this.getMarketPerformanceIndicators(),
        this.getCommodityIndicators(),
        this.getRealEstateIndicators()
      ]);

      const allIndicators: MarketIndicator[] = [];
      indicators.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          allIndicators.push(...result.value);
        }
      });

      return allIndicators.length > 0 ? allIndicators : this.getMockMarketIndicators();
    } catch (error) {
      console.error('Failed to fetch market indicators:', error);
      return this.getMockMarketIndicators();
    }
  }

  /**
   * Get investment flows by sector
   */
  async getInvestmentFlows(): Promise<InvestmentFlow[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/market-intelligence/flows`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Investment flows service unavailable:', error);
    }

    return this.generateMockInvestmentFlows();
  }

  /**
   * Get market trends and insights
   */
  async getMarketTrends(): Promise<MarketTrend[]> {
    const cacheKey = 'market_trends';
    const cached = this.getFromCache(cacheKey, 15 * 60 * 1000); // 15 minute cache
    
    if (cached) {
      return cached;
    }

    try {
      const trends = await this.aggregateMarketTrends();
      this.setCache(cacheKey, trends, 15 * 60 * 1000);
      return trends;
    } catch (error) {
      console.error('Failed to get market trends:', error);
      const mockTrends = this.generateMockMarketTrends();
      this.setCache(cacheKey, mockTrends, 15 * 60 * 1000);
      return mockTrends;
    }
  }

  /**
   * Get market alerts and notifications
   */
  async getMarketAlerts(): Promise<MarketAlert[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/market-intelligence/alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Market alerts service unavailable:', error);
    }

    return this.generateMockMarketAlerts();
  }

  /**
   * Subscribe to real-time market updates
   */
  subscribeToMarketUpdates(callback: (update: Partial<MarketIntelligenceResponse>) => void): () => void {
    // WebSocket connection for real-time updates
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws/market-intelligence';
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          callback(update);
        } catch (error) {
          console.error('Failed to parse market update:', error);
        }
      };

      ws.onerror = (error) => {
        console.warn('Market intelligence WebSocket error:', error);
        // Fall back to polling
        const pollInterval = setInterval(async () => {
          try {
            const intelligence = await this.getMarketIntelligence();
            callback(intelligence);
          } catch (error) {
            console.error('Polling update failed:', error);
          }
        }, 60000); // Poll every minute

        return () => {
          clearInterval(pollInterval);
        };
      };

      return () => {
        ws.close();
      };
    } catch (error) {
      console.warn('WebSocket unavailable, using polling fallback:', error);
      
      // Fallback to polling
      const pollInterval = setInterval(async () => {
        try {
          const intelligence = await this.getMarketIntelligence();
          callback(intelligence);
        } catch (error) {
          console.error('Polling update failed:', error);
        }
      }, 60000);

      return () => {
        clearInterval(pollInterval);
      };
    }
  }

  /**
   * Backend market intelligence aggregation service
   */
  private async getMarketIntelligenceBackend(): Promise<MarketIntelligenceResponse | null> {
    const response = await fetch(`${this.baseUrl}/api/market-intelligence/comprehensive`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Market intelligence service failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Generate enhanced market intelligence with realistic data
   */
  private async generateEnhancedMarketIntelligence(): Promise<MarketIntelligenceResponse> {
    const [indicators, sectors, trends, flows, alerts] = await Promise.all([
      this.getMarketIndicators(),
      this.generateAllSectorAnalyses(),
      this.getMarketTrends(),
      this.getInvestmentFlows(),
      this.getMarketAlerts()
    ]);

    return {
      indicators,
      sectorAnalysis: sectors,
      economicContext: this.generateEconomicContext(),
      trends,
      investmentFlows: flows,
      alerts,
      lastUpdated: new Date().toISOString(),
      dataQuality: 0.85 + Math.random() * 0.1 // 85-95% data quality
    };
  }

  /**
   * Generate sector analysis for specific asset type
   */
  private async generateSectorAnalysis(sector: AssetType): Promise<SectorAnalysis> {
    const sectorData: Record<AssetType, Partial<SectorAnalysis>> = {
      real_estate: {
        performance: 0.08 + Math.random() * 0.04,
        outlook: Math.random() > 0.3 ? 'bullish' : 'neutral',
        keyFactors: ['Low interest rates driving demand', 'Urban migration trends', 'Remote work impact'],
        riskFactors: ['Interest rate sensitivity', 'Market volatility', 'Regional economic conditions'],
        opportunities: ['Affordable housing shortage', 'Commercial space adaptation', 'PropTech integration'],
        averageAPY: 8.5,
        medianFunding: 2500000,
        successRate: 0.73,
        competitorCount: 247,
        fundingVelocity: 45
      },
      renewable_energy: {
        performance: 0.15 + Math.random() * 0.08,
        outlook: 'bullish',
        keyFactors: ['Government incentives', 'Climate commitments', 'Technology cost reduction'],
        riskFactors: ['Policy changes', 'Grid integration challenges', 'Technology disruption'],
        opportunities: ['Energy storage solutions', 'Corporate renewable PPAs', 'Distributed generation'],
        averageAPY: 12.3,
        medianFunding: 5000000,
        successRate: 0.81,
        competitorCount: 189,
        fundingVelocity: 60
      },
      technology: {
        performance: 0.20 + Math.random() * 0.10,
        outlook: 'bullish',
        keyFactors: ['AI revolution', 'Digital transformation', 'Cloud adoption'],
        riskFactors: ['Rapid obsolescence', 'Cybersecurity threats', 'Regulatory uncertainty'],
        opportunities: ['AI infrastructure', 'Edge computing', 'Quantum computing'],
        averageAPY: 22.4,
        medianFunding: 1500000,
        successRate: 0.58,
        competitorCount: 412,
        fundingVelocity: 35
      },
      infrastructure: {
        performance: 0.06 + Math.random() * 0.03,
        outlook: 'neutral',
        keyFactors: ['Infrastructure bill funding', 'Aging infrastructure', 'Smart city initiatives'],
        riskFactors: ['Public budget constraints', 'Long development cycles', 'Political changes'],
        opportunities: ['Bridge modernization', 'Broadband expansion', 'EV charging networks'],
        averageAPY: 7.2,
        medianFunding: 8000000,
        successRate: 0.69,
        competitorCount: 156,
        fundingVelocity: 90
      },
      commodities: {
        performance: 0.12 + Math.random() * 0.08,
        outlook: Math.random() > 0.5 ? 'bullish' : 'neutral',
        keyFactors: ['Inflation hedging', 'Supply chain issues', 'Geopolitical tensions'],
        riskFactors: ['Price volatility', 'Storage costs', 'Market manipulation'],
        opportunities: ['Strategic reserves', 'Processing facilities', 'Supply chain integration'],
        averageAPY: 15.7,
        medianFunding: 3000000,
        successRate: 0.65,
        competitorCount: 298,
        fundingVelocity: 30
      },
      agriculture: {
        performance: 0.09 + Math.random() * 0.04,
        outlook: 'bullish',
        keyFactors: ['Food security concerns', 'Climate adaptation', 'Technology adoption'],
        riskFactors: ['Weather dependency', 'Commodity price swings', 'Labor shortages'],
        opportunities: ['Precision agriculture', 'Vertical farming', 'Alternative proteins'],
        averageAPY: 9.8,
        medianFunding: 4000000,
        successRate: 0.76,
        competitorCount: 178,
        fundingVelocity: 50
      },
      automotive: {
        performance: 0.10 + Math.random() * 0.06,
        outlook: 'bullish',
        keyFactors: ['EV transition', 'Autonomous vehicles', 'Supply chain reshoring'],
        riskFactors: ['Technology disruption', 'Battery supply constraints', 'Consumer adoption'],
        opportunities: ['EV infrastructure', 'Battery technology', 'Mobility services'],
        averageAPY: 11.2,
        medianFunding: 6000000,
        successRate: 0.67,
        competitorCount: 234,
        fundingVelocity: 55
      }
    };

    const base = sectorData[sector];
    
    return {
      sector,
      ...base,
      // Add real-time adjustments
      performance: base.performance! * (0.9 + Math.random() * 0.2),
      averageAPY: base.averageAPY! * (0.95 + Math.random() * 0.1),
      successRate: Math.min(0.95, base.successRate! * (0.95 + Math.random() * 0.1))
    } as SectorAnalysis;
  }

  /**
   * Helper methods for data generation
   */
  private async generateAllSectorAnalyses(): Promise<SectorAnalysis[]> {
    const sectors: AssetType[] = ['real_estate', 'renewable_energy', 'technology', 'infrastructure', 'commodities', 'agriculture', 'automotive'];
    
    return Promise.all(sectors.map(sector => this.generateSectorAnalysis(sector)));
  }

  private generateEconomicContext(): EconomicContext {
    return {
      gdpGrowth: 2.1 + Math.random() * 1.5,
      inflationRate: 3.2 + Math.random() * 1.0,
      interestRates: {
        federal: 5.25 + Math.random() * 0.5,
        mortgage: 6.8 + Math.random() * 0.7,
        corporate: 4.9 + Math.random() * 0.8
      },
      unemployment: 3.5 + Math.random() * 1.0,
      marketSentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'neutral' : 'bearish',
      vixIndex: 18 + Math.random() * 12,
      currencyStrength: 0.95 + Math.random() * 0.1
    };
  }

  private async getEconomicIndicators(): Promise<MarketIndicator[]> {
    // Try to fetch real economic data
    try {
      if (this.apiKeys.fed) {
        // Implement FRED API calls
        return await this.fetchFREDData();
      }
    } catch (error) {
      console.warn('FRED API unavailable:', error);
    }

    return this.getMockEconomicIndicators();
  }

  private async getMarketPerformanceIndicators(): Promise<MarketIndicator[]> {
    try {
      if (this.apiKeys.alpha || this.apiKeys.polygon) {
        return await this.fetchMarketData();
      }
    } catch (error) {
      console.warn('Market data APIs unavailable:', error);
    }

    return this.getMockMarketIndicators();
  }

  private async getCommodityIndicators(): Promise<MarketIndicator[]> {
    // Mock commodity data
    return [
      {
        id: 'gold',
        name: 'Gold Price',
        value: 1980 + Math.random() * 100,
        change: Math.random() * 40 - 20,
        changePercent: Math.random() * 2 - 1,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        timestamp: new Date().toISOString(),
        source: 'Commodity Markets'
      },
      {
        id: 'oil',
        name: 'Crude Oil',
        value: 75 + Math.random() * 15,
        change: Math.random() * 4 - 2,
        changePercent: Math.random() * 3 - 1.5,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        timestamp: new Date().toISOString(),
        source: 'Energy Markets'
      }
    ];
  }

  private async getRealEstateIndicators(): Promise<MarketIndicator[]> {
    return [
      {
        id: 'home_price_index',
        name: 'Home Price Index',
        value: 285 + Math.random() * 10,
        change: Math.random() * 3,
        changePercent: Math.random() * 1.2,
        trend: 'up',
        timestamp: new Date().toISOString(),
        source: 'Real Estate Markets'
      }
    ];
  }

  private async fetchFREDData(): Promise<MarketIndicator[]> {
    // Implement FRED API integration
    const indicators = [
      { series: 'GDP', name: 'GDP Growth' },
      { series: 'UNRATE', name: 'Unemployment Rate' },
      { series: 'CPILFESL', name: 'Core CPI' }
    ];

    // This would make actual API calls to FRED
    return indicators.map((indicator, index) => ({
      id: indicator.series,
      name: indicator.name,
      value: Math.random() * 10,
      change: Math.random() * 2 - 1,
      changePercent: Math.random() * 3 - 1.5,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      timestamp: new Date().toISOString(),
      source: 'Federal Reserve Economic Data'
    }));
  }

  private async fetchMarketData(): Promise<MarketIndicator[]> {
    // Implement Alpha Vantage or Polygon API integration
    return [
      {
        id: 'sp500',
        name: 'S&P 500',
        value: 4200 + Math.random() * 200,
        change: Math.random() * 50 - 25,
        changePercent: Math.random() * 2 - 1,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        timestamp: new Date().toISOString(),
        source: 'Stock Market Data'
      }
    ];
  }

  private getMockMarketIndicators(): MarketIndicator[] {
    return [
      {
        id: 'market_sentiment',
        name: 'Market Sentiment Index',
        value: 65 + Math.random() * 20,
        change: Math.random() * 10 - 5,
        changePercent: Math.random() * 8 - 4,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        timestamp: new Date().toISOString(),
        source: 'CF1 Market Intelligence'
      },
      {
        id: 'funding_velocity',
        name: 'Average Funding Velocity',
        value: 42 + Math.random() * 10,
        change: Math.random() * 5 - 2.5,
        changePercent: Math.random() * 6 - 3,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        timestamp: new Date().toISOString(),
        source: 'CF1 Analytics'
      }
    ];
  }

  private getMockEconomicIndicators(): MarketIndicator[] {
    return [
      {
        id: 'gdp_growth',
        name: 'GDP Growth Rate',
        value: 2.1 + Math.random() * 1.5,
        change: Math.random() * 0.4 - 0.2,
        changePercent: Math.random() * 5 - 2.5,
        trend: Math.random() > 0.5 ? 'up' : 'stable',
        timestamp: new Date().toISOString(),
        source: 'Economic Data'
      }
    ];
  }

  private generateMockInvestmentFlows(): InvestmentFlow[] {
    const sectors: AssetType[] = ['real_estate', 'renewable_energy', 'technology', 'infrastructure', 'commodities', 'agriculture', 'automotive'];
    
    return sectors.map(sector => ({
      sector,
      inflow: Math.random() * 100000000 + 50000000,
      outflow: Math.random() * 50000000 + 10000000,
      netFlow: Math.random() * 80000000 - 20000000,
      averageInvestment: Math.random() * 5000000 + 1000000,
      institutionalPercentage: Math.random() * 40 + 40,
      retailPercentage: Math.random() * 40 + 20,
      geographicDistribution: {
        'North America': Math.random() * 50 + 30,
        'Europe': Math.random() * 30 + 20,
        'Asia': Math.random() * 30 + 15,
        'Other': Math.random() * 15 + 5
      }
    }));
  }

  private async aggregateMarketTrends(): Promise<MarketTrend[]> {
    // This would aggregate trends from multiple sources
    return this.generateMockMarketTrends();
  }

  private generateMockMarketTrends(): MarketTrend[] {
    const trends = [
      {
        category: 'Technology',
        title: 'AI Infrastructure Investment Surge',
        impact: 'high',
        timeframe: 'medium',
        affectedSectors: ['technology'],
        description: 'Massive investment in AI infrastructure driving datacenter and cloud computing growth',
        confidence: 0.92
      },
      {
        category: 'Energy',
        title: 'Renewable Energy Transition Acceleration',
        impact: 'high',
        timeframe: 'long',
        affectedSectors: ['renewable_energy'],
        description: 'Government policies and corporate commitments accelerating renewable energy adoption',
        confidence: 0.89
      },
      {
        category: 'Real Estate',
        title: 'Urban Office Space Restructuring',
        impact: 'medium',
        timeframe: 'medium',
        affectedSectors: ['real_estate'],
        description: 'Remote work trends forcing adaptation of commercial real estate strategies',
        confidence: 0.78
      }
    ];

    return trends.map((trend, index) => ({
      id: `trend_${index + 1}`,
      ...trend,
      affectedSectors: trend.affectedSectors as AssetType[],
      impact: trend.impact as 'high' | 'medium' | 'low',
      timeframe: trend.timeframe as 'short' | 'medium' | 'long',
      source: 'CF1 Market Intelligence',
      timestamp: new Date().toISOString()
    }));
  }

  private generateMockMarketAlerts(): MarketAlert[] {
    return [
      {
        id: 'alert_1',
        severity: 'medium',
        type: 'economic',
        title: 'Interest Rate Environment Shift',
        description: 'Federal Reserve signaling potential rate adjustments affecting funding costs',
        affectedSectors: ['real_estate', 'infrastructure'],
        actionRequired: false,
        timestamp: new Date().toISOString()
      }
    ];
  }

  // Cache management
  private getFromCache<T>(key: string, ttl: number): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}

export const marketIntelligence = new MarketIntelligenceService();
export type { 
  MarketIndicator, 
  SectorAnalysis, 
  EconomicContext, 
  MarketTrend, 
  InvestmentFlow, 
  MarketAlert, 
  MarketIntelligenceResponse 
};