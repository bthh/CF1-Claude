import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvestmentModal } from '../../../components/InvestmentModal';
import { TestWrapper } from '../../test-utils/TestWrapper';

// Mock dependencies
vi.mock('../../../hooks/useCosmJS');
vi.mock('../../../hooks/useNotifications');
vi.mock('../../../store/portfolioStore');
vi.mock('../../../store/verificationStore');

const mockProposal = {
  id: 'proposal_1',
  asset_details: {
    name: 'Premium Real Estate REIT',
    type: 'Real Estate'
  },
  financial_terms: {
    token_price: '1000000', // $1.00 in micro units
    minimum_investment: '1000000000', // $1,000.00 in micro units
    expected_apy: '12.5%'
  },
  funding_progress: {
    raised_percentage: 45
  }
};

describe('InvestmentModal - Financial Transaction Tests', () => {
  const mockInvest = vi.fn();
  const mockNotifications = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  };
  const mockPortfolioStore = {
    addTransaction: vi.fn()
  };
  const mockVerificationStore = {
    getState: vi.fn(() => ({
      level: 'verified',
      identityVerification: { status: 'approved' }
    }))
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock useCosmJS hook
    const mockUseCosmJS = await import('../../../hooks/useCosmJS');
    vi.mocked(mockUseCosmJS.useCosmJS).mockReturnValue({
      invest: mockInvest,
      isConnected: true,
      balance: '50000000000', // $50,000 in micro units
      error: null,
      clearError: vi.fn(),
      address: 'neutron1user123',
      isConnecting: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      createProposal: vi.fn(),
      updateProposal: vi.fn(),
      cancelProposal: vi.fn(),
      placeOrder: vi.fn(),
      cancelOrder: vi.fn(),
      addLiquidity: vi.fn(),
      removeLiquidity: vi.fn(),
      swap: vi.fn(),
      stake: vi.fn(),
      unstake: vi.fn(),
      claimRewards: vi.fn(),
      createLendingPool: vi.fn(),
      supplyToPool: vi.fn(),
      borrowFromPool: vi.fn(),
      repayLoan: vi.fn(),
      depositCollateral: vi.fn(),
      liquidatePosition: vi.fn(),
      queryProposal: vi.fn(),
      queryAllProposals: vi.fn(),
      queryUserPortfolio: vi.fn(),
      queryPlatformStats: vi.fn(),
      queryLaunchpadProposals: vi.fn(),
      queryUserInvestments: vi.fn(),
      formatAmount: vi.fn((amount) => (parseFloat(amount) / 1000000).toFixed(2)),
      parseAmount: vi.fn((amount) => (parseFloat(amount) * 1000000).toString())
    });

    // Mock useNotifications hook
    const mockUseNotifications = await import('../../../hooks/useNotifications');
    vi.mocked(mockUseNotifications.useNotifications).mockReturnValue(mockNotifications);

    // Mock portfolio store
    const mockPortfolioStoreModule = await import('../../../store/portfolioStore');
    vi.mocked(mockPortfolioStoreModule.usePortfolioStore).mockReturnValue(mockPortfolioStore);

    // Mock verification store
    const mockVerificationStoreModule = await import('../../../store/verificationStore');
    vi.mocked(mockVerificationStoreModule.useVerificationStore).mockReturnValue(mockVerificationStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Financial Calculation Validation', () => {
    it('should calculate shares correctly based on token price', async () => {
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

      // Input $5,000 investment
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '5000');

      // Should calculate 5,000 shares at $1.00 per token
      await waitFor(() => {
        expect(screen.getByText('5,000')).toBeInTheDocument();
      });
    });

    it('should calculate estimated returns correctly', async () => {
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

      // Input $10,000 investment
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '10000');

      // Should calculate 12.5% APY return = $1,250
      await waitFor(() => {
        expect(screen.getByText('$1250.00')).toBeInTheDocument();
      });
    });

    it('should handle decimal precision correctly', async () => {
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

      // Input $1,234.56 investment
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '1234.56');

      // Should handle decimal precision in calculations
      await waitFor(() => {
        expect(screen.getByText('1,234')).toBeInTheDocument(); // Floor of shares
      });
    });
  });

  describe('Investment Limit Validation', () => {
    it('should enforce minimum investment requirement', async () => {
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

      // Input amount below minimum ($500 < $1,000 minimum)
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '500');

      await userEvent.click(investButton);

      expect(mockNotifications.error).toHaveBeenCalledWith(
        'Minimum Investment Required',
        expect.stringContaining('$1,000.00')
      );
      expect(mockInvest).not.toHaveBeenCalled();
    });

    it('should enforce maximum balance limit', async () => {
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

      // Input amount exceeding user balance ($60,000 > $50,000 balance)
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '60000');

      await userEvent.click(investButton);

      expect(mockNotifications.error).toHaveBeenCalledWith(
        'Insufficient Balance',
        'You don\'t have enough funds for this investment.'
      );
      expect(mockInvest).not.toHaveBeenCalled();
    });

    it('should allow investment at minimum threshold', async () => {
      mockInvest.mockResolvedValue({ success: true, txHash: 'abc123' });

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

      // Input exact minimum investment amount
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '1000');

      await userEvent.click(investButton);

      expect(mockInvest).toHaveBeenCalledWith(
        mockProposal.id,
        '1000000000' // $1,000 in micro units
      );
    });
  });

  describe('KYC/AML Compliance Validation', () => {
    it('should require identity verification for investments', async () => {
      mockVerificationStore.getState.mockReturnValue({
        level: 'basic',
        identityVerification: { status: 'pending' }
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
      expect(mockInvest).not.toHaveBeenCalled();
    });

    it('should allow investments for verified users', async () => {
      mockInvest.mockResolvedValue({ success: true, txHash: 'abc123' });

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

      expect(mockInvest).toHaveBeenCalledWith(
        mockProposal.id,
        '5000000000' // $5,000 in micro units
      );
    });
  });

  describe('Portfolio Integration', () => {
    it('should add successful investment to portfolio', async () => {
      mockInvest.mockResolvedValue({ success: true, txHash: 'abc123' });

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
        expect(mockPortfolioStore.addTransaction).toHaveBeenCalledWith({
          type: 'investment',
          assetId: mockProposal.id,
          assetName: mockProposal.asset_details.name,
          amount: '5000',
          shares: 5000,
          timestamp: expect.any(String),
          status: 'completed'
        });
      });
    });

    it('should show success notification with portfolio link', async () => {
      mockInvest.mockResolvedValue({ success: true, txHash: 'abc123' });

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
        expect(mockNotifications.success).toHaveBeenCalledWith(
          'Investment Successful!',
          expect.stringContaining('$5000'),
          expect.objectContaining({
            actionLabel: 'View Portfolio'
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle blockchain transaction failures', async () => {
      const blockchainError = new Error('Transaction failed: insufficient gas');
      mockInvest.mockRejectedValue(blockchainError);

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
          'Transaction failed: insufficient gas',
          expect.objectContaining({
            persistent: true,
            actionLabel: 'Contact Support'
          })
        );
      });
    });

    it('should validate invalid input amounts', async () => {
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

      // Test negative amount
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '-500');

      await userEvent.click(investButton);

      expect(mockNotifications.error).toHaveBeenCalledWith(
        'Invalid Amount',
        'Please enter a valid investment amount.'
      );
      expect(mockInvest).not.toHaveBeenCalled();
    });

    it('should require wallet connection', async () => {
      const mockUseCosmJS = await import('../../../hooks/useCosmJS');
      vi.mocked(mockUseCosmJS.useCosmJS).mockReturnValue({
        ...vi.mocked(mockUseCosmJS.useCosmJS)(),
        isConnected: false
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
        'Wallet Not Connected',
        'Please connect your wallet to make an investment.'
      );
      expect(mockInvest).not.toHaveBeenCalled();
    });
  });

  describe('User Experience', () => {
    it('should show loading state during investment processing', async () => {
      let resolveInvestment: (value: any) => void;
      const investmentPromise = new Promise((resolve) => {
        resolveInvestment = resolve;
      });
      mockInvest.mockReturnValue(investmentPromise);

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

      // Should show processing state
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(investButton).toBeDisabled();

      // Resolve the investment
      resolveInvestment!({ success: true, txHash: 'abc123' });

      await waitFor(() => {
        expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
      });
    });

    it('should display available balance correctly', () => {
      render(
        <TestWrapper>
          <InvestmentModal
            isOpen={true}
            onClose={vi.fn()}
            proposal={mockProposal}
          />
        </TestWrapper>
      );

      expect(screen.getByText(/Available: \$50.00 NTRN/)).toBeInTheDocument();
    });

    it('should allow setting maximum investment amount', async () => {
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

      expect(amountInput).toHaveValue('50.00');
    });
  });

  describe('Security Validation', () => {
    it('should sanitize and validate all numerical inputs', async () => {
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

      // Test invalid characters
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, 'abc123$%^');

      // Should only allow valid numerical input
      expect(amountInput).toHaveValue('123');
    });

    it('should prevent investment amount tampering', async () => {
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

      // Simulate potential script injection
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '5000<script>alert("xss")</script>');

      await userEvent.click(investButton);

      // Should only parse numerical value
      expect(mockInvest).toHaveBeenCalledWith(
        mockProposal.id,
        '5000000000' // Clean numerical conversion
      );
    });
  });
});