import React, { useState, useEffect } from 'react';
import { ChevronDown, Users, Building, Shield, Crown, UserCheck, Database, Zap, AlertCircle } from 'lucide-react';
import { SessionRole, useSessionStore, getRoleDisplayName, getRoleDescription } from '../../store/sessionStore';
import { useDemoModeStore } from '../../store/demoModeStore';
import { roleBasedDemoData } from '../../services/roleBasedDemoData';

interface EnhancedRoleSelectorProps {
  onRoleSelected: (role: SessionRole) => void;
  onCancel?: () => void;
  showDataPreview?: boolean;
}

const roleOptions: { 
  value: SessionRole; 
  icon: React.ReactNode; 
  color: string;
  capabilities: string[];
  testingFocus: string;
}[] = [
  { 
    value: 'investor', 
    icon: <Users className="w-5 h-5" />, 
    color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    capabilities: ['Portfolio Management', 'Investment Tracking', 'Governance Voting', 'Secondary Trading'],
    testingFocus: 'Investment flows and portfolio analytics'
  },
  { 
    value: 'creator', 
    icon: <Building className="w-5 h-5" />, 
    color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
    capabilities: ['Asset Creation', 'Shareholder Management', 'Analytics Dashboard', 'Communication Tools'],
    testingFocus: 'Asset lifecycle and creator workflows'
  },
  { 
    value: 'super_admin', 
    icon: <Shield className="w-5 h-5" />, 
    color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    capabilities: ['Proposal Approval', 'User Management', 'Compliance Monitoring', 'Platform Configuration'],
    testingFocus: 'Admin workflows and platform management'
  },
  { 
    value: 'owner', 
    icon: <Crown className="w-5 h-5" />, 
    color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
    capabilities: ['Full Platform Control', 'Financial Controls', 'Strategic Decisions', 'Emergency Actions'],
    testingFocus: 'Platform ownership and strategic controls'
  }
];

export const EnhancedRoleSelector: React.FC<EnhancedRoleSelectorProps> = ({ 
  onRoleSelected, 
  onCancel, 
  showDataPreview = true 
}) => {
  const [selectedRole, setSelectedRole] = useState<SessionRole>('investor');
  const [isOpen, setIsOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [dataPreview, setDataPreview] = useState<any>(null);
  const [seedingStatus, setSeedingStatus] = useState<string>('');

  const { isDemoMode, scenario } = useDemoModeStore();

  // Generate data preview when role selection changes
  useEffect(() => {
    if (showDataPreview && isDemoMode()) {
      const preview = roleBasedDemoData.generateRoleData(selectedRole, scenario);
      setDataPreview(preview);
    }
  }, [selectedRole, scenario, showDataPreview]);

  const handleRoleSelect = (role: SessionRole) => {
    setSelectedRole(role);
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    if (!isDemoMode()) {
      onRoleSelected(selectedRole);
      return;
    }

    setIsSeeding(true);
    setSeedingStatus('Generating role-specific data...');

    try {
      // Simulate realistic data seeding time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSeedingStatus('Seeding portfolio data...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSeedingStatus('Setting up permissions...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSeedingStatus('Finalizing role configuration...');
      await new Promise(resolve => setTimeout(resolve, 400));

      // Perform actual data seeding
      const roleData = roleBasedDemoData.switchToRole(selectedRole, scenario);
      
      console.log('🎭 [ENHANCED ROLE SELECTOR] Role data seeded:', roleData);
      
      onRoleSelected(selectedRole);
    } catch (error) {
      console.error('Error seeding role data:', error);
      setSeedingStatus('Error occurred - proceeding with basic role switch');
      await new Promise(resolve => setTimeout(resolve, 1000));
      onRoleSelected(selectedRole);
    } finally {
      setIsSeeding(false);
      setSeedingStatus('');
    }
  };

  const selectedOption = roleOptions.find(option => option.value === selectedRole);

  // Loading state during data seeding
  if (isSeeding) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedOption?.color}`}>
                {selectedOption?.icon}
              </div>
              <div className="absolute -inset-2">
                <div className="w-20 h-20 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Setting up {getRoleDisplayName(selectedRole)} Role
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Generating realistic data for comprehensive testing...
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {seedingStatus}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              This includes mock portfolio data, transaction history, and role-specific permissions
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Select Testing Role
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isDemoMode() ? 'Choose role with automated data seeding' : 'Choose your test role for this session'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Left side - Role Selection */}
          <div className="flex-1 p-6 space-y-6">
            {isDemoMode() && (
              <div className="text-sm text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Database className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Enhanced Testing Mode</p>
                    <p className="text-xs mt-1">
                      Role switching includes automatic data seeding with realistic portfolios, 
                      transaction histories, and role-specific permissions for comprehensive testing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Role Dropdown */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Testing Role
              </label>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="relative w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 pl-4 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedOption?.color}`}>
                      {selectedOption?.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getRoleDisplayName(selectedRole)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedOption?.testingFocus}
                      </div>
                    </div>
                  </div>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown 
                      className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                      aria-hidden="true" 
                    />
                  </span>
                </button>

                {isOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 max-h-64 overflow-auto">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleRoleSelect(option.value)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                          option.value === selectedRole 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                            : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${option.color}`}>
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getRoleDisplayName(option.value)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {option.testingFocus}
                          </div>
                        </div>
                        {option.value === selectedRole && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Role Capabilities */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedOption?.color}`}>
                  {selectedOption?.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {getRoleDisplayName(selectedRole)} Capabilities
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getRoleDescription(selectedRole)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {selectedOption?.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <UserCheck className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{capability}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Data Preview */}
          {showDataPreview && isDemoMode() && dataPreview && (
            <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Data Preview
              </h4>
              
              <div className="space-y-4 text-xs">
                {/* Persona Preview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    User Persona
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Name: {dataPreview.persona.name}</div>
                    <div>Address: {dataPreview.persona.address.slice(0, 12)}...</div>
                    <div>Status: {dataPreview.persona.kycStatus}</div>
                  </div>
                </div>

                {/* Role-specific data preview */}
                {selectedRole === 'investor' && dataPreview.investorData && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      Investment Data
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Portfolio Value: ${dataPreview.persona.portfolioValue?.toLocaleString() || '0'}</div>
                      <div>Total Invested: ${dataPreview.persona.totalInvested?.toLocaleString() || '0'}</div>
                      <div>Voting Power: {dataPreview.persona.governance?.votingPower || 0}</div>
                    </div>
                  </div>
                )}

                {selectedRole === 'creator' && dataPreview.creatorData && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      Creator Data
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Assets Created: {dataPreview.persona.assetsCreated || 0}</div>
                      <div>Total Raised: ${dataPreview.persona.totalInvested?.toLocaleString() || '0'}</div>
                      <div>Draft Proposals: {dataPreview.creatorData.drafts?.length || 0}</div>
                    </div>
                  </div>
                )}

                {(selectedRole === 'super_admin' || selectedRole === 'owner') && dataPreview.adminData && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      Admin Data
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Total Users: {dataPreview.adminData.platformStats?.totalUsers || 0}</div>
                      <div>Pending Approvals: {dataPreview.adminData.pendingApprovals?.length || 0}</div>
                      <div>TVL: {dataPreview.adminData.platformStats?.totalValueLocked || '$0'}</div>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-3 h-3 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-yellow-800 dark:text-yellow-200">
                      <div className="font-medium mb-1">Realistic Test Data</div>
                      <div className="text-xs">
                        All data is generated for testing purposes and will persist during your session.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between space-x-3">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={isSeeding}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSeeding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Setting up role...</span>
                </>
              ) : (
                <>
                  <span>Continue with {getRoleDisplayName(selectedRole)}</span>
                  {isDemoMode() && <Database className="w-4 h-4" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRoleSelector;