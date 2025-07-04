import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Zap, Plus, Vote, Eye, User, Settings, LogOut, Moon, Sun, Bell, Wallet, HelpCircle, PlayCircle, Menu, Shield, Crown, Users } from 'lucide-react';
import { MobileNavigation } from './MobileNavigation';
import { useCosmJS } from '../../hooks/useCosmJS';
import { useOnboardingContext } from '../Onboarding/OnboardingProvider';
import { useVerificationStore } from '../../store/verificationStore';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';
import AdminLogin from '../AdminLogin';

const Header: React.FC = () => {
  const location = useLocation();
  
  // CosmJS wallet hook
  const { isConnected, address, connect, disconnect } = useCosmJS();
  
  // Onboarding context
  const { startTour } = useOnboardingContext();
  
  // Verification store
  const { initializeUser, level } = useVerificationStore();
  
  // Admin authentication
  const { isAdmin, adminRole, logoutAdmin } = useAdminAuthContext();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Simple local state for theme and notifications
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Initialize user verification when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      initializeUser(address);
    }
  }, [isConnected, address, initializeUser]);
  
  // Mock notifications for now
  const notifications: any[] = [];
  const unreadCount = 0;
  const markNotificationRead = (id: string) => console.log('Mark read:', id);
  
  // Local state for dropdowns and mobile nav
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    disconnect();
    if (isAdmin) {
      logoutAdmin();
    }
    setIsProfileOpen(false);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  const quickActions = [
    {
      label: 'Investments',
      icon: <Plus className="w-4 h-4" />,
      to: '/portfolio',
      description: 'View your portfolio'
    },
    {
      label: 'Vote for Proposal',
      icon: <Vote className="w-4 h-4" />,
      to: '/governance',
      description: 'All governance proposals'
    },
    {
      label: 'Create New Proposal',
      icon: <Plus className="w-4 h-4" />,
      to: '/launchpad',
      description: 'Submit new asset proposal'
    },
    {
      label: 'Explore',
      icon: <Eye className="w-4 h-4" />,
      to: '/marketplace',
      description: 'Browse marketplace assets'
    },
    {
      label: 'Platform Tour',
      icon: <PlayCircle className="w-4 h-4" />,
      action: () => startTour('welcome-tour'),
      description: 'Take a guided tour'
    },
    {
      label: 'Help & Tours',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => startTour('marketplace-tour'),
      description: 'Get help and tutorials'
    },
    ...(isConnected && !isAdmin ? [{
      label: 'Admin Access',
      icon: <Shield className="w-4 h-4" />,
      action: () => setShowAdminLogin(true),
      description: 'Access admin functions'
    }] : []),
    ...(isAdmin ? [{
      label: `${adminRole?.replace('_', ' ')} Panel`,
      icon: adminRole === 'creator' ? <Users className="w-4 h-4" /> : 
            adminRole === 'super_admin' ? <Crown className="w-4 h-4" /> : 
            <Shield className="w-4 h-4" />,
      to: adminRole === 'creator' ? '/admin/creator' : 
          adminRole === 'super_admin' ? '/admin/super' : 
          '/admin/platform',
      description: `Access ${adminRole?.replace('_', ' ')} dashboard`
    }] : [])
  ];

  const profileActions = [
    {
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
      to: '/profile',
      description: 'Manage your account'
    },
    {
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      to: '/profile/settings',
      description: 'App preferences'
    },
    {
      label: darkMode ? 'Light Mode' : 'Dark Mode',
      icon: darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      onClick: toggleDarkMode,
      description: darkMode ? 'Switch to light mode' : 'Switch to dark mode'
    },
    {
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
      description: 'Sign out of your account'
    }
  ];

  return (
    <>
      <header className="bg-blue-500 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden p-2 hover:bg-blue-600 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-white dark:text-gray-300" />
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF1</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">CF1 Platform</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1" data-tour="main-nav">
          <Link 
            to="/dashboard"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/dashboard') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/marketplace"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/marketplace') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Marketplace
          </Link>
          <Link 
            to="/portfolio"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/portfolio') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Portfolio
          </Link>
          <Link 
            to="/launchpad"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/launchpad') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Launchpad
          </Link>
          <Link 
            to="/governance"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/governance') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Governance
          </Link>
          <Link 
            to="/analytics"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/analytics') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Analytics
          </Link>
          <Link 
            to="/lending"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/lending') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Lending
          </Link>
          {isAdmin && (
            <>
              {adminRole === 'creator' && (
                <Link 
                  to="/admin/creator"
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive('/admin/creator') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 'text-orange-600 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100'
                  }`}
                >
                  Creator Admin
                </Link>
              )}
              {adminRole === 'super_admin' && (
                <Link 
                  to="/admin/super"
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive('/admin/super') ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'text-red-600 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100'
                  }`}
                >
                  Super Admin
                </Link>
              )}
              {adminRole === 'platform_admin' && (
                <Link 
                  to="/admin/platform"
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive('/admin/platform') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'text-green-600 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100'
                  }`}
                >
                  Platform Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden lg:flex items-center space-x-4">
        <div className="relative" ref={dropdownRef} data-tour="quick-actions">
          <button 
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Quick Actions</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${
              isQuickActionsOpen ? 'rotate-180' : ''
            }`} />
          </button>
          
          {isQuickActionsOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              {quickActions.map((action, index) => {
                if (action.to) {
                  return (
                    <Link
                      key={index}
                      to={action.to}
                      onClick={() => setIsQuickActionsOpen(false)}
                      className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full text-left"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                        <div className="text-blue-600">
                          {action.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
                      </div>
                    </Link>
                  );
                } else {
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        action.action?.();
                        setIsQuickActionsOpen(false);
                      }}
                      className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full text-left"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                        <div className="text-blue-600">
                          {action.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
                      </div>
                    </button>
                  );
                }
              })}
            </div>
          )}
        </div>
        
        {/* Notifications */}
        <div className="relative" ref={notificationsRef} data-tour="notifications">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{notification.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Connect Wallet / User Profile */}
        {!isConnected ? (
          <button 
            data-tour="wallet-connect"
            onClick={() => {
              console.log('Connect wallet clicked!');
              connect();
            }}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </button>
        ) : (
          <div className="relative" ref={profileRef} data-tour="profile-menu">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Connected'}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                isProfileOpen ? 'rotate-180' : ''
              }`} />
            </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              {profileActions.map((action, index) => (
                <div key={index}>
                  {action.to ? (
                    <Link
                      to={action.to}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                        <div className="text-blue-600">
                          {action.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        action.onClick?.();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                        action.label.includes('Mode') 
                          ? 'bg-purple-100' 
                          : 'bg-red-100'
                      }`}>
                        <div className={
                          action.label.includes('Mode') 
                            ? 'text-purple-600' 
                            : 'text-red-600'
                        }>
                          {action.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        )}
        </div>

        {/* Mobile Right Section */}
        <div className="flex lg:hidden items-center space-x-2">
          {/* Notifications */}
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 hover:bg-blue-600 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-white dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Connect Wallet / User Profile (simplified for mobile) */}
          {!isConnected ? (
            <button 
              onClick={connect}
              className="p-2 hover:bg-blue-600 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Connect wallet"
            >
              <Wallet className="w-5 h-5 text-white dark:text-gray-300" />
            </button>
          ) : (
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={() => setShowAdminLogin(false)}
      />
    </>
  );
};

export default Header;