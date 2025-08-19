import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import UserManagement from '../../../components/AdminEnhancements/UserManagement';
import { useUserManagementStore } from '../../../store/userManagementStore';
import { useAdminAuthContext } from '../../../hooks/useAdminAuth';
import { useNotifications } from '../../../hooks/useNotifications';
import { renderWithAuthenticatedAdmin } from '../../test-utils';

// Mock the stores and hooks
vi.mock('../../../store/userManagementStore');
vi.mock('../../../hooks/useAdminAuth');
vi.mock('../../../hooks/useNotifications');

const mockUsers = [
  {
    id: 'user1',
    address: 'cosmos1user1abc',
    email: 'user1@test.com',
    role: 'investor',
    isActive: true,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T12:00:00Z',
    totalInvestments: 5,
    totalInvested: { amount: '50000', denom: 'untrn' },
    kycStatus: 'approved',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Experienced investor'
    }
  },
  {
    id: 'user2',
    address: 'cosmos1user2def',
    email: 'creator@test.com',
    role: 'creator',
    isActive: true,
    isVerified: true,
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: '2024-01-14T10:00:00Z',
    totalProposals: 3,
    totalRaised: { amount: '500000', denom: 'untrn' },
    kycStatus: 'approved',
    profile: {
      firstName: 'Jane',
      lastName: 'Smith',
      bio: 'Clean energy entrepreneur'
    }
  },
  {
    id: 'user3',
    address: 'cosmos1user3ghi',
    email: 'inactive@test.com',
    role: 'investor',
    isActive: false,
    isVerified: false,
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: null,
    kycStatus: 'pending',
    profile: {
      firstName: 'Bob',
      lastName: 'Johnson'
    }
  }
];

const mockUserManagementStore = {
  users: mockUsers,
  filteredUsers: mockUsers,
  totalUsers: 3,
  isLoading: false,
  error: null,
  filters: {
    role: 'all',
    status: 'all',
    verification: 'all',
    search: ''
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 3
  },
  loadUsers: vi.fn(),
  updateUser: vi.fn(),
  suspendUser: vi.fn(),
  activateUser: vi.fn(),
  deleteUser: vi.fn(),
  updateFilters: vi.fn(),
  exportUsers: vi.fn(),
  sendNotificationToUser: vi.fn(),
  bulkUpdateUsers: vi.fn(),
};

