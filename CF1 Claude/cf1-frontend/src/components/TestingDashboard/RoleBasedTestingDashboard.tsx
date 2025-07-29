import React, { useState, useEffect } from 'react';
import { 
  Users, Building, Shield, Crown, Settings, Database, 
  Zap, RefreshCw, Play, ArrowRight, Check, AlertCircle,
  Eye, BarChart3, FileText, Wallet, MessageSquare, 
  TrendingUp, Gavel, DollarSign, Activity, ArrowRightLeft
} from 'lucide-react';
import { SessionRole, useSessionStore, getRoleDisplayName } from '../../store/sessionStore';
import { useDemoModeStore, DemoScenario } from '../../store/demoModeStore';
import { roleBasedDemoData, UserPersona } from '../../services/roleBasedDemoData';
import HybridModeController from './HybridModeController';

interface TestingScenario {
  id: string;
  name: string;
  description: string;
  roles: SessionRole[];
  estimatedTime: string;
  complexity: 'simple' | 'moderate' | 'complex';
  objectives: string[];
}

const testingScenarios: TestingScenario[] = [
  {
    id: 'investment_flow',
    name: 'Complete Investment Flow',
    description: 'Test the full investor journey from discovery to portfolio management',
    roles: ['investor'],
    estimatedTime: '15-20 minutes',
    complexity: 'moderate',
    objectives: [
      'Browse and filter available proposals',
      'Complete investment process with various amounts',
      'Track portfolio performance and analytics',
      'Test secondary market trading functionality'
    ]
  },
  {
    id: 'asset_creation',
    name: 'Asset Lifecycle Management',
    description: 'Complete creator workflow from proposal to shareholder management',
    roles: ['creator'],
    estimatedTime: '20-25 minutes',
    complexity: 'complex',
    objectives: [
      'Create and draft new asset proposals',
      'Submit for admin review and handle feedback',
      'Manage funded asset and shareholder communications',
      'Track performance and distribute returns'
    ]
  },
  {
    id: 'admin_approval',
    name: 'Admin Approval Workflows',
    description: 'Test comprehensive admin review and approval processes',
    roles: ['super_admin', 'owner'],
    estimatedTime: '10-15 minutes',
    complexity: 'simple',
    objectives: [
      'Review pending proposals and user verifications',
      'Test approval, rejection, and request changes flows',
      'Monitor platform compliance and generate reports',
      'Configure platform settings and limits'
    ]
  },
  {
    id: 'multi_role',
    name: 'Cross-Role Integration',
    description: 'Test interactions between different user roles',
    roles: ['creator', 'investor', 'super_admin'],
    estimatedTime: '30-40 minutes',
    complexity: 'complex',
    objectives: [
      'Creator submits proposal → Admin approves → Investor funds',
      'Test governance voting across roles',
      'Verify compliance and reporting workflows',
      'Test secondary market interactions'
    ]
  },
  {
    id: 'governance_testing',
    name: 'Governance & Voting',
    description: 'Test platform and asset-specific governance features',
    roles: ['investor', 'creator', 'super_admin'],
    estimatedTime: '15-20 minutes',
    complexity: 'moderate',
    objectives: [
      'Create and submit governance proposals',
      'Test voting mechanics and delegation',
      'Verify voting power calculations',
      'Test proposal execution and outcome tracking'
    ]
  },
  {
    id: 'compliance_audit',
    name: 'Compliance & Audit Trail',
    description: 'Verify regulatory compliance and audit capabilities',
    roles: ['super_admin', 'owner'],
    estimatedTime: '10-15 minutes',
    complexity: 'simple',
    objectives: [
      'Generate compliance reports (KYC, AML, SEC)',
      'Audit transaction histories and user activities',
      'Test rate limiting and security controls',
      'Verify data privacy and access controls'
    ]
  }
];

const roleIcons = {
  investor: <Users className="w-4 h-4" />,
  creator: <Building className="w-4 h-4" />,
  super_admin: <Shield className="w-4 h-4" />,
  owner: <Crown className="w-4 h-4" />
};

const roleColors = {
  investor: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  creator: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
  super_admin: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  owner: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30'
};

export const RoleBasedTestingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'roles' | 'data' | 'hybrid' | 'settings'>('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<TestingScenario | null>(null);
  const [executingScenario, setExecutingScenario] = useState<string | null>(null);
  const [roleData, setRoleData] = useState<Record<SessionRole, any>>({} as any);
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  const { selectedRole, setRole } = useSessionStore();
  const { isDemoMode, scenario, enableDemoMode, switchScenario } = useDemoModeStore();

  // Load role data on mount
  useEffect(() => {
    if (isDemoMode()) {
      loadAllRoleData();
    }
  }, []);

  const loadAllRoleData = () => {
    const roles: SessionRole[] = ['investor', 'creator', 'super_admin', 'owner'];
    const data: Record<SessionRole, any> = {} as any;
    
    roles.forEach(role => {
      data[role] = roleBasedDemoData.getRoleData(role);
    });
    
    setRoleData(data);
  };

  const executeScenario = async (scenario: TestingScenario) => {
    setExecutingScenario(scenario.id);
    setSelectedScenario(scenario);

    try {
      // Enable demo mode if not already enabled
      if (!isDemoMode()) {
        enableDemoMode('development_testing');
      }

      // Generate fresh data for all required roles
      for (const role of scenario.roles) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate realistic timing
        roleBasedDemoData.seedDataForRole(role);
      }

      // Switch to the first role in the scenario
      if (scenario.roles.length > 0) {
        setRole(scenario.roles[0]);
      }

      // Reload data
      loadAllRoleData();

      console.log(`🎬 [TESTING SCENARIO] Executed: ${scenario.name}`, scenario);
    } catch (error) {
      console.error('Error executing scenario:', error);
    } finally {
      setExecutingScenario(null);
    }
  };

  const switchToRole = (role: SessionRole) => {
    roleBasedDemoData.switchToRole(role);
    setRole(role);
    loadAllRoleData();
  };

  const generateAllRoleData = async () => {
    setIsGeneratingData(true);
    
    const roles: SessionRole[] = ['investor', 'creator', 'super_admin', 'owner'];
    
    for (const role of roles) {
      await new Promise(resolve => setTimeout(resolve, 800));
      roleBasedDemoData.seedDataForRole(role);
    }
    
    loadAllRoleData();
    setIsGeneratingData(false);
  };

  const clearAllData = () => {
    roleBasedDemoData.clearRoleData();
    setRoleData({} as any);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Role-Based Testing Dashboard
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive testing environment with automated data seeding
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isDemoMode() 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {isDemoMode() ? '🎭 Demo Mode Active' : '⚠️ Demo Mode Inactive'}
            </div>
            
            {selectedRole && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${roleColors[selectedRole]}`}>
                {roleIcons[selectedRole]}
                <span>Current: {getRoleDisplayName(selectedRole)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'scenarios', name: 'Testing Scenarios', icon: Play },
            { id: 'roles', name: 'Role Management', icon: Users },
            { id: 'data', name: 'Data Overview', icon: Database },
            { id: 'hybrid', name: 'Hybrid Mode', icon: ArrowRightLeft },
            { id: 'settings', name: 'Configuration', icon: Settings }
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
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Testing Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pre-built Testing Scenarios
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ready-to-run testing workflows with automated role switching and data seeding
                </p>
              </div>
              
              <button
                onClick={() => generateAllRoleData()}
                disabled={isGeneratingData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isGeneratingData ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh All Data</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {testingScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {scenario.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {scenario.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center space-x-1">
                          <Activity className="w-3 h-3" />
                          <span>{scenario.estimatedTime}</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          scenario.complexity === 'simple' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          scenario.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {scenario.complexity}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Roles:</span>
                        {scenario.roles.map((role) => (
                          <div
                            key={role}
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${roleColors[role]}`}
                          >
                            {roleIcons[role]}
                            <span>{getRoleDisplayName(role)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Objectives:</h5>
                    <ul className="space-y-1">
                      {scenario.objectives.map((objective, index) => (
                        <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => executeScenario(scenario)}
                    disabled={executingScenario === scenario.id}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {executingScenario === scenario.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Start Testing Scenario</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Role Management Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Role Management
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Switch between roles with automatic data seeding and permission setup
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['investor', 'creator', 'super_admin', 'owner'] as SessionRole[]).map((role) => {
                const data = roleData[role];
                const isActive = selectedRole === role;
                
                return (
                  <div
                    key={role}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      isActive 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${roleColors[role]}`}>
                          {roleIcons[role]}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {getRoleDisplayName(role)}
                          </h4>
                          {isActive && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              Active Role
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {data?.persona && (
                      <div className="mb-3 p-3 bg-white dark:bg-gray-800 rounded border">
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <div>Name: {data.persona.name}</div>
                          <div>Address: {data.persona.address.slice(0, 12)}...</div>
                          <div>Status: {data.persona.kycStatus}</div>
                          {data.persona.totalInvested && (
                            <div>Portfolio: ${data.persona.totalInvested.toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => switchToRole(role)}
                      disabled={isActive}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      {isActive ? 'Current Role' : 'Switch to Role'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Data Overview Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated Data Overview
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and manage seeded test data across all roles
                </p>
              </div>
              
              <button
                onClick={clearAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {Object.entries(roleData).map(([role, data]) => (
                <div key={role} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${roleColors[role as SessionRole]}`}>
                      {roleIcons[role as SessionRole]}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {getRoleDisplayName(role as SessionRole)} Data
                    </h4>
                  </div>

                  {data ? (
                    <div className="space-y-3 text-xs">
                      <div className="bg-white dark:bg-gray-800 rounded p-3">
                        <div className="font-medium text-gray-900 dark:text-white mb-2">User Persona</div>
                        <div className="text-gray-600 dark:text-gray-400 space-y-1">
                          <div>Name: {data.persona?.name || 'N/A'}</div>
                          <div>Email: {data.persona?.email || 'N/A'}</div>
                          <div>KYC: {data.persona?.kycStatus || 'N/A'}</div>
                          <div>Joined: {data.persona?.joinDate ? new Date(data.persona.joinDate).toLocaleDateString() : 'N/A'}</div>
                        </div>
                      </div>

                      {role === 'investor' && data.investorData && (
                        <div className="bg-white dark:bg-gray-800 rounded p-3">
                          <div className="font-medium text-gray-900 dark:text-white mb-2">Investment Data</div>
                          <div className="text-gray-600 dark:text-gray-400 space-y-1">
                            <div>Portfolio Value: ${data.persona.portfolioValue?.toLocaleString() || '0'}</div>
                            <div>Total Invested: ${data.persona.totalInvested?.toLocaleString() || '0'}</div>
                            <div>Voting Power: {data.persona.governance?.votingPower || 0}</div>
                          </div>
                        </div>
                      )}

                      {role === 'creator' && data.creatorData && (
                        <div className="bg-white dark:bg-gray-800 rounded p-3">
                          <div className="font-medium text-gray-900 dark:text-white mb-2">Creator Data</div>
                          <div className="text-gray-600 dark:text-gray-400 space-y-1">
                            <div>Assets Created: {data.persona.assetsCreated || 0}</div>
                            <div>Total Raised: ${data.persona.totalInvested?.toLocaleString() || '0'}</div>
                            <div>Drafts: {data.creatorData.drafts?.length || 0}</div>
                          </div>
                        </div>
                      )}

                      {(role === 'super_admin' || role === 'owner') && data.adminData && (
                        <div className="bg-white dark:bg-gray-800 rounded p-3">
                          <div className="font-medium text-gray-900 dark:text-white mb-2">Admin Data</div>
                          <div className="text-gray-600 dark:text-gray-400 space-y-1">
                            <div>Total Users: {data.adminData.platformStats?.totalUsers || 0}</div>
                            <div>Total Proposals: {data.adminData.platformStats?.totalProposals || 0}</div>
                            <div>TVL: {data.adminData.platformStats?.totalValueLocked || '$0'}</div>
                            <div>Pending Approvals: {data.adminData.pendingApprovals?.length || 0}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No data generated for this role</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hybrid Mode Tab */}
        {activeTab === 'hybrid' && (
          <div className="space-y-6">
            <HybridModeController />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Testing Configuration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure demo mode settings and testing parameters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Demo Mode Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Demo Mode</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isDemoMode() 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {isDemoMode() ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Current Scenario</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      {scenario || 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active Role</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      {selectedRole ? getRoleDisplayName(selectedRole) : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => enableDemoMode('development_testing')}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Enable Testing Mode
                  </button>
                  <button
                    onClick={() => generateAllRoleData()}
                    disabled={isGeneratingData}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    Generate All Role Data
                  </button>
                  <button
                    onClick={clearAllData}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Testing Best Practices
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Always start with fresh data generation for comprehensive testing</li>
                    <li>• Test role switching to verify data isolation and permissions</li>
                    <li>• Use pre-built scenarios for systematic feature validation</li>
                    <li>• Clear data between major testing sessions to avoid conflicts</li>
                    <li>• Monitor console logs for detailed testing workflow information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedTestingDashboard;