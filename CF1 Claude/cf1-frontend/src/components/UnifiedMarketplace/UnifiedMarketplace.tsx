import React, { useState } from 'react';
import { usePlatformConfigStore } from '../../store/platformConfigStore';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { SecondaryMarketplace } from '../SecondaryMarket/SecondaryMarketplace';
import { Settings, ArrowLeftRight, TrendingUp, ToggleLeft } from 'lucide-react';

interface UnifiedMarketplaceProps {
  className?: string;
}

const PrimaryMarketplace: React.FC = () => {
  // This would be the primary marketplace content
  // For now, we'll show a placeholder that indicates this is where new token sales would go
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Primary Marketplace
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          New token sales and asset tokenization offerings would appear here.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          This mode shows newly tokenized assets available for initial purchase.
        </div>
      </div>
    </div>
  );
};

export const UnifiedMarketplace: React.FC<UnifiedMarketplaceProps> = ({ className = '' }) => {
  const { config, updateTradingMode } = usePlatformConfigStore();
  const { currentAdmin } = useAdminAuth();
  const [showModeToggle, setShowModeToggle] = useState(false);
  
  // Only show admin controls to super admins or platform admins
  const canManageMode = currentAdmin && (currentAdmin.role === 'super_admin' || currentAdmin.role === 'platform_admin');

  const handleModeChange = (mode: 'primary' | 'secondary') => {
    updateTradingMode(mode);
    setShowModeToggle(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Admin Controls */}
      {canManageMode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-gray-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Trading Mode Configuration
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Current mode: {config.tradingMode === 'primary' ? 'Primary Trading' : 'Secondary Trading'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowModeToggle(!showModeToggle)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <ToggleLeft className="w-4 h-4" />
              <span>Change Mode</span>
            </button>
          </div>

          {showModeToggle && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleModeChange('primary')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    config.tradingMode === 'primary'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900 dark:text-white">Primary Trading</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      New token sales and asset tokenization
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleModeChange('secondary')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    config.tradingMode === 'secondary'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900 dark:text-white">Secondary Trading</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Peer-to-peer asset trading marketplace
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content based on trading mode */}
      {config.tradingMode === 'primary' ? (
        <PrimaryMarketplace />
      ) : (
        <SecondaryMarketplace />
      )}
    </div>
  );
};