import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity,
  Calendar,
  Bell,
  Settings,
  Plus
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
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

const DashboardSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-blue-100 border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard</h2>
        
        <nav className="space-y-1">
          <SidebarItem
            icon={<BarChart3 className="w-5 h-5" />}
            label="Overview"
            to="/dashboard"
          />
          <SidebarItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="Performance"
            to="/dashboard/performance"
          />
          <SidebarItem
            icon={<PieChart className="w-5 h-5" />}
            label="Asset Allocation"
            to="/dashboard/allocation"
          />
          <SidebarItem
            icon={<Activity className="w-5 h-5" />}
            label="Recent Activity"
            to="/dashboard/activity"
          />
          <SidebarItem
            icon={<Calendar className="w-5 h-5" />}
            label="Calendar"
            to="/dashboard/calendar"
          />
        </nav>

        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full btn-primary text-sm py-2 flex items-center justify-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Investment</span>
            </button>
            <SidebarItem
              icon={<Bell className="w-5 h-5" />}
              label="Notifications"
              to="/dashboard/notifications"
              badge="3"
            />
            <SidebarItem
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
              to="/dashboard/settings"
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-1">
            Portfolio Value
          </h4>
          <p className="text-2xl font-bold text-blue-700">$124,523</p>
          <p className="text-sm text-green-600 mt-1">+12.5% this month</p>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;