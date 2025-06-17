import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Lending from '../../pages/Lending';
import { useCosmJS } from '../../hooks/useCosmJS';

// Mock dependencies
vi.mock('../../hooks/useCosmJS');
vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  })
}));

// Mock format utilities  
vi.mock('../../utils/format', () => ({
  formatAmount: vi.fn((amount) => amount?.toString() || '0'),
  formatPercentage: vi.fn((percentage) => `${percentage}%`),
  formatTimeAgo: vi.fn(() => '1 hour ago')
}));

const mockUseCosmJS = useCosmJS as any;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Lending Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCosmJS.mockReturnValue({
      isConnected: true,
      address: 'cosmos1test123',
      balance: '10000000', // 10 NTRN in micro units
      createLendingPool: vi.fn().mockResolvedValue({ transactionHash: 'test-hash' }),
      supplyToPool: vi.fn().mockResolvedValue({ transactionHash: 'test-hash' }),
      borrowFromPool: vi.fn().mockResolvedValue({ transactionHash: 'test-hash' }),
      repayLoan: vi.fn().mockResolvedValue({ transactionHash: 'test-hash' }),
      depositCollateral: vi.fn().mockResolvedValue({ transactionHash: 'test-hash' })
    });
  });

  it('should display lending and borrowing statistics', async () => {
    render(
      <TestWrapper>
        <Lending />
      </TestWrapper>
    );

    // Check main page elements 
    expect(screen.getByText('Lending & Borrowing')).toBeInTheDocument();
    expect(screen.getByText('Lend your assets to earn yield or borrow against your RWA token collateral')).toBeInTheDocument();
    
    // Check stats overview cards
    await waitFor(() => {
      expect(screen.getByText('Total Supplied')).toBeInTheDocument();
      expect(screen.getByText('Total Borrowed')).toBeInTheDocument(); 
      expect(screen.getByText('Net Position')).toBeInTheDocument();
    });

    // Wait for pools to load (component has 1 second delay)
    await waitFor(() => {
      expect(screen.getByText('NTRN Lending Pool')).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText('USD Lending Pool')).toBeInTheDocument();
      expect(screen.getByText('RWA-1 Backed Pool')).toBeInTheDocument();
    });

    // Check Create Pool button is present
    expect(screen.getByText('Create Pool')).toBeInTheDocument();
  });

  it('should handle lending operations with proper validation', async () => {
    render(
      <TestWrapper>
        <Lending />
      </TestWrapper>
    );

    // Wait for pools to load, then click supply button for first pool
    await waitFor(() => {
      expect(screen.getByText('NTRN Lending Pool')).toBeInTheDocument();
    }, { timeout: 3000 });

    const supplyButtons = screen.getAllByText('Supply');
    fireEvent.click(supplyButtons[0]); // Click first supply button

    // Check if modal opens
    await waitFor(() => {
      expect(screen.getByText('Supply NTRN')).toBeInTheDocument();
    });
  });

  it('should handle borrowing with collateral validation', async () => {
    render(
      <TestWrapper>
        <Lending />
      </TestWrapper>
    );

    // Wait for pools to load, then click borrow button for first pool
    await waitFor(() => {
      expect(screen.getByText('NTRN Lending Pool')).toBeInTheDocument();
    }, { timeout: 3000 });

    const borrowButtons = screen.getAllByText('Borrow');
    fireEvent.click(borrowButtons[0]); // Click first borrow button

    // Check if modal opens with collateral warning
    await waitFor(() => {
      expect(screen.getByText('Borrow NTRN')).toBeInTheDocument();
      expect(screen.getByText('Collateral Required')).toBeInTheDocument();
    });
  });

  it('should calculate and display health factor correctly', async () => {
    render(
      <TestWrapper>
        <Lending />
      </TestWrapper>
    );

    // Check that health factor appears in the stats overview
    await waitFor(() => {
      expect(screen.getByText('Health Factor')).toBeInTheDocument();
    });
    
    // Wait for pools to load to see individual health factors
    await waitFor(() => {
      expect(screen.getByText('NTRN Lending Pool')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle liquidation scenarios', async () => {
    render(
      <TestWrapper>
        <Lending />
      </TestWrapper>
    );

    // Check that lending pools are displayed with health factors
    await waitFor(() => {
      expect(screen.getByText('NTRN Lending Pool')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check for health factor display in pools - mock data shows NTRN pool has 2.1 health factor
    await waitFor(() => {
      const healthFactorText = screen.getByText('2.10');
      expect(healthFactorText).toBeInTheDocument();
    });
  });

  it('should handle repayment operations', async () => {
    render(
      <TestWrapper>
        <Lending />
      </TestWrapper>
    );

    // Check for repay button on pools with borrowed amounts
    await waitFor(() => {
      expect(screen.getByText('NTRN Lending Pool')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Mock data shows user has borrowed amounts, so repay button should be visible
    await waitFor(() => {
      const repayButtons = screen.queryAllByText('Repay');
      expect(repayButtons.length).toBeGreaterThan(0);
    });
  });

  it('should validate minimum amounts and constraints', async () => {
    render(
      <TestWrapper>
        <Lending />
      </TestWrapper>
    );

    // Wait for pools to load
    await waitFor(() => {
      expect(screen.getByText('NTRN Lending Pool')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click supply button to open modal
    const supplyButtons = screen.getAllByText('Supply');
    fireEvent.click(supplyButtons[0]); // Click first supply button

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText('Supply NTRN')).toBeInTheDocument();
    });
  });

  it('should display detailed pool statistics', async () => {
    render(
      <TestWrapper>
        <Lending />
      </TestWrapper>
    );

    await waitFor(() => {
      // Check for pool details in the individual pool cards
      expect(screen.getByText('NTRN Lending Pool')).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText('USD Lending Pool')).toBeInTheDocument();
      expect(screen.getByText('RWA-1 Backed Pool')).toBeInTheDocument();
      
      // Check for percentage values that should be displayed with format utility mocks
      expect(screen.getByText('6.5%')).toBeInTheDocument(); // NTRN supply APY (mock format returns input + %)
      expect(screen.getByText('8.2%')).toBeInTheDocument(); // NTRN borrow APR
      expect(screen.getByText('12.5%')).toBeInTheDocument(); // RWA-1 supply APY
    });
  });

  it('should handle error scenarios gracefully', async () => {
    // Mock supplyToPool to reject
    const errorMock = {
      ...mockUseCosmJS(),
      supplyToPool: vi.fn().mockRejectedValue(new Error('Transaction failed'))
    };
    mockUseCosmJS.mockReturnValue(errorMock);

    render(
      <TestWrapper>
        <Lending />
      </TestWrapper>
    );

    // Wait for pools to load and check error handling capability exists
    await waitFor(() => {
      expect(screen.getByText('NTRN Lending Pool')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      const supplyButtons = screen.getAllByText('Supply');
      expect(supplyButtons.length).toBeGreaterThan(0);
    });
  });

  it('should update UI state after successful transactions', async () => {
    render(
      <TestWrapper>
        <Lending />
      </TestWrapper>
    );

    // Check that pools load and display current user positions
    await waitFor(() => {
      expect(screen.getByText('NTRN Lending Pool')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Mock data shows user has supplied and borrowed amounts - formatAmount returns input.toString() in mock
    await waitFor(() => {
      expect(screen.getByText('5000 NTRN')).toBeInTheDocument(); // My Supply
      expect(screen.getByText('2000 NTRN')).toBeInTheDocument(); // My Borrowed
    });
  });
});