import React from 'react';
import { Wallet } from 'lucide-react';
import { useCosmJS } from '../hooks/useCosmJS';
import { cosmjsClient } from '../services/cosmjs';

interface WalletConnectionProps {
  className?: string;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ className = '' }) => {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    balance, 
    connect, 
    disconnect, 
    formatAmount,
    error,
    clearError
  } = useCosmJS();

  const handleConnect = async () => {
    clearError();
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span className="text-red-800 dark:text-red-200 text-sm">
              {error}
            </span>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`${className}`}>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                     text-white px-4 py-2 rounded-lg font-medium transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Connecting...
            </div>
          ) : (
            cosmjsClient.isDemoMode() ? 'Connect Demo Wallet' : 'Connect Wallet'
          )}
        </button>
        {cosmjsClient.isDemoMode() && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Demo mode: Blockchain interactions are simulated
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {truncateAddress(address)}
              {cosmjsClient.isDemoMode() && (
                <span className="ml-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1 rounded">
                  DEMO
                </span>
              )}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Balance: {formatAmount(balance)} NTRN
            </span>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 
                     text-sm font-medium transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

export const ConnectWalletButton: React.FC<{ className?: string; showIcon?: boolean; variant?: 'primary' | 'secondary' }> = ({ 
  className = '', 
  showIcon = true,
  variant = 'primary'
}) => {
  const { isConnected, connect, isConnecting, clearError } = useCosmJS();

  if (isConnected) {
    return null;
  }

  const handleConnect = async () => {
    clearError();
    await connect();
  };

  const baseClasses = "font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2";
  const variantClasses = variant === 'primary' 
    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
    : ""; // Secondary variant will be styled by parent

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={variant === 'primary' ? `${baseClasses} ${variantClasses} ${className}` : `${baseClasses} ${className}`}
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Connecting...</span>
        </>
      ) : (
        <>
          {showIcon && <Wallet className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {cosmjsClient.isDemoMode() ? 'Connect Demo Wallet' : 'Connect Wallet'}
          </span>
        </>
      )}
    </button>
  );
};

export const WalletStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { address, isConnected, balance, formatAmount } = useCosmJS();

  if (!isConnected) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 text-sm ${className}`}>
        Wallet not connected
      </div>
    );
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className={`text-sm ${className} overflow-hidden`}>
      <div className="text-gray-900 dark:text-white font-medium truncate">
        {truncateAddress(address)}
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-xs">
        {formatAmount(balance)} NTRN
      </div>
    </div>
  );
};