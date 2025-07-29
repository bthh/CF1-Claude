import React, { useState, useEffect } from 'react';
import { 
  Database, Wifi, WifiOff, Settings, AlertTriangle, CheckCircle, 
  Activity, RefreshCw, Zap, Globe, Lock, Eye, EyeOff, 
  ArrowRightLeft, TestTube, Wrench
} from 'lucide-react';
import { useDemoModeStore } from '../../store/demoModeStore';
import { useCosmJS } from '../../hooks/useCosmJS';
import { roleBasedDemoData } from '../../services/roleBasedDemoData';

type TestingMode = 'demo' | 'testnet' | 'hybrid';

interface HybridModeControllerProps {
  className?: string;
}

interface TestnetStatus {
  connected: boolean;
  address: string | null;
  balance: string;
  networkId: string;
  blockHeight: number | null;
  lastUpdated: string;
}

export const HybridModeController: React.FC<HybridModeControllerProps> = ({ className = '' }) => {
  const [testingMode, setTestingMode] = useState<TestingMode>('demo');
  const [isConnecting, setIsConnecting] = useState(false);
  const [testnetStatus, setTestnetStatus] = useState<TestnetStatus>({
    connected: false,
    address: null,
    balance: '0',
    networkId: 'neutron-testnet',
    blockHeight: null,
    lastUpdated: new Date().toISOString()
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hybridConfig, setHybridConfig] = useState({
    useRealTransactions: false,
    useRealBalances: false,
    useRealProposals: false,
    enableRealTimeSync: false,
    simulateNetworkDelay: true
  });

  const { isDemoMode, enableDemoMode, disableDemoMode, scenario } = useDemoModeStore();
  const { 
    isConnected, 
    address, 
    balance, 
    connect, 
    disconnect, 
    isConnecting: cosmjsConnecting,
    error: cosmjsError
  } = useCosmJS();

  // Update testnet status when CosmJS connection changes
  useEffect(() => {
    setTestnetStatus(prev => ({
      ...prev,
      connected: isConnected,
      address: address || null,
      balance: balance || '0',
      lastUpdated: new Date().toISOString()
    }));
  }, [isConnected, address, balance]);

  // Simulate block height updates for demo purposes
  useEffect(() => {
    if (testingMode === 'testnet' && testnetStatus.connected) {
      const interval = setInterval(() => {
        setTestnetStatus(prev => ({
          ...prev,
          blockHeight: (prev.blockHeight || 0) + Math.floor(Math.random() * 3) + 1,
          lastUpdated: new Date().toISOString()
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [testingMode, testnetStatus.connected]);

  const switchToMode = async (mode: TestingMode) => {
    setIsConnecting(true);
    
    try {
      switch (mode) {
        case 'demo':
          // Pure demo mode - disconnect from testnet, enable demo data
          if (isConnected) {
            await disconnect();
          }
          if (!isDemoMode()) {
            enableDemoMode('development_testing', {
              showRealisticNumbers: true,
              showDemoIndicator: true,
            });
          }
          console.log('🎭 [HYBRID MODE] Switched to Demo Mode');
          break;

        case 'testnet':
          // Pure testnet mode - connect to testnet, disable demo data
          if (isDemoMode()) {
            disableDemoMode();
          }
          if (!isConnected) {
            await connect();
          }
          console.log('🌐 [HYBRID MODE] Switched to Testnet Mode');
          break;

        case 'hybrid':
          // Hybrid mode - maintain both demo data and testnet connection
          if (!isDemoMode()) {
            enableDemoMode('development_testing', {
              showRealisticNumbers: true,
              showDemoIndicator: true,
            });
          }
          if (!isConnected) {
            await connect();
          }
          console.log('🔀 [HYBRID MODE] Switched to Hybrid Mode');
          break;
      }

      setTestingMode(mode);
    } catch (error) {
      console.error('Error switching testing mode:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshTestnetConnection = async () => {
    setIsConnecting(true);
    try {
      if (isConnected) {
        await disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      await connect();
    } catch (error) {
      console.error('Error refreshing testnet connection:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const generateTestnetAccounts = async () => {
    setIsConnecting(true);
    try {
      // Simulate generating multiple testnet accounts for different roles
      const roles = ['investor', 'creator', 'super_admin'];
      for (const role of roles) {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`🔑 Generated testnet account for ${role}`);
      }
      console.log('✅ Generated testnet accounts for all roles');
    } catch (error) {
      console.error('Error generating testnet accounts:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const resetHybridEnvironment = async () => {
    setIsConnecting(true);
    try {
      // Clear all demo data
      roleBasedDemoData.clearRoleData();
      
      // Reset to demo mode
      await switchToMode('demo');
      
      // Regenerate fresh demo data
      await Promise.all([
        roleBasedDemoData.seedDataForRole('investor'),
        roleBasedDemoData.seedDataForRole('creator'),
        roleBasedDemoData.seedDataForRole('super_admin')
      ]);
      
      console.log('🔄 [HYBRID MODE] Environment reset complete');
    } catch (error) {
      console.error('Error resetting environment:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Hybrid Testing Controller
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Switch between demo data, testnet, and hybrid modes
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              testingMode === 'demo' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
              testingMode === 'testnet' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
            }`}>
              {testingMode === 'demo' ? '🎭 Demo Mode' :
               testingMode === 'testnet' ? '🌐 Testnet Mode' :
               '🔀 Hybrid Mode'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Selection */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Testing Mode Selection
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Demo Mode */}
            <button
              onClick={() => switchToMode('demo')}
              disabled={isConnecting}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                testingMode === 'demo'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">Demo Mode</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Mock data only</p>
                </div>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Fast UI/UX testing with realistic mock data. No blockchain connections.
              </p>
            </button>

            {/* Testnet Mode */}
            <button
              onClick={() => switchToMode('testnet')}
              disabled={isConnecting}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                testingMode === 'testnet'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-green-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">Testnet Mode</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Real blockchain</p>
                </div>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Real blockchain interactions with Neutron testnet. Slower but realistic.
              </p>
            </button>

            {/* Hybrid Mode */}
            <button
              onClick={() => switchToMode('hybrid')}
              disabled={isConnecting}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                testingMode === 'hybrid'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">Hybrid Mode</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Best of both</p>
                </div>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Mix of mock data and real blockchain. Configurable per feature.
              </p>
            </button>
          </div>
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Demo Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Demo Data Status</span>
              </h5>
              <div className={`w-2 h-2 rounded-full ${
                isDemoMode() ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                <span className="text-gray-900 dark:text-white">
                  {isDemoMode() ? `Active (${scenario})` : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Data:</span>
                <span className="text-gray-900 dark:text-white">
                  {isDemoMode() ? 'Realistic Mock' : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Testnet Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Testnet Status</span>
              </h5>
              <div className={`w-2 h-2 rounded-full ${
                testnetStatus.connected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Connection:</span>
                <span className="text-gray-900 dark:text-white">
                  {testnetStatus.connected ? '🟢 Connected' : '🔴 Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Network:</span>
                <span className="text-gray-900 dark:text-white">
                  {testnetStatus.networkId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                <span className="text-gray-900 dark:text-white">
                  {testnetStatus.balance} NTRN
                </span>
              </div>
              {testnetStatus.blockHeight && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Block:</span>
                  <span className="text-gray-900 dark:text-white">
                    #{testnetStatus.blockHeight.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Configuration (Hybrid Mode) */}
        {testingMode === 'hybrid' && (
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-semibold text-gray-900 dark:text-white">
                Hybrid Mode Configuration
              </h5>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center space-x-1"
              >
                {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(hybridConfig).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setHybridConfig(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {key.split(/(?=[A-Z])/).join(' ').toLowerCase().replace(/^./, s => s.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={refreshTestnetConnection}
              disabled={isConnecting}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center justify-center space-x-1"
            >
              {isConnecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Refresh Connection</span>
            </button>

            <button
              onClick={generateTestnetAccounts}
              disabled={isConnecting}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center justify-center space-x-1"
            >
              {isConnecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Wrench className="w-4 h-4" />
              )}
              <span>Setup Accounts</span>
            </button>

            <button
              onClick={resetHybridEnvironment}
              disabled={isConnecting}
              className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm flex items-center justify-center space-x-1"
            >
              {isConnecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Reset Environment</span>
            </button>

            <button
              disabled={isConnecting}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm flex items-center justify-center space-x-1"
            >
              {isConnecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              <span>Run Integration Tests</span>
            </button>
          </div>
        </div>

        {/* Connection Error Display */}
        {cosmjsError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h6 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Testnet Connection Error
                </h6>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {cosmjsError}
                </p>
                <button
                  onClick={refreshTestnetConnection}
                  className="mt-2 text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline"
                >
                  Try reconnecting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Panel */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h6 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Testing Mode Guide
              </h6>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p><strong>Demo Mode:</strong> Fast UI testing with realistic mock data. Perfect for design validation.</p>
                <p><strong>Testnet Mode:</strong> Real blockchain interactions. Use for integration testing and contract validation.</p>
                <p><strong>Hybrid Mode:</strong> Best of both worlds. Configure which features use real blockchain vs mock data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridModeController;