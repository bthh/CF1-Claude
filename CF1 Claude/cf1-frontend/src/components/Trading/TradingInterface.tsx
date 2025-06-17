import React, { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { useTradingStore } from '../../store/tradingStore';
import { useNotifications } from '../../hooks/useNotifications';
import { formatCurrency } from '../../utils/format';

interface TradingInterfaceProps {
  type: 'buy' | 'sell';
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({ type }) => {
  const { 
    selectedAsset, 
    loading, 
    createOrder, 
    executeMarketOrder,
    createEscrow 
  } = useTradingStore();
  
  const { success, error: showError } = useNotifications();

  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [useEscrow, setUseEscrow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedAsset && orderType === 'market') {
      setPrice(selectedAsset.currentPrice.toString());
    }
  }, [selectedAsset, orderType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAsset || !quantity) {
      showError('Please fill in all required fields');
      return;
    }

    const qty = parseFloat(quantity);
    const orderPrice = parseFloat(price);

    if (qty <= 0 || (orderType === 'limit' && orderPrice <= 0)) {
      showError('Please enter valid amounts');
      return;
    }

    if (type === 'buy' && qty > selectedAsset.availableSupply) {
      showError('Quantity exceeds available supply');
      return;
    }

    setIsSubmitting(true);

    try {
      if (orderType === 'market') {
        // Execute market order immediately
        const trade = await executeMarketOrder(selectedAsset.id, type, qty);
        
        // Create escrow if enabled
        if (useEscrow) {
          await createEscrow(trade.id);
        }
        
        success(`Market ${type} order executed successfully!`);
      } else {
        // Create limit order
        const order = await createOrder({
          assetId: selectedAsset.id,
          userId: 'user-1', // This would come from auth context
          type,
          orderType: 'limit',
          quantity: qty,
          price: orderPrice,
          totalValue: qty * orderPrice,
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          fees: {
            platformFee: qty * orderPrice * 0.0025,
            networkFee: 10.00,
            totalFee: qty * orderPrice * 0.0025 + 10.00
          }
        });
        
        success(`Limit ${type} order created successfully!`);
      }

      // Reset form
      setQuantity('');
      setPrice('');
    } catch (err) {
      showError(`Failed to ${orderType === 'market' ? 'execute' : 'create'} ${type} order`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedAsset) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Select an asset to start trading</p>
      </div>
    );
  }

  const totalValue = parseFloat(quantity || '0') * parseFloat(price || '0');
  const platformFee = totalValue * 0.0025;
  const networkFee = 10.00;
  const totalFees = platformFee + networkFee;
  const finalTotal = totalValue + (type === 'buy' ? totalFees : -totalFees);

  return (
    <div className="space-y-6">
      {/* Asset Header */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
          {selectedAsset.imageUrl ? (
            <img
              src={selectedAsset.imageUrl}
              alt={selectedAsset.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {selectedAsset.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Current Price: {formatCurrency(selectedAsset.currentPrice)}
          </p>
        </div>
      </div>

      {/* Order Type Selection */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setOrderType('market')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            orderType === 'market'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Market Order
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            orderType === 'limit'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Limit Order
        </button>
      </div>

      {/* Order Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quantity
          </label>
          <div className="relative">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
              {selectedAsset.symbol}
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Available: {selectedAsset.availableSupply} {selectedAsset.symbol}
          </p>
        </div>

        {/* Price (for limit orders) */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price per Token
            </label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={selectedAsset.currentPrice.toString()}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                USD
              </div>
            </div>
          </div>
        )}

        {/* Escrow Option */}
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Escrow Protection
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Secure settlement with dispute resolution
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useEscrow}
              onChange={(e) => setUseEscrow(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
        </div>

        {/* Order Summary */}
        {quantity && price && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              Order Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(totalValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Platform Fee (0.25%):</span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(platformFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Network Fee:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(networkFee)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">
                    Total {type === 'buy' ? 'Cost' : 'Received'}:
                  </span>
                  <span className={`${
                    type === 'buy' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(Math.abs(finalTotal))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning for Market Orders */}
        {orderType === 'market' && (
          <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Market Order Warning
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Market orders execute immediately at the best available price. 
                The final execution price may differ from the displayed price.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !quantity || (orderType === 'limit' && !price)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            type === 'buy'
              ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
              : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
          } text-white disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              {orderType === 'market' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              <span>
                {orderType === 'market' ? `${type.toUpperCase()} NOW` : `PLACE ${type.toUpperCase()} ORDER`}
              </span>
            </>
          )}
        </button>
      </form>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• All trades are subject to platform terms and conditions</p>
        <p>• Escrow protection available for enhanced security</p>
        <p>• Settlement typically completes within 24-48 hours</p>
      </div>
    </div>
  );
};

export default TradingInterface;