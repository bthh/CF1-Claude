// CF1 Platform - Custom Zustand Hooks
// Convenient hooks for common state operations

import { useCallback } from 'react';
import { 
  useAuthStore, 
  useWalletStore, 
  useProposalStore, 
  usePortfolioStore, 
  useUIStore 
} from './index';

// Auth hooks
export const useAuth = () => {
  const { isAuthenticated, user, login, logout, loading, error } = useAuthStore();
  
  const handleLogin = useCallback(async (address: string) => {
    try {
      await login(address);
      useUIStore.getState().addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'Successfully connected to CF1 Platform'
      });
    } catch (error) {
      useUIStore.getState().addNotification({
        type: 'error',
        title: 'Login failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [login]);

  const handleLogout = useCallback(() => {
    logout();
    useWalletStore.getState().disconnect();
    useUIStore.getState().addNotification({
      type: 'info',
      title: 'Logged out',
      message: 'Successfully disconnected from platform'
    });
  }, [logout]);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout
  };
};

// Wallet hooks
export const useWallet = () => {
  const { 
    isConnected, 
    isConnecting, 
    connection, 
    connect, 
    disconnect, 
    refreshBalance,
    error 
  } = useWalletStore();
  
  const handleConnect = useCallback(async (walletType: 'keplr' | 'cosmostation' | 'leap' | 'other') => {
    try {
      await connect(walletType);
      if (isConnected && connection) {
        // Auto-login after wallet connection
        await useAuthStore.getState().login(connection.address);
      }
    } catch (error) {
      useUIStore.getState().addNotification({
        type: 'error',
        title: 'Wallet connection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [connect, isConnected, connection]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    useAuthStore.getState().logout();
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connection,
    error,
    connect: handleConnect,
    disconnect: handleDisconnect,
    refreshBalance
  };
};

// Investment hooks
export const useInvestment = () => {
  const { invest, loading, error } = useProposalStore();
  const { addTransaction } = useWalletStore();
  const { addNotification } = useUIStore();

  const handleInvest = useCallback(async (proposalId: string, amount: string) => {
    try {
      await invest(proposalId, amount);
      
      // Add transaction to wallet store
      addTransaction({
        hash: `tx_${Date.now()}`,
        type: 'invest',
        amount,
        status: 'confirmed',
        proposalId
      });

      addNotification({
        type: 'success',
        title: 'Investment successful!',
        message: `Successfully invested $${(parseFloat(amount) / 1000000).toFixed(2)} in proposal`,
        actionUrl: `/launchpad/proposal/${proposalId}`
      });

      // Refresh portfolio
      const userAddress = useWalletStore.getState().connection?.address;
      if (userAddress) {
        usePortfolioStore.getState().refreshPortfolio(userAddress);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Investment failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [invest, addTransaction, addNotification]);

  return {
    invest: handleInvest,
    loading,
    error
  };
};

// Portfolio hooks
export const usePortfolioData = () => {
  const { 
    assets, 
    summary, 
    transactions, 
    performance, 
    selectedTimeframe,
    fetchPortfolio,
    setSelectedTimeframe,
    loading,
    error 
  } = usePortfolioStore();

  const refreshData = useCallback(async () => {
    const userAddress = useWalletStore.getState().connection?.address;
    if (userAddress) {
      await fetchPortfolio(userAddress);
    }
  }, [fetchPortfolio]);

  return {
    assets,
    summary,
    transactions,
    performance,
    selectedTimeframe,
    setSelectedTimeframe,
    refreshData,
    loading,
    error
  };
};

// Proposals hooks
export const useProposalData = () => {
  const { 
    proposals, 
    selectedProposal, 
    filters,
    fetchProposals,
    fetchProposal,
    setFilters,
    loading,
    error 
  } = useProposalStore();

  const loadProposals = useCallback(async () => {
    await fetchProposals();
  }, [fetchProposals]);

  const loadProposal = useCallback(async (id: string) => {
    await fetchProposal(id);
  }, [fetchProposal]);

  return {
    proposals,
    selectedProposal,
    filters,
    setFilters,
    loadProposals,
    loadProposal,
    loading,
    error
  };
};

// UI hooks
export const useNotifications = () => {
  const { 
    notifications, 
    unreadCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearNotifications
  } = useUIStore();

  return {
    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearNotifications
  };
};

export const useTheme = () => {
  const { darkMode, toggleDarkMode } = useUIStore();
  
  return {
    darkMode,
    toggleDarkMode
  };
};

export const useModals = () => {
  const { modals, openModal, closeModal, closeAllModals } = useUIStore();
  
  return {
    modals,
    openModal,
    closeModal,
    closeAllModals
  };
};

// Loading state hooks
export const useGlobalLoading = () => {
  const { globalLoading, setGlobalLoading } = useUIStore();
  
  return {
    globalLoading,
    setGlobalLoading
  };
};

export const useLoadingState = (key: string) => {
  const { loadingStates, setLoading } = useUIStore();
  
  return {
    loading: loadingStates[key] || false,
    setLoading: (loading: boolean) => setLoading(key, loading)
  };
};