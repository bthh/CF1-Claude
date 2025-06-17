import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { performanceMonitor, usePerformanceMonitor } from '../../utils/performance';
import { AnimatedCounter } from '../LoadingStates/TransitionWrapper';

interface PerformanceDashboardProps {
  className?: string;
  showDetails?: boolean;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className = '',
  showDetails = false
}) => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isCollecting, setIsCollecting] = useState(true);
  const { getReport } = usePerformanceMonitor('dashboard');

  useEffect(() => {
    const collectData = () => {
      const report = getReport();
      setPerformanceData(report);
    };

    // Initial collection
    collectData();

    // Update every 10 seconds
    const interval = setInterval(collectData, 10000);
    return () => clearInterval(interval);
  }, [getReport]);

  if (!performanceData) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const getVitalScore = (metric: string, value: number): { score: number; status: 'good' | 'needs-improvement' | 'poor' } => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      tbt: { good: 200, poor: 600 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return { score: 0, status: 'good' };

    if (value <= threshold.good) {
      return { score: 100, status: 'good' };
    } else if (value <= threshold.poor) {
      return { score: Math.max(0, 100 - ((value - threshold.good) / (threshold.poor - threshold.good)) * 100), status: 'needs-improvement' };
    } else {
      return { score: 0, status: 'poor' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'needs-improvement': return <AlertTriangle className="w-4 h-4" />;
      case 'poor': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const fcpScore = getVitalScore('fcp', performanceData.vitals.fcp);
  const lcpScore = getVitalScore('lcp', performanceData.vitals.lcp);
  const clsScore = getVitalScore('cls', performanceData.vitals.cls);
  const tbtScore = getVitalScore('tbt', performanceData.vitals.tbt);

  const overallScore = Math.round((fcpScore.score + lcpScore.score + clsScore.score + tbtScore.score) / 4);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Performance Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Performance Score
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isCollecting ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isCollecting ? 'Monitoring' : 'Stopped'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
            <div 
              className={`absolute inset-0 w-24 h-24 rounded-full border-8 border-transparent ${
                overallScore >= 90 ? 'border-t-green-500 border-r-green-500' :
                overallScore >= 70 ? 'border-t-yellow-500 border-r-yellow-500' :
                'border-t-red-500 border-r-red-500'
              }`}
              style={{
                transform: `rotate(${(overallScore / 100) * 360}deg)`,
                borderTopColor: 'transparent',
                borderRightColor: 'transparent'
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={overallScore} />
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={getStatusColor(fcpScore.status)}>{getStatusIcon(fcpScore.status)}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">First Contentful Paint</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performanceData.vitals.fcp.toFixed(0)}ms
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={getStatusColor(lcpScore.status)}>{getStatusIcon(lcpScore.status)}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Largest Contentful Paint</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performanceData.vitals.lcp.toFixed(0)}ms
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={getStatusColor(clsScore.status)}>{getStatusIcon(clsScore.status)}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cumulative Layout Shift</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performanceData.vitals.cls.toFixed(3)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={getStatusColor(tbtScore.status)}>{getStatusIcon(tbtScore.status)}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Blocking Time</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performanceData.vitals.tbt.toFixed(0)}ms
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Component Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-600" />
          Component Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              <AnimatedCounter value={performanceData.components.total} />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Components</div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">
              <AnimatedCounter value={performanceData.components.slow} />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Slow Components</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              <AnimatedCounter 
                value={performanceData.components.total - performanceData.components.slow} 
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Optimized Components</div>
          </div>
        </div>

        {showDetails && performanceData.components.details.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Slow Components</h4>
            {performanceData.components.details.map((component: any, index: number) => (
              <motion.div
                key={component.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{component.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Rendered {component.renderCount} times
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-red-600">
                    {component.averageRenderTime.toFixed(1)}ms
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">avg render time</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Memory Usage */}
      {performanceData.memory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-600" />
            Memory Usage
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Used Memory</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {performanceData.memory.used}MB
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  (performanceData.memory.used / performanceData.memory.limit) > 0.8
                    ? 'bg-red-500'
                    : (performanceData.memory.used / performanceData.memory.limit) > 0.6
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${(performanceData.memory.used / performanceData.memory.limit) * 100}%`
                }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0MB</span>
              <span>{performanceData.memory.limit}MB</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      {performanceData.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Performance Recommendations
          </h3>

          <div className="space-y-3">
            {performanceData.recommendations.map((recommendation: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Performance Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Tools</h3>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsCollecting(!isCollecting)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isCollecting
                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
            }`}
          >
            {isCollecting ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>

          <button
            onClick={() => {
              const report = getReport();
              navigator.clipboard.writeText(JSON.stringify(report, null, 2));
            }}
            className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
          >
            Copy Report
          </button>

          <button
            onClick={() => {
              const report = getReport();
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `performance-report-${new Date().toISOString()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors"
          >
            Download Report
          </button>

          <button
            onClick={() => {
              if (window.performance && window.performance.clearMarks) {
                window.performance.clearMarks();
                window.performance.clearMeasures();
              }
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Clear Metrics
          </button>
        </div>
      </motion.div>
    </div>
  );
};