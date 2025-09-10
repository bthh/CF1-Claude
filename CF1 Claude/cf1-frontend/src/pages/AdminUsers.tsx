import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail, 
  Wallet, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Edit,
  Lock,
  Unlock,
  RefreshCw,
  Download
} from 'lucide-react';
import { useUnifiedAuthStore, getAuthHeaders } from '../store/unifiedAuthStore';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

interface User {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  walletAddress?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role: string;
  permissions: string[];
  authMethod?: 'email' | 'wallet' | 'hybrid';
  emailVerified?: boolean;
  accountStatus?: 'active' | 'suspended' | 'pending_verification' | 'locked';
  kycStatus?: 'pending' | 'verified' | 'rejected' | 'not_started';
  isActive: boolean;
  userType: 'admin' | 'regular';
  createdAt: string;
  lastLoginAt?: string;
  updatedAt: string;
  phoneNumber?: string;
  notes?: string;
}

type FilterType = 'all' | 'email' | 'wallet' | 'active' | 'suspended' | 'admin' | 'regular' | 'pending';

const AdminUsers: React.FC = () => {
  const { accessToken, user: currentUser } = useUnifiedAuthStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/all-users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      // Users are already in the correct format from the API
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and selected filter
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.walletAddress?.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower);

    const matchesFilter = 
      selectedFilter === 'all' ||
      (selectedFilter === 'email' && user.email) ||
      (selectedFilter === 'wallet' && user.walletAddress) ||
      (selectedFilter === 'active' && (user.isActive || user.accountStatus === 'active')) ||
      (selectedFilter === 'suspended' && (!user.isActive || user.accountStatus === 'suspended')) ||
      (selectedFilter === 'admin' && user.userType === 'admin') ||
      (selectedFilter === 'regular' && user.userType === 'regular') ||
      (selectedFilter === 'pending' && user.accountStatus === 'pending_verification');

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'suspended': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'pending_verification': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'locked': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getKycColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'not_started': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  // Map database roles to business user levels
  const getUserLevel = (user: User): string => {
    // Super admins (Brock and Brian)
    if (user.role === 'super_admin') return 'Super Admin';
    
    // Platform admin (would be set via role management)
    if (user.role === 'platform_admin') return 'Platform Admin';
    
    // Creator admin (for asset creators)
    if (user.role === 'creator_admin') return 'Creator Admin';
    
    // Investor (regular users with investments) - TODO: Check actual investments
    if (user.role === 'investor' || user.role === 'owner') return 'Investor';
    
    // Default for new users with no role set
    return 'None';
  };

  const getUserLevelColor = (level: string): string => {
    switch (level) {
      case 'Super Admin': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'Platform Admin': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'Creator Admin': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'Investor': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'None': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUserAction = (action: string, user: User) => {
    console.log(`Action: ${action} for user:`, user);
    // TODO: Implement user actions (suspend, activate, reset password, etc.)
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update user role');
      }

      // Refresh user list
      await fetchUsers();
      setShowUserModal(false);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage platform users and permissions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.isActive || u.accountStatus === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Admin Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.userType === 'admin').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Regular Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.userType === 'regular').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or wallet address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as FilterType)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Users</option>
              <option value="admin">Admin Users</option>
              <option value="regular">Regular Users</option>
              <option value="email">Email Users</option>
              <option value="wallet">Wallet Users</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* User List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">{error}</div>
            <Button onClick={fetchUsers} variant="outline">
              Try Again
            </Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No users found matching your criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {(user.name || user.displayName || user.email)?.[0] || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || user.displayName || user.username || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email || (user.walletAddress ? `${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-6)}` : 'No identifier')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.userType === 'admin' ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' : 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {user.userType === 'admin' ? 'Admin' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive || user.accountStatus === 'active' 
                          ? 'text-green-600 bg-green-100 dark:bg-green-900/30' 
                          : user.accountStatus === 'pending_verification'
                          ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
                          : 'text-red-600 bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {user.accountStatus ? user.accountStatus.replace('_', ' ') : (user.isActive ? 'active' : 'inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserLevelColor(getUserLevel(user))}`}>
                        {getUserLevel(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions && user.permissions.length > 0 ? (
                          user.permissions.slice(0, 3).map((permission, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                            >
                              {permission}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                        {user.permissions && user.permissions.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                            +{user.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <div className="relative">
                          <Button size="small" variant="outline">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Details - {selectedUser.name || selectedUser.displayName}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-600 dark:text-gray-400">Name:</span> {selectedUser.name}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">Email:</span> {selectedUser.email}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">Username:</span> {selectedUser.username}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">User Type:</span> {selectedUser.userType}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">Account Status:</span> {selectedUser.accountStatus || (selectedUser.isActive ? 'active' : 'inactive')}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">KYC Status:</span> {selectedUser.kycStatus}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">Created:</span> {formatDate(selectedUser.createdAt)}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">Last Login:</span> {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Never'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Current User Level</h3>
                  <div className="mb-4">
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getUserLevelColor(getUserLevel(selectedUser))}`}>
                      {getUserLevel(selectedUser)}
                    </span>
                  </div>
                  
                  {/* Role Management - Only for super admins */}
                  {currentUser?.role === 'super_admin' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Change User Level</h3>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        disabled={loading}
                      >
                        <option value="investor">Investor</option>
                        <option value="creator_admin">Creator Admin</option>
                        <option value="platform_admin">Platform Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select the appropriate user level for this user
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Permissions</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                        selectedUser.permissions.map((permission, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                          >
                            {permission}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No specific permissions</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowUserModal(false)} disabled={loading}>
                Close
              </Button>
              {currentUser?.role === 'super_admin' && selectedUser.id !== currentUser.id && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    // TODO: Add more user management actions
                    console.log('Additional actions for user:', selectedUser);
                  }}
                  disabled={loading}
                >
                  More Actions
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;