import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AnalyticsDashboard, 
  PlatformMetrics, 
  TimeSeriesData, 
  ChartData, 
  AssetPerformance,
  UserAnalytics,
  GovernanceAnalytics,
  LaunchpadAnalytics,
  MarketInsights,
  AnalyticsFilter,
  AnalyticsPreferences,
  AlertRule,
  PerformanceMetrics
} from '../types/analytics';

interface AnalyticsState {
  // Dashboard Data
  dashboard: AnalyticsDashboard | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Real-time Data
  platformMetrics: PlatformMetrics | null;
  marketData: TimeSeriesData[];
  assetPerformances: AssetPerformance[];
  
  // Filters & Preferences
  activeFilter: AnalyticsFilter;
  preferences: AnalyticsPreferences;
  
  // Actions
  setDashboard: (dashboard: AnalyticsDashboard) => void;
  updatePlatformMetrics: (metrics: PlatformMetrics) => void;
  updateMarketData: (data: TimeSeriesData[]) => void;
  updateAssetPerformances: (assets: AssetPerformance[]) => void;
  setFilter: (filter: Partial<AnalyticsFilter>) => void;
  updatePreferences: (preferences: Partial<AnalyticsPreferences>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Data Fetching Actions
  fetchDashboardData: (filter?: AnalyticsFilter) => Promise<void>;
  refreshData: () => Promise<void>;
  exportData: (options: any) => Promise<Blob>;
  
  // Alert Management
  addAlertRule: (rule: Omit<AlertRule, 'id'>) => void;
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => void;
  removeAlertRule: (id: string) => void;
  checkAlerts: () => void;
}

// Mock data generation functions
const generateMockPlatformMetrics = (): PlatformMetrics => ({
  totalValueLocked: 125000000 + Math.random() * 5000000,
  totalAssets: 247 + Math.floor(Math.random() * 10),
  totalUsers: 12543 + Math.floor(Math.random() * 100),
  totalProposals: 89 + Math.floor(Math.random() * 5),
  totalInvestments: 1847 + Math.floor(Math.random() * 20),
  averageAPY: 8.7 + Math.random() * 2,
  dailyActiveUsers: 892 + Math.floor(Math.random() * 50),
  monthlyVolume: 45000000 + Math.random() * 2000000
});

const generateMockTimeSeriesData = (days: number = 30): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  let baseValue = 100000000;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulate some volatility
    const change = (Math.random() - 0.5) * 0.05; // ±2.5% daily change
    baseValue = baseValue * (1 + change);
    
    data.push({
      timestamp: date.toISOString().split('T')[0],
      value: Math.round(baseValue),
      label: date.toLocaleDateString()
    });
  }
  
  return data;
};

const generateMockAssetPerformances = (): AssetPerformance[] => [
  {
    id: '1',
    name: 'Manhattan Office Complex',
    type: 'Commercial Real Estate',
    currentValue: 2650000,
    initialValue: 2500000,
    changePercent: 6.0,
    changeAmount: 150000,
    apy: 8.5,
    risk: 'medium',
    trend: 'up',
    volume24h: 450000,
    marketCap: 2650000
  },
  {
    id: '2',
    name: 'Gold Bullion Vault',
    type: 'Precious Metals',
    currentValue: 1280000,
    initialValue: 1200000,
    changePercent: 6.7,
    changeAmount: 80000,
    apy: 6.2,
    risk: 'low',
    trend: 'up',
    volume24h: 320000,
    marketCap: 1280000
  },
  {
    id: '3',
    name: 'Modern Art Collection',
    type: 'Fine Art',
    currentValue: 920000,
    initialValue: 800000,
    changePercent: 15.0,
    changeAmount: 120000,
    apy: 12.3,
    risk: 'high',
    trend: 'up',
    volume24h: 180000,
    marketCap: 920000
  }
];

