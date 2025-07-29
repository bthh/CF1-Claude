import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Settings, 
  Play, 
  Users, 
  TrendingUp, 
  Shield, 
  Briefcase, 
  Code,
  Monitor,
  Clock,
  ToggleLeft,
  ToggleRight,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { 
  useDemoModeAdmin, 
  DemoScenario, 
  DEMO_SCENARIOS,
  DemoModeConfig 
} from '../../store/demoModeStore';
import { useCosmJS } from '../../hooks/useCosmJS';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';

interface DemoModeAdminPanelProps {
  className?: string;
}

export const DemoModeAdminPanel: React.FC<DemoModeAdminPanelProps> = ({ className = '' }) => {
  const { address } = useCosmJS();
  const { isAdmin: isSystemAdmin, adminRole } = useAdminAuthContext();
  const { 
    isDemoMode, 
    scenario, 
    config,
    enableDemo, 
    disableDemo, 
    switchScenario,
    presentationMode,
    enterPresentation,
    exitPresentation 
  } = useDemoModeAdmin(address);

  // Check if user has demo mode access (any admin level)
  const canAccessDemoMode = isSystemAdmin && (
    adminRole === 'super_admin' || 
    adminRole === 'platform_admin' || 
    adminRole === 'creator' ||
    adminRole === 'owner'
  );

  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(scenario);
  const [customConfig, setCustomConfig] = useState<Partial<DemoModeConfig>>({});
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // If user is not admin, show a restricted view
  if (!canAccessDemoMode) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Demo Mode Controls
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {!isSystemAdmin ? 
              'Admin privileges required to access demo mode controls.' :
              `Admin role "${adminRole}" detected. Checking permissions...`
            }
          </p>
          {isSystemAdmin && (
            <div className="mt-4 text-sm text-gray-500">
              <p>Connected address: {address?.slice(0, 10)}...{address?.slice(-6)}</p>
              <p>Admin role: {adminRole}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleEnableDemo = () => {
    const mergedConfig = {
      ...DEMO_SCENARIOS[selectedScenario],
      ...customConfig,
      allowedAdminUsers: [address!], // Add current admin to allowed users
    };
    enableDemo(selectedScenario, mergedConfig);
  };

  const handleConfigChange = (key: keyof DemoModeConfig, value: any) => {
    setCustomConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const scenarios: Array<{
    value: DemoScenario;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      value: 'investor_presentation',
      label: 'Investor Presentation',
      description: 'Polished demo with positive metrics, clean UI for investor meetings',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      value: 'sales_demo',
      label: 'Sales Demo',
      description: 'Feature showcase with highlighted capabilities for prospects',
      icon: <Briefcase className="w-5 h-5" />,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      value: 'user_onboarding',
      label: 'User Onboarding',
      description: 'Educational demo with tutorials and guided experience',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      value: 'regulatory_showcase',
      label: 'Regulatory Demo',
      description: 'Compliance and regulatory features demonstration',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      value: 'development_testing',
      label: 'Development Testing',
      description: 'Testing environment with flexible data configurations',
      icon: <Code className="w-5 h-5" />,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      value: 'custom',
      label: 'Custom Configuration',
      description: 'Manually configure all demo mode settings',
      icon: <Settings className="w-5 h-5" />,
      color: 'text-gray-600 dark:text-gray-400'
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDemoMode ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Eye className={`w-6 h-6 ${isDemoMode ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Demo Mode Control Center
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isDemoMode ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Demo Mode Active - {scenario.replace('_', ' ').toUpperCase()}
                  </span>
                ) : (
                  'Configure and manage demonstration scenarios'
                )}
              </p>
            </div>
          </div>
          
          {isDemoMode && (
            <div className="flex items-center space-x-2">
              <button
                onClick={presentationMode ? exitPresentation : enterPresentation}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  presentationMode
                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>{presentationMode ? 'Exit Presentation' : 'Enter Presentation'}</span>
              </button>
              
              <button
                onClick={disableDemo}
                className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <EyeOff className="w-4 h-4" />
                <span>Disable Demo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {!isDemoMode ? (
          <>
            {/* Scenario Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choose Demo Scenario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedScenario(s.value)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedScenario === s.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={s.color}>
                        {s.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {s.label}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            {selectedScenario === 'custom' && (
              <div className="mb-6">
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Advanced Configuration</span>
                </button>

                {showAdvancedSettings && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                    <CustomConfigEditor config={customConfig} onChange={handleConfigChange} />
                  </div>
                )}
              </div>
            )}

            {/* Start Demo Button */}
            <button
              onClick={handleEnableDemo}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>Start {scenarios.find(s => s.value === selectedScenario)?.label}</span>
            </button>
          </>
        ) : (
          <>
            {/* Active Demo Info */}
            <DemoModeStatus config={config} />
            
            {/* Quick Scenario Switch */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Switch Scenario
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {scenarios.filter(s => s.value !== 'custom').map((s) => (
                  <button
                    key={s.value}
                    onClick={() => switchScenario(s.value)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      scenario === s.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={scenario === s.value ? 'text-blue-600 dark:text-blue-400' : s.color}>
                        {s.icon}
                      </div>
                      <span>{s.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Component for showing active demo mode status
const DemoModeStatus: React.FC<{ config: DemoModeConfig }> = ({ config }) => {
  const timeRemaining = config.enabledAt && config.sessionTimeout > 0 
    ? new Date(new Date(config.enabledAt).getTime() + config.sessionTimeout * 60 * 1000).toLocaleString()
    : 'No limit';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Current Configuration
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Session ID:</span>
            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
              {config.sessionId.slice(-8)}
            </code>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">User Role:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {config.demoUserRole || 'Default'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Session Expires:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {timeRemaining}
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Data Settings
        </h3>
        
        <div className="space-y-2 text-sm">
          {[
            { label: 'Realistic Numbers', value: config.showRealisticNumbers },
            { label: 'Positive Performance', value: config.showPositivePerformance },
            { label: 'Hide Negative Data', value: config.hideNegativeData },
            { label: 'Accelerated Timeframes', value: config.accelerateTimeframes },
            { label: 'Show Tutorials', value: config.enableDemoTutorials },
            { label: 'Highlight Features', value: config.highlightFeatures },
          ].map((setting) => (
            <div key={setting.label} className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">{setting.label}:</span>
              <div className={`w-4 h-4 rounded ${setting.value ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component for custom configuration editing
const CustomConfigEditor: React.FC<{
  config: Partial<DemoModeConfig>;
  onChange: (key: keyof DemoModeConfig, value: any) => void;
}> = ({ config, onChange }) => {
  const toggleOptions = [
    { key: 'showRealisticNumbers', label: 'Show Realistic Numbers', description: 'Use realistic financial figures instead of obvious test data' },
    { key: 'showPositivePerformance', label: 'Show Positive Performance', description: 'Bias performance metrics towards positive results' },
    { key: 'hideNegativeData', label: 'Hide Negative Data', description: 'Hide or minimize negative performance indicators' },
    { key: 'accelerateTimeframes', label: 'Accelerate Timeframes', description: 'Show compressed time periods (1 year as 1 month)' },
    { key: 'showDemoIndicator', label: 'Show Demo Indicator', description: 'Display demo mode indicator to users' },
    { key: 'enableDemoTutorials', label: 'Enable Tutorials', description: 'Show interactive tutorials and guides' },
    { key: 'highlightFeatures', label: 'Highlight Features', description: 'Add visual emphasis to key features' },
  ] as const;

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 dark:text-white">
        Custom Configuration
      </h4>
      
      <div className="grid grid-cols-1 gap-3">
        {toggleOptions.map((option) => (
          <div key={option.key} className="flex items-start space-x-3">
            <button
              onClick={() => onChange(option.key, !config[option.key])}
              className="mt-1"
            >
              {config[option.key] ? (
                <ToggleRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900 dark:text-white">
                {option.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {option.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min="0"
            max="480"
            value={config.sessionTimeout || 120}
            onChange={(e) => onChange('sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Demo User Role
          </label>
          <select
            value={config.demoUserRole || 'investor'}
            onChange={(e) => onChange('demoUserRole', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="investor">Investor</option>
            <option value="creator">Creator</option>
            <option value="admin">Admin</option>
            <option value="platform_admin">Platform Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DemoModeAdminPanel;