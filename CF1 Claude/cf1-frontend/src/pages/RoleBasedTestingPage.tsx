import React, { useState, useEffect } from 'react';
import { 
  TestTube, Users, Settings, Database, Play, ArrowRight, 
  AlertCircle, CheckCircle, RefreshCw, Zap, Shield
} from 'lucide-react';
import { useSessionStore, SessionRole, getRoleDisplayName } from '../store/sessionStore';
import { useDemoModeStore } from '../store/demoModeStore';
import { EnhancedRoleSelector } from '../components/RoleSelector/EnhancedRoleSelector';
import { RoleBasedTestingDashboard } from '../components/TestingDashboard/RoleBasedTestingDashboard';
import { AdminTestingPanel } from '../components/TestingDashboard/AdminTestingPanel';
import { roleBasedDemoData } from '../services/roleBasedDemoData';

const RoleBasedTestingPage: React.FC = () => {
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'role-specific' | 'scenarios'>('dashboard');
  const [isInitializing, setIsInitializing] = useState(false);

  const { selectedRole, setRole } = useSessionStore();
  const { isDemoMode, enableDemoMode, disableDemoMode, scenario } = useDemoModeStore();

  // Initialize testing environment if demo mode is off
  useEffect(() => {
    if (!isDemoMode() && !isInitializing) {
      initializeTestingEnvironment();
    }
  }, []);

  const initializeTestingEnvironment = async () => {
    setIsInitializing(true);
    
    try {
      // Enable demo mode for testing
      enableDemoMode('development_testing', {
        showRealisticNumbers: true,
        showDemoIndicator: true,
        accelerateTimeframes: false,
      });

      // Generate initial data for common roles
      await Promise.all([
        roleBasedDemoData.seedDataForRole('investor'),
        roleBasedDemoData.seedDataForRole('creator'),
        roleBasedDemoData.seedDataForRole('super_admin')
      ]);

      console.log('🎭 [TESTING PAGE] Testing environment initialized');
    } catch (error) {
      console.error('Error initializing testing environment:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleRoleSwitch = (role: SessionRole) => {
    setRole(role);
    setShowRoleSelector(false);
    console.log(`🔄 [TESTING PAGE] Switched to role: ${role}`);
  };

  const quickSwitchRole = (role: SessionRole) => {
    roleBasedDemoData.switchToRole(role);
    setRole(role);
  };

  // Loading state during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <TestTube className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute -inset-2">
              <div className="w-20 h-20 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Initializing Testing Environment
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Setting up role-based demo data and configurations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Role Selector Modal */}
      {showRoleSelector && (
        <EnhancedRoleSelector
          onRoleSelected={handleRoleSwitch}
          onCancel={() => setShowRoleSelector(false)}
          showDataPreview={true}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TestTube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Role-Based Testing Environment
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Comprehensive testing with automated data seeding and role simulation
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Status Indicators */}
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                  isDemoMode() 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {isDemoMode() ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{isDemoMode() ? 'Testing Mode Active' : 'Testing Mode Inactive'}</span>
                </div>

                {selectedRole && (
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{getRoleDisplayName(selectedRole)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setShowRoleSelector(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Switch Role</span>
              </button>
            </div>
          </div>

          {/* Quick Role Switcher */}
          {isDemoMode() && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quick Role Switch:
                </h3>
                <div className="flex items-center space-x-2">
                  {(['investor', 'creator', 'super_admin', 'owner'] as SessionRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => quickSwitchRole(role)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedRole === role
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {getRoleDisplayName(role)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'dashboard', name: 'Testing Dashboard', icon: Database, description: 'Overview and scenario management' },
                { id: 'role-specific', name: 'Role-Specific Testing', icon: Shield, description: 'Current role testing panel' },
                { id: 'scenarios', name: 'Testing Scenarios', icon: Play, description: 'Pre-built testing workflows' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className="text-xs text-gray-400 font-normal">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <RoleBasedTestingDashboard />
          )}

          {activeTab === 'role-specific' && (
            <div className="space-y-6">
              {!selectedRole ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Role Selected
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Select a role to access role-specific testing panels and workflows
                  </p>
                  <button
                    onClick={() => setShowRoleSelector(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                  >
                    <Users className="w-5 h-5" />
                    <span>Select Testing Role</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Role-Specific Header */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                          {selectedRole === 'investor' && <Users className="w-6 h-6 text-white" />}
                          {selectedRole === 'creator' && <Database className="w-6 h-6 text-white" />}
                          {(selectedRole === 'super_admin' || selectedRole === 'owner') && <Shield className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {getRoleDisplayName(selectedRole)} Testing Panel
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400">
                            Role-specific testing workflows and data management
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                          Active Role
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role-Specific Content */}
                  {(selectedRole === 'super_admin' || selectedRole === 'owner') && (
                    <AdminTestingPanel />
                  )}

                  {selectedRole === 'investor' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                      <Users className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Investor Testing Panel
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Test investment workflows, portfolio management, and governance features
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Test Investment Flow
                        </button>
                        <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          Test Portfolio Analytics
                        </button>
                        <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                          Test Governance Voting
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRole === 'creator' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                      <Database className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Creator Testing Panel
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Test asset creation, shareholder management, and creator analytics
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                          Test Asset Creation
                        </button>
                        <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Test Shareholder Comms
                        </button>
                        <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          Test Creator Analytics
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Play className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Testing Scenarios
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Pre-built testing workflows are available in the main Testing Dashboard
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Go to Testing Dashboard</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Testing Environment Information
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>• This testing environment provides comprehensive role-based simulation with realistic mock data</p>
                <p>• All blockchain interactions can be tested with both demo data and testnet integration</p>
                <p>• Role switching includes automatic data seeding and permission configuration</p>
                <p>• Use the Testing Dashboard for systematic scenario testing and flow validation</p>
                <p>• Monitor the browser console for detailed testing workflow information and debugging</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedTestingPage;