import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  Building,
  Gem,
  Car,
  Palette
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  count?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, count }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary-50 text-primary-700' 
          : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className="flex-shrink-0">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      {count && (
        <span className="text-sm text-secondary-500">{count}</span>
      )}
    </Link>
  );
};

const MarketplaceSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-blue-100 border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Marketplace</h2>
        
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search assets..."
              className="input pl-10 text-sm"
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-secondary-700 mb-3">Categories</h3>
          <nav className="space-y-1">
            <SidebarItem
              icon={<Filter className="w-4 h-4" />}
              label="All Assets"
              to="/marketplace"
              count={24}
            />
            <SidebarItem
              icon={<Building className="w-4 h-4" />}
              label="Real Estate"
              to="/marketplace/real-estate"
              count={12}
            />
            <SidebarItem
              icon={<Gem className="w-4 h-4" />}
              label="Precious Metals"
              to="/marketplace/precious-metals"
              count={5}
            />
            <SidebarItem
              icon={<Palette className="w-4 h-4" />}
              label="Art & Collectibles"
              to="/marketplace/art"
              count={4}
            />
            <SidebarItem
              icon={<Car className="w-4 h-4" />}
              label="Luxury Vehicles"
              to="/marketplace/vehicles"
              count={3}
            />
          </nav>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-secondary-700 mb-3">Filters</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-secondary-600 mb-2 block">
                Price Range
              </label>
              <div className="flex items-center space-x-2">
                <input className="input h-8 text-xs" placeholder="Min" />
                <span className="text-secondary-500">-</span>
                <input className="input h-8 text-xs" placeholder="Max" />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-secondary-600 mb-2 block">
                Min APY
              </label>
              <select className="input h-8 text-xs">
                <option>Any</option>
                <option>5%+</option>
                <option>8%+</option>
                <option>10%+</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-secondary-600 mb-2 block">
                Location
              </label>
              <select className="input h-8 text-xs">
                <option>All Locations</option>
                <option>New York</option>
                <option>California</option>
                <option>International</option>
              </select>
            </div>

            <button className="w-full btn-primary text-xs py-2">
              Apply Filters
            </button>
          </div>
        </div>

        <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-4 h-4 text-warning-600" />
            <span className="text-sm font-semibold text-warning-800">Featured</span>
          </div>
          <p className="text-xs text-warning-700">
            Premium assets with verified returns and high liquidity.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default MarketplaceSidebar;