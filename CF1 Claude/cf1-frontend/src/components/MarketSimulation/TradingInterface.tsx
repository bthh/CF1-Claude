import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { marketSimulation, useMarketData, generateMockTransactions } from '../../services/marketSimulation';
import { AnimatedButton, AnimatedCounter } from '../LoadingStates/TransitionWrapper';
import { SwipeableModal } from '../GestureComponents/SwipeableModal';

interface Order {
  id: string;
  type: 'buy' | 'sell';
  assetId: string;
  assetName: string;
  amount: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
}

interface TradingInterfaceProps {
  className?: string;
}

export const TradingInterface: React.FC<TradingInterfaceProps> = ({ className = '' }) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('residential-realestate');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [balance, setBalance] = useState(100000); // Demo balance
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});

  const assetData = useMarketData(selectedAsset);
  const assets = marketSimulation.getAllAssets();

  useEffect(() => {
    // Load mock transaction history
    const mockTransactions = generateMockTransactions(20);
    const recentOrders: Order[] = mockTransactions.slice(0, 5).map((tx, index) => ({
      id: tx.id,
      type: tx.type === 'investment' ? 'buy' : 'sell',
      assetId: tx.assetId,
      assetName: tx.assetName,
      amount: tx.amount,
      price: Math.floor(Math.random() * 100000) + 50000,
      status: Math.random() > 0.2 ? 'filled' : Math.random() > 0.5 ? 'pending' : 'cancelled',
      timestamp: tx.timestamp.getTime()
    }));
    setOrders(recentOrders);

    // Initialize demo portfolio
    const demoPortfolio: Record<string, number> = {};
    assets.forEach(asset => {
      if (Math.random() > 0.5) {
        demoPortfolio[asset.id] = Math.floor(Math.random() * 5) + 1;
      }
    });
    setPortfolio(demoPortfolio);
  }, [assets]);

  const selectedAssetInfo = assets.find(a => a.id === selectedAsset);
  const currentPrice = assetData?.price || 0;
  const orderValue = parseFloat(amount) || 0;
  const canAfford = orderType === 'buy' ? balance >= orderValue : (portfolio[selectedAsset] || 0) >= orderValue;

  const handlePlaceOrder = () => {
    if (!amount || !canAfford || !selectedAssetInfo) return;

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      type: orderType,
      assetId: selectedAsset,
      assetName: selectedAssetInfo.name,
      amount: orderValue,
      price: currentPrice,
      status: 'pending',
      timestamp: Date.now()
    };

    setPendingOrder(newOrder);
    setShowOrderModal(true);

    // Simulate order processing
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        newOrder.status = 'filled';
        setOrders(prev => [newOrder, ...prev]);
        
        // Update balance and portfolio
        if (orderType === 'buy') {
          setBalance(prev => prev - orderValue);
          setPortfolio(prev => ({
            ...prev,
            [selectedAsset]: (prev[selectedAsset] || 0) + 1
          }));
        } else {
          setBalance(prev => prev + orderValue);
          setPortfolio(prev => ({
            ...prev,
            [selectedAsset]: Math.max(0, (prev[selectedAsset] || 0) - 1)
          }));
        }
      } else {
        newOrder.status = 'cancelled';
        setOrders(prev => [newOrder, ...prev]);
      }

      setAmount('');
      setTimeout(() => {
        setShowOrderModal(false);
        setPendingOrder(null);
      }, 2000);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filled':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalPortfolioValue = Object.entries(portfolio).reduce((total, [assetId, shares]) => {
    const asset = marketSimulation.getAsset(assetId);
    const currentPrice = asset?.marketData[asset.marketData.length - 1]?.price || 0;
    return total + (shares * currentPrice);
  }, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Portfolio Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Portfolio Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Available Balance</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <AnimatedCounter value={balance} prefix="$" decimals={0} />
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Portfolio Value</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <AnimatedCounter value={totalPortfolioValue} prefix="$" decimals={0} />
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Assets</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <AnimatedCounter value={balance + totalPortfolioValue} prefix="$" decimals={0} />
            </div>
          </div>
        </div>

        {/* Portfolio Holdings */}
        {Object.keys(portfolio).length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Holdings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(portfolio).map(([assetId, shares]) => {
                const asset = marketSimulation.getAsset(assetId);
                if (!asset || shares === 0) return null;
                
                const currentPrice = asset.marketData[asset.marketData.length - 1]?.price || 0;
                const value = shares * currentPrice;
                
                return (
                  <div key={assetId} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{asset.symbol}</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{shares} shares</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(value)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(currentPrice)}/share
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Trading Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
          Place Order
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Form */}
          <div className="space-y-4">
            {/* Asset Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Asset
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.symbol}) - {formatCurrency(asset.marketData[asset.marketData.length - 1]?.price || 0)}
                  </option>
                ))}
              </select>
            </div>

            {/* Order Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Type
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOrderType('buy')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    orderType === 'buy'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Buy
                </button>
                <button
                  onClick={() => setOrderType('sell')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    orderType === 'sell'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 inline mr-2" />
                  Sell
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Order Summary */}
            {amount && assetData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2"
              >
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Order Value:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(orderValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Shares:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(orderValue / currentPrice).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Price:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(currentPrice)}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Place Order Button */}
            <AnimatedButton
              onClick={handlePlaceOrder}
              disabled={!amount || !canAfford}
              className="w-full"
              variant={orderType === 'buy' ? 'primary' : 'danger'}
            >
              {orderType === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
            </AnimatedButton>

            {!canAfford && amount && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-600 dark:text-red-400"
              >
                {orderType === 'buy' 
                  ? 'Insufficient balance for this order' 
                  : 'Insufficient shares to sell'}
              </motion.p>
            )}
          </div>

          {/* Current Asset Info */}
          <div className="space-y-4">
            {selectedAssetInfo && assetData && (
              <>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedAssetInfo.name}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Symbol:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedAssetInfo.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedAssetInfo.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">24h Change:</span>
                      <span className={`text-sm font-medium ${
                        assetData.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {assetData.change24h >= 0 ? '+' : ''}{assetData.change24h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Volume:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(assetData.volume)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Holdings for this asset */}
                {portfolio[selectedAsset] && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Your Holdings</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Shares:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {portfolio[selectedAsset]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(portfolio[selectedAsset] * currentPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-600" />
          Recent Orders
        </h3>

        <div className="space-y-3">
          <AnimatePresence>
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.type === 'buy' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {order.type.toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {order.assetName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatCurrency(order.amount)} at {formatCurrency(order.price)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet. Place your first order above!</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <SwipeableModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Processing Order"
        swipeToClose={false}
      >
        <div className="p-6 text-center">
          {pendingOrder && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              </motion.div>
              
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Processing {pendingOrder.type} order
              </h4>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <p>Asset: {pendingOrder.assetName}</p>
                <p>Amount: {formatCurrency(pendingOrder.amount)}</p>
                <p>Price: {formatCurrency(pendingOrder.price)}</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your order is being processed. This usually takes a few seconds.
                </p>
              </div>
            </>
          )}
        </div>
      </SwipeableModal>
    </div>
  );
};