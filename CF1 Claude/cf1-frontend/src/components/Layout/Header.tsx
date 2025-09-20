import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Zap, Plus, Vote, Eye, User, Settings, LogOut, Moon, Sun, Bell, Wallet, HelpCircle, PlayCircle, Menu, Shield, Crown, Users, Info, Mail, MessageSquare } from 'lucide-react';
import CF1Button from '../UI/CF1Button';
import { MobileNavigation } from './MobileNavigation';
import { useMobileNavigation } from '../../hooks/useMobileNavigation';
import { useCosmJS } from '../../hooks/useCosmJS';
import { useOnboardingContext } from '../Onboarding/OnboardingProvider';
import { useVerificationStore } from '../../store/verificationStore';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';
import { useSessionStore, SessionRole } from '../../store/sessionStore';
import { useUnifiedAuthStore, isWalletUser, isEmailUser } from '../../store/unifiedAuthStore';
import UnifiedAuthModal from '../Auth/UnifiedAuthModal';
import { useFeatureToggleStore } from '../../store/featureToggleStore';
import { RoleSelector } from '../RoleSelector';
import AdminLogin from '../AdminLogin';
import { NotificationBell } from '../Notifications';
import { HeaderSearch } from '../Search';
import { useNotifications } from '../../hooks/useNotifications';
import { useDataMode } from '../../store/dataModeStore';
import { PortfolioTestingPanel } from '../Debug/PortfolioTestingPanel';
import { useAdminViewStore } from '../../store/adminViewStore';
import { useUIStore } from '../../store/uiStore';
import { UserPathController } from '../Onboarding/UserPathController';
import { OnboardingWelcome } from '../Onboarding/OnboardingWelcome';
import SupportTicketModal from '../Support/SupportTicketModal';

