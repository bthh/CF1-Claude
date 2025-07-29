import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdvancedMetric {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  changeDirection: 'up' | 'down' | 'neutral';
  trend: number[];
  format: 'currency' | 'percentage' | 'number' | 'duration';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  target?: number;
  benchmark?: number;
  category: 'performance' | 'risk' | 'liquidity' | 'growth' | 'compliance';
  alertThreshold?: number;
  description?: string;
}

export interface PredictiveInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  actionable: boolean;
  priority: number;
  aiModel: string;
  dataPoints: number;
  accuracy?: number;
  tags: string[];
}

export interface RealTimeEvent {
  id: string;
  timestamp: string;
  type: 'transaction' | 'proposal' | 'market' | 'compliance' | 'system' | 'user';
  title: string;
  description: string;
  value?: number;
  status: 'success' | 'warning' | 'error' | 'info';
  userId?: string;
  assetId?: string;
  proposalId?: string;
  metadata?: Record<string, any>;
}

export interface MarketTrend {
  id: string;
  sector: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-100
  timeframe: '1h' | '1d' | '1w' | '1m' | '3m';
  indicators: {
    momentum: number;
    volume: number;
    sentiment: number;
    volatility: number;
  };
  prediction: {
    direction: 'up' | 'down' | 'sideways';
    probability: number;
    targetPrice?: number;
    timeline: string;
  };
}

export interface RiskAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'concentration' | 'liquidity' | 'market' | 'operational' | 'regulatory' | 'credit';
  title: string;
  description: string;
  metrics: Record<string, number>;
  threshold: number;
  currentValue: number;
  recommendations: string[];
  autoResolve: boolean;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface PerformanceBenchmark {
  id: string;
  metric: string;
  platformValue: number;
  industryAverage: number;
  topQuartile: number;
  percentile: number;
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: string;
}

interface AdvancedAnalyticsState {
  // Data
  metrics: AdvancedMetric[];
  insights: PredictiveInsight[];
  events: RealTimeEvent[];
  marketTrends: MarketTrend[];
  riskAlerts: RiskAlert[];
  benchmarks: PerformanceBenchmark[];
  
  // Settings
  refreshInterval: number; // seconds
  autoRefresh: boolean;
  alertsEnabled: boolean;
  realTimeEnabled: boolean;
  aiInsightsEnabled: boolean;
  
  // UI State
  selectedTimeRange: '1h' | '1d' | '1w' | '1m' | '3m' | '6m' | '1y';
  selectedCategories: string[];
  viewMode: 'overview' | 'detailed' | 'comparison';
  isLoading: boolean;
  lastUpdated: string;
  
  // Filters
  metricFilters: {
    categories: string[];
    status: string[];
    showTargets: boolean;
    showBenchmarks: boolean;
  };
  
  insightFilters: {
    types: string[];
    confidence: number; // minimum confidence
    impact: string[];
    timeframe: string[];
  };
  
  // Actions
  updateMetrics: (metrics: AdvancedMetric[]) => void;
  addInsight: (insight: PredictiveInsight) => void;
  dismissInsight: (insightId: string) => void;
  addEvent: (event: RealTimeEvent) => void;
  clearEvents: () => void;
  updateMarketTrends: (trends: MarketTrend[]) => void;
  addRiskAlert: (alert: RiskAlert) => void;
  acknowledgeRiskAlert: (alertId: string, userId: string) => void;
  dismissRiskAlert: (alertId: string) => void;
  updateBenchmarks: (benchmarks: PerformanceBenchmark[]) => void;
  
  // Settings Actions
  setRefreshInterval: (interval: number) => void;
  toggleAutoRefresh: () => void;
  toggleAlerts: () => void;
  toggleRealTime: () => void;
  toggleAIInsights: () => void;
  
  // Filter Actions
  setTimeRange: (range: AdvancedAnalyticsState['selectedTimeRange']) => void;
  updateMetricFilters: (filters: Partial<AdvancedAnalyticsState['metricFilters']>) => void;
  updateInsightFilters: (filters: Partial<AdvancedAnalyticsState['insightFilters']>) => void;
  setViewMode: (mode: AdvancedAnalyticsState['viewMode']) => void;
  
