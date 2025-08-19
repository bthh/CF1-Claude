import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DataMode = 'production' | 'development' | 'demo';

export interface DataModeConfig {
  currentMode: DataMode;
  defaultMode: DataMode; // Can be set by super admin
  enabledBy?: string; // Who enabled the current mode
  enabledAt?: string; // When it was enabled
}

export interface DataModeState extends DataModeConfig {
  // Actions
  setDataMode: (mode: DataMode, enabledBy?: string) => void;
  setDefaultMode: (mode: DataMode) => void; // Super admin only
  resetToDefault: () => void;
  
  // Utility functions
  isProduction: () => boolean;
  isDevelopment: () => boolean;
  isDemo: () => boolean;
  getDataMode: () => DataMode;
}

// Default configuration (set to demo for immediate functionality)
const defaultConfig: DataModeConfig = {
  currentMode: 'demo', // Start in demo mode for immediate functionality
  defaultMode: 'demo', // Default can be changed by super admin
};

export const useDataModeStore = create<DataModeState>()(
  persist(
    (set, get) => ({
      ...defaultConfig,
      
      setDataMode: (mode: DataMode, enabledBy?: string) => {
        set({
          currentMode: mode,
          enabledBy,
          enabledAt: new Date().toISOString(),
        });
        console.log(`🔄 Data Mode changed to: ${mode.toUpperCase()}${enabledBy ? ` by ${enabledBy}` : ''}`);
      },
      
      setDefaultMode: (mode: DataMode) => {
        set({ defaultMode: mode });
        console.log(`🔧 Default Data Mode set to: ${mode.toUpperCase()}`);
      },
      
      resetToDefault: () => {
        const { defaultMode } = get();
        set({
          currentMode: defaultMode,
          enabledBy: 'system',
          enabledAt: new Date().toISOString(),
        });
        console.log(`🔄 Data Mode reset to default: ${defaultMode.toUpperCase()}`);
      },
      
      // Utility functions
      isProduction: () => get().currentMode === 'production',
      isDevelopment: () => get().currentMode === 'development',
      isDemo: () => get().currentMode === 'demo',
      getDataMode: () => get().currentMode,
    }),
    {
      name: 'cf1-data-mode',
      version: 1,
    }
  )
);

// Hook for easy access
export const useDataMode = () => {
  const store = useDataModeStore();
  
  return {
    currentMode: store.currentMode,
    defaultMode: store.defaultMode,
    isProduction: store.isProduction(),
    isDevelopment: store.isDevelopment(),
    isDemo: store.isDemo(),
    setMode: store.setDataMode,
    setDefault: store.setDefaultMode,
    resetToDefault: store.resetToDefault,
  };
};