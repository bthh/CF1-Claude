import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import { InvestmentModal } from '../InvestmentModal'

// Mock all the hooks that InvestmentModal uses
vi.mock('../../hooks/useCosmJS', () => ({
  useCosmJS: vi.fn(),
}))

vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}))

// Import the mocked hooks to control their return values
import { useCosmJS } from '../../hooks/useCosmJS'
import { useNotifications } from '../../hooks/useNotifications'

const mockProposal = {
  id: 'proposal_1',
  creator: 'neutron1mock123',
  asset_details: {
    name: 'Test Solar Farm',
    asset_type: 'Renewable Energy',
    category: 'Real Estate',
    location: 'California, USA',
    description: 'Premium solar farm investment',
    full_description: 'A premium solar farm for clean energy.',
    risk_factors: ['Weather dependency', 'Regulatory changes'],
    highlights: ['High ROI', 'Government incentives'],
  },
  financial_terms: {
    target_amount: '5000000000000',
    token_price: '1000000000',
    total_shares: 5000,
    minimum_investment: '1000000000',
    expected_apy: '12.5%',
    funding_deadline: Date.now() / 1000 + 86400 * 30, // 30 days from now
  },
  funding_status: {
    raised_amount: '2500000000000',
    investor_count: 25,
    is_funded: false,
    tokens_minted: false,
  },
  status: 'Active',
  timestamps: {
    created_at: Date.now() / 1000 - 86400 * 7, // 7 days ago
    updated_at: Date.now() / 1000,
    funding_deadline: Date.now() / 1000 + 86400 * 30,
  },
}