const Header: React.FC = () => {
  const location = useLocation();
  
  // CosmJS wallet hook
  const { isConnected, address, connect, disconnect } = useCosmJS();
  
  // Unified authentication
  const { 
    isAuthenticated: isUnifiedAuthenticated, 
    user: unifiedUser, 
    showAuthModal,
    showLogin,
    hideAuthModal,
    logout: unifiedLogout
  } = useUnifiedAuthStore();
  
  // Onboarding context
  const { startTour, completedTours, userPreferences, updatePreferences } = useOnboardingContext();
  
  // Verification store
  const { initializeUser, level, updateProfile, submitBasicVerification, submitIdentityVerification, submitAccreditedVerification } = useVerificationStore();
  
  // Notifications
  const { success } = useNotifications();
  
  // Admin authentication
  const { 
    isAdmin, 
    adminRole, 
    logoutAdmin, 
    hasAccessToCreatorAdmin, 
    hasAccessToPlatformAdmin 
  } = useAdminAuthContext();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showTestingPanel, setShowTestingPanel] = useState(false);
  const [showUserPathFlow, setShowUserPathFlow] = useState(false);
  const [showWelcomeTours, setShowWelcomeTours] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  // Feature toggles
  const { isFeatureEnabled } = useFeatureToggleStore();
  
  // Session role management
  const { selectedRole, isRoleSelected, setRole, clearRole } = useSessionStore();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  
  // Data mode management
  const { currentMode } = useDataMode();
  
  // Admin view management
  const { currentView, toggleView, setAdminView, exitAdminView } = useAdminViewStore();

  // UI store for centralized dark mode management
  const { darkMode, toggleDarkMode } = useUIStore();
  
  // Initialize user verification when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      initializeUser(address);
    }
  }, [isConnected, address, initializeUser]);
  
  
  // Local state for dropdowns
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Mobile navigation hook
  const { isOpen: isMobileNavOpen, openNavigation: openMobileNav, closeNavigation: closeMobileNav } = useMobileNavigation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
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
    // Clear session role on logout
    clearRole();
    setIsProfileOpen(false);
  };
  
  // Handle unified authentication
  const handleSignIn = () => {
    showLogin();
  };

  // Handle wallet connection with role selection (legacy support)
  const handleConnectWallet = () => {
    if (!isRoleSelected) {
      // Show role selector first
      setShowRoleSelector(true);
    } else {
      // Role already selected, proceed with wallet connection
      connect();
    }
  };

  // Handle unified logout
  const handleUnifiedLogout = async () => {
    await unifiedLogout();
    // Also disconnect wallet if connected
    if (isConnected) {
      disconnect();
    }
    clearRole();
    setIsProfileOpen(false);
  };
  
  // Handle role selection completion
  const handleRoleSelected = (role: SessionRole) => {
    setRole(role);
    setShowRoleSelector(false);
    // Proceed with wallet connection after role selection
    connect();
  };
  
  // Create a test user with full verification for easier testing
  const createTestUser = async () => {
    if (!isConnected || !address) {
      connect();
      return;
    }
    
    try {
      // Initialize user
      initializeUser(address);
      
      // Complete profile
      await updateProfile({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@cf1platform.com',
        phone: '+1-555-0123',
        dateOfBirth: '1990-01-01'
      });
      
      // Complete basic verification
      await submitBasicVerification({
        email: 'testuser@cf1platform.com',
        phone: '+1-555-0123',
        dateOfBirth: '1990-01-01',
        country: 'US'
      });
      
      // Complete identity verification
      await submitIdentityVerification({
        idType: 'passport',
        idNumber: 'TEST123456789',
        documentImages: ['test-id-front.jpg', 'test-id-back.jpg'],
        selfieImage: 'test-selfie.jpg',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'CA',
          zipCode: '90210',
          country: 'US'
        }
      });
      
      // Complete accredited investor verification
      await submitAccreditedVerification({
        verificationType: 'net_worth',
        income: 250000,
        netWorth: 1500000,
        documentation: ['test-tax-return.pdf', 'test-bank-statement.pdf'],
        cpaLetter: 'test-cpa-letter.pdf'
      });
      
      success('Test User Created', 'Full verification completed for testing purposes');
    } catch (error) {
      console.error('Error creating test user:', error);
    }
  };
  
  const isActive = (path: string) => {
    // Special case for dashboard root
    if (path === '/dashboard' && location.pathname === '/') {
      return true;
    }

    // Special case for launchpad - include related pages
    if (path === '/launchpad') {
      return location.pathname === '/launchpad' ||
             location.pathname.startsWith('/launchpad/') ||
             location.pathname === '/my-submissions';
    }

    // Special case for governance - include related pages
    if (path === '/governance') {
      return location.pathname === '/governance' ||
             location.pathname.startsWith('/governance/');
    }

    // Default exact match
    return location.pathname === path;
  };

  // Helper to check if user is platform or super admin
  // Check both old admin auth system and unified auth system
  const user = unifiedUser; // Rename for clarity
  const unifiedAuthIsAdmin = user && (user.role === 'super_admin' || user.role === 'platform_admin' || user.role === 'creator_admin' || user.role === 'owner');

  // Local development: Show admin access ONLY for wallet connections on localhost
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const walletAdminAccess = isLocalhost && isConnected && address; // Only wallet connections

  const combinedIsAdmin = isAdmin || unifiedAuthIsAdmin || walletAdminAccess;
  const combinedAdminRole = adminRole || (user?.role === 'super_admin' ? 'super_admin' : user?.role === 'platform_admin' ? 'platform_admin' : user?.role === 'creator_admin' ? 'creator_admin' : user?.role === 'owner' ? 'owner' : walletAdminAccess ? 'platform_admin' : null);
  const isPlatformOrSuperAdmin = adminRole === 'platform_admin' || adminRole === 'super_admin' || user?.role === 'platform_admin' || user?.role === 'super_admin' || user?.role === 'owner' || walletAdminAccess;
  
  // Debug logging for production troubleshooting
  console.log('🔍 Header Debug Info:', {
    oldAdminAuth: { isAdmin, adminRole },
    unifiedAuth: { isAuthenticated: isUnifiedAuthenticated, userRole: user?.role },
    wallet: { isConnected, address: address?.slice(0, 8) },
    localDev: { isLocalhost, walletAdminAccess },
    combined: { combinedIsAdmin, combinedAdminRole, isPlatformOrSuperAdmin },
    currentMode: currentMode,
    location: location.pathname
  });

  const quickActions = [
    {
      label: 'Get Started',
      icon: <PlayCircle className="w-4 h-4" />,
      action: () => setShowUserPathFlow(true),
      description: 'Choose your path: Investor, Creator, or Trader'
    },
    {
      label: 'Tutorials & Tours',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => setShowWelcomeTours(true),
      description: 'Interactive tours and tutorials for all platform features'
    },
    {
      label: 'Marketplace Tour',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => startTour('marketplace-tour'),
      description: 'Learn to browse and invest in tokenized assets'
    },
    {
      label: 'Portfolio Guide',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => startTour('portfolio-tour'),
      description: 'Manage and track your investments'
    },
    {
      label: 'Governance Voting',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => startTour('governance-tour'),
      description: 'Participate in asset governance and voting'
    },
    {
      label: 'Support Ticket',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => setShowSupportModal(true),
      description: 'Get help from our support team'
    },
    // Add portfolio testing panel for development
    ...(currentMode === 'development' ? [{
      label: 'Portfolio Testing',
      icon: <Shield className="w-4 h-4" />,
      action: () => setShowTestingPanel(true),
      description: 'Test investment-to-portfolio workflow'
    }] : []),
    // Admin-only actions - only show for platform and super admins
    ...(isPlatformOrSuperAdmin ? [{
      label: 'Change Role',
      icon: <Users className="w-4 h-4" />,
      action: () => setShowRoleSelector(true),
      description: 'Select different role for testing'
    }] : []),
    ...(isPlatformOrSuperAdmin ? [{
      label: 'Create Test User',
      icon: <Shield className="w-4 h-4" />,
      action: createTestUser,
      description: 'Create fully verified test user for easier testing'
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
      onClick: isUnifiedAuthenticated ? handleUnifiedLogout : handleLogout,
      description: 'Sign out of your account'
    }
  ];

  return (
    <>
      <header className="cf1-gradient-header border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 sm:px-6 relative z-[1002]">
        <div className="flex items-center space-x-4">
          
          {/* Mobile Menu Button */}
          <button
            onClick={openMobileNav}
            className="lg:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-blue-600 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
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
          
          {/* Data Mode Indicator */}
          <div className={`px-2 py-1 rounded-md text-xs font-medium ${
            currentMode === 'development' 
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
              : currentMode === 'demo'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {currentMode.toUpperCase()} MODE
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1" data-tour="main-nav">
          <Link
            to="/dashboard"
            className={`px-4 py-3 min-h-[44px] flex items-center rounded-lg text-sm font-medium touch-manipulation ${
              isActive('/dashboard') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          {isFeatureEnabled('marketplace') && (
            <Link
              to="/marketplace"
              className={`px-4 py-3 min-h-[44px] flex items-center rounded-lg text-sm font-medium touch-manipulation ${
                isActive('/marketplace') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Marketplace
            </Link>
          )}
          {isFeatureEnabled('launchpad') && (
            <Link
              to="/launchpad"
              className={`px-4 py-3 min-h-[44px] flex items-center rounded-lg text-sm font-medium touch-manipulation ${
                isActive('/launchpad') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Launchpad
            </Link>
          )}
          <Link
            to="/discovery"
            className={`px-4 py-3 min-h-[44px] flex items-center rounded-lg text-sm font-medium touch-manipulation ${
              isActive('/discovery') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Discovery
          </Link>
          {isFeatureEnabled('governance') && (
            <Link 
              to="/governance"
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isActive('/governance') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Voting
            </Link>
          )}
          {isFeatureEnabled('analytics') && (
            <Link 
              to="/analytics"
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isActive('/analytics') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Analytics
            </Link>
          )}
          {combinedIsAdmin && (
            <Link 
              to={combinedAdminRole === 'creator_admin' ? '/admin/creator' : '/admin'}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                location.pathname.startsWith('/admin') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              {combinedAdminRole === 'creator_admin' ? 'Creator' : 'Admin'}
            </Link>
          )}
        </nav>

        {/* Search Bar */}
        <div className="hidden lg:block flex-1 max-w-lg mx-8">
          <HeaderSearch />
        </div>

        {/* Desktop Right Section */}
        <div className="hidden lg:flex items-center space-x-4">
        <div className="relative" ref={dropdownRef} data-tour="quick-actions">
          <button 
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="p-2 border border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title="Information and Actions"
          >
            <Info className="w-4 h-4" />
          </button>
          
          {isQuickActionsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-[1003] cf1-animate-scale-in">
              {/* Welcome Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Welcome to CF1 Platform
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Tokenized real-world assets with enterprise-grade compliance
                </p>
              </div>
              
              {quickActions.map((action, index) => {
                if (action.to) {
                  return (
                    <Link
                      key={index}
                      to={action.to}
                      onClick={() => setIsQuickActionsOpen(false)}
                      className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 w-full text-left cf1-animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
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
                      className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 w-full text-left cf1-animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
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
        <div data-tour="notifications">
          <NotificationBell />
        </div>

        {/* Sign In / User Profile */}
        {!isUnifiedAuthenticated && !isConnected ? (
          <CF1Button
            data-tour="sign-in"
            onClick={handleSignIn}
            variant="primary"
            size="sm"
            icon={User}
            iconPosition="left"
            className="text-sm font-semibold"
          >
            Sign In
          </CF1Button>
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
                  {unifiedUser?.displayName || unifiedUser?.email?.split('@')[0] || 'Account'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                  {unifiedUser && (
                    <>
                      {isEmailUser(unifiedUser) && <Mail className="w-3 h-3" />}
                      {isWalletUser(unifiedUser) && <Wallet className="w-3 h-3" />}
                    </>
                  )}
                  <span>
                    {unifiedUser?.email ? unifiedUser.email :
                     address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Connected'}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                isProfileOpen ? 'rotate-180' : ''
              }`} />
            </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-[1003] cf1-animate-scale-in">
              {profileActions.map((action, index) => (
                <div key={index}>
                  {action.to ? (
                    <Link
                      to={action.to}
                      onClick={(e) => {
                        setIsProfileOpen(false);
                      }}
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
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
          <NotificationBell className="text-white dark:text-gray-300" />

          {/* Connect Wallet / User Profile (simplified for mobile) */}
          {!isConnected ? (
            <button 
              onClick={handleConnectWallet}
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
        onClose={closeMobileNav}
      />

      {/* Role Selector Modal */}
      {showRoleSelector && (
        <RoleSelector
          onRoleSelected={handleRoleSelected}
          onCancel={() => setShowRoleSelector(false)}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={() => setShowAdminLogin(false)}
      />

      {/* Portfolio Testing Panel */}
      <PortfolioTestingPanel
        isOpen={showTestingPanel}
        onClose={() => setShowTestingPanel(false)}
      />

      {/* User Path Flow */}
      <UserPathController
        isOpen={showUserPathFlow}
        onClose={() => setShowUserPathFlow(false)}
      />
      
      {/* Tutorials & Tours Modal */}
      <OnboardingWelcome
        isOpen={showWelcomeTours}
        onClose={() => setShowWelcomeTours(false)}
        onStartTour={(tourId) => {
          setShowWelcomeTours(false);
          startTour(tourId);
        }}
        completedTours={completedTours}
        userPreferences={userPreferences}
        onUpdatePreferences={updatePreferences}
      />
      
      {/* Unified Authentication Modal */}
      <UnifiedAuthModal
        isOpen={showAuthModal}
        onClose={hideAuthModal}
      />

      {/* Support Ticket Modal */}
      <SupportTicketModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </>
  );
};

export default Header;