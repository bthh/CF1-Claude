import { useState, useEffect, useCallback } from 'react';
import { cosmjsClient } from '../services/cosmjs';
import { useBusinessTracking, useUserTracking } from './useMonitoring';

export interface UseCosmJSReturn {
  // Connection state
  address: string;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  
  // Connection functions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Contract functions
  createProposal: (params: any) => Promise<any>;
  updateProposal: (params: any) => Promise<any>;
  cancelProposal: (proposalId: string) => Promise<any>;
  invest: (proposalId: string, amount: string) => Promise<any>;
  
  // Query functions
  queryProposal: (proposalId: string) => Promise<any>;
  queryAllProposals: (startAfter?: string, limit?: number) => Promise<any>;
  queryUserPortfolio: (user?: string) => Promise<any>;
  queryPlatformStats: () => Promise<any>;
  
  // Utility functions
  formatAmount: (amount: string) => string;
  parseAmount: (amount: string) => string;
  
  // Error state
  error: string | null;
  clearError: () => void;
}

export const useCosmJS = (): UseCosmJSReturn => {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);

  // Monitoring hooks
  const { trackWallet, trackInvestment } = useBusinessTracking();
  const { setUser, clearUser } = useUserTracking();

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (cosmjsClient.isConnected()) {
        setAddress(cosmjsClient.getAddress());
        setIsConnected(true);
        await updateBalance();
      }
    };
    
    checkConnection();
  }, []);

  // Update balance
  const updateBalance = useCallback(async () => {
    try {
      if (cosmjsClient.isConnected()) {
        const bal = await cosmjsClient.getBalance();
        setBalance(bal);
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const addr = await cosmjsClient.connectWallet();
      setAddress(addr);
      setIsConnected(true);
      await updateBalance();

      // Track wallet connection
      const walletType = cosmjsClient.isDemoMode() ? 'demo' : 'keplr';
      const walletTracking = trackWallet;
      walletTracking.connected(addr, walletType);
      
      // Set user context for monitoring
      setUser({
        walletAddress: addr,
        sessionId: `session_${Date.now()}`,
        userAgent: navigator.userAgent,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, updateBalance]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    const currentAddress = address;
    
    await cosmjsClient.disconnectWallet();
    setAddress('');
    setIsConnected(false);
    setBalance('0');
    setError(null);

    // Track wallet disconnection
    if (currentAddress) {
      const walletTracking = trackWallet;
      walletTracking.disconnected(currentAddress);
    }
    
    // Clear user context
    clearUser();
  }, [address, trackWallet, clearUser]);

  // Contract interaction functions
  const createProposal = useCallback(async (params: any) => {
    setError(null);
    try {
      const result = await cosmjsClient.createProposal(params);
      await updateBalance(); // Update balance after transaction
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create proposal');
      throw err;
    }
  }, [updateBalance]);

  const updateProposal = useCallback(async (params: any) => {
    setError(null);
    try {
      const result = await cosmjsClient.updateProposal(params);
      await updateBalance();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update proposal');
      throw err;
    }
  }, [updateBalance]);

  const cancelProposal = useCallback(async (proposalId: string) => {
    setError(null);
    try {
      const result = await cosmjsClient.cancelProposal(proposalId);
      await updateBalance();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel proposal');
      throw err;
    }
  }, [updateBalance]);

  const invest = useCallback(async (proposalId: string, amount: string) => {
    setError(null);
    
    // Track investment start
    const investmentTracking = trackInvestment;
    investmentTracking.started(proposalId, amount);
    
    try {
      const result = await cosmjsClient.invest(proposalId, amount);
      await updateBalance();
      
      // Track successful investment
      investmentTracking.completed(proposalId, amount, result.transactionHash);
      
      return result;
    } catch (err: any) {
      // Track failed investment
      investmentTracking.failed(proposalId, amount, err.message || 'Unknown error');
      
      setError(err.message || 'Failed to invest');
      throw err;
    }
  }, [updateBalance, trackInvestment]);

  // Query functions
  const queryProposal = useCallback(async (proposalId: string) => {
    setError(null);
    try {
      return await cosmjsClient.queryProposal(proposalId);
    } catch (err: any) {
      setError(err.message || 'Failed to query proposal');
      throw err;
    }
  }, []);

  const queryAllProposals = useCallback(async (startAfter?: string, limit?: number) => {
    setError(null);
    try {
      return await cosmjsClient.queryAllProposals(startAfter, limit);
    } catch (err: any) {
      setError(err.message || 'Failed to query proposals');
      throw err;
    }
  }, []);

  const queryUserPortfolio = useCallback(async (user?: string) => {
    setError(null);
    try {
      const userAddress = user || address;
      if (!userAddress) {
        throw new Error('No user address provided');
      }
      return await cosmjsClient.queryUserPortfolio(userAddress);
    } catch (err: any) {
      setError(err.message || 'Failed to query portfolio');
      throw err;
    }
  }, [address]);

  const queryPlatformStats = useCallback(async () => {
    setError(null);
    try {
      return await cosmjsClient.queryPlatformStats();
    } catch (err: any) {
      setError(err.message || 'Failed to query platform stats');
      throw err;
    }
  }, []);

  // Utility functions
  const formatAmount = useCallback((amount: string) => {
    return cosmjsClient.formatAmount(amount);
  }, []);

  const parseAmount = useCallback((amount: string) => {
    return cosmjsClient.parseAmount(amount);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    address,
    isConnected,
    isConnecting,
    balance,
    error,
    
    // Functions
    connect,
    disconnect,
    createProposal,
    updateProposal,
    cancelProposal,
    invest,
    queryProposal,
    queryAllProposals,
    queryUserPortfolio,
    queryPlatformStats,
    formatAmount,
    parseAmount,
    clearError,
  };
};

// Custom hook for proposal data
export const useProposal = (proposalId: string) => {
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { queryProposal } = useCosmJS();

  const refetch = useCallback(async () => {
    if (!proposalId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await queryProposal(proposalId);
      setProposal(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch proposal');
    } finally {
      setLoading(false);
    }
  }, [proposalId, queryProposal]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { proposal, loading, error, refetch };
};

// Custom hook for proposals list
export const useProposals = (filters?: { creator?: string; status?: string; limit?: number }) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { queryAllProposals } = useCosmJS();

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await queryAllProposals(undefined, filters?.limit);
      setProposals(data.proposals || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  }, [queryAllProposals, filters?.limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { proposals, loading, error, refetch };
};

// Custom hook for user portfolio
export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { address, queryUserPortfolio, isConnected } = useCosmJS();

  const refetch = useCallback(async () => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const [portfolioData, performanceData] = await Promise.all([
        queryUserPortfolio(address),
        cosmjsClient.queryPortfolioPerformance(address),
      ]);
      
      setPortfolio(portfolioData);
      setPerformance(performanceData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, queryUserPortfolio]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { portfolio, performance, loading, error, refetch };
};