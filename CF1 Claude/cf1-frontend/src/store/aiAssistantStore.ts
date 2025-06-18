import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIAssistantFeature = 
  | 'asset_analysis'
  | 'market_insights'
  | 'performance_optimization'
  | 'content_generation'
  | 'risk_assessment'
  | 'compliance_check';

export type SubscriptionTier = 'free' | 'premium' | 'enterprise';

export interface AIInsight {
  id: string;
  type: AIAssistantFeature;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  timestamp: string;
  assetId?: string;
  metadata?: {
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    timeframe: string;
    category: string;
    [key: string]: any;
  };
}

export interface MarketAnalysis {
  id: string;
  assetId: string;
  sector: string;
  competitorCount: number;
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  growthTrend: 'positive' | 'negative' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  lastUpdated: string;
}

export interface PerformanceRecommendation {
  id: string;
  assetId: string;
  category: 'financial' | 'operational' | 'marketing' | 'governance';
  title: string;
  description: string;
  expectedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToImplement: string;
  priority: number;
}

export interface ContentSuggestion {
  id: string;
  type: 'update' | 'communication' | 'report' | 'proposal';
  title: string;
  content: string;
  targetAudience: string;
  tone: 'professional' | 'friendly' | 'urgent' | 'celebratory';
  generatedAt: string;
}

export interface RiskAlert {
  id: string;
  assetId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'financial' | 'regulatory' | 'operational' | 'market';
  title: string;
  description: string;
  mitigation: string[];
  deadline?: string;
  acknowledged: boolean;
}

export interface ComplianceCheck {
  id: string;
  assetId: string;
  category: 'SEC' | 'FINRA' | 'tax' | 'disclosure' | 'reporting';
  status: 'compliant' | 'warning' | 'violation' | 'needs_review';
  title: string;
  description: string;
  requirements: string[];
  nextAction: string;
  deadline?: string;
}

interface AIAssistantState {
  // Subscription and access
  subscriptionTier: SubscriptionTier;
  premiumFeatures: AIAssistantFeature[];
  usageStats: {
    dailyQueries: number;
    monthlyQueries: number;
    lastReset: string;
  };
  
  // AI Insights and Analysis
  insights: AIInsight[];
  marketAnalyses: MarketAnalysis[];
  performanceRecommendations: PerformanceRecommendation[];
  contentSuggestions: ContentSuggestion[];
  riskAlerts: RiskAlert[];
  complianceChecks: ComplianceCheck[];
  
  // AI Chat Interface
  chatHistory: Array<{
    id: string;
    type: 'user' | 'assistant';
    message: string;
    timestamp: string;
    context?: {
      assetId?: string;
      feature?: AIAssistantFeature;
    };
  }>;
  isProcessing: boolean;
  
  // Settings
  preferences: {
    enableRealTimeInsights: boolean;
    riskAlertThreshold: 'low' | 'medium' | 'high';
    autoGenerateContent: boolean;
    insightFrequency: 'daily' | 'weekly' | 'monthly';
    enabledFeatures: AIAssistantFeature[];
  };
  
  // Actions
  analyzeAsset: (assetId: string) => Promise<void>;
  generateMarketInsights: (assetId: string, sector: string) => Promise<void>;
  createPerformanceRecommendations: (assetId: string) => Promise<void>;
  generateContent: (type: ContentSuggestion['type'], prompt: string) => Promise<ContentSuggestion>;
  performRiskAssessment: (assetId: string) => Promise<void>;
  runComplianceCheck: (assetId: string) => Promise<void>;
  sendChatMessage: (message: string, context?: any) => Promise<void>;
  
  // Utility actions
  acknowledgeRisk: (riskId: string) => void;
  dismissInsight: (insightId: string) => void;
  updatePreferences: (preferences: Partial<AIAssistantState['preferences']>) => void;
  upgradeSubscription: (tier: SubscriptionTier) => void;
  
