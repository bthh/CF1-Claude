import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Briefcase, 
  Vote, 
  Rocket, 
  Users,
  FileText,
  HelpCircle,
  ArrowUpDown,
  Droplets,
  Lock,
  ArrowLeftRight,
  DollarSign,
  Shield
} from 'lucide-react';
import { useFeatureToggleStore } from '../../store/featureToggleStore';
import { usePlatformConfigStore } from '../../store/platformConfigStore';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';

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
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left cf1-nav-item transition-all duration-200 hover:transform hover:translate-x-1 ${
        isActive 
          ? 'bg-white/20 text-blue-900 dark:bg-white/10 dark:text-blue-100 active' 
          : 'text-slate-700 dark:text-slate-300 hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-100'
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
  const { isFeatureEnabled } = useFeatureToggleStore();
  const { config } = usePlatformConfigStore();
  const { isAdmin } = useAdminAuthContext();
  
  return (
    <aside className="w-64 cf1-gradient-sidebar border-r border-secondary-200 h-full flex flex-col relative">
      <div className="p-6 space-y-1">
        <nav className="space-y-1">
          <NavItem
            icon={<Home className="w-5 h-5" />}
            label="Dashboard"
            to="/dashboard"
          />
          <NavItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="Marketplace & Trading"
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
            label="Voting"
            to="/governance"
            badge="2"
          />
          {isAdmin && (
            <NavItem
              icon={<Shield className="w-5 h-5" />}
              label="Admin"
              to="/admin"
            />
          )}
        </nav>
      </div>

      <div className="px-6 mt-6">
        <div className="border-t border-secondary-200 pt-6">
          <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
            Trading & DeFi
          </h3>
          <nav className="space-y-1">
            {/* Show secondary trading direct link only if feature is enabled */}
            {isFeatureEnabled('secondary_trading') && (
              <NavItem
                icon={<ArrowLeftRight className="w-5 h-5" />}
                label="Secondary Trading"
                to="/secondary-trading"
              />
            )}
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

      <div className="mt-auto p-6 relative z-10">
        <div className="cf1-portfolio-widget p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
            Portfolio Value
          </h4>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">$124,523</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">+12.5% this month</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;