  // Data Actions
  refreshAllData: () => Promise<void>;
  exportData: (format: 'json' | 'csv' | 'pdf', dateRange?: { start: string; end: string }) => Promise<void>;
  
  // Utility Actions
  formatMetricValue: (value: number | string, format: AdvancedMetric['format']) => string;
  calculateTrend: (data: number[]) => { direction: 'up' | 'down' | 'neutral'; strength: number };
  generateAlerts: () => void;
}

// Mock data generators
const generateMockMetrics = (): AdvancedMetric[] => [
  {
    id: 'tvl',
    label: 'Total Value Locked',
    value: 45750000,
    previousValue: 43200000,
    change: 5.9,
    changeDirection: 'up',
    trend: [85, 87, 89, 92, 95, 100],
    format: 'currency',
    status: 'excellent',
    target: 50000000,
    benchmark: 40000000,
    category: 'performance',
    alertThreshold: 35000000,
    description: 'Total capital locked in platform assets'
  },
  {
    id: 'active_users',
    label: 'Active Users (30d)',
    value: 8420,
    previousValue: 7850,
    change: 7.3,
    changeDirection: 'up',
    trend: [78, 82, 85, 88, 91, 84.2],
    format: 'number',
    status: 'good',
    target: 10000,
    benchmark: 7500,
    category: 'growth',
    description: 'Unique users active in the last 30 days'
  },
  {
    id: 'funding_success_rate',
    label: 'Funding Success Rate',
    value: 0.847,
    previousValue: 0.821,
    change: 3.2,
    changeDirection: 'up',
    trend: [78, 81, 83, 84, 85, 84.7],
    format: 'percentage',
    status: 'excellent',
    target: 0.9,
    benchmark: 0.75,
    category: 'performance',
    description: 'Percentage of proposals that reach funding goal'
  },
  {
    id: 'avg_roi',
    label: 'Average ROI',
    value: 0.127,
    previousValue: 0.118,
    change: 7.6,
    changeDirection: 'up',
    trend: [11.2, 11.8, 12.1, 12.4, 12.6, 12.7],
    format: 'percentage',
    status: 'excellent',
    target: 0.15,
    benchmark: 0.10,
    category: 'performance',
    description: 'Average return on investment across all assets'
  },
  {
    id: 'risk_score',
    label: 'Platform Risk Score',
    value: 0.18,
    previousValue: 0.22,
    change: -18.2,
    changeDirection: 'up', // Lower risk is better
    trend: [25, 23, 21, 20, 19, 18],
    format: 'percentage',
    status: 'good',
    target: 0.15,
    benchmark: 0.25,
    category: 'risk',
    alertThreshold: 0.3,
    description: 'Composite risk score based on multiple factors'
  }
];

const generateMockInsights = (): PredictiveInsight[] => [
  {
    id: 'insight_1',
    type: 'prediction',
    title: 'TVL Growth Acceleration Expected',
    description: 'Machine learning models predict 40% TVL growth over next quarter driven by institutional adoption and renewable energy sector expansion.',
    confidence: 87,
    impact: 'high',
    timeframe: '3 months',
    actionable: true,
    priority: 1,
    aiModel: 'CF1-Analytics-GPT-v2',
    dataPoints: 15420,
    accuracy: 0.91,
    tags: ['growth', 'institutional', 'renewable-energy']
  },
  {
    id: 'insight_2',
    type: 'recommendation',
    title: 'Optimize Proposal Review Process',
    description: 'Implementing AI-assisted proposal screening could reduce review time by 60% while maintaining 95% accuracy in risk assessment.',
    confidence: 93,
    impact: 'high',
    timeframe: '6 weeks',
    actionable: true,
    priority: 2,
    aiModel: 'CF1-Process-Optimizer',
    dataPoints: 8920,
    accuracy: 0.95,
    tags: ['automation', 'efficiency', 'ai-assistance']
  },
  {
    id: 'insight_3',
    type: 'alert',
    title: 'Sector Concentration Risk',
    description: 'Technology sector exposure has reached 42% of total TVL. Consider implementing sector allocation limits to reduce concentration risk.',
    confidence: 95,
    impact: 'medium',
    timeframe: 'Immediate',
    actionable: true,
    priority: 3,
    aiModel: 'CF1-Risk-Monitor',
    dataPoints: 12500,
    tags: ['risk-management', 'diversification', 'technology']
  },
  {
    id: 'insight_4',
    type: 'opportunity',
    title: 'Real Estate Market Window',
    description: 'Commercial real estate shows 35% higher investor demand this quarter. Target marketing campaigns could capture $15M additional TVL.',
    confidence: 78,
    impact: 'high',
    timeframe: '8 weeks',
    actionable: true,
    priority: 4,
    aiModel: 'CF1-Market-Intelligence',
    dataPoints: 6800,
    tags: ['real-estate', 'marketing', 'opportunity']
  }
];

