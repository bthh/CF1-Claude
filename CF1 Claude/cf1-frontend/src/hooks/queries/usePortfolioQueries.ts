// CF1 Platform - Portfolio Data Queries
// React Query hooks for portfolio, transactions, and performance data

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateQueries } from '../../lib/queryClient';

// Mock API functions
const portfolioAPI = {
  getPortfolio: async (_: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockAssets = Array.from({ length: 5 }, (_, i) => {
      const shares = Math.floor(Math.random() * 10000 + 1000);
      const invested = shares * 1000;
      const currentValue = invested * (Math.random() * 0.4 + 0.9);
      const gain = currentValue - invested;
      
      return {
        id: `asset_${i + 1}`,
        proposalId: `proposal_${i + 1}`,
        name: ['Downtown Seattle Office', 'Miami Beach Resort', 'Solar Farm TX', 'Tech Hub', 'Hotel Portfolio'][i],
        type: ['Real Estate', 'Hospitality', 'Green Energy', 'Technology', 'Real Estate'][i],
        shares,
        currentValue: currentValue.toFixed(2),
        totalInvested: invested.toString(),
        unrealizedGain: gain.toFixed(2),
        unrealizedGainPercent: (gain / invested) * 100,
        apy: `${(Math.random() * 10 + 8).toFixed(1)}%`,
        locked: Math.random() > 0.3,
        unlockDate: Math.random() > 0.3 ? new Date(Date.now() + 86400000 * 365).toISOString() : undefined,
        lastUpdated: new Date().toISOString()
      };
    });

    const totalValue = mockAssets.reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);
    const totalInvested = mockAssets.reduce((sum, asset) => sum + parseFloat(asset.totalInvested), 0);
    const totalGain = totalValue - totalInvested;
    const lockedValue = mockAssets
      .filter(asset => asset.locked)
      .reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);

    return {
      assets: mockAssets,
      summary: {
        totalValue: totalValue.toFixed(2),
        totalInvested: totalInvested.toFixed(2),
        totalGain: totalGain.toFixed(2),
        totalGainPercent: (totalGain / totalInvested) * 100,
        averageApy: '12.3%',
        assetCount: mockAssets.length,
        lockedValue: lockedValue.toFixed(2),
        availableValue: (totalValue - lockedValue).toFixed(2)
      }
    };
  },

  getTransactions: async (_: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'tx_1',
        type: 'investment',
        assetId: 'asset_1',
        assetName: 'Downtown Seattle Office',
        amount: '5000.00',
        shares: 5000,
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'completed',
        hash: 'tx_hash_1'
      },
      {
        id: 'tx_2',
        type: 'dividend',
        assetId: 'asset_2',
        assetName: 'Miami Beach Resort',
        amount: '247.50',
        timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
        status: 'completed',
        hash: 'tx_hash_2'
      },
      {
        id: 'tx_3',
        type: 'investment',
        assetId: 'asset_3',
        assetName: 'Solar Farm TX',
        amount: '2500.00',
        shares: 2500,
        timestamp: new Date(Date.now() - 86400000 * 14).toISOString(),
        status: 'completed',
        hash: 'tx_hash_3'
      }
    ];
  },

  getPerformance: async (_: string, timeframe: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const days = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365,
      'ALL': 730
    }[timeframe] || 30;

    const data = [];
    const startValue = 50000;
    const startInvested = 45000;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      const volatility = Math.random() * 0.1 - 0.05;
      const totalValue = startValue * (1 + volatility * (days - i) / days);
      const totalInvested = startInvested;
      const gain = totalValue - totalInvested;
      const gainPercent = (gain / totalInvested) * 100;
      
      data.push({
        date,
        totalValue,
        totalInvested,
        gain,
        gainPercent
      });
    }
    
    return data;
  }
};

// Portfolio query
export const usePortfolioQuery = (address: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.portfolio.assets(address),
    queryFn: () => portfolioAPI.getPortfolio(address),
    enabled: !!address && enabled,
    staleTime: 1000 * 60 * 3, // 3 minutes
    select: (data) => ({
      assets: data.assets,
      summary: data.summary
    })
  });
};

// Portfolio transactions query
export const usePortfolioTransactionsQuery = (address: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.portfolio.transactions(address),
    queryFn: () => portfolioAPI.getTransactions(address),
    enabled: !!address && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes for transaction history
  });
};

// Portfolio performance query
export const usePortfolioPerformanceQuery = (
  address: string, 
  timeframe: string = '1M',
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: queryKeys.portfolio.performance(address, timeframe),
    queryFn: () => portfolioAPI.getPerformance(address, timeframe),
    enabled: !!address && enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes for performance data
  });
};

// Combined portfolio data hook
export const usePortfolioData = (address: string) => {
  const portfolioQuery = usePortfolioQuery(address);
  const transactionsQuery = usePortfolioTransactionsQuery(address);
  const performanceQuery = usePortfolioPerformanceQuery(address, '1M');

  return {
    // Portfolio data
    assets: portfolioQuery.data?.assets || [],
    summary: portfolioQuery.data?.summary || null,
    
    // Transactions
    transactions: transactionsQuery.data || [],
    
    // Performance
    performance: performanceQuery.data || [],
    
    // Loading states
    isLoading: portfolioQuery.isLoading || transactionsQuery.isLoading || performanceQuery.isLoading,
    isPortfolioLoading: portfolioQuery.isLoading,
    isTransactionsLoading: transactionsQuery.isLoading,
    isPerformanceLoading: performanceQuery.isLoading,
    
    // Error states
    error: portfolioQuery.error || transactionsQuery.error || performanceQuery.error,
    
    // Refetch functions
    refetchPortfolio: portfolioQuery.refetch,
    refetchTransactions: transactionsQuery.refetch,
    refetchPerformance: performanceQuery.refetch,
    
    // Data freshness
    isStale: portfolioQuery.isStale || transactionsQuery.isStale || performanceQuery.isStale
  };
};

// Portfolio refresh hook
export const usePortfolioRefresh = () => {
  const queryClient = useQueryClient();
  
  return {
    refreshPortfolio: (address: string) => {
      return invalidateQueries.portfolio(queryClient, address);
    },
    
    refreshAll: (address: string) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all(address) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all(address) })
      ]);
    }
  };
};

// Asset-specific queries
export const useAssetPerformanceQuery = (assetId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.analytics.assetPerformance(assetId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock asset performance data
      const days = 30;
      const data = [];
      const startPrice = 1000;
      
      for (let i = days; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        const volatility = Math.random() * 0.1 - 0.05;
        const price = startPrice * (1 + volatility * (days - i) / days);
        
        data.push({
          date,
          price,
          volume: Math.floor(Math.random() * 1000000 + 100000),
          change: price - startPrice,
          changePercent: ((price - startPrice) / startPrice) * 100
        });
      }
      
      return data;
    },
    enabled: !!assetId && enabled,
    staleTime: 1000 * 60 * 15, // 15 minutes for asset performance
  });
};