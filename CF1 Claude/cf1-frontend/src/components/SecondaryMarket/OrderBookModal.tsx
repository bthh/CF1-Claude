import React, { useState, useEffect } from 'react';
import {
  X, BarChart3, TrendingUp, TrendingDown, Clock, Users,
  Activity, Target, Zap, DollarSign, ArrowUpDown
} from 'lucide-react';
import { useSecondaryMarketStore, OrderBook, OrderBookEntry } from '../../store/secondaryMarketStore';

interface AssetListing {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  pricePerToken: number;
  marketData: {
    lastSalePrice: number;
    priceChange24h: number;
    volume24h: number;
    highestBid: number;
    lowestAsk: number;
    marketCap: number;
  };
}

interface OrderBookModalProps {
  asset: AssetListing;
  onClose: () => void;
}

// Using OrderBookEntry from types/trading.ts

export const OrderBookModal: React.FC<OrderBookModalProps> = ({ asset, onClose }) => {
  const { getOrderBook, formatCurrency } = useSecondaryMarketStore();
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades' | 'depth'>('orderbook');
  const [priceDecimals, setPriceDecimals] = useState(2);

  // Mock recent trades
  const recentTrades = [
    {
      id: '1',
      price: 105.50,
      quantity: 250,
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      side: 'buy' as const
    },
    {
      id: '2',
      price: 105.25,
      quantity: 100,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      side: 'sell' as const
    },
    {
      id: '3',
      price: 105.75,
      quantity: 500,
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      side: 'buy' as const
    },
    {
      id: '4',
      price: 105.00,
      quantity: 300,
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      side: 'sell' as const
    },
    {
      id: '5',
      price: 106.00,
      quantity: 150,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      side: 'buy' as const
    }
  ];

  useEffect(() => {
    loadOrderBook();
  }, [asset.assetId]);

  const loadOrderBook = async () => {
    setIsLoading(true);
    try {
      const data = await getOrderBook(asset.assetId);
      setOrderBook(data);
    } catch (error) {
      console.error('Failed to load order book:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(priceDecimals);
  };

  const formatQuantity = (quantity: number) => {
    return quantity.toLocaleString();
  };

  const formatTimeAgo = (timestamp: string | number) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getMaxTotal = () => {
    if (!orderBook) return 0;
    const maxBid = Math.max(...orderBook.bids.map(bid => bid.total));
    const maxAsk = Math.max(...orderBook.asks.map(ask => ask.total));
    return Math.max(maxBid, maxAsk);
  };

  const maxTotal = getMaxTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {asset.assetName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {asset.assetType} • Order Book & Market Data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Market Summary */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Price</p>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(asset.marketData.lastSalePrice)}
                </span>
                <div className={`flex items-center text-sm ${
                  asset.marketData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {asset.marketData.priceChange24h >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="ml-1">
                    {Math.abs(asset.marketData.priceChange24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bid / Ask</p>
              <div className="flex items-center space-x-2 text-lg font-bold">
                <span className="text-green-600">{formatPrice(asset.marketData.highestBid)}</span>
                <span className="text-gray-400">/</span>
                <span className="text-red-600">{formatPrice(asset.marketData.lowestAsk)}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Spread</p>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {orderBook ? (
                  <>
                    {formatCurrency(orderBook.spread)}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
                      ({orderBook.spreadPercent.toFixed(2)}%)
                    </span>
                  </>
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">24h Volume</p>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(asset.marketData.volume24h)}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'orderbook', label: 'Order Book', icon: BarChart3 },
            { id: 'trades', label: 'Recent Trades', icon: Activity },
            { id: 'depth', label: 'Market Depth', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Order Book Tab */}
          {activeTab === 'orderbook' && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : orderBook ? (
                <div className="grid grid-cols-2 gap-6">
                  {/* Asks (Sell Orders) */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <ArrowUpDown className="w-5 h-5 mr-2 text-red-600" />
                      Asks (Sell)
                    </h3>
                    <div className="space-y-1">
                      <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-600">
                        <span>Price</span>
                        <span className="text-right">Quantity</span>
                        <span className="text-right">Total</span>
                      </div>
                      {orderBook.asks.slice(0, 10).reverse().map((ask, index) => (
                        <div key={index} className="relative">
                          <div
                            className="absolute inset-0 bg-red-100 dark:bg-red-900/20"
                            style={{
                              width: `${(ask.total / maxTotal) * 100}%`,
                              right: 0
                            }}
                          ></div>
                          <div className="relative grid grid-cols-3 gap-4 text-sm py-1">
                            <span className="text-red-600 font-medium">
                              {formatPrice(ask.price)}
                            </span>
                            <span className="text-right text-gray-900 dark:text-white">
                              {formatQuantity(ask.quantity)}
                            </span>
                            <span className="text-right text-gray-600 dark:text-gray-400">
                              {formatCurrency(ask.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bids (Buy Orders) */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <ArrowUpDown className="w-5 h-5 mr-2 text-green-600" />
                      Bids (Buy)
                    </h3>
                    <div className="space-y-1">
                      <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-600">
                        <span>Price</span>
                        <span className="text-right">Quantity</span>
                        <span className="text-right">Total</span>
                      </div>
                      {orderBook.bids.slice(0, 10).map((bid, index) => (
                        <div key={index} className="relative">
                          <div
                            className="absolute inset-0 bg-green-100 dark:bg-green-900/20"
                            style={{
                              width: `${(bid.total / maxTotal) * 100}%`
                            }}
                          ></div>
                          <div className="relative grid grid-cols-3 gap-4 text-sm py-1">
                            <span className="text-green-600 font-medium">
                              {formatPrice(bid.price)}
                            </span>
                            <span className="text-right text-gray-900 dark:text-white">
                              {formatQuantity(bid.quantity)}
                            </span>
                            <span className="text-right text-gray-600 dark:text-gray-400">
                              {formatCurrency(bid.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    No order book data available
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recent Trades Tab */}
          {activeTab === 'trades' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Trades
              </h3>
              
              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-600">
                  <span>Time</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Quantity</span>
                  <span className="text-right">Side</span>
                </div>
                
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="grid grid-cols-4 gap-4 text-sm py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatTimeAgo(trade.timestamp)}
                    </span>
                    <span className={`text-right font-medium ${
                      trade.side === 'buy' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(trade.price)}
                    </span>
                    <span className="text-right text-gray-900 dark:text-white">
                      {formatQuantity(trade.quantity)}
                    </span>
                    <span className={`text-right text-xs font-medium px-2 py-1 rounded-full ${
                      trade.side === 'buy' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {trade.side.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Depth Tab */}
          {activeTab === 'depth' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Market Depth
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Market depth chart visualization would be implemented here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  This would show cumulative order book depth with interactive charting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>
                  Last updated: {orderBook ? formatTimeAgo(orderBook.lastUpdated) : 'Loading...'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>
                  {orderBook ? orderBook.bids.length + orderBook.asks.length : 0} active orders
                </span>
              </div>
            </div>
            
            <button
              onClick={loadOrderBook}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <ArrowUpDown className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};