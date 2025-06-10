import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Zap, Plus, Vote, Eye, User, Settings, LogOut, Moon, Sun } from 'lucide-react';

const SimpleHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
    }
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
      label: isDarkMode ? 'Light Mode' : 'Dark Mode',
      icon: isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      onClick: toggleDarkMode,
      description: isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
    },
    {
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      onClick: () => {
        // Handle logout logic here
        console.log('Signing out...');
      },
      description: 'Sign out of your account'
    }
  ];

  return (
    <header className="bg-blue-200 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CF1</span>
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-white">CF1 Platform</span>
        </div>
        
        <nav className="flex items-center space-x-1">
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
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={dropdownRef}>
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
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.to}
                  onClick={() => setIsQuickActionsOpen(false)}
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
              ))}
            </div>
          )}
        </div>
        
        <button className="px-4 py-2 border border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm">
          Connect Wallet
        </button>
        
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">JD</span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">John Doe</span>
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
      </div>
    </header>
  );
};

export default SimpleHeader;