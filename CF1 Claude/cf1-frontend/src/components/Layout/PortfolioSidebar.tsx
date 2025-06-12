import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  PieChart, 
  History,
  Download,
  Settings,
  Plus,
  DollarSign,
  BarChart3,
  Calendar
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary-50 text-primary-700' 
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

const PortfolioSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-blue-100 border-r border-secondary-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Portfolio</h2>
        
        <nav className="space-y-1 mb-6">
          <SidebarItem
            icon={<Briefcase className="w-5 h-5" />}
            label="Overview"
            to="/portfolio"
          />
          <SidebarItem
            icon={<BarChart3 className="w-5 h-5" />}
            label="Performance"
            to="/portfolio/performance"
          />
          <SidebarItem
            icon={<PieChart className="w-5 h-5" />}
            label="Asset Allocation"
            to="/portfolio/allocation"
          />
          <SidebarItem
            icon={<History className="w-5 h-5" />}
            label="Transaction History"
            to="/portfolio/transactions"
          />
          <SidebarItem
            icon={<DollarSign className="w-5 h-5" />}
            label="Income & Dividends"
            to="/portfolio/income"
          />
          <SidebarItem
            icon={<Calendar className="w-5 h-5" />}
            label="Rebalancing"
            to="/portfolio/rebalancing"
          />
        </nav>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
            Tools
          </h3>
          <div className="space-y-1">
            <button className="w-full btn-outline text-sm py-2 flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <SidebarItem
              icon={<Settings className="w-5 h-5" />}
              label="Portfolio Settings"
              to="/portfolio/settings"
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-xs text-secondary-600">Total Value</p>
              <p className="text-lg font-bold text-secondary-900">$158,700</p>
              <p className="text-xs text-success-600">+4.1% overall</p>
            </div>
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-xs text-secondary-600">Monthly Income</p>
              <p className="text-lg font-bold text-secondary-900">$1,247</p>
              <p className="text-xs text-primary-600">8.3% avg APY</p>
            </div>
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-xs text-secondary-600">Active Assets</p>
              <p className="text-lg font-bold text-secondary-900">5</p>
              <p className="text-xs text-secondary-600">Across 4 categories</p>
            </div>
          </div>
        </div>

        <button className="w-full btn-primary text-sm py-2 flex items-center justify-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Investment</span>
        </button>
      </div>
    </aside>
  );
};

export default PortfolioSidebar;