import React, { useState } from 'react';
import { Shield, Key, Users, Crown, X } from 'lucide-react';
import { useAdminAuthContext, AdminRole } from '../hooks/useAdminAuth';
import { useCosmJS } from '../hooks/useCosmJS';
import { useNotifications } from '../hooks/useNotifications';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<AdminRole>('creator');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { loginAsAdmin } = useAdminAuthContext();
  const { isConnected, connect, address } = useCosmJS();
  const { success, error } = useNotifications();
  
  console.log('AdminLogin render - isConnected:', isConnected, 'address:', address);

  if (!isOpen) return null;

  const handleLogin = async () => {
    console.log('AdminLogin - isConnected:', isConnected);
    console.log('AdminLogin - selectedRole:', selectedRole);
    
    if (!isConnected) {
      error('Please connect your wallet first');
      return;
    }

    if (!selectedRole) {
      error('Please select an admin role');
      return;
    }

    setIsLoggingIn(true);
    try {
      await loginAsAdmin(selectedRole);
      success(`Successfully logged in as ${selectedRole.replace('_', ' ')} admin`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to login as admin');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const roleOptions = [
    {
      value: 'creator' as AdminRole,
      label: 'Creator Admin',
      description: 'Manage your proposals, tokens, and distributions',
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      permissions: ['Proposal Management', 'Token Distribution', 'Analytics View']
    },
    {
      value: 'super_admin' as AdminRole,
      label: 'Super Admin',
      description: 'Full platform access with emergency controls',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      permissions: ['Platform Configuration', 'Emergency Controls', 'Financial Reports', 'All Creator Permissions']
    },
    {
      value: 'platform_admin' as AdminRole,
      label: 'Platform Admin',
      description: 'User management and system monitoring',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      permissions: ['User Management', 'Compliance Monitoring', 'Support Tickets', 'Audit Logs']
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Admin Access
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select your administrative role
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            {roleOptions.map((role) => (
              <div
                key={role.value}
                className={`relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedRole === role.value
                    ? 'border-indigo-500 dark:border-indigo-400'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => setSelectedRole(role.value)}
              >
                <div className={`bg-gradient-to-r ${role.bgColor} dark:from-gray-700 dark:to-gray-800 p-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {role.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {role.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === role.value
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedRole === role.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-2">
                      Key Permissions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/70 dark:bg-gray-600/70 text-xs text-gray-700 dark:text-gray-300 rounded-lg"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isConnected && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    Wallet Connection Required
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Please connect your wallet to access admin features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleLogin}
              disabled={!selectedRole || isLoggingIn}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              {isLoggingIn ? 'Logging in...' : 'Access Admin Panel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;