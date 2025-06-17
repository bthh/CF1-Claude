import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Ban, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Mail,
  Shield,
  Edit,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { useUserManagementStore, ManagedUser } from '../../store/userManagementStore';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { formatTimeAgo } from '../../utils/format';
import UserProfileModal from './UserProfileModal';

const UserManagement: React.FC = () => {
  const { checkPermission } = useAdminAuthContext();
  const { 
    users, 
    totalUsers, 
    filters,
    pagination,
    loading,
    loadUsers,
    searchUsers,
    blockUser,
    unblockUser,
    updateUserRole,
    updateUserKYC,
    updateUserStatus,
    setFilters,
    exportUsers
  } = useUserManagementStore();
  
  const { success, error } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState<string | null>(null);
  const [bulkSelectedUsers, setBulkSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(searchQuery);
  };

  const handleBlockUser = async (userId: string, userName?: string) => {
    const reason = prompt('Please provide a reason for blocking this user:');
    if (reason) {
      await blockUser(userId, reason);
      success(`User ${userName || userId} has been blocked`);
    }
  };

  const handleUnblockUser = async (userId: string, userName?: string) => {
    await unblockUser(userId);
    success(`User ${userName || userId} has been unblocked`);
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'creator' | 'admin') => {
    await updateUserRole(userId, newRole);
    success('User role updated successfully');
  };

  const handleKYCUpdate = async (userId: string, status: 'approved' | 'rejected') => {
    await updateUserKYC(userId, status);
    success(`KYC status updated to ${status}`);
  };

  const handleViewUser = (user: ManagedUser) => {
    setSelectedUser(user);
  };

  const handleUpdateUser = async (userId: string, updates: Partial<ManagedUser>) => {
    await updateUserStatus(userId, updates);
    
    // Update the selectedUser if it's the same user being updated
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, ...updates });
    }
  };

  const handleBulkAction = async (action: 'block' | 'unblock' | 'export') => {
    if (bulkSelectedUsers.length === 0) {
      error('Please select users first');
      return;
    }

    if (action === 'export') {
      // Export selected users
      exportUsers();
      success(`Exported ${bulkSelectedUsers.length} users`);
    } else {
      // Block/unblock users
      const reason = action === 'block' ? prompt('Please provide a reason for blocking these users:') : undefined;
      if (action === 'block' && !reason) return;

      for (const userId of bulkSelectedUsers) {
        if (action === 'block') {
          await blockUser(userId, reason!);
        } else {
          await unblockUser(userId);
        }
      }
      
      success(`${bulkSelectedUsers.length} users ${action}ed successfully`);
      setBulkSelectedUsers([]);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setBulkSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    setBulkSelectedUsers(prev => 
      prev.length === users.length ? [] : users.map(u => u.id)
    );
  };

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case 'anonymous': return <span className="text-gray-500">No verification</span>;
      case 'basic': return <span className="text-blue-600">Basic</span>;
      case 'verified': return <span className="text-green-600">Verified</span>;
      case 'accredited': return <span className="text-purple-600">Accredited</span>;
      default: return null;
    }
  };

  const getKYCStatus = (status: string) => {
    switch (status) {
      case 'none': return <span className="text-gray-500">Not started</span>;
      case 'pending': return <span className="text-yellow-600">Pending</span>;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                User Management
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalUsers} total users
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {bulkSelectedUsers.length > 0 && (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {bulkSelectedUsers.length} selected
                </span>
                <button
                  onClick={() => handleBulkAction('block')}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  <span>Block</span>
                </button>
                <button
                  onClick={() => handleBulkAction('unblock')}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Unblock</span>
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </>
            )}
            <button
              onClick={() => loadUsers()}
              className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={exportUsers}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export All</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by wallet address, email, or name..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <select
                value={filters.role || ''}
                onChange={(e) => setFilters({ ...filters, role: e.target.value || undefined })}
                className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="creator">Creator</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={filters.verificationLevel || ''}
                onChange={(e) => setFilters({ ...filters, verificationLevel: e.target.value || undefined })}
                className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm"
              >
                <option value="">All Verification Levels</option>
                <option value="anonymous">Anonymous</option>
                <option value="basic">Basic</option>
                <option value="verified">Verified</option>
                <option value="accredited">Accredited</option>
              </select>

              <select
                value={filters.kycStatus || ''}
                onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value || undefined })}
                className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm"
              >
                <option value="">All KYC Status</option>
                <option value="none">Not Started</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filters.isBlocked === true ? 'blocked' : filters.isBlocked === false ? 'active' : ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  isBlocked: e.target.value === 'blocked' ? true : e.target.value === 'active' ? false : undefined 
                })}
                className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading users...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={bulkSelectedUsers.length === users.length && users.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Verification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      KYC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={bulkSelectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name || 'Anonymous User'}
                            </p>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                              user.role === 'creator' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {user.walletAddress}
                          </p>
                          {user.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {getVerificationBadge(user.verificationLevel)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getKYCStatus(user.kycStatus)}
                          <span className="text-xs text-gray-500">
                            {user.kycStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">
                            {user.totalInvestments} investments
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last active {formatTimeAgo(user.lastActive)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.isBlocked ? (
                          <div className="flex items-center space-x-1 text-red-600">
                            <Ban className="w-4 h-4" />
                            <span className="text-sm">Blocked</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Active</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {checkPermission('manage_users') && (
                            <>
                              {user.isBlocked ? (
                                <button
                                  onClick={() => handleUnblockUser(user.id, user.name)}
                                  className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBlockUser(user.id, user.name)}
                                  className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                          
                          <div className="relative">
                            <button className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, totalUsers)} of {totalUsers} users
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadUsers(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => loadUsers(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
};

export default UserManagement;