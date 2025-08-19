import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Settings, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  Activity, 
  Database, 
  Globe, 
  Lock, 
  Zap,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Pause,
  Play,
  Ban,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  Bell
} from 'lucide-react';
import { useAdminAuthContext } from '../hooks/useAdminAuth';
import { useNotifications } from '../hooks/useNotifications';
import { formatAmount, formatPercentage, formatTimeAgo } from '../utils/format';
import { usePlatformConfigStore } from '../store/platformConfigStore';
import { DataModeConfig } from '../components/DataMode/DataModeConfig';

interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProposals: number;
  totalValueLocked: number;
  totalTransactions: number;
  platformRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: number;
}

interface PlatformConfig {
  platformFee: number;
  maxInvestmentAmount: number;
  minInvestmentAmount: number;
  defaultLockupPeriod: number;
  complianceRequired: boolean;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  maxInvestorsPerProposal: number;
}

interface SecurityAlert {
  id: string;
  type: 'fraud' | 'security' | 'compliance' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
  affectedUsers?: number;
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  category: 'auth' | 'transaction' | 'system' | 'compliance';
  message: string;
  userId?: string;
  proposalId?: string;
  details?: Record<string, any>;
}

const SuperAdmin: React.FC = () => {
  const { currentAdmin, checkPermission, hasAccessToSuperAdminManagement, isOwner } = useAdminAuthContext();
  const { success, error } = useNotifications();
  const { config: platformConfig, updateTradingMode, updateMaxAPY } = usePlatformConfigStore();
  
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'config' | 'security' | 'logs' | 'data_mode' | 'emergency' | 'admin_management'>('overview');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPlatformMetrics(),
        loadPlatformConfig(),
        loadSecurityAlerts(),
        loadSystemLogs()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadPlatformMetrics = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMetrics({
      totalUsers: 12847,
      activeUsers: 3421,
      totalProposals: 156,
      totalValueLocked: 45600000,
      totalTransactions: 89234,
      platformRevenue: 1140000,
      systemHealth: 'healthy',
      uptime: 99.97
    });
  };

  const loadPlatformConfig = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setConfig({
      platformFee: 2.5,
      maxInvestmentAmount: 100000,
      minInvestmentAmount: 100,
      defaultLockupPeriod: 12,
      complianceRequired: true,
      maintenanceMode: false,
      registrationOpen: true,
      maxInvestorsPerProposal: 500
    });
  };

  const loadSecurityAlerts = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setAlerts([
      {
        id: 'alert_1',
        type: 'fraud',
        severity: 'high',
        title: 'Suspicious Investment Pattern Detected',
        description: 'Multiple large investments from similar wallet addresses within 24 hours',
        timestamp: '2024-12-05T14:30:00Z',
        status: 'investigating',
        affectedUsers: 5
      },
      {
        id: 'alert_2',
        type: 'compliance',
        severity: 'medium',
        title: 'KYC Verification Backlog',
        description: 'KYC verification queue has exceeded normal processing time',
        timestamp: '2024-12-05T10:15:00Z',
        status: 'active',
        affectedUsers: 47
      },
      {
        id: 'alert_3',
        type: 'system',
        severity: 'low',
        title: 'High Database Query Response Time',
        description: 'Database response times above normal threshold for analytics queries',
        timestamp: '2024-12-05T08:45:00Z',
        status: 'resolved'
      }
    ]);
  };

  const loadSystemLogs = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    setLogs([
      {
        id: 'log_1',
        timestamp: '2024-12-05T15:45:00Z',
        level: 'error',
        category: 'transaction',
        message: 'Transaction failed due to insufficient gas',
        userId: 'user_123',
        proposalId: 'prop_456',
        details: { txHash: '0x123...', error: 'out of gas' }
      },
      {
        id: 'log_2',
        timestamp: '2024-12-05T15:30:00Z',
        level: 'warning',
        category: 'auth',
        message: 'Failed login attempt from suspicious IP',
        details: { ip: '192.168.1.100', attempts: 5 }
      },
      {
        id: 'log_3',
        timestamp: '2024-12-05T15:15:00Z',
        level: 'info',
        category: 'system',
        message: 'Database backup completed successfully',
        details: { size: '2.4GB', duration: '12 minutes' }
      }
    ]);
  };

  const handleConfigUpdate = async (key: keyof PlatformConfig, value: any) => {
    if (!checkPermission('manage_platform_config')) {
      error('Insufficient permissions to update platform configuration');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfig(prev => prev ? { ...prev, [key]: value } : null);
      success(`${key} updated successfully`);
    } catch (err) {
      error(`Failed to update ${key}`);
    }
  };

  const handleEmergencyAction = async (action: 'pause_platform' | 'enable_maintenance' | 'freeze_transactions') => {
    if (!checkPermission('emergency_controls')) {
      error('Insufficient permissions for emergency actions');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (action) {
        case 'pause_platform':
          success('Platform operations paused. All user actions disabled.');
          break;
        case 'enable_maintenance':
          await handleConfigUpdate('maintenanceMode', true);
          success('Maintenance mode enabled. Users will see maintenance page.');
          break;
        case 'freeze_transactions':
          success('All blockchain transactions frozen. Only viewing allowed.');
          break;
      }
    } catch (err) {
      error(`Failed to execute emergency action: ${action}`);
    }
  };

  const handleAlertAction = async (alertId: string, action: 'investigate' | 'resolve' | 'dismiss') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: action === 'resolve' ? 'resolved' : action === 'investigate' ? 'investigating' : alert.status }
          : alert
      ));
      
      success(`Alert ${action}d successfully`);
    } catch (err) {
      error(`Failed to ${action} alert`);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20 border-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 border-orange-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 border-blue-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 border-gray-300';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (!currentAdmin || !checkPermission('manage_platform_config')) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Super Admin Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have sufficient permissions to access the Super Admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Platform-wide controls, monitoring, and emergency management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
            >
              {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showSensitiveData ? 'Hide' : 'Show'} Sensitive Data</span>
            </button>
            <button
              onClick={loadSuperAdminData}
              className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
              { id: 'config', label: 'Configuration', icon: <Settings className="w-4 h-4" /> },
              { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
              { id: 'logs', label: 'System Logs', icon: <FileText className="w-4 h-4" /> },
              { id: 'data_mode', label: 'Data Mode', icon: <Database className="w-4 h-4" /> },
              { id: 'emergency', label: 'Emergency', icon: <AlertTriangle className="w-4 h-4" /> },
              ...(hasAccessToSuperAdminManagement() ? [{ id: 'admin_management', label: 'Admin Management', icon: <Users className="w-4 h-4" /> }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading super admin data...</span>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {selectedTab === 'overview' && metrics && (
            <div className="space-y-8">
              {/* Platform Health */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Platform Health
                  </h3>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getHealthColor(metrics.systemHealth)}`}>
                    {metrics.systemHealth.charAt(0).toUpperCase() + metrics.systemHealth.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Activity className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPercentage(metrics.uptime)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      System Uptime
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.activeUsers.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Active Users (24h)
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <DollarSign className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${showSensitiveData ? formatAmount(metrics.totalValueLocked) : '••••••••'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Value Locked
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${showSensitiveData ? formatAmount(metrics.platformRevenue) : '••••••••'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Platform Revenue
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.totalUsers.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Proposals</p>
                    <Database className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.totalProposals}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.totalTransactions.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Active Alerts */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Active Security Alerts
                  </h3>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 text-xs font-medium rounded-lg">
                    {alerts.filter(a => a.status === 'active').length} Active
                  </span>
                </div>
                <div className="space-y-3">
                  {alerts.filter(a => a.status === 'active').slice(0, 3).map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {alert.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {alert.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {formatTimeAgo(alert.timestamp)}
                            {alert.affectedUsers && ` • ${alert.affectedUsers} users affected`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAlertAction(alert.id, 'investigate')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Investigate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Configuration Tab */}
          {selectedTab === 'config' && config && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Platform Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Financial Settings */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Financial Settings
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Platform Fee (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={config.platformFee}
                          onChange={(e) => handleConfigUpdate('platformFee', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Investment Amount ($)
                        </label>
                        <input
                          type="number"
                          value={config.maxInvestmentAmount}
                          onChange={(e) => handleConfigUpdate('maxInvestmentAmount', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Min Investment Amount ($)
                        </label>
                        <input
                          type="number"
                          value={config.minInvestmentAmount}
                          onChange={(e) => handleConfigUpdate('minInvestmentAmount', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* System Settings */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      System Settings
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Default Lockup Period (months)
                        </label>
                        <input
                          type="number"
                          value={config.defaultLockupPeriod}
                          onChange={(e) => handleConfigUpdate('defaultLockupPeriod', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Investors per Proposal
                        </label>
                        <input
                          type="number"
                          value={config.maxInvestorsPerProposal}
                          onChange={(e) => handleConfigUpdate('maxInvestorsPerProposal', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggle Settings */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Platform Controls
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'complianceRequired', label: 'Compliance Required', description: 'Require KYC/AML for all users' },
                      { key: 'registrationOpen', label: 'Registration Open', description: 'Allow new user registrations' },
                      { key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Platform in maintenance mode' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {setting.label}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {setting.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleConfigUpdate(setting.key as keyof PlatformConfig, !config[setting.key as keyof PlatformConfig])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            config[setting.key as keyof PlatformConfig] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              config[setting.key as keyof PlatformConfig] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Configuration Settings */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Platform Configuration
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Trading Mode */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 dark:text-white">Trading Mode</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Configure marketplace trading mode
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="tradingMode"
                            value="primary"
                            checked={platformConfig.tradingMode === 'primary'}
                            onChange={() => updateTradingMode('primary')}
                            className="mr-3 text-blue-600"
                          />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">Primary Trading</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">New token sales and asset tokenization</p>
                          </div>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="tradingMode"
                            value="secondary"
                            checked={platformConfig.tradingMode === 'secondary'}
                            onChange={() => updateTradingMode('secondary')}
                            className="mr-3 text-blue-600"
                          />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">Secondary Trading</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Peer-to-peer asset trading marketplace</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* APY Limits */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 dark:text-white">APY Guardrails</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Maximum allowed Expected APY percentage
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Maximum APY (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="200"
                          value={platformConfig.maxAllowedAPY}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value >= 0 && value <= 200) {
                              updateMaxAPY(value);
                              success(`Maximum APY updated to ${value}%`);
                            }
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Current: {platformConfig.maxAllowedAPY}% (Platform safety limit: 200%)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {selectedTab === 'security' && (
            <div className="space-y-6">
              {alerts.map((alert) => (
                <div key={alert.id} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg ${getSeverityColor(alert.severity)} border-l-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {alert.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          alert.status === 'active' ? 'bg-red-100 text-red-600' :
                          alert.status === 'investigating' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                        <span>Type: {alert.type}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(alert.timestamp)}</span>
                        {alert.affectedUsers && (
                          <>
                            <span>•</span>
                            <span>{alert.affectedUsers} users affected</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {alert.status === 'active' && (
                        <button
                          onClick={() => handleAlertAction(alert.id, 'investigate')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Investigate
                        </button>
                      )}
                      
                      {alert.status === 'investigating' && (
                        <button
                          onClick={() => handleAlertAction(alert.id, 'resolve')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* System Logs Tab */}
          {selectedTab === 'logs' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    System Logs
                  </h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export Logs</span>
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getLogLevelColor(log.level)} bg-gray-100 dark:bg-gray-600`}>
                            {log.level.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {log.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(log.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-gray-900 dark:text-white font-mono text-sm">
                          {log.message}
                        </p>
                        
                        {log.details && showSensitiveData && (
                          <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 p-2 rounded">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Tab */}
          {selectedTab === 'emergency' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-700 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                      Emergency Controls
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Use these controls only in critical situations. All actions are logged and audited.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Pause className="w-8 h-8 text-red-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Pause Platform
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Temporarily disable all platform operations
                    </p>
                    <button
                      onClick={() => handleEmergencyAction('pause_platform')}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium"
                    >
                      Pause Platform
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Settings className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Maintenance Mode
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Enable maintenance mode with user notification
                    </p>
                    <button
                      onClick={() => handleEmergencyAction('enable_maintenance')}
                      className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 font-medium"
                    >
                      Enable Maintenance
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Lock className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Freeze Transactions
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Freeze all blockchain transactions immediately
                    </p>
                    <button
                      onClick={() => handleEmergencyAction('freeze_transactions')}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium"
                    >
                      Freeze Transactions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Mode Tab */}
          {selectedTab === 'data_mode' && (
            <div className="space-y-6">
              <DataModeConfig />
            </div>
          )}


          {/* Admin Management Tab - Owner Only */}
          {selectedTab === 'admin_management' && hasAccessToSuperAdminManagement() && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Super Admin Management</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage Super Admin accounts and permissions - Owner access only</p>
                  </div>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">Owner Exclusive Access</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        This section is only accessible to the Platform Owner. All actions here are permanently logged and cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Super Admins */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Super Admins</h3>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-sm font-medium rounded-lg">
                      2 Active
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { id: 1, name: 'Alice Johnson', email: 'alice@cf1platform.com', createdAt: '2024-01-01', lastActive: '2024-12-05', status: 'active' },
                      { id: 2, name: 'Bob Chen', email: 'bob@cf1platform.com', createdAt: '2024-06-15', lastActive: '2024-12-04', status: 'active' }
                    ].map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {admin.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{admin.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Last active: {formatTimeAgo(admin.lastActive)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            admin.status === 'active' 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                          </span>
                          <button className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Revoke Access">
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-3 border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-medium">
                    + Invite New Super Admin
                  </button>
                </div>

                {/* Admin Actions Log */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Admin Actions</h3>
                  
                  <div className="space-y-3">
                    {[
                      { action: 'Super Admin Created', user: 'Bob Chen', timestamp: '2024-12-04T16:30:00Z', type: 'create' },
                      { action: 'Platform Config Updated', user: 'Alice Johnson', timestamp: '2024-12-04T14:15:00Z', type: 'config' },
                      { action: 'Emergency Action: Maintenance Mode', user: 'Alice Johnson', timestamp: '2024-12-03T09:20:00Z', type: 'emergency' },
                      { action: 'User Account Suspended', user: 'Bob Chen', timestamp: '2024-12-02T11:45:00Z', type: 'moderation' }
                    ].map((log, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          log.type === 'create' ? 'bg-green-500' :
                          log.type === 'config' ? 'bg-blue-500' :
                          log.type === 'emergency' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            by {log.user} • {formatTimeAgo(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    View Full Audit Log
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SuperAdmin;