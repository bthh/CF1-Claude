import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Download, 
  Trash2,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap
} from 'lucide-react';
import { errorHandler, ErrorInfo } from '../../utils/errorHandling';
import { AnimatedButton, AnimatedCounter } from '../LoadingStates/TransitionWrapper';
import { SwipeableModal } from '../GestureComponents/SwipeableModal';

interface ErrorDashboardProps {
  className?: string;
  showDetails?: boolean;
}

export const ErrorDashboard: React.FC<ErrorDashboardProps> = ({
  className = '',
  showDetails = false
}) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<ErrorInfo[]>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedError, setSelectedError] = useState<ErrorInfo | null>(null);
  const [filters, setFilters] = useState({
    severity: '',
    category: '',
    recovered: '',
    timeRange: '24h'
  });
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  useEffect(() => {
    const loadErrors = () => {
      const allErrors = errorHandler.getErrors();
      const errorStats = errorHandler.getErrorStats();
      
      setErrors(allErrors);
      setStats(errorStats);
      applyFilters(allErrors);
    };

    loadErrors();

    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(loadErrors, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh]);

  useEffect(() => {
    applyFilters(errors);
  }, [filters, errors]);

  const applyFilters = (errorList: ErrorInfo[]) => {
    let filtered = [...errorList];

    // Time range filter
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    if (filters.timeRange && timeRanges[filters.timeRange]) {
      const cutoff = now - timeRanges[filters.timeRange];
      filtered = filtered.filter(error => error.timestamp >= cutoff);
    }

    // Other filters
    if (filters.severity) {
      filtered = filtered.filter(error => error.severity === filters.severity);
    }
    if (filters.category) {
      filtered = filtered.filter(error => error.category === filters.category);
    }
    if (filters.recovered) {
      const isRecovered = filters.recovered === 'true';
      filtered = filtered.filter(error => error.recovered === isRecovered);
    }

    setFilteredErrors(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/10';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/10';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'network': return '🌐';
      case 'ui': return '🎨';
      case 'logic': return '⚙️';
      case 'permission': return '🔒';
      case 'timeout': return '⏱️';
      default: return '❓';
    }
  };

  const handleClearErrors = () => {
    errorHandler.clearErrors();
    setErrors([]);
    setFilteredErrors([]);
    setStats({});
  };

  const handleExportErrors = () => {
    const exportData = errorHandler.exportErrors();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cf1-errors-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getErrorTrend = () => {
    const recent = errors.filter(e => e.timestamp > Date.now() - 24 * 60 * 60 * 1000);
    const older = errors.filter(e => 
      e.timestamp > Date.now() - 48 * 60 * 60 * 1000 &&
      e.timestamp <= Date.now() - 24 * 60 * 60 * 1000
    );

    const recentCount = recent.length;
    const olderCount = older.length;
    const trend = olderCount === 0 ? 0 : ((recentCount - olderCount) / olderCount) * 100;

    return { trend, recentCount, olderCount };
  };

  const { trend, recentCount } = getErrorTrend();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Errors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={stats.total || 0} />
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
            )}
            <span className={trend > 0 ? 'text-red-600' : 'text-green-600'}>
              {Math.abs(trend).toFixed(1)}% vs yesterday
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recovered</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={stats.recovered || 0} />
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {stats.total > 0 ? 
              `${Math.round((stats.recovered / stats.total) * 100)}% recovery rate` :
              'No errors to recover'
            }
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recent (24h)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={recentCount} />
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Last error: {errors.length > 0 ? 
              new Date(errors[0].timestamp).toLocaleTimeString() :
              'None'
            }
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={stats.bySeverity?.critical || 0} />
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Requires immediate attention
          </div>
        </div>
      </motion.div>

      {/* Error Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Error Categories
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                isAutoRefresh
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(stats.byCategory || {}).map(([category, count]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
            >
              <div className="text-2xl mb-2">{getCategoryIcon(category)}</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                <AnimatedCounter value={count as number} />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {category}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>

            <select
              value={filters.timeRange}
              onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
            >
              <option value="">All Categories</option>
              <option value="network">Network</option>
              <option value="ui">UI</option>
              <option value="logic">Logic</option>
              <option value="permission">Permission</option>
              <option value="timeout">Timeout</option>
            </select>

            <select
              value={filters.recovered}
              onChange={(e) => setFilters(prev => ({ ...prev, recovered: e.target.value }))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
            >
              <option value="">All Status</option>
              <option value="true">Recovered</option>
              <option value="false">Unrecovered</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <AnimatedButton
              onClick={handleExportErrors}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </AnimatedButton>

            <AnimatedButton
              onClick={handleClearErrors}
              variant="danger"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </AnimatedButton>
          </div>
        </div>
      </motion.div>

      {/* Error List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Error Log ({filteredErrors.length})
          </h3>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredErrors.map((error, index) => (
              <motion.div
                key={error.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => setSelectedError(error)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}>
                        {getSeverityIcon(error.severity)}
                        <span className="ml-1">{error.severity}</span>
                      </span>
                      
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getCategoryIcon(error.category)} {error.category}
                      </span>
                      
                      {error.recovered && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Recovered
                        </span>
                      )}
                      
                      {error.retryCount && error.retryCount > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          {error.retryCount} retries
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {error.message}
                    </p>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(error.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="ml-4 text-xs text-gray-400 dark:text-gray-500">
                    #{error.id.slice(-8)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredErrors.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No errors found matching your filters</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Error Detail Modal */}
      <SwipeableModal
        isOpen={!!selectedError}
        onClose={() => setSelectedError(null)}
        title="Error Details"
        className="max-w-4xl mx-auto"
      >
        {selectedError && (
          <div className="p-6 space-y-6">
            {/* Error Overview */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedError.severity)}`}>
                    {getSeverityIcon(selectedError.severity)}
                    <span className="ml-2">{selectedError.severity}</span>
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {getCategoryIcon(selectedError.category)} {selectedError.category}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedError.message}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(selectedError.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                ID: {selectedError.id}
              </div>
            </div>

            {/* Error Context */}
            {selectedError.context && Object.keys(selectedError.context).length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Context</h5>
                <pre className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-sm overflow-auto">
                  {JSON.stringify(selectedError.context, null, 2)}
                </pre>
              </div>
            )}

            {/* Stack Trace */}
            {selectedError.stack && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Stack Trace</h5>
                <pre className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-sm overflow-auto font-mono">
                  {selectedError.stack}
                </pre>
              </div>
            )}

            {/* Recovery Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                {selectedError.recovered ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedError.recovered ? 'Recovered' : 'Unrecovered'}
                </span>
              </div>
              
              {selectedError.retryCount && selectedError.retryCount > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedError.retryCount} retry attempts
                </span>
              )}
            </div>
          </div>
        )}
      </SwipeableModal>
    </div>
  );
};