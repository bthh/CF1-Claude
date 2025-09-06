import type { GuidedAnswer } from '../components/Discovery/GuidedSearchQuestions';

export interface SearchResult {
  item: any;
  score: number;
  matches: any[];
  enhancedScore?: number;
  relevanceReason?: string[];
}

export class GuidedSearchEnhancer {
  /**
   * Enhance search results based on guided search answers
   */
  static enhanceResults(
    baseResults: SearchResult[],
    answers: GuidedAnswer[],
    category: string
  ): SearchResult[] {
    if (!answers.length) {
      return baseResults;
    }

    const answerMap = new Map(answers.map(a => [a.questionId, a.value]));
    
    return baseResults.map(result => {
      const enhanced = { ...result };
      const relevanceReasons: string[] = [];
      let enhancementBonus = 0;

      // Category-specific enhancements
      switch (category.toLowerCase()) {
        case 'real estate':
          enhancementBonus += this.enhanceRealEstate(result, answerMap, relevanceReasons);
          break;
        case 'technology':
          enhancementBonus += this.enhanceTechnology(result, answerMap, relevanceReasons);
          break;
        case 'commodities':
          enhancementBonus += this.enhanceCommodities(result, answerMap, relevanceReasons);
          break;
        case 'collectibles':
          enhancementBonus += this.enhanceCollectibles(result, answerMap, relevanceReasons);
          break;
        case 'energy':
          enhancementBonus += this.enhanceEnergy(result, answerMap, relevanceReasons);
          break;
      }

      enhanced.enhancedScore = Math.min(1.0, result.score + enhancementBonus);
      enhanced.relevanceReason = relevanceReasons;
      
      return enhanced;
    }).sort((a, b) => (b.enhancedScore || b.score) - (a.enhancedScore || a.score));
  }

  private static enhanceRealEstate(
    result: SearchResult,
    answers: Map<string, any>,
    reasons: string[]
  ): number {
    let bonus = 0;
    const { item } = result;
    const title = item.title?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const content = `${title} ${description}`;

    // Location matching
    const locations = answers.get('location') as string[] || [];
    locations.forEach(location => {
      const locationKey = location.toLowerCase();
      if (locationKey.includes('urban') && (content.includes('city') || content.includes('urban') || content.includes('downtown'))) {
        bonus += 0.2;
        reasons.push(`Matches ${location} preference`);
      } else if (locationKey.includes('suburban') && content.includes('suburban')) {
        bonus += 0.2;
        reasons.push(`Matches ${location} preference`);
      } else if (locationKey.includes('international') && (content.includes('global') || content.includes('international'))) {
        bonus += 0.15;
        reasons.push(`Matches ${location} preference`);
      }
    });

    // Property type matching
    const propertyTypes = answers.get('property_type') as string[] || [];
    propertyTypes.forEach(type => {
      const typeKey = type.toLowerCase();
      if (typeKey.includes('residential') && content.includes('residential')) {
        bonus += 0.25;
        reasons.push(`Matches ${type} focus`);
      } else if (typeKey.includes('commercial') && content.includes('commercial')) {
        bonus += 0.25;
        reasons.push(`Matches ${type} focus`);
      } else if (typeKey.includes('airbnb') && (content.includes('airbnb') || content.includes('vacation') || content.includes('rental'))) {
        bonus += 0.3;
        reasons.push(`Matches ${type} model`);
      }
    });

    // Investment features matching
    const features = answers.get('key_features') as string[] || [];
    features.forEach(feature => {
      const featureKey = feature.toLowerCase();
      if (featureKey.includes('cash flow') && (content.includes('income') || content.includes('cash flow') || content.includes('rental'))) {
        bonus += 0.2;
        reasons.push(`Aligns with ${feature} goal`);
      } else if (featureKey.includes('appreciation') && (content.includes('growth') || content.includes('appreciation'))) {
        bonus += 0.2;
        reasons.push(`Aligns with ${feature} goal`);
      }
    });

    return Math.min(0.4, bonus); // Cap bonus at 0.4
  }

  private static enhanceTechnology(
    result: SearchResult,
    answers: Map<string, any>,
    reasons: string[]
  ): number {
    let bonus = 0;
    const { item } = result;
    const title = item.title?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const content = `${title} ${description}`;

    // Industry focus matching
    const industries = answers.get('industry_focus') as string[] || [];
    industries.forEach(industry => {
      const industryKey = industry.toLowerCase();
      if (industryKey.includes('ai') && (content.includes('ai') || content.includes('artificial intelligence') || content.includes('machine learning'))) {
        bonus += 0.25;
        reasons.push(`Matches ${industry} focus`);
      } else if (industryKey.includes('fintech') && (content.includes('fintech') || content.includes('financial technology'))) {
        bonus += 0.25;
        reasons.push(`Matches ${industry} sector`);
      } else if (industryKey.includes('saas') && content.includes('saas')) {
        bonus += 0.2;
        reasons.push(`Matches ${industry} model`);
      }
    });

    // Investment stage matching
    const stages = answers.get('investment_stage') as string[] || [];
    stages.forEach(stage => {
      const stageKey = stage.toLowerCase();
      if (stageKey.includes('early') && (content.includes('startup') || content.includes('seed') || content.includes('early'))) {
        bonus += 0.2;
        reasons.push(`Matches ${stage} preference`);
      } else if (stageKey.includes('growth') && (content.includes('series b') || content.includes('growth') || content.includes('scale'))) {
        bonus += 0.2;
        reasons.push(`Matches ${stage} preference`);
      }
    });

    return Math.min(0.4, bonus);
  }

