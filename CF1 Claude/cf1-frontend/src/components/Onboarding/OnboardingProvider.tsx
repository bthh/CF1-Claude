import React, { createContext, useContext } from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingTourComponent } from './OnboardingTour';
import { UserPathController } from './UserPathController';

interface OnboardingContextType {
  startTour: (tourId: string) => void;
  showWelcome: boolean;
  isActive: boolean;
  currentTour: string | null;
  completedTours: string[];
  userPreferences: {
    skipIntros: boolean;
    autoProgress: boolean;
    showHints: boolean;
  };
  updatePreferences: (preferences: any) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const {
    startTour,
    nextStep,
    previousStep,
    completeTour,
    skipTour,
    updatePreferences,
    highlightElement,
    clearHighlight,
    scrollToElement,
    navigateToPage,
    waitForElement,
    isActive,
    currentTour,
    currentStep,
    showWelcome,
    completedTours,
    userPreferences,
    state
  } = useOnboarding();

  const handleCloseWelcome = () => {
    // Close welcome modal by updating state directly
    updatePreferences({ skipIntros: true });
  };

  const handleTourComplete = () => {
    if (currentTour) {
      // Clear any highlights before completing
      clearHighlight();
      completeTour(currentTour);
    }
  };

  const contextValue: OnboardingContextType = {
    startTour,
    showWelcome,
    isActive,
    currentTour,
    completedTours,
    userPreferences,
    updatePreferences
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
      
      {/* User Path Modal */}
      <UserPathController
        isOpen={showWelcome && !userPreferences.skipIntros}
        onClose={handleCloseWelcome}
      />
      
      {/* Tour Component */}
      <OnboardingTourComponent
        tourId={currentTour}
        currentStep={currentStep}
        isActive={isActive}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={skipTour}
        onComplete={handleTourComplete}
        onClose={skipTour}
        highlightElement={highlightElement}
        clearHighlight={clearHighlight}
        scrollToElement={scrollToElement}
        navigateToPage={navigateToPage}
        waitForElement={waitForElement}
      />
    </OnboardingContext.Provider>
  );
};