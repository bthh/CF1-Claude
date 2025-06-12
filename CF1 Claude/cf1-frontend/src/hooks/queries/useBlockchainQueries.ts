// CF1 Platform - Blockchain State Queries
// React Query hooks for blockchain data, network info, and real-time updates

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';

// Mock blockchain API
const blockchainAPI = {
  getBlockHeight: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      height: Math.floor(Math.random() * 1000000 + 5000000),
      timestamp: new Date().toISOString()
    };
  },

  getNetworkInfo: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      chainId: 'neutron-1',
      networkName: 'Neutron Mainnet',
      status: 'healthy',
      blockTime: 6.5,
      bondedTokens: '125847593',
      inflation: '0.12',
      communityPool: '45823',
      validators: 150,
      proposals: 23
    };
  },

  getGasPrice: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      low: '0.025',
      average: '0.035',
      high: '0.045',
      unit: 'untrn',
      timestamp: new Date().toISOString()
    };
  },

  getBalance: async (address: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      address,
      balance: (Math.random() * 10000 + 100).toFixed(6),
      denom: 'untrn',
      timestamp: new Date().toISOString()
    };
  },

  getTransaction: async (hash: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      hash,
      height: Math.floor(Math.random() * 1000000 + 5000000),
      timestamp: new Date().toISOString(),
      status: 'success',
      gasUsed: '145623',
      gasWanted: '200000',
      fee: '5000',
      events: [
        {
          type: 'execute',
          attributes: [
            { key: 'contract', value: 'neutron1...' },
            { key: 'action', value: 'invest' }
          ]
        }
      ]
    };
  }
};

// Block height query with real-time updates
export const useBlockHeightQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.blockchain.blockHeight(),
    queryFn: blockchainAPI.getBlockHeight,
    enabled,
    staleTime: 1000 * 5, // 5 seconds - very fresh for block height
    refetchInterval: 1000 * 10, // Refetch every 10 seconds
    refetchIntervalInBackground: true,
  });
};

// Network information query
export const useNetworkInfoQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.blockchain.networkInfo(),
    queryFn: blockchainAPI.getNetworkInfo,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

// Gas price query
export const useGasPriceQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.blockchain.gasPrice(),
    queryFn: blockchainAPI.getGasPrice,
    enabled,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

// Wallet balance query
export const useBalanceQuery = (address: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.wallet.balance(address),
    queryFn: () => blockchainAPI.getBalance(address),
    enabled: !!address && enabled,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

// Transaction query
export const useTransactionQuery = (hash: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: () => blockchainAPI.getTransaction(hash),
    enabled: !!hash && enabled,
    staleTime: 1000 * 60 * 60, // 1 hour - transactions don't change
    retry: (failureCount, error) => {
      // Keep retrying for pending transactions
      if (error && 'message' in error && error.message.includes('not found')) {
        return failureCount < 10;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Multiple balances query
export const useMultipleBalancesQuery = (addresses: string[], enabled: boolean = true) => {
  return useQuery({
    queryKey: ['balances', addresses],
    queryFn: async () => {
      const balances = await Promise.all(
        addresses.map(address => blockchainAPI.getBalance(address))
      );
      return balances.reduce((acc, balance) => {
        acc[balance.address] = balance;
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: addresses.length > 0 && enabled,
    staleTime: 1000 * 60, // 1 minute
  });
};

// Real-time blockchain status hook
export const useBlockchainStatus = () => {
  const blockHeightQuery = useBlockHeightQuery();
  const networkInfoQuery = useNetworkInfoQuery();
  const gasPriceQuery = useGasPriceQuery();

  const isOnline = !blockHeightQuery.isError && !networkInfoQuery.isError;
  const isLoading = blockHeightQuery.isLoading || networkInfoQuery.isLoading;

  return {
    // Status
    isOnline,
    isLoading,
    hasError: blockHeightQuery.isError || networkInfoQuery.isError,
    
    // Data
    blockHeight: blockHeightQuery.data?.height,
    networkInfo: networkInfoQuery.data,
    gasPrice: gasPriceQuery.data,
    
    // Timestamps
    lastUpdate: blockHeightQuery.dataUpdatedAt || networkInfoQuery.dataUpdatedAt,
    
    // Loading states
    isBlockHeightLoading: blockHeightQuery.isLoading,
    isNetworkInfoLoading: networkInfoQuery.isLoading,
    isGasPriceLoading: gasPriceQuery.isLoading,
    
    // Error states
    blockHeightError: blockHeightQuery.error,
    networkInfoError: networkInfoQuery.error,
    gasPriceError: gasPriceQuery.error,
    
    // Refetch functions
    refetchBlockHeight: blockHeightQuery.refetch,
    refetchNetworkInfo: networkInfoQuery.refetch,
    refetchGasPrice: gasPriceQuery.refetch
  };
};

// Transaction monitoring hook
export const useTransactionMonitor = (hash: string) => {
  const transactionQuery = useTransactionQuery(hash, !!hash);
  
  return {
    transaction: transactionQuery.data,
    isLoading: transactionQuery.isLoading,
    isError: transactionQuery.isError,
    error: transactionQuery.error,
    isPending: !transactionQuery.data && !transactionQuery.isError,
    isConfirmed: !!transactionQuery.data && transactionQuery.data.status === 'success',
    isFailed: !!transactionQuery.data && transactionQuery.data.status === 'failed',
    refetch: transactionQuery.refetch
  };
};

// Wallet connection hook with balance
export const useWalletData = (address: string) => {
  const balanceQuery = useBalanceQuery(address);
  const networkStatus = useBlockchainStatus();

  return {
    // Balance data
    balance: balanceQuery.data?.balance,
    balanceLoading: balanceQuery.isLoading,
    balanceError: balanceQuery.error,
    
    // Network status
    isOnline: networkStatus.isOnline,
    blockHeight: networkStatus.blockHeight,
    
    // Refresh functions
    refreshBalance: balanceQuery.refetch,
    
    // Combined loading state
    isLoading: balanceQuery.isLoading || networkStatus.isLoading
  };
};