  private static enhanceCommodities(
    result: SearchResult,
    answers: Map<string, any>,
    reasons: string[]
  ): number {
    let bonus = 0;
    const { item } = result;
    const title = item.title?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const content = `${title} ${description}`;

    // Commodity type matching
    const types = answers.get('commodity_type') as string[] || [];
    types.forEach(type => {
      const typeKey = type.toLowerCase();
      if (typeKey.includes('gold') && (content.includes('gold') || content.includes('precious metal'))) {
        bonus += 0.3;
        reasons.push(`Matches ${type} investment`);
      } else if (typeKey.includes('energy') && (content.includes('oil') || content.includes('gas') || content.includes('energy'))) {
        bonus += 0.25;
        reasons.push(`Matches ${type} sector`);
      } else if (typeKey.includes('agricultural') && (content.includes('agriculture') || content.includes('grain') || content.includes('livestock'))) {
        bonus += 0.25;
        reasons.push(`Matches ${type} focus`);
      }
    });

    return Math.min(0.4, bonus);
  }

  private static enhanceCollectibles(
    result: SearchResult,
    answers: Map<string, any>,
    reasons: string[]
  ): number {
    let bonus = 0;
    const { item } = result;
    const title = item.title?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const content = `${title} ${description}`;

    // Category matching
    const categories = answers.get('category') as string[] || [];
    categories.forEach(category => {
      const categoryKey = category.toLowerCase();
      if (categoryKey.includes('art') && content.includes('art')) {
        bonus += 0.3;
        reasons.push(`Matches ${category} collecting`);
      } else if (categoryKey.includes('sports') && (content.includes('sports') || content.includes('memorabilia'))) {
        bonus += 0.3;
        reasons.push(`Matches ${category} focus`);
      } else if (categoryKey.includes('wine') && content.includes('wine')) {
        bonus += 0.3;
        reasons.push(`Matches ${category} investment`);
      }
    });

    return Math.min(0.4, bonus);
  }

  private static enhanceEnergy(
    result: SearchResult,
    answers: Map<string, any>,
    reasons: string[]
  ): number {
    let bonus = 0;
    const { item } = result;
    const title = item.title?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const content = `${title} ${description}`;

    // Energy type matching
    const types = answers.get('energy_type') as string[] || [];
    types.forEach(type => {
      const typeKey = type.toLowerCase();
      if (typeKey.includes('solar') && content.includes('solar')) {
        bonus += 0.25;
        reasons.push(`Matches ${type} focus`);
      } else if (typeKey.includes('wind') && content.includes('wind')) {
        bonus += 0.25;
        reasons.push(`Matches ${type} technology`);
      } else if (typeKey.includes('renewable') && (content.includes('renewable') || content.includes('clean energy'))) {
        bonus += 0.2;
        reasons.push(`Matches renewable energy focus`);
      }
    });

    return Math.min(0.4, bonus);
  }

  /**
   * Generate mock enhanced results for demonstration
   */
  static generateMockEnhancedResults(
    originalResults: SearchResult[],
    answers: GuidedAnswer[],
    category: string
  ): SearchResult[] {
    // If we have few or no original results, generate some mock enhanced results
    if (originalResults.length < 3) {
      const mockResults = this.createMockResultsForCategory(category, answers);
      return [...originalResults, ...mockResults].slice(0, 10);
    }
    
    return this.enhanceResults(originalResults, answers, category);
  }

  private static createMockResultsForCategory(
    category: string,
    answers: GuidedAnswer[]
  ): SearchResult[] {
    const answerMap = new Map(answers.map(a => [a.questionId, a.value]));
    
    switch (category.toLowerCase()) {
      case 'real estate':
        return this.createRealEstateMockResults(answerMap);
      case 'technology':
        return this.createTechnologyMockResults(answerMap);
      case 'commodities':
        return this.createCommoditiesMockResults(answerMap);
      case 'collectibles':
        return this.createCollectiblesMockResults(answerMap);
      case 'energy':
        return this.createEnergyMockResults(answerMap);
      default:
        return [];
    }
  }

