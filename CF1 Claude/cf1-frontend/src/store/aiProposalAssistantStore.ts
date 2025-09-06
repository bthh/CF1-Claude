import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AssetType = 'real_estate' | 'renewable_energy' | 'infrastructure' | 'commodities' | 'technology' | 'agriculture' | 'automotive';

export interface ProposalSuggestion {
  id: string;
  field: string;
  suggestion: string;
  confidence: number;
  reasoning: string;
  applied: boolean;
}

export interface MarketData {
  assetType: AssetType;
  averageAPY: number;
  medianFundingAmount: number;
  successRate: number;
  typicalFundingDays: number;
  competitorCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  marketTrends: string[];
}

export interface AIProposalTemplate {
  id: string;
  assetType: AssetType;
  category: string;
  name: string;
  description: string;
  suggestedAPY: number;
  fundingRange: { min: number; max: number };
  typicalFundingDays: number;
  requiredDocuments: string[];
  riskFactors: string[];
  useOfFunds: string[];
}

export interface ValidationResult {
  field: string;
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

interface AIProposalAssistantState {
  // Current assistance state
  isAnalyzing: boolean;
  currentAssetType: AssetType | null;
  suggestions: ProposalSuggestion[];
  marketData: MarketData | null;
  validationResults: ValidationResult[];
  
  // Templates and data
  templates: AIProposalTemplate[];
  appliedSuggestions: Set<string>;
  
  // AI Generation
  generatingField: string | null;
  lastGenerationTime: string | null;
  
  // Settings
  preferences: {
    enableAutoSuggestions: boolean;
    enableMarketValidation: boolean;
    enableOptimization: boolean;
    suggestionAggressiveness: 'conservative' | 'moderate' | 'aggressive';
  };
  
  // Usage tracking
  usageStats: {
    suggestionsGenerated: number;
    suggestionsApplied: number;
    templatesUsed: number;
    lastUsed: string;
  };
  
  // Actions
  analyzeProposal: (formData: any) => Promise<void>;
  generateSuggestions: (assetType: AssetType, formData: any) => Promise<void>;
  applySuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  generateFieldContent: (field: string, context: any) => Promise<string>;
  loadMarketData: (assetType: AssetType) => Promise<void>;
  validateProposal: (formData: any) => ValidationResult[];
  applyTemplate: (templateId: string) => Partial<any>;
  optimizeProposal: (formData: any) => Promise<ProposalSuggestion[]>;
  
