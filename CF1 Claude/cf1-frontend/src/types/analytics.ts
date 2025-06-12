// Analytics Types for CF1 Platform

export interface PlatformMetrics {
  totalValueLocked: number;
  totalAssets: number;
  totalUsers: number;
  totalProposals: number;
  totalInvestments: number;
  averageAPY: number;
  dailyActiveUsers: number;
  monthlyVolume: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface PerformanceMetrics {
  roi: number;
  totalGains: number;
  totalLosses: number;
  winRate: number;
  averageHoldTime: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
}

export interface AssetPerformance {
  id: string;
  name: string;
  type: string;
  currentValue: number;
  initialValue: number;
  changePercent: number;
  changeAmount: number;
  apy: number;
  risk: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  volume24h: number;
  marketCap: number;
}

export interface MarketInsights {
  topPerformingAssets: AssetPerformance[];
  worstPerformingAssets: AssetPerformance[];
  trendingAssets: AssetPerformance[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  volatilityIndex: number;
  liquidityScore: number;
  correlationMatrix: Record<string, Record<string, number>>;
}

export interface UserAnalytics {
  userId: string;
  portfolioValue: number;
  totalInvested: number;
  totalReturns: number;
  activeInvestments: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  diversificationScore: number;
  investmentHistory: TimeSeriesData[];
  assetAllocation: ChartData[];
  performanceMetrics: PerformanceMetrics;
}

export interface GovernanceAnalytics {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  rejectedProposals: number;
  averageParticipation: number;
  votingTurnout: number;
  proposalTypes: ChartData[];
  votingHistory: TimeSeriesData[];
  topVoters: Array<{
    address: string;
    votingPower: number;
    participationRate: number;
  }>;
}

export interface LaunchpadAnalytics {
  totalProposals: number;
  successfulLaunches: number;
  successRate: number;
  totalFundsRaised: number;
  averageFundingTime: number;
  fundingSourceDistribution: ChartData[];
  categoryPerformance: ChartData[];
  timeToCompletion: TimeSeriesData[];
}

export interface AnalyticsDashboard {
  platformMetrics: PlatformMetrics;
  marketInsights: MarketInsights;
  userAnalytics: UserAnalytics;
  governanceAnalytics: GovernanceAnalytics;
  launchpadAnalytics: LaunchpadAnalytics;
  lastUpdated: string;
}

export interface AnalyticsFilter {
  timeRange: '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
  assetTypes: string[];
  riskLevels: string[];
  minValue?: number;
  maxValue?: number;
  includeInactive?: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  dateRange: {
    start: string;
    end: string;
  };
  metrics: string[];
  includeCharts: boolean;
  includeRawData: boolean;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  xAxisKey: string;
  yAxisKey: string;
  colorScheme: string[];
  showGrid: boolean;
  showLegend: boolean;
  animationDuration: number;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'above' | 'below' | 'equals' | 'change_percent';
  threshold: number;
  enabled: boolean;
  notification: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  lastTriggered?: string;
}

export interface AnalyticsPreferences {
  defaultTimeRange: AnalyticsFilter['timeRange'];
  refreshInterval: number; // in milliseconds
  chartConfig: Partial<ChartConfig>;
  alertRules: AlertRule[];
  favoriteMetrics: string[];
  dashboardLayout: Record<string, any>;
}