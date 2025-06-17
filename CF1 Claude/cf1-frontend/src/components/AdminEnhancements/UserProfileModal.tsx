import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Ban, 
  Edit,
  Save,
  AlertTriangle,
  History,
  DollarSign,
  Activity,
  Flag,
  Calendar,
  Globe
} from 'lucide-react';
import { ManagedUser } from '../../store/userManagementStore';
import { useNotifications } from '../../hooks/useNotifications';
import { formatTimeAgo } from '../../utils/format';

interface UserProfileModalProps {
  user: ManagedUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (userId: string, updates: Partial<ManagedUser>) => Promise<void>;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser
}) => {
  const { success, error } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ManagedUser>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'compliance'>('profile');

  if (!isOpen || !user) return null;

  const handleEdit = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      verificationLevel: user.verificationLevel,
      kycStatus: user.kycStatus,
      notes: user.notes
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await onUpdateUser(user.id, editForm);
      success('User profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      error('Failed to update user profile');
    }
  };

  const handleBlock = async () => {
    const reason = prompt('Please provide a reason for blocking this user:');
    if (reason) {
      await onUpdateUser(user.id, { isBlocked: true, blockReason: reason });
      success('User has been blocked');
    }
  };

  const handleUnblock = async () => {
    await onUpdateUser(user.id, { isBlocked: false, blockReason: undefined });
    success('User has been unblocked');
  };

  const getStatusBadge = (status: string, type: 'verification' | 'kyc' | 'role') => {
    const colors = {
      verification: {
        anonymous: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        verified: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        accredited: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      },
      kyc: {
        none: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      },
      role: {
        user: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        creator: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      }
    } as const;
    
    const typeColors = colors[type];
    return (typeColors as any)[status] || (typeColors as any).user || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const mockActivityLog = [
    { action: 'Login', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), details: 'Successful login from 192.168.1.100' },
    { action: 'Investment', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), details: 'Invested $5,000 in Green Energy Project' },
    { action: 'KYC Update', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), details: 'KYC status changed to approved' },
    { action: 'Profile Update', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), details: 'Updated email address' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.name || 'Anonymous User'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.walletAddress}
              </p>
            </div>
            {user.isBlocked && (
              <div className="flex items-center space-x-1 text-red-600">
                <Ban className="w-4 h-4" />
                <span className="text-sm font-medium">Blocked</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            )}
            
            {user.isBlocked ? (
              <button
                onClick={handleUnblock}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Unblock</span>
              </button>
            ) : (
              <button
                onClick={handleBlock}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
              >
                <Ban className="w-4 h-4" />
                <span>Block</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
              { id: 'activity', label: 'Activity Log', icon: <Activity className="w-4 h-4" /> },
              { id: 'compliance', label: 'Compliance', icon: <Shield className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Basic Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{user.name || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{user.email || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Wallet Address
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      {user.walletAddress}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Role & Permissions
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User Role
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.role || user.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value as ManagedUser['role'] })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="user">User</option>
                        <option value="creator">Creator</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${getStatusBadge(user.role, 'role')}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Verification Level
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.verificationLevel || user.verificationLevel}
                        onChange={(e) => setEditForm({ ...editForm, verificationLevel: e.target.value as ManagedUser['verificationLevel'] })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="anonymous">Anonymous</option>
                        <option value="basic">Basic</option>
                        <option value="verified">Verified</option>
                        <option value="accredited">Accredited</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${getStatusBadge(user.verificationLevel, 'verification')}`}>
                        {user.verificationLevel.charAt(0).toUpperCase() + user.verificationLevel.slice(1)}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      KYC Status
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.kycStatus || user.kycStatus}
                        onChange={(e) => setEditForm({ ...editForm, kycStatus: e.target.value as ManagedUser['kycStatus'] })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="none">None</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${getStatusBadge(user.kycStatus, 'kyc')}`}>
                        {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.totalInvestments}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Investments
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.activeProposals}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Active Proposals
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatTimeAgo(user.createdAt)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Member Since
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <Globe className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatTimeAgo(user.lastActive)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notes
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Add notes about this user..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {user.notes || 'No notes added'}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              {mockActivityLog.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.details}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compliance Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      AML Check
                    </span>
                    {user.complianceFlags.amlCheck ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Anti-Money Laundering verification
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sanctions Check
                    </span>
                    {user.complianceFlags.sanctionsCheck ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    International sanctions screening
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      PEP Status
                    </span>
                    {user.complianceFlags.pep ? (
                      <Flag className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Politically Exposed Person check
                  </p>
                </div>
              </div>

              {user.blockReason && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-300">
                        Account Blocked
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        {user.blockReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;