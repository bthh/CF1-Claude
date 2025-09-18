import React from 'react';
import { LogOut, Settings, Crown, Users, Shield } from 'lucide-react';
import { AdminRole } from '../../hooks/useAdminAuth';

export interface AdminHeaderProps {
  adminRole: AdminRole;
  currentView: 'main' | 'admin';
  onToggleView: (view: 'main' | 'admin') => void;
  onExitAdminMode: () => void;
  className?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminRole,
  currentView,
  onToggleView,
  onExitAdminMode,
  className = ''
}) => {
  const getRoleIcon = (role: AdminRole) => {
    switch (role) {
      case 'creator':
        return <Users className="w-5 h-5" />;
      case 'super_admin':
        return <Shield className="w-5 h-5" />;
      case 'owner':
        return <Crown className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getRoleName = (role: AdminRole): string => {
    switch (role) {
      case 'creator':
        return 'Creator Admin';
      case 'super_admin':
        return 'Platform Admin';
      case 'owner':
        return 'Owner';
      default:
        return 'Admin';
    }
  };

  const getRoleGradient = (role: AdminRole): string => {
    switch (role) {
      case 'creator':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700';
      case 'super_admin':
        return 'bg-gradient-to-r from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700';
      case 'owner':
        return 'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700';
    }
  };

  if (!adminRole || currentView !== 'admin') {
    return null;
  }

  return (
    <div className={`${getRoleGradient(adminRole)} border-b border-opacity-20 border-white ${className}`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section: Role Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-white">
              {getRoleIcon(adminRole)}
              <span className="text-lg font-semibold">
                {getRoleName(adminRole)} Mode
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white bg-opacity-30" />
            <div className="hidden sm:block text-white text-opacity-90 text-sm">
              Administrative Dashboard
            </div>
          </div>

          {/* Right Section: Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onExitAdminMode}
              className="flex items-center space-x-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-sm font-medium transition-colors"
              aria-label="Exit admin mode"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Admin Mode</span>
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mt-3 bg-white bg-opacity-20 rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2 text-white text-sm">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>
              You are currently in administrative mode with elevated permissions. 
              Please exercise caution when making changes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;