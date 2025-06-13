import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Briefcase, 
  Vote, 
  Rocket, 
  BarChart3,
  Users,
  FileText,
  HelpCircle,
  ArrowUpDown,
  Droplets,
  Lock
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
        isActive 
          ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' 
          : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="ml-auto bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-blue-100 border-r border-secondary-200 h-full flex flex-col">
      <div className="p-6 space-y-1">
        <nav className="space-y-1">
          <NavItem
            icon={<Home className="w-5 h-5" />}
            label="Dashboard"
            to="/dashboard"
          />
          <NavItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="Marketplace"
            to="/marketplace"
          />
          <NavItem
            icon={<Briefcase className="w-5 h-5" />}
            label="Portfolio"
            to="/portfolio"
          />
          <NavItem
            icon={<Rocket className="w-5 h-5" />}
            label="Launchpad"
            to="/launchpad"
            badge="3"
          />
          <NavItem
            icon={<Vote className="w-5 h-5" />}
            label="Governance"
            to="/governance"
            badge="2"
          />
          <NavItem
            icon={<BarChart3 className="w-5 h-5" />}
            label="Analytics"
            to="/analytics"
          />
        </nav>
      </div>

      <div className="px-6 mt-6">
        <div className="border-t border-secondary-200 pt-6">
          <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
            DeFi Features
          </h3>
          <nav className="space-y-1">
            <NavItem
              icon={<ArrowUpDown className="w-5 h-5" />}
              label="Trading"
              to="/trading/RWA-1"
            />
            <NavItem
              icon={<Droplets className="w-5 h-5" />}
              label="Liquidity"
              to="/liquidity"
            />
            <NavItem
              icon={<Lock className="w-5 h-5" />}
              label="Staking"
              to="/staking"
            />
          </nav>
        </div>
      </div>

      <div className="px-6">
        <div className="border-t border-secondary-200 pt-6">
          <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
            Account
          </h3>
          <nav className="space-y-1">
            <NavItem
              icon={<Users className="w-5 h-5" />}
              label="Profile"
              to="/profile"
            />
            <NavItem
              icon={<FileText className="w-5 h-5" />}
              label="Documents"
              to="/documents"
            />
            <NavItem
              icon={<HelpCircle className="w-5 h-5" />}
              label="Support"
              to="/support"
            />
          </nav>
        </div>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-primary-900 mb-1">
            Portfolio Value
          </h4>
          <p className="text-2xl font-bold text-primary-700">$124,523</p>
          <p className="text-sm text-success-600 mt-1">+12.5% this month</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;