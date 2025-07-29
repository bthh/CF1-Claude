import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Settings, 
  Play, 
  Square, 
  Monitor,
  MonitorOff,
  Timer,
  Users,
  TrendingUp,
  Shield,
  Briefcase,
  Code,
  X
} from 'lucide-react';
import { useDemoMode, useDemoModeAdmin, DemoScenario } from '../../store/demoModeStore';
import { useCosmJS } from '../../hooks/useCosmJS';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';

export const DemoModeIndicator: React.FC = () => {
  const { address } = useCosmJS();
  const { isDemoMode, scenario, config } = useDemoMode();
  const { isAdmin: isSystemAdmin, adminRole } = useAdminAuthContext();
  
  // Check if user can control demo mode
  const canControl = isSystemAdmin && (
    adminRole === 'super_admin' || 
    adminRole === 'creator' ||
    adminRole === 'owner'
  );
  const [showDetails, setShowDetails] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<string>('');

  // Calculate session time remaining
  useEffect(() => {
    if (!isDemoMode || !config.enabledAt || config.sessionTimeout <= 0) return;

    const updateTimer = () => {
      const enabledTime = new Date(config.enabledAt!).getTime();
      const timeoutMs = config.sessionTimeout * 60 * 1000;
      const timeLeft = enabledTime + timeoutMs - Date.now();
      
      if (timeLeft <= 0) {
        setSessionTimeLeft('Expired');
      } else {
        const minutes = Math.floor(timeLeft / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setSessionTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [isDemoMode, config.enabledAt, config.sessionTimeout]);

  // Don't show indicator if demo mode is disabled or if hidden in presentation mode
  if (!isDemoMode || !config.showDemoIndicator) {
    return null;
  }

  const getScenarioIcon = (scenario: DemoScenario) => {
    switch (scenario) {
      case 'investor_presentation':
        return <TrendingUp className="w-4 h-4" />;
      case 'user_onboarding':
        return <Users className="w-4 h-4" />;
      case 'sales_demo':
        return <Briefcase className="w-4 h-4" />;
      case 'development_testing':
        return <Code className="w-4 h-4" />;
      case 'regulatory_showcase':
        return <Shield className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getScenarioColor = (scenario: DemoScenario) => {
    switch (scenario) {
      case 'investor_presentation':
        return 'bg-green-500 border-green-600 text-white';
      case 'user_onboarding':
        return 'bg-blue-500 border-blue-600 text-white';
      case 'sales_demo':
        return 'bg-purple-500 border-purple-600 text-white';
      case 'development_testing':
        return 'bg-orange-500 border-orange-600 text-white';
      case 'regulatory_showcase':
        return 'bg-red-500 border-red-600 text-white';
      default:
        return 'bg-yellow-500 border-yellow-600 text-black';
    }
  };

  const scenarioLabels: Record<DemoScenario, string> = {
    investor_presentation: 'Investor Demo',
    user_onboarding: 'User Tutorial',
    sales_demo: 'Sales Demo',
    development_testing: 'Dev Testing',
    regulatory_showcase: 'Compliance Demo',
    custom: 'Custom Demo'
  };

  return (
    <>
      {/* Main Indicator */}
      <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-lg border-2 shadow-lg transition-all duration-300 ${getScenarioColor(scenario)}`}>
        {getScenarioIcon(scenario)}
        <span className="font-semibold text-sm">
          {scenarioLabels[scenario]}
        </span>
        
        {config.sessionTimeout > 0 && sessionTimeLeft && (
          <div className="flex items-center space-x-1 text-xs">
            <Timer className="w-3 h-3" />
            <span>{sessionTimeLeft}</span>
          </div>
        )}
        
        {canControl && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-2 p-1 rounded hover:bg-black hover:bg-opacity-20 transition-colors"
            title="Demo Mode Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Detailed Controls (Admin Only) */}
      {showDetails && canControl && (
        <div className="fixed top-16 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Demo Mode Controls
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Demo Mode Info */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Scenario:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getScenarioColor(scenario)}`}>
                {scenarioLabels[scenario]}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div>Session: {config.sessionId.slice(-8)}</div>
              <div>Role: {config.demoUserRole || 'Default'}</div>
              <div>Realistic Data: {config.showRealisticNumbers ? '✓' : '✗'}</div>
              <div>Positive Bias: {config.showPositivePerformance ? '✓' : '✗'}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <DemoModeQuickControls />
          </div>
        </div>
      )}

      {/* Global Demo Mode Banner (for non-presentation modes) */}
      {config.enableDemoTutorials && scenario === 'user_onboarding' && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 z-40">
          <div className="flex items-center justify-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">
              Welcome! You're experiencing a guided demo of the CF1 platform.
            </span>
          </div>
        </div>
      )}
    </>
  );
};

// Quick controls component for admin users
const DemoModeQuickControls: React.FC = () => {
  const { address } = useCosmJS();
  const { 
    disableDemo, 
    switchScenario, 
    scenario, 
    presentationMode,
    enterPresentation,
    exitPresentation 
  } = useDemoModeAdmin(address);

  const scenarios: { value: DemoScenario; label: string; description: string }[] = [
    { 
      value: 'investor_presentation', 
      label: 'Investor Demo',
      description: 'Polished presentation with positive metrics'
    },
    { 
      value: 'sales_demo', 
      label: 'Sales Demo',
      description: 'Feature showcase for prospects'
    },
    { 
      value: 'user_onboarding', 
      label: 'User Tutorial',
      description: 'Educational demo with tutorials'
    },
    { 
      value: 'regulatory_showcase', 
      label: 'Compliance Demo',
      description: 'Regulatory and compliance features'
    },
    { 
      value: 'development_testing', 
      label: 'Dev Testing',
      description: 'Development and testing mode'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Scenario Switcher */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Switch Scenario:
        </label>
        <div className="grid grid-cols-1 gap-1">
          {scenarios.map((s) => (
            <button
              key={s.value}
              onClick={() => switchScenario(s.value)}
              className={`text-left p-2 rounded text-xs transition-colors ${
                scenario === s.value
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="font-medium">{s.label}</div>
              <div className="text-gray-500 dark:text-gray-400">{s.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Presentation Mode Controls */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Presentation Mode:
          </span>
          <span className={`text-xs px-2 py-1 rounded ${
            presentationMode 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            {presentationMode ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={presentationMode ? exitPresentation : enterPresentation}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
              presentationMode
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {presentationMode ? (
              <>
                <MonitorOff className="w-4 h-4" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4" />
                <span>Enter</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Exit Demo Mode */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
        <button
          onClick={disableDemo}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
        >
          <EyeOff className="w-4 h-4" />
          <span>Exit Demo Mode</span>
        </button>
      </div>
    </div>
  );
};

export default DemoModeIndicator;