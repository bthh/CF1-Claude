import React from 'react';
import { Database, Users, TestTube, Settings } from 'lucide-react';
import { useDataMode } from '../../store/dataModeStore';

export const DataModeConfig: React.FC = () => {
  const { currentMode, defaultMode, isProduction, isDevelopment, isDemo, setMode, setDefault } = useDataMode();

  const dataModes = [
    {
      id: 'production',
      name: 'Production',
      description: 'Live data - currently empty since no real assets exist',
      icon: Database,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    {
      id: 'development',
      name: 'Development',
      description: 'User-created data via UI for ongoing testing',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'demo',
      name: 'Demo',
      description: 'Sample data for presentations and feature exploration',
      icon: TestTube,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    }
  ];

  const getCurrentModeInfo = () => {
    const mode = dataModes.find(m => m.id === currentMode);
    return mode || dataModes[0];
  };

  const handleModeChange = (mode: 'production' | 'development' | 'demo') => {
    setMode(mode, 'Super Admin');
  };

  const handleDefaultChange = (mode: 'production' | 'development' | 'demo') => {
    setDefault(mode);
  };

  const currentModeInfo = getCurrentModeInfo();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Mode Configuration</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Control what data is displayed across the platform
        </p>
      </div>

      <div className="p-6">
        {/* Current Mode Status */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Current Mode</h4>
          <div className={`p-4 rounded-lg border-2 ${currentModeInfo.bgColor} ${currentModeInfo.borderColor}`}>
            <div className="flex items-center space-x-3">
              <currentModeInfo.icon className={`w-6 h-6 ${currentModeInfo.color}`} />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{currentModeInfo.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currentModeInfo.description}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Current Mode */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Change Current Mode</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dataModes.map((mode) => {
              const Icon = mode.icon;
              const isCurrent = currentMode === mode.id;
              
              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id as any)}
                  className={`p-4 text-left border-2 rounded-lg transition-all ${
                    isCurrent
                      ? `${mode.bgColor} ${mode.borderColor}`
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`w-5 h-5 ${isCurrent ? mode.color : 'text-gray-400'}`} />
                    <span className={`font-medium ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {mode.name}
                    </span>
                    {isCurrent && (
                      <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{mode.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Set Default Mode */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Default Mode</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            The mode that will be active when users first visit the platform or when the system resets.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">Current default:</span>
            <select
              value={defaultMode}
              onChange={(e) => handleDefaultChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {dataModes.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode Explanations */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 dark:text-white mb-3">Mode Details</h5>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-red-600">Production:</span>
              <span className="text-gray-700 dark:text-gray-300 ml-2">
                Real live data. Currently empty since no actual assets or proposals exist yet.
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-600">Development:</span>
              <span className="text-gray-700 dark:text-gray-300 ml-2">
                Data you create through the UI forms. Used for testing during development.
              </span>
            </div>
            <div>
              <span className="font-medium text-green-600">Demo:</span>
              <span className="text-gray-700 dark:text-gray-300 ml-2">
                Pre-built sample data for demonstrations, investor presentations, and feature exploration.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};