  private static createRealEstateMockResults(answers: Map<string, any>): SearchResult[] {
    const locations = answers.get('location') as string[] || [];
    const propertyTypes = answers.get('property_type') as string[] || [];
    const budget = answers.get('investment_amount') as number;
    
    const results: SearchResult[] = [];
    
    if (propertyTypes.includes('Hospitality (Hotels/AirBnB)')) {
      results.push({
        item: {
          id: 'enhanced_airbnb_1',
          title: 'Short-Term Rental Investment Opportunities',
          description: 'Discover high-yield AirBnB properties in emerging vacation markets with strong occupancy rates and rental income potential.',
          category: 'Real Estate',
          type: 'insight'
        },
        score: 0.9,
        matches: [],
        enhancedScore: 0.95,
        relevanceReason: ['Matches Hospitality (Hotels/AirBnB) focus', 'High rental income potential']
      });
    }

    if (locations.includes('Urban Centers')) {
      results.push({
        item: {
          id: 'enhanced_urban_1',
          title: 'Urban Mixed-Use Development Guide',
          description: 'Complete framework for investing in urban mixed-use properties with retail and residential components in city centers.',
          category: 'Real Estate',
          type: 'documentation'
        },
        score: 0.85,
        matches: [],
        enhancedScore: 0.92,
        relevanceReason: ['Matches Urban Centers preference', 'Mixed-use development opportunity']
      });
    }

    return results;
  }

  private static createTechnologyMockResults(answers: Map<string, any>): SearchResult[] {
    const industries = answers.get('industry_focus') as string[] || [];
    const stages = answers.get('investment_stage') as string[] || [];
    
    const results: SearchResult[] = [];
    
    if (industries.includes('Artificial Intelligence')) {
      results.push({
        item: {
          id: 'enhanced_ai_1',
          title: 'AI Infrastructure Investment Deep Dive',
          description: 'Comprehensive analysis of AI infrastructure opportunities including data centers, GPU computing, and machine learning platforms.',
          category: 'Technology',
          type: 'insight'
        },
        score: 0.88,
        matches: [],
        enhancedScore: 0.95,
        relevanceReason: ['Matches Artificial Intelligence focus', 'Infrastructure investment opportunity']
      });
    }

    if (industries.includes('Fintech')) {
      results.push({
        item: {
          id: 'enhanced_fintech_1',
          title: 'Fintech Startup Evaluation Framework',
          description: 'Learn how to evaluate fintech startups, understand regulatory considerations, and identify high-potential investment opportunities.',
          category: 'Technology',
          type: 'video'
        },
        score: 0.82,
        matches: [],
        enhancedScore: 0.90,
        relevanceReason: ['Matches Fintech sector', 'Startup evaluation guidance']
      });
    }

    return results;
  }

  private static createCommoditiesMockResults(answers: Map<string, any>): SearchResult[] {
    const types = answers.get('commodity_type') as string[] || [];
    
    const results: SearchResult[] = [];
    
    if (types.includes('Precious Metals (Gold/Silver)')) {
      results.push({
        item: {
          id: 'enhanced_gold_1',
          title: 'Gold Investment Strategies for 2024',
          description: 'Advanced strategies for precious metals investing including physical gold, ETFs, mining stocks, and storage considerations.',
          category: 'Commodities',
          type: 'insight'
        },
        score: 0.90,
        matches: [],
        enhancedScore: 0.95,
        relevanceReason: ['Matches Precious Metals (Gold/Silver) investment', 'Comprehensive gold strategies']
      });
    }

    return results;
  }

  private static createCollectiblesMockResults(answers: Map<string, any>): SearchResult[] {
    const categories = answers.get('category') as string[] || [];
    
    const results: SearchResult[] = [];
    
    if (categories.includes('Art (Paintings/Sculptures)')) {
      results.push({
        item: {
          id: 'enhanced_art_1',
          title: 'Art Investment Authentication Guide',
          description: 'Essential guide to art authentication, provenance verification, and building a profitable art collection portfolio.',
          category: 'Collectibles',
          type: 'documentation'
        },
        score: 0.85,
        matches: [],
        enhancedScore: 0.93,
        relevanceReason: ['Matches Art (Paintings/Sculptures) collecting', 'Authentication and provenance focus']
      });
    }

    return results;
  }

  private static createEnergyMockResults(answers: Map<string, any>): SearchResult[] {
    const types = answers.get('energy_type') as string[] || [];
    
    const results: SearchResult[] = [];
    
    if (types.includes('Solar Power')) {
      results.push({
        item: {
          id: 'enhanced_solar_1',
          title: 'Solar Farm Investment Opportunities',
          description: 'Explore utility-scale solar investment opportunities with government incentives, long-term contracts, and steady returns.',
          category: 'Energy',
          type: 'insight'
        },
        score: 0.87,
        matches: [],
        enhancedScore: 0.94,
        relevanceReason: ['Matches Solar Power focus', 'Utility-scale investment opportunity']
      });
    }

    return results;
  }
}