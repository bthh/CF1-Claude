import React, { useState } from 'react';
import { X, AlertCircle, DollarSign } from 'lucide-react';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: any;
  onSuccess?: () => void;
}

export const InvestmentModalSimple: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onSuccess
}) => {
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleInvest = async () => {
    setIsProcessing(true);
    
    // Simulate investment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess?.();
      alert('Investment simulation completed! (This is a demo)');
    }, 2000);
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount) || 0;
    return (num / 1000000).toFixed(2);
  };

  const calculateShares = () => {
    const amount = parseFloat(investmentAmount) || 0;
    const tokenPrice = parseFloat(formatAmount(proposal?.financial_terms?.token_price || '1000000'));
    return Math.floor(amount / tokenPrice);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Invest in {proposal?.asset_details?.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Investment Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Investment Amount (USD)
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="1000"
                min="1000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Minimum investment: $1,000
            </p>
          </div>

          {/* Investment Summary */}
          {investmentAmount && parseFloat(investmentAmount) >= 1000 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Investment Summary</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Investment Amount:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    ${parseFloat(investmentAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Shares to Receive:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {calculateShares().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Expected Annual Return:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {proposal?.financial_terms?.expected_apy || '12.5%'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Demo Mode</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  This is a demonstration. No real transactions will be processed.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInvest}
              disabled={!investmentAmount || parseFloat(investmentAmount) < 1000 || isProcessing}
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Confirm Investment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};