const generateMockDashboard = (filter: AnalyticsFilter): AnalyticsDashboard => {
  const platformMetrics = generateMockPlatformMetrics();
  const marketData = generateMockTimeSeriesData();
  const assetPerformances = generateMockAssetPerformances();
  
  return {
    platformMetrics,
    marketInsights: {
      topPerformingAssets: assetPerformances.sort((a, b) => b.changePercent - a.changePercent).slice(0, 5),
      worstPerformingAssets: assetPerformances.sort((a, b) => a.changePercent - b.changePercent).slice(0, 5),
      trendingAssets: assetPerformances.filter(a => a.volume24h > 200000),
      marketSentiment: 'bullish',
      volatilityIndex: 0.15,
      liquidityScore: 0.85,
      correlationMatrix: {}
    },
    userAnalytics: {
      userId: 'current-user',
      portfolioValue: 25000,
      totalInvested: 22000,
      totalReturns: 3000,
      activeInvestments: 5,
      riskProfile: 'moderate',
      diversificationScore: 0.75,
      investmentHistory: marketData.slice(0, 10).map(d => ({ ...d, value: d.value / 5000 })),
      assetAllocation: [
        { name: 'Real Estate', value: 45, color: '#3b82f6' },
        { name: 'Precious Metals', value: 25, color: '#f59e0b' },
        { name: 'Art & Collectibles', value: 20, color: '#8b5cf6' },
        { name: 'Vehicles', value: 10, color: '#10b981' }
      ],
      performanceMetrics: {
        roi: 13.6,
        totalGains: 3500,
        totalLosses: 500,
        winRate: 0.8,
        averageHoldTime: 145,
        sharpeRatio: 1.2,
        volatility: 0.18,
        maxDrawdown: 0.05
      }
    },
    governanceAnalytics: {
      totalProposals: 89,
      activeProposals: 12,
      passedProposals: 56,
      rejectedProposals: 21,
      averageParticipation: 0.65,
      votingTurnout: 0.72,
      proposalTypes: [
        { name: 'Dividend', value: 35, color: '#3b82f6' },
        { name: 'Renovation', value: 25, color: '#f59e0b' },
        { name: 'Sale', value: 20, color: '#ef4444' },
        { name: 'Management', value: 15, color: '#10b981' },
        { name: 'Expansion', value: 5, color: '#8b5cf6' }
      ],
      votingHistory: marketData.slice(0, 12).map(d => ({ ...d, value: Math.floor(d.value / 1000000) })),
      topVoters: [
        { address: 'neutron1abc...def', votingPower: 15000, participationRate: 0.95 },
        { address: 'neutron1ghi...jkl', votingPower: 12000, participationRate: 0.87 },
        { address: 'neutron1mno...pqr', votingPower: 9500, participationRate: 0.82 }
      ]
    },
    launchpadAnalytics: {
      totalProposals: 89,
      successfulLaunches: 56,
      successRate: 0.63,
      totalFundsRaised: 125000000,
      averageFundingTime: 28,
      fundingSourceDistribution: [
        { name: 'Retail Investors', value: 65, color: '#3b82f6' },
        { name: 'Institutional', value: 25, color: '#f59e0b' },
        { name: 'Strategic Partners', value: 10, color: '#10b981' }
      ],
      categoryPerformance: [
        { name: 'Real Estate', value: 45, color: '#3b82f6' },
        { name: 'Precious Metals', value: 25, color: '#f59e0b' },
        { name: 'Art & Collectibles', value: 20, color: '#8b5cf6' },
        { name: 'Vehicles', value: 10, color: '#10b981' }
      ],
      timeToCompletion: marketData.slice(0, 10).map(d => ({ ...d, value: 15 + Math.random() * 20 }))
    },
    lastUpdated: new Date().toISOString()
  };
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      // Initial State
      dashboard: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
      platformMetrics: null,
      marketData: [],
      assetPerformances: [],
      
      activeFilter: {
        timeRange: '30d',
        assetTypes: [],
        riskLevels: [],
        includeInactive: false
      },
      
      preferences: {
        defaultTimeRange: '30d',
        refreshInterval: 30000, // 30 seconds
        chartConfig: {
          showGrid: true,
          showLegend: true,
          animationDuration: 300
        },
        alertRules: [],
        favoriteMetrics: ['totalValueLocked', 'averageAPY', 'totalUsers'],
        dashboardLayout: {}
      },
      
      // Dashboard Actions
      setDashboard: (dashboard) => set({ dashboard, lastUpdated: dashboard.lastUpdated }),
      
      updatePlatformMetrics: (metrics) => set({ platformMetrics: metrics }),
      
      updateMarketData: (data) => set({ marketData: data }),
      
      updateAssetPerformances: (assets) => set({ assetPerformances: assets }),
      
      setFilter: (filter) => set(state => ({ 
        activeFilter: { ...state.activeFilter, ...filter } 
      })),
      
      updatePreferences: (preferences) => set(state => ({ 
        preferences: { ...state.preferences, ...preferences } 
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      // Data Fetching
      fetchDashboardData: async (filter) => {
        const state = get();
        const activeFilter = filter || state.activeFilter;
        
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const dashboard = generateMockDashboard(activeFilter);
          
          set({ 
            dashboard, 
            platformMetrics: dashboard.platformMetrics,
            assetPerformances: dashboard.marketInsights.topPerformingAssets,
            isLoading: false,
            lastUpdated: dashboard.lastUpdated
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch dashboard data', 
            isLoading: false 
          });
        }
      },
      
      refreshData: async () => {
        const state = get();
        await state.fetchDashboardData(state.activeFilter);
      },
      
      exportData: async (options) => {
        // Mock export - in real implementation, this would call an API
        const state = get();
        const data = JSON.stringify(state.dashboard, null, 2);
        return new Blob([data], { type: 'application/json' });
      },
      
      // Alert Management
      addAlertRule: (rule) => set(state => ({
        preferences: {
          ...state.preferences,
          alertRules: [
            ...state.preferences.alertRules,
            { ...rule, id: Date.now().toString() }
          ]
        }
      })),
      
      updateAlertRule: (id, updates) => set(state => ({
        preferences: {
          ...state.preferences,
          alertRules: state.preferences.alertRules.map(rule =>
            rule.id === id ? { ...rule, ...updates } : rule
          )
        }
      })),
      
      removeAlertRule: (id) => set(state => ({
        preferences: {
          ...state.preferences,
          alertRules: state.preferences.alertRules.filter(rule => rule.id !== id)
        }
      })),
      
      checkAlerts: () => {
        const state = get();
        const { platformMetrics, preferences } = state;
        
        if (!platformMetrics) return;
        
        preferences.alertRules.forEach(rule => {
          if (!rule.enabled) return;
          
          const metricValue = (platformMetrics as any)[rule.metric];
          if (metricValue === undefined) return;
          
          let shouldTrigger = false;
          
          switch (rule.condition) {
            case 'above':
              shouldTrigger = metricValue > rule.threshold;
              break;
            case 'below':
              shouldTrigger = metricValue < rule.threshold;
              break;
            case 'equals':
              shouldTrigger = Math.abs(metricValue - rule.threshold) < 0.01;
              break;
          }
          
          if (shouldTrigger) {
            console.log(`Alert triggered: ${rule.name}`);
            // In real implementation, send notifications here
          }
        });
      }
    }),
    {
      name: 'cf1-analytics-store',
      partialize: (state) => ({
        activeFilter: state.activeFilter,
        preferences: state.preferences
      })
    }
  )
);