  // Utility actions
  clearSuggestions: () => void;
  updatePreferences: (preferences: Partial<AIProposalAssistantState['preferences']>) => void;
  resetUsageStats: () => void;
}

// Mock market data
const mockMarketData: Record<AssetType, MarketData> = {
  real_estate: {
    assetType: 'real_estate',
    averageAPY: 8.5,
    medianFundingAmount: 2500000,
    successRate: 0.73,
    typicalFundingDays: 45,
    competitorCount: 247,
    riskLevel: 'medium',
    marketTrends: ['Urban development rising', 'Commercial real estate stable', 'Residential demand high']
  },
  renewable_energy: {
    assetType: 'renewable_energy',
    averageAPY: 12.3,
    medianFundingAmount: 5000000,
    successRate: 0.81,
    typicalFundingDays: 60,
    competitorCount: 189,
    riskLevel: 'medium',
    marketTrends: ['Solar installations growing', 'Government incentives strong', 'Grid modernization demand']
  },
  infrastructure: {
    assetType: 'infrastructure',
    averageAPY: 7.2,
    medianFundingAmount: 8000000,
    successRate: 0.69,
    typicalFundingDays: 90,
    competitorCount: 156,
    riskLevel: 'low',
    marketTrends: ['Bridge repairs urgent', 'Smart city initiatives', 'Transportation upgrades needed']
  },
  commodities: {
    assetType: 'commodities',
    averageAPY: 15.7,
    medianFundingAmount: 3000000,
    successRate: 0.65,
    typicalFundingDays: 30,
    competitorCount: 298,
    riskLevel: 'high',
    marketTrends: ['Gold prices volatile', 'Agricultural demand strong', 'Supply chain concerns']
  },
  technology: {
    assetType: 'technology',
    averageAPY: 22.4,
    medianFundingAmount: 1500000,
    successRate: 0.58,
    typicalFundingDays: 35,
    competitorCount: 412,
    riskLevel: 'high',
    marketTrends: ['AI investment surging', 'Cybersecurity critical', 'Cloud infrastructure growth']
  },
  agriculture: {
    assetType: 'agriculture',
    averageAPY: 9.8,
    medianFundingAmount: 4000000,
    successRate: 0.76,
    typicalFundingDays: 50,
    competitorCount: 178,
    riskLevel: 'medium',
    marketTrends: ['Sustainable farming focus', 'Vertical farming growth', 'Food security concerns']
  },
  automotive: {
    assetType: 'automotive',
    averageAPY: 11.2,
    medianFundingAmount: 6000000,
    successRate: 0.67,
    typicalFundingDays: 55,
    competitorCount: 234,
    riskLevel: 'medium',
    marketTrends: ['Electric vehicle transition', 'Autonomous technology', 'Supply chain reshoring']
  }
};

// Mock templates
const mockTemplates: AIProposalTemplate[] = [
  {
    id: 'commercial_real_estate',
    assetType: 'real_estate',
    category: 'Commercial Real Estate',
    name: 'Commercial Office Complex',
    description: 'Multi-tenant commercial office building with stable rental income and long-term leases.',
    suggestedAPY: 8.5,
    fundingRange: { min: 1000000, max: 5000000 },
    typicalFundingDays: 45,
    requiredDocuments: ['Property Appraisal', 'Lease Agreements', 'Financial Statements', 'Environmental Report'],
    riskFactors: [
      'Market vacancy rates affecting rental income',
      'Interest rate changes impacting property values',
      'Economic downturns reducing tenant demand',
      'Property maintenance and capital expenditure requirements'
    ],
    useOfFunds: [
      'Property acquisition and closing costs',
      'Initial renovations and improvements',
      'Working capital for operations',
      'Marketing and leasing expenses',
      'Reserve fund for maintenance'
    ]
  },
  {
    id: 'solar_farm',
    assetType: 'renewable_energy',
    category: 'Solar Energy',
    name: 'Utility-Scale Solar Farm',
    description: 'Large-scale solar photovoltaic installation with power purchase agreements and stable energy revenue.',
    suggestedAPY: 12.0,
    fundingRange: { min: 3000000, max: 15000000 },
    typicalFundingDays: 60,
    requiredDocuments: ['Environmental Impact Assessment', 'Power Purchase Agreement', 'Engineering Study', 'Land Lease Agreement'],
    riskFactors: [
      'Weather variability affecting energy production',
      'Technology degradation over project lifetime',
      'Grid interconnection and transmission risks',
      'Regulatory changes in renewable energy policy'
    ],
    useOfFunds: [
      'Solar panel and inverter procurement',
      'Site preparation and construction',
      'Grid connection infrastructure',
      'Project development costs',
      'Operations and maintenance reserve'
    ]
  },
  {
    id: 'data_center',
    assetType: 'technology',
    category: 'Cloud Infrastructure',
    name: 'Edge Data Center',
    description: 'Strategic edge computing facility serving enterprise clients with high-performance infrastructure.',
    suggestedAPY: 18.5,
    fundingRange: { min: 5000000, max: 25000000 },
    typicalFundingDays: 35,
    requiredDocuments: ['Technical Specifications', 'Client LOIs', 'Market Analysis', 'Cybersecurity Assessment'],
    riskFactors: [
      'Rapid technology obsolescence',
      'Cybersecurity threats and data breaches',
      'Competition from cloud service providers',
      'High power and cooling infrastructure costs'
    ],
    useOfFunds: [
      'Server and networking equipment',
      'Facility construction and buildout',
      'Power and cooling infrastructure',
      'Security systems and monitoring',
      'Working capital and operations'
    ]
  }
];

const defaultPreferences = {
  enableAutoSuggestions: true,
  enableMarketValidation: true,
  enableOptimization: true,
  suggestionAggressiveness: 'moderate' as const
};

export const useAIProposalAssistantStore = create<AIProposalAssistantState>()(
  persist(
    (set, get) => ({
      isAnalyzing: false,
      currentAssetType: null,
      suggestions: [],
      marketData: null,
      validationResults: [],
      templates: mockTemplates,
      appliedSuggestions: new Set(),
      generatingField: null,
      lastGenerationTime: null,
      preferences: defaultPreferences,
      usageStats: {
        suggestionsGenerated: 0,
        suggestionsApplied: 0,
        templatesUsed: 0,
        lastUsed: new Date().toISOString()
      },
      
      analyzeProposal: async (formData: any) => {
        const { aiProposalAssistant } = await import('../services/aiProposalAssistant');
        set({ isAnalyzing: true });
        
        try {
          const assetType = formData.assetType as AssetType;
          if (assetType) {
            const analysis = await aiProposalAssistant.analyzeProposal(formData, assetType);
            
            set({
              currentAssetType: assetType,
              marketData: analysis.marketData,
              validationResults: analysis.validationResults,
              suggestions: [...get().suggestions, ...analysis.suggestions],
              usageStats: {
                ...get().usageStats,
                suggestionsGenerated: get().usageStats.suggestionsGenerated + analysis.suggestions.length,
                lastUsed: new Date().toISOString()
              }
            });
          }
        } catch (error) {
          console.error('AI analysis failed:', error);
          // Fallback to basic analysis
          const assetType = formData.assetType as AssetType;
          if (assetType && assetType in mockMarketData) {
            const marketData = mockMarketData[assetType];
            const validationResults = get().validateProposal(formData);
            
            set({
              currentAssetType: assetType,
              marketData,
              validationResults,
              usageStats: {
                ...get().usageStats,
                lastUsed: new Date().toISOString()
              }
            });
          }
        } finally {
          set({ isAnalyzing: false });
        }
      },
      
      generateSuggestions: async (assetType: AssetType, formData: any) => {
        const { aiProposalAssistant } = await import('../services/aiProposalAssistant');
        
        try {
          const suggestions = await aiProposalAssistant.generateSuggestions(assetType, formData);
          
          set((state) => ({
            suggestions: [...state.suggestions, ...suggestions],
            usageStats: {
              ...state.usageStats,
              suggestionsGenerated: state.usageStats.suggestionsGenerated + suggestions.length
            }
          }));
        } catch (error) {
          console.error('Failed to generate AI suggestions:', error);
          
          // Fallback to basic suggestions
          const marketData = mockMarketData[assetType];
          const suggestions: ProposalSuggestion[] = [];
          
          // Basic APY suggestion
          if (!formData.expectedAPY || parseFloat(formData.expectedAPY) !== marketData.averageAPY) {
            suggestions.push({
              id: `apy_${Date.now()}`,
              field: 'expectedAPY',
              suggestion: marketData.averageAPY.toString(),
              confidence: 0.85,
              reasoning: `Market average APY for ${assetType.replace('_', ' ')} is ${marketData.averageAPY}%. This aligns with investor expectations.`,
              applied: false
            });
          }
          
          set((state) => ({
            suggestions: [...state.suggestions, ...suggestions],
            usageStats: {
              ...state.usageStats,
              suggestionsGenerated: state.usageStats.suggestionsGenerated + suggestions.length
            }
          }));
        }
      },
      
      applySuggestion: (suggestionId: string) => {
        set((state) => ({
          suggestions: state.suggestions.map(s => 
            s.id === suggestionId ? { ...s, applied: true } : s
          ),
          appliedSuggestions: new Set(Array.from(state.appliedSuggestions).concat(suggestionId)),
          usageStats: {
            ...state.usageStats,
            suggestionsApplied: state.usageStats.suggestionsApplied + 1
          }
        }));
      },
      
      dismissSuggestion: (suggestionId: string) => {
        set((state) => ({
          suggestions: state.suggestions.filter(s => s.id !== suggestionId)
        }));
      },
      
      generateFieldContent: async (field: string, context: any) => {
        const { aiProposalAssistant } = await import('../services/aiProposalAssistant');
        set({ generatingField: field });
        
        try {
          const content = await aiProposalAssistant.generateFieldContent(field, context);
          
          set({
            lastGenerationTime: new Date().toISOString(),
            usageStats: {
              ...get().usageStats,
              suggestionsGenerated: get().usageStats.suggestionsGenerated + 1
            }
          });
          
          return content;
        } catch (error) {
          console.error('Failed to generate AI content:', error);
          
          // Fallback to template-based generation
          const assetType = context.assetType as AssetType;
          const template = mockTemplates.find(t => t.assetType === assetType);
          
          let content = '';
          switch (field) {
            case 'description':
              content = template?.description || 'AI-generated description based on asset type and market analysis.';
              break;
            case 'riskFactors':
              content = template?.riskFactors.join('\n• ') || 'AI-generated risk factors based on market analysis.';
              break;
            case 'useOfFunds':
              content = template?.useOfFunds.join('\n• ') || 'AI-generated use of funds breakdown.';
              break;
            default:
              content = `AI-generated content for ${field}`;
          }
          
          return content;
        } finally {
          set({ generatingField: null });
        }
      },
      
      loadMarketData: async (assetType: AssetType) => {
        const { aiProposalAssistant } = await import('../services/aiProposalAssistant');
        
        try {
          const marketData = await aiProposalAssistant.getMarketData(assetType);
          set({ marketData, currentAssetType: assetType });
        } catch (error) {
          console.error('Failed to load market data:', error);
          // Fallback to mock data
          const marketData = mockMarketData[assetType];
          set({ marketData, currentAssetType: assetType });
        }
      },
      
      validateProposal: (formData: any) => {
        // For sync compatibility, use basic validation
        // The AI validation will be called separately through analyzeProposal
        const results: ValidationResult[] = [];
        const assetType = formData.assetType as AssetType;
        const marketData = assetType ? mockMarketData[assetType] : null;
        
        // Basic APY validation
        if (formData.expectedAPY && marketData) {
          const apy = parseFloat(formData.expectedAPY);
          const marketAPY = marketData.averageAPY;
          
          if (apy > marketAPY * 2) {
            results.push({
              field: 'expectedAPY',
              isValid: false,
              message: `APY of ${apy}% is significantly above market average of ${marketAPY}%`,
              severity: 'warning',
              suggestion: `Consider setting APY closer to market average of ${marketAPY}%`
            });
          } else if (apy < marketAPY * 0.5) {
            results.push({
              field: 'expectedAPY',
              isValid: false,
              message: `APY of ${apy}% may be too low to attract investors`,
              severity: 'info',
              suggestion: `Market average is ${marketAPY}% for this asset type`
            });
          }
        }
        
        // Description validation
        if (!formData.description || formData.description.length < 50) {
          results.push({
            field: 'description',
            isValid: false,
            message: 'Description should be more detailed to attract investors',
            severity: 'error',
            suggestion: 'Include asset details, location, and value proposition'
          });
        }
        
        return results;
      },
      
      applyTemplate: (templateId: string) => {
        const template = mockTemplates.find(t => t.id === templateId);
        if (!template) return {};
        
        set((state) => ({
          usageStats: {
            ...state.usageStats,
            templatesUsed: state.usageStats.templatesUsed + 1
          }
        }));
        
        return {
          assetType: template.assetType,
          category: template.category,
          description: template.description,
          expectedAPY: template.suggestedAPY.toString(),
          fundingDays: template.typicalFundingDays,
          riskFactors: template.riskFactors.join('\n• '),
          useOfFunds: template.useOfFunds.join('\n• ')
        };
      },
      
      optimizeProposal: async (formData: any) => {
        set({ isAnalyzing: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 2500));
          
          const suggestions: ProposalSuggestion[] = [];
          const assetType = formData.assetType as AssetType;
          const marketData = assetType ? mockMarketData[assetType] : null;
          
          if (marketData) {
            // Optimization suggestions
            suggestions.push({
              id: `optimize_${Date.now()}_1`,
              field: 'optimization',
              suggestion: `Increase funding timeline to ${marketData.typicalFundingDays} days`,
              confidence: 0.88,
              reasoning: `Longer funding periods have ${Math.round(marketData.successRate * 100)}% success rate`,
              applied: false
            });
            
            suggestions.push({
              id: `optimize_${Date.now()}_2`,
              field: 'optimization',
              suggestion: 'Add quarterly investor updates to increase confidence',
              confidence: 0.92,
              reasoning: 'Regular communication increases investor retention by 34%',
              applied: false
            });
          }
          
          return suggestions;
        } finally {
          set({ isAnalyzing: false });
        }
      },
      
      clearSuggestions: () => {
        set({ suggestions: [], appliedSuggestions: new Set() });
      },
      
      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        }));
      },
      
      resetUsageStats: () => {
        set({
          usageStats: {
            suggestionsGenerated: 0,
            suggestionsApplied: 0,
            templatesUsed: 0,
            lastUsed: new Date().toISOString()
          }
        });
      }
    }),
    {
      name: 'cf1-ai-proposal-assistant',
      partialize: (state) => ({
        preferences: state.preferences,
        usageStats: state.usageStats
      })
    }
  )
);