import type { UseCosmJSReturn } from '../../hooks/useCosmJS'

// Mock data for testing
export const mockProposal = {
  id: 'proposal_1',
  creator: 'cosmos1creator...',
  asset_details: {
    name: 'Test Property',
    asset_type: 'Real Estate',
    category: 'Commercial',
    location: 'New York, NY',
    description: 'Test description',
    full_description: 'A test property for integration testing.',
    risk_factors: ['Market volatility', 'Interest rate changes'],
    highlights: ['Prime location', 'Long-term tenants'],
  },
  financial_terms: {
    target_amount: '100000000000',
    token_price: '10000000',
    total_shares: 10000,
    minimum_investment: '1000000',
    expected_apy: '8%',
    funding_deadline: Date.now() / 1000 + 86400 * 30, // 30 days from now
  },
  funding_status: {
    raised_amount: '50000000000',
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

export const mockPortfolio = {
  total_invested: '5000000000',
  total_value: '5500000000',
  unrealized_gains: '500000000',
  total_return_percentage: '10.0',
  investments: [
    {
      proposal_id: 'proposal_1',
      amount: '2000000000',
      shares: 2000,
      current_value: '2200000000',
      return_percentage: '10.0',
    },
    {
      proposal_id: 'proposal_2',
      amount: '3000000000',
      shares: 1500,
      current_value: '3300000000',
      return_percentage: '10.0',
    },
  ],
}

export const mockPlatformStats = {
  total_proposals: 15,
  total_raised: '50000000000000',
  total_investors: 1250,
  successful_proposals: 12,
  average_return: '8.5%',
}

// Mock implementation of useCosmJS hook
export const createMockUseCosmJS = (overrides: Partial<UseCosmJSReturn> = {}): UseCosmJSReturn => ({
  // Connection state
  address: 'neutron1mock123456789',
  isConnected: true,
  isConnecting: false,
  balance: '1000000000',
  error: null,
  
  // Connection functions
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  
  // Contract functions
  createProposal: vi.fn().mockResolvedValue({ transactionHash: 'mock_tx_hash' }),
  updateProposal: vi.fn().mockResolvedValue({ transactionHash: 'mock_tx_hash' }),
  cancelProposal: vi.fn().mockResolvedValue({ transactionHash: 'mock_tx_hash' }),
  invest: vi.fn().mockResolvedValue({ transactionHash: 'mock_tx_hash' }),
  
  // Trading functions
  placeOrder: vi.fn().mockResolvedValue({ transactionHash: 'mock_order_tx', orderId: 'order_123' }),
  cancelOrder: vi.fn().mockResolvedValue({ transactionHash: 'mock_cancel_tx' }),
  
  // AMM functions
  addLiquidity: vi.fn().mockResolvedValue({ transactionHash: 'mock_liq_tx', lpTokens: '1000' }),
  removeLiquidity: vi.fn().mockResolvedValue({ transactionHash: 'mock_rem_liq_tx', amountA: '500', amountB: '500' }),
  swap: vi.fn().mockResolvedValue({ transactionHash: 'mock_swap_tx', amountOut: '950' }),
  
  // Staking functions
  stake: vi.fn().mockResolvedValue({ transactionHash: 'mock_stake_tx', stakeId: 'stake_123' }),
  unstake: vi.fn().mockResolvedValue({ transactionHash: 'mock_unstake_tx' }),
  claimRewards: vi.fn().mockResolvedValue({ transactionHash: 'mock_claim_tx', rewardAmount: '25.5' }),
  
  // Lending functions
  createLendingPool: vi.fn().mockResolvedValue({ transactionHash: 'mock_pool_tx' }),
  supplyToPool: vi.fn().mockResolvedValue({ transactionHash: 'mock_supply_tx', shares: '1000' }),
  borrowFromPool: vi.fn().mockResolvedValue({ transactionHash: 'mock_borrow_tx', healthFactor: '2.1' }),
  repayLoan: vi.fn().mockResolvedValue({ transactionHash: 'mock_repay_tx', remainingDebt: '500' }),
  depositCollateral: vi.fn().mockResolvedValue({ transactionHash: 'mock_collateral_tx', healthFactor: '3.2' }),
  liquidatePosition: vi.fn().mockResolvedValue({ transactionHash: 'mock_liquidate_tx', debtCleared: '1000', liquidationBonus: '5' }),
  
  // Query functions
  queryProposal: vi.fn().mockResolvedValue(mockProposal),
  queryAllProposals: vi.fn().mockResolvedValue({ proposals: [mockProposal] }),
  queryUserPortfolio: vi.fn().mockResolvedValue(mockPortfolio),
  queryPlatformStats: vi.fn().mockResolvedValue(mockPlatformStats),
  
  // Utility functions
  formatAmount: vi.fn((amount: string) => {
    const num = parseFloat(amount) / 1000000;
    return `${num.toFixed(2)} NTRN`;
  }),
  parseAmount: vi.fn((amount: string) => {
    const num = parseFloat(amount) * 1000000;
    return num.toString();
  }),
  clearError: vi.fn(),
  
  ...overrides,
})

// Mock the entire useCosmJS module
export const mockUseCosmJS = createMockUseCosmJS()

// Mock for useProposal hook
export const createMockUseProposal = (_: string, overrides: any = {}) => ({
  proposal: mockProposal,
  loading: false,
  error: null,
  refetch: vi.fn().mockResolvedValue(undefined),
  ...overrides,
})

// Mock for useProposals hook
export const createMockUseProposals = (overrides: any = {}) => ({
  proposals: [mockProposal],
  loading: false,
  error: null,
  refetch: vi.fn().mockResolvedValue(undefined),
  ...overrides,
})

// Mock for usePortfolio hook
export const createMockUsePortfolio = (overrides: any = {}) => ({
  portfolio: mockPortfolio,
  performance: {
    daily_change: '2.5%',
    weekly_change: '8.2%',
    monthly_change: '15.1%',
    yearly_change: '45.3%',
  },
  loading: false,
  error: null,
  refetch: vi.fn().mockResolvedValue(undefined),
  ...overrides,
})