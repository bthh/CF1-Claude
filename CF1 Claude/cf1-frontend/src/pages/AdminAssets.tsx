import React from 'react';
import { Building, TrendingUp, Eye, AlertTriangle } from 'lucide-react';

const AdminAssets: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Building className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage platform assets</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Asset Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Comprehensive asset management tools will be available in future releases.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Asset Monitoring</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track performance</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Analytics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Asset insights</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Risk Management</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monitor risks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssets;