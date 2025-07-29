import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlatformConfig {
  // APY Limits
  maxAllowedAPY: number; // Maximum allowed Expected APY percentage
  
  // Trading Mode
  tradingMode: 'primary' | 'secondary'; // Primary = new token sales, Secondary = peer-to-peer trading
  
  // Future platform-wide settings can be added here
  // Example: maxProposalAmount, minInvestmentAmount, etc.
}

interface PlatformConfigState {
  config: PlatformConfig;
  
  // Actions
  updateMaxAPY: (maxAPY: number) => void;
  getMaxAPY: () => number;
  validateAPY: (apy: number) => { isValid: boolean; error?: string };
  updateTradingMode: (mode: 'primary' | 'secondary') => void;
  getTradingMode: () => 'primary' | 'secondary';
  updateConfig: (newConfig: Partial<PlatformConfig>) => void;
  resetToDefaults: () => void;
}

// Default platform configuration
const defaultConfig: PlatformConfig = {
  maxAllowedAPY: 50.0, // Default maximum of 50% APY
  tradingMode: 'secondary' // Default to secondary trading (peer-to-peer)
};

export const usePlatformConfigStore = create<PlatformConfigState>()(
  persist(
    (set, get) => ({
      config: defaultConfig,

      updateMaxAPY: (maxAPY) => {
        if (maxAPY < 0) {
          console.error('APY cannot be negative');
          return;
        }
        
        set((state) => ({
          config: {
            ...state.config,
            maxAllowedAPY: maxAPY
          }
        }));
      },

      getMaxAPY: () => {
        return get().config.maxAllowedAPY;
      },

      validateAPY: (apy) => {
        const maxAPY = get().config.maxAllowedAPY;
        
        if (apy > maxAPY) {
          return {
            isValid: false,
            error: `The Expected APY of ${apy}% exceeds the platform maximum of ${maxAPY}%. Please provide a more realistic projection or upload documentation to justify it.`
          };
        }
        
        if (apy < 0) {
          return {
            isValid: false,
            error: 'Expected APY cannot be negative.'
          };
        }
        
        return { isValid: true };
      },

      updateTradingMode: (mode) => {
        set((state) => ({
          config: {
            ...state.config,
            tradingMode: mode
          }
        }));
      },

      getTradingMode: () => {
        return get().config.tradingMode;
      },

      updateConfig: (newConfig) => {
        set((state) => ({
          config: {
            ...state.config,
            ...newConfig
          }
        }));
      },

      resetToDefaults: () => {
        set({ config: defaultConfig });
      }
    }),
    {
      name: 'cf1-platform-config',
      partialize: (state) => ({
        config: state.config
      })
    }
  )
);