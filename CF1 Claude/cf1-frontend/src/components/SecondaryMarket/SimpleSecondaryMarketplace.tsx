import React from 'react';
import { ArrowUpDown, TrendingUp, Users, BarChart3 } from 'lucide-react';

export const SimpleSecondaryMarketplace: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <ArrowUpDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Secondary Marketplace
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Trade tokenized assets peer-to-peer
            </p>
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">24h Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$82,000</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 ml-1">+12.4%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">6</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 ml-1">+3 today</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$143.83</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex items-center mt-2">
            <span className="text-sm text-red-600 ml-1">-2.1%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">247</p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 ml-1">+8.7%</span>
          </div>
        </div>
      </div>

      {/* Demo Listings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Listings
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              name: 'Manhattan Premium Office Tower',
              type: 'Commercial Real Estate',
              price: '$128.50',
              change: '+3.2%',
              volume: '$25,400'
            },
            {
              name: 'Solar Energy Project Nevada',
              type: 'Renewable Energy',
              price: '$105.75',
              change: '+1.8%',
              volume: '$18,200'
            },
            {
              name: 'Vintage Wine Collection Series A',
              type: 'Collectibles',
              price: '$875.00',
              change: '+5.1%',
              volume: '$12,800'
            },
            {
              name: 'Miami Beach Luxury Resort',
              type: 'Hospitality Real Estate',
              price: '$245.25',
              change: '-0.8%',
              volume: '$31,500'
            }
          ].map((asset, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {asset.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {asset.type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {asset.price}
                  </p>
                  <p className={`text-xs ${asset.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.change}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>24h Volume: {asset.volume}</span>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                  Trade
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          <strong>Demo Mode:</strong> This is a simplified view of the secondary marketplace. 
          Advanced trading features, order books, and real-time data will be available in the full version.
        </p>
      </div>
    </div>
  );
};