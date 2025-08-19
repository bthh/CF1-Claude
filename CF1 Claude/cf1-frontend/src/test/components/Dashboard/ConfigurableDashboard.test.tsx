import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import ConfigurableDashboard from '../../../components/Dashboard/ConfigurableDashboard';
import { useDashboardStore } from '../../../store/dashboardStore';
import { renderWithAuthenticatedAdmin } from '../../test-utils';

// Mock the dashboard store
vi.mock('../../../store/dashboardStore');

// Mock all widget components
vi.mock('../../../components/Dashboard/MarketplaceWidget', () => ({
  default: ({ size, isEditMode }: any) => (
    <div data-testid="marketplace-widget" data-size={size} data-edit-mode={isEditMode}>
      Marketplace Widget
    </div>
  )
}));

vi.mock('../../../components/Dashboard/LaunchpadWidget', () => ({
  default: ({ size, isEditMode }: any) => (
    <div data-testid="launchpad-widget" data-size={size} data-edit-mode={isEditMode}>
      Launchpad Widget
    </div>
  )
}));

vi.mock('../../../components/Dashboard/GovernanceWidget', () => ({
  default: ({ size, isEditMode }: any) => (
    <div data-testid="governance-widget" data-size={size} data-edit-mode={isEditMode}>
      Governance Widget
    </div>
  )
}));

vi.mock('../../../components/Dashboard/PortfolioWidget', () => ({
  default: ({ size, isEditMode }: any) => (
    <div data-testid="portfolio-widget" data-size={size} data-edit-mode={isEditMode}>
      Portfolio Widget
    </div>
  )
}));

vi.mock('../../../components/Dashboard/AnalyticsWidget', () => ({
  default: ({ size, isEditMode }: any) => (
    <div data-testid="analytics-widget" data-size={size} data-edit-mode={isEditMode}>
      Analytics Widget
    </div>
  )
}));

vi.mock('../../../components/Dashboard/ActivityWidget', () => ({
  default: ({ size, isEditMode }: any) => (
    <div data-testid="activity-widget" data-size={size} data-edit-mode={isEditMode}>
      Activity Widget
    </div>
  )
}));

vi.mock('../../../components/Dashboard/QuickActionsWidget', () => ({
  default: ({ size, isEditMode }: any) => (
    <div data-testid="quickactions-widget" data-size={size} data-edit-mode={isEditMode}>
      Quick Actions Widget
    </div>
  )
}));

vi.mock('../../../components/Dashboard/NotificationsWidget', () => ({
  default: ({ size, isEditMode }: any) => (
    <div data-testid="notifications-widget" data-size={size} data-edit-mode={isEditMode}>
      Notifications Widget
    </div>
  )
}));

vi.mock('../../../components/Dashboard/ProfileWidget', () => ({
  default: ({ size, isEditMode }: any) => (
    <div data-testid="profile-widget" data-size={size} data-edit-mode={isEditMode}>
      Profile Widget
    </div>
  )
}));

vi.mock('../../../components/Dashboard/SpotlightWidget', () => ({
  default: ({ size, isEditMode }: any) => (
    <div data-testid="spotlight-widget" data-size={size} data-edit-mode={isEditMode}>
      Spotlight Widget
    </div>
  )
}));

const mockDashboardStore = {
  widgets: [
    {
      id: '1',
      type: 'marketplace',
      size: 'medium',
      position: 0,
      isVisible: true
    },
    {
      id: '2',
      type: 'launchpad',
      size: 'medium',
      position: 1,
      isVisible: true
    },
    {
      id: '3',
      type: 'portfolio',
      size: 'large',
      position: 2,
      isVisible: false
    },
    {
      id: '4',
      type: 'analytics',
      size: 'small',
      position: 3,
      isVisible: true
    }
  ],
  isEditMode: false,
  toggleEditMode: vi.fn(),
  addWidget: vi.fn(),
  removeWidget: vi.fn(),
  toggleWidgetVisibility: vi.fn(),
  resizeWidget: vi.fn(),
  reorderWidgets: vi.fn(),
  resetToDefault: vi.fn(),
};

describe('ConfigurableDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useDashboardStore as any).mockReturnValue(mockDashboardStore);
  });

  it('should render dashboard with visible widgets only', async () => {
    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    expect(screen.getByTestId('marketplace-widget')).toBeInTheDocument();
    expect(screen.getByTestId('launchpad-widget')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-widget')).toBeInTheDocument();
    expect(screen.queryByTestId('portfolio-widget')).not.toBeInTheDocument();
  });

  it('should pass consistent medium size to all widgets', async () => {
    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    const marketplaceWidget = screen.getByTestId('marketplace-widget');
    const launchpadWidget = screen.getByTestId('launchpad-widget');
    const analyticsWidget = screen.getByTestId('analytics-widget');

    expect(marketplaceWidget).toHaveAttribute('data-size', 'medium');
    expect(launchpadWidget).toHaveAttribute('data-size', 'medium');
    expect(analyticsWidget).toHaveAttribute('data-size', 'medium');
  });

  it('should pass edit mode to widgets correctly', async () => {
    mockDashboardStore.isEditMode = true;

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    const widgets = screen.getAllByTestId(/-widget$/);
    widgets.forEach(widget => {
      expect(widget).toHaveAttribute('data-edit-mode', 'true');
    });
  });

  it('should show edit mode controls when in edit mode', async () => {
    mockDashboardStore.isEditMode = true;

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    expect(screen.getByText('Exit Edit Mode')).toBeInTheDocument();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
    expect(screen.getByText('Reset to Default')).toBeInTheDocument();
  });

  it('should toggle edit mode when edit button is clicked', async () => {
    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    const editButton = screen.getByText('Edit Dashboard');
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(mockDashboardStore.toggleEditMode).toHaveBeenCalledOnce();
  });

  it('should show widget management controls in edit mode', async () => {
    mockDashboardStore.isEditMode = true;

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    // Should show visibility toggles, remove buttons, and resize controls
    expect(screen.getAllByRole('button', { name: /hide|show/i })).toHaveLength(3); // For visible widgets
    expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: /resize/i })).toHaveLength(3);
  });

  it('should toggle widget visibility', async () => {
    mockDashboardStore.isEditMode = true;

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    const hideButtons = screen.getAllByRole('button', { name: /hide/i });
    if (hideButtons.length > 0) {
      await act(async () => {
        fireEvent.click(hideButtons[0]);
      });

      expect(mockDashboardStore.toggleWidgetVisibility).toHaveBeenCalledWith('1');
    }
  });

  it('should remove widget when remove button is clicked', async () => {
    mockDashboardStore.isEditMode = true;

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    if (removeButtons.length > 0) {
      await act(async () => {
        fireEvent.click(removeButtons[0]);
      });

      expect(mockDashboardStore.removeWidget).toHaveBeenCalledWith('1');
    }
  });

  it('should resize widget when resize button is clicked', async () => {
    mockDashboardStore.isEditMode = true;

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    const resizeButtons = screen.getAllByRole('button', { name: /resize/i });
    if (resizeButtons.length > 0) {
      await act(async () => {
        fireEvent.click(resizeButtons[0]);
      });

      expect(mockDashboardStore.resizeWidget).toHaveBeenCalledWith('1', 'large');
    }
  });

  it('should show add widget dropdown in edit mode', async () => {
    mockDashboardStore.isEditMode = true;

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    const addWidgetButton = screen.getByText('Add Widget');
    await act(async () => {
      fireEvent.click(addWidgetButton);
    });

    // Should show available widget types
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Governance')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should add new widget when selected from dropdown', async () => {
    mockDashboardStore.isEditMode = true;

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    const addWidgetButton = screen.getByText('Add Widget');
    await act(async () => {
      fireEvent.click(addWidgetButton);
    });

    const governanceOption = screen.getByText('Governance');
    await act(async () => {
      fireEvent.click(governanceOption);
    });

    expect(mockDashboardStore.addWidget).toHaveBeenCalledWith('governance');
  });

  it('should reset dashboard to default when reset button is clicked', async () => {
    mockDashboardStore.isEditMode = true;

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    const resetButton = screen.getByText('Reset to Default');
    await act(async () => {
      fireEvent.click(resetButton);
    });

    expect(mockDashboardStore.resetToDefault).toHaveBeenCalledOnce();
  });

  it('should handle drag and drop for widget reordering', async () => {
    mockDashboardStore.isEditMode = true;

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    // Find draggable elements
    const widgets = screen.getAllByRole('article'); // Assuming widgets are wrapped in articles
    if (widgets.length >= 2) {
      const firstWidget = widgets[0];
      const secondWidget = widgets[1];

      // Simulate drag start
      await act(async () => {
        fireEvent.dragStart(firstWidget, {
          dataTransfer: { effectAllowed: 'move' }
        });
      });

      // Simulate drag over
      await act(async () => {
        fireEvent.dragOver(secondWidget, {
          dataTransfer: { dropEffect: 'move' }
        });
      });

      // Simulate drop
      await act(async () => {
        fireEvent.drop(secondWidget, {
          dataTransfer: { getData: () => '0' }
        });
      });

      expect(mockDashboardStore.reorderWidgets).toHaveBeenCalled();
    }
  });

  it('should apply grid layout classes correctly', async () => {
    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    const dashboardGrid = document.querySelector('.grid');
    expect(dashboardGrid).toBeInTheDocument();
    expect(dashboardGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('should handle empty widget state', async () => {
    mockDashboardStore.widgets = [];

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    expect(screen.getByText(/no widgets configured/i)).toBeInTheDocument();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('should show drag indicators in edit mode', async () => {
    mockDashboardStore.isEditMode = true;

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    // Should show drag handles
    const dragHandles = screen.getAllByRole('button', { name: /drag/i });
    expect(dragHandles.length).toBeGreaterThan(0);
  });

  it('should prevent interactions when not in edit mode', async () => {
    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    expect(screen.queryByText('Hide')).not.toBeInTheDocument();
    expect(screen.queryByText('Resize')).not.toBeInTheDocument();
  });

  it('should maintain widget aspect ratios', async () => {
    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    const widgets = screen.getAllByTestId(/-widget$/);
    widgets.forEach(widget => {
      const widgetContainer = widget.parentElement;
      expect(widgetContainer).toHaveClass('h-72'); // Fixed height class
    });
  });

  it('should handle widget loading states', async () => {
    // Mock a widget that shows loading
    vi.mocked(screen.getByTestId).mockImplementation((testId) => {
      if (testId === 'marketplace-widget') {
        return document.createElement('div');
      }
      throw new Error('Element not found');
    });

    await act(async () => {
      render(<ConfigurableDashboard />);
    });

    // Widgets should render without crashing
    expect(screen.getByTestId('marketplace-widget')).toBeInTheDocument();
  });
});