import React from 'react';
import { Settings, User, ChevronDown } from 'lucide-react';
import { AdminRole } from '../../hooks/useAdminAuth';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface AdminViewToggleProps {
  currentView: 'main' | 'admin';
  adminRole: AdminRole;
  onToggle: (view: 'main' | 'admin') => void;
  hasPermission?: boolean;
  className?: string;
}

export const AdminViewToggle: React.FC<AdminViewToggleProps> = ({
  currentView,
  adminRole,
  onToggle,
  hasPermission = true,
  className = ''
}) => {
  const { announceToScreenReader } = useAccessibility();

  const handleToggle = () => {
    if (!hasPermission) return;
    
    const newView = currentView === 'main' ? 'admin' : 'main';
    onToggle(newView);
    
    // Announce the change to screen readers
    announceToScreenReader(
      `Switched to ${newView} view${adminRole ? ` as ${adminRole.replace('_', ' ')} admin` : ''}`
    );
  };

  const getRoleDisplayName = (role: AdminRole): string => {
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

  const getRoleColor = (role: AdminRole): string => {
    switch (role) {
      case 'creator':
        return 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700';
      case 'super_admin':
        return 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700';
      case 'owner':
        return 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700';
      default:
        return 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700';
    }
  };

  if (!hasPermission || !adminRole) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        role="switch"
        aria-checked={currentView === 'admin'}
        aria-label={`Switch to ${currentView === 'main' ? 'admin' : 'main'} view`}
        aria-describedby="admin-toggle-description"
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${currentView === 'admin' 
            ? `text-white ${getRoleColor(adminRole)}` 
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
          }
        `}
      >
        {currentView === 'admin' ? (
          <Settings className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
        <span>
          {currentView === 'admin' ? getRoleDisplayName(adminRole) : 'Main View'}
        </span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Screen reader description */}
      <div id="admin-toggle-description" className="sr-only">
        Currently in {currentView} view. 
        {adminRole && ` Admin role: ${getRoleDisplayName(adminRole)}`}
      </div>
    </div>
  );
};

export default AdminViewToggle;