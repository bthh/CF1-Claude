import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { useCosmJS } from '../hooks/useCosmJS';
import { useNotifications } from '../hooks/useNotifications';
import { VerificationGate } from './Verification/VerificationGate';
import { TouchModal, TouchModalActions, TouchModalButton } from './TouchOptimized/TouchModal';
import { TouchInput } from './TouchOptimized/TouchInput';
import { formatAmount, parseAmount } from '../utils/format';
import { usePortfolioStore } from '../store/portfolioStore';
import { useVerificationStore } from '../store/verificationStore';
import { InvestmentModalProps, InvestmentFormData } from '../types/components';
import { InvestmentProposal, InvestmentAmount, FinancialUtils } from '../types/financial';
import { VerificationLevel } from '../types/verification';

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onSuccess,
  onError,
  maxInvestmentAmount,
  userVerificationLevel,
  eligibilityCheck
}) => {
  const [investmentAmount, setInvestmentAmount] = useState<InvestmentAmount>(
    FinancialUtils.createAmount('0', 'USD', 2)
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [calculatedShares, setCalculatedShares] = useState<number>(0);
  const [estimatedReturns, setEstimatedReturns] = useState<InvestmentAmount>(
    FinancialUtils.createAmount('0', 'USD', 2)
  );
  const [formData, setFormData] = useState<Partial<InvestmentFormData>>({
    acceptedTerms: false,
    acceptedRisks: false,
    accreditedInvestor: false,
    verificationLevel: userVerificationLevel,
    investmentMethod: 'wallet',
    agreedToLockup: false
  });
  
  const { 
    invest, 
    isConnected, 
    balance,
    error,
    clearError
  } = useCosmJS();
  
  const { success, error: showError, warning } = useNotifications();
  const { addTransaction } = usePortfolioStore();

  // Calculate shares and returns for market orders
  useEffect(() => {
    if (proposal && investmentAmount) {
      try {
        const amountNum = parseFloat(investmentAmount);
        const tokenPrice = parseFloat(proposal.financial_terms?.token_price || '0') / 1000000; // Convert from micro units
        
        if (tokenPrice > 0 && amountNum > 0) {
          const shares = Math.floor(amountNum / tokenPrice);
          setCalculatedShares(shares);
          
          // Calculate estimated returns based on expected APY
          const expectedAPY = parseFloat(proposal.financial_terms?.expected_apy?.replace('%', '') || '0') / 100;
          const annualReturns = amountNum * expectedAPY;
          setEstimatedReturns(annualReturns.toFixed(2));
        } else {
          setCalculatedShares(0);
          setEstimatedReturns('0');
        }
      } catch (error) {
        setCalculatedShares(0);
        setEstimatedReturns('0');
      }
    } else {
      setCalculatedShares(0);
      setEstimatedReturns('0');
    }
  }, [investmentAmount, proposal]);

  const handleInvest = async () => {
    // Check for identity verification first (required for actual investing)
    const { level, identityVerification } = useVerificationStore.getState();
    
    if (level === 'basic' && (!identityVerification || identityVerification.status !== 'approved')) {
      warning(
        'Identity Verification Required', 
        'Complete identity verification to make investments. This includes government ID verification and address confirmation.',
        {
          actionLabel: 'Start Identity Verification',
          onAction: () => window.location.href = '/profile/verification'
        }
      );
      return;
    }

    if (!isConnected) {
      warning('Wallet Not Connected', 'Please connect your wallet to make an investment.');
      return;
    }

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      showError('Invalid Amount', 'Please enter a valid investment amount.');
      return;
    }

    // Convert to micro units for the contract
    const amountInMicroUnits = parseAmount(investmentAmount);
    
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
          amount: investmentAmount,
          shares: calculatedShares,
          timestamp: new Date().toISOString(),
          status: 'completed'
        });
        
        console.log(`📈 Added investment to portfolio: $${investmentAmount} in ${proposal.asset_details?.name}`);
        
        success(
          'Investment Successful!', 
          `You have successfully invested $${investmentAmount} in ${proposal.asset_details?.name || 'this proposal'}.`,
          {
            actionLabel: 'View Portfolio',
            onAction: () => window.location.href = '/portfolio'
          }
        );
        setInvestmentAmount('');
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

  const setMaxAmount = () => {
    const userBalanceFormatted = formatAmount(balance);
    setInvestmentAmount(userBalanceFormatted);
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
              Connect your wallet to continue with your investment
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Investment Amount Input */}
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

          {/* Investment Summary */}
          {investmentAmount && parseFloat(investmentAmount) > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Investment Summary</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Shares to receive:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {calculatedShares.toLocaleString()}
                  </span>
                </div>
                
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
      <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        
        <VerificationGate
          action="invest"
          amount={parseFloat(investmentAmount || '0')}
          proposalId={proposal?.id}
        >
          <button
            onClick={handleInvest}
            disabled={!isConnected || !investmentAmount || parseFloat(investmentAmount) <= 0 || isProcessing}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              'Invest Now'
            )}
          </button>
        </VerificationGate>
      </div>
    </TouchModal>
  );
};