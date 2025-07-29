import { useCallback } from 'react';
import { cosmjsClient } from '../services/cosmjs';
import { useBusinessTracking } from './useMonitoring';
import { ErrorHandler } from '../lib/errorHandler';
import { useCosmJSContext } from '../providers/CosmJSProvider';

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
  
  // Trading functions
  placeOrder: (params: any) => Promise<any>;
  cancelOrder: (orderId: string) => Promise<any>;
  
  // AMM functions
  addLiquidity: (poolId: string, amountA: string, amountB: string) => Promise<any>;
  removeLiquidity: (poolId: string, lpAmount: string) => Promise<any>;
  swap: (poolId: string, tokenIn: string, amountIn: string) => Promise<any>;
  
  // Staking functions
  stake: (poolId: string, amount: string, lockPeriod?: number) => Promise<any>;
  unstake: (poolId: string, amount: string) => Promise<any>;
  claimRewards: (poolId: string) => Promise<any>;
  
  // Lending functions
  createLendingPool: (poolId: string, assetDenom: string) => Promise<any>;
  supplyToPool: (poolId: string, amount: string) => Promise<any>;
  borrowFromPool: (poolId: string, borrowAmount: string) => Promise<any>;
  repayLoan: (poolId: string, repayAmount: string) => Promise<any>;
  depositCollateral: (poolId: string, tokenAddress: string, tokenId: string, amount: string) => Promise<any>;
  liquidatePosition: (borrower: string, poolId: string) => Promise<any>;
  
  // Query functions
  queryProposal: (proposalId: string) => Promise<any>;
  queryAllProposals: (startAfter?: string, limit?: number) => Promise<any>;
  queryUserPortfolio: (user?: string) => Promise<any>;
  queryPlatformStats: () => Promise<any>;
  
  // Specific launchpad query
  queryLaunchpadProposals: (status?: string, startAfter?: string, limit?: number) => Promise<any>;
  queryUserInvestments: (user?: string) => Promise<any>;
  
  // Error state
  error: string | null;
  clearError: () => void;
  
  // Utility functions
  formatAmount: (amount: string | number, decimals?: number) => string;
  parseAmount: (amount: string, decimals?: number) => string;
}

