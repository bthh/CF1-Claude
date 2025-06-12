// CF1 Platform - Query Hooks Index
// Centralized exports for all React Query hooks

// Proposal queries
export {
  useProposalsQuery,
  useProposalQuery,
  useInvestMutation,
  useCreateProposalMutation,
  usePrefetchProposal,
  useProposalCache
} from './useProposalQueries';

// Portfolio queries
export {
  usePortfolioQuery,
  usePortfolioTransactionsQuery,
  usePortfolioPerformanceQuery,
  usePortfolioData,
  usePortfolioRefresh,
  useAssetPerformanceQuery
} from './usePortfolioQueries';

// Blockchain queries
export {
  useBlockHeightQuery,
  useNetworkInfoQuery,
  useGasPriceQuery,
  useBalanceQuery,
  useTransactionQuery,
  useMultipleBalancesQuery,
  useBlockchainStatus,
  useTransactionMonitor,
  useWalletData
} from './useBlockchainQueries';

// Query utilities
export { queryKeys, invalidateQueries, cacheUtils } from '../../lib/queryClient';