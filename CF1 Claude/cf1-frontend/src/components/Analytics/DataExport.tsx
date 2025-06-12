import React, { useState } from 'react';
import { Download, FileText, Calendar, Database, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { ExportOptions } from '../../types/analytics';

interface ExportFormatOption {
  format: ExportOptions['format'];
  name: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}

interface ExportPreset {
  id: string;
  name: string;
  description: string;
  options: Partial<ExportOptions>;
}

export const DataExport: React.FC = () => {
  const { handleExport, dashboard } = useAnalytics();
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    metrics: ['platformMetrics', 'userAnalytics'],
    includeCharts: false,
    includeRawData: true
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const formatOptions: ExportFormatOption[] = [
    {
      format: 'csv',
      name: 'CSV',
      description: 'Comma-separated values for spreadsheet analysis',
      icon: <FileText className="w-5 h-5" />,
      popular: true
    },
    {
      format: 'xlsx',
      name: 'Excel',
      description: 'Microsoft Excel workbook with formatted sheets',
      icon: <Database className="w-5 h-5" />,
      popular: true
    },
    {
      format: 'json',
      name: 'JSON',
      description: 'Structured data for API integration',
      icon: <Settings className="w-5 h-5" />
    },
    {
      format: 'pdf',
      name: 'PDF Report',
      description: 'Formatted report with charts and analysis',
      icon: <FileText className="w-5 h-5" />
    }
  ];

  const exportPresets: ExportPreset[] = [
    {
      id: 'portfolio-summary',
      name: 'Portfolio Summary',
      description: 'Complete portfolio overview with performance metrics',
      options: {
        format: 'pdf',
        metrics: ['userAnalytics', 'platformMetrics'],
        includeCharts: true,
        includeRawData: false
      }
    },
    {
      id: 'tax-report',
      name: 'Tax Report',
      description: 'Transaction history and gains/losses for tax filing',
      options: {
        format: 'csv',
        metrics: ['userAnalytics'],
        includeCharts: false,
        includeRawData: true
      }
    },
    {
      id: 'market-analysis',
      name: 'Market Analysis',
      description: 'Market trends and asset performance data',
      options: {
        format: 'xlsx',
        metrics: ['marketInsights', 'platformMetrics'],
        includeCharts: true,
        includeRawData: true
      }
    },
    {
      id: 'compliance-report',
      name: 'Compliance Report',
      description: 'Regulatory compliance and audit trail',
      options: {
        format: 'pdf',
        metrics: ['userAnalytics', 'platformMetrics', 'governanceAnalytics'],
        includeCharts: false,
        includeRawData: true
      }
    }
  ];

  const metricOptions = [
    { key: 'platformMetrics', label: 'Platform Metrics', description: 'Overall platform performance and statistics' },
    { key: 'userAnalytics', label: 'Portfolio Analytics', description: 'Personal investment performance and holdings' },
    { key: 'marketInsights', label: 'Market Insights', description: 'Market trends and asset analysis' },
    { key: 'governanceAnalytics', label: 'Governance Data', description: 'Voting history and proposal analytics' },
    { key: 'launchpadAnalytics', label: 'Launchpad Data', description: 'Asset launch and funding analytics' }
  ];

  const handleExportSubmit = async () => {
    setIsExporting(true);
    setExportStatus('idle');
    
    try {
      await handleExport(exportOptions);
      setExportStatus('success');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  const applyPreset = (preset: ExportPreset) => {
    setExportOptions(prev => ({
      ...prev,
      ...preset.options
    }));
  };

  const updateMetrics = (metric: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      metrics: checked 
        ? [...prev.metrics, metric]
        : prev.metrics.filter(m => m !== metric)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Export & Reports</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Export your analytics data in various formats for external analysis
          </p>
        </div>
        
        {exportStatus === 'success' && (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Export completed successfully</span>
          </div>
        )}
        
        {exportStatus === 'error' && (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Export failed. Please try again.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Presets */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Export</h3>
            <div className="space-y-3">
              {exportPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white">{preset.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{preset.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                      {preset.options.format?.toUpperCase()}
                    </span>
                    {preset.options.includeCharts && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                        Charts
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Export Configuration */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Custom Export</h3>
            
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {formatOptions.map((option) => (
                    <button
                      key={option.format}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: option.format }))}
                      className={`relative p-4 border rounded-lg transition-all ${
                        exportOptions.format === option.format
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.popular && (
                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                      <div className="flex items-center space-x-3">
                        <div className={`${
                          exportOptions.format === option.format
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {option.icon}
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900 dark:text-white">{option.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={exportOptions.dateRange.start}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={exportOptions.dateRange.end}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Data Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Data to Include
                </label>
                <div className="space-y-3">
                  {metricOptions.map((metric) => (
                    <label key={metric.key} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.metrics.includes(metric.key)}
                        onChange={(e) => updateMetrics(metric.key, e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{metric.label}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{metric.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Additional Options
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCharts}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white">Include charts and visualizations</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeRawData}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeRawData: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white">Include raw transaction data</span>
                  </label>
                </div>
              </div>

              {/* Export Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleExportSubmit}
                  disabled={isExporting || exportOptions.metrics.length === 0}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Export Data</span>
                    </>
                  )}
                </button>
                
                {exportOptions.metrics.length === 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center">
                    Please select at least one data category to export
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Exports</h3>
        <div className="space-y-3">
          {/* Mock export history */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Portfolio Summary (PDF)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Exported 2 hours ago</p>
              </div>
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Download Again
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Market Analysis (Excel)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Exported yesterday</p>
              </div>
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Download Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};