export const useCosmJS = (): UseCosmJSReturn => {
  // Use the context for shared connection state
  const { 
    address, 
    isConnected, 
    isConnecting, 
    balance, 
    connect, 
    disconnect,
    error,
    clearError 
  } = useCosmJSContext();

  // Monitoring hooks for business functions
  const { trackInvestment } = useBusinessTracking();

  // Contract interaction functions
  const createProposal = useCallback(async (params: any) => {
    try {
      const result = await cosmjsClient.createProposal(params);
      return result;
    } catch (err: any) {
      ErrorHandler.handle(err, 'Create Proposal');
      throw err;
    }
  }, []);

  const updateProposal = useCallback(async (params: any) => {
    try {
      const result = await cosmjsClient.updateProposal(params);
      return result;
    } catch (err) {
      ErrorHandler.handle(err, 'Update Proposal');
      throw err;
    }
  }, []);

  const cancelProposal = useCallback(async (proposalId: string) => {
    try {
      const result = await cosmjsClient.cancelProposal(proposalId);
      return result;
    } catch (err) {
      ErrorHandler.handle(err, 'Cancel Proposal');
      throw err;
    }
  }, []);

  const invest = useCallback(async (proposalId: string, amount: string) => {
    try {
      // Track investment attempt
      trackInvestment.started(proposalId, amount, address);
      
      const result = await cosmjsClient.invest(proposalId, amount);
      
      // Track successful investment
      trackInvestment.completed(proposalId, amount, address);
      
      return result;
    } catch (err) {
      // Track failed investment
      trackInvestment.failed(proposalId, amount, address, err instanceof Error ? err.message : 'Unknown error');
      ErrorHandler.handle(err, 'Investment');
      throw err;
    }
  }, [address, trackInvestment]);

  // Trading functions
  const placeOrder = useCallback(async (params: any) => {
    try {
      return await cosmjsClient.placeOrder(params);
    } catch (err) {
      ErrorHandler.handle(err, 'Place Order');
      throw err;
    }
  }, []);

  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      return await cosmjsClient.cancelOrder(orderId);
    } catch (err) {
      ErrorHandler.handle(err, 'Cancel Order');
      throw err;
    }
  }, []);

  // AMM functions
  const addLiquidity = useCallback(async (poolId: string, amountA: string, amountB: string) => {
    try {
      return await cosmjsClient.addLiquidity(poolId, amountA, amountB);
    } catch (err) {
      ErrorHandler.handle(err, 'Add Liquidity');
      throw err;
    }
  }, []);

  const removeLiquidity = useCallback(async (poolId: string, lpAmount: string) => {
    try {
      return await cosmjsClient.removeLiquidity(poolId, lpAmount);
    } catch (err) {
      ErrorHandler.handle(err, 'Remove Liquidity');
      throw err;
    }
  }, []);

  const swap = useCallback(async (poolId: string, tokenIn: string, amountIn: string) => {
    try {
      return await cosmjsClient.swap(poolId, tokenIn, amountIn);
    } catch (err) {
      ErrorHandler.handle(err, 'Swap');
      throw err;
    }
  }, []);

  // Staking functions
  const stake = useCallback(async (poolId: string, amount: string, lockPeriod?: number) => {
    try {
      return await cosmjsClient.stake(poolId, amount, lockPeriod);
    } catch (err) {
      ErrorHandler.handle(err, 'Stake');
      throw err;
    }
  }, []);

  const unstake = useCallback(async (poolId: string, amount: string) => {
    try {
      return await cosmjsClient.unstake(poolId, amount);
    } catch (err) {
      ErrorHandler.handle(err, 'Unstake');
      throw err;
    }
  }, []);

  const claimRewards = useCallback(async (poolId: string) => {
    try {
      return await cosmjsClient.claimRewards(poolId);
    } catch (err) {
      ErrorHandler.handle(err, 'Claim Rewards');
      throw err;
    }
  }, []);

  // Lending functions
  const createLendingPool = useCallback(async (poolId: string, assetDenom: string) => {
    try {
      return await cosmjsClient.createLendingPool(poolId, assetDenom);
    } catch (err) {
      ErrorHandler.handle(err, 'Create Lending Pool');
      throw err;
    }
  }, []);

  const supplyToPool = useCallback(async (poolId: string, amount: string) => {
    try {
      return await cosmjsClient.supplyToPool(poolId, amount);
    } catch (err) {
      ErrorHandler.handle(err, 'Supply to Pool');
      throw err;
    }
  }, []);

  const borrowFromPool = useCallback(async (poolId: string, borrowAmount: string) => {
    try {
      return await cosmjsClient.borrowFromPool(poolId, borrowAmount);
    } catch (err) {
      ErrorHandler.handle(err, 'Borrow from Pool');
      throw err;
    }
  }, []);

  const repayLoan = useCallback(async (poolId: string, repayAmount: string) => {
    try {
      return await cosmjsClient.repayLoan(poolId, repayAmount);
    } catch (err) {
      ErrorHandler.handle(err, 'Repay Loan');
      throw err;
    }
  }, []);

  const depositCollateral = useCallback(async (poolId: string, tokenAddress: string, tokenId: string, amount: string) => {
    try {
      return await cosmjsClient.depositCollateral(poolId, tokenAddress, tokenId, amount);
    } catch (err) {
      ErrorHandler.handle(err, 'Deposit Collateral');
      throw err;
    }
  }, []);

  const liquidatePosition = useCallback(async (borrower: string, poolId: string) => {
    try {
      return await cosmjsClient.liquidatePosition(borrower, poolId);
    } catch (err) {
      ErrorHandler.handle(err, 'Liquidate Position');
      throw err;
    }
  }, []);

  // Query functions
  const queryProposal = useCallback(async (proposalId: string) => {
    try {
      return await cosmjsClient.queryProposal(proposalId);
    } catch (err) {
      ErrorHandler.handle(err, 'Query Proposal');
      throw err;
    }
  }, []);

  const queryAllProposals = useCallback(async (startAfter?: string, limit?: number) => {
    try {
      return await cosmjsClient.queryAllProposals(startAfter, limit);
    } catch (err) {
      ErrorHandler.handle(err, 'Query All Proposals');
      throw err;
    }
  }, []);

  const queryUserPortfolio = useCallback(async (user?: string) => {
    try {
      return await cosmjsClient.queryUserPortfolio(user || address);
    } catch (err) {
      ErrorHandler.handle(err, 'Query User Portfolio');
      throw err;
    }
  }, [address]);

  const queryPlatformStats = useCallback(async () => {
    try {
      return await cosmjsClient.queryPlatformStats();
    } catch (err) {
      ErrorHandler.handle(err, 'Query Platform Stats');
      throw err;
    }
  }, []);

  const queryLaunchpadProposals = useCallback(async (status?: string, startAfter?: string, limit?: number) => {
    try {
      return await cosmjsClient.queryLaunchpadProposals(status, startAfter, limit);
    } catch (err) {
      ErrorHandler.handle(err, 'Query Launchpad Proposals');
      throw err;
    }
  }, []);

  const queryUserInvestments = useCallback(async (user?: string) => {
    try {
      return await cosmjsClient.queryUserInvestments(user || address);
    } catch (err) {
      ErrorHandler.handle(err, 'Query User Investments');
      throw err;
    }
  }, [address]);

  // Utility functions
  const formatAmount = useCallback((amount: string | number, decimals: number = 6): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0';
    
    // Convert from micro units to full units
    const formatted = (numAmount / Math.pow(10, decimals)).toFixed(2);
    return formatted;
  }, []);

  const parseAmount = useCallback((amount: string, decimals: number = 6): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0';
    
    // Convert from full units to micro units
    const parsed = (numAmount * Math.pow(10, decimals)).toString();
    return parsed;
  }, []);

  return {
    // Connection state
    address,
    isConnected,
    isConnecting,
    balance,
    
    // Connection functions
    connect,
    disconnect,
    
    // Contract functions
    createProposal,
    updateProposal,
    cancelProposal,
    invest,
    
    // Trading functions
    placeOrder,
    cancelOrder,
    
    // AMM functions
    addLiquidity,
    removeLiquidity,
    swap,
    
    // Staking functions
    stake,
    unstake,
    claimRewards,
    
    // Lending functions
    createLendingPool,
    supplyToPool,
    borrowFromPool,
    repayLoan,
    depositCollateral,
    liquidatePosition,
    
    // Query functions
    queryProposal,
    queryAllProposals,
    queryUserPortfolio,
    queryPlatformStats,
    queryLaunchpadProposals,
    queryUserInvestments,
    
    // Error state
    error,
    clearError,
    
    // Utility functions
    formatAmount,
    parseAmount,
  };
};