import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  Info, 
  Bug, 
  Zap,
  Filter,
  Download,
  Trash2,
  Eye,
  Search,
  Clock,
  User,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { logger, LogEntry, LogLevel } from '../../utils/logging';
import { AnimatedButton, AnimatedCounter } from '../LoadingStates/TransitionWrapper';
import { SwipeableModal } from '../GestureComponents/SwipeableModal';

interface LoggingDashboardProps {
  className?: string;
  showDetails?: boolean;
}

export const LoggingDashboard: React.FC<LoggingDashboardProps> = ({
  className = '',
  showDetails = false
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    search: '',
    timeRange: '1h'
  });
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    const loadLogs = () => {
      const allLogs = logger.getLogs();
      const logStats = logger.getStats();
      
      setLogs(allLogs);
      setStats(logStats);
      applyFilters(allLogs);
    };

    loadLogs();

    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(loadLogs, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh]);

  useEffect(() => {
    applyFilters(logs);
  }, [filters, logs]);

  const applyFilters = (logList: LogEntry[]) => {
    let filtered = [...logList];

    // Time range filter
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      '5m': 5 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };

    if (filters.timeRange && timeRanges[filters.timeRange]) {
      const cutoff = now - timeRanges[filters.timeRange];
      filtered = filtered.filter(log => log.timestamp >= cutoff);
    }

    // Level filter
    if (filters.level) {
      const levelValue = LogLevel[filters.level as keyof typeof LogLevel];
      filtered = filtered.filter(log => log.level === levelValue);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.category.toLowerCase().includes(searchLower) ||
        (log.source?.component && log.source.component.toLowerCase().includes(searchLower))
      );
    }

    setFilteredLogs(filtered);
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return <Bug className="w-4 h-4" />;
      case LogLevel.INFO:
        return <Info className="w-4 h-4" />;
      case LogLevel.WARN:
        return <AlertTriangle className="w-4 h-4" />;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        return <Zap className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case LogLevel.INFO:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case LogLevel.WARN:
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case LogLevel.ERROR:
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case LogLevel.CRITICAL:
        return 'text-red-700 bg-red-200 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user-action':
        return <User className="w-4 h-4" />;
      case 'network':
        return <Globe className="w-4 h-4" />;
      case 'performance':
        return <Activity className="w-4 h-4" />;
      case 'business-event':
        return <Zap className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const handleExportLogs = () => {
    const exportData = logger.exportLogs();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cf1-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    setFilteredLogs([]);
  };

  const getUniqueCategories = () => {
    const categories = new Set(logs.map(log => log.category));
    return Array.from(categories);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDeviceInfo = (entry: LogEntry) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      entry.metadata.userAgent
    );
    return isMobile ? 'Mobile' : 'Desktop';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={stats.totalEntries || 0} />
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Errors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={(stats.entriesByLevel?.ERROR || 0) + (stats.entriesByLevel?.CRITICAL || 0)} />
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Warnings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={stats.entriesByLevel?.WARN || 0} />
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Session Time</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {Math.round((stats.sessionDuration || 0) / 1000 / 60)}m
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={Object.keys(stats.entriesByCategory || {}).length} />
              </p>
            </div>
            <Filter className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Log Categories
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(stats.entriesByCategory || {}).map(([category, count]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                {getCategoryIcon(category)}
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                <AnimatedCounter value={count as number} />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {category.replace('-', ' ')}
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
              <option value="5m">Last 5 minutes</option>
              <option value="1h">Last hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
            >
              <option value="">All Levels</option>
              <option value="DEBUG">Debug</option>
              <option value="INFO">Info</option>
              <option value="WARN">Warning</option>
              <option value="ERROR">Error</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
            >
              <option value="">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 w-48"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                isAutoRefresh
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700'
              }`}
            >
              <Activity className={`w-4 h-4 ${isAutoRefresh ? 'animate-pulse' : ''}`} />
            </button>

            <AnimatedButton
              onClick={handleExportLogs}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </AnimatedButton>

            <AnimatedButton
              onClick={handleClearLogs}
              variant="danger"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </AnimatedButton>
          </div>
        </div>
      </motion.div>

      {/* Log List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Log Entries ({filteredLogs.length})
          </h3>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.02 }}
                className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => {
                  setSelectedLog(log);
                  setShowLogModal(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        <span className="ml-1">{LogLevel[log.level]}</span>
                      </span>
                      
                      <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                        {getCategoryIcon(log.category)}
                        <span className="ml-1">{log.category}</span>
                      </span>
                      
                      {log.source?.component && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {log.source.component}
                        </span>
                      )}

                      <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                        {getDeviceInfo(log) === 'Mobile' ? 
                          <Smartphone className="w-3 h-3 mr-1" /> : 
                          <Monitor className="w-3 h-3 mr-1" />
                        }
                        {getDeviceInfo(log)}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {log.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        {log.userId && <span>User: {log.userId.slice(0, 8)}...</span>}
                        <span>#{log.id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Eye className="w-4 h-4 text-gray-400 ml-4" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No log entries found matching your filters</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Log Detail Modal */}
      <SwipeableModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Log Entry Details"
        className="max-w-4xl mx-auto"
      >
        {selectedLog && (
          <div className="p-6 space-y-6">
            {/* Log Overview */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedLog.level)}`}>
                    {getLevelIcon(selectedLog.level)}
                    <span className="ml-2">{LogLevel[selectedLog.level]}</span>
                  </span>
                  <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                    {getCategoryIcon(selectedLog.category)}
                    <span className="ml-1">{selectedLog.category}</span>
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedLog.message}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                ID: {selectedLog.id}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Source Information</h5>
                <div className="space-y-2 text-sm">
                  {selectedLog.source?.component && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Component:</span>
                      <span className="text-gray-900 dark:text-white">{selectedLog.source.component}</span>
                    </div>
                  )}
                  {selectedLog.source?.file && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">File:</span>
                      <span className="text-gray-900 dark:text-white">{selectedLog.source.file}</span>
                    </div>
                  )}
                  {selectedLog.source?.line && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Line:</span>
                      <span className="text-gray-900 dark:text-white">{selectedLog.source.line}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Session:</span>
                    <span className="text-gray-900 dark:text-white font-mono text-xs">
                      {selectedLog.sessionId.slice(-12)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Environment</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">URL:</span>
                    <span className="text-gray-900 dark:text-white truncate">
                      {selectedLog.metadata.url.replace(/^https?:\/\/[^\/]+/, '')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform:</span>
                    <span className="text-gray-900 dark:text-white">{selectedLog.metadata.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Viewport:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedLog.metadata.viewport.width}×{selectedLog.metadata.viewport.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Device:</span>
                    <span className="text-gray-900 dark:text-white">
                      {getDeviceInfo(selectedLog)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Context Data */}
            {selectedLog.context && Object.keys(selectedLog.context).length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Context Data</h5>
                <pre className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-sm overflow-auto max-h-48">
                  {JSON.stringify(selectedLog.context, null, 2)}
                </pre>
              </div>
            )}

            {/* Stack Trace */}
            {selectedLog.stackTrace && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Stack Trace</h5>
                <pre className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-sm overflow-auto max-h-48 font-mono">
                  {selectedLog.stackTrace}
                </pre>
              </div>
            )}

            {/* User Agent */}
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">User Agent</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 break-all">
                {selectedLog.metadata.userAgent}
              </p>
            </div>
          </div>
        )}
      </SwipeableModal>
    </div>
  );
};