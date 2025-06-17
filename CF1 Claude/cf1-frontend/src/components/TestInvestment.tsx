/**
 * Test Investment Component
 * Simple component to test backend investment validation
 */

import React, { useState } from 'react';
import { investInProposal } from '../services/proposalService';
import { useNotifications } from '../hooks/useNotifications';

interface TestInvestmentProps {
  proposalId: string;
  minimumInvestment: number;
  proposalName: string;
}

export const TestInvestment: React.FC<TestInvestmentProps> = ({
  proposalId,
  minimumInvestment,
  proposalName
}) => {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useNotifications();

  const handleInvest = async () => {
    const amountNum = parseFloat(amount);
    
    if (!amountNum || amountNum <= 0) {
      error('Please enter a valid investment amount');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await investInProposal(
        proposalId, 
        amountNum, 
        `cosmos1test${Math.random().toString(36).substr(2, 8)}` // Random test address
      );

      if (result.success) {
        success(
          'Investment Successful!',
          `Successfully invested $${amountNum.toLocaleString()} in ${proposalName}`
        );
        setAmount(''); // Clear form
      } else {
        // Show specific error from backend
        if (result.code === 'BELOW_MINIMUM_INVESTMENT') {
          error(
            'Investment Too Low',
            `Minimum investment is $${minimumInvestment.toLocaleString()}. You tried to invest $${amountNum.toLocaleString()}.`
          );
        } else if (result.code === 'MAX_INVESTORS_REACHED') {
          error(
            'Maximum Investors Reached',
            'This proposal has reached its maximum investor limit of 500 unique investors.'
          );
        } else {
          error('Investment Failed', result.error || 'Unknown error occurred');
        }
      }
    } catch (err) {
      error('Investment Failed', 'Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Test Investment - {proposalName}
      </h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Minimum Investment: <span className="font-semibold">${minimumInvestment.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Proposal ID: <span className="font-mono text-xs">{proposalId}</span>
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Investment Amount (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter amount (min: $${minimumInvestment})`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setAmount((minimumInvestment - 1).toString())}
            className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40"
          >
            Below Min
          </button>
          <button
            onClick={() => setAmount(minimumInvestment.toString())}
            className="px-3 py-2 text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40"
          >
            Exact Min
          </button>
          <button
            onClick={() => setAmount((minimumInvestment * 2).toString())}
            className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40"
          >
            Above Min
          </button>
        </div>
        
        <button
          onClick={handleInvest}
          disabled={isLoading || !amount}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {isLoading ? 'Processing Investment...' : 'Test Investment'}
        </button>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
        <p className="font-semibold mb-1">Test Scenarios:</p>
        <ul className="space-y-1">
          <li>• "Below Min" - Should fail with minimum investment error</li>
          <li>• "Exact Min" - Should succeed</li>
          <li>• "Above Min" - Should succeed</li>
          <li>• After 500 unique investors - Should fail with max investor error</li>
        </ul>
      </div>
    </div>
  );
};