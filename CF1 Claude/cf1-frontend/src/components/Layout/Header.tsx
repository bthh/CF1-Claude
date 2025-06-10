import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, ChevronDown, Wallet, Plus, Eye, Vote, Zap } from 'lucide-react';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <header className="bg-blue-800 border-b border-gray-200 h-16 flex items-center justify-between px-6">
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
        
        <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm">
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-medium">Connect Wallet</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">JD</span>
            </div>
            <span className="text-sm font-medium text-gray-700">John Doe</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;