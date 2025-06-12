// CF1 Platform - Proposal Data Queries
// React Query hooks for proposal and investment data

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateQueries, cacheUtils } from '../../lib/queryClient';
import { useUIStore } from '../../store/uiStore';

// Mock API functions (replace with actual blockchain calls)
const proposalAPI = {
  getProposals: async (filters: any = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock proposals based on filters
    const mockProposals = Array.from({ length: 12 }, (_, i) => ({
      id: `proposal_${i + 1}`,
      asset_details: {
        name: `Investment Opportunity ${i + 1}`,
        asset_type: ['Real Estate', 'Technology', 'Green Energy'][i % 3],
        category: ['Real Estate', 'Technology', 'Green Energy'][i % 3],
        location: ['New York, NY', 'San Francisco, CA', 'Austin, TX'][i % 3],
        description: `Premium investment opportunity with strong fundamentals.`,
      },
      financial_terms: {
        target_amount: `${(Math.random() * 5000000 + 1000000).toFixed(0)}000000`,
        token_price: '1000000',
        total_shares: Math.floor(Math.random() * 10000 + 1000),
        minimum_investment: '1000000000',
        expected_apy: `${(Math.random() * 10 + 8).toFixed(1)}%`,
        funding_deadline: Date.now() / 1000 + 86400 * (Math.random() * 60 + 30)
      },
      funding_status: {
        raised_amount: `${(Math.random() * 2500000 + 500000).toFixed(0)}000000`,
        investor_count: Math.floor(Math.random() * 100 + 10),
        is_funded: Math.random() > 0.7,
        tokens_minted: false
      },
      status: 'Active',
      creator: 'neutron1creator123',
      created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
    }));

    // Apply filters
    let filtered = mockProposals;
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(p => p.asset_details.category === filters.category);
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.searchTerm) {
      filtered = filtered.filter(p => 
        p.asset_details.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'funded':
            return parseFloat(b.funding_status.raised_amount) - parseFloat(a.funding_status.raised_amount);
          case 'deadline':
            return a.financial_terms.funding_deadline - b.financial_terms.funding_deadline;
          case 'apy':
            return parseFloat(b.financial_terms.expected_apy) - parseFloat(a.financial_terms.expected_apy);
          default:
            return 0;
        }
      });
    }

    return {
      proposals: filtered,
      total: filtered.length,
      page: 1,
      hasMore: false
    };
  },

  getProposal: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id,
      asset_details: {
        name: 'Downtown Seattle Office',
        asset_type: 'Commercial Real Estate',
        category: 'Real Estate',
        location: 'Seattle, WA',
        description: 'Premium Class A office building',
      },
      financial_terms: {
        target_amount: '5000000000000',
        token_price: '1000000000',
        total_shares: 5000,
        minimum_investment: '1000000000',
        expected_apy: '12.5%',
        funding_deadline: Date.now() / 1000 + 86400 * 30,
      },
      funding_status: {
        raised_amount: '2500000000000',
        investor_count: 25,
        is_funded: false,
        tokens_minted: false,
      },
      status: 'Active',
      creator: 'neutron1creator123',
      created_at: new Date().toISOString()
    };
  },

  invest: async (proposalId: string, amount: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      transactionHash: `tx_${Date.now()}`,
      proposalId,
      amount,
      shares: Math.floor(parseFloat(amount) / 1000000),
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    };
  },

  createProposal: async (proposalData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      ...proposalData,
      id: `proposal_${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'Active'
    };
  }
};

// Proposal list query
export const useProposalsQuery = (filters: any = {}) => {
  return useQuery({
    queryKey: queryKeys.proposals.list(filters),
    queryFn: () => proposalAPI.getProposals(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes for list data
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
};

// Single proposal query
export const useProposalQuery = (proposalId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.proposals.detail(proposalId),
    queryFn: () => proposalAPI.getProposal(proposalId),
    enabled: !!proposalId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes for detail data
  });
};

// Investment mutation
export const useInvestMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ proposalId, amount }: { proposalId: string; amount: string }) =>
      proposalAPI.invest(proposalId, amount),
    
    onMutate: async ({ proposalId, amount }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.proposals.detail(proposalId) });
      
      // Snapshot previous value
      const previousProposal = queryClient.getQueryData(queryKeys.proposals.detail(proposalId));
      
      // Optimistically update proposal funding
      cacheUtils.setOptimisticInvestment(queryClient, proposalId, amount, 'neutron1user123');
      
      return { previousProposal, proposalId };
    },
    
    onError: (err, _, context) => {
      // Rollback optimistic update
      if (context?.previousProposal) {
        queryClient.setQueryData(
          queryKeys.proposals.detail(context.proposalId),
          context.previousProposal
        );
      }
      
      addNotification({
        type: 'error',
        title: 'Investment failed',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    },
    
    onSuccess: (_, variables) => {
      addNotification({
        type: 'success',
        title: 'Investment successful!',
        message: `Successfully invested $${(parseFloat(variables.amount) / 1000000).toFixed(2)}`,
        actionUrl: `/launchpad/proposal/${variables.proposalId}`
      });
      
      // Invalidate and refetch related data
      invalidateQueries.afterTransaction(queryClient, 'neutron1user123', variables.proposalId);
    },
    
    onSettled: (_, __, variables) => {
      // Always refetch proposal data to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.detail(variables.proposalId) });
    }
  });
};

// Create proposal mutation
export const useCreateProposalMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();

  return useMutation({
    mutationFn: proposalAPI.createProposal,
    
    onSuccess: (data) => {
      // Invalidate proposals list to show new proposal
      queryClient.invalidateQueries({ queryKey: queryKeys.proposals.lists() });
      
      addNotification({
        type: 'success',
        title: 'Proposal created!',
        message: 'Your proposal has been submitted successfully',
        actionUrl: `/launchpad/proposal/${data.id}`
      });
    },
    
    onError: (err) => {
      addNotification({
        type: 'error',
        title: 'Failed to create proposal',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    }
  });
};

// Prefetch proposal details
export const usePrefetchProposal = () => {
  const queryClient = useQueryClient();
  
  return (proposalId: string) => {
    cacheUtils.prefetchProposalDetails(queryClient, proposalId);
  };
};

// Get cached proposal data
export const useProposalCache = () => {
  const queryClient = useQueryClient();
  
  return {
    getCachedProposal: (proposalId: string) => 
      cacheUtils.getCachedProposal(queryClient, proposalId),
    updateCachedProposal: (proposalId: string, updates: any) =>
      cacheUtils.updateCachedProposal(queryClient, proposalId, updates)
  };
};