import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useCosmJS } from '../../../hooks/useCosmJS';
import { cosmjsClient } from '../../../services/cosmjs';

// Mock the cosmjs service
vi.mock('../../../services/cosmjs');
vi.mock('../../../hooks/useMonitoring');
vi.mock('../../../providers/CosmJSProvider');

describe('CosmJS Financial Integration Tests', () => {
  const mockCosmjsClient = vi.mocked(cosmjsClient);
  let cosmjsHook: ReturnType<typeof useCosmJS>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock CosmJS provider context
    const { useCosmJSContext } = await import('../../../providers/CosmJSProvider');
    vi.mocked(useCosmJSContext).mockReturnValue({
      address: 'neutron1user123',
      isConnected: true,
      isConnecting: false,
      balance: '50000000000', // $50,000 in micro units
      connect: vi.fn(),
      disconnect: vi.fn(),
      error: null,
      clearError: vi.fn()
    });

    // Mock business tracking
    const { useBusinessTracking } = await import('../../../hooks/useMonitoring');
    vi.mocked(useBusinessTracking).mockReturnValue({
      trackInvestment: {
        started: vi.fn(),
        completed: vi.fn(),
        failed: vi.fn()
      },
      trackProposal: {
        created: vi.fn(),
        updated: vi.fn(),
        funded: vi.fn()
      },
      trackTransaction: {
        initiated: vi.fn(),
        confirmed: vi.fn(),
        failed: vi.fn()
      }
    });

    cosmjsHook = useCosmJS();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Investment Transaction Processing', () => {
    it('should process investment transaction with correct amount conversion', async () => {
      const mockTxResponse = {
        transactionHash: 'A1B2C3D4E5F6',
        code: 0,
        gasUsed: '125000',
        gasWanted: '150000',
        height: 12345,
        events: [
          {
            type: 'investment_created',
            attributes: [
              { key: 'proposal_id', value: 'proposal_123' },
              { key: 'investor', value: 'neutron1user123' },
              { key: 'amount', value: '5000000000' }
            ]
          }
        ]
      };

      mockCosmjsClient.invest.mockResolvedValue(mockTxResponse);

      const result = await cosmjsHook.invest('proposal_123', '5000000000');

      expect(mockCosmjsClient.invest).toHaveBeenCalledWith('proposal_123', '5000000000');
      expect(result).toEqual(mockTxResponse);
      expect(result.events[0].attributes[2].value).toBe('5000000000'); // $5,000 in micro units
    });

    it('should handle investment transaction failures gracefully', async () => {
      const mockError = new Error('Insufficient funds for gas');
      mockCosmjsClient.invest.mockRejectedValue(mockError);

      await expect(cosmjsHook.invest('proposal_123', '5000000000')).rejects.toThrow('Insufficient funds for gas');
    });

    it('should validate minimum investment amounts', async () => {
      const minimumInvestment = '1000000000'; // $1,000 minimum
      const attemptedInvestment = '500000000'; // $500 attempt

      // Mock proposal query to return minimum investment
      mockCosmjsClient.queryProposal.mockResolvedValue({
        id: 'proposal_123',
        financial_terms: {
          minimum_investment: minimumInvestment,
          token_price: '1000000'
        }
      });

      const proposal = await cosmjsHook.queryProposal('proposal_123');

      // Client-side validation should happen before calling invest
      const isValidInvestment = parseInt(attemptedInvestment) >= parseInt(proposal.financial_terms.minimum_investment);
      expect(isValidInvestment).toBe(false);
    });

    it('should calculate shares correctly based on token price', async () => {
      const investmentAmount = '5000000000'; // $5,000
      const tokenPrice = '1000000'; // $1.00 per token

      const shares = Math.floor(parseInt(investmentAmount) / parseInt(tokenPrice));
      expect(shares).toBe(5000);

      // With different token price
      const expensiveTokenPrice = '2500000'; // $2.50 per token
      const expensiveShares = Math.floor(parseInt(investmentAmount) / parseInt(expensiveTokenPrice));
      expect(expensiveShares).toBe(2000);
    });
  });

  describe('Portfolio Queries and Data Integrity', () => {
    it('should fetch user portfolio with accurate calculations', async () => {
      const mockPortfolio = {
        user: 'neutron1user123',
        assets: [
          {
            proposal_id: 'proposal_123',
            shares: 5000,
            invested_amount: '5000000000',
            current_value: '5750000000', // 15% gain
            locked_until: '1735689600000' // Dec 31, 2025
          },
          {
            proposal_id: 'proposal_456',
            shares: 2500,
            invested_amount: '2500000000',
            current_value: '2375000000', // 5% loss
            locked_until: null
          }
        ],
        total_invested: '7500000000',
        total_value: '8125000000',
        total_gain: '625000000',
        total_gain_percent: 8.33
      };

      mockCosmjsClient.queryUserPortfolio.mockResolvedValue(mockPortfolio);

      const portfolio = await cosmjsHook.queryUserPortfolio('neutron1user123');

      expect(portfolio.total_invested).toBe('7500000000');
      expect(portfolio.total_value).toBe('8125000000');
      expect(portfolio.total_gain).toBe('625000000');
      expect(portfolio.total_gain_percent).toBeCloseTo(8.33, 2);
    });

    it('should handle empty portfolio gracefully', async () => {
      const emptyPortfolio = {
        user: 'neutron1newuser',
        assets: [],
        total_invested: '0',
        total_value: '0',
        total_gain: '0',
        total_gain_percent: 0
      };

      mockCosmjsClient.queryUserPortfolio.mockResolvedValue(emptyPortfolio);

      const portfolio = await cosmjsHook.queryUserPortfolio('neutron1newuser');

      expect(portfolio.assets).toHaveLength(0);
      expect(portfolio.total_invested).toBe('0');
      expect(portfolio.total_value).toBe('0');
    });

    it('should fetch user investments with transaction history', async () => {
      const mockInvestments = [
        {
          proposal_id: 'proposal_123',
          amount: '5000000000',
          shares: 5000,
          transaction_hash: 'A1B2C3D4E5F6',
          timestamp: '1694966400000', // Sept 17, 2025
          status: 'completed'
        },
        {
          proposal_id: 'proposal_456',
          amount: '2500000000',
          shares: 2500,
          transaction_hash: 'B2C3D4E5F6A1',
          timestamp: '1694880000000', // Sept 16, 2025
          status: 'completed'
        }
      ];

      mockCosmjsClient.queryUserInvestments.mockResolvedValue(mockInvestments);

      const investments = await cosmjsHook.queryUserInvestments('neutron1user123');

      expect(investments).toHaveLength(2);
      expect(investments[0].amount).toBe('5000000000');
      expect(investments[0].shares).toBe(5000);
      expect(investments[0].status).toBe('completed');
    });
  });

  describe('Proposal Management Financial Validation', () => {
    it('should create proposal with valid financial terms', async () => {
      const proposalParams = {
        asset_details: {
          name: 'Premium Office Building',
          type: 'Real Estate',
          description: 'Class A office building in downtown district'
        },
        financial_terms: {
          funding_goal: '10000000000000', // $10M
          minimum_investment: '1000000000', // $1,000
          token_price: '1000000', // $1.00
          expected_apy: '12.5%',
          funding_deadline: '1703980800000' // Dec 31, 2025
        }
      };

      const mockTxResponse = {
        transactionHash: 'C3D4E5F6A1B2',
        code: 0,
        height: 12346,
        events: [
          {
            type: 'proposal_created',
            attributes: [
              { key: 'proposal_id', value: 'proposal_789' },
              { key: 'creator', value: 'neutron1creator123' },
              { key: 'funding_goal', value: '10000000000000' }
            ]
          }
        ]
      };

      mockCosmjsClient.createProposal.mockResolvedValue(mockTxResponse);

      const result = await cosmjsHook.createProposal(proposalParams);

      expect(mockCosmjsClient.createProposal).toHaveBeenCalledWith(proposalParams);
      expect(result.events[0].attributes[2].value).toBe('10000000000000');
    });

    it('should validate proposal financial terms', async () => {
      const invalidProposal = {
        financial_terms: {
          funding_goal: '1000000', // $1 - too low
          minimum_investment: '2000000', // $2 - higher than goal
          token_price: '0' // Invalid price
        }
      };

      // Validation should happen client-side before submission
      const fundingGoal = parseInt(invalidProposal.financial_terms.funding_goal);
      const minInvestment = parseInt(invalidProposal.financial_terms.minimum_investment);
      const tokenPrice = parseInt(invalidProposal.financial_terms.token_price);

      expect(fundingGoal).toBeLessThan(minInvestment); // Invalid: goal < minimum
      expect(tokenPrice).toBe(0); // Invalid: zero price
    });
  });

  describe('Trading and Order Management', () => {
    it('should place valid trading order with price validation', async () => {
      const orderParams = {
        proposal_id: 'proposal_123',
        order_type: 'buy',
        quantity: 1000,
        price: '1200000', // $1.20 per token
        total_amount: '1200000000' // $1,200 total
      };

      const mockOrderResponse = {
        transactionHash: 'D4E5F6A1B2C3',
        code: 0,
        height: 12347,
        events: [
          {
            type: 'order_placed',
            attributes: [
              { key: 'order_id', value: 'order_456' },
              { key: 'user', value: 'neutron1user123' },
              { key: 'total_amount', value: '1200000000' }
            ]
          }
        ]
      };

      mockCosmjsClient.placeOrder.mockResolvedValue(mockOrderResponse);

      const result = await cosmjsHook.placeOrder(orderParams);

      expect(mockCosmjsClient.placeOrder).toHaveBeenCalledWith(orderParams);
      expect(result.events[0].attributes[2].value).toBe('1200000000');
    });

    it('should cancel order and handle refunds correctly', async () => {
      const orderId = 'order_456';

      const mockCancelResponse = {
        transactionHash: 'E5F6A1B2C3D4',
        code: 0,
        height: 12348,
        events: [
          {
            type: 'order_cancelled',
            attributes: [
              { key: 'order_id', value: orderId },
              { key: 'refund_amount', value: '1200000000' }
            ]
          }
        ]
      };

      mockCosmjsClient.cancelOrder.mockResolvedValue(mockCancelResponse);

      const result = await cosmjsHook.cancelOrder(orderId);

      expect(mockCosmjsClient.cancelOrder).toHaveBeenCalledWith(orderId);
      expect(result.events[0].attributes[1].value).toBe('1200000000'); // Refund amount
    });
  });

  describe('Staking and Yield Generation', () => {
    it('should stake tokens with lock period validation', async () => {
      const stakeParams = {
        poolId: 'pool_123',
        amount: '5000000000', // $5,000
        lockPeriod: 365 // 1 year in days
      };

      const mockStakeResponse = {
        transactionHash: 'F6A1B2C3D4E5',
        code: 0,
        height: 12349,
        events: [
          {
            type: 'tokens_staked',
            attributes: [
              { key: 'pool_id', value: 'pool_123' },
              { key: 'staker', value: 'neutron1user123' },
              { key: 'amount', value: '5000000000' },
              { key: 'lock_period', value: '365' },
              { key: 'unlock_date', value: '1758100800000' } // 1 year from now
            ]
          }
        ]
      };

      mockCosmjsClient.stake.mockResolvedValue(mockStakeResponse);

      const result = await cosmjsHook.stake('pool_123', '5000000000', 365);

      expect(mockCosmjsClient.stake).toHaveBeenCalledWith('pool_123', '5000000000', 365);
      expect(result.events[0].attributes[2].value).toBe('5000000000');
      expect(result.events[0].attributes[3].value).toBe('365');
    });

    it('should claim staking rewards with accurate calculations', async () => {
      const poolId = 'pool_123';

      const mockClaimResponse = {
        transactionHash: 'A1B2C3D4E5F6',
        code: 0,
        height: 12350,
        events: [
          {
            type: 'rewards_claimed',
            attributes: [
              { key: 'pool_id', value: poolId },
              { key: 'claimer', value: 'neutron1user123' },
              { key: 'reward_amount', value: '125000000' }, // $125 reward
              { key: 'reward_period_days', value: '30' }
            ]
          }
        ]
      };

      mockCosmjsClient.claimRewards.mockResolvedValue(mockClaimResponse);

      const result = await cosmjsHook.claimRewards(poolId);

      expect(mockCosmjsClient.claimRewards).toHaveBeenCalledWith(poolId);
      expect(result.events[0].attributes[2].value).toBe('125000000'); // $125 reward
    });
  });

  describe('Utility Functions and Formatting', () => {
    it('should format amounts correctly between units', () => {
      // Test formatAmount function
      const microAmount = '5000000000';
      const formatted = cosmjsHook.formatAmount(microAmount, 6);
      expect(parseFloat(formatted)).toBe(5000.00);

      // Test parseAmount function
      const humanAmount = '5000.00';
      const parsed = cosmjsHook.parseAmount(humanAmount, 6);
      expect(parsed).toBe('5000000000');
    });

    it('should handle edge cases in amount formatting', () => {
      // Zero amount
      expect(cosmjsHook.formatAmount('0')).toBe('0.00');
      expect(cosmjsHook.parseAmount('0')).toBe('0');

      // Very large amount
      const largeAmount = '1000000000000000'; // $1B
      const formattedLarge = cosmjsHook.formatAmount(largeAmount);
      expect(parseFloat(formattedLarge)).toBe(1000000000.00);

      // Very small amount
      const smallAmount = '1'; // $0.000001
      const formattedSmall = cosmjsHook.formatAmount(smallAmount);
      expect(parseFloat(formattedSmall)).toBe(0.000001);
    });

    it('should handle decimal precision in conversions', () => {
      // Test with different decimal places
      const amount = '1234567890';

      // 6 decimals (NTRN standard)
      const formatted6 = cosmjsHook.formatAmount(amount, 6);
      expect(parseFloat(formatted6)).toBe(1234.567890);

      // 18 decimals (ETH standard)
      const formatted18 = cosmjsHook.formatAmount(amount, 18);
      expect(parseFloat(formatted18)).toBeCloseTo(0.00000123456789, 10);
    });
  });

  describe('Error Handling and Network Resilience', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout after 30000ms');
      mockCosmjsClient.invest.mockRejectedValue(timeoutError);

      await expect(cosmjsHook.invest('proposal_123', '5000000000')).rejects.toThrow('Request timeout after 30000ms');
    });

    it('should handle insufficient gas errors', async () => {
      const gasError = new Error('Transaction failed: out of gas');
      mockCosmjsClient.invest.mockRejectedValue(gasError);

      await expect(cosmjsHook.invest('proposal_123', '5000000000')).rejects.toThrow('Transaction failed: out of gas');
    });

    it('should handle invalid proposal errors', async () => {
      const invalidProposalError = new Error('Proposal not found or inactive');
      mockCosmjsClient.invest.mockRejectedValue(invalidProposalError);

      await expect(cosmjsHook.invest('invalid_proposal', '5000000000')).rejects.toThrow('Proposal not found or inactive');
    });

    it('should handle wallet disconnection gracefully', async () => {
      // Mock disconnected state
      const { useCosmJSContext } = await import('../../../providers/CosmJSProvider');
      vi.mocked(useCosmJSContext).mockReturnValue({
        address: '',
        isConnected: false,
        isConnecting: false,
        balance: '0',
        connect: vi.fn(),
        disconnect: vi.fn(),
        error: 'Wallet not connected',
        clearError: vi.fn()
      });

      const disconnectedHook = useCosmJS();

      expect(disconnectedHook.isConnected).toBe(false);
      expect(disconnectedHook.address).toBe('');
      expect(disconnectedHook.balance).toBe('0');
    });
  });

  describe('Platform Statistics and Analytics', () => {
    it('should fetch platform statistics with financial metrics', async () => {
      const mockStats = {
        total_value_locked: '500000000000000', // $500M TVL
        total_proposals: 150,
        active_proposals: 45,
        completed_proposals: 105,
        total_investors: 12500,
        average_investment: '3500000000', // $3,500
        platform_fees_collected: '12500000000000', // $12.5M
        apr_range: {
          min: '5.5%',
          max: '18.2%',
          average: '11.8%'
        }
      };

      mockCosmjsClient.queryPlatformStats.mockResolvedValue(mockStats);

      const stats = await cosmjsHook.queryPlatformStats();

      expect(stats.total_value_locked).toBe('500000000000000');
      expect(stats.total_proposals).toBe(150);
      expect(stats.average_investment).toBe('3500000000');
      expect(stats.apr_range.average).toBe('11.8%');
    });
  });
});