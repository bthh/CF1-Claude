import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Search, Filter, ArrowUpDown } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: string;
  currentValue: number;
  totalChange: number;
  changePercent: number;
  locked: boolean;
}

const PortfolioPerformance: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Asset>('currentValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const assets: Asset[] = [
    {
      id: '1',
      name: 'Manhattan Office Complex',
      type: 'Commercial Real Estate',
      currentValue: 45230,
      totalChange: 2350,
      changePercent: 5.2,
      locked: false
    },
    {
      id: '2',
      name: 'Gold Bullion Vault',
      type: 'Precious Metals',
      currentValue: 23450,
      totalChange: 485,
      changePercent: 2.1,
      locked: true
    },
    {
      id: '3',
      name: 'Tesla Model S Collection',
      type: 'Luxury Vehicles',
      currentValue: 18900,
      totalChange: -250,
      changePercent: -1.3,
      locked: false
    },
    {
      id: '4',
      name: 'Picasso Artwork',
      type: 'Fine Art',
      currentValue: 35120,
      totalChange: 2820,
      changePercent: 8.7,
      locked: true
    },
    {
      id: '5',
      name: 'Miami Beach Resort',
      type: 'Hospitality',
      currentValue: 68450,
      totalChange: 4230,
      changePercent: 6.6,
      locked: false
    },
    {
      id: '6',
      name: 'Tech Startup Equity',
      type: 'Private Equity',
      currentValue: 12800,
      totalChange: 1200,
      changePercent: 10.3,
      locked: true
    }
  ];

  const handleSort = (field: keyof Asset) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedAssets = assets
    .filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || asset.type === filterType;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'locked' && asset.locked) ||
                           (filterStatus === 'unlocked' && !asset.locked);
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * multiplier;
      }
      return String(aValue).localeCompare(String(bValue)) * multiplier;
    });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const assetTypes = Array.from(new Set(assets.map(asset => asset.type)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Performance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your portfolio performance and asset details.</p>
        </div>
      </div>

      {/* Account Value Chart Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio Value</h2>
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32 h-9">
            <option>30 days</option>
            <option>90 days</option>
            <option>1 year</option>
          </select>
        </div>
        <div className="h-64 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute inset-4 opacity-10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-gray-300 dark:border-gray-600" style={{height: '20%'}}></div>
            ))}
          </div>
          
          <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.05"/>
              </linearGradient>
            </defs>
            
            <path
              d="M 10 160 Q 50 140 75 120 T 120 100 T 160 85 T 200 75 T 240 60 T 280 50 L 280 180 L 10 180 Z"
              fill="url(#chartGradient)"
              stroke="none"
            />
            
            <path
              d="M 10 160 Q 50 140 75 120 T 120 100 T 160 85 T 200 75 T 240 60 T 280 50"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              className="drop-shadow-sm"
            />
            
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
          
          <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Jan 1</span>
            <span>Jan 8</span>
            <span>Jan 15</span>
            <span>Jan 22</span>
            <span>Jan 30</span>
          </div>
          
          <div className="absolute top-2 left-4 flex flex-col justify-between h-48 text-xs text-gray-500 dark:text-gray-400">
            <span>$140k</span>
            <span>$130k</span>
            <span>$120k</span>
            <span>$110k</span>
            <span>$100k</span>
          </div>
          
          <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
            +12.5% ↗
          </div>
        </div>
      </div>

      {/* Assets Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      {/* Assets Grid Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assets Held</h2>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search assets..."
                className="px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-40"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {assetTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="locked">Locked</option>
              <option value="unlocked">Unlocked</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Asset Name</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Type</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('currentValue')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white ml-auto"
                  >
                    <span>Current Value</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('totalChange')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white ml-auto"
                  >
                    <span>Total Change</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-center py-3 px-4">
                  <button
                    onClick={() => handleSort('locked')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white mx-auto"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 cursor-pointer">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg"></div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{asset.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-600 dark:text-gray-400">{asset.type}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(asset.currentValue)}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {asset.totalChange >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <div className="text-right">
                        <p className={`font-semibold ${asset.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(asset.totalChange))}
                        </p>
                        <p className={`text-sm ${asset.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {asset.totalChange >= 0 ? '+' : ''}{asset.changePercent}%
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      asset.locked 
                        ? 'bg-warning-100 text-warning-800' 
                        : 'bg-green-100 dark:bg-green-900/20 text-green-800'
                    }`}>
                      {asset.locked ? 'Locked' : 'Unlocked'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedAssets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No assets found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPerformance;