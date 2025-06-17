import React, { useEffect } from 'react';
import { TrendingUp, BarChart3, ArrowUpDown, Clock, Shield } from 'lucide-react';
import { useTradingStore } from '../store/tradingStore';
import TradingInterface from '../components/Trading/TradingInterface';
import OrderBook from '../components/Trading/OrderBook';
import AssetList from '../components/Trading/AssetList';
import TradeHistory from '../components/Trading/TradeHistory';
import UserOrders from '../components/Trading/UserOrders';
import MarketStats from '../components/Trading/MarketStats';

const SecondaryTrading: React.FC = () => {
  const {
    selectedAsset,
    selectedTab,
    loading,
    error,
    loadAssets,
    loadMarketStats,
    setSelectedTab
  } = useTradingStore();

  useEffect(() => {
    loadAssets();
    loadMarketStats();
  }, [loadAssets, loadMarketStats]);

  const tabs = [
    { id: 'buy', label: 'Buy Orders', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'sell', label: 'Sell Orders', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'orders', label: 'My Orders', icon: <Clock className="w-4 h-4" /> },
    { id: 'history', label: 'Trade History', icon: <ArrowUpDown className="w-4 h-4" /> }
  ];

  if (loading && !selectedAsset) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <p className="text-red-800 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Secondary Trading
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trade tokenized real-world assets with other investors
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Escrow Protected
              </span>
            </div>
          </div>
        </div>

        {/* Market Stats */}
        <MarketStats />
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Asset List */}
        <div className="lg:col-span-1">
          <AssetList />
        </div>

        {/* Trading Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAsset ? (
            <>
              {/* Trading Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-8 px-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id as any)}
                        className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                          selectedTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {(selectedTab === 'buy' || selectedTab === 'sell') && (
                    <TradingInterface type={selectedTab} />
                  )}
                  {selectedTab === 'orders' && <UserOrders />}
                  {selectedTab === 'history' && <TradeHistory />}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700 shadow-lg text-center">
              <ArrowUpDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select an Asset to Trade
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose an asset from the list to start trading
              </p>
            </div>
          )}
        </div>

        {/* Order Book */}
        <div className="lg:col-span-1">
          {selectedAsset && <OrderBook />}
        </div>
      </div>
    </div>
  );
};

export default SecondaryTrading;