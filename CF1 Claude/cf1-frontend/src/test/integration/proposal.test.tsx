import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateProposal from '../../pages/CreateProposal';
import ProposalDetail from '../../pages/ProposalDetail';
import { cosmjsClient } from '../../services/cosmjs';
import { ErrorHandler } from '../../lib/errorHandler';
import { mockProposal } from '../mocks/cosmjs';

// Mock modules
vi.mock('../../services/cosmjs');
vi.mock('../../lib/errorHandler');

const mockCosmjsClient = cosmjsClient as any;

describe('Proposal Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    mockCosmjsClient.isConnected.mockReturnValue(true);
    mockCosmjsClient.getAddress.mockReturnValue('cosmos1test...');
    mockCosmjsClient.getBalance.mockResolvedValue('1000000');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Create Proposal Flow', () => {
    it('should handle successful proposal creation', async () => {
      const user = userEvent.setup();
      
      mockCosmjsClient.createProposal.mockResolvedValue({
        transactionHash: 'tx123',
        proposalId: 'proposal_1',
      });

      renderWithProviders(<CreateProposal />);

      // Fill out form
      await user.type(screen.getByLabelText(/Asset Name/i), 'Test Property');
      await user.type(screen.getByLabelText(/Description/i), 'A test property description');
      await user.type(screen.getByLabelText(/Target Amount/i), '100000');
      await user.type(screen.getByLabelText(/Token Price/i), '10');
      await user.type(screen.getByLabelText(/Funding Period/i), '30');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Proposal/i });
      await user.click(submitButton);

      // Verify API call
      await waitFor(() => {
        expect(mockCosmjsClient.createProposal).toHaveBeenCalledWith(
          expect.objectContaining({
            asset_details: expect.objectContaining({
              name: 'Test Property',
            }),
            financial_terms: expect.objectContaining({
              target_amount: '100000000000', // Converted to untrn
              token_price: '10000000', // Converted to untrn
            }),
          })
        );
      });
    });

    it('should handle wallet not connected error', async () => {
      const user = userEvent.setup();
      
      mockCosmjsClient.isConnected.mockReturnValue(false);
      mockCosmjsClient.createProposal.mockRejectedValue(
        new Error('Wallet not connected')
      );

      renderWithProviders(<CreateProposal />);

      // Try to submit without wallet
      const submitButton = screen.getByRole('button', { name: /Create Proposal/i });
      await user.click(submitButton);

      // Verify error handling
      await waitFor(() => {
        expect(ErrorHandler.handle).toHaveBeenCalledWith(
          expect.any(Error),
          expect.stringContaining('Create Proposal')
        );
      });
    });

    it('should validate form fields', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<CreateProposal />);

      // Submit empty form
      const submitButton = screen.getByRole('button', { name: /Create Proposal/i });
      await user.click(submitButton);

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/Asset Name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Target Amount is required/i)).toBeInTheDocument();
      });

      // Verify no API call was made
      expect(mockCosmjsClient.createProposal).not.toHaveBeenCalled();
    });
  });

  describe('Proposal Detail Integration', () => {
    const mockProposal = {
      id: 'proposal_1',
      creator: 'cosmos1creator...',
      asset_details: {
        name: 'Test Property',
        description: 'Test description',
        asset_type: 'Real Estate',
        category: 'Commercial',
        location: 'New York, NY',
      },
      financial_terms: {
        target_amount: '100000000000',
        token_price: '10000000',
        total_shares: 10000,
        minimum_investment: '1000000',
        expected_apy: '8%',
        funding_deadline: Date.now() / 1000 + 86400 * 30,
      },
      funding_status: {
        raised_amount: '50000000000',
        investor_count: 25,
        is_funded: false,
        tokens_minted: false,
      },
      status: 'Active',
    };

    beforeEach(() => {
      mockCosmjsClient.queryProposal.mockResolvedValue(mockProposal);
    });

    it('should display proposal details correctly', async () => {
      renderWithProviders(<ProposalDetail />);

      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
        expect(screen.getByText(/\$100,000/)).toBeInTheDocument(); // Target amount
        expect(screen.getByText(/50%/)).toBeInTheDocument(); // Progress
      });
    });

    it('should handle investment flow', async () => {
      const user = userEvent.setup();
      
      mockCosmjsClient.invest.mockResolvedValue({
        transactionHash: 'tx456',
      });

      renderWithProviders(<ProposalDetail />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Click invest button
      const investButton = screen.getByRole('button', { name: /Invest/i });
      await user.click(investButton);

      // Fill investment amount in modal
      const amountInput = await screen.findByLabelText(/Investment Amount/i);
      await user.type(amountInput, '1000');

      // Confirm investment
      const confirmButton = screen.getByRole('button', { name: /Confirm Investment/i });
      await user.click(confirmButton);

      // Verify API call
      await waitFor(() => {
        expect(mockCosmjsClient.invest).toHaveBeenCalledWith(
          'proposal_1',
          '1000000000' // Converted to untrn
        );
      });
    });

    it('should handle network errors gracefully', async () => {
      mockCosmjsClient.queryProposal.mockRejectedValue(
        new Error('Network error')
      );

      renderWithProviders(<ProposalDetail />);

      await waitFor(() => {
        expect(ErrorHandler.handle).toHaveBeenCalledWith(
          expect.any(Error),
          expect.any(String)
        );
      });
    });
  });

  describe('Investment Validation', () => {
    it('should validate minimum investment amount', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<ProposalDetail />);

      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Open investment modal
      const investButton = screen.getByRole('button', { name: /Invest/i });
      await user.click(investButton);

      // Try to invest below minimum
      const amountInput = await screen.findByLabelText(/Investment Amount/i);
      await user.type(amountInput, '0.5'); // Below minimum of 1 NTRN

      const confirmButton = screen.getByRole('button', { name: /Confirm Investment/i });
      await user.click(confirmButton);

      // Check for validation error
      await waitFor(() => {
        expect(screen.getByText(/Minimum investment is 1 NTRN/i)).toBeInTheDocument();
      });

      // Verify no API call was made
      expect(mockCosmjsClient.invest).not.toHaveBeenCalled();
    });

    it('should prevent investment exceeding available shares', async () => {
      const user = userEvent.setup();
      
      // Set proposal with limited availability
      mockCosmjsClient.queryProposal.mockResolvedValue({
        ...mockProposal,
        funding_status: {
          ...mockProposal.funding_status,
          raised_amount: '99000000000', // 99k of 100k target
        },
      });

      renderWithProviders(<ProposalDetail />);

      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Try to invest more than available
      const investButton = screen.getByRole('button', { name: /Invest/i });
      await user.click(investButton);

      const amountInput = await screen.findByLabelText(/Investment Amount/i);
      await user.type(amountInput, '2000'); // More than 1k available

      const confirmButton = screen.getByRole('button', { name: /Confirm Investment/i });
      await user.click(confirmButton);

      // Check for validation error
      await waitFor(() => {
        expect(screen.getByText(/exceeds available/i)).toBeInTheDocument();
      });
    });
  });
});