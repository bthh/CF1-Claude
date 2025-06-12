import React, { useState, useEffect } from 'react';
import { useCosmJS } from '../hooks/useCosmJS';
import { useNotifications } from '../hooks/useNotifications';
import { VerificationGate } from './Verification/VerificationGate';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: any;
  onSuccess?: () => void;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onSuccess
}) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [limitQuantity, setLimitQuantity] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [calculatedShares, setCalculatedShares] = useState<number>(0);
  const [estimatedReturns, setEstimatedReturns] = useState<string>('0');
  
  const { 
    invest, 
    formatAmount, 
    parseAmount, 
    isConnected, 
    balance,
    error,
    clearError
  } = useCosmJS();
  
  const { success, error: showError, warning } = useNotifications();

  // Calculate shares and returns based on order type
  useEffect(() => {
    if (proposal) {
      try {
        let shares = 0;
        let totalAmount = 0;
        
        if (orderType === 'market' && investmentAmount) {
          const amountNum = parseFloat(investmentAmount);
          const tokenPrice = parseFloat(proposal.financial_terms?.token_price || '0') / 1000000; // Convert from micro units
          
          if (tokenPrice > 0) {
            shares = Math.floor(amountNum / tokenPrice);
            totalAmount = amountNum;
          }
        } else if (orderType === 'limit' && limitPrice && limitQuantity) {
          const priceNum = parseFloat(limitPrice);
          const quantityNum = parseFloat(limitQuantity);
          
          if (priceNum > 0 && quantityNum > 0) {
            shares = quantityNum;
            totalAmount = priceNum * quantityNum;
          }
        }
        
        setCalculatedShares(shares);
        
        if (totalAmount > 0) {
          // Calculate estimated returns based on expected APY
          const expectedAPY = parseFloat(proposal.financial_terms?.expected_apy?.replace('%', '') || '0') / 100;
          const annualReturns = totalAmount * expectedAPY;
          setEstimatedReturns(annualReturns.toFixed(2));
        } else {
          setEstimatedReturns('0');
        }
      } catch (error) {
        setCalculatedShares(0);
        setEstimatedReturns('0');
      }
    }
  }, [orderType, investmentAmount, limitPrice, limitQuantity, proposal]);

  const handleInvest = async () => {
    if (!isConnected) {
      warning('Wallet Not Connected', 'Please connect your wallet to make an investment.');
      return;
    }

    let totalAmount = '';
    
    if (orderType === 'market') {
      if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
        showError('Invalid Amount', 'Please enter a valid investment amount.');
        return;
      }
      totalAmount = investmentAmount;
    } else if (orderType === 'limit') {
      if (!limitPrice || parseFloat(limitPrice) <= 0) {
        showError('Invalid Price', 'Please enter a valid limit price.');
        return;
      }
      if (!limitQuantity || parseFloat(limitQuantity) <= 0) {
        showError('Invalid Quantity', 'Please enter a valid quantity.');
        return;
      }
      totalAmount = (parseFloat(limitPrice) * parseFloat(limitQuantity)).toString();
    }

    // Convert to micro units for the contract
    const amountInMicroUnits = parseAmount(totalAmount);
    
    // Check minimum investment
    const minInvestment = proposal.financial_terms?.minimum_investment || '0';
    if (parseInt(amountInMicroUnits) < parseInt(minInvestment)) {
      showError('Minimum Investment Required', `The minimum investment for this proposal is $${formatAmount(minInvestment)}.`);
      return;
    }

    // Check user balance
    const userBalance = parseInt(balance);
    if (parseInt(amountInMicroUnits) > userBalance) {
      showError('Insufficient Balance', 'You don\'t have enough funds for this investment.');
      return;
    }

    setIsProcessing(true);
    clearError();

    try {
      const result = await invest(proposal.id, amountInMicroUnits);
      
      if (result) {
        success(
          'Investment Successful!', 
          `You have successfully invested $${totalAmount} in ${proposal.asset_details?.name || 'this proposal'}.`,
          {
            actionLabel: 'View Portfolio',
            onAction: () => window.location.href = '/portfolio'
          }
        );
        setInvestmentAmount('');
        setLimitPrice('');
        setLimitQuantity('');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Investment failed:', error);
      showError(
        'Investment Failed',
        error.message || 'An unexpected error occurred. Please try again.',
        {
          persistent: true,
          actionLabel: 'Contact Support',
          onAction: () => window.open('mailto:support@cf1platform.com', '_blank')
        }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setInvestmentAmount(value);
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
    const userBalanceFormatted = formatAmount(balance);
    if (orderType === 'market') {
      setInvestmentAmount(userBalanceFormatted);
    } else {
      // For limit orders, calculate max quantity based on current limit price
      if (limitPrice && parseFloat(limitPrice) > 0) {
        const maxQuantity = parseFloat(userBalanceFormatted) / parseFloat(limitPrice);
        setLimitQuantity(Math.floor(maxQuantity).toString());
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
              Invest in {proposal?.asset_details?.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {!isConnected && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Please connect your wallet to invest
              </p>
            </div>
          )}

          <div className="space-y-4">
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
                  Market Buy
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
                  Limit Buy
                </button>
              </div>
            </div>

            {/* Market Order Inputs */}
            {orderType === 'market' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investment Amount (USD)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={investmentAmount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isProcessing || !isConnected}
                  />
                  <button
                    onClick={setMaxAmount}
                    className="absolute right-2 top-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    disabled={isProcessing || !isConnected}
                  >
                    MAX
                  </button>
                </div>
                {isConnected && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Available: ${formatAmount(balance)} NTRN
                  </p>
                )}
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
                    disabled={isProcessing || !isConnected}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Current price: ${formatAmount(proposal?.financial_terms?.token_price || '0')}
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
                      disabled={isProcessing || !isConnected}
                    />
                    <button
                      onClick={setMaxAmount}
                      className="absolute right-2 top-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      disabled={isProcessing || !isConnected || !limitPrice}
                    >
                      MAX
                    </button>
                  </div>
                  {isConnected && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Available: ${formatAmount(balance)} NTRN
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Investment Summary */}
            {((orderType === 'market' && investmentAmount && parseFloat(investmentAmount) > 0) ||
              (orderType === 'limit' && limitPrice && limitQuantity && parseFloat(limitPrice) > 0 && parseFloat(limitQuantity) > 0)) && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {orderType === 'market' ? 'Shares to receive:' : 'Shares to buy:'}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {calculatedShares.toLocaleString()}
                  </span>
                </div>
                {orderType === 'limit' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total cost:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${(parseFloat(limitPrice || '0') * parseFloat(limitQuantity || '0')).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Estimated annual returns:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${estimatedReturns}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Expected APY:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {proposal?.financial_terms?.expected_apy || 'N/A'}
                  </span>
                </div>
                {orderType === 'limit' && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-300">
                    ℹ️ Limit order will execute when token price reaches ${limitPrice}
                  </div>
                )}
              </div>
            )}

            {/* Proposal Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Investment Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Token Price:</span>
                  <span className="text-gray-900 dark:text-white">
                    ${formatAmount(proposal?.financial_terms?.token_price || '0')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Minimum Investment:</span>
                  <span className="text-gray-900 dark:text-white">
                    ${formatAmount(proposal?.financial_terms?.minimum_investment || '0')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Funding Progress:</span>
                  <span className="text-gray-900 dark:text-white">
                    {proposal?.funding_progress?.raised_percentage || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200 text-xs">
                ⚠️ <strong>Investment Risk:</strong> This investment is subject to market risks. 
                Tokens will be locked for 12 months after successful funding. 
                Please read all risk factors before investing.
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
            <VerificationGate
              action="invest"
              amount={orderType === 'market' ? parseFloat(investmentAmount || '0') : parseFloat(limitPrice || '0') * parseFloat(limitQuantity || '0')}
              proposalId={proposal?.id}
            >
              <button
                onClick={handleInvest}
                disabled={
                  isProcessing || 
                  !isConnected || 
                  (orderType === 'market' && (!investmentAmount || parseFloat(investmentAmount) <= 0)) ||
                  (orderType === 'limit' && (!limitPrice || !limitQuantity || parseFloat(limitPrice) <= 0 || parseFloat(limitQuantity) <= 0))
                }
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                         text-white rounded-lg font-medium transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  orderType === 'market' ? 'Confirm Investment' : 'Place Limit Order'
                )}
              </button>
            </VerificationGate>
          </div>
        </div>
      </div>
    </div>
  );
};