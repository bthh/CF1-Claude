import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, ChevronDown, Plus, Eye, Vote, Zap, User, LogOut, Sun, Moon } from 'lucide-react';
// import { ConnectWalletButton, WalletStatus } from '../WalletConnection';
// import { useCosmJS } from '../../hooks/useCosmJS';

interface NavItemProps {
  label: string;
  to: string;
}

const NavItem: React.FC<NavItemProps> = ({ label, to }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to) || (to === '/dashboard' && location.pathname === '/');

  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  );
};

const Header: React.FC = () => {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  // Temporarily hardcode for debugging
  const isConnected = false;
  const disconnect = () => console.log('disconnect');

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

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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
      to: '/governance/active',
      description: 'Active voting proposals'
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
    }
  ];

  return (
    <header className="bg-gray-800 border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CF1</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">CF1 Platform</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-1">
          <NavItem label="Dashboard" to="/dashboard" />
          <NavItem label="Marketplace" to="/marketplace" />
          <NavItem label="Portfolio" to="/portfolio" />
          <NavItem label="Launchpad" to="/launchpad" />
          <NavItem label="Governance" to="/governance" />
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Quick Actions</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${
              isQuickActionsOpen ? 'rotate-180' : ''
            }`} />
          </button>
          
          {isQuickActionsOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.to}
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <div className="text-blue-600">
                      {action.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={() => alert('Connect wallet clicked!')}
          className="bg-red-500 border border-gray-300 hover:bg-gray-50 text-white font-medium px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <span className="text-sm font-medium">TEST WALLET BUTTON</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                isProfileOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {isConnected ? 'Connected Account' : 'John Doe'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isConnected ? 'Wallet Connected' : 'john.doe@cf1platform.com'}
                  </p>
                </div>
                
                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Profile</span>
                </Link>
                
                <Link
                  to="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Settings</span>
                </Link>
                
                <button
                  onClick={() => {
                    toggleDarkMode();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
                
                {isConnected && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={() => {
                        disconnect();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Disconnect Wallet</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;