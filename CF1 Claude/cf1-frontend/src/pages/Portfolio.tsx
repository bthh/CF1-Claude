import React, { useState } from 'react';
import { TrendingUp, TrendingDown, MoreHorizontal, Download, Eye, Settings } from 'lucide-react';

interface PortfolioAssetProps {
  id: string;
  name: string;
  type: string;
  tokens: number;
  currentValue: string;
  purchaseValue: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  apy: string;
  imageUrl?: string;
}

const PortfolioAsset: React.FC<PortfolioAssetProps> = ({
  name,
  type,
  tokens,
  currentValue,
  purchaseValue,
  change,
  changePercent,
  isPositive,
  apy,
  imageUrl
}) => {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm">{name.charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{type}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{tokens.toLocaleString()}</td>
      <td className="px-6 py-4">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{currentValue}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{purchaseValue} invested</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-medium">{change}</span>
          <span className="text-sm">({changePercent})</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-green-600 font-medium">{apy}</span>
      </td>
      <td className="px-6 py-4">
        <button className="p-1 hover:bg-secondary-200 rounded transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </td>
    </tr>
  );
};

const Portfolio: React.FC = () => {
  const [timeframe, setTimeframe] = useState('30d');
  
  const portfolioAssets: PortfolioAssetProps[] = [
    {
      id: '1',
      name: 'Manhattan Office Complex',
      type: 'Commercial Real Estate',
      tokens: 450,
      currentValue: '$45,230',
      purchaseValue: '$42,800',
      change: '+$2,430',
      changePercent: '+5.7%',
      isPositive: true,
      apy: '8.5%'
    },
    {
      id: '2',
      name: 'Gold Bullion Vault',
      type: 'Precious Metals',
      tokens: 580,
      currentValue: '$29,450',
      purchaseValue: '$28,800',
      change: '+$650',
      changePercent: '+2.3%',
      isPositive: true,
      apy: '6.2%'
    },
    {
      id: '3',
      name: 'Tesla Model S Collection',
      type: 'Luxury Vehicles',
      tokens: 125,
      currentValue: '$18,900',
      purchaseValue: '$19,500',
      change: '-$600',
      changePercent: '-3.1%',
      isPositive: false,
      apy: '9.1%'
    },
    {
      id: '4',
      name: 'Modern Art Collection',
      type: 'Fine Art',
      tokens: 75,
      currentValue: '$15,120',
      purchaseValue: '$13,900',
      change: '+$1,220',
      changePercent: '+8.8%',
      isPositive: true,
      apy: '12.3%'
    },
    {
      id: '5',
      name: 'Miami Beach Resort',
      type: 'Hospitality Real Estate',
      tokens: 200,
      currentValue: '$50,000',
      purchaseValue: '$47,500',
      change: '+$2,500',
      changePercent: '+5.3%',
      isPositive: true,
      apy: '11.2%'
    }
  ];

  const totalPortfolioValue = '$158,700';
  const totalInvested = '$152,500';
  const totalGain = '+$6,200';
  const totalGainPercent = '+4.1%';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your tokenized asset investments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2 h-9 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2 h-9 flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Stats Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Portfolio Value</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPortfolioValue}</p>
          <div className="flex items-center mt-2 text-green-600 dark:text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{totalGain} ({totalGainPercent})</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Invested</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalInvested}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Across 5 assets</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Monthly Income</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">$1,247</p>
          <p className="text-sm text-green-600 mt-2">+8.3% avg APY</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active Proposals</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
          <p className="text-sm text-yellow-600 mt-2">2 require voting</p>
        </div>
      </div>

      {/* Performance & Allocation Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio Performance</h2>
            <div className="flex items-center space-x-2">
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-24 h-9 text-sm"
              >
                <option value="7d">7D</option>
                <option value="30d">30D</option>
                <option value="90d">90D</option>
                <option value="1y">1Y</option>
              </select>
            </div>
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
                <linearGradient id="portfolioChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.05"/>
                </linearGradient>
              </defs>
              
              {/* Chart Area */}
              <path
                d="M 10 160 Q 50 150 75 135 T 120 115 T 160 100 T 200 85 T 240 70 T 280 60 L 280 180 L 10 180 Z"
                fill="url(#portfolioChartGradient)"
                stroke="none"
              />
              
              {/* Chart Line */}
              <path
                d="M 10 160 Q 50 150 75 135 T 120 115 T 160 100 T 200 85 T 240 70 T 280 60"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                className="drop-shadow-sm"
              />
              
              {/* Data Points */}
              {[
                {x: 10, y: 160}, {x: 75, y: 135}, {x: 120, y: 115}, 
                {x: 160, y: 100}, {x: 200, y: 85}, {x: 240, y: 70}, {x: 280, y: 60}
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
              <span>$170k</span>
              <span>$165k</span>
              <span>$160k</span>
              <span>$155k</span>
              <span>$150k</span>
            </div>
            
            {/* Current Value Indicator */}
            <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900/20 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              +4.1% ↗
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Asset Allocation</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-50 dark:bg-blue-900/20 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Real Estate</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">60%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Precious Metals</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">18%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Vehicles</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">12%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Art</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">10%</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm py-2">
              <Eye className="w-4 h-4 mr-2" />
              View Detailed Breakdown
            </button>
          </div>
        </div>
      </div>

      {/* Assets Table Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Assets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">APY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {portfolioAssets.map((asset) => (
                <PortfolioAsset key={asset.id} {...asset} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;