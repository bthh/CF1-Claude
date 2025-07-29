import React, { useState, useEffect, useMemo } from 'react';
import {
  X, ShoppingCart, TrendingUp, TrendingDown, AlertTriangle,
  Calculator, Clock, Shield, CheckCircle, DollarSign,
  Info, Zap, Target, BarChart3
} from 'lucide-react';

interface AssetListing {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  pricePerToken: number;
  totalValue: number;
  minimumPurchase: number;
  verified: boolean;
  escrowStatus: 'none' | 'partial' | 'full';
  compliance: {
    kycVerified: boolean;
    accreditationRequired: boolean;
    jurisdictionRestrictions: string[];
  };
  marketData: {
    lastSalePrice: number;
    priceChange24h: number;
    volume24h: number;
    highestBid: number;
    lowestAsk: number;
    marketCap: number;
  };
}

interface TradeModalProps {
  asset: AssetListing;
  onClose: () => void;
  onTrade: (orderData: any) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ asset, onClose, onTrade }) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<number>(asset.minimumPurchase);
  const [limitPrice, setLimitPrice] = useState<number>(asset.pricePerToken);
  const [expiryDays, setExpiryDays] = useState<number>(30);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Price calculation
  const pricePerToken = orderType === 'market' 
    ? (tradeType === 'buy' ? asset.marketData.lowestAsk : asset.marketData.highestBid)
    : limitPrice;

  const subtotal = quantity * pricePerToken;
  const platformFeeRate = orderType === 'market' ? 0.005 : 0.003; // 0.5% for market, 0.3% for limit
  const platformFee = subtotal * platformFeeRate;
  const gasFee = 15 + (subtotal * 0.0001);
  const totalFees = platformFee + gasFee;
  const totalAmount = tradeType === 'buy' ? subtotal + totalFees : subtotal - totalFees;

  // User portfolio balance (mock)
  const userBalance = 50000; // Mock USD balance
  const userAssetHolding = 750; // Mock asset quantity

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (quantity < asset.minimumPurchase) {
      errors.push(`Minimum purchase is ${asset.minimumPurchase} tokens`);
    }

    if (quantity > asset.quantity) {
      errors.push(`Only ${asset.quantity} tokens available`);
    }

    if (tradeType === 'buy' && totalAmount > userBalance) {
      errors.push(`Insufficient balance. You have $${userBalance.toLocaleString()}`);
    }

    if (tradeType === 'sell' && quantity > userAssetHolding) {
      errors.push(`Insufficient tokens. You have ${userAssetHolding} tokens`);
    }

    if (orderType === 'limit') {
      const marketPrice = tradeType === 'buy' ? asset.marketData.lowestAsk : asset.marketData.highestBid;
      const deviation = Math.abs((limitPrice - marketPrice) / marketPrice) * 100;
      
      if (deviation > 20) {
        errors.push(`Limit price is ${deviation.toFixed(1)}% away from market price`);
      }
    }

    if (!agreeToTerms) {
      errors.push('You must agree to the trading terms');
    }

    return errors;
  }, [quantity, limitPrice, orderType, tradeType, agreeToTerms, asset, totalAmount, userBalance, userAssetHolding]);

  useEffect(() => {
    setErrors(validationErrors);
  }, [validationErrors]);

  const handleSubmit = async () => {
    if (errors.length > 0) return;

    setIsProcessing(true);

    try {
      const orderData = {
        assetId: asset.assetId,
        assetName: asset.assetName,
        userId: 'current_user',
        userName: 'Current User',
        type: tradeType,
        orderType,
        quantity,
        pricePerToken: orderType === 'market' ? undefined : limitPrice,
        totalValue: subtotal,
        expiresAt: orderType === 'limit' ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString() : undefined,
        fees: {
          platformFee,
          gasFee,
          total: totalFees
        },
        compliance: {
          kycVerified: true,
          accreditationChecked: true,
          jurisdictionAllowed: true
        }
      };

      await onTrade(orderData);
    } catch (error) {
      console.error('Trade submission failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const getPriceImpact = () => {
    const marketPrice = asset.marketData.lastSalePrice;
    const executionPrice = pricePerToken;
    const impact = ((executionPrice - marketPrice) / marketPrice) * 100;
    return impact;
  };

  const priceImpact = getPriceImpact();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {asset.assetName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {asset.assetType} • {orderType === 'market' ? 'Market Order' : 'Limit Order'}
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

        <div className="p-6 space-y-6">
          {/* Asset Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Current Price</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(asset.pricePerToken)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">24h Change</span>
                <div className={`flex items-center ${asset.marketData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {asset.marketData.priceChange24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  <span className="font-medium">
                    {formatPercentage(asset.marketData.priceChange24h)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Available</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {asset.quantity.toLocaleString()} tokens
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Volume 24h</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(asset.marketData.volume24h)}
                </p>
              </div>
            </div>
          </div>

          {/* Trade Type Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trade Type
              </label>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    tradeType === 'buy'
                      ? 'bg-green-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    tradeType === 'sell'
                      ? 'bg-red-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Type
              </label>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                <button
                  onClick={() => setOrderType('market')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    orderType === 'market'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Market</span>
                  </div>
                </button>
                <button
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    orderType === 'limit'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Limit</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={asset.minimumPurchase}
                  max={tradeType === 'buy' ? asset.quantity : userAssetHolding}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Min: {asset.minimumPurchase} • Max: {tradeType === 'buy' ? asset.quantity : userAssetHolding}
                </p>
              </div>

              {orderType === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Limit Price
                  </label>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(Number(e.target.value))}
                    step="0.01"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Market: {formatCurrency(tradeType === 'buy' ? asset.marketData.lowestAsk : asset.marketData.highestBid)}
                  </p>
                </div>
              )}
            </div>

            {orderType === 'limit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expires In (Days)
                </label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={1}>1 Day</option>
                  <option value={7}>7 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                </select>
              </div>
            )}
          </div>

          {/* Price Impact Warning */}
          {orderType === 'market' && Math.abs(priceImpact) > 1 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  High Price Impact: {formatPercentage(Math.abs(priceImpact))}
                </span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This large order may significantly impact the market price.
              </p>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Order Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quantity</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {quantity.toLocaleString()} tokens
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Price per token</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(pricePerToken)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Platform fee ({formatPercentage(platformFeeRate * 100)})</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(platformFee)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Gas fee</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(gasFee)}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900 dark:text-white">
                    Total {tradeType === 'buy' ? 'Cost' : 'Proceeds'}
                  </span>
                  <span className={`${tradeType === 'buy' ? 'text-red-600' : 'text-green-600'}`}>
                    {tradeType === 'buy' ? '-' : '+'}{formatCurrency(Math.abs(totalAmount))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Compliance & Security
              </span>
            </div>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>KYC verified and compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>
                  {asset.escrowStatus === 'full' ? 'Fully escrowed transaction' : 
                   asset.escrowStatus === 'partial' ? 'Partially escrowed transaction' : 
                   'Standard transaction'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Regulatory compliance verified</span>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                trading terms and conditions
              </a>
              {' '}and understand the risks associated with trading tokenized assets.
            </label>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  Please fix the following issues:
                </span>
              </div>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={errors.length > 0 || isProcessing}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                tradeType === 'buy'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${asset.assetName}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};