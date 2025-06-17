import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { cosmjsClient } from '../services/cosmjs';
import { useBusinessTracking, useUserTracking } from '../hooks/useMonitoring';
import { ErrorHandler } from '../lib/errorHandler';

interface CosmJSContextType {
  // Connection state
  address: string;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  
  // Connection functions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Error state
  error: string | null;
  clearError: () => void;
}

const CosmJSContext = createContext<CosmJSContextType | null>(null);

export const useCosmJSContext = (): CosmJSContextType => {
  const context = useContext(CosmJSContext);
  if (!context) {
    throw new Error('useCosmJSContext must be used within CosmJSProvider');
  }
  return context;
};

interface CosmJSProviderProps {
  children: ReactNode;
}

export const CosmJSProvider: React.FC<CosmJSProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);

  // Monitoring hooks
  const { trackWallet } = useBusinessTracking();
  const { setUser, clearUser } = useUserTracking();

  // Update balance
  const updateBalance = useCallback(async () => {
    try {
      if (cosmjsClient.isConnected()) {
        const bal = await cosmjsClient.getBalance();
        setBalance(bal);
      }
    } catch (err) {
      ErrorHandler.handle(err, 'Fetch Balance');
    }
  }, []);

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = cosmjsClient.isConnected();
      console.log('CosmJSProvider - checkConnection:', connected);
      
      if (connected) {
        const addr = cosmjsClient.getAddress();
        console.log('CosmJSProvider - address:', addr);
        setAddress(addr);
        setIsConnected(true);
        await updateBalance();
      }
    };
    
    checkConnection();
  }, [updateBalance]);

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
      trackWallet.connected(addr, walletType);
      
      // Set user context for monitoring
      setUser({
        walletAddress: addr,
        sessionId: `session_${Date.now()}`,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMsg);
      ErrorHandler.handle(err, 'Connect Wallet');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, updateBalance, trackWallet, setUser]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    const currentAddress = address;
    
    try {
      await cosmjsClient.disconnectWallet();
      setAddress('');
      setIsConnected(false);
      setBalance('0');
      clearUser();
      
      // Track disconnection
      if (currentAddress) {
        trackWallet.disconnected(currentAddress);
      }
    } catch (err) {
      ErrorHandler.handle(err, 'Disconnect Wallet');
      throw err;
    }
  }, [address, clearUser, trackWallet]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: CosmJSContextType = {
    address,
    isConnected,
    isConnecting,
    balance,
    connect,
    disconnect,
    error,
    clearError,
  };

  return (
    <CosmJSContext.Provider value={value}>
      {children}
    </CosmJSContext.Provider>
  );
};