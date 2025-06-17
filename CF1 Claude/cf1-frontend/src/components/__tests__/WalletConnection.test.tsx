import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import { WalletConnection, ConnectWalletButton, WalletStatus } from '../WalletConnection'
import { createMockUseCosmJS } from '../../test/mocks/cosmjs'
import { useCosmJS } from '../../hooks/useCosmJS'

// Mock the useCosmJS hook
vi.mock('../../hooks/useCosmJS', () => ({
  useCosmJS: vi.fn(),
}))

// Mock the cosmjs service to control demo mode
vi.mock('../../services/cosmjs', () => ({
  cosmjsClient: {
    isDemoMode: vi.fn(() => true), // Default to demo mode for tests
  }
}))

// Mock the format utility
vi.mock('../../utils/format', () => ({
  formatAmount: vi.fn((amount) => `${parseFloat(amount) / 1000000}`),
}))

describe('WalletConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when wallet is not connected', () => {
    beforeEach(() => {
      const mockHook = createMockUseCosmJS({
        isConnected: false,
        address: '',
        balance: '0',
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)
    })

    it('renders connect button when not connected', () => {
      render(<WalletConnection />)
      
      expect(screen.getByRole('button', { name: /connect (demo )?wallet/i })).toBeInTheDocument()
    })

    it('shows connecting state when connecting', () => {
      const mockHook = createMockUseCosmJS({
        isConnected: false,
        isConnecting: true,
        address: '',
        balance: '0',
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)

      render(<WalletConnection />)
      
      expect(screen.getByText(/connecting.../i)).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('calls connect function when connect button is clicked', async () => {
      const mockConnect = vi.fn()
      const mockClearError = vi.fn()
      const mockHook = createMockUseCosmJS({
        isConnected: false,
        connect: mockConnect,
        clearError: mockClearError,
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)

      render(<WalletConnection />)
      
      const connectButton = screen.getByRole('button', { name: /connect (demo )?wallet/i })
      fireEvent.click(connectButton)

      expect(mockClearError).toHaveBeenCalled()
      expect(mockConnect).toHaveBeenCalled()
    })
  })

  describe('when wallet is connected', () => {
    beforeEach(() => {
      const mockHook = createMockUseCosmJS({
        isConnected: true,
        address: 'neutron1mock123456789abcdef',
        balance: '1000000000',
        formatAmount: vi.fn((amount) => `${parseFloat(amount) / 1000000} NTRN`),
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)
    })

    it('renders wallet info when connected', () => {
      render(<WalletConnection />)
      
      // Address truncation: first 8 chars + ... + last 6 chars 
      // neutron1mock123456789abcdef -> neutron1...abcdef
      expect(screen.getByText('neutron1...abcdef')).toBeInTheDocument()
      expect(screen.getByText(/balance:/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument()
    })

    it('calls disconnect function when disconnect button is clicked', async () => {
      const mockDisconnect = vi.fn()
      const mockHook = createMockUseCosmJS({
        isConnected: true,
        disconnect: mockDisconnect,
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)

      render(<WalletConnection />)
      
      const disconnectButton = screen.getByRole('button', { name: /disconnect/i })
      fireEvent.click(disconnectButton)

      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('truncates address correctly', () => {
      render(<WalletConnection />)
      
      // Address should be truncated to show first 8 and last 6 characters
      // neutron1mock123456789abcdef -> neutron1...abcdef
      expect(screen.getByText('neutron1...abcdef')).toBeInTheDocument()
    })
  })

  describe('when there is an error', () => {
    it('renders error message', () => {
      const mockHook = createMockUseCosmJS({
        error: 'Failed to connect to wallet',
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)

      render(<WalletConnection />)
      
      expect(screen.getByText('Failed to connect to wallet')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument()
    })

    it('clears error when close button is clicked', () => {
      const mockClearError = vi.fn()
      const mockHook = createMockUseCosmJS({
        error: 'Failed to connect to wallet',
        clearError: mockClearError,
      })
      vi.mocked(useCosmJS).mockReturnValue(mockHook)

      render(<WalletConnection />)
      
      const closeButton = screen.getByRole('button', { name: '×' })
      fireEvent.click(closeButton)

      expect(mockClearError).toHaveBeenCalled()
    })
  })
})

describe('ConnectWalletButton', () => {
  it('renders null when wallet is connected', () => {
    const mockHook = createMockUseCosmJS({
      isConnected: true,
    })
    vi.mocked(useCosmJS).mockReturnValue(mockHook)

    const { container } = render(<ConnectWalletButton />)
    
    expect(container.firstChild).toBeNull()
  })

  it('renders connect button when wallet is not connected', () => {
    const mockHook = createMockUseCosmJS({
      isConnected: false,
    })
    vi.mocked(useCosmJS).mockReturnValue(mockHook)

    render(<ConnectWalletButton />)
    
    // In demo mode, button text will be "Connect Demo Wallet"
    expect(screen.getByRole('button', { name: /connect (demo )?wallet/i })).toBeInTheDocument()
  })

  it('shows connecting state', () => {
    const mockHook = createMockUseCosmJS({
      isConnected: false,
      isConnecting: true,
    })
    vi.mocked(useCosmJS).mockReturnValue(mockHook)

    render(<ConnectWalletButton />)
    
    expect(screen.getByText(/connecting.../i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

describe('WalletStatus', () => {
  it('shows not connected message when wallet is not connected', () => {
    const mockHook = createMockUseCosmJS({
      isConnected: false,
    })
    vi.mocked(useCosmJS).mockReturnValue(mockHook)

    render(<WalletStatus />)
    
    expect(screen.getByText(/wallet not connected/i)).toBeInTheDocument()
  })

  it('shows wallet info when connected', () => {
    const mockHook = createMockUseCosmJS({
      isConnected: true,
      address: 'neutron1mock123456789abcdef',
      balance: '1000000000',
      formatAmount: vi.fn((amount) => `${parseFloat(amount) / 1000000}`),
    })
    vi.mocked(useCosmJS).mockReturnValue(mockHook)

    render(<WalletStatus />)
    
    // Check that the address is truncated correctly (first 8 chars + ... + last 6 chars)
    // neutron1mock123456789abcdef -> neutron1...abcdef
    expect(screen.getByText('neutron1...abcdef')).toBeInTheDocument()
    // formatAmount(1000000000) from utils/format will return "1000" and component adds " NTRN"
    expect(screen.getByText(/1000.*NTRN/i)).toBeInTheDocument()
  })
})