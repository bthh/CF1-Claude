import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCosmJS } from '../useCosmJS'
import { cosmjsClient } from '../../services/cosmjs'
import { CosmJSProvider } from '../../providers/CosmJSProvider'

// Mock the cosmjs client
vi.mock('../../services/cosmjs', () => ({
  cosmjsClient: {
    isConnected: vi.fn(),
    getAddress: vi.fn(),
    getBalance: vi.fn(),
    connectWallet: vi.fn(),
    disconnectWallet: vi.fn(),
    createProposal: vi.fn(),
    updateProposal: vi.fn(),
    cancelProposal: vi.fn(),
    invest: vi.fn(),
    queryProposal: vi.fn(),
    queryAllProposals: vi.fn(),
    queryUserPortfolio: vi.fn(),
    queryPlatformStats: vi.fn(),
    queryPortfolioPerformance: vi.fn(),
    formatAmount: vi.fn(),
    parseAmount: vi.fn(),
    isDemoMode: vi.fn(() => false),
  },
}))

// Mock business tracking hooks
vi.mock('../../hooks/useMonitoring', () => ({
  useBusinessTracking: vi.fn(() => ({
    trackUserAction: vi.fn(),
    trackTransaction: vi.fn(),
    trackInvestment: {
      started: vi.fn(),
      completed: vi.fn(),
      failed: vi.fn(),
    },
    trackWallet: {
      connected: vi.fn(),
      disconnected: vi.fn(),
    },
  })),
  useUserTracking: vi.fn(() => ({
    setUserId: vi.fn(),
    trackPageView: vi.fn(),
    setUser: vi.fn(),
    clearUser: vi.fn(),
  })),
}))

// Mock error handler
vi.mock('../../lib/errorHandler', () => ({
  ErrorHandler: {
    handle: vi.fn(),
  },
}))

