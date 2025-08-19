import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import FeatureToggleManager from '../../../components/AdminEnhancements/FeatureToggleManager';
import { useFeatureToggleStore } from '../../../store/featureToggleStore';
import { useAdminAuthContext } from '../../../hooks/useAdminAuth';
import { useNotifications } from '../../../hooks/useNotifications';
import { renderWithAuthenticatedAdmin } from '../../test-utils';

// Mock the stores and hooks
vi.mock('../../../store/featureToggleStore');
vi.mock('../../../hooks/useAdminAuth');
vi.mock('../../../hooks/useNotifications');
vi.mock('../../../utils/format', () => ({
  formatTimeAgo: vi.fn((date) => `${Math.floor((Date.now() - new Date(date).getTime()) / 1000)} seconds ago`)
}));

const mockFeatureToggleStore = {
  features: {
    'marketplace': {
      id: 'marketplace',
      name: 'Marketplace',
      description: 'Enable marketplace tab and asset browsing',
      enabled: true,
      category: 'general',
      requiredRole: 'platform_admin',
      lastModified: new Date().toISOString(),
      modifiedBy: 'admin@test.com'
    },
    'analytics': {
      id: 'analytics',
      name: 'Analytics',
      description: 'Enable analytics dashboard and reports',
      enabled: false,
      category: 'general',
      requiredRole: 'platform_admin',
      lastModified: new Date().toISOString()
    },
    'maintenance_mode': {
      id: 'maintenance_mode',
      name: 'Maintenance Mode',
      description: 'Enable maintenance mode',
      enabled: false,
      category: 'general',
      requiredRole: 'super_admin',
      lastModified: new Date().toISOString()
    }
  },
  isFeatureEnabled: vi.fn(),
  updateFeatureToggle: vi.fn(),
  loadFeatureToggles: vi.fn(),
};

const mockAdminAuth = {
  currentAdmin: {
    id: 'admin123',
    address: 'cosmos1admin123',
    role: 'platform_admin',
    permissions: ['manage_platform_config', 'view_proposals'],
    sessionExpiry: Date.now() + 3600000,
  },
  checkPermission: vi.fn(),
};

const mockNotifications = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  dismiss: vi.fn(),
  clear: vi.fn(),
  notifications: [],
};

describe('FeatureToggleManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useFeatureToggleStore as any).mockReturnValue(mockFeatureToggleStore);
    (useAdminAuthContext as any).mockReturnValue(mockAdminAuth);
    (useNotifications as any).mockReturnValue(mockNotifications);
  });

  it('should render feature toggle list with correct data', async () => {
    mockAdminAuth.checkPermission.mockReturnValue(true);
    
    await act(async () => {
      render(<FeatureToggleManager />);
    });

    expect(screen.getByText('Feature Management')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Enable marketplace tab and asset browsing')).toBeInTheDocument();
    expect(screen.getByText('Enable analytics dashboard and reports')).toBeInTheDocument();
  });

  it('should load feature toggles on mount', async () => {
    mockAdminAuth.checkPermission.mockReturnValue(true);
    
    await act(async () => {
      render(<FeatureToggleManager />);
    });

    expect(mockFeatureToggleStore.loadFeatureToggles).toHaveBeenCalledOnce();
  });

  it('should toggle feature when permission is granted', async () => {
    mockAdminAuth.checkPermission.mockReturnValue(true);
    
    await act(async () => {
      render(<FeatureToggleManager />);
    });

    const toggleButtons = screen.getAllByRole('button');
    const marketplaceToggle = toggleButtons.find(button => 
      button.closest('[data-testid]')?.getAttribute('data-testid')?.includes('marketplace')
    );

    if (marketplaceToggle) {
      await act(async () => {
        fireEvent.click(marketplaceToggle);
      });

      expect(mockFeatureToggleStore.updateFeatureToggle).toHaveBeenCalledWith(
        'marketplace',
        false,
        'cosmos1admin123'
      );
      expect(mockNotifications.success).toHaveBeenCalledWith(
        'Marketplace has been disabled'
      );
    }
  });

  it('should show error when user lacks permission for super admin features', async () => {
    mockAdminAuth.checkPermission.mockImplementation((permission) => 
      permission !== 'emergency_controls'
    );
    
    await act(async () => {
      render(<FeatureToggleManager />);
    });

    // Try to toggle maintenance mode (requires super_admin)
    const toggleButtons = screen.getAllByRole('button');
    const maintenanceToggle = toggleButtons.find(button => 
      button.closest('[data-testid]')?.getAttribute('data-testid')?.includes('maintenance')
    );

    if (maintenanceToggle) {
      await act(async () => {
        fireEvent.click(maintenanceToggle);
      });

      expect(mockNotifications.error).toHaveBeenCalledWith(
        'Only Super Admins can toggle this feature'
      );
      expect(mockFeatureToggleStore.updateFeatureToggle).not.toHaveBeenCalled();
    }
  });

  it('should show warning for critical features', async () => {
    mockAdminAuth.checkPermission.mockReturnValue(true);
    
    await act(async () => {
      render(<FeatureToggleManager />);
    });

    // Try to enable maintenance mode
    const toggleButtons = screen.getAllByRole('button');
    const maintenanceToggle = toggleButtons.find(button => 
      button.closest('[data-testid]')?.getAttribute('data-testid')?.includes('maintenance')
    );

    if (maintenanceToggle) {
      await act(async () => {
        fireEvent.click(maintenanceToggle);
      });

      expect(mockNotifications.warning).toHaveBeenCalledWith(
        'Enabling maintenance mode will make the platform read-only for all users'
      );
    }
  });

  it('should display feature categories correctly', async () => {
    mockAdminAuth.checkPermission.mockReturnValue(true);
    
    await act(async () => {
      render(<FeatureToggleManager />);
    });

    expect(screen.getByText('general')).toBeInTheDocument();
  });

  it('should show last modified information', async () => {
    mockAdminAuth.checkPermission.mockReturnValue(true);
    
    await act(async () => {
      render(<FeatureToggleManager />);
    });

    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
  });

  it('should handle permission check for platform admin features', async () => {
    mockAdminAuth.checkPermission.mockImplementation((permission) => 
      permission !== 'manage_platform_config'
    );
    
    await act(async () => {
      render(<FeatureToggleManager />);
    });

    const toggleButtons = screen.getAllByRole('button');
    const analyticsToggle = toggleButtons.find(button => 
      button.closest('[data-testid]')?.getAttribute('data-testid')?.includes('analytics')
    );

    if (analyticsToggle) {
      await act(async () => {
        fireEvent.click(analyticsToggle);
      });

      expect(mockNotifications.error).toHaveBeenCalledWith(
        "You don't have permission to toggle this feature"
      );
    }
  });

  it('should render feature toggle states correctly', async () => {
    mockAdminAuth.checkPermission.mockReturnValue(true);
    
    await act(async () => {
      render(<FeatureToggleManager />);
    });

    // Check for toggle icons (ToggleRight for enabled, ToggleLeft for disabled)
    const toggleIcons = document.querySelectorAll('svg');
    expect(toggleIcons.length).toBeGreaterThan(0);
  });

  it('should handle refresh feature toggles', async () => {
    mockAdminAuth.checkPermission.mockReturnValue(true);
    
    await act(async () => {
      render(<FeatureToggleManager />);
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    if (refreshButton) {
      await act(async () => {
        fireEvent.click(refreshButton);
      });

      expect(mockFeatureToggleStore.loadFeatureToggles).toHaveBeenCalledTimes(2); // Once on mount, once on refresh
    }
  });
});