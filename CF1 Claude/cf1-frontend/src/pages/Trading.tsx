import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowUpDown, TrendingUp, TrendingDown, Info, Plus, Minus } from 'lucide-react';
import { useCosmJS } from '../hooks/useCosmJS';
import { useNotifications } from '../hooks/useNotifications';
import { formatAmount } from '../utils/format';

interface Order {
  id: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  trader?: string;
  timestamp?: number;
}

interface Trade {
  id: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

interface MarketData {
  lastPrice: number;
  bidPrice: number;
  askPrice: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
}

const Trading: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const { isConnected, address, placeOrder, cancelOrder } = useCosmJS();
  const { success, error } = useNotifications();

  // Trading state
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('0');

  // Market data
  const [marketData, setMarketData] = useState<MarketData>({
    lastPrice: 10.50,
    bidPrice: 10.45,
    askPrice: 10.55,
    volume24h: 125000,
    high24h: 11.20,
    low24h: 10.10,
    priceChange24h: 0.25,
    priceChangePercent24h: 2.44,
  });

  // Order book
  const [buyOrders, setBuyOrders] = useState<Order[]>([
    { id: '1', side: 'buy', price: 10.45, amount: 100, total: 1045 },
    { id: '2', side: 'buy', price: 10.40, amount: 250, total: 2600 },
    { id: '3', side: 'buy', price: 10.35, amount: 500, total: 5175 },
  ]);

  const [sellOrders, setSellOrders] = useState<Order[]>([
    { id: '4', side: 'sell', price: 10.55, amount: 150, total: 1582.5 },
    { id: '5', side: 'sell', price: 10.60, amount: 300, total: 3180 },
    { id: '6', side: 'sell', price: 10.65, amount: 200, total: 2130 },
  ]);

  // Recent trades
  const [recentTrades, setRecentTrades] = useState<Trade[]>([
    { id: '1', price: 10.50, amount: 50, side: 'buy', timestamp: Date.now() - 60000 },
    { id: '2', price: 10.48, amount: 75, side: 'sell', timestamp: Date.now() - 120000 },
    { id: '3', price: 10.52, amount: 100, side: 'buy', timestamp: Date.now() - 180000 },
  ]);

  // User orders
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // Calculate total when price or amount changes
  useEffect(() => {
    const priceNum = parseFloat(price) || 0;
    const amountNum = parseFloat(amount) || 0;
    setTotal((priceNum * amountNum).toFixed(2));
  }, [price, amount]);

  const handleSubmitOrder = async () => {
    if (!isConnected) {
      error('Please connect your wallet');
      return;
    }

    if (!price || !amount) {
      error('Please enter price and amount');
      return;
    }

    try {
      // TODO: Call smart contract
      const order: Order = {
        id: Date.now().toString(),
        side: orderSide,
        price: parseFloat(price),
        amount: parseFloat(amount),
        total: parseFloat(total),
        trader: address,
        timestamp: Date.now(),
      };

      setUserOrders([...userOrders, order]);
      success(`${orderSide === 'buy' ? 'Buy' : 'Sell'} order placed successfully`);
      
      // Reset form
      setPrice('');
      setAmount('');
    } catch (err) {
      error('Failed to place order');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      // TODO: Call smart contract
      setUserOrders(userOrders.filter(order => order.id !== orderId));
      success('Order cancelled successfully');
    } catch (err) {
      error('Failed to cancel order');
    }
  };

  const handleOrderBookClick = (order: Order) => {
    setPrice(order.price.toString());
    if (order.side === 'buy') {
      setOrderSide('sell');
    } else {
      setOrderSide('buy');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Trading - {tokenId}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Trade tokenized real-world assets on the secondary market
        </p>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Last Price</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${marketData.lastPrice.toFixed(2)}
          </p>
          <p className={`text-sm ${marketData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {marketData.priceChange24h >= 0 ? '+' : ''}{marketData.priceChange24h.toFixed(2)} 
            ({marketData.priceChangePercent24h.toFixed(2)}%)
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            ${formatAmount(marketData.volume24h)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">24h High</p>
          <p className="text-xl font-semibold text-green-600">
            ${marketData.high24h.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">24h Low</p>
          <p className="text-xl font-semibold text-red-600">
            ${marketData.low24h.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Book */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sell Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Order Book
            </h3>
            
            <div className="space-y-2">
              <div className="grid grid-cols-3 text-sm text-gray-500 dark:text-gray-400 pb-2 border-b dark:border-gray-700">
                <span>Price (NTRN)</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Total</span>
              </div>

              {/* Sell orders (reversed for display) */}
              {[...sellOrders].reverse().map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer py-1"
                  onClick={() => handleOrderBookClick(order)}
                >
                  <span className="text-red-600">${order.price.toFixed(2)}</span>
                  <span className="text-right text-gray-900 dark:text-white">
                    {order.amount}
                  </span>
                  <span className="text-right text-gray-900 dark:text-white">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Spread */}
              <div className="py-2 border-y dark:border-gray-700">
                <div className="flex items-center justify-center space-x-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${marketData.lastPrice.toFixed(2)}
                  </span>
                  <span className={`text-sm ${marketData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketData.priceChange24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </span>
                </div>
              </div>

              {/* Buy orders */}
              {buyOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-3 text-sm hover:bg-green-50 dark:hover:bg-green-900/10 cursor-pointer py-1"
                  onClick={() => handleOrderBookClick(order)}
                >
                  <span className="text-green-600">${order.price.toFixed(2)}</span>
                  <span className="text-right text-gray-900 dark:text-white">
                    {order.amount}
                  </span>
                  <span className="text-right text-gray-900 dark:text-white">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Trades
            </h3>
            
            <div className="space-y-2">
              <div className="grid grid-cols-3 text-sm text-gray-500 dark:text-gray-400 pb-2 border-b dark:border-gray-700">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Time</span>
              </div>

              {recentTrades.map((trade) => (
                <div key={trade.id} className="grid grid-cols-3 text-sm py-1">
                  <span className={trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}>
                    ${trade.price.toFixed(2)}
                  </span>
                  <span className="text-right text-gray-900 dark:text-white">
                    {trade.amount}
                  </span>
                  <span className="text-right text-gray-500 dark:text-gray-400">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trading Panel */}
        <div className="space-y-4">
          {/* Order Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Place Order
            </h3>

            {/* Order Type Tabs */}
            <div className="flex space-x-1 mb-4">
              <button
                onClick={() => setOrderSide('buy')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  orderSide === 'buy'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setOrderSide('sell')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  orderSide === 'sell'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Order Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as 'market' | 'limit')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="limit">Limit Order</option>
                <option value="market">Market Order</option>
              </select>
            </div>

            {/* Price Input (for limit orders) */}
            {orderType === 'limit' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (NTRN)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Total */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {total} NTRN
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={!isConnected}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                orderSide === 'buy'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:bg-gray-300 disabled:cursor-not-allowed`}
            >
              {!isConnected ? 'Connect Wallet' : `Place ${orderSide === 'buy' ? 'Buy' : 'Sell'} Order`}
            </button>
          </div>

          {/* User Orders */}
          {userOrders.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                My Orders
              </h3>
              
              <div className="space-y-2">
                {userOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 border dark:border-gray-700 rounded">
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${order.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                        {order.side.toUpperCase()}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.amount} @ ${order.price.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trading;