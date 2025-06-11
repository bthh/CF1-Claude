// @ts-nocheck
import React from 'react';
import { TrendingUp, DollarSign, BarChart3, Users } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$2.4M</p>
                <p className="text-sm text-green-600">+12.5%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                <p className="text-sm text-green-600">+3 this month</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Returns</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">18.3%</p>
                <p className="text-sm text-green-600">+2.1% vs last month</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Investors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
                <p className="text-sm text-green-600">+89 this week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Total RWA Tokenized on CF1
          </h2>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Chart placeholder</p>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Top Performers
          </h2>
          <div className="space-y-4">
            {[
              { name: 'Downtown Seattle Office', type: 'Real Estate', value: '$2.4M', change: '+12.5%' },
              { name: 'Tech Startup Portfolio', type: 'Equity', value: '$1.8M', change: '+8.3%' },
              { name: 'Green Energy Fund', type: 'Infrastructure', value: '$3.2M', change: '+15.7%' }
            ].map((asset, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{asset.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">{asset.value}</p>
                  <p className="text-sm text-green-600">{asset.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;