  // Data management
  loadUserData: () => Promise<void>;
  clearChatHistory: () => void;
  exportInsights: () => void;
}

// Default preferences
const defaultPreferences = {
  enableRealTimeInsights: true,
  riskAlertThreshold: 'medium' as const,
  autoGenerateContent: false,
  insightFrequency: 'weekly' as const,
  enabledFeatures: ['asset_analysis', 'market_insights', 'risk_assessment'] as AIAssistantFeature[]
};

// Mock data for development
const mockInsights: AIInsight[] = [
  {
    id: 'insight_1',
    type: 'asset_analysis',
    title: 'Asset Performance Above Sector Average',
    description: 'Your solar farm is generating 15% higher returns than the renewable energy sector average. Consider highlighting this in investor communications.',
    priority: 'medium',
    actionable: true,
    timestamp: new Date().toISOString(),
    assetId: 'asset_solar_1',
    metadata: {
      confidence: 0.92,
      impact: 'high',
      timeframe: '30 days',
      category: 'performance'
    }
  },
  {
    id: 'insight_2',
    type: 'market_insights',
    title: 'Renewable Energy Sector Growth Opportunity',
    description: 'Government incentives for renewable energy increased by 25%. Consider expanding portfolio or raising additional funding.',
    priority: 'high',
    actionable: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      confidence: 0.88,
      impact: 'high',
      timeframe: '90 days',
      category: 'market'
    }
  },
  {
    id: 'insight_3',
    type: 'risk_assessment',
    title: 'Weather Risk Assessment',
    description: 'Seasonal weather patterns show potential 8% reduction in solar generation next quarter. Consider hedging strategies.',
    priority: 'medium',
    actionable: true,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assetId: 'asset_solar_1',
    metadata: {
      confidence: 0.78,
      impact: 'medium',
      timeframe: '90 days',
      category: 'operational'
    }
  }
];

const mockRiskAlerts: RiskAlert[] = [
  {
    id: 'risk_1',
    assetId: 'asset_solar_1',
    severity: 'medium',
    category: 'operational',
    title: 'Equipment Maintenance Due',
    description: 'Solar panel efficiency has decreased by 3% over the last month. Schedule maintenance to prevent further degradation.',
    mitigation: [
      'Schedule professional panel cleaning',
      'Inspect inverter systems',
      'Update maintenance logs'
    ],
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: false
  },
  {
    id: 'risk_2',
    assetId: 'asset_wind_1',
    severity: 'low',
    category: 'financial',
    title: 'Revenue Variance',
    description: 'Monthly revenue is 5% below projections due to lower wind speeds.',
    mitigation: [
      'Review weather forecasting accuracy',
      'Adjust investor expectations',
      'Consider weather derivatives'
    ],
    acknowledged: false
  }
];

export const useAIAssistantStore = create<AIAssistantState>()(
  persist(
    (set, get) => ({
      subscriptionTier: 'free',
      premiumFeatures: [
        'market_insights',
        'performance_optimization',
        'content_generation',
        'compliance_check'
      ],
      usageStats: {
        dailyQueries: 0,
        monthlyQueries: 0,
        lastReset: new Date().toISOString()
      },
      
      insights: mockInsights,
      marketAnalyses: [],
      performanceRecommendations: [],
      contentSuggestions: [],
      riskAlerts: mockRiskAlerts,
      complianceChecks: [],
      
      chatHistory: [],
      isProcessing: false,
      
      preferences: defaultPreferences,
      
      analyzeAsset: async (assetId: string) => {
        set({ isProcessing: true });
        
        try {
          // Simulate AI analysis
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const newInsight: AIInsight = {
            id: `insight_${Date.now()}`,
            type: 'asset_analysis',
            title: 'Asset Analysis Complete',
            description: `Comprehensive analysis for asset ${assetId} shows strong fundamentals with 92% confidence score.`,
            priority: 'medium',
            actionable: true,
            timestamp: new Date().toISOString(),
            assetId,
            metadata: {
              confidence: 0.92,
              impact: 'medium',
              timeframe: 'immediate',
              category: 'analysis'
            }
          };
          
          set((state) => ({
            insights: [newInsight, ...state.insights],
            usageStats: {
              ...state.usageStats,
              dailyQueries: state.usageStats.dailyQueries + 1,
              monthlyQueries: state.usageStats.monthlyQueries + 1
            }
          }));
        } finally {
          set({ isProcessing: false });
        }
      },
      
      generateMarketInsights: async (assetId: string, sector: string) => {
        const state = get();
        if (!state.premiumFeatures.includes('market_insights') && state.subscriptionTier === 'free') {
          throw new Error('Market insights require premium subscription');
        }
        
        set({ isProcessing: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 2500));
          
          const marketAnalysis: MarketAnalysis = {
            id: `market_${Date.now()}`,
            assetId,
            sector,
            competitorCount: Math.floor(Math.random() * 20) + 5,
            marketPosition: ['leader', 'challenger', 'follower', 'niche'][Math.floor(Math.random() * 4)] as any,
            growthTrend: ['positive', 'stable', 'negative'][Math.floor(Math.random() * 3)] as any,
            riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
            recommendations: [
              'Optimize operational efficiency',
              'Expand market presence',
              'Diversify revenue streams'
            ],
            lastUpdated: new Date().toISOString()
          };
          
          set((state) => ({
            marketAnalyses: [marketAnalysis, ...state.marketAnalyses]
          }));
        } finally {
          set({ isProcessing: false });
        }
      },
      
      createPerformanceRecommendations: async (assetId: string) => {
        const state = get();
        if (!state.premiumFeatures.includes('performance_optimization') && state.subscriptionTier === 'free') {
          throw new Error('Performance optimization requires premium subscription');
        }
        
        set({ isProcessing: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1800));
          
          const recommendations: PerformanceRecommendation[] = [
            {
              id: `rec_${Date.now()}_1`,
              assetId,
              category: 'operational',
              title: 'Optimize Energy Output',
              description: 'Implement predictive maintenance to increase efficiency by 8-12%',
              expectedImpact: '+10% annual revenue',
              difficulty: 'medium',
              timeToImplement: '30-60 days',
              priority: 1
            },
            {
              id: `rec_${Date.now()}_2`,
              assetId,
              category: 'financial',
              title: 'Refinance Debt Structure',
              description: 'Current market rates allow for 2% reduction in financing costs',
              expectedImpact: '+$50K annual savings',
              difficulty: 'easy',
              timeToImplement: '14-30 days',
              priority: 2
            }
          ];
          
          set((state) => ({
            performanceRecommendations: [...recommendations, ...state.performanceRecommendations]
          }));
        } finally {
          set({ isProcessing: false });
        }
      },
      
      generateContent: async (type: ContentSuggestion['type'], prompt: string) => {
        const state = get();
        if (!state.premiumFeatures.includes('content_generation') && state.subscriptionTier === 'free') {
          throw new Error('Content generation requires premium subscription');
        }
        
        set({ isProcessing: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const contentSuggestion: ContentSuggestion = {
            id: `content_${Date.now()}`,
            type,
            title: `Generated ${type.replace('_', ' ')} Content`,
            content: `AI-generated content based on: "${prompt}"\n\nThis is a professional ${type} that addresses key stakeholder interests while maintaining transparency and compliance standards.`,
            targetAudience: 'shareholders',
            tone: 'professional',
            generatedAt: new Date().toISOString()
          };
          
          set((state) => ({
            contentSuggestions: [contentSuggestion, ...state.contentSuggestions]
          }));
          
          return contentSuggestion;
        } finally {
          set({ isProcessing: false });
        }
      },
      
      performRiskAssessment: async (assetId: string) => {
        set({ isProcessing: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 2200));
          
          const riskAlert: RiskAlert = {
            id: `risk_${Date.now()}`,
            assetId,
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
            category: ['financial', 'regulatory', 'operational', 'market'][Math.floor(Math.random() * 4)] as any,
            title: 'Risk Assessment Complete',
            description: 'AI analysis identified potential risk factors requiring attention.',
            mitigation: [
              'Monitor key metrics daily',
              'Implement preventive measures',
              'Update risk management protocols'
            ],
            acknowledged: false
          };
          
          set((state) => ({
            riskAlerts: [riskAlert, ...state.riskAlerts]
          }));
        } finally {
          set({ isProcessing: false });
        }
      },
      
      runComplianceCheck: async (assetId: string) => {
        const state = get();
        if (!state.premiumFeatures.includes('compliance_check') && state.subscriptionTier === 'free') {
          throw new Error('Compliance checking requires premium subscription');
        }
        
        set({ isProcessing: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const complianceCheck: ComplianceCheck = {
            id: `compliance_${Date.now()}`,
            assetId,
            category: ['SEC', 'FINRA', 'tax', 'disclosure', 'reporting'][Math.floor(Math.random() * 5)] as any,
            status: ['compliant', 'warning', 'needs_review'][Math.floor(Math.random() * 3)] as any,
            title: 'Compliance Review Complete',
            description: 'Automated compliance check completed with recommendations.',
            requirements: [
              'File quarterly reports',
              'Update investor disclosures',
              'Maintain audit trail'
            ],
            nextAction: 'Review findings and implement recommendations',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          
          set((state) => ({
            complianceChecks: [complianceCheck, ...state.complianceChecks]
          }));
        } finally {
          set({ isProcessing: false });
        }
      },
      
      sendChatMessage: async (message: string, context?: any) => {
        const chatId = `chat_${Date.now()}`;
        
        // Add user message
        set((state) => ({
          chatHistory: [
            ...state.chatHistory,
            {
              id: `${chatId}_user`,
              type: 'user',
              message,
              timestamp: new Date().toISOString(),
              context
            }
          ],
          isProcessing: true
        }));
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          // Add AI response
          const aiResponse = `I understand you're asking about "${message}". Based on your asset performance and market conditions, I recommend focusing on operational efficiency and stakeholder communication. Would you like me to generate specific recommendations?`;
          
          set((state) => ({
            chatHistory: [
              ...state.chatHistory,
              {
                id: `${chatId}_ai`,
                type: 'assistant',
                message: aiResponse,
                timestamp: new Date().toISOString(),
                context
              }
            ]
          }));
        } finally {
          set({ isProcessing: false });
        }
      },
      
      acknowledgeRisk: (riskId: string) => {
        set((state) => ({
          riskAlerts: state.riskAlerts.map(risk =>
            risk.id === riskId ? { ...risk, acknowledged: true } : risk
          )
        }));
      },
      
      dismissInsight: (insightId: string) => {
        set((state) => ({
          insights: state.insights.filter(insight => insight.id !== insightId)
        }));
      },
      
      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        }));
      },
      
      upgradeSubscription: (tier: SubscriptionTier) => {
        set({ subscriptionTier: tier });
      },
      
      loadUserData: async () => {
        // In a real implementation, this would load user-specific AI data
        await new Promise(resolve => setTimeout(resolve, 500));
      },
      
      clearChatHistory: () => {
        set({ chatHistory: [] });
      },
      
      exportInsights: () => {
        const state = get();
        const data = {
          insights: state.insights,
          riskAlerts: state.riskAlerts,
          recommendations: state.performanceRecommendations,
          exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-insights-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }),
    {
      name: 'cf1-ai-assistant',
      partialize: (state) => ({
        subscriptionTier: state.subscriptionTier,
        preferences: state.preferences,
        usageStats: state.usageStats
      })
    }
  )
);