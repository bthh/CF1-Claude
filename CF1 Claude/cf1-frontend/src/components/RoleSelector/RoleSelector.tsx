import React, { useState } from 'react';
import { ChevronDown, Users, Building, Shield, Crown, UserCheck } from 'lucide-react';
import { SessionRole, useSessionStore, getRoleDisplayName, getRoleDescription } from '../../store/sessionStore';

interface RoleSelectorProps {
  onRoleSelected: (role: SessionRole) => void;
  onCancel?: () => void;
}

const roleOptions: { value: SessionRole; icon: React.ReactNode; color: string }[] = [
  { 
    value: 'investor', 
    icon: <Users className="w-5 h-5" />, 
    color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' 
  },
  { 
    value: 'creator', 
    icon: <Building className="w-5 h-5" />, 
    color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' 
  },
  { 
    value: 'platform_admin', 
    icon: <Shield className="w-5 h-5" />, 
    color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' 
  },
  { 
    value: 'super_admin', 
    icon: <Crown className="w-5 h-5" />, 
    color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' 
  },
  { 
    value: 'owner', 
    icon: <UserCheck className="w-5 h-5" />, 
    color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' 
  }
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelected, onCancel }) => {
  const [selectedRole, setSelectedRole] = useState<SessionRole>('investor');
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleSelect = (role: SessionRole) => {
    setSelectedRole(role);
    setIsOpen(false);
  };

  const handleConfirm = () => {
    onRoleSelected(selectedRole);
  };

  const selectedOption = roleOptions.find(option => option.value === selectedRole);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Select Your Role
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your test role for this session
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-amber-500 flex-shrink-0 mt-0.5"></div>
              <div>
                <p className="font-medium">Test Harness Mode</p>
                <p className="text-xs mt-1">
                  This role selection enables testing of role-based features and permissions. 
                  Your selection will persist for this session only.
                </p>
              </div>
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Session Role
            </label>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 pl-4 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedOption?.color}`}>
                    {selectedOption?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {getRoleDisplayName(selectedRole)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getRoleDescription(selectedRole)}
                    </div>
                  </div>
                </div>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown 
                    className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    aria-hidden="true" 
                  />
                </span>
              </button>

              {isOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 max-h-64 overflow-auto">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleRoleSelect(option.value)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                        option.value === selectedRole 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                          : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${option.color}`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getRoleDisplayName(option.value)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getRoleDescription(option.value)}
                        </div>
                      </div>
                      {option.value === selectedRole && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Role Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedOption?.color}`}>
                {selectedOption?.icon}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Selected: {getRoleDisplayName(selectedRole)}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {getRoleDescription(selectedRole)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between space-x-3">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors"
            >
              Continue with {getRoleDisplayName(selectedRole)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};