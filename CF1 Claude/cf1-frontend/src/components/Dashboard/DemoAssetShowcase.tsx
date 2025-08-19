import React from 'react';
import { Star, TrendingUp, Image as ImageIcon, Info } from 'lucide-react';
import { useDemoMode } from '../../store/demoModeStore';
import { EnhancedPortfolioWidget, EnhancedMarketplaceWidget, EnhancedSpotlightWidget } from './index';

interface DemoAssetShowcaseProps {
  className?: string;
}

const DemoAssetShowcase: React.FC<DemoAssetShowcaseProps> = ({ className = '' }) => {
  const { isDemoMode, scenario } = useDemoMode();

  // Only show this component in demo mode
  if (!isDemoMode) {
    return null;
  }

  const getScenarioTitle = () => {
    switch (scenario) {
      case 'investor_presentation':
        return 'Investor Presentation Mode';
      case 'sales_demo':
        return 'Sales Demo Mode';
      case 'user_onboarding':
        return 'User Onboarding Mode';
      case 'regulatory_showcase':
        return 'Regulatory Showcase Mode';
      case 'development_testing':
        return 'Development Testing Mode';
      default:
        return 'Demo Mode';
    }
  };

  const getScenarioDescription = () => {
    switch (scenario) {
      case 'investor_presentation':
        return 'Professional-grade assets with institutional appeal and premium imagery';
      case 'sales_demo':
        return 'Feature-rich showcase with diverse asset categories and compelling visuals';
      case 'user_onboarding':
        return 'Educational-focused assets with beginner-friendly presentations';
      case 'regulatory_showcase':
        return 'Compliance-ready assets with transparent and realistic performance data';
      case 'development_testing':
        return 'Testing environment with flexible asset configurations';
      default:
        return 'Demonstration of CF1\'s tokenized asset platform';
    }
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 ${className}`}>
      {/* Demo Mode Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {getScenarioTitle()}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {getScenarioDescription()}
            </p>
          </div>
        </div>
        
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 border-l-4 border-blue-600">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Professional Asset Imagery Active
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                All images are high-quality stock photos representing real asset classes that CF1 tokenizes. 
                Images automatically optimize based on demo scenario for the best presentation experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Categories Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Real Estate</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Professional commercial and residential properties with institutional-grade imagery
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Commercial</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Residential</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Hospitality</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Alternative Assets</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Precious metals, fine art, collectibles with premium photography
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Gold/Silver</span>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Fine Art</span>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Vehicles</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <ImageIcon className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Green Infrastructure</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Renewable energy projects and sustainable infrastructure
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Solar</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Wind</span>
            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">Hydro</span>
          </div>
        </div>
      </div>

      {/* Enhanced Widgets Showcase */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Enhanced Dashboard Components
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Experience how professional asset imagery transforms the user interface, making investments 
            more tangible and trustworthy for potential investors.
          </p>
        </div>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Enhanced Portfolio Widget */}
          <div className="h-96">
            <EnhancedPortfolioWidget size="medium" isEditMode={true} />
          </div>

          {/* Enhanced Marketplace Widget */}
          <div className="h-96">
            <EnhancedMarketplaceWidget size="medium" isEditMode={true} />
          </div>

          {/* Enhanced Spotlight Widget */}
          <div className="h-96">
            <EnhancedSpotlightWidget size="medium" isEditMode={true} />
          </div>
        </div>
      </div>

      {/* Features Highlight */}
      <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Professional Imagery Features
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Scenario Optimization:</strong> Image quality and selection adjust based on demo scenario
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Lazy Loading:</strong> Images load efficiently to maintain smooth performance
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Fallback Handling:</strong> Graceful fallbacks when images fail to load
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Asset Category Matching:</strong> Images automatically match asset types and subcategories
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoAssetShowcase;