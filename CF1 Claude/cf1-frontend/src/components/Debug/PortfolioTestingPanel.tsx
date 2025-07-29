import React, { useState } from 'react';
import { Bug, Play, Trash, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { 
  testingHelpers, 
  runCompleteTestScenario, 
  runTestScenario, 
  testScenarios, 
  TestResult 
} from '../../utils/portfolioTestingWorkflow';
import { useDataMode } from '../../store/dataModeStore';

interface PortfolioTestingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortfolioTestingPanel: React.FC<PortfolioTestingPanelProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedScenario, setSelectedScenario] = useState('');
  const { currentMode, isDevelopment } = useDataMode();

  const handleRunCompleteTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const results = await runCompleteTestScenario();
      setTestResults(results);
    } catch (error) {
      setTestResults([{
        step: 'Test Execution',
        status: 'error',
        message: `Test execution failed: ${error.message}`
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunScenario = async (scenarioName: string) => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const results = await runTestScenario(scenarioName);
      setTestResults(results);
    } catch (error) {
      setTestResults([{
        step: 'Scenario Execution',
        status: 'error',
        message: `Scenario execution failed: ${error.message}`
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleQuickAction = async (action: () => Promise<any>) => {
    setIsRunning(true);
    try {
      const result = await action();
      setTestResults(Array.isArray(result) ? result : [result]);
    } catch (error) {
      setTestResults([{
        step: 'Quick Action',
        status: 'error',
        message: `Action failed: ${error.message}`
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Bug className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio Testing Panel</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test investment-to-portfolio workflow in development mode
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Environment Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Environment Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg border ${
                isDevelopment 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                <div className="font-medium">Data Mode</div>
                <div className="text-sm">{currentMode.toUpperCase()}</div>
              </div>
              <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-800">
                <div className="font-medium">Testing Environment</div>
                <div className="text-sm">{isDevelopment ? 'Ready' : 'Switch to Development'}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleQuickAction(testingHelpers.env)}
                disabled={isRunning}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <div className="text-sm font-medium">Check Environment</div>
              </button>
              <button
                onClick={() => handleQuickAction(testingHelpers.portfolio)}
                disabled={isRunning}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <div className="text-sm font-medium">Validate Portfolio</div>
              </button>
              <button
                onClick={() => handleQuickAction(() => testingHelpers.fund('quick-test', 'Quick Test Asset', 5000))}
                disabled={isRunning}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <div className="text-sm font-medium">Simulate Fund</div>
              </button>
              <button
                onClick={() => handleQuickAction(testingHelpers.clear)}
                disabled={isRunning}
                className="p-3 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                <div className="text-sm font-medium">Clear Data</div>
              </button>
            </div>
          </div>

          {/* Test Scenarios */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Test Scenarios</h3>
            <div className="space-y-3">
              <button
                onClick={handleRunCompleteTest}
                disabled={isRunning}
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Complete Test...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Complete Test Scenario</span>
                  </>
                )}
              </button>

              {testScenarios.map((scenario) => (
                <button
                  key={scenario.name}
                  onClick={() => handleRunScenario(scenario.name)}
                  disabled={isRunning}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-left"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{scenario.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{scenario.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Test Results</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.step}</span>
                    </div>
                    <div className="text-sm mt-1">{result.message}</div>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer">View Details</summary>
                        <pre className="text-xs mt-1 bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Test Summary: {testResults.filter(r => r.status === 'success').length} passed, 
                  {' '}{testResults.filter(r => r.status === 'error').length} failed,
                  {' '}{testResults.filter(r => r.status === 'warning').length} warnings
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};