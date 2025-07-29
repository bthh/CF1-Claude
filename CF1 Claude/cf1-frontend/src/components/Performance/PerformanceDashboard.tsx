/**
 * Performance Dashboard Component
 * Real-time performance monitoring display
 */

import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { performanceMonitor, PERFORMANCE_THRESHOLDS, MetricType } from '../../utils/performanceMonitoring';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'needs_improvement' | 'poor';
  threshold: { good: number; poor: number };
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const shouldShow = import.meta.env.MODE === 'development' || 
                      localStorage.getItem('cf1-show-performance') === 'true';
    setIsVisible(shouldShow);

    if (!shouldShow) return;

    const updateMetrics = () => {
      const currentSummary = performanceMonitor.getPerformanceSummary();
      setSummary(currentSummary);

      const newMetrics: PerformanceMetric[] = [
        {
          name: 'Page Load Time',
          value: currentSummary.averagePageLoad || 0,
          unit: 'ms',
          status: getStatus(currentSummary.averagePageLoad || 0, PERFORMANCE_THRESHOLDS[MetricType.PAGE_LOAD]),
          threshold: PERFORMANCE_THRESHOLDS[MetricType.PAGE_LOAD]
        },
        {
          name: 'API Response Time',
          value: currentSummary.averageApiResponse || 0,
          unit: 'ms',
          status: getStatus(currentSummary.averageApiResponse || 0, PERFORMANCE_THRESHOLDS[MetricType.API_RESPONSE]),
          threshold: PERFORMANCE_THRESHOLDS[MetricType.API_RESPONSE]
        },
        {
          name: 'Error Rate',
          value: currentSummary.errorRate || 0,
          unit: '%',
          status: currentSummary.errorRate && currentSummary.errorRate > 5 ? 'poor' : 
                  currentSummary.errorRate && currentSummary.errorRate > 1 ? 'needs_improvement' : 'good',
          threshold: { good: 1, poor: 5 }
        }
      ];

      setMetrics(newMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatus = (value: number, threshold: { good: number; poor: number }) => {
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs_improvement';
    return 'poor';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'needs_improvement':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'needs_improvement':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Performance</h3>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(metric.status)}
                <span className="text-xs text-gray-600 dark:text-gray-400">{metric.name}</span>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(metric.status)}`}>
                {metric.value > 0 ? `${metric.value.toFixed(0)}${metric.unit}` : 'N/A'}
              </div>
            </div>
          ))}
        </div>

        {summary && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Events Tracked</span>
              <span>{summary.eventsCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;