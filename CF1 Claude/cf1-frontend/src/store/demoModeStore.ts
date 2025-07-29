import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DemoScenario = 
  | 'investor_presentation'    // Polished data for investors
  | 'user_onboarding'         // Educational demo for new users
  | 'sales_demo'              // Feature showcase for sales
  | 'development_testing'     // Development and testing
  | 'regulatory_showcase'     // Compliance demonstration
  | 'custom';                 // Custom scenario

export interface DemoModeConfig {
  // Core demo state
  isEnabled: boolean;
  scenario: DemoScenario;
  sessionId: string;
  
  // User context
  demoUserId?: string;
  demoUserRole?: 'investor' | 'creator' | 'admin' | 'platform_admin' | 'super_admin';
  
  // Data configuration
  showRealisticNumbers: boolean;
  showPositivePerformance: boolean;
  hideNegativeData: boolean;
  accelerateTimeframes: boolean;  // Show 1-year performance as 1-month, etc.
  
  // UI configuration
  showDemoIndicator: boolean;
  enableDemoTutorials: boolean;
  highlightFeatures: boolean;
  
  // Security settings
  allowedAdminUsers: string[];  // Wallet addresses that can control demo mode
  sessionTimeout: number;       // Auto-disable after X minutes
  
  // Presentation features
  autoProgressSlides: boolean;
  presentationMode: boolean;    // Hide dev tools, clean UI
  fullScreenMode: boolean;
  
  // Timestamps
  enabledAt?: string;
  lastActivity?: string;
}

export interface DemoModeState extends DemoModeConfig {
  // Actions
  enableDemoMode: (scenario: DemoScenario, config?: Partial<DemoModeConfig>) => void;
  disableDemoMode: () => void;
  forceResetDemoMode: () => void;
  switchScenario: (scenario: DemoScenario) => void;
  updateConfig: (config: Partial<DemoModeConfig>) => void;
  
  // Utility functions
  isDemoMode: () => boolean;
  isAdminUser: (address: string) => boolean;
  shouldShowRealData: () => boolean;
  getDemoDataFor: <T>(realData: T, mockData: T) => T;
  
  // Session management
  refreshSession: () => void;
  checkSessionTimeout: () => boolean;
  
  // Presentation controls
  enterPresentationMode: () => void;
  exitPresentationMode: () => void;
  
  // Store refresh
  refreshStoresForDemoModeChange: () => void;
}

// Default configuration - ALWAYS start with demo mode OFF
const defaultConfig: DemoModeConfig = {
  isEnabled: false,
  scenario: 'investor_presentation',
  sessionId: '',
  
  showRealisticNumbers: true,
  showPositivePerformance: true,
  hideNegativeData: false,
  accelerateTimeframes: false,
  
  showDemoIndicator: true,
  enableDemoTutorials: false,
  highlightFeatures: false,
  
  allowedAdminUsers: [],
  sessionTimeout: 120, // 2 hours in minutes
  
  autoProgressSlides: false,
  presentationMode: false,
  fullScreenMode: false,
};

// Predefined scenarios with optimized configurations
export const DEMO_SCENARIOS: Record<DemoScenario, Partial<DemoModeConfig>> = {
  investor_presentation: {
    showRealisticNumbers: true,
    showPositivePerformance: true,
    hideNegativeData: true,
    showDemoIndicator: false,        // Clean for presentations
    enableDemoTutorials: false,
    presentationMode: true,
    accelerateTimeframes: true,      // Show impressive growth
    demoUserRole: 'investor',
  },
  
  user_onboarding: {
    showRealisticNumbers: true,
    showPositivePerformance: true,
    hideNegativeData: false,
    showDemoIndicator: true,
    enableDemoTutorials: true,
    highlightFeatures: true,
    accelerateTimeframes: false,
    demoUserRole: 'investor',
  },
  
  sales_demo: {
    showRealisticNumbers: true,
    showPositivePerformance: true,
    hideNegativeData: true,
    showDemoIndicator: true,
    enableDemoTutorials: false,
    highlightFeatures: true,
    accelerateTimeframes: true,
    demoUserRole: 'creator',
  },
  
  development_testing: {
    showRealisticNumbers: false,     // Can use obvious test data
    showPositivePerformance: false,
    hideNegativeData: false,
    showDemoIndicator: true,
    enableDemoTutorials: false,
    highlightFeatures: false,
    accelerateTimeframes: false,
    demoUserRole: 'admin',
  },
  
  regulatory_showcase: {
    showRealisticNumbers: true,
    showPositivePerformance: false,  // Show realistic mix
    hideNegativeData: false,
    showDemoIndicator: true,
    enableDemoTutorials: false,
    highlightFeatures: false,
    accelerateTimeframes: false,
    demoUserRole: 'platform_admin',
  },
  
  custom: {
    // Will use whatever configuration is manually set
  }
};

