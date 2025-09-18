import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  FileBarChart, 
  Wrench, 
  Shield,
  Crown,
  UserCheck,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Database,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminRole } from '../../hooks/useAdminAuth';

export interface AdminSidebarProps {
  adminRole: AdminRole;
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminRole,
  className = ''
}) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const getCreatorAdminNavigation = () => [
    {
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      to: '/admin/creator',
      description: 'Creator overview and metrics'
    },
    {
      label: 'My Assets',
      icon: <Briefcase className="w-5 h-5" />,
      to: '/admin/creator/assets',
      description: 'Manage created assets'
    },
    {
      label: 'Proposals',
      icon: <FileText className="w-5 h-5" />,
      to: '/admin/creator/proposals',
      description: 'Asset proposals and reviews'
    },
    {
      label: 'Shareholders',
      icon: <Users className="w-5 h-5" />,
      to: '/admin/creator/shareholders',
      description: 'Manage asset shareholders'
    },
    {
      label: 'Communications',
      icon: <MessageSquare className="w-5 h-5" />,
      to: '/admin/creator/communications',
      description: 'Shareholder communications'
    },
    {
      label: 'Analytics',
      icon: <TrendingUp className="w-5 h-5" />,
      to: '/admin/creator/analytics',
      description: 'Performance analytics'
    },
    {
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      to: '/admin/creator/settings',
      description: 'Creator preferences'
    }
  ];

  const getPlatformAdminNavigation = () => [
    {
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      to: '/admin/platform',
      description: 'Platform overview and metrics'
    },
    {
      label: 'User Management',
      icon: <Users className="w-5 h-5" />,
      to: '/admin/platform/users',
      description: 'Manage platform users'
    },
    {
      label: 'Proposal Queue',
      icon: <FileText className="w-5 h-5" />,
      to: '/admin/platform/proposals',
      description: 'Review pending proposals'
    },
    {
      label: 'Content Moderation',
      icon: <Shield className="w-5 h-5" />,
      to: '/admin/platform/moderation',
      description: 'Content review and moderation'
    },
    {
      label: 'Compliance',
      icon: <UserCheck className="w-5 h-5" />,
      to: '/admin/platform/compliance',
      description: 'Regulatory compliance'
    },
    {
      label: 'System Monitoring',
      icon: <Database className="w-5 h-5" />,
      to: '/admin/platform/monitoring',
      description: 'System health and logs'
    },
    {
      label: 'Reports',
      icon: <FileBarChart className="w-5 h-5" />,
      to: '/admin/platform/reports',
      description: 'Platform reports and analytics'
    },
    {
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      to: '/admin/platform/settings',
      description: 'Platform configuration'
    }
  ];

  const getSuperAdminNavigation = () => [
    {
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      to: '/admin/super',
      description: 'System overview'
    },
    {
      label: 'Admin Management',
      icon: <Crown className="w-5 h-5" />,
      to: '/admin/super/admins',
      description: 'Manage admin users'
    },
    {
      label: 'Feature Toggles',
      icon: <Wrench className="w-5 h-5" />,
      to: '/admin/super/features',
      description: 'Platform feature management'
    },
    {
      label: 'Emergency Controls',
      icon: <AlertTriangle className="w-5 h-5" />,
      to: '/admin/super/emergency',
      description: 'Emergency system controls'
    },
    {
      label: 'Financial Reports',
      icon: <FileBarChart className="w-5 h-5" />,
      to: '/admin/super/financial',
      description: 'Financial oversight'
    },
    {
      label: 'Audit Logs',
      icon: <Clock className="w-5 h-5" />,
      to: '/admin/super/audit',
      description: 'System audit trails'
    },
    {
      label: 'System Maintenance',
      icon: <Database className="w-5 h-5" />,
      to: '/admin/super/maintenance',
      description: 'System maintenance tools'
    }
  ];

  const getNavigationItems = () => {
    switch (adminRole) {
      case 'creator':
        return getCreatorAdminNavigation();
      case 'super_admin':
        return getPlatformAdminNavigation();
      case 'owner':
        return [...getPlatformAdminNavigation(), ...getSuperAdminNavigation()];
      default:
        return [];
    }
  };

  const getRoleColor = (role: AdminRole): string => {
    switch (role) {
      case 'creator':
        return 'text-blue-600 dark:text-blue-400';
      case 'super_admin':
        return 'text-slate-600 dark:text-slate-400';
      case 'owner':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getActiveColor = (role: AdminRole): string => {
    switch (role) {
      case 'creator':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'super_admin':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300';
      case 'owner':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <aside className={`w-64 xl:w-72 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex-shrink-0 ${className}`}>
      <div className="p-4 h-full overflow-y-auto">
        <div className="space-y-6">
          {/* Admin Navigation Header */}
          <div>
            <h2 className={`text-lg font-semibold mb-4 ${getRoleColor(adminRole)}`}>
              Admin Controls
            </h2>
            <nav className="space-y-1">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.to)
                      ? getActiveColor(adminRole)
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  title={item.description}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Actions */}
          <div className={`p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700 rounded-xl`}>
            <h4 className={`text-sm font-semibold mb-3 ${getRoleColor(adminRole)}`}>
              Quick Actions
            </h4>
            <div className="space-y-2">
              {adminRole === 'creator' && (
                <>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Send Update
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <FileText className="w-4 h-4 inline mr-2" />
                    New Proposal
                  </button>
                </>
              )}
              
              {(adminRole === 'super_admin' || adminRole === 'owner') && (
                <>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Approve Proposal
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <XCircle className="w-4 h-4 inline mr-2" />
                    Review Queue
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Admin Status Summary */}
          <div className={`p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl`}>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Admin Status
            </h4>
            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
              <div className="flex justify-between">
                <span>Active Sessions:</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span>Last Login:</span>
                <span className="font-medium">Today</span>
              </div>
              <div className="flex justify-between">
                <span>Permissions:</span>
                <span className="font-medium">
                  {adminRole === 'creator' ? '7' : adminRole === 'super_admin' ? '15' : '20'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;