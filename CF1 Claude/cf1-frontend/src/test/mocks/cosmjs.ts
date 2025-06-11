import { UseCosmJSReturn } from '../../hooks/useCosmJS'

// Mock data for testing
export const mockProposal = {
  id: 'proposal_1',
  creator: 'neutron1mock123',
  asset_details: {
    name: 'Downtown Seattle Office',
    asset_type: 'Commercial Real Estate',
    category: 'Real Estate',
    location: 'Seattle, WA',
    description: 'Premium Class A office building',
    full_description: 'A premium Class A office building located in the heart of downtown Seattle.',
    risk_factors: ['Market volatility', 'Interest rate changes'],
    highlights: ['Prime location', 'Long-term tenants'],
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
export const createMockUseProposal = (proposalId: string, overrides: any = {}) => ({
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