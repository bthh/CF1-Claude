import React from 'react';
import { 
  Play, 
  BookOpen, 
  Zap, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  X,
  Settings
} from 'lucide-react';
import type { OnboardingTour } from '../../hooks/useOnboarding';
import { CF1_ONBOARDING_TOURS, getToursByCategory } from '../../data/onboardingTours';

interface OnboardingWelcomeProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: (tourId: string) => void;
  completedTours: string[];
  userPreferences: {
    skipIntros: boolean;
    autoProgress: boolean;
    showHints: boolean;
  };
  onUpdatePreferences: (preferences: any) => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  isOpen,
  onClose,
  onStartTour,
  completedTours,
  userPreferences,
  onUpdatePreferences
}) => {
  if (!isOpen) return null;

  const welcomeTours = getToursByCategory('welcome');
  const featureTours = getToursByCategory('feature');
  const advancedTours = getToursByCategory('advanced');

  const getTourIcon = (icon: string | undefined) => {
    switch (icon) {
      case '👋': return <div className="text-2xl">👋</div>;
      case '🏪': return <div className="text-2xl">🏪</div>;
      case '💰': return <div className="text-2xl">💰</div>;
      case '📊': return <div className="text-2xl">📊</div>;
      case '🗳️': return <div className="text-2xl">🗳️</div>;
      case '🚀': return <div className="text-2xl">🚀</div>;
      case '⚡': return <div className="text-2xl">⚡</div>;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  const getTourProgress = (tour: OnboardingTour) => {
    if (completedTours.includes(tour.id)) return 100;
    return 0; // Could implement partial progress tracking
  };

  const TourCard: React.FC<{ tour: OnboardingTour; recommended?: boolean }> = ({ 
    tour, 
    recommended = false 
  }) => {
    const isCompleted = completedTours.includes(tour.id);
    const progress = getTourProgress(tour);

    return (
      <div className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
        recommended 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isCompleted 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : recommended 
              ? 'bg-blue-100 dark:bg-blue-900/20' 
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              getTourIcon(tour.icon)
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-medium text-sm ${
                recommended ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
              }`}>
                {tour.name}
                {recommended && (
                  <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </h3>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {tour.estimatedTime}m
              </div>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {tour.description}
            </p>
            
            {progress > 0 && progress < 100 && (
              <div className="mb-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {progress}% complete
                </p>
              </div>
            )}
            
            <button
              onClick={() => onStartTour(tour.id)}
              className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCompleted
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : recommended
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              disabled={isCompleted}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Tour</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Welcome to CF1 Platform
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get started with interactive tours and tutorials
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Getting Started */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Play className="w-5 h-5 mr-2 text-blue-600" />
              Getting Started
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {welcomeTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} recommended />
              ))}
            </div>
          </div>

          {/* Feature Tours */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-green-600" />
              Feature Tours
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>

          {/* Advanced Tours */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Advanced Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advancedTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Your Progress
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {completedTours.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Tours Completed
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((completedTours.length / CF1_ONBOARDING_TOURS.length) * 100)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Progress
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {CF1_ONBOARDING_TOURS.reduce((acc, tour) => acc + tour.estimatedTime, 0)}m
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Total Time
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userPreferences.showHints}
                onChange={(e) => onUpdatePreferences({ showHints: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show contextual hints
              </span>
            </label>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => onUpdatePreferences({ skipIntros: true })}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Skip for now
            </button>
            <button
              onClick={() => onStartTour('welcome-tour')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center space-x-2"
            >
              <span>Start Welcome Tour</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};