describe('useCosmJS', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up default mocks
    vi.mocked(cosmjsClient.isConnected).mockReturnValue(false)
    vi.mocked(cosmjsClient.getAddress).mockReturnValue('')
    vi.mocked(cosmjsClient.getBalance).mockResolvedValue('0')
    vi.mocked(cosmjsClient.formatAmount).mockImplementation((amount: string) => 
      `${parseFloat(amount) / 1000000} NTRN`
    )
    vi.mocked(cosmjsClient.parseAmount).mockImplementation((amount: string) => 
      `${parseFloat(amount) * 1000000}`
    )
  })

  describe('initial state', () => {
    it('starts with disconnected state', () => {
      const { result } = renderHook(() => useCosmJS(), {
        wrapper: CosmJSProvider
      })
      
      expect(result.current.isConnected).toBe(false)
      expect(result.current.address).toBe('')
      expect(result.current.balance).toBe('0')
      expect(result.current.isConnecting).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('checks connection status on mount when wallet is connected', async () => {
      vi.mocked(cosmjsClient.isConnected).mockReturnValue(true)
      vi.mocked(cosmjsClient.getAddress).mockReturnValue('neutron1mock123')
      vi.mocked(cosmjsClient.getBalance).mockResolvedValue('1000000000')

      const { result } = renderHook(() => useCosmJS(), { wrapper: CosmJSProvider })

      // Wait for useEffect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.isConnected).toBe(true)
      expect(result.current.address).toBe('neutron1mock123')
      expect(result.current.balance).toBe('1000000000')
    })
  })

  describe('wallet connection', () => {
    it('connects wallet successfully', async () => {
      vi.mocked(cosmjsClient.connectWallet).mockResolvedValue('neutron1mock123')
      vi.mocked(cosmjsClient.getBalance).mockResolvedValue('1000000000')
      
      const { result } = renderHook(() => useCosmJS(), { wrapper: CosmJSProvider })

      await act(async () => {
        // Mock isConnected and getAddress to return correct values during connection
        vi.mocked(cosmjsClient.isConnected).mockReturnValue(true)
        vi.mocked(cosmjsClient.getAddress).mockReturnValue('neutron1mock123')
        await result.current.connect()
        
        // Give time for updateBalance to complete
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.isConnected).toBe(true)
      expect(result.current.address).toBe('neutron1mock123')
      expect(result.current.balance).toBe('1000000000')
      expect(result.current.error).toBeNull()
    })

    it('handles connection errors', async () => {
      vi.mocked(cosmjsClient.connectWallet).mockRejectedValue(new Error('Connection failed'))

      const { result } = renderHook(() => useCosmJS(), { wrapper: CosmJSProvider })

      await act(async () => {
        try {
          await result.current.connect()
        } catch (e) {
          // Expected to fail
        }
      })

      expect(result.current.isConnected).toBe(false)
      expect(result.current.error).toBe('Connection failed')
    })

    it('sets connecting state during connection', async () => {
      let resolveConnection: (value: string) => void
      const connectionPromise = new Promise<string>((resolve) => {
        resolveConnection = resolve
      })
      vi.mocked(cosmjsClient.connectWallet).mockReturnValue(connectionPromise)

      const { result } = renderHook(() => useCosmJS(), { wrapper: CosmJSProvider })

      // Start connection
      act(() => {
        result.current.connect()
      })

      expect(result.current.isConnecting).toBe(true)

      // Complete connection
      await act(async () => {
        resolveConnection!('neutron1mock123')
        await connectionPromise
      })

      expect(result.current.isConnecting).toBe(false)
    })

    it('disconnects wallet', async () => {
      // First connect
      vi.mocked(cosmjsClient.connectWallet).mockResolvedValue('neutron1mock123')
      vi.mocked(cosmjsClient.getBalance).mockResolvedValue('1000000000')
      vi.mocked(cosmjsClient.disconnectWallet).mockResolvedValue(undefined)

      const { result } = renderHook(() => useCosmJS(), { wrapper: CosmJSProvider })

      // Connect first
      await act(async () => {
        vi.mocked(cosmjsClient.isConnected).mockReturnValue(true)
        vi.mocked(cosmjsClient.getAddress).mockReturnValue('neutron1mock123')
        await result.current.connect()
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      // Then disconnect
      await act(async () => {
        vi.mocked(cosmjsClient.isConnected).mockReturnValue(false)
        vi.mocked(cosmjsClient.getAddress).mockReturnValue('')
        await result.current.disconnect()
      })

      expect(result.current.isConnected).toBe(false)
      expect(result.current.address).toBe('')
      expect(result.current.balance).toBe('0')
      expect(result.current.error).toBeNull()
    })
  })

  describe('contract interactions', () => {
    beforeEach(async () => {
      // Set up connected state
      vi.mocked(cosmjsClient.connectWallet).mockResolvedValue('neutron1mock123')
      vi.mocked(cosmjsClient.getBalance).mockResolvedValue('1000000000')
      vi.mocked(cosmjsClient.isConnected).mockReturnValue(true)
      vi.mocked(cosmjsClient.getAddress).mockReturnValue('neutron1mock123')
    })

    it('creates proposal successfully', async () => {
      const mockResult = { 
        transactionHash: 'mock_hash',
        logs: [],
        height: 123456,
        events: [],
        gasWanted: 200000,
        gasUsed: 180000
      } as any
      vi.mocked(cosmjsClient.createProposal).mockResolvedValue(mockResult)

      const { result } = renderHook(() => useCosmJS(), { wrapper: CosmJSProvider })

      // Connect wallet first
      await act(async () => {
        await result.current.connect()
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const proposalParams = { name: 'Test Proposal' }
      let proposalResult: any

      await act(async () => {
        proposalResult = await result.current.createProposal(proposalParams)
      })

      expect(cosmjsClient.createProposal).toHaveBeenCalledWith(proposalParams)
      expect(proposalResult).toEqual(mockResult)
    })

    it('handles contract interaction errors', async () => {
      vi.mocked(cosmjsClient.invest).mockRejectedValue(new Error('Transaction failed'))

      const { result } = renderHook(() => useCosmJS(), { wrapper: CosmJSProvider })

      // Connect wallet first
      await act(async () => {
        await result.current.connect()
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let thrownError: Error | null = null
      await act(async () => {
        try {
          await result.current.invest('proposal_1', '1000000000')
        } catch (e) {
          thrownError = e as Error
        }
      })

      // Contract interaction errors should be thrown, not set in provider state
      expect(thrownError).toBeInstanceOf(Error)
      expect(thrownError?.message).toBe('Transaction failed')
      expect(result.current.error).toBeNull() // Provider error should remain null
    })
  })

  describe('error handling', () => {
    it('clears errors', async () => {
      vi.mocked(cosmjsClient.connectWallet).mockRejectedValue(new Error('Test error'))

      const { result } = renderHook(() => useCosmJS(), { wrapper: CosmJSProvider })

      await act(async () => {
        try {
          await result.current.connect()
        } catch (e) {
          // Expected to fail
        }
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})