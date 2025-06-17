import React, { useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useTradingStore } from '../../store/tradingStore';
import { formatCurrency } from '../../utils/format';

const OrderBook: React.FC = () => {
  const { 
    selectedAsset, 
    orderBook, 
    loading, 
    loadOrderBook 
  } = useTradingStore();

  useEffect(() => {
    if (selectedAsset) {
      loadOrderBook(selectedAsset.id);
      
      // Set up polling for real-time updates
      const interval = setInterval(() => {
        loadOrderBook(selectedAsset.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedAsset, loadOrderBook]);

  if (!selectedAsset) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Select an asset to view order book
        </p>
      </div>
    );
  }

  if (loading || !orderBook) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded h-6 w-32"></div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded h-4"></div>
          ))}
        </div>
      </div>
    );
  }

  const getVolumeBarWidth = (quantity: number, maxQuantity: number) => {
    return Math.max((quantity / maxQuantity) * 100, 5);
  };

  const maxBidQuantity = Math.max(...orderBook.bids.map(bid => bid.quantity));
  const maxAskQuantity = Math.max(...orderBook.asks.map(ask => ask.quantity));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Book
            </h3>
          </div>
          <button 
            onClick={() => selectedAsset && loadOrderBook(selectedAsset.id)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Market Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Last Price</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(orderBook.lastPrice)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Spread</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(orderBook.spread)}
            </p>
          </div>
        </div>
      </div>

      {/* Order Book Content */}
      <div className="p-6">
        {/* Column Headers */}
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
          <div>Price (USD)</div>
          <div className="text-right">Quantity</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-3 h-3 text-red-600" />
            <span className="text-xs font-medium text-red-600">Asks (Sell)</span>
          </div>
          
          {orderBook.asks.slice(0, 5).reverse().map((ask, index) => (
            <div key={index} className="relative">
              {/* Volume Bar */}
              <div
                className="absolute inset-y-0 right-0 bg-red-100 dark:bg-red-900/20 opacity-50"
                style={{ width: `${getVolumeBarWidth(ask.quantity, maxAskQuantity)}%` }}
              ></div>
              
              {/* Order Data */}
              <div className="relative grid grid-cols-3 gap-2 py-1 text-sm">
                <div className="font-mono text-red-600">
                  {formatCurrency(ask.price)}
                </div>
                <div className="text-right text-gray-900 dark:text-white">
                  {ask.quantity.toLocaleString()}
                </div>
                <div className="text-right text-gray-600 dark:text-gray-400">
                  {formatCurrency(ask.total)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div className="py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center mb-4">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(orderBook.lastPrice)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Current Market Price
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-3 h-3 text-green-600" />
            <span className="text-xs font-medium text-green-600">Bids (Buy)</span>
          </div>
          
          {orderBook.bids.slice(0, 5).map((bid, index) => (
            <div key={index} className="relative">
              {/* Volume Bar */}
              <div
                className="absolute inset-y-0 right-0 bg-green-100 dark:bg-green-900/20 opacity-50"
                style={{ width: `${getVolumeBarWidth(bid.quantity, maxBidQuantity)}%` }}
              ></div>
              
              {/* Order Data */}
              <div className="relative grid grid-cols-3 gap-2 py-1 text-sm">
                <div className="font-mono text-green-600">
                  {formatCurrency(bid.price)}
                </div>
                <div className="text-right text-gray-900 dark:text-white">
                  {bid.quantity.toLocaleString()}
                </div>
                <div className="text-right text-gray-600 dark:text-gray-400">
                  {formatCurrency(bid.total)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Depth Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Market Depth
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Bids</p>
              <p className="font-semibold text-green-600">
                {orderBook.depth.totalBidVolume.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Asks</p>
              <p className="font-semibold text-red-600">
                {orderBook.depth.totalAskVolume.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Live Update Indicator */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates every 5 seconds</span>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;