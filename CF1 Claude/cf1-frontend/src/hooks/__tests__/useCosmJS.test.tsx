import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCosmJS } from '../useCosmJS'
import { cosmjsClient } from '../../services/cosmjs'

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
      const { result } = renderHook(() => useCosmJS())
      
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

      const { result } = renderHook(() => useCosmJS())

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

      const { result } = renderHook(() => useCosmJS())

      await act(async () => {
        await result.current.connect()
      })

      expect(result.current.isConnected).toBe(true)
      expect(result.current.address).toBe('neutron1mock123')
      expect(result.current.balance).toBe('1000000000')
      expect(result.current.error).toBeNull()
    })

    it('handles connection errors', async () => {
      const error = new Error('Connection failed')
      vi.mocked(cosmjsClient.connectWallet).mockRejectedValue(error)

      const { result } = renderHook(() => useCosmJS())

      await act(async () => {
        await result.current.connect()
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

      const { result } = renderHook(() => useCosmJS())

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

      const { result } = renderHook(() => useCosmJS())

      await act(async () => {
        await result.current.connect()
      })

      // Then disconnect
      await act(async () => {
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

      const { result } = renderHook(() => useCosmJS())

      await act(async () => {
        await result.current.connect()
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
      const error = new Error('Transaction failed')
      vi.mocked(cosmjsClient.invest).mockRejectedValue(error)

      const { result } = renderHook(() => useCosmJS())

      await act(async () => {
        await result.current.connect()
      })

      await act(async () => {
        try {
          await result.current.invest('proposal_1', '1000000000')
        } catch (e) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Transaction failed')
    })
  })

  describe('utility functions', () => {
    it('formats amounts correctly', () => {
      const { result } = renderHook(() => useCosmJS())
      
      const formatted = result.current.formatAmount('1000000000')
      expect(formatted).toBe('1000 NTRN')
    })

    it('parses amounts correctly', () => {
      const { result } = renderHook(() => useCosmJS())
      
      const parsed = result.current.parseAmount('1000')
      expect(parsed).toBe('1000000000')
    })

    it('clears errors', async () => {
      const error = new Error('Test error')
      vi.mocked(cosmjsClient.connectWallet).mockRejectedValue(error)

      const { result } = renderHook(() => useCosmJS())

      await act(async () => {
        await result.current.connect()
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})