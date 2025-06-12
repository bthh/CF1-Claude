import React, { useEffect, useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  X, 
  SkipForward,
  Target,
  CheckCircle
} from 'lucide-react';
import type { OnboardingTour, OnboardingStep } from '../../hooks/useOnboarding';
import { getTourById } from '../../data/onboardingTours';

interface OnboardingTourProps {
  tourId: string | null;
  currentStep: number;
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onClose: () => void;
  highlightElement: (selector: string) => HTMLElement | null;
  clearHighlight: () => void;
  scrollToElement: (selector: string) => void;
  navigateToPage: (path: string) => void;
  waitForElement: (selector: string, timeout?: number) => Promise<HTMLElement | null>;
}

export const OnboardingTourComponent: React.FC<OnboardingTourProps> = ({
  tourId,
  currentStep,
  isActive,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  onClose,
  highlightElement,
  clearHighlight,
  scrollToElement,
  navigateToPage,
  waitForElement
}) => {
  const [tour, setTour] = useState<OnboardingTour | null>(null);
  const [currentStepData, setCurrentStepData] = useState<OnboardingStep | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (tourId) {
      const foundTour = getTourById(tourId);
      setTour(foundTour || null);
    } else {
      setTour(null);
    }
  }, [tourId]);

  useEffect(() => {
    if (tour && tour.steps[currentStep]) {
      setCurrentStepData(tour.steps[currentStep]);
    } else {
      setCurrentStepData(null);
    }
  }, [tour, currentStep]);

  const calculateTooltipPosition = useCallback((element: HTMLElement, position: string = 'bottom') => {
    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const offset = 20;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - tooltipHeight - offset;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + offset;
        break;
      case 'center':
      default:
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
        break;
    }

    // Keep tooltip within viewport
    top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));

    return { top, left };
  }, []);

  const handleStepChange = useCallback(async (step: OnboardingStep) => {
    setIsTransitioning(true);

    try {
      // Navigate to required page if specified
      if (step.page && window.location.pathname !== step.page) {
        navigateToPage(step.page);
        // Wait for navigation
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Perform action if specified
      if (step.action && step.actionTarget) {
        const actionElement = await waitForElement(step.actionTarget, 3000);
        if (actionElement) {
          switch (step.action) {
            case 'click':
              actionElement.click();
              break;
            case 'focus':
              actionElement.focus();
              break;
            case 'scroll':
              scrollToElement(step.actionTarget);
              break;
            case 'wait':
              await new Promise(resolve => setTimeout(resolve, 1000));
              break;
          }
        }
      }

      // Highlight target element
      if (step.target && step.placement !== 'modal') {
        const targetElement = await waitForElement(step.target, 3000);
        if (targetElement) {
          highlightElement(step.target);
          scrollToElement(step.target);
          
          // Calculate tooltip position
          const position = calculateTooltipPosition(targetElement, step.position);
          setTooltipPosition(position);
        } else {
          // Fallback to center if element not found
          setTooltipPosition(calculateTooltipPosition(document.body, 'center'));
        }
      } else {
        // Center modal
        clearHighlight();
        setTooltipPosition(calculateTooltipPosition(document.body, 'center'));
      }
    } catch (error) {
      console.warn('Error during step transition:', error);
      setTooltipPosition(calculateTooltipPosition(document.body, 'center'));
    }

    setIsTransitioning(false);
  }, [navigateToPage, waitForElement, highlightElement, scrollToElement, clearHighlight, calculateTooltipPosition]);

  useEffect(() => {
    if (currentStepData && isActive) {
      handleStepChange(currentStepData);
    }
  }, [currentStepData, isActive, handleStepChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClose]);

  const handleNext = () => {
    if (!tour) return;
    
    if (currentStep >= tour.steps.length - 1) {
      onComplete();
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onPrevious();
    }
  };

  const getProgressPercentage = () => {
    if (!tour) return 0;
    return ((currentStep + 1) / tour.steps.length) * 100;
  };

  if (!isActive || !tour || !currentStepData) {
    return null;
  }

  const isModal = currentStepData.placement === 'modal';
  const isLastStep = currentStep >= tour.steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300" />
      
      {/* Tooltip/Modal */}
      <div
        className={`fixed z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isTransitioning ? 'opacity-50' : 'opacity-100'
        }`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          maxHeight: '400px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {tour.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {tour.steps.length}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {currentStepData.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="flex items-center space-x-2">
            <button
              onClick={onSkip}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center space-x-1"
            >
              <SkipForward className="w-3 h-3" />
              <span>Skip tour</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete</span>
                </>
              ) : (
                <>
                  <span>{currentStepData.nextButtonText || 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};