import { useDataModeStore } from '../store/dataModeStore';

export interface AnalyticsData {
  platformMetrics: {
    totalAssets: number;
    totalProposals: number;
    totalUsers: number;
    totalVolume: string;
    avgAPY: string;
  };
  performance: {
    monthlyGrowth: string;
    userGrowth: string;
    volumeGrowth: string;
  };
  source: 'production' | 'development' | 'demo';
}

// Demo data for testing
const getDemoAnalytics = (): AnalyticsData => ({
  platformMetrics: {
    totalAssets: 12,
    totalProposals: 8,
    totalUsers: 1247,
    totalVolume: '$47.2M',
    avgAPY: '12.8%'
  },
  performance: {
    monthlyGrowth: '+18.5%',
    userGrowth: '+24.3%',
    volumeGrowth: '+31.2%'
  },
  source: 'demo'
});

// Production data (empty - will come from API)
const getProductionAnalytics = (): AnalyticsData => ({
  platformMetrics: {
    totalAssets: 0,
    totalProposals: 0,
    totalUsers: 0,
    totalVolume: '$0',
    avgAPY: '0.0%'
  },
  performance: {
    monthlyGrowth: '0.0%',
    userGrowth: '0.0%',
    volumeGrowth: '0.0%'
  },
  source: 'production'
});

// Development data (calculated from actual user data)
const getDevelopmentAnalytics = (): AnalyticsData => {
  // This would calculate from actual submission store, governance store, etc.
  // For now, return basic metrics
  return {
    platformMetrics: {
      totalAssets: 0, // Calculate from approved submissions
      totalProposals: 0, // Calculate from governance store
      totalUsers: 1, // You as the test user
      totalVolume: '$0',
      avgAPY: '0.0%'
    },
    performance: {
      monthlyGrowth: '0.0%',
      userGrowth: '0.0%',
      volumeGrowth: '0.0%'
    },
    source: 'development'
  };
};

// Main data service
export const useAnalyticsData = () => {
  const { currentMode } = useDataModeStore();
  
  const getAnalytics = (): AnalyticsData => {
    switch (currentMode) {
      case 'production':
        return getProductionAnalytics();
      case 'development':
        return getDevelopmentAnalytics();
      case 'demo':
        return getDemoAnalytics();
      default:
        return getProductionAnalytics();
    }
  };

  return {
    analytics: getAnalytics(),
    currentMode,
    isEmpty: getAnalytics().platformMetrics.totalAssets === 0,
  };
};