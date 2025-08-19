import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { useAuthStore } from '../../../store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { useAnalyticsStore } from '../../../store/analyticsStore';

// Test component that demonstrates cross-store data synchronization
const CrossStoreDataSyncTest = () => {
  const { 
    portfolio, 
    totalValue, 
    addInvestment, 
    removeInvestment,
    updatePortfolioMetrics 
  } = usePortfolioStore();
  
  const { 
    user, 
    isAuthenticated,
    updateUserProfile 
  } = useAuthStore();
  
  const { 
    notifications, 
    addNotification,
    markAsRead 
  } = useNotificationStore();
  
  const { 
    updateInvestmentMetrics,
    recordUserAction,
    generateInsights 
  } = useAnalyticsStore();

  const handleInvestment = async (proposalId: string, amount: number) => {
    try {
      // Add investment to portfolio
      await addInvestment({
        id: `inv-${Date.now()}`,
        proposalId,
        amount: { amount: amount.toString(), denom: 'untrn' },
        shares: amount / 100, // Simple share calculation
        timestamp: new Date().toISOString(),
        status: 'active'
      });

      // Update user profile investment count
      if (user) {
        await updateUserProfile({
          ...user,
          totalInvestments: (user.totalInvestments || 0) + 1,
          totalInvested: {
            amount: (parseInt(user.totalInvested?.amount || '0') + amount).toString(),
            denom: 'untrn'
          }
        });
      }

      // Add success notification
      await addNotification({
        id: `notif-${Date.now()}`,
        type: 'success',
        title: 'Investment Successful',
        message: `Successfully invested ${amount} NTRN in proposal ${proposalId}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        userId: user?.id || 'unknown'
      });

      // Record analytics
      await recordUserAction({
        action: 'investment_created',
        userId: user?.id || 'unknown',
        metadata: {
          proposalId,
          amount,
          timestamp: new Date().toISOString()
        }
      });

      // Update investment metrics
      await updateInvestmentMetrics({
        totalInvestments: portfolio.length + 1,
        totalValue: totalValue + amount,
        averageInvestment: (totalValue + amount) / (portfolio.length + 1)
      });

    } catch (error) {
      // Add error notification
      await addNotification({
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Investment Failed',
        message: 'Failed to process investment. Please try again.',
        timestamp: new Date().toISOString(),
        isRead: false,
        userId: user?.id || 'unknown'
      });
    }
  };

  const handleWithdrawal = async (investmentId: string) => {
    const investment = portfolio.find(inv => inv.id === investmentId);
    if (!investment) return;

    try {
      // Remove from portfolio
      await removeInvestment(investmentId);

      // Update user profile
      if (user) {
        await updateUserProfile({
          ...user,
          totalInvestments: Math.max((user.totalInvestments || 0) - 1, 0),
          totalInvested: {
            amount: Math.max(parseInt(user.totalInvested?.amount || '0') - parseInt(investment.amount.amount), 0).toString(),
            denom: 'untrn'
          }
        });
      }

      // Add notification
      await addNotification({
        id: `withdraw-${Date.now()}`,
        type: 'info',
        title: 'Withdrawal Processed',
        message: `Withdrew ${investment.amount.amount} NTRN from investment`,
        timestamp: new Date().toISOString(),
        isRead: false,
        userId: user?.id || 'unknown'
      });

      // Record analytics
      await recordUserAction({
        action: 'investment_withdrawn',
        userId: user?.id || 'unknown',
        metadata: {
          investmentId,
          amount: investment.amount.amount,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      await addNotification({
        id: `withdraw-error-${Date.now()}`,
        type: 'error',
        title: 'Withdrawal Failed',
        message: 'Failed to process withdrawal. Please try again.',
        timestamp: new Date().toISOString(),
        isRead: false,
        userId: user?.id || 'unknown'
      });
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Cross-Store Data Sync Test</h1>
      
      <div data-testid="user-info">
        <h2>User: {user?.address}</h2>
        <p>Total Investments: {user?.totalInvestments || 0}</p>
        <p>Total Invested: {user?.totalInvested?.amount || '0'} NTRN</p>
      </div>

      <div data-testid="portfolio-info">
        <h2>Portfolio</h2>
        <p>Portfolio Size: {portfolio.length}</p>
        <p>Total Value: {totalValue} NTRN</p>
        {portfolio.map(investment => (
          <div key={investment.id} data-testid={`investment-${investment.id}`}>
            <span>Proposal: {investment.proposalId}</span>
            <span>Amount: {investment.amount.amount} NTRN</span>
            <button onClick={() => handleWithdrawal(investment.id)}>
              Withdraw
            </button>
          </div>
        ))}
      </div>

      <div data-testid="notifications">
        <h2>Notifications ({notifications.filter(n => !n.isRead).length} unread)</h2>
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            data-testid={`notification-${notification.id}`}
            className={notification.isRead ? 'read' : 'unread'}
          >
            <strong>{notification.title}</strong>: {notification.message}
            {!notification.isRead && (
              <button onClick={() => markAsRead(notification.id)}>
                Mark as Read
              </button>
            )}
          </div>
        ))}
      </div>

      <div data-testid="actions">
        <button onClick={() => handleInvestment('proposal-1', 1000)}>
          Invest 1000 NTRN in Proposal 1
        </button>
        <button onClick={() => handleInvestment('proposal-2', 2000)}>
          Invest 2000 NTRN in Proposal 2
        </button>
      </div>
    </div>
  );
};

// Mock all the stores
vi.mock('../../../store/portfolioStore');
vi.mock('../../../store/authStore');
vi.mock('../../../store/notificationStore');
vi.mock('../../../store/analyticsStore');

const mockPortfolioStore = {
  portfolio: [
    {
      id: 'inv-1',
      proposalId: 'proposal-test',
      amount: { amount: '5000', denom: 'untrn' },
      shares: 50,
      timestamp: new Date().toISOString(),
      status: 'active'
    }
  ],
  totalValue: 5000,
  addInvestment: vi.fn(),
  removeInvestment: vi.fn(),
  updatePortfolioMetrics: vi.fn(),
};

const mockAuthStore = {
  user: {
    id: 'user-123',
    address: 'cosmos1test123',
    totalInvestments: 1,
    totalInvested: { amount: '5000', denom: 'untrn' }
  },
  isAuthenticated: true,
  updateUserProfile: vi.fn(),
};

const mockNotificationStore = {
  notifications: [
    {
      id: 'notif-1',
      type: 'info',
      title: 'Welcome',
      message: 'Welcome to the platform',
      timestamp: new Date().toISOString(),
      isRead: false,
      userId: 'user-123'
    }
  ],
  addNotification: vi.fn(),
  markAsRead: vi.fn(),
};

const mockAnalyticsStore = {
  updateInvestmentMetrics: vi.fn(),
  recordUserAction: vi.fn(),
  generateInsights: vi.fn(),
};

describe('CrossStoreDataSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePortfolioStore as any).mockReturnValue(mockPortfolioStore);
    (useAuthStore as any).mockReturnValue(mockAuthStore);
    (useNotificationStore as any).mockReturnValue(mockNotificationStore);
    (useAnalyticsStore as any).mockReturnValue(mockAnalyticsStore);
  });

  it('should display synchronized data from multiple stores', async () => {
    await act(async () => {
      render(<CrossStoreDataSyncTest />);
    });

    expect(screen.getByText('User: cosmos1test123')).toBeInTheDocument();
    expect(screen.getByText('Total Investments: 1')).toBeInTheDocument();
    expect(screen.getByText('Total Invested: 5000 NTRN')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Size: 1')).toBeInTheDocument();
    expect(screen.getByText('Total Value: 5000 NTRN')).toBeInTheDocument();
    expect(screen.getByText('Notifications (1 unread)')).toBeInTheDocument();
  });

  it('should synchronize data across stores when making investment', async () => {
    // Mock successful responses
    mockPortfolioStore.addInvestment.mockResolvedValue(undefined);
    mockAuthStore.updateUserProfile.mockResolvedValue(undefined);
    mockNotificationStore.addNotification.mockResolvedValue(undefined);
    mockAnalyticsStore.recordUserAction.mockResolvedValue(undefined);
    mockAnalyticsStore.updateInvestmentMetrics.mockResolvedValue(undefined);

    await act(async () => {
      render(<CrossStoreDataSyncTest />);
    });

    const investButton = screen.getByText('Invest 1000 NTRN in Proposal 1');
    await act(async () => {
      fireEvent.click(investButton);
    });

    // Wait for all async operations
    await waitFor(() => {
      expect(mockPortfolioStore.addInvestment).toHaveBeenCalledWith({
        id: expect.stringMatching(/^inv-\d+$/),
        proposalId: 'proposal-1',
        amount: { amount: '1000', denom: 'untrn' },
        shares: 10,
        timestamp: expect.any(String),
        status: 'active'
      });
    });

    expect(mockAuthStore.updateUserProfile).toHaveBeenCalledWith({
      id: 'user-123',
      address: 'cosmos1test123',
      totalInvestments: 2,
      totalInvested: { amount: '6000', denom: 'untrn' }
    });

    expect(mockNotificationStore.addNotification).toHaveBeenCalledWith({
      id: expect.stringMatching(/^notif-\d+$/),
      type: 'success',
      title: 'Investment Successful',
      message: 'Successfully invested 1000 NTRN in proposal proposal-1',
      timestamp: expect.any(String),
      isRead: false,
      userId: 'user-123'
    });

    expect(mockAnalyticsStore.recordUserAction).toHaveBeenCalledWith({
      action: 'investment_created',
      userId: 'user-123',
      metadata: {
        proposalId: 'proposal-1',
        amount: 1000,
        timestamp: expect.any(String)
      }
    });

    expect(mockAnalyticsStore.updateInvestmentMetrics).toHaveBeenCalledWith({
      totalInvestments: 2,
      totalValue: 6000,
      averageInvestment: 3000
    });
  });

  it('should handle withdrawal and sync across stores', async () => {
    mockPortfolioStore.removeInvestment.mockResolvedValue(undefined);
    mockAuthStore.updateUserProfile.mockResolvedValue(undefined);
    mockNotificationStore.addNotification.mockResolvedValue(undefined);
    mockAnalyticsStore.recordUserAction.mockResolvedValue(undefined);

    await act(async () => {
      render(<CrossStoreDataSyncTest />);
    });

    const withdrawButton = screen.getByText('Withdraw');
    await act(async () => {
      fireEvent.click(withdrawButton);
    });

    await waitFor(() => {
      expect(mockPortfolioStore.removeInvestment).toHaveBeenCalledWith('inv-1');
    });

    expect(mockAuthStore.updateUserProfile).toHaveBeenCalledWith({
      id: 'user-123',
      address: 'cosmos1test123',
      totalInvestments: 0,
      totalInvested: { amount: '0', denom: 'untrn' }
    });

    expect(mockNotificationStore.addNotification).toHaveBeenCalledWith({
      id: expect.stringMatching(/^withdraw-\d+$/),
      type: 'info',
      title: 'Withdrawal Processed',
      message: 'Withdrew 5000 NTRN from investment',
      timestamp: expect.any(String),
      isRead: false,
      userId: 'user-123'
    });

    expect(mockAnalyticsStore.recordUserAction).toHaveBeenCalledWith({
      action: 'investment_withdrawn',
      userId: 'user-123',
      metadata: {
        investmentId: 'inv-1',
        amount: '5000',
        timestamp: expect.any(String)
      }
    });
  });

  it('should handle errors and show error notifications', async () => {
    mockPortfolioStore.addInvestment.mockRejectedValue(new Error('Network error'));
    mockNotificationStore.addNotification.mockResolvedValue(undefined);

    await act(async () => {
      render(<CrossStoreDataSyncTest />);
    });

    const investButton = screen.getByText('Invest 1000 NTRN in Proposal 1');
    await act(async () => {
      fireEvent.click(investButton);
    });

    await waitFor(() => {
      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith({
        id: expect.stringMatching(/^error-\d+$/),
        type: 'error',
        title: 'Investment Failed',
        message: 'Failed to process investment. Please try again.',
        timestamp: expect.any(String),
        isRead: false,
        userId: 'user-123'
      });
    });
  });

  it('should mark notifications as read and update UI', async () => {
    await act(async () => {
      render(<CrossStoreDataSyncTest />);
    });

    const markReadButton = screen.getByText('Mark as Read');
    await act(async () => {
      fireEvent.click(markReadButton);
    });

    expect(mockNotificationStore.markAsRead).toHaveBeenCalledWith('notif-1');
  });

  it('should handle unauthenticated state', async () => {
    mockAuthStore.isAuthenticated = false;

    await act(async () => {
      render(<CrossStoreDataSyncTest />);
    });

    expect(screen.getByText('Please log in')).toBeInTheDocument();
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });

  it('should display correct unread notification count', async () => {
    mockNotificationStore.notifications = [
      ...mockNotificationStore.notifications,
      {
        id: 'notif-2',
        type: 'success',
        title: 'Test',
        message: 'Test message',
        timestamp: new Date().toISOString(),
        isRead: true,
        userId: 'user-123'
      }
    ];

    await act(async () => {
      render(<CrossStoreDataSyncTest />);
    });

    expect(screen.getByText('Notifications (1 unread)')).toBeInTheDocument();
  });

  it('should handle multiple simultaneous operations', async () => {
    mockPortfolioStore.addInvestment.mockResolvedValue(undefined);
    mockAuthStore.updateUserProfile.mockResolvedValue(undefined);
    mockNotificationStore.addNotification.mockResolvedValue(undefined);
    mockAnalyticsStore.recordUserAction.mockResolvedValue(undefined);
    mockAnalyticsStore.updateInvestmentMetrics.mockResolvedValue(undefined);

    await act(async () => {
      render(<CrossStoreDataSyncTest />);
    });

    const invest1Button = screen.getByText('Invest 1000 NTRN in Proposal 1');
    const invest2Button = screen.getByText('Invest 2000 NTRN in Proposal 2');

    // Trigger both investments simultaneously
    await act(async () => {
      fireEvent.click(invest1Button);
      fireEvent.click(invest2Button);
    });

    await waitFor(() => {
      expect(mockPortfolioStore.addInvestment).toHaveBeenCalledTimes(2);
      expect(mockAuthStore.updateUserProfile).toHaveBeenCalledTimes(2);
      expect(mockNotificationStore.addNotification).toHaveBeenCalledTimes(2);
      expect(mockAnalyticsStore.recordUserAction).toHaveBeenCalledTimes(2);
    });
  });

  it('should maintain data consistency during partial failures', async () => {
    // Portfolio update succeeds, but user profile update fails
    mockPortfolioStore.addInvestment.mockResolvedValue(undefined);
    mockAuthStore.updateUserProfile.mockRejectedValue(new Error('Profile update failed'));
    mockNotificationStore.addNotification.mockResolvedValue(undefined);

    await act(async () => {
      render(<CrossStoreDataSyncTest />);
    });

    const investButton = screen.getByText('Invest 1000 NTRN in Proposal 1');
    await act(async () => {
      fireEvent.click(investButton);
    });

    // Should still show error notification even if portfolio update succeeded
    await waitFor(() => {
      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Investment Failed'
        })
      );
    });
  });
});