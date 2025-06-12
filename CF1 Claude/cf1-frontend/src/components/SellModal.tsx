import React, { useState, useEffect } from 'react';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  onSuccess?: () => void;
}

export const SellModal: React.FC<SellModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSuccess
}) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [sellAmount, setSellAmount] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [limitQuantity, setLimitQuantity] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [estimatedReceived, setEstimatedReceived] = useState<string>('0');
  
  // Mock user holdings
  const userHoldings = {
    tokens: 1500,
    avgBuyPrice: 98.50,
    currentValue: 157875, // 1500 * 105.25
    unrealizedGain: 10125
  };

  // Calculate estimated received amount
  useEffect(() => {
    let received = 0;
    
    if (orderType === 'market' && sellAmount) {
      const amountNum = parseFloat(sellAmount);
      const currentPrice = parseFloat(asset?.currentPrice?.replace('$', '') || '105.25');
      received = amountNum * currentPrice;
    } else if (orderType === 'limit' && limitPrice && limitQuantity) {
      const priceNum = parseFloat(limitPrice);
      const quantityNum = parseFloat(limitQuantity);
      received = priceNum * quantityNum;
    }
    
    setEstimatedReceived(received.toFixed(2));
  }, [orderType, sellAmount, limitPrice, limitQuantity, asset]);

  const handleSell = async () => {
    setIsProcessing(true);
    
    // Simulate sell processing
    setTimeout(() => {
      setIsProcessing(false);
      alert(`Sell order placed successfully! This is a demo.`);
      onSuccess?.();
      onClose();
    }, 2000);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setSellAmount(value);
    }
  };

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setLimitPrice(value);
    }
  };

  const handleLimitQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setLimitQuantity(value);
    }
  };

  const setMaxAmount = () => {
    if (orderType === 'market') {
      setSellAmount(userHoldings.tokens.toString());
    } else {
      if (limitPrice && parseFloat(limitPrice) > 0) {
        setLimitQuantity(userHoldings.tokens.toString());
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sell {asset?.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Holdings Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Your Holdings</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Tokens Owned:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userHoldings.tokens.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Current Value:</p>
                  <p className="font-medium text-gray-900 dark:text-white">${userHoldings.currentValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Avg Buy Price:</p>
                  <p className="font-medium text-gray-900 dark:text-white">${userHoldings.avgBuyPrice}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Unrealized Gain:</p>
                  <p className="font-medium text-green-600 dark:text-green-400">+${userHoldings.unrealizedGain.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Order Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Type
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setOrderType('market')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    orderType === 'market'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  disabled={isProcessing}
                >
                  Market Sell
                </button>
                <button
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    orderType === 'limit'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  disabled={isProcessing}
                >
                  Limit Sell
                </button>
              </div>
            </div>

            {/* Market Order Inputs */}
            {orderType === 'market' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tokens to Sell
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sellAmount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isProcessing}
                  />
                  <button
                    onClick={setMaxAmount}
                    className="absolute right-2 top-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    disabled={isProcessing}
                  >
                    MAX
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Available: {userHoldings.tokens.toLocaleString()} tokens
                </p>
              </div>
            )}

            {/* Limit Order Inputs */}
            {orderType === 'limit' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Limit Price (USD per token)
                  </label>
                  <input
                    type="text"
                    value={limitPrice}
                    onChange={handleLimitPriceChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Current price: {asset?.currentPrice || '$105.25'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity (tokens)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={limitQuantity}
                      onChange={handleLimitQuantityChange}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isProcessing}
                    />
                    <button
                      onClick={setMaxAmount}
                      className="absolute right-2 top-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      disabled={isProcessing || !limitPrice}
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Available: {userHoldings.tokens.toLocaleString()} tokens
                  </p>
                </div>
              </div>
            )}

            {/* Transaction Summary */}
            {((orderType === 'market' && sellAmount && parseFloat(sellAmount) > 0) ||
              (orderType === 'limit' && limitPrice && limitQuantity && parseFloat(limitPrice) > 0 && parseFloat(limitQuantity) > 0)) && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {orderType === 'market' ? 'Tokens to sell:' : 'Tokens to sell:'}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {orderType === 'market' ? parseFloat(sellAmount || '0').toLocaleString() : parseFloat(limitQuantity || '0').toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Estimated received:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${estimatedReceived}
                  </span>
                </div>
                {orderType === 'limit' && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-300">
                    ℹ️ Limit order will execute when token price reaches ${limitPrice}
                  </div>
                )}
              </div>
            )}

            {/* Risk Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-amber-800 dark:text-amber-200 text-xs">
                ⚠️ <strong>Selling Notice:</strong> Once sold, tokens cannot be repurchased at the same price. 
                Consider market conditions and your investment strategy.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700
                       transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleSell}
              disabled={
                isProcessing || 
                (orderType === 'market' && (!sellAmount || parseFloat(sellAmount) <= 0)) ||
                (orderType === 'limit' && (!limitPrice || !limitQuantity || parseFloat(limitPrice) <= 0 || parseFloat(limitQuantity) <= 0))
              }
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600
                       text-white rounded-lg font-medium transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                orderType === 'market' ? 'Sell Now' : 'Place Limit Sell'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};