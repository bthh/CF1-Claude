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
  walletAddress?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role: string;
  authMethod: 'email' | 'wallet' | 'hybrid';
  emailVerified: boolean;
  accountStatus: 'active' | 'suspended' | 'pending_verification' | 'locked';
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not_started';
  createdAt: string;
  lastLoginAt?: string;
}

type FilterType = 'all' | 'email' | 'wallet' | 'active' | 'suspended' | 'verified' | 'pending';

const AdminUsers: React.FC = () => {
  const { accessToken } = useUnifiedAuthStore();
  
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
      // For now, use mock data since backend user list isn't implemented yet
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          displayName: 'John Doe',
          role: 'investor',
          authMethod: 'email',
          emailVerified: true,
          accountStatus: 'active',
          kycStatus: 'verified',
          createdAt: '2024-01-15T10:30:00Z',
          lastLoginAt: '2024-01-20T15:45:00Z'
        },
        {
          id: '2',
          walletAddress: '0x742d35Cc8bC4D7C7b2b5F7c4b3f4a1c8D9E0F123',
          displayName: 'Crypto Investor',
          role: 'creator',
          authMethod: 'wallet',
          emailVerified: false,
          accountStatus: 'active',
          kycStatus: 'not_started',
          createdAt: '2024-01-10T08:15:00Z',
          lastLoginAt: '2024-01-19T12:30:00Z'
        },
        {
          id: '3',
          email: 'alice.smith@example.com',
          walletAddress: '0x123d35Cc8bC4D7C7b2b5F7c4b3f4a1c8D9E0F789',
          firstName: 'Alice',
          lastName: 'Smith',
          displayName: 'Alice Smith',
          role: 'creator',
          authMethod: 'hybrid',
          emailVerified: true,
          accountStatus: 'active',
          kycStatus: 'pending',
          createdAt: '2024-01-12T14:20:00Z',
          lastLoginAt: '2024-01-21T09:15:00Z'
        },
        {
          id: '4',
          email: 'bob.pending@example.com',
          firstName: 'Bob',
          lastName: 'Wilson',
          displayName: 'Bob Wilson',
          role: 'investor',
          authMethod: 'email',
          emailVerified: false,
          accountStatus: 'pending_verification',
          kycStatus: 'not_started',
          createdAt: '2024-01-18T16:45:00Z'
        },
        {
          id: '5',
          email: 'suspended.user@example.com',
          displayName: 'Suspended User',
          role: 'investor',
          authMethod: 'email',
          emailVerified: true,
          accountStatus: 'suspended',
          kycStatus: 'rejected',
          createdAt: '2024-01-05T11:30:00Z',
          lastLoginAt: '2024-01-16T14:20:00Z'
        }
      ];

      setUsers(mockUsers);
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
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.walletAddress?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower);

    const matchesFilter = 
      selectedFilter === 'all' ||
      (selectedFilter === 'email' && (user.authMethod === 'email' || user.authMethod === 'hybrid')) ||
      (selectedFilter === 'wallet' && (user.authMethod === 'wallet' || user.authMethod === 'hybrid')) ||
      (selectedFilter === 'active' && user.accountStatus === 'active') ||
      (selectedFilter === 'suspended' && user.accountStatus === 'suspended') ||
      (selectedFilter === 'verified' && user.kycStatus === 'verified') ||
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
                {users.filter(u => u.accountStatus === 'active').length}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Verified KYC</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.kycStatus === 'verified').length}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.accountStatus === 'suspended').length}
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
              <option value="email">Email Users</option>
              <option value="wallet">Wallet Users</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="verified">KYC Verified</option>
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
                    Auth Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    KYC Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
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
                            {user.displayName?.[0] || user.email?.[0] || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.displayName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email || (user.walletAddress ? `${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-6)}` : 'No identifier')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.authMethod === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                        {user.authMethod === 'wallet' && <Wallet className="w-4 h-4 text-green-500" />}
                        {user.authMethod === 'hybrid' && (
                          <>
                            <Mail className="w-4 h-4 text-blue-500" />
                            <Wallet className="w-4 h-4 text-green-500" />
                          </>
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {user.authMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.accountStatus)}`}>
                        {user.accountStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getKycColor(user.kycStatus)}`}>
                        {user.kycStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {user.role}
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

      {/* User Details Modal - Placeholder */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Details - {selectedUser.displayName}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400">
                Detailed user management features will be implemented here.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button onClick={() => setShowUserModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;