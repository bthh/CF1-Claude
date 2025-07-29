import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SpotlightSection } from '../Spotlight/SpotlightSection';

interface SpotlightWidgetProps {
  size?: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const SpotlightWidget: React.FC<SpotlightWidgetProps> = ({ 
  size = 'large',
  isEditMode = false 
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Investment Spotlight
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Discover featured opportunities
            </p>
          </div>
        </div>
        
        {!isEditMode && (
          <button
            onClick={() => navigate('/launchpad')}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Use the existing SpotlightSection with compact mode */}
      <div className="max-h-96 overflow-hidden">
        <SpotlightSection mode="compact" className="spotlight-widget-compact" />
      </div>
    </div>
  );
};

export default SpotlightWidget;