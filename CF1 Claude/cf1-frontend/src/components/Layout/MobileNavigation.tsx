import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  BarChart3, 
  Store, 
  TrendingUp, 
  Rocket, 
  Vote, 
  PieChart,
  User,
  Settings,
  Bell,
  Moon,
  Sun,
  Wallet,
  LogOut,
  Shield
} from 'lucide-react';
import { useMobileNavigation } from '../../hooks/useMobileNavigation';
import { useCosmJS } from '../../hooks/useCosmJS';
import { useVerificationStore } from '../../store/verificationStore';
import { useFeatureToggleStore } from '../../store/featureToggleStore';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';

interface NavigationItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: string;
  description?: string;
}

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode
}) => {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const { focusManagement, overlayClasses, navigationClasses } = useMobileNavigation();
  const { isConnected, address, disconnect } = useCosmJS();
  const { level } = useVerificationStore();
  const { isFeatureEnabled } = useFeatureToggleStore();
  const { isAdmin } = useAdminAuthContext();

  // Focus management
  useEffect(() => {
    if (isOpen && navRef.current) {
      focusManagement(navRef.current);
    }
  }, [isOpen, focusManagement]);

  const isActive = (path: string) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Platform overview and metrics'
    },
    ...(isFeatureEnabled('marketplace') ? [{
      label: 'Marketplace',
      to: '/marketplace',
      icon: <Store className="w-5 h-5" />,
      description: 'Browse tokenized assets'
    }] : []),
    {
      label: 'Portfolio',
      to: '/portfolio',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Your investments and performance'
    },
    ...(isFeatureEnabled('launchpad') ? [{
      label: 'Launchpad',
      to: '/launchpad',
      icon: <Rocket className="w-5 h-5" />,
      description: 'New asset launches'
    }] : []),
    ...(isFeatureEnabled('governance') ? [{
      label: 'Voting',
      to: '/governance',
      icon: <Vote className="w-5 h-5" />,
      description: 'Voting and proposals'
    }] : []),
    ...(isFeatureEnabled('analytics') ? [{
      label: 'Analytics',
      to: '/analytics',
      icon: <PieChart className="w-5 h-5" />,
      description: 'Detailed platform analytics'
    }] : []),
    ...(isAdmin ? [{
      label: 'Admin',
      to: '/admin',
      icon: <Shield className="w-5 h-5" />,
      description: 'Admin functions and management tools'
    }] : [])
  ];

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = () => {
    disconnect();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={overlayClasses}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Navigation Panel */}
      <nav
        ref={navRef}
        id="mobile-navigation"
        className={`${navigationClasses} w-80 max-w-[85vw] overflow-y-auto`}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF1</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">CF1 Platform</span>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* User Section */}
        {isConnected && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Connected Wallet
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Loading...'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    level === 'verified' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : level === 'basic'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                  }`}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="py-6">
          <div className="space-y-1 px-3">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors group ${
                  isActive(item.to)
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`flex-shrink-0 ${
                  isActive(item.to)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
                }`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
                {item.badge && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Account Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 py-6">
          <div className="px-3 mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Account
            </h3>
          </div>
          
          <div className="space-y-1 px-3">
            <Link
              to="/profile"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span>Profile</span>
            </Link>
            
            <Link
              to="/profile/settings"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span>Settings</span>
            </Link>
            
            <button
              onClick={onToggleDarkMode}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          {!isConnected ? (
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Connect your wallet to access all features
              </p>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect Wallet</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};