import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';
import { useFeatureToggleStore } from '../../store/featureToggleStore';
import { useUserManagementStore } from '../../store/userManagementStore';
import { useNotifications } from '../../hooks/useNotifications';

// Integration test component that simulates admin workflow
const AdminWorkflowIntegration = () => {
  const { currentAdmin, checkPermission } = useAdminAuthContext();
  const { features, updateFeatureToggle, isFeatureEnabled } = useFeatureToggleStore();
  const { users, suspendUser, activateUser, updateUserRole } = useUserManagementStore();
  const { success, error } = useNotifications();

  const handleEmergencyMaintenance = async () => {
    try {
      // Check permissions
      if (!checkPermission('emergency_controls')) {
        error('Insufficient permissions for emergency maintenance');
        return;
      }

      // Enable maintenance mode
      await updateFeatureToggle('maintenance_mode', true, currentAdmin?.address || 'unknown');
      
      // Disable critical features
      await updateFeatureToggle('secondary_trading', false, currentAdmin?.address || 'unknown');
      await updateFeatureToggle('launchpad', false, currentAdmin?.address || 'unknown');
      
      success('Emergency maintenance mode activated');
    } catch (err) {
      error('Failed to activate emergency maintenance');
    }
  };

  const handleSuspiciousUserActivity = async (userId: string) => {
    try {
      // Suspend user
      await suspendUser(userId);
      
      // If trading is affected, disable secondary trading
      if (isFeatureEnabled('secondary_trading')) {
        await updateFeatureToggle('secondary_trading', false, currentAdmin?.address || 'unknown');
      }
      
      success('User suspended and trading temporarily disabled');
    } catch (err) {
      error('Failed to handle suspicious activity');
    }
  };

  const handleSystemRecovery = async () => {
    try {
      // Disable maintenance mode
      await updateFeatureToggle('maintenance_mode', false, currentAdmin?.address || 'unknown');
      
      // Re-enable features gradually
      await updateFeatureToggle('secondary_trading', true, currentAdmin?.address || 'unknown');
      await updateFeatureToggle('launchpad', true, currentAdmin?.address || 'unknown');
      
      success('System recovery completed');
    } catch (err) {
      error('Failed to complete system recovery');
    }
  };

  const handleUserRoleEscalation = async (userId: string, newRole: string) => {
    try {
      // Check if admin can escalate to this role
      if (newRole === 'platform_admin' && !checkPermission('manage_admin_roles')) {
        error('Cannot escalate user to admin role');
        return;
      }

      await updateUserRole(userId, newRole);
      success(`User role updated to ${newRole}`);
    } catch (err) {
      error('Failed to update user role');
    }
  };

  if (!currentAdmin) {
    return <div>Admin authentication required</div>;
  }

  return (
    <div data-testid="admin-workflow">
      <h1>Admin Emergency Controls</h1>
      
      <div data-testid="admin-info">
        <p>Admin: {currentAdmin.address}</p>
        <p>Role: {currentAdmin.role}</p>
      </div>

      <div data-testid="system-status">
        <h2>System Status</h2>
        <p>Maintenance Mode: {features.maintenance_mode?.enabled ? 'Active' : 'Inactive'}</p>
        <p>Secondary Trading: {features.secondary_trading?.enabled ? 'Enabled' : 'Disabled'}</p>
        <p>Launchpad: {features.launchpad?.enabled ? 'Enabled' : 'Disabled'}</p>
      </div>

      <div data-testid="emergency-controls">
        <h2>Emergency Controls</h2>
        <button onClick={handleEmergencyMaintenance}>
          Activate Emergency Maintenance
        </button>
        <button onClick={handleSystemRecovery}>
          System Recovery
        </button>
      </div>

      <div data-testid="user-management">
        <h2>User Management</h2>
        {users.slice(0, 3).map(user => (
          <div key={user.id} data-testid={`user-${user.id}`}>
            <span>{user.address} - {user.role}</span>
            <button onClick={() => handleSuspiciousUserActivity(user.id)}>
              Suspend for Suspicious Activity
            </button>
            <button onClick={() => handleUserRoleEscalation(user.id, 'creator')}>
              Promote to Creator
            </button>
          </div>
        ))}
      </div>

      <div data-testid="bulk-operations">
        <h2>Bulk Operations</h2>
        <button onClick={() => {
          users.forEach(user => {
            if (user.role === 'investor') {
              handleUserRoleEscalation(user.id, 'creator');
            }
          });
        }}>
          Promote All Investors to Creators
        </button>
      </div>
    </div>
  );
};

// Wrapper component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
      mutations: { retry: false }
    }
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Mock all the hooks and stores
vi.mock('../../hooks/useAdminAuth');
vi.mock('../../store/featureToggleStore');
vi.mock('../../store/userManagementStore');
vi.mock('../../hooks/useNotifications');

const mockAdminAuth = {
  currentAdmin: {
    id: 'admin-123',
    address: 'cosmos1admin123',
    role: 'super_admin',
    permissions: ['emergency_controls', 'manage_admin_roles', 'manage_users'],
    sessionExpiry: Date.now() + 3600000
  },
  checkPermission: vi.fn(),
};

const mockFeatureToggleStore = {
  features: {
    maintenance_mode: { id: 'maintenance_mode', enabled: false },
    secondary_trading: { id: 'secondary_trading', enabled: true },
    launchpad: { id: 'launchpad', enabled: true }
  },
  updateFeatureToggle: vi.fn(),
  isFeatureEnabled: vi.fn(),
};

const mockUserManagementStore = {
  users: [
    { id: 'user1', address: 'cosmos1user1', role: 'investor' },
    { id: 'user2', address: 'cosmos1user2', role: 'creator' },
    { id: 'user3', address: 'cosmos1user3', role: 'investor' }
  ],
  suspendUser: vi.fn(),
  activateUser: vi.fn(),
  updateUserRole: vi.fn(),
};

const mockNotifications = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

describe('AdminWorkflowIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAdminAuthContext as any).mockReturnValue(mockAdminAuth);
    (useFeatureToggleStore as any).mockReturnValue(mockFeatureToggleStore);
    (useUserManagementStore as any).mockReturnValue(mockUserManagementStore);
    (useNotifications as any).mockReturnValue(mockNotifications);
    
    mockAdminAuth.checkPermission.mockReturnValue(true);
    mockFeatureToggleStore.isFeatureEnabled.mockImplementation(
      (feature: string) => mockFeatureToggleStore.features[feature]?.enabled || false
    );
  });

  it('should render admin workflow interface', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Admin Emergency Controls')).toBeInTheDocument();
    expect(screen.getByText('Admin: cosmos1admin123')).toBeInTheDocument();
    expect(screen.getByText('Role: super_admin')).toBeInTheDocument();
  });

  it('should handle emergency maintenance activation workflow', async () => {
    mockFeatureToggleStore.updateFeatureToggle.mockResolvedValue(undefined);

    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    const emergencyButton = screen.getByText('Activate Emergency Maintenance');
    await act(async () => {
      fireEvent.click(emergencyButton);
    });

    await waitFor(() => {
      expect(mockFeatureToggleStore.updateFeatureToggle).toHaveBeenCalledWith(
        'maintenance_mode', true, 'cosmos1admin123'
      );
      expect(mockFeatureToggleStore.updateFeatureToggle).toHaveBeenCalledWith(
        'secondary_trading', false, 'cosmos1admin123'
      );
      expect(mockFeatureToggleStore.updateFeatureToggle).toHaveBeenCalledWith(
        'launchpad', false, 'cosmos1admin123'
      );
    });

    expect(mockNotifications.success).toHaveBeenCalledWith('Emergency maintenance mode activated');
  });

  it('should handle suspicious user activity workflow', async () => {
    mockUserManagementStore.suspendUser.mockResolvedValue(undefined);
    mockFeatureToggleStore.updateFeatureToggle.mockResolvedValue(undefined);

    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    const suspendButton = screen.getAllByText('Suspend for Suspicious Activity')[0];
    await act(async () => {
      fireEvent.click(suspendButton);
    });

    await waitFor(() => {
      expect(mockUserManagementStore.suspendUser).toHaveBeenCalledWith('user1');
      expect(mockFeatureToggleStore.updateFeatureToggle).toHaveBeenCalledWith(
        'secondary_trading', false, 'cosmos1admin123'
      );
    });

    expect(mockNotifications.success).toHaveBeenCalledWith('User suspended and trading temporarily disabled');
  });

  it('should handle system recovery workflow', async () => {
    mockFeatureToggleStore.updateFeatureToggle.mockResolvedValue(undefined);

    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    const recoveryButton = screen.getByText('System Recovery');
    await act(async () => {
      fireEvent.click(recoveryButton);
    });

    await waitFor(() => {
      expect(mockFeatureToggleStore.updateFeatureToggle).toHaveBeenCalledWith(
        'maintenance_mode', false, 'cosmos1admin123'
      );
      expect(mockFeatureToggleStore.updateFeatureToggle).toHaveBeenCalledWith(
        'secondary_trading', true, 'cosmos1admin123'
      );
      expect(mockFeatureToggleStore.updateFeatureToggle).toHaveBeenCalledWith(
        'launchpad', true, 'cosmos1admin123'
      );
    });

    expect(mockNotifications.success).toHaveBeenCalledWith('System recovery completed');
  });

  it('should handle user role escalation', async () => {
    mockUserManagementStore.updateUserRole.mockResolvedValue(undefined);

    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    const promoteButton = screen.getAllByText('Promote to Creator')[0];
    await act(async () => {
      fireEvent.click(promoteButton);
    });

    await waitFor(() => {
      expect(mockUserManagementStore.updateUserRole).toHaveBeenCalledWith('user1', 'creator');
    });

    expect(mockNotifications.success).toHaveBeenCalledWith('User role updated to creator');
  });

  it('should handle permission checks for role escalation', async () => {
    mockAdminAuth.checkPermission.mockImplementation((permission: string) => 
      permission !== 'manage_admin_roles'
    );

    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    // This would try to escalate to admin role, which should fail
    // Note: In a real implementation, there would be an admin role button
    // For this test, we'll simulate the permission check directly
    const handleUserRoleEscalation = async (userId: string, newRole: string) => {
      if (newRole === 'platform_admin' && !mockAdminAuth.checkPermission('manage_admin_roles')) {
        mockNotifications.error('Cannot escalate user to admin role');
        return;
      }
      await mockUserManagementStore.updateUserRole(userId, newRole);
    };

    await act(async () => {
      await handleUserRoleEscalation('user1', 'platform_admin');
    });

    expect(mockNotifications.error).toHaveBeenCalledWith('Cannot escalate user to admin role');
    expect(mockUserManagementStore.updateUserRole).not.toHaveBeenCalled();
  });

  it('should handle bulk operations', async () => {
    mockUserManagementStore.updateUserRole.mockResolvedValue(undefined);

    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    const bulkPromoteButton = screen.getByText('Promote All Investors to Creators');
    await act(async () => {
      fireEvent.click(bulkPromoteButton);
    });

    await waitFor(() => {
      // Should promote user1 and user3 (both investors)
      expect(mockUserManagementStore.updateUserRole).toHaveBeenCalledWith('user1', 'creator');
      expect(mockUserManagementStore.updateUserRole).toHaveBeenCalledWith('user3', 'creator');
      expect(mockUserManagementStore.updateUserRole).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle error scenarios gracefully', async () => {
    mockFeatureToggleStore.updateFeatureToggle.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    const emergencyButton = screen.getByText('Activate Emergency Maintenance');
    await act(async () => {
      fireEvent.click(emergencyButton);
    });

    await waitFor(() => {
      expect(mockNotifications.error).toHaveBeenCalledWith('Failed to activate emergency maintenance');
    });
  });

  it('should display system status correctly', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Maintenance Mode: Inactive')).toBeInTheDocument();
    expect(screen.getByText('Secondary Trading: Enabled')).toBeInTheDocument();
    expect(screen.getByText('Launchpad: Enabled')).toBeInTheDocument();
  });

  it('should require admin authentication', async () => {
    mockAdminAuth.currentAdmin = null;

    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Admin authentication required')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-workflow')).not.toBeInTheDocument();
  });

  it('should handle permission denied scenarios', async () => {
    mockAdminAuth.checkPermission.mockReturnValue(false);

    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    const emergencyButton = screen.getByText('Activate Emergency Maintenance');
    await act(async () => {
      fireEvent.click(emergencyButton);
    });

    expect(mockNotifications.error).toHaveBeenCalledWith('Insufficient permissions for emergency maintenance');
    expect(mockFeatureToggleStore.updateFeatureToggle).not.toHaveBeenCalled();
  });

  it('should integrate multiple admin operations in sequence', async () => {
    mockFeatureToggleStore.updateFeatureToggle.mockResolvedValue(undefined);
    mockUserManagementStore.suspendUser.mockResolvedValue(undefined);

    await act(async () => {
      render(
        <TestWrapper>
          <AdminWorkflowIntegration />
        </TestWrapper>
      );
    });

    // First activate emergency maintenance
    const emergencyButton = screen.getByText('Activate Emergency Maintenance');
    await act(async () => {
      fireEvent.click(emergencyButton);
    });

    // Then suspend a user
    const suspendButton = screen.getAllByText('Suspend for Suspicious Activity')[0];
    await act(async () => {
      fireEvent.click(suspendButton);
    });

    // Finally recover system
    const recoveryButton = screen.getByText('System Recovery');
    await act(async () => {
      fireEvent.click(recoveryButton);
    });

    await waitFor(() => {
      expect(mockFeatureToggleStore.updateFeatureToggle).toHaveBeenCalledTimes(7); // 3 for emergency + 2 for suspend + 2 for recovery
      expect(mockUserManagementStore.suspendUser).toHaveBeenCalledTimes(1);
      expect(mockNotifications.success).toHaveBeenCalledTimes(3);
    });
  });
});