const mockAdminAuth = {
  currentAdmin: {
    id: 'admin123',
    address: 'cosmos1admin123',
    role: 'platform_admin',
    permissions: ['manage_users', 'view_all_data', 'moderate_content'],
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

describe('UserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUserManagementStore as any).mockReturnValue(mockUserManagementStore);
    (useAdminAuthContext as any).mockReturnValue(mockAdminAuth);
    (useNotifications as any).mockReturnValue(mockNotifications);
    mockAdminAuth.checkPermission.mockReturnValue(true);
    mockAdminAuth.hasRole.mockReturnValue(true);
  });

  it('should render user management interface', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Manage platform users and their accounts')).toBeInTheDocument();
  });

  it('should load users on mount', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    expect(mockUserManagementStore.loadUsers).toHaveBeenCalledOnce();
  });

  it('should display users list with correct information', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('cosmos1user1abc')).toBeInTheDocument();
    expect(screen.getByText('cosmos1user2def')).toBeInTheDocument();
    expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    expect(screen.getByText('creator@test.com')).toBeInTheDocument();
  });

  it('should show user statistics', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Verified Users')).toBeInTheDocument();
  });

  it('should filter users by role', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    const roleFilter = screen.getByLabelText('Filter by role');
    await act(async () => {
      fireEvent.change(roleFilter, { target: { value: 'investor' } });
    });

    expect(mockUserManagementStore.updateFilters).toHaveBeenCalledWith({
      role: 'investor'
    });
  });

  it('should filter users by status', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    const statusFilter = screen.getByLabelText('Filter by status');
    await act(async () => {
      fireEvent.change(statusFilter, { target: { value: 'active' } });
    });

    expect(mockUserManagementStore.updateFilters).toHaveBeenCalledWith({
      status: 'active'
    });
  });

  it('should search users', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    const searchInput = screen.getByPlaceholderText('Search users...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'john' } });
    });

    expect(mockUserManagementStore.updateFilters).toHaveBeenCalledWith({
      search: 'john'
    });
  });

  it('should open user profile modal', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    const viewButtons = screen.getAllByText('View');
    await act(async () => {
      fireEvent.click(viewButtons[0]);
    });

    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Experienced investor')).toBeInTheDocument();
  });

  it('should suspend user with confirmation', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    const suspendButtons = screen.getAllByText('Suspend');
    await act(async () => {
      fireEvent.click(suspendButtons[0]);
    });

    // Should show confirmation dialog
    expect(screen.getByText(/suspend this user/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByText('Confirm Suspend');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(mockUserManagementStore.suspendUser).toHaveBeenCalledWith('user1');
    expect(mockNotifications.success).toHaveBeenCalledWith('User suspended successfully');
  });

  it('should activate suspended user', async () => {
    mockUserManagementStore.users = [{
      ...mockUsers[0],
      isActive: false
    }];
    mockUserManagementStore.filteredUsers = mockUserManagementStore.users;

    await act(async () => {
      render(<UserManagement />);
    });

    const activateButton = screen.getByText('Activate');
    await act(async () => {
      fireEvent.click(activateButton);
    });

    expect(mockUserManagementStore.activateUser).toHaveBeenCalledWith('user1');
    expect(mockNotifications.success).toHaveBeenCalledWith('User activated successfully');
  });

  it('should send notification to user', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    const notifyButtons = screen.getAllByText('Notify');
    await act(async () => {
      fireEvent.click(notifyButtons[0]);
    });

    // Should open notification modal
    expect(screen.getByText('Send Notification')).toBeInTheDocument();
    
    const messageInput = screen.getByPlaceholderText('Enter your message...');
    await act(async () => {
      fireEvent.change(messageInput, { target: { value: 'Test notification' } });
    });

    const sendButton = screen.getByText('Send Notification');
    await act(async () => {
      fireEvent.click(sendButton);
    });

    expect(mockUserManagementStore.sendNotificationToUser).toHaveBeenCalledWith(
      'user1',
      'Test notification'
    );
  });

  it('should export users data', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    const exportButton = screen.getByText('Export Users');
    await act(async () => {
      fireEvent.click(exportButton);
    });

    expect(mockUserManagementStore.exportUsers).toHaveBeenCalled();
  });

  it('should handle bulk operations', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    // Select multiple users
    const checkboxes = screen.getAllByRole('checkbox');
    await act(async () => {
      fireEvent.click(checkboxes[1]); // First user checkbox (0 is select all)
      fireEvent.click(checkboxes[2]); // Second user checkbox
    });

    const bulkSuspendButton = screen.getByText('Bulk Suspend');
    await act(async () => {
      fireEvent.click(bulkSuspendButton);
    });

    expect(screen.getByText(/suspend 2 selected users/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByText('Confirm Bulk Action');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(mockUserManagementStore.bulkUpdateUsers).toHaveBeenCalled();
  });

  it('should display user verification status', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should display user KYC status', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    expect(screen.getAllByText('Approved')).toHaveLength(2);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should handle pagination', async () => {
    mockUserManagementStore.pagination = {
      page: 1,
      pageSize: 2,
      total: 3
    };

    await act(async () => {
      render(<UserManagement />);
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    await act(async () => {
      fireEvent.click(nextButton);
    });

    expect(mockUserManagementStore.loadUsers).toHaveBeenCalledWith({ page: 2 });
  });

  it('should prevent unauthorized actions', async () => {
    mockAdminAuth.checkPermission.mockReturnValue(false);

    await act(async () => {
      render(<UserManagement />);
    });

    expect(screen.queryByText('Suspend')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.getByText(/insufficient permissions/i)).toBeInTheDocument();
  });

  it('should show loading state', async () => {
    mockUserManagementStore.isLoading = true;

    await act(async () => {
      render(<UserManagement />);
    });

    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    mockUserManagementStore.error = 'Failed to load users';

    await act(async () => {
      render(<UserManagement />);
    });

    expect(screen.getByText('Failed to load users')).toBeInTheDocument();
  });

  it('should display user investment statistics for investors', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    expect(screen.getByText('5 investments')).toBeInTheDocument();
    expect(screen.getByText('50,000 NTRN invested')).toBeInTheDocument();
  });

  it('should display creator statistics for creators', async () => {
    await act(async () => {
      render(<UserManagement />);
    });

    expect(screen.getByText('3 proposals')).toBeInTheDocument();
    expect(screen.getByText('500,000 NTRN raised')).toBeInTheDocument();
  });
});