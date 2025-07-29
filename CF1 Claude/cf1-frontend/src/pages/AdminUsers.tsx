import React from 'react';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';

const AdminUsers: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage platform users and permissions</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            User Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Advanced user management features will be available in future releases.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">User Verification</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage KYC status</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">User Roles</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Assign permissions</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <UserX className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Access Control</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Suspend accounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;