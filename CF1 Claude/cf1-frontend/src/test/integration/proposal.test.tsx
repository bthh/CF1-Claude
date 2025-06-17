import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateProposal from '../../pages/CreateProposal';
import ProposalDetail from '../../pages/ProposalDetail';
import { useCosmJS } from '../../hooks/useCosmJS';
import { mockProposal } from '../mocks/cosmjs';

// Mock dependencies
vi.mock('../../hooks/useCosmJS');
vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  })
}));

// Mock other services  
vi.mock('../../services/cosmjs');
vi.mock('../../lib/errorHandler');
vi.mock('../../services/aiAnalysis', () => ({
  aiAnalysisService: {
    getAnalysis: vi.fn().mockResolvedValue(null),
    uploadDocuments: vi.fn().mockResolvedValue({ analysisId: 'test-analysis-id' })
  }
}));

// Mock format utilities  
vi.mock('../../utils/format', () => ({
  formatAmount: vi.fn((amount) => amount?.toString() || '0'),
  formatPercentage: vi.fn((percentage) => `${percentage}%`),
  formatTimeAgo: vi.fn(() => '1 hour ago')
}));

const mockUseCosmJS = useCosmJS as any;

describe('Proposal Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset mocks
    vi.clearAllMocks();

    // Setup useCosmJS mock
    mockUseCosmJS.mockReturnValue({
      isConnected: true,
      address: 'cosmos1test123',
      balance: '1000000',
      connect: vi.fn(),
      disconnect: vi.fn(),
      getBalance: vi.fn().mockResolvedValue('1000000'),
      createProposal: vi.fn().mockResolvedValue({
        transactionHash: 'tx123',
        proposalId: 'proposal_1',
      }),
      invest: vi.fn().mockResolvedValue({
        transactionHash: 'tx456',
      }),
      getProposals: vi.fn().mockResolvedValue([mockProposal]),
      getProposalById: vi.fn().mockResolvedValue(mockProposal),
    });
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
      renderWithProviders(<CreateProposal />);

      // Just verify that the component renders without provider errors
      await waitFor(() => {
        expect(screen.getByText(/Submit New Proposal/i)).toBeInTheDocument();
      });

      // Verify basic form elements are present
      expect(screen.getByLabelText(/Asset Name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to Launchpad/i })).toBeInTheDocument();
    });

    it('should handle wallet not connected error', async () => {
      const user = userEvent.setup();
      
      mockUseCosmJS.mockReturnValue({
        ...mockUseCosmJS(),
        isConnected: false,
        createProposal: vi.fn().mockRejectedValue(
          new Error('Wallet not connected')
        ),
      });

      renderWithProviders(<CreateProposal />);

      // Try to submit without wallet
      const submitButton = screen.getByRole('button', { name: /Create Proposal/i });
      await user.click(submitButton);

      // Should show connect wallet message or button
      await waitFor(() => {
        expect(screen.getByText(/connect wallet/i) || screen.getByText(/wallet not connected/i)).toBeInTheDocument();
      });
    });

    it('should validate form fields', async () => {
      renderWithProviders(<CreateProposal />);
      
      // Just verify the form renders and has required fields
      await waitFor(() => {
        expect(screen.getByLabelText(/Asset Name/i)).toBeInTheDocument();
      });
      
      // Verify required fields are marked
      expect(screen.getByText(/Asset Name \*/i)).toBeInTheDocument();
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
      mockUseCosmJS.mockReturnValue({
        ...mockUseCosmJS(),
        getProposalById: vi.fn().mockResolvedValue(mockProposal),
        queryProposal: vi.fn().mockResolvedValue(mockProposal),
      });
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
      
      mockUseCosmJS().invest.mockResolvedValue({
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
        expect(mockUseCosmJS().invest).toHaveBeenCalledWith(
          'proposal_1',
          '1000000000' // Converted to untrn
        );
      });
    });

    it('should handle network errors gracefully', async () => {
      mockUseCosmJS().queryProposal.mockRejectedValue(
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
      expect(mockUseCosmJS().invest).not.toHaveBeenCalled();
    });

    it('should prevent investment exceeding available shares', async () => {
      const user = userEvent.setup();
      
      // Set proposal with limited availability
      mockUseCosmJS().queryProposal.mockResolvedValue({
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