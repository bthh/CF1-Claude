import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnalyticsDashboard } from '../components/Analytics/AnalyticsDashboard';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          </div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

interface AssetCardProps {
  id: string;
  name: string;
  type: string;
  value: string;
  change: string;
  isPositive: boolean;
  imageUrl?: string;
  onClick?: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ id, name, type, value, change, isPositive, imageUrl, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Dashboard AssetCard clicked:', name, 'ID:', id);
    alert(`Clicked: ${name}`);
    navigate(`/marketplace/asset/${id}`);
  };

  return (
    <div 
      className="bg-blue-100 border-2 border-blue-500 rounded-lg p-4 cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => console.log('Mouse entered card:', name)}
    >
      <div className="flex items-center space-x-3" style={{ pointerEvents: 'none' }}>
        <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">{type}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-green-600">{change}</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const stats = [
    {
      title: 'Total Portfolio Value',
      value: '$124,523',
      change: '+12.5%',
      isPositive: true,
      icon: <DollarSign className="w-6 h-6 text-blue-600" />
    },
    {
      title: 'Active Investments',
      value: '12',
      change: '+2 this month',
      isPositive: true,
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />
    },
    {
      title: 'Monthly Returns',
      value: '8.3%',
      change: '+1.2%',
      isPositive: true,
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />
    },
    {
      title: 'Governance Votes',
      value: '5',
      change: 'Active',
      isPositive: true,
      icon: <Eye className="w-6 h-6 text-blue-600" />
    }
  ];

  const topPerformers = [
    {
      id: 'beverly-hills-estate',
      name: 'Beverly Hills Estate',
      type: 'Luxury Real Estate',
      value: '$2.4M',
      change: '+15.8%',
      isPositive: true,
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop'
    },
    {
      id: 'vintage-wine-collection',
      name: 'Vintage Wine Collection',
      type: 'Collectibles',
      value: '$850K',
      change: '+12.3%',
      isPositive: true,
      imageUrl: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=300&fit=crop'
    },
    {
      id: 'swiss-watch-portfolio',
      name: 'Swiss Watch Portfolio',
      type: 'Luxury Goods',
      value: '$1.2M',
      change: '+9.4%',
      isPositive: true,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'
    },
    {
      id: 'london-commercial-space',
      name: 'London Commercial Space',
      type: 'Commercial Real Estate',
      value: '$3.1M',
      change: '+7.9%',
      isPositive: true,
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here is a look into Real World Assets within CF1!</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-10 flex items-center space-x-2 rounded-lg">
          <Plus className="w-4 h-4" />
          <span>New Investment</span>
        </button>
      </div>

      {/* Stats Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Portfolio & Assets Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Total RWA Tokenized on CF1</h2>
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32 h-9">
              <option>30 days</option>
              <option>90 days</option>
              <option>1 year</option>
            </select>
          </div>
          <div className="h-64 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 relative overflow-hidden">
            {/* Chart Grid */}
            <div className="absolute inset-4 opacity-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-gray-300 dark:border-gray-600" style={{height: '20%'}}></div>
              ))}
            </div>
            
            {/* Mock Chart Line */}
            <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.05"/>
                </linearGradient>
              </defs>
              
              {/* Chart Area */}
              <path
                d="M 10 160 Q 50 140 75 120 T 120 100 T 160 85 T 200 75 T 240 60 T 280 50 L 280 180 L 10 180 Z"
                fill="url(#chartGradient)"
                stroke="none"
              />
              
              {/* Chart Line */}
              <path
                d="M 10 160 Q 50 140 75 120 T 120 100 T 160 85 T 200 75 T 240 60 T 280 50"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                className="drop-shadow-sm"
              />
              
              {/* Data Points */}
              {[
                {x: 10, y: 160}, {x: 75, y: 120}, {x: 120, y: 100}, 
                {x: 160, y: 85}, {x: 200, y: 75}, {x: 240, y: 60}, {x: 280, y: 50}
              ].map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#10B981"
                  className="drop-shadow-sm"
                />
              ))}
            </svg>
            
            {/* Chart Labels */}
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Jan 1</span>
              <span>Jan 8</span>
              <span>Jan 15</span>
              <span>Jan 22</span>
              <span>Jan 30</span>
            </div>
            
            {/* Value Labels */}
            <div className="absolute top-2 left-4 flex flex-col justify-between h-48 text-xs text-gray-500 dark:text-gray-400">
              <span>$140k</span>
              <span>$130k</span>
              <span>$120k</span>
              <span>$110k</span>
              <span>$100k</span>
            </div>
            
            {/* Current Value Indicator */}
            <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
              +12.5% ↗
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Performers</h2>
            <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {topPerformers.map((asset, index) => (
              <div
                key={asset.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
                onClick={() => {
                  console.log('Direct onClick - Asset clicked:', asset.name);
                  navigate(`/marketplace/asset/${asset.id}`);
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {asset.imageUrl ? (
                      <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{asset.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{asset.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{asset.value}</p>
                    <p className={`text-sm ${asset.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {asset.change}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions & Proposals Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Proposals</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Property Renovation</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manhattan Office</p>
              </div>
              <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-1 rounded-full">
                Voting
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dividend Distribution</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gold Vault</p>
              </div>
              <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                Passed
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Launches</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">SF</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">San Francisco Penthouse</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Launching in 2 days</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">WA</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Wine Collection</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Launching next week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg py-2 px-3 flex items-center justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Create Proposal
            </button>
            <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg py-2 px-3 flex items-center justify-start">
              <Eye className="w-4 h-4 mr-2" />
              Browse Marketplace
            </button>
            <button 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg py-2 px-3 flex items-center justify-start"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <AnalyticsDashboard />
        </div>
      )}
    </div>
  );
};

export default Dashboard;