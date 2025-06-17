import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Server,
  Lock,
  Eye,
  RotateCcw,
  Download,
  Upload,
  Zap
} from 'lucide-react';
import { AnimatedButton, AnimatedCounter } from '../LoadingStates/TransitionWrapper';
import { SwipeableModal } from '../GestureComponents/SwipeableModal';
import { SkeletonLoader } from '../LoadingStates/SkeletonLoader';

interface SystemMetrics {
  users: {
    total: number;
    active: number;
    verified: number;
    suspended: number;
  };
  platform: {
    uptime: number;
    transactions: number;
    volume: number;
    errors: number;
  };
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    cpu: number;
    memory: number;
  };
}

interface UserAction {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: number;
  ipAddress: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: number;
  acknowledged: boolean;
  source: string;
}

export const SuperAdminTools: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'system' | 'security' | 'backup'>('overview');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<UserAction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        users: {
          total: 15847,
          active: 12943,
          verified: 14201,
          suspended: 156
        },
        platform: {
          uptime: 99.97,
          transactions: 847291,
          volume: 127500000,
          errors: 23
        },
        performance: {
          responseTime: 185,
          throughput: 2847,
          errorRate: 0.02,
          cpu: 34,
          memory: 67
        }
      });

      // Mock user actions
      setUserActions([
        {
          id: '1',
          userId: 'user_12345',
          userName: 'john.doe@example.com',
          action: 'Large Investment',
          details: 'Invested $250,000 in Commercial Real Estate Token',
          timestamp: Date.now() - 300000,
          ipAddress: '192.168.1.100',
          severity: 'high'
        },
        {
          id: '2',
          userId: 'user_67890',
          userName: 'jane.smith@example.com',
          action: 'Admin Login',
          details: 'Accessed creator admin panel',
          timestamp: Date.now() - 600000,
          ipAddress: '10.0.0.5',
          severity: 'medium'
        },
        {
          id: '3',
          userId: 'user_11111',
          userName: 'suspicious.user@example.com',
          action: 'Multiple Failed Logins',
          details: '5 failed login attempts in 10 minutes',
          timestamp: Date.now() - 900000,
          ipAddress: '185.220.101.42',
          severity: 'critical'
        }
      ]);

      // Mock system alerts
      setSystemAlerts([
        {
          id: '1',
          title: 'High Memory Usage',
          message: 'System memory usage has exceeded 80% threshold',
          severity: 'warning',
          timestamp: Date.now() - 1200000,
          acknowledged: false,
          source: 'System Monitor'
        },
        {
          id: '2',
          title: 'Unusual Trading Activity',
          message: 'Detected potential market manipulation in Energy sector',
          severity: 'critical',
          timestamp: Date.now() - 1800000,
          acknowledged: false,
          source: 'Risk Engine'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load system data:', error);
      setLoading(false);
    }
  };

  const handleSystemAction = async (action: string) => {
    console.log(`Executing system action: ${action}`);
    // In a real app, this would call the backend
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const acknowledgeAlert = (alertId: string) => {
    setSystemAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/10';
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/10';
      case 'info': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/10';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'system', label: 'System Health', icon: Server },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'backup', label: 'Backup & Recovery', icon: Database }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader variant="text" className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <SkeletonLoader variant="rectangular" className="h-32" />
            </div>
          ))}
        </div>
        <SkeletonLoader variant="rectangular" className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Shield className="w-6 h-6 mr-3 text-red-600" />
            Super Admin Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Platform-wide administration and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">System Online</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={metrics.users.total} />
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-green-600">{metrics.users.active}</span> active users
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Platform Uptime</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={metrics.platform.uptime} decimals={2} suffix="%" />
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600">
              Excellent performance
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $<AnimatedCounter value={metrics.platform.volume} decimals={0} />
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm">
              <AnimatedCounter value={metrics.platform.transactions} /> transactions
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Errors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={metrics.platform.errors} />
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-red-600">{metrics.performance.errorRate}%</span> error rate
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* System Alerts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    System Alerts
                  </h3>
                  <div className="space-y-3">
                    {systemAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-lg border-l-4 ${
                          alert.severity === 'critical'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                            : alert.severity === 'warning'
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                            : 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                        } ${alert.acknowledged ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {alert.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {alert.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{alert.source}</span>
                              <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          {!alert.acknowledged && (
                            <AnimatedButton
                              onClick={() => acknowledgeAlert(alert.id)}
                              size="sm"
                              variant="secondary"
                            >
                              Acknowledge
                            </AnimatedButton>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recent User Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent High-Priority User Actions
                  </h3>
                  <div className="space-y-3">
                    {userActions.map((action) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => {
                          setSelectedAction(action);
                          setShowActionModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(action.severity)}`}>
                                {action.severity}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {action.userName}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {action.action}: {action.details}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(action.timestamp).toLocaleString()} • {action.ipAddress}
                            </p>
                          </div>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'system' && metrics && (
              <motion.div
                key="system"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Response Time</h4>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      <AnimatedCounter value={metrics.performance.responseTime} />ms
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(0, 100 - (metrics.performance.responseTime / 5))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">CPU Usage</h4>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      <AnimatedCounter value={metrics.performance.cpu} />%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          metrics.performance.cpu > 80 ? 'bg-red-500' :
                          metrics.performance.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${metrics.performance.cpu}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Memory Usage</h4>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      <AnimatedCounter value={metrics.performance.memory} />%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          metrics.performance.memory > 80 ? 'bg-red-500' :
                          metrics.performance.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${metrics.performance.memory}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* System Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    System Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatedButton
                      onClick={() => handleSystemAction('restart-services')}
                      variant="secondary"
                      className="flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restart Services</span>
                    </AnimatedButton>

                    <AnimatedButton
                      onClick={() => handleSystemAction('clear-cache')}
                      variant="secondary"
                      className="flex items-center justify-center space-x-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Clear Cache</span>
                    </AnimatedButton>

                    <AnimatedButton
                      onClick={() => handleSystemAction('maintenance-mode')}
                      variant="danger"
                      className="flex items-center justify-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Maintenance Mode</span>
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'backup' && (
              <motion.div
                key="backup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Database Backup
                    </h3>
                    <div className="space-y-3">
                      <AnimatedButton
                        onClick={() => handleSystemAction('create-backup')}
                        variant="primary"
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Create Full Backup</span>
                      </AnimatedButton>

                      <AnimatedButton
                        onClick={() => handleSystemAction('incremental-backup')}
                        variant="secondary"
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Incremental Backup</span>
                      </AnimatedButton>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      System Recovery
                    </h3>
                    <div className="space-y-3">
                      <AnimatedButton
                        onClick={() => handleSystemAction('restore-backup')}
                        variant="danger"
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Restore from Backup</span>
                      </AnimatedButton>

                      <AnimatedButton
                        onClick={() => handleSystemAction('disaster-recovery')}
                        variant="danger"
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Disaster Recovery</span>
                      </AnimatedButton>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                        Warning: Backup & Recovery Operations
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        These operations affect the entire platform. Use with extreme caution and ensure you have proper authorization.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Detail Modal */}
      <SwipeableModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title="User Action Details"
        className="max-w-2xl mx-auto"
      >
        {selectedAction && (
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedAction.severity)}`}>
                {selectedAction.severity}
              </span>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedAction.action}
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">User:</span>
                <p className="text-gray-900 dark:text-white">{selectedAction.userName}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Details:</span>
                <p className="text-gray-900 dark:text-white">{selectedAction.details}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address:</span>
                <p className="text-gray-900 dark:text-white">{selectedAction.ipAddress}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp:</span>
                <p className="text-gray-900 dark:text-white">{new Date(selectedAction.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <AnimatedButton
                onClick={() => console.log('Investigate user')}
                variant="secondary"
              >
                Investigate User
              </AnimatedButton>
              
              <AnimatedButton
                onClick={() => console.log('Flag as suspicious')}
                variant="danger"
              >
                Flag as Suspicious
              </AnimatedButton>
            </div>
          </div>
        )}
      </SwipeableModal>
    </div>
  );
};