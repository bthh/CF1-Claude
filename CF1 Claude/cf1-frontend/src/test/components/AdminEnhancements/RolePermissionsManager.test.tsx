import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import RolePermissionsManager from '../../../components/AdminEnhancements/RolePermissionsManager';
import { useUserManagementStore } from '../../../store/userManagementStore';
import { useAdminAuthContext } from '../../../hooks/useAdminAuth';
import { useNotifications } from '../../../hooks/useNotifications';
import { renderWithAuthenticatedAdmin } from '../../test-utils';

// Mock the stores and hooks
vi.mock('../../../store/userManagementStore');
vi.mock('../../../hooks/useAdminAuth');
vi.mock('../../../hooks/useNotifications');

const mockUserManagementStore = {
  users: [
    {
      id: 'user1',
      address: 'cosmos1user1',
      role: 'investor',
      permissions: ['view_proposals', 'create_investments'],
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toUSOString()
    },
    {
      id: 'user2',
      address: 'cosmos1user2',
      role: 'creator',
      permissions: ['view_proposals', 'create_proposals', 'manage_assets'],
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  ],
  roles: {
    'investor': {
      name: 'Investor',
      permissions: ['view_proposals', 'create_investments', 'view_portfolio'],
      description: 'Can invest in proposals and view portfolio'
    },
    'creator': {
      name: 'Creator',
      permissions: ['view_proposals', 'create_proposals', 'manage_assets', 'view_analytics'],
      description: 'Can create and manage proposals'
    },
    'platform_admin': {
      name: 'Platform Admin',
      permissions: ['manage_platform_config', 'view_all_data', 'moderate_content'],
      description: 'Can manage platform configuration'
    }
  },
  availablePermissions: [
    'view_proposals',
    'create_proposals',
    'create_investments',
    'manage_assets',
    'view_portfolio',
    'view_analytics',
    'manage_platform_config',
    'view_all_data',
    'moderate_content',
    'emergency_controls'
  ],
  loadUsers: vi.fn(),
  updateUserRole: vi.fn(),
  updateUserPermissions: vi.fn(),
  updateRolePermissions: vi.fn(),
  createRole: vi.fn(),
  deleteRole: vi.fn(),
  isLoading: false,
  error: null
};

const mockAdminAuth = {
  currentAdmin: {
    id: 'admin123',
    address: 'cosmos1admin123',
    role: 'platform_admin',
    permissions: ['manage_platform_config', 'view_all_data', 'moderate_content'],
    sessionExpiry: Date.now() + 3600000,
  },
  checkPermission: vi.fn(),
  hasRole: vi.fn(),
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

describe('RolePermissionsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUserManagementStore as any).mockReturnValue(mockUserManagementStore);
    (useAdminAuthContext as any).mockReturnValue(mockAdminAuth);
    (useNotifications as any).mockReturnValue(mockNotifications);
    mockAdminAuth.checkPermission.mockReturnValue(true);
    mockAdminAuth.hasRole.mockReturnValue(true);
  });

  it('should render role permissions interface', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    expect(screen.getByText('Role & Permissions Management')).toBeInTheDocument();
    expect(screen.getByText('Manage user roles and permissions')).toBeInTheDocument();
  });

  it('should load users on mount', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    expect(mockUserManagementStore.loadUsers).toHaveBeenCalledOnce();
  });

  it('should display users list', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    expect(screen.getByText('cosmos1user1')).toBeInTheDocument();
    expect(screen.getByText('cosmos1user2')).toBeInTheDocument();
    expect(screen.getByText('investor')).toBeInTheDocument();
    expect(screen.getByText('creator')).toBeInTheDocument();
  });

  it('should display roles configuration', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    // Click on Roles tab
    const rolesTab = screen.getByText('Roles');
    await act(async () => {
      fireEvent.click(rolesTab);
    });

    expect(screen.getByText('Investor')).toBeInTheDocument();
    expect(screen.getByText('Creator')).toBeInTheDocument();
    expect(screen.getByText('Platform Admin')).toBeInTheDocument();
  });

  it('should allow updating user role', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    // Find the first user's role dropdown
    const roleSelects = screen.getAllByDisplayValue(/investor|creator|platform_admin/);
    if (roleSelects.length > 0) {
      await act(async () => {
        fireEvent.change(roleSelects[0], { target: { value: 'creator' } });
      });

      expect(mockUserManagementStore.updateUserRole).toHaveBeenCalledWith(
        'user1',
        'creator'
      );
    }
  });

  it('should show permission details for roles', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    // Click on Roles tab
    const rolesTab = screen.getByText('Roles');
    await act(async () => {
      fireEvent.click(rolesTab);
    });

    expect(screen.getByText('view_proposals')).toBeInTheDocument();
    expect(screen.getByText('create_investments')).toBeInTheDocument();
    expect(screen.getByText('create_proposals')).toBeInTheDocument();
  });

  it('should allow creating new role', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    // Click on Roles tab
    const rolesTab = screen.getByText('Roles');
    await act(async () => {
      fireEvent.click(rolesTab);
    });

    const createRoleButton = screen.getByText('Create New Role');
    await act(async () => {
      fireEvent.click(createRoleButton);
    });

    // Fill in role creation form
    const roleNameInput = screen.getByPlaceholderText('Role name');
    const roleDescInput = screen.getByPlaceholderText('Role description');

    await act(async () => {
      fireEvent.change(roleNameInput, { target: { value: 'Test Role' } });
      fireEvent.change(roleDescInput, { target: { value: 'Test role description' } });
    });

    // Select some permissions
    const permissionCheckboxes = screen.getAllByRole('checkbox');
    if (permissionCheckboxes.length > 0) {
      await act(async () => {
        fireEvent.click(permissionCheckboxes[0]);
      });
    }

    const saveButton = screen.getByText('Save Role');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(mockUserManagementStore.createRole).toHaveBeenCalled();
  });

  it('should prevent non-authorized role modifications', async () => {
    mockAdminAuth.checkPermission.mockReturnValue(false);

    await act(async () => {
      render(<RolePermissionsManager />);
    });

    // Should show access denied message or disabled controls
    expect(screen.getByText(/insufficient permissions/i) || 
           screen.queryByText('Create New Role')).toBeTruthy();
  });

  it('should handle role deletion with confirmation', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    // Click on Roles tab
    const rolesTab = screen.getByText('Roles');
    await act(async () => {
      fireEvent.click(rolesTab);
    });

    // Find delete button (should be disabled for critical roles)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    if (deleteButtons.length > 0) {
      // Try to delete a non-critical role
      const nonCriticalDeleteButton = deleteButtons.find(btn => 
        !btn.disabled && !btn.closest('[data-role="platform_admin"]')
      );

      if (nonCriticalDeleteButton) {
        await act(async () => {
          fireEvent.click(nonCriticalDeleteButton);
        });

        // Should show confirmation dialog
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        
        const confirmButton = screen.getByText('Confirm Delete');
        await act(async () => {
          fireEvent.click(confirmButton);
        });

        expect(mockUserManagementStore.deleteRole).toHaveBeenCalled();
      }
    }
  });

  it('should filter users by role', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    const roleFilter = screen.getByDisplayValue('All Roles');
    await act(async () => {
      fireEvent.change(roleFilter, { target: { value: 'investor' } });
    });

    // Should only show investor users
    expect(screen.getByText('cosmos1user1')).toBeInTheDocument();
    expect(screen.queryByText('cosmos1user2')).not.toBeInTheDocument();
  });

  it('should search users by address', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    const searchInput = screen.getByPlaceholderText('Search users...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'user1' } });
    });

    expect(screen.getByText('cosmos1user1')).toBeInTheDocument();
    expect(screen.queryByText('cosmos1user2')).not.toBeInTheDocument();
  });

  it('should show user activity status', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    // Should show active/inactive status indicators
    const activeIndicators = screen.getAllByText(/active|inactive/i);
    expect(activeIndicators.length).toBeGreaterThan(0);
  });

  it('should handle permission updates for roles', async () => {
    await act(async () => {
      render(<RolePermissionsManager />);
    });

    // Click on Roles tab
    const rolesTab = screen.getByText('Roles');
    await act(async () => {
      fireEvent.click(rolesTab);
    });

    // Find and click edit permissions for a role
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    if (editButtons.length > 0) {
      await act(async () => {
        fireEvent.click(editButtons[0]);
      });

      // Toggle a permission
      const permissionCheckboxes = screen.getAllByRole('checkbox');
      if (permissionCheckboxes.length > 0) {
        await act(async () => {
          fireEvent.click(permissionCheckboxes[0]);
        });
      }

      const saveButton = screen.getByText('Save Changes');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      expect(mockUserManagementStore.updateRolePermissions).toHaveBeenCalled();
    }
  });
});