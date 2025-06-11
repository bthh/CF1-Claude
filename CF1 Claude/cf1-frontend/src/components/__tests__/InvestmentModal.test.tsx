import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import { InvestmentModal } from '../InvestmentModal'
import { createMockUseCosmJS, mockProposal } from '../../test/mocks/cosmjs'
import { useCosmJS } from '../../hooks/useCosmJS'

// Mock the useCosmJS hook
vi.mock('../../hooks/useCosmJS', () => ({
  useCosmJS: vi.fn(),
}))

// Mock window.alert
const mockAlert = vi.fn()
global.alert = mockAlert

describe('InvestmentModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    proposal: mockProposal,
    onSuccess: mockOnSuccess,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock with connected wallet
    const mockHook = createMockUseCosmJS({
      isConnected: true,
      balance: '10000000000', // 10000 NTRN
      formatAmount: vi.fn((amount) => {
        const num = parseFloat(amount) / 1000000;
        return num.toFixed(2);
      }),
      parseAmount: vi.fn((amount) => {
        const num = parseFloat(amount) * 1000000;
        return num.toString();
      }),
    })
    vi.mocked(useCosmJS).mockReturnValue(mockHook)
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
      
      expect(screen.getByText(`Invest in ${mockProposal.asset_details.name}`)).toBeInTheDocument()
    })

    it('renders investment amount input', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText(/investment amount \(usd\)/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    })

    it('shows available balance when connected', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText(/available:/i)).toBeInTheDocument()
      expect(screen.getByText(/\$10000\.00 NTRN/)).toBeInTheDocument()
    })

    it('shows MAX button that sets maximum amount', async () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const maxButton = screen.getByText('MAX')
      fireEvent.click(maxButton)
      
      const input = screen.getByDisplayValue('10000.00')
      expect(input).toBeInTheDocument()
    })

    it('closes modal when close button is clicked', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const closeButton = screen.getByText('×')
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes modal when cancel button is clicked', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('when wallet is not connected', () => {
    beforeEach(() => {
      const mockHook = createMockUseCosmJS({
        isConnected: false,
        balance: '0',
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)
    })

    it('shows wallet connection warning', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText(/please connect your wallet to invest/i)).toBeInTheDocument()
    })

    it('disables investment input when not connected', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('0.00')
      expect(input).toBeDisabled()
    })

    it('disables confirm button when not connected', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const confirmButton = screen.getByText('Confirm Investment')
      expect(confirmButton).toBeDisabled()
    })
  })

  describe('investment amount validation', () => {
    it('only allows numeric input', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('0.00')
      
      // Valid numeric input
      fireEvent.change(input, { target: { value: '1000.50' } })
      expect(input).toHaveValue('1000.50')
      
      // Invalid non-numeric input should not change value
      fireEvent.change(input, { target: { value: '1000.50abc' } })
      expect(input).toHaveValue('1000.50')
    })

    it('calculates shares correctly when amount is entered', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('0.00')
      fireEvent.change(input, { target: { value: '2000' } })
      
      // Should show investment summary
      expect(screen.getByText(/shares to receive:/i)).toBeInTheDocument()
      expect(screen.getByText(/estimated annual returns:/i)).toBeInTheDocument()
    })

    it('shows estimated returns based on APY', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('0.00')
      fireEvent.change(input, { target: { value: '1000' } })
      
      // With 12.5% APY, $1000 should show $125 annual returns
      expect(screen.getByText('$125.00')).toBeInTheDocument()
    })
  })

  describe('investment execution', () => {
    it('disables confirm button for empty investment amount', async () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const confirmButton = screen.getByText('Confirm Investment')
      
      // Button should be disabled when no amount is entered
      expect(confirmButton).toBeDisabled()
      
      // Even if we try to click, the function shouldn't be called
      fireEvent.click(confirmButton)
      expect(mockAlert).not.toHaveBeenCalled()
    })

    it('disables confirm button for zero investment amount', async () => {
      render(<InvestmentModal {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('0.00')
      fireEvent.change(input, { target: { value: '0' } })
      
      const confirmButton = screen.getByText('Confirm Investment')
      
      // Button should be disabled when amount is zero
      expect(confirmButton).toBeDisabled()
      
      // Even if we try to click, the function shouldn't be called
      fireEvent.click(confirmButton)
      expect(mockAlert).not.toHaveBeenCalled()
    })

    it('shows error alert for insufficient balance', async () => {
      const mockHook = createMockUseCosmJS({
        isConnected: true,
        balance: '500000000', // 500 NTRN
        formatAmount: vi.fn((amount) => {
          const num = parseFloat(amount) / 1000000;
          return num.toFixed(2);
        }),
        parseAmount: vi.fn((amount) => {
          const num = parseFloat(amount) * 1000000;
          return num.toString();
        }),
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)

      render(<InvestmentModal {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('0.00')
      fireEvent.change(input, { target: { value: '1000' } })
      
      const confirmButton = screen.getByText('Confirm Investment')
      fireEvent.click(confirmButton)
      
      expect(mockAlert).toHaveBeenCalledWith('Insufficient balance')
    })

    it('calls invest function with correct parameters on successful submission', async () => {
      const mockInvest = vi.fn().mockResolvedValue({ transactionHash: 'mock_hash' })
      const mockHook = createMockUseCosmJS({
        invest: mockInvest,
        isConnected: true,
        balance: '10000000000',
        formatAmount: vi.fn((amount) => {
          const num = parseFloat(amount) / 1000000;
          return num.toFixed(2);
        }),
        parseAmount: vi.fn((amount) => {
          const num = parseFloat(amount) * 1000000;
          return num.toString();
        }),
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)

      render(<InvestmentModal {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('0.00')
      fireEvent.change(input, { target: { value: '2000' } })
      
      const confirmButton = screen.getByText('Confirm Investment')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockInvest).toHaveBeenCalledWith(mockProposal.id, '2000000000')
      })
    })

    it('shows success message and closes modal on successful investment', async () => {
      const mockInvest = vi.fn().mockResolvedValue({ transactionHash: 'mock_hash' })
      const mockHook = createMockUseCosmJS({
        invest: mockInvest,
        isConnected: true,
        balance: '10000000000',
        formatAmount: vi.fn((amount) => {
          const num = parseFloat(amount) / 1000000;
          return num.toFixed(2);
        }),
        parseAmount: vi.fn((amount) => {
          const num = parseFloat(amount) * 1000000;
          return num.toString();
        }),
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)

      render(<InvestmentModal {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('0.00')
      fireEvent.change(input, { target: { value: '2000' } })
      
      const confirmButton = screen.getByText('Confirm Investment')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Investment successful!')
        expect(mockOnSuccess).toHaveBeenCalled()
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('shows processing state during investment', async () => {
      const mockInvest = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      const mockHook = createMockUseCosmJS({
        invest: mockInvest,
        isConnected: true,
        balance: '10000000000',
        formatAmount: vi.fn((amount) => {
          const num = parseFloat(amount) / 1000000;
          return num.toFixed(2);
        }),
        parseAmount: vi.fn((amount) => {
          const num = parseFloat(amount) * 1000000;
          return num.toString();
        }),
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)

      render(<InvestmentModal {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('0.00')
      fireEvent.change(input, { target: { value: '2000' } })
      
      const confirmButton = screen.getByText('Confirm Investment')
      fireEvent.click(confirmButton)
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(confirmButton).toBeDisabled()
    })

    it('handles investment errors gracefully', async () => {
      const mockInvest = vi.fn().mockRejectedValue(new Error('Network error'))
      const mockHook = createMockUseCosmJS({
        invest: mockInvest,
        isConnected: true,
        balance: '10000000000',
        formatAmount: vi.fn((amount) => {
          const num = parseFloat(amount) / 1000000;
          return num.toFixed(2);
        }),
        parseAmount: vi.fn((amount) => {
          const num = parseFloat(amount) * 1000000;
          return num.toString();
        }),
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)

      render(<InvestmentModal {...defaultProps} />)
      
      const input = screen.getByPlaceholderText('0.00')
      fireEvent.change(input, { target: { value: '2000' } })
      
      const confirmButton = screen.getByText('Confirm Investment')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Investment failed: Network error')
      })
    })
  })

  describe('proposal information display', () => {
    it('displays proposal financial details', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText(/token price:/i)).toBeInTheDocument()
      expect(screen.getByText(/minimum investment:/i)).toBeInTheDocument()
      expect(screen.getByText(/funding progress:/i)).toBeInTheDocument()
    })

    it('shows risk warning', () => {
      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText(/investment risk:/i)).toBeInTheDocument()
      expect(screen.getByText(/tokens will be locked for 12 months/i)).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('displays error message when there is an error', () => {
      const mockHook = createMockUseCosmJS({
        error: 'Connection failed',
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)

      render(<InvestmentModal {...defaultProps} />)
      
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })
  })
})