// CF1 Platform - React Query Configuration
// Optimized caching and data fetching for blockchain data

import { QueryClient } from '@tanstack/react-query';

// Query key factories for consistent cache keys
export const queryKeys = {
  // Blockchain queries
  proposals: {
    all: ['proposals'] as const,
    lists: () => [...queryKeys.proposals.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.proposals.lists(), { filters }] as const,
    details: () => [...queryKeys.proposals.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.proposals.details(), id] as const,
  },
  
  // Portfolio queries
  portfolio: {
    all: (address: string) => ['portfolio', address] as const,
    assets: (address: string) => [...queryKeys.portfolio.all(address), 'assets'] as const,
    transactions: (address: string) => [...queryKeys.portfolio.all(address), 'transactions'] as const,
    performance: (address: string, timeframe: string) => [...queryKeys.portfolio.all(address), 'performance', timeframe] as const,
    summary: (address: string) => [...queryKeys.portfolio.all(address), 'summary'] as const,
  },
  
  // Wallet queries
  wallet: {
    all: (address: string) => ['wallet', address] as const,
    balance: (address: string) => [...queryKeys.wallet.all(address), 'balance'] as const,
    transactions: (address: string) => [...queryKeys.wallet.all(address), 'transactions'] as const,
  },
  
  // Blockchain state queries
  blockchain: {
    all: ['blockchain'] as const,
    blockHeight: () => [...queryKeys.blockchain.all, 'blockHeight'] as const,
    networkInfo: () => [...queryKeys.blockchain.all, 'networkInfo'] as const,
    gasPrice: () => [...queryKeys.blockchain.all, 'gasPrice'] as const,
  },

  // Governance queries
  governance: {
    all: ['governance'] as const,
    proposals: () => [...queryKeys.governance.all, 'proposals'] as const,
    proposal: (id: string) => [...queryKeys.governance.all, 'proposal', id] as const,
    votes: (proposalId: string, voter?: string) => [...queryKeys.governance.all, 'votes', proposalId, voter] as const,
  },

  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    platformStats: () => [...queryKeys.analytics.all, 'platformStats'] as const,
    assetPerformance: (assetId: string) => [...queryKeys.analytics.all, 'assetPerformance', assetId] as const,
    marketData: () => [...queryKeys.analytics.all, 'marketData'] as const,
  }
} as const;

// Create optimized query client
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time - how long data stays fresh (5 minutes for blockchain data)
        staleTime: 1000 * 60 * 5,
        
        // Cache time - how long inactive data stays in cache (30 minutes)
        gcTime: 1000 * 60 * 30,
        
        // Retry configuration for blockchain queries
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error && error.message.includes('4')) {
            return false;
          }
          // Retry up to 3 times for network errors
          return failureCount < 3;
        },
        
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch on window focus for real-time data
        refetchOnWindowFocus: true,
        
        // Background refetch interval (30 seconds for active queries)
        refetchInterval: 1000 * 30,
        
        // Refetch when connection is restored
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        
        // Retry delay for mutations
        retryDelay: 1000,
      },
    },
  });
};

// Query invalidation helpers
export const invalidateQueries = {
  // Invalidate all proposal data
  proposals: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
  },
  
  // Invalidate specific proposal
  proposal: (queryClient: QueryClient, proposalId: string) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.proposals.detail(proposalId) });
  },
  
  // Invalidate portfolio data for user
  portfolio: (queryClient: QueryClient, address: string) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all(address) });
  },
  
  // Invalidate wallet data
  wallet: (queryClient: QueryClient, address: string) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all(address) });
  },
  
  // Invalidate blockchain state
  blockchain: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.blockchain.all });
  },
  
  // Invalidate after transaction
  afterTransaction: (queryClient: QueryClient, userAddress: string, proposalId?: string) => {
    // Invalidate user-specific data
    invalidateQueries.portfolio(queryClient, userAddress);
    invalidateQueries.wallet(queryClient, userAddress);
    
    // Invalidate proposal data if involved
    if (proposalId) {
      invalidateQueries.proposal(queryClient, proposalId);
    }
    
    // Invalidate platform stats
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.platformStats() });
  }
};

// Cache optimization utilities
export const cacheUtils = {
  // Prefetch related data
  prefetchProposalDetails: (queryClient: QueryClient, proposalId: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.proposals.detail(proposalId),
      staleTime: 1000 * 60 * 10, // 10 minutes for prefetched data
    });
  },
  
  // Set optimistic update for investment
  setOptimisticInvestment: (
    queryClient: QueryClient, 
    proposalId: string, 
    amount: string,
    _: string
  ) => {
    // Update proposal funding optimistically
    queryClient.setQueryData(
      queryKeys.proposals.detail(proposalId),
      (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          funding_status: {
            ...oldData.funding_status,
            raised_amount: (
              parseFloat(oldData.funding_status.raised_amount) + parseFloat(amount)
            ).toString(),
            investor_count: oldData.funding_status.investor_count + 1
          }
        };
      }
    );
  },
  
  // Remove stale data
  removeStaleData: (queryClient: QueryClient) => {
    queryClient.clear();
  },
  
  // Get cached data
  getCachedProposal: (queryClient: QueryClient, proposalId: string) => {
    return queryClient.getQueryData(queryKeys.proposals.detail(proposalId));
  },
  
  // Update cached proposal
  updateCachedProposal: (queryClient: QueryClient, proposalId: string, updates: any) => {
    queryClient.setQueryData(
      queryKeys.proposals.detail(proposalId),
      (oldData: any) => oldData ? { ...oldData, ...updates } : oldData
    );
  }
};