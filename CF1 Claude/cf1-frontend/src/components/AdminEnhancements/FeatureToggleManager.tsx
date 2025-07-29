import React, { useEffect } from 'react';
import { 
  Shield, 
  ToggleLeft, 
  ToggleRight, 
  AlertTriangle,
  Info,
  Clock,
  User,
  RefreshCw
} from 'lucide-react';
import { useFeatureToggleStore } from '../../store/featureToggleStore';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { formatTimeAgo } from '../../utils/format';

const FeatureToggleManager: React.FC = () => {
  const { currentAdmin, checkPermission } = useAdminAuthContext();
  const { features, isFeatureEnabled, updateFeatureToggle, loadFeatureToggles } = useFeatureToggleStore();
  const { success, error, warning } = useNotifications();

  useEffect(() => {
    loadFeatureToggles();
  }, [loadFeatureToggles]);

  const handleToggle = (featureId: string, currentState: boolean) => {
    const feature = features[featureId];
    
    // Check permissions
    if (feature.requiredRole === 'super_admin' && !checkPermission('emergency_controls')) {
      error('Only Super Admins can toggle this feature');
      return;
    }
    
    if (feature.requiredRole === 'platform_admin' && !checkPermission('manage_platform_config')) {
      error('You don\'t have permission to toggle this feature');
      return;
    }

    // Warn about critical features
    if (featureId === 'maintenance_mode' && !currentState) {
      warning('Enabling maintenance mode will make the platform read-only for all users');
    }

    if (featureId === 'launchpad' && currentState) {
      warning('Disabling launchpad will prevent new proposals from being created');
    }

    updateFeatureToggle(featureId, !currentState, currentAdmin?.address || 'unknown');
    success(`${feature.name} has been ${!currentState ? 'enabled' : 'disabled'}`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'defi': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'trading': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'governance': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'launchpad': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'general': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const groupedFeatures = Object.values(features || {}).reduce((acc, feature) => {
    if (!feature || !feature.category) return acc;
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureToggle[]>);

  // Add loading and error states
  if (!features) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading feature toggles...</span>
      </div>
    );
  }

  const hasFeatures = Object.keys(features).length > 0;
  
  if (!hasFeatures) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Feature Toggles Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Feature toggles are loading or not configured yet.
          </p>
          <button
            onClick={loadFeatureToggles}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Features</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Feature Management
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Control platform features and functionality
              </p>
            </div>
          </div>
          <button
            onClick={() => loadFeatureToggles()}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-300">
              Important: Feature changes take effect immediately
            </p>
            <p className="text-yellow-700 dark:text-yellow-400 mt-1">
              Disabling features will restrict access for all users. Make sure to communicate changes before toggling critical features.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Categories */}
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
            {category.replace('_', ' ')} Features
          </h3>
          
          <div className="space-y-4">
            {categoryFeatures.map((feature) => (
              <div 
                key={feature.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {feature.name}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getCategoryColor(feature.category)}`}>
                        {feature.category}
                      </span>
                      {feature.requiredRole && (
                        <span className="px-2 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          {feature.requiredRole.replace('_', ' ')} only
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Modified {formatTimeAgo(feature.lastModified)}</span>
                      </div>
                      {feature.modifiedBy && (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{feature.modifiedBy.slice(0, 8)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggle(feature.id, feature.enabled)}
                    disabled={
                      (feature.requiredRole === 'super_admin' && !checkPermission('emergency_controls')) ||
                      (feature.requiredRole === 'platform_admin' && !checkPermission('manage_platform_config'))
                    }
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      feature.enabled 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {feature.enabled ? (
                      <>
                        <ToggleRight className="w-5 h-5" />
                        <span className="font-medium">Enabled</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5" />
                        <span className="font-medium">Disabled</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Status Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Feature Status Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.values(features).filter(f => f.enabled).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enabled Features
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.values(features).filter(f => !f.enabled).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Disabled Features
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.values(features).filter(f => f.category === 'general').length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              General Features
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {isFeatureEnabled('maintenance_mode') ? 'ON' : 'OFF'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Maintenance Mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureToggleManager;