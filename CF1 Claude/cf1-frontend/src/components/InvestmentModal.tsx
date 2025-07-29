import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { useCosmJS } from '../hooks/useCosmJS';
import { useNotifications } from '../hooks/useNotifications';
import { VerificationGate } from './Verification/VerificationGate';
import { TouchModal, TouchModalActions, TouchModalButton } from './TouchOptimized/TouchModal';
import { TouchInput } from './TouchOptimized/TouchInput';
import { formatAmount, parseAmount } from '../utils/format';
import { usePortfolioStore } from '../store/portfolioStore';

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
    isConnected, 
    balance,
    error,
    clearError
  } = useCosmJS();
  
  const { success, error: showError, warning } = useNotifications();
  const { addTransaction } = usePortfolioStore();

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
        // Add the investment to user's portfolio
        addTransaction({
          type: 'investment',
          assetId: proposal.id,
          assetName: proposal.asset_details?.name || 'Unknown Asset',
          amount: totalAmount,
          shares: calculatedShares,
          timestamp: new Date().toISOString(),
          status: 'completed'
        });
        
        console.log(`📈 Added investment to portfolio: $${totalAmount} in ${proposal.asset_details?.name}`);
        
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

  return (
    <TouchModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invest in ${proposal?.asset_details?.name}`}
      subtitle="Choose your investment strategy and amount"
      size="xl"
      position="center"
      className=""
    >
      <div className="p-4 sm:p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
          </div>
        )}

        {!isConnected && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-400 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
              Please connect your wallet to invest
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Order Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Order Type
            </label>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1.5">
              <button
                onClick={() => setOrderType('market')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation ${
                  orderType === 'market'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-650'
                }`}
                disabled={isProcessing}
              >
                Market Buy
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation ${
                  orderType === 'limit'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-650'
                }`}
                disabled={isProcessing}
              >
                Limit Buy
              </button>
            </div>
          </div>

          {/* Market Order Inputs */}
          {orderType === 'market' && (
            <TouchInput
              label="Investment Amount (USD)"
              type="text"
              value={investmentAmount}
              onChange={handleAmountChange}
              placeholder="0.00"
              size="lg"
              leftIcon={<DollarSign />}
              clearable
              onClear={() => setInvestmentAmount('')}
              disabled={isProcessing || !isConnected}
              helper={isConnected ? `Available: $${formatAmount(balance)} NTRN` : undefined}
              rightIcon={
                <button
                  onClick={setMaxAmount}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium px-2 py-1 rounded transition-colors touch-manipulation"
                  disabled={isProcessing || !isConnected}
                  type="button"
                >
                  MAX
                </button>
              }
            />
          )}

          {/* Limit Order Inputs */}
          {orderType === 'limit' && (
            <div className="space-y-4">
              <TouchInput
                label="Limit Price (USD per token)"
                type="text"
                value={limitPrice}
                onChange={handleLimitPriceChange}
                placeholder="0.00"
                size="lg"
                leftIcon={<DollarSign />}
                clearable
                onClear={() => setLimitPrice('')}
                disabled={isProcessing || !isConnected}
                helper={`Current price: $${formatAmount(proposal?.financial_terms?.token_price || '0')}`}
              />
              
              <TouchInput
                label="Quantity (tokens)"
                type="text"
                value={limitQuantity}
                onChange={handleLimitQuantityChange}
                placeholder="0"
                size="lg"
                clearable
                onClear={() => setLimitQuantity('')}
                disabled={isProcessing || !isConnected}
                helper={isConnected ? `Available: $${formatAmount(balance)} NTRN` : undefined}
                rightIcon={
                  <button
                    onClick={setMaxAmount}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium px-2 py-1 rounded transition-colors touch-manipulation"
                    disabled={isProcessing || !isConnected || !limitPrice}
                    type="button"
                  >
                    MAX
                  </button>
                }
              />
            </div>
          )}

          {/* Investment Summary */}
          {((orderType === 'market' && investmentAmount && parseFloat(investmentAmount) > 0) ||
            (orderType === 'limit' && limitPrice && limitQuantity && parseFloat(limitPrice) > 0 && parseFloat(limitQuantity) > 0)) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Investment Summary</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {orderType === 'market' ? 'Shares to receive:' : 'Shares to buy:'}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {calculatedShares.toLocaleString()}
                  </span>
                </div>
                
                {orderType === 'limit' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total cost:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${(parseFloat(limitPrice || '0') * parseFloat(limitQuantity || '0')).toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Estimated annual returns:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ${estimatedReturns}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Expected APY:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {proposal?.financial_terms?.expected_apy || 'N/A'}
                  </span>
                </div>
              </div>
              
              {orderType === 'limit' && (
                <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                    ℹ️ Limit order will execute when token price reaches ${limitPrice}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Proposal Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Investment Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Token Price</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  ${formatAmount(proposal?.financial_terms?.token_price || '0')}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Minimum Investment</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  ${formatAmount(proposal?.financial_terms?.minimum_investment || '0')}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Funding Progress</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {proposal?.funding_progress?.raised_percentage || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 dark:border-amber-400 rounded-lg p-4">
            <p className="text-amber-800 dark:text-amber-200 text-sm font-medium leading-relaxed">
              ⚠️ <strong>Investment Risk:</strong> This investment is subject to market risks. 
              Tokens will be locked for 12 months after successful funding. 
              Please read all risk factors before investing.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <TouchModalActions>
        <TouchModalButton
          variant="secondary"
          fullWidth
          onClick={onClose}
          disabled={isProcessing}
          size="lg"
        >
          Cancel
        </TouchModalButton>
        
        <VerificationGate
          action="invest"
          amount={orderType === 'market' ? parseFloat(investmentAmount || '0') : parseFloat(limitPrice || '0') * parseFloat(limitQuantity || '0')}
          proposalId={proposal?.id}
        >
          <TouchModalButton
            variant="danger"
            fullWidth
            onClick={handleInvest}
            loading={isProcessing}
            disabled={
              !isConnected || 
              (orderType === 'market' && (!investmentAmount || parseFloat(investmentAmount) <= 0)) ||
              (orderType === 'limit' && (!limitPrice || !limitQuantity || parseFloat(limitPrice) <= 0 || parseFloat(limitQuantity) <= 0))
            }
            size="lg"
          >
            {orderType === 'market' ? 'Buy' : 'Place Limit Order'}
          </TouchModalButton>
        </VerificationGate>
      </TouchModalActions>
    </TouchModal>
  );
};