const generateMockEvents = (): RealTimeEvent[] => [
  {
    id: 'event_1',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    type: 'transaction',
    title: 'Large Investment Received',
    description: 'Solar Energy Project Alpha received $350K investment from institutional investor',
    value: 350000,
    status: 'success',
    assetId: 'asset_solar_alpha',
    metadata: { investorType: 'institutional', sector: 'renewable-energy' }
  },
  {
    id: 'event_2',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    type: 'proposal',
    title: 'New Proposal Submitted',
    description: 'Commercial Real Estate - Tech Campus Complex in Austin',
    status: 'info',
    proposalId: 'prop_tech_campus_001',
    metadata: { sector: 'real-estate', fundingGoal: 25000000 }
  },
  {
    id: 'event_3',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    type: 'compliance',
    title: 'Automated Compliance Check Passed',
    description: 'Wind Farm Beta project successfully passed all SEC Reg CF requirements',
    status: 'success',
    assetId: 'asset_wind_beta',
    metadata: { checkType: 'sec_reg_cf', automated: true }
  }
];

export const useAdvancedAnalyticsStore = create<AdvancedAnalyticsState>()(
  persist(
    (set, get) => ({
      // Initial data
      metrics: generateMockMetrics(),
      insights: generateMockInsights(),
      events: generateMockEvents(),
      marketTrends: [],
      riskAlerts: [],
      benchmarks: [],
      
      // Settings
      refreshInterval: 30,
      autoRefresh: true,
      alertsEnabled: true,
      realTimeEnabled: true,
      aiInsightsEnabled: true,
      
      // UI State
      selectedTimeRange: '1d',
      selectedCategories: [],
      viewMode: 'overview',
      isLoading: false,
      lastUpdated: new Date().toISOString(),
      
      // Filters
      metricFilters: {
        categories: [],
        status: [],
        showTargets: true,
        showBenchmarks: true
      },
      
      insightFilters: {
        types: [],
        confidence: 70,
        impact: [],
        timeframe: []
      },
      
      // Actions
      updateMetrics: (metrics) => set({ metrics, lastUpdated: new Date().toISOString() }),
      
      addInsight: (insight) => set((state) => ({
        insights: [insight, ...state.insights].slice(0, 50), // Keep latest 50
        lastUpdated: new Date().toISOString()
      })),
      
      dismissInsight: (insightId) => set((state) => ({
        insights: state.insights.filter(insight => insight.id !== insightId)
      })),
      
      addEvent: (event) => set((state) => ({
        events: [event, ...state.events].slice(0, 100), // Keep latest 100
        lastUpdated: new Date().toISOString()
      })),
      
      clearEvents: () => set({ events: [] }),
      
      updateMarketTrends: (trends) => set({ marketTrends: trends, lastUpdated: new Date().toISOString() }),
      
      addRiskAlert: (alert) => set((state) => ({
        riskAlerts: [alert, ...state.riskAlerts],
        lastUpdated: new Date().toISOString()
      })),
      
      acknowledgeRiskAlert: (alertId, userId) => set((state) => ({
        riskAlerts: state.riskAlerts.map(alert =>
          alert.id === alertId
            ? { ...alert, acknowledged: true, acknowledgedBy: userId, acknowledgedAt: new Date().toISOString() }
            : alert
        )
      })),
      
      dismissRiskAlert: (alertId) => set((state) => ({
        riskAlerts: state.riskAlerts.filter(alert => alert.id !== alertId)
      })),
      
      updateBenchmarks: (benchmarks) => set({ benchmarks, lastUpdated: new Date().toISOString() }),
      
      // Settings Actions
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
      toggleAutoRefresh: () => set((state) => ({ autoRefresh: !state.autoRefresh })),
      toggleAlerts: () => set((state) => ({ alertsEnabled: !state.alertsEnabled })),
      toggleRealTime: () => set((state) => ({ realTimeEnabled: !state.realTimeEnabled })),
      toggleAIInsights: () => set((state) => ({ aiInsightsEnabled: !state.aiInsightsEnabled })),
      
      // Filter Actions
      setTimeRange: (range) => set({ selectedTimeRange: range }),
      updateMetricFilters: (filters) => set((state) => ({
        metricFilters: { ...state.metricFilters, ...filters }
      })),
      updateInsightFilters: (filters) => set((state) => ({
        insightFilters: { ...state.insightFilters, ...filters }
      })),
      setViewMode: (mode) => set({ viewMode: mode }),
      
      // Data Actions
      refreshAllData: async () => {
        set({ isLoading: true });
        try {
          // Simulate API calls
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update with fresh data
          set({
            metrics: generateMockMetrics(),
            lastUpdated: new Date().toISOString(),
            isLoading: false
          });
        } catch (error) {
          console.error('Failed to refresh analytics data:', error);
          set({ isLoading: false });
        }
      },
      
      exportData: async (format, dateRange) => {
        const state = get();
        const data = {
          metrics: state.metrics,
          insights: state.insights,
          events: state.events,
          exportedAt: new Date().toISOString(),
          dateRange
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cf1-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      
      // Utility Actions
      formatMetricValue: (value, format) => {
        if (typeof value === 'string') return value;
        
        switch (format) {
          case 'currency':
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(value);
          case 'percentage':
            return new Intl.NumberFormat('en-US', {
              style: 'percent',
              minimumFractionDigits: 1,
              maximumFractionDigits: 2
            }).format(value);
          case 'number':
            return new Intl.NumberFormat('en-US').format(value);
          case 'duration':
            return `${value} days`;
          default:
            return String(value);
        }
      },
      
      calculateTrend: (data) => {
        if (data.length < 2) return { direction: 'neutral', strength: 0 };
        
        const recent = data.slice(-3);
        const older = data.slice(0, -3);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        return {
          direction: change > 1 ? 'up' : change < -1 ? 'down' : 'neutral',
          strength: Math.abs(change)
        };
      },
      
      generateAlerts: () => {
        const state = get();
        const newAlerts: RiskAlert[] = [];
        
        // Check metrics against thresholds
        state.metrics.forEach(metric => {
          if (metric.alertThreshold && typeof metric.value === 'number') {
            if (metric.value < metric.alertThreshold) {
              newAlerts.push({
                id: `alert_${metric.id}_${Date.now()}`,
                severity: 'high',
                category: 'operational',
                title: `${metric.label} Below Threshold`,
                description: `${metric.label} has fallen below the alert threshold of ${metric.alertThreshold}`,
                metrics: { [metric.id]: metric.value },
                threshold: metric.alertThreshold,
                currentValue: metric.value,
                recommendations: [`Monitor ${metric.label} closely`, 'Investigate underlying causes'],
                autoResolve: false,
                acknowledged: false
              });
            }
          }
        });
        
        // Add new alerts
        if (newAlerts.length > 0) {
          set((state) => ({
            riskAlerts: [...newAlerts, ...state.riskAlerts]
          }));
        }
      }
    }),
    {
      name: 'cf1-advanced-analytics',
      partialize: (state) => ({
        refreshInterval: state.refreshInterval,
        autoRefresh: state.autoRefresh,
        alertsEnabled: state.alertsEnabled,
        realTimeEnabled: state.realTimeEnabled,
        aiInsightsEnabled: state.aiInsightsEnabled,
        selectedTimeRange: state.selectedTimeRange,
        viewMode: state.viewMode,
        metricFilters: state.metricFilters,
        insightFilters: state.insightFilters
      })
    }
  )
);