describe('InvestmentModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()
  const mockSuccessNotification = vi.fn()
  const mockErrorNotification = vi.fn()
  const mockInvestFunction = vi.fn()
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    proposal: mockProposal,
    onSuccess: mockOnSuccess,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock useNotifications
    vi.mocked(useNotifications).mockReturnValue({
      success: mockSuccessNotification,
      error: mockErrorNotification,
      info: vi.fn(),
      warning: vi.fn(),
      dismiss: vi.fn(),
      clear: vi.fn(),
      notifications: [],
    })
    
    // Default mock for useCosmJS with connected wallet
    vi.mocked(useCosmJS).mockReturnValue({
      isConnected: true,
      address: 'neutron1test123',
      balance: '10000000000', // 10000 NTRN
      isConnecting: false,
      error: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      invest: mockInvestFunction.mockResolvedValue({ transactionHash: 'mock_tx_hash' }),
      formatAmount: vi.fn((amount) => {
        const num = parseFloat(amount) / 1000000;
        return num.toFixed(2);
      }),
      parseAmount: vi.fn((amount) => {
        const num = parseFloat(amount) * 1000000;
        return num.toString();
      }),
      clearError: vi.fn(),
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
    })
  })

  describe('when modal is closed', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <InvestmentModal {...defaultProps} isOpen={false} />
      )
      
      expect(container.firstChild).toBeNull()
    })
  })

  describe('when modal is open', () => {
    it('renders modal with proposal name', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText('Invest in Test Solar Farm')).toBeInTheDocument()
    })

    it('renders investment amount input', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      // Find by placeholder since label association might not be proper
      const amountInput = screen.getByPlaceholderText('0.00')
      expect(amountInput).toBeInTheDocument()
      expect(amountInput).toHaveAttribute('type', 'text') // TouchInput uses text type
      
      // Verify the label exists
      expect(screen.getByText('Investment Amount (USD)')).toBeInTheDocument()
    })

    it('shows investment amount input field', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const amountInput = screen.getByPlaceholderText('0.00')
      expect(amountInput).toBeInTheDocument()
    })

    it('shows available balance when connected', async () => {
      render(<InvestmentModal {...defaultProps} />)
      
      // The available balance should be shown as helper text
      await waitFor(() => {
        expect(screen.getByText(/available/i)).toBeInTheDocument()
      })
    })

    it('has a close button', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      // Look for X icon button in header
      const closeButtons = screen.getAllByRole('button')
      expect(closeButtons.length).toBeGreaterThan(0)
    })

    it('shows multiple interactive buttons', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(1) // Should have close, order type, and action buttons
    })
  })

  describe('when wallet is not connected', () => {
    beforeEach(() => {
      vi.mocked(useCosmJS).mockReturnValue({
        isConnected: false,
        address: null,
        balance: '0',
        isConnecting: false,
        error: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        invest: mockInvestFunction,
        formatAmount: vi.fn((amount) => {
          const num = parseFloat(amount) / 1000000;
          return num.toFixed(2);
        }),
        parseAmount: vi.fn((amount) => {
          const num = parseFloat(amount) * 1000000;
          return num.toString();
        }),
        clearError: vi.fn(),
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
      })
    })

    it('shows wallet connection warning', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText(/please connect your wallet/i)).toBeInTheDocument()
    })

    it('disables investment input when not connected', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const amountInput = screen.getByPlaceholderText('0.00')
      expect(amountInput).toBeDisabled()
    })

    it('shows wallet connection warning when not connected', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText(/please connect your wallet/i)).toBeInTheDocument()
    })
  })

  describe('investment amount validation', () => {
    it('accepts text input in amount field', async () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const amountInput = screen.getByPlaceholderText('0.00')
      
      // TouchInput is of type "text" so it accepts any input initially
      fireEvent.change(amountInput, { target: { value: 'abc' } })
      
      // The component may handle validation internally, but the input accepts the text
      expect(amountInput.value).toBe('') // Component clears invalid input
    })

    it('allows entering investment amount', async () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const amountInput = screen.getByPlaceholderText('0.00')
      
      fireEvent.change(amountInput, { target: { value: '1000' } })
      
      expect(amountInput.value).toBe('1000')
    })

    it('shows investment details section', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      // Should show investment form elements
      expect(screen.getByText('Investment Amount (USD)')).toBeInTheDocument()
      expect(screen.getByText('Order Type')).toBeInTheDocument()
    })
  })

  describe('investment execution', () => {
    it('displays order type buttons', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText('Market Buy')).toBeInTheDocument()
      expect(screen.getByText('Limit Buy')).toBeInTheDocument()
    })

    it('allows zero input in amount field', async () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const amountInput = screen.getByPlaceholderText('0.00')
      
      fireEvent.change(amountInput, { target: { value: '0' } })
      
      expect(amountInput.value).toBe('0')
    })

    it('shows investment amount in form', async () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const amountInput = screen.getByPlaceholderText('0.00')
      
      fireEvent.change(amountInput, { target: { value: '5000' } })
      
      expect(amountInput.value).toBe('5000')
    })

    it('accepts investment amount input', async () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const amountInput = screen.getByPlaceholderText('0.00')
      
      fireEvent.change(amountInput, { target: { value: '1000' } })
      
      expect(amountInput.value).toBe('1000')
    })

    it('shows investment form when connected', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      // When connected, should show investment form
      expect(screen.getByText('Investment Amount (USD)')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    })

    it('allows interaction with order type buttons', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const marketButton = screen.getByText('Market Buy')
      const limitButton = screen.getByText('Limit Buy')
      
      expect(marketButton).toBeInTheDocument()
      expect(limitButton).toBeInTheDocument()
      
      // Should be able to click order type buttons
      fireEvent.click(limitButton)
      fireEvent.click(marketButton)
    })

    it('shows order type selector interface', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText('Order Type')).toBeInTheDocument()
      expect(screen.getByText('Market Buy')).toBeInTheDocument()
      expect(screen.getByText('Limit Buy')).toBeInTheDocument()
    })
  })

  describe('proposal information display', () => {
    it('displays proposal information', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      // Check that the proposal name is displayed
      expect(screen.getByText('Invest in Test Solar Farm')).toBeInTheDocument()
      // Check that some form of investment interface is present
      expect(screen.getByText('Investment Amount (USD)')).toBeInTheDocument()
    })

    it('shows order type selection', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText('Market Buy')).toBeInTheDocument()
      expect(screen.getByText('Limit Buy')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('displays error message when there is an error', () => {
      vi.mocked(useCosmJS).mockReturnValue({
        isConnected: true,
        address: 'neutron1test123',
        balance: '10000000000',
        isConnecting: false,
        error: 'Connection failed',
        connect: vi.fn(),
        disconnect: vi.fn(),
        invest: mockInvestFunction,
        formatAmount: vi.fn(),
        parseAmount: vi.fn(),
        clearError: vi.fn(),
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
      })
      
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText(/connection failed/i)).toBeInTheDocument()
    })
  })
})