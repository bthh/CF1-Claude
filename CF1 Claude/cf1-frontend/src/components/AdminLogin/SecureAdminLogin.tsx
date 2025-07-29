/**
 * Secure Admin Login Component
 * Production-ready authentication with JWT tokens
 */

import React, { useState } from 'react';
import { useAdminAuth, AdminRole } from '../../hooks/useAdminAuth';

interface SecureAdminLoginProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
}

const SecureAdminLogin: React.FC<SecureAdminLoginProps> = ({
  onLoginSuccess,
  onLoginError
}) => {
  const { loginAsAdmin, loading, isProductionMode, isDemoModeEnabled } = useAdminAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [selectedRole, setSelectedRole] = useState<AdminRole>('platform_admin');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isProductionMode) {
        // Production authentication
        if (!credentials.username || !credentials.password) {
          throw new Error('Username and password are required');
        }
        
        await loginAsAdmin(selectedRole, credentials);
      } else if (isDemoModeEnabled) {
        // Demo mode authentication
        await loginAsAdmin(selectedRole);
      } else {
        throw new Error('Authentication not available. Please check configuration.');
      }
      
      onLoginSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      onLoginError?.(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value as AdminRole);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CF1 Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isProductionMode ? 'Production Authentication' : 'Development Mode'}
          </p>
          {!isProductionMode && isDemoModeEnabled && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Demo mode is enabled. This is for development only.
              </p>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Role Selection */}
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Admin Role
              </label>
              <select
                id="role"
                name="role"
                value={selectedRole || ''}
                onChange={handleRoleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="platform_admin">Platform Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="creator">Creator Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            {/* Username - only in production */}
            {isProductionMode && (
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={credentials.username}
                  onChange={handleInputChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
            )}

            {/* Password - only in production */}
            {isProductionMode && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {isProductionMode 
                ? 'Production authentication with JWT tokens' 
                : 'Development mode - Connect wallet to continue'
              }
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecureAdminLogin;