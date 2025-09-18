import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../../test-utils/TestWrapper';

// Import components for E2E workflow testing
import { InvestmentModal } from '../../../components/InvestmentModal';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { useCosmJS } from '../../../hooks/useCosmJS';

// Mock all dependencies
vi.mock('../../../hooks/useCosmJS');
vi.mock('../../../hooks/useNotifications');
vi.mock('../../../store/portfolioStore');
vi.mock('../../../store/verificationStore');

describe('End-to-End Financial Investment Workflow', () => {
  const mockProposal = {
    id: 'proposal_real_estate_123',
    asset_details: {
      name: 'Premium Downtown Office Complex',
      type: 'Real Estate',
      description: 'Class A office building in prime downtown location'
    },
    financial_terms: {
      token_price: '1000000', // $1.00 per token
      minimum_investment: '1000000000', // $1,000 minimum
      maximum_investment: '100000000000', // $100,000 maximum
      expected_apy: '12.5%',
      funding_goal: '50000000000000', // $50M funding goal
      funding_deadline: '1735689600000' // Dec 31, 2025
    },
    funding_progress: {
      raised_amount: '22500000000000', // $22.5M raised
      raised_percentage: 45,
      investor_count: 450
    }
  };

  let mockCosmJS: any;
  let mockNotifications: any;
  let mockPortfolioStore: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup comprehensive mocks
    mockCosmJS = {
      invest: vi.fn(),
      isConnected: true,
      balance: '75000000000', // $75,000 balance
      error: null,
      clearError: vi.fn(),
      address: 'neutron1investor456',
      formatAmount: (amount: string) => (parseFloat(amount) / 1000000).toFixed(2),
      parseAmount: (amount: string) => (parseFloat(amount) * 1000000).toString(),
      queryProposal: vi.fn(),
      queryUserPortfolio: vi.fn(),
      queryUserInvestments: vi.fn()
    };

    mockNotifications = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    };

    mockPortfolioStore = {
      addTransaction: vi.fn(),
      addAsset: vi.fn(),
      fetchPortfolio: vi.fn(),
      assets: [],
      summary: null
    };

    // Mock hooks
    const { useCosmJS: actualUseCosmJS } = await import('../../../hooks/useCosmJS');
    vi.mocked(actualUseCosmJS).mockReturnValue(mockCosmJS);

    const { useNotifications } = await import('../../../hooks/useNotifications');
    vi.mocked(useNotifications).mockReturnValue(mockNotifications);

    const { usePortfolioStore: actualUsePortfolioStore } = await import('../../../store/portfolioStore');
    vi.mocked(actualUsePortfolioStore).mockReturnValue(mockPortfolioStore);

    const { useVerificationStore } = await import('../../../store/verificationStore');
    vi.mocked(useVerificationStore).mockReturnValue({
      getState: () => ({
        level: 'verified',
        identityVerification: { status: 'approved' }
      })
    });
  });

  describe('Complete Investment Journey - Happy Path', () => {
    it('should complete full investment workflow successfully', async () => {
      // Setup successful investment response
      const mockTxResponse = {
        transactionHash: 'E2E_TX_HASH_123456',
        code: 0,
        gasUsed: '145000',
        height: 15432,
        events: [
          {
            type: 'investment_created',
            attributes: [
              { key: 'proposal_id', value: mockProposal.id },
              { key: 'investor', value: 'neutron1investor456' },
              { key: 'amount', value: '15000000000' },
              { key: 'shares', value: '15000' }
            ]
          }
        ]
      };

      mockCosmJS.invest.mockResolvedValue(mockTxResponse);

      // Render investment modal
      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
            onSuccess={vi.fn()}
          />
        </TestWrapper>
      );

      // Step 1: User sees investment interface
      expect(screen.getByText(/invest in premium downtown office complex/i)).toBeInTheDocument();
      expect(screen.getByText(/available: \$75.00 ntrn/i)).toBeInTheDocument();

      // Step 2: User enters investment amount
      const amountInput = screen.getByLabelText(/investment amount/i);
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '15000');

      // Step 3: Verify calculations display correctly
      await waitFor(() => {
        expect(screen.getByText('15,000')).toBeInTheDocument(); // Shares
        expect(screen.getByText('$1875.00')).toBeInTheDocument(); // Estimated returns (15000 * 0.125)
      });

      // Step 4: User reviews investment details
      expect(screen.getByText('$1.00')).toBeInTheDocument(); // Token price
      expect(screen.getByText('$1,000.00')).toBeInTheDocument(); // Minimum investment
      expect(screen.getByText('45%')).toBeInTheDocument(); // Funding progress

      // Step 5: User confirms investment
      const investButton = screen.getByRole('button', { name: /invest now/i });
      expect(investButton).not.toBeDisabled();

      await userEvent.click(investButton);

      // Step 6: Verify processing state
      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
        expect(investButton).toBeDisabled();
      });

      // Step 7: Verify blockchain transaction called correctly
      expect(mockCosmJS.invest).toHaveBeenCalledWith(
        mockProposal.id,
        '15000000000' // $15,000 in micro units
      );

      // Step 8: Verify portfolio update
      await waitFor(() => {
        expect(mockPortfolioStore.addTransaction).toHaveBeenCalledWith({
          type: 'investment',
          assetId: mockProposal.id,
          assetName: mockProposal.asset_details.name,
          amount: '15000',
          shares: 15000,
          timestamp: expect.any(String),
          status: 'completed'
        });
      });

      // Step 9: Verify success notification
      await waitFor(() => {
        expect(mockNotifications.success).toHaveBeenCalledWith(
          'Investment Successful!',
          expect.stringContaining('$15000'),
          expect.objectContaining({
            actionLabel: 'View Portfolio'
          })
        );
      });
    });

    it('should handle maximum investment amount correctly', async () => {
      // Test investment at maximum limit
      const mockTxResponse = {
        transactionHash: 'MAX_TX_HASH_789',
        code: 0,
        height: 15433
      };

      mockCosmJS.invest.mockResolvedValue(mockTxResponse);

      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);
      const investButton = screen.getByRole('button', { name: /invest now/i });

      // Enter maximum allowed amount ($75,000 - user's full balance)
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '75000');

      await userEvent.click(investButton);

      expect(mockCosmJS.invest).toHaveBeenCalledWith(
        mockProposal.id,
        '75000000000' // $75,000 in micro units
      );
    });
  });

  describe('Investment Validation Edge Cases', () => {
    it('should prevent investment below minimum threshold', async () => {
      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);
      const investButton = screen.getByRole('button', { name: /invest now/i });

      // Attempt investment below minimum ($500 < $1,000 minimum)
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '500');

      await userEvent.click(investButton);

      expect(mockNotifications.error).toHaveBeenCalledWith(
        'Minimum Investment Required',
        expect.stringContaining('$1,000.00')
      );

      expect(mockCosmJS.invest).not.toHaveBeenCalled();
    });

    it('should prevent investment exceeding user balance', async () => {
      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);
      const investButton = screen.getByRole('button', { name: /invest now/i });

      // Attempt investment exceeding balance ($100,000 > $75,000 balance)
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '100000');

      await userEvent.click(investButton);

      expect(mockNotifications.error).toHaveBeenCalledWith(
        'Insufficient Balance',
        'You don\'t have enough funds for this investment.'
      );

      expect(mockCosmJS.invest).not.toHaveBeenCalled();
    });

    it('should handle decimal investment amounts correctly', async () => {
      const mockTxResponse = { transactionHash: 'DECIMAL_TX_456', code: 0 };
      mockCosmJS.invest.mockResolvedValue(mockTxResponse);

      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);
      const investButton = screen.getByRole('button', { name: /invest now/i });

      // Enter decimal investment amount
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '2500.50');

      await userEvent.click(investButton);

      expect(mockCosmJS.invest).toHaveBeenCalledWith(
        mockProposal.id,
        '2500500000' // $2,500.50 in micro units
      );
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle blockchain transaction failures gracefully', async () => {
      const blockchainError = new Error('Transaction failed: network congestion');
      mockCosmJS.invest.mockRejectedValue(blockchainError);

      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);
      const investButton = screen.getByRole('button', { name: /invest now/i });

      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '5000');

      await userEvent.click(investButton);

      await waitFor(() => {
        expect(mockNotifications.error).toHaveBeenCalledWith(
          'Investment Failed',
          'Transaction failed: network congestion',
          expect.objectContaining({
            persistent: true,
            actionLabel: 'Contact Support'
          })
        );
      });

      // Verify portfolio was not updated on failure
      expect(mockPortfolioStore.addTransaction).not.toHaveBeenCalled();
    });

    it('should handle gas estimation failures', async () => {
      const gasError = new Error('Transaction failed: insufficient gas');
      mockCosmJS.invest.mockRejectedValue(gasError);

      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);
      const investButton = screen.getByRole('button', { name: /invest now/i });

      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '10000');

      await userEvent.click(investButton);

      await waitFor(() => {
        expect(mockNotifications.error).toHaveBeenCalledWith(
          'Investment Failed',
          'Transaction failed: insufficient gas',
          expect.objectContaining({
            persistent: true
          })
        );
      });
    });

    it('should handle network connectivity issues', async () => {
      const networkError = new Error('Network request failed');
      mockCosmJS.invest.mockRejectedValue(networkError);

      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);
      const investButton = screen.getByRole('button', { name: /invest now/i });

      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '7500');

      await userEvent.click(investButton);

      await waitFor(() => {
        expect(mockNotifications.error).toHaveBeenCalledWith(
          'Investment Failed',
          'Network request failed',
          expect.objectContaining({
            persistent: true,
            actionLabel: 'Contact Support'
          })
        );
      });
    });
  });

  describe('User Experience and Interaction Flows', () => {
    it('should provide real-time calculation updates', async () => {
      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);

      // Test incremental amount updates
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '1');
      expect(screen.getByText('1')).toBeInTheDocument(); // 1 share

      await userEvent.type(amountInput, '000');
      await waitFor(() => {
        expect(screen.getByText('1,000')).toBeInTheDocument(); // 1,000 shares
        expect(screen.getByText('$125.00')).toBeInTheDocument(); // $1,000 * 12.5% APY
      });

      await userEvent.type(amountInput, '0');
      await waitFor(() => {
        expect(screen.getByText('10,000')).toBeInTheDocument(); // 10,000 shares
        expect(screen.getByText('$1250.00')).toBeInTheDocument(); // $10,000 * 12.5% APY
      });
    });

    it('should handle MAX button functionality', async () => {
      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);
      const maxButton = screen.getByRole('button', { name: /max/i });

      await userEvent.click(maxButton);

      expect(amountInput).toHaveValue('75.00'); // User's full balance
    });

    it('should clear input when clear button is used', async () => {
      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);

      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '5000');

      expect(amountInput).toHaveValue('5000');

      // Find and click clear button (assuming it's part of TouchInput)
      const clearButton = screen.getByLabelText(/clear/i);
      await userEvent.click(clearButton);

      expect(amountInput).toHaveValue('');
    });
  });

  describe('Security and Compliance Validation', () => {
    it('should require KYC verification for investments', async () => {
      // Mock unverified user
      const { useVerificationStore } = await import('../../../store/verificationStore');
      vi.mocked(useVerificationStore).mockReturnValue({
        getState: () => ({
          level: 'basic',
          identityVerification: { status: 'pending' }
        })
      });

      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);
      const investButton = screen.getByRole('button', { name: /invest now/i });

      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '5000');

      await userEvent.click(investButton);

      expect(mockNotifications.warning).toHaveBeenCalledWith(
        'Identity Verification Required',
        expect.stringContaining('Complete identity verification'),
        expect.objectContaining({
          actionLabel: 'Start Identity Verification'
        })
      );

      expect(mockCosmJS.invest).not.toHaveBeenCalled();
    });

    it('should require wallet connection for investments', async () => {
      mockCosmJS.isConnected = false;

      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);
      const investButton = screen.getByRole('button', { name: /invest now/i });

      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '5000');

      await userEvent.click(investButton);

      expect(mockNotifications.warning).toHaveBeenCalledWith(
        'Wallet Not Connected',
        'Please connect your wallet to make an investment.'
      );

      expect(mockCosmJS.invest).not.toHaveBeenCalled();
    });
  });

  describe('Portfolio Integration Workflow', () => {
    it('should complete investment and update portfolio state', async () => {
      const mockTxResponse = {
        transactionHash: 'PORTFOLIO_TX_999',
        code: 0,
        height: 15440
      };

      mockCosmJS.invest.mockResolvedValue(mockTxResponse);

      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
            onSuccess={vi.fn()}
          />
        </TestWrapper>
      );

      const amountInput = screen.getByLabelText(/investment amount/i);
      const investButton = screen.getByRole('button', { name: /invest now/i });

      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '20000');

      await userEvent.click(investButton);

      // Verify investment transaction
      await waitFor(() => {
        expect(mockCosmJS.invest).toHaveBeenCalledWith(
          mockProposal.id,
          '20000000000'
        );
      });

      // Verify portfolio transaction added
      await waitFor(() => {
        expect(mockPortfolioStore.addTransaction).toHaveBeenCalledWith({
          type: 'investment',
          assetId: mockProposal.id,
          assetName: 'Premium Downtown Office Complex',
          amount: '20000',
          shares: 20000,
          timestamp: expect.any(String),
          status: 'completed'
        });
      });

      // Verify success notification with portfolio link
      await waitFor(() => {
        expect(mockNotifications.success).toHaveBeenCalledWith(
          'Investment Successful!',
          expect.stringContaining('$20000'),
          expect.objectContaining({
            actionLabel: 'View Portfolio',
            onAction: expect.any(Function)
          })
        );
      });
    });
  });
});