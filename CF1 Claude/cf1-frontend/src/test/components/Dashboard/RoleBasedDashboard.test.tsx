import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { useEnhancedDashboardStore } from '../../../store/enhancedDashboardStore';
import { useSessionStore } from '../../../store/sessionStore';
import { renderWithAuthenticatedAdmin, renderWithConnectedWallet } from '../../test-utils';

// Mock components for role-specific widgets
const MockCreatorAnalyticsWidget = ({ size, isEditMode }: any) => (
  <div data-testid="creator-analytics-widget" data-size={size} data-edit-mode={isEditMode}>
    Creator Analytics Widget
  </div>
);

const MockInvestorRecommendationsWidget = ({ size, isEditMode }: any) => (
  <div data-testid="investor-recommendations-widget" data-size={size} data-edit-mode={isEditMode}>
    Investor Recommendations Widget
  </div>
);

const MockAdminFeatureTogglesWidget = ({ size, isEditMode }: any) => (
  <div data-testid="admin-feature-toggles-widget" data-size={size} data-edit-mode={isEditMode}>
    Admin Feature Toggles Widget
  </div>
);

// Create a test component that simulates role-based dashboard
const RoleBasedDashboard = () => {
  const { widgets, currentRole, isEditMode, toggleEditMode } = useEnhancedDashboardStore();
  const { currentSession } = useSessionStore();

  const roleBasedWidgets = widgets.filter(widget => 
    widget.allowedRoles.includes(currentRole || 'investor')
  );

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'creatorAnalytics':
        return <MockCreatorAnalyticsWidget size={widget.size} isEditMode={isEditMode} />;
      case 'investorRecommendations':
        return <MockInvestorRecommendationsWidget size={widget.size} isEditMode={isEditMode} />;
      case 'adminFeatureToggles':
        return <MockAdminFeatureTogglesWidget size={widget.size} isEditMode={isEditMode} />;
      default:
        return <div data-testid={`${widget.type}-widget`}>{widget.type} Widget</div>;
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard - {currentRole} View</h1>
        <button onClick={toggleEditMode}>
          {isEditMode ? 'Exit Edit Mode' : 'Edit Dashboard'}
        </button>
      </div>
      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roleBasedWidgets.map(widget => (
          <div key={widget.id} className="widget-container">
            {renderWidget(widget)}
          </div>
        ))}
      </div>
      {roleBasedWidgets.length === 0 && (
        <div>No widgets available for {currentRole} role</div>
      )}
    </div>
  );
};

// Mock the stores
vi.mock('../../../store/enhancedDashboardStore');
vi.mock('../../../store/sessionStore');

const mockEnhancedDashboardStore = {
  widgets: [
    {
      id: '1',
      type: 'marketplace',
      size: 'medium',
      position: 0,
      isVisible: true,
      allowedRoles: ['investor', 'creator', 'admin']
    },
    {
      id: '2',
      type: 'creatorAnalytics',
      size: 'large',
      position: 1,
      isVisible: true,
      allowedRoles: ['creator']
    },
    {
      id: '3',
      type: 'investorRecommendations',
      size: 'medium',
      position: 2,
      isVisible: true,
      allowedRoles: ['investor']
    },
    {
      id: '4',
      type: 'adminFeatureToggles',
      size: 'large',
      position: 3,
      isVisible: true,
      allowedRoles: ['admin']
    },
    {
      id: '5',
      type: 'creatorAssets',
      size: 'medium',
      position: 4,
      isVisible: true,
      allowedRoles: ['creator']
    },
    {
      id: '6',
      type: 'investorPerformance',
      size: 'large',
      position: 5,
      isVisible: true,
      allowedRoles: ['investor']
    }
  ],
  currentRole: 'investor',
  isEditMode: false,
  roleBasedMetrics: {
    investor: {
      portfolioValue: 50000,
      totalReturns: 12.5,
      avgAPY: 8.2,
      assetsCount: 7,
      recentActivity: []
    },
    creator: {
      totalProposals: 5,
      totalRaised: 250000,
      avgFundingRate: 85.5,
      activeCampaigns: 2,
      recentActivity: []
    },
    admin: {
      totalUsers: 1250,
      totalVolume: 2500000,
      systemHealth: 98.5,
      activeIssues: 2,
      recentActivity: []
    }
  },
  toggleEditMode: vi.fn(),
  updateRoleMetrics: vi.fn(),
  switchRole: vi.fn(),
  loadDashboardForRole: vi.fn(),
};

const mockSessionStore = {
  currentSession: {
    address: 'cosmos1test123',
    role: 'investor',
    permissions: ['view_proposals', 'create_investments'],
    isActive: true
  },
  switchRole: vi.fn(),
};

describe('RoleBasedDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useEnhancedDashboardStore as any).mockReturnValue(mockEnhancedDashboardStore);
    (useSessionStore as any).mockReturnValue(mockSessionStore);
  });

  describe('Investor Dashboard', () => {
    beforeEach(() => {
      mockEnhancedDashboardStore.currentRole = 'investor';
      mockSessionStore.currentSession.role = 'investor';
    });

    it('should render investor-specific widgets only', async () => {
      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      expect(screen.getByText('Dashboard - investor View')).toBeInTheDocument();
      expect(screen.getByTestId('marketplace-widget')).toBeInTheDocument();
      expect(screen.getByTestId('investor-recommendations-widget')).toBeInTheDocument();
      expect(screen.getByTestId('investor-performance-widget')).toBeInTheDocument();
      
      // Should not show creator or admin widgets
      expect(screen.queryByTestId('creator-analytics-widget')).not.toBeInTheDocument();
      expect(screen.queryByTestId('admin-feature-toggles-widget')).not.toBeInTheDocument();
    });

    it('should display investor metrics correctly', async () => {
      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      // Portfolio metrics should be available to investor widgets
      expect(screen.getByTestId('investor-recommendations-widget')).toBeInTheDocument();
      expect(screen.getByTestId('investor-performance-widget')).toBeInTheDocument();
    });

    it('should allow switching to edit mode', async () => {
      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      const editButton = screen.getByText('Edit Dashboard');
      await act(async () => {
        fireEvent.click(editButton);
      });

      expect(mockEnhancedDashboardStore.toggleEditMode).toHaveBeenCalledOnce();
    });
  });

  describe('Creator Dashboard', () => {
    beforeEach(() => {
      mockEnhancedDashboardStore.currentRole = 'creator';
      mockSessionStore.currentSession.role = 'creator';
    });

    it('should render creator-specific widgets only', async () => {
      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      expect(screen.getByText('Dashboard - creator View')).toBeInTheDocument();
      expect(screen.getByTestId('marketplace-widget')).toBeInTheDocument();
      expect(screen.getByTestId('creator-analytics-widget')).toBeInTheDocument();
      expect(screen.getByTestId('creator-assets-widget')).toBeInTheDocument();
      
      // Should not show investor or admin widgets
      expect(screen.queryByTestId('investor-recommendations-widget')).not.toBeInTheDocument();
      expect(screen.queryByTestId('admin-feature-toggles-widget')).not.toBeInTheDocument();
    });

    it('should display creator metrics correctly', async () => {
      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      expect(screen.getByTestId('creator-analytics-widget')).toBeInTheDocument();
      expect(screen.getByTestId('creator-assets-widget')).toBeInTheDocument();
    });
  });

  describe('Admin Dashboard', () => {
    beforeEach(() => {
      mockEnhancedDashboardStore.currentRole = 'admin';
      mockSessionStore.currentSession.role = 'admin';
    });

    it('should render admin-specific widgets', async () => {
      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      expect(screen.getByText('Dashboard - admin View')).toBeInTheDocument();
      expect(screen.getByTestId('marketplace-widget')).toBeInTheDocument();
      expect(screen.getByTestId('admin-feature-toggles-widget')).toBeInTheDocument();
      
      // Should not show investor or creator specific widgets
      expect(screen.queryByTestId('investor-recommendations-widget')).not.toBeInTheDocument();
      expect(screen.queryByTestId('creator-analytics-widget')).not.toBeInTheDocument();
    });

    it('should display admin metrics correctly', async () => {
      await act(async () => {
        render(<RoleBaseDashboard />);
      });

      expect(screen.getByTestId('admin-feature-toggles-widget')).toBeInTheDocument();
    });
  });

  describe('Dynamic Widget Loading', () => {
    it('should load widgets based on role changes', async () => {
      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      // Start as investor
      expect(screen.getByTestId('investor-recommendations-widget')).toBeInTheDocument();

      // Change to creator role
      mockEnhancedDashboardStore.currentRole = 'creator';
      mockSessionStore.currentSession.role = 'creator';

      await act(async () => {
        // Simulate re-render with new role
        render(<RoleBasedDashboard />);
      });

      expect(screen.getByTestId('creator-analytics-widget')).toBeInTheDocument();
      expect(screen.queryByTestId('investor-recommendations-widget')).not.toBeInTheDocument();
    });

    it('should handle empty widget state for unsupported roles', async () => {
      mockEnhancedDashboardStore.currentRole = 'unsupported_role';
      mockEnhancedDashboardStore.widgets = mockEnhancedDashboardStore.widgets.filter(
        widget => !widget.allowedRoles.includes('unsupported_role')
      );

      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      expect(screen.getByText('No widgets available for unsupported_role role')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should apply responsive grid classes', async () => {
      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      const dashboardGrid = document.querySelector('.dashboard-grid');
      expect(dashboardGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should handle mobile viewport constraints', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      const dashboardGrid = document.querySelector('.dashboard-grid');
      expect(dashboardGrid).toHaveClass('grid-cols-1');
    });
  });

  describe('Real-time Data Updates', () => {
    it('should update metrics when role data changes', async () => {
      const { rerender } = await act(async () => {
        return render(<RoleBasedDashboard />);
      });

      // Update metrics
      mockEnhancedDashboardStore.roleBasedMetrics.investor.portfolioValue = 60000;

      await act(async () => {
        rerender(<RoleBasedDashboard />);
      });

      expect(mockEnhancedDashboardStore.updateRoleMetrics).toHaveBeenCalled();
    });

    it('should handle data loading states', async () => {
      mockEnhancedDashboardStore.isLoading = true;

      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      // Should show loading indicators or skeleton components
      expect(screen.getByTestId('marketplace-widget')).toBeInTheDocument();
    });
  });

  describe('Widget Interactions', () => {
    it('should pass edit mode to all widgets', async () => {
      mockEnhancedDashboardStore.isEditMode = true;

      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      const widgets = screen.getAllByTestId(/-widget$/);
      widgets.forEach(widget => {
        expect(widget).toHaveAttribute('data-edit-mode', 'true');
      });
    });

    it('should maintain widget size consistency', async () => {
      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      const widgets = screen.getAllByTestId(/-widget$/);
      widgets.forEach(widget => {
        expect(widget).toHaveAttribute('data-size');
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should only render visible widgets', async () => {
      mockEnhancedDashboardStore.widgets = mockEnhancedDashboardStore.widgets.map(widget => ({
        ...widget,
        isVisible: widget.id === '1' // Only first widget visible
      }));

      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      expect(screen.getByTestId('marketplace-widget')).toBeInTheDocument();
      expect(screen.getAllByTestId(/-widget$/)).toHaveLength(1);
    });

    it('should handle large numbers of widgets efficiently', async () => {
      const manyWidgets = Array.from({ length: 20 }, (_, i) => ({
        id: `widget-${i}`,
        type: 'marketplace',
        size: 'medium',
        position: i,
        isVisible: true,
        allowedRoles: ['investor']
      }));

      mockEnhancedDashboardStore.widgets = manyWidgets;

      await act(async () => {
        render(<RoleBasedDashboard />);
      });

      expect(screen.getAllByTestId('marketplace-widget')).toHaveLength(20);
    });
  });
});