export const useDemoModeStore = create<DemoModeState>()(
  persist(
    (set, get) => ({
      ...defaultConfig,
      
      enableDemoMode: (scenario: DemoScenario, config?: Partial<DemoModeConfig>) => {
        const scenarioConfig = DEMO_SCENARIOS[scenario];
        const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Get current state to preserve allowed users
        const currentState = get();
        
        set({
          ...defaultConfig,
          ...scenarioConfig,
          ...config,
          isEnabled: true,
          scenario,
          sessionId,
          enabledAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          // Preserve existing allowed users and ensure admin access
          allowedAdminUsers: [
            ...currentState.allowedAdminUsers,
            ...(config?.allowedAdminUsers || [])
          ].filter((addr, index, arr) => arr.indexOf(addr) === index), // Remove duplicates
        });
        
        // Log demo mode activation for analytics
        console.log(`🎭 Demo Mode Enabled - Scenario: ${scenario}, Session: ${sessionId}`);
        
        // Refresh other stores to load mock data
        get().refreshStoresForDemoModeChange();
        
        // Set up session timeout check
        const state = get();
        if (state.sessionTimeout > 0) {
          setTimeout(() => {
            const currentState = get();
            if (currentState.sessionId === sessionId && currentState.checkSessionTimeout()) {
              currentState.disableDemoMode();
            }
          }, state.sessionTimeout * 60 * 1000);
        }
      },
      
      disableDemoMode: () => {
        const prevState = get();
        set({
          ...defaultConfig,
          isEnabled: false,
          sessionId: '',
          allowedAdminUsers: [], // Reset admin users as well
        });
        
        console.log(`🎭 [DEMO MODE] Demo Mode Disabled - Previous session: ${prevState.sessionId}`);
        
        // Refresh other stores to remove mock data
        get().refreshStoresForDemoModeChange();
        
        // Clear any presentation mode settings
        if (prevState.fullScreenMode && document.fullscreenElement) {
          document.exitFullscreen().catch(console.warn);
        }
        
        // Force reload of localStorage to ensure persistence
        localStorage.removeItem('cf1-demo-mode');
        console.log(`🔧 [DEMO MODE] Cleared localStorage cf1-demo-mode`);
      },
      
      // Force reset demo mode - for debugging
      forceResetDemoMode: () => {
        localStorage.removeItem('cf1-demo-mode');
        set({
          ...defaultConfig,
          isEnabled: false,
          sessionId: '',
          allowedAdminUsers: [],
        });
        console.log(`🔧 [DEMO MODE] FORCE RESET: Demo mode completely reset to default OFF state`);
        window.location.reload(); // Force page reload to clear any cached state
      },
      
      switchScenario: (scenario: DemoScenario) => {
        const state = get();
        if (!state.isEnabled) return;
        
        const scenarioConfig = DEMO_SCENARIOS[scenario];
        set({
          ...state,
          ...scenarioConfig,
          scenario,
          lastActivity: new Date().toISOString(),
        });
        
        console.log(`🎭 Demo Scenario Changed: ${scenario}`);
      },
      
      updateConfig: (config: Partial<DemoModeConfig>) => {
        set(state => ({
          ...state,
          ...config,
          lastActivity: new Date().toISOString(),
        }));
      },
      
      // Utility functions
      isDemoMode: () => {
        const state = get();
        const enabled = state.isEnabled;
        console.log(`🔍 [DEMO MODE] isDemoMode() called - enabled: ${enabled}, scenario: ${state.scenario}, sessionId: ${state.sessionId}`);
        return enabled;
      },
      
      isAdminUser: (address: string) => {
        const { allowedAdminUsers } = get();
        return allowedAdminUsers.includes(address);
      },
      
      shouldShowRealData: () => {
        const state = get();
        return !state.isEnabled;
      },
      
      getDemoDataFor: <T>(realData: T, mockData: T): T => {
        const state = get();
        return state.isEnabled ? mockData : realData;
      },
      
      // Session management
      refreshSession: () => {
        set(state => ({
          ...state,
          lastActivity: new Date().toISOString(),
        }));
      },
      
      checkSessionTimeout: () => {
        const state = get();
        if (!state.enabledAt || state.sessionTimeout <= 0) return false;
        
        const enabledTime = new Date(state.enabledAt).getTime();
        const timeoutMs = state.sessionTimeout * 60 * 1000;
        const isExpired = Date.now() - enabledTime > timeoutMs;
        
        return isExpired;
      },
      
      // Presentation controls
      enterPresentationMode: () => {
        set(state => ({
          ...state,
          presentationMode: true,
          showDemoIndicator: false,
          lastActivity: new Date().toISOString(),
        }));
        
        // Optional: Request fullscreen
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(console.warn);
          set(state => ({ ...state, fullScreenMode: true }));
        }
      },
      
      exitPresentationMode: () => {
        set(state => ({
          ...state,
          presentationMode: false,
          fullScreenMode: false,
          showDemoIndicator: state.scenario !== 'investor_presentation',
          lastActivity: new Date().toISOString(),
        }));
        
        // Exit fullscreen if active
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(console.warn);
        }
      },
      
      refreshStoresForDemoModeChange: () => {
        // Import stores dynamically to avoid circular dependencies
        // Note: This will be called after demo mode changes
        try {
          // Use dynamic import to avoid circular dependencies
          import('./governanceStore').then(({ useGovernanceStore }) => {
            useGovernanceStore.getState().refreshDataForDemoMode();
          });
          import('./submissionStore').then(({ useSubmissionStore }) => {
            useSubmissionStore.getState().refreshDataForDemoMode();
          });
        } catch (error) {
          console.warn('Could not refresh stores for demo mode change:', error);
        }
      },
    }),
    {
      name: 'cf1-demo-mode',
      version: 1,
      // Only persist basic state, not functions
      partialize: (state) => ({
        isEnabled: state.isEnabled,
        scenario: state.scenario,
        sessionId: state.sessionId,
        demoUserId: state.demoUserId,
        demoUserRole: state.demoUserRole,
        showRealisticNumbers: state.showRealisticNumbers,
        showPositivePerformance: state.showPositivePerformance,
        hideNegativeData: state.hideNegativeData,
        accelerateTimeframes: state.accelerateTimeframes,
        showDemoIndicator: state.showDemoIndicator,
        enableDemoTutorials: state.enableDemoTutorials,
        highlightFeatures: state.highlightFeatures,
        allowedAdminUsers: state.allowedAdminUsers,
        sessionTimeout: state.sessionTimeout,
        autoProgressSlides: state.autoProgressSlides,
        presentationMode: state.presentationMode,
        fullScreenMode: state.fullScreenMode,
        enabledAt: state.enabledAt,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// Hook for easy demo mode checking in components
export const useDemoMode = () => {
  const store = useDemoModeStore();
  
  return {
    isDemoMode: store.isDemoMode(),
    scenario: store.scenario,
    config: store,
    enableDemo: store.enableDemoMode,
    disableDemo: store.disableDemoMode,
    forceReset: store.forceResetDemoMode,
    switchScenario: store.switchScenario,
    getDemoData: store.getDemoDataFor,
    refreshSession: store.refreshSession,
  };
};

// Hook for admin controls - now integrates with the actual admin system
export const useDemoModeAdmin = (userAddress?: string) => {
  const store = useDemoModeStore();
  
  // For now, return basic functionality - the component will handle admin checks
  return {
    ...useDemoMode(),
    presentationMode: store.presentationMode,
    enterPresentation: store.enterPresentationMode,
    exitPresentation: store.exitPresentationMode,
  };
};