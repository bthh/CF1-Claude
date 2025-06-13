import { useState, useEffect, useCallback, useRef } from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'focus' | 'scroll' | 'wait';
  actionTarget?: string;
  nextButtonText?: string;
  skipAble?: boolean;
  placement?: 'modal' | 'tooltip' | 'spotlight';
  page?: string; // Required page/route for this step
}

export interface OnboardingTour {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  category: 'welcome' | 'feature' | 'advanced';
  estimatedTime: number; // in minutes
  icon?: string;
}

interface OnboardingState {
  currentTour: string | null;
  currentStep: number;
  completedTours: string[];
  completedSteps: string[];
  isActive: boolean;
  showWelcome: boolean;
  userPreferences: {
    skipIntros: boolean;
    autoProgress: boolean;
    showHints: boolean;
  };
}

interface UseOnboardingOptions {
  autoStart?: boolean;
  persistProgress?: boolean;
  storageKey?: string;
}

export const useOnboarding = (options: UseOnboardingOptions = {}) => {
  const {
    autoStart = true,
    persistProgress = true,
    storageKey = 'cf1_onboarding'
  } = options;

  const [state, setState] = useState<OnboardingState>(() => {
    if (persistProgress && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.warn('Failed to load onboarding state:', error);
      }
    }

    return {
      currentTour: null,
      currentStep: 0,
      completedTours: [],
      completedSteps: [],
      isActive: false,
      showWelcome: true,
      userPreferences: {
        skipIntros: false,
        autoProgress: false,
        showHints: true
      }
    };
  });

  const highlightRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Save state to localStorage
  useEffect(() => {
    if (persistProgress) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save onboarding state:', error);
      }
    }
  }, [state, persistProgress, storageKey]);

  // Auto-start onboarding for new users
  useEffect(() => {
    if (autoStart && state.showWelcome && state.completedTours.length === 0) {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, showWelcome: true }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, state.showWelcome, state.completedTours.length]);

  const startTour = useCallback((tourId: string) => {
    setState(prev => ({
      ...prev,
      currentTour: tourId,
      currentStep: 0,
      isActive: true,
      showWelcome: false
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, stepId])]
    }));
  }, []);

  const completeTour = useCallback((tourId: string) => {
    setState(prev => ({
      ...prev,
      completedTours: [...new Set([...prev.completedTours, tourId])],
      currentTour: null,
      currentStep: 0,
      isActive: false
    }));
  }, []);

  const skipTour = useCallback(() => {
    if (state.currentTour) {
      completeTour(state.currentTour);
    }
  }, [state.currentTour, completeTour]);

  const resetOnboarding = useCallback(() => {
    setState({
      currentTour: null,
      currentStep: 0,
      completedTours: [],
      completedSteps: [],
      isActive: false,
      showWelcome: true,
      userPreferences: {
        skipIntros: false,
        autoProgress: false,
        showHints: true
      }
    });
  }, []);

  const updatePreferences = useCallback((preferences: Partial<OnboardingState['userPreferences']>) => {
    setState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...preferences }
    }));
  }, []);

  const isStepCompleted = useCallback((stepId: string) => {
    return state.completedSteps.includes(stepId);
  }, [state.completedSteps]);

  const isTourCompleted = useCallback((tourId: string) => {
    return state.completedTours.includes(tourId);
  }, [state.completedTours]);

  const getTourProgress = useCallback((tour: OnboardingTour) => {
    const completedStepsInTour = tour.steps.filter(step => 
      state.completedSteps.includes(step.id)
    ).length;
    return (completedStepsInTour / tour.steps.length) * 100;
  }, [state.completedSteps]);

  // Spotlight/highlight functionality without overlay
  const highlightElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return null;

    // Remove previous highlight
    if (highlightRef.current) {
      highlightRef.current.classList.remove('onboarding-highlight');
      highlightRef.current.style.zIndex = '';
    }

    // Add highlight to new element with stronger visual highlight
    element.classList.add('onboarding-highlight');
    element.style.zIndex = '1001';
    element.style.position = 'relative';
    highlightRef.current = element;

    // No overlay - just element highlighting for cleaner UI
    return element;
  }, []);

  const clearHighlight = useCallback(() => {
    try {
      if (highlightRef.current) {
        highlightRef.current.classList.remove('onboarding-highlight');
        highlightRef.current.style.zIndex = '';
        highlightRef.current.style.position = '';
        highlightRef.current = null;
      }

      // Remove any existing overlays (cleanup from old instances)
      if (overlayRef.current && overlayRef.current.parentNode) {
        overlayRef.current.parentNode.removeChild(overlayRef.current);
        overlayRef.current = null;
      }

      // Cleanup any stray onboarding overlays
      const existingOverlays = document.querySelectorAll('.onboarding-overlay');
      existingOverlays.forEach(overlay => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      });
    } catch (error) {
      console.warn('Error clearing highlight:', error);
      // Force reset refs even if removal failed
      highlightRef.current = null;
      overlayRef.current = null;
    }
  }, []);

  const scrollToElement = useCallback((selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, []);

  // Navigation helpers
  const navigateToPage = useCallback((path: string) => {
    window.location.href = path;
  }, []);

  const waitForElement = useCallback((selector: string, timeout = 5000): Promise<HTMLElement | null> => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }, []);

  // Clear highlights when tour becomes inactive
  useEffect(() => {
    if (!state.isActive) {
      clearHighlight();
    }
  }, [state.isActive, clearHighlight]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHighlight();
    };
  }, [clearHighlight]);

  return {
    state,
    startTour,
    nextStep,
    previousStep,
    completeStep,
    completeTour,
    skipTour,
    resetOnboarding,
    updatePreferences,
    isStepCompleted,
    isTourCompleted,
    getTourProgress,
    highlightElement,
    clearHighlight,
    scrollToElement,
    navigateToPage,
    waitForElement,
    
    // Convenience getters
    isActive: state.isActive,
    currentTour: state.currentTour,
    currentStep: state.currentStep,
    showWelcome: state.showWelcome,
    completedTours: state.completedTours,
    userPreferences: state.userPreferences
  };
};