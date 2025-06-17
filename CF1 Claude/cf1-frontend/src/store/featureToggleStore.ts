import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FeatureToggle {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'trading' | 'defi' | 'governance' | 'launchpad' | 'general';
  requiredRole?: 'super_admin' | 'platform_admin';
  lastModified: string;
  modifiedBy?: string;
}

interface FeatureToggleState {
  features: Record<string, FeatureToggle>;
  isFeatureEnabled: (featureId: string) => boolean;
  updateFeatureToggle: (featureId: string, enabled: boolean, modifiedBy: string) => void;
  loadFeatureToggles: () => void;
  resetToDefaults: () => void;
}

// Default feature toggles
const defaultFeatures: Record<string, FeatureToggle> = {
  'lending': {
    id: 'lending',
    name: 'Lending & Borrowing',
    description: 'Enable lending and borrowing functionality',
    enabled: false,
    category: 'defi',
    requiredRole: 'platform_admin',
    lastModified: new Date().toISOString()
  },
  'staking': {
    id: 'staking',
    name: 'Staking',
    description: 'Enable staking pools and rewards',
    enabled: false,
    category: 'defi',
    requiredRole: 'platform_admin',
    lastModified: new Date().toISOString()
  },
  'liquidity_pools': {
    id: 'liquidity_pools',
    name: 'Liquidity Pools',
    description: 'Enable AMM liquidity pools',
    enabled: false,
    category: 'defi',
    requiredRole: 'platform_admin',
    lastModified: new Date().toISOString()
  },
  'secondary_trading': {
    id: 'secondary_trading',
    name: 'Secondary Trading',
    description: 'Enable secondary market trading',
    enabled: true,
    category: 'trading',
    requiredRole: 'platform_admin',
    lastModified: new Date().toISOString()
  },
  'governance': {
    id: 'governance',
    name: 'Governance',
    description: 'Enable governance proposals and voting',
    enabled: true,
    category: 'governance',
    requiredRole: 'super_admin',
    lastModified: new Date().toISOString()
  },
  'launchpad': {
    id: 'launchpad',
    name: 'Launchpad',
    description: 'Enable new project launches',
    enabled: true,
    category: 'launchpad',
    requiredRole: 'super_admin',
    lastModified: new Date().toISOString()
  },
  'kyc_required': {
    id: 'kyc_required',
    name: 'KYC Required',
    description: 'Require KYC verification for all investments',
    enabled: true,
    category: 'general',
    requiredRole: 'super_admin',
    lastModified: new Date().toISOString()
  },
  'maintenance_mode': {
    id: 'maintenance_mode',
    name: 'Maintenance Mode',
    description: 'Enable maintenance mode (read-only access)',
    enabled: false,
    category: 'general',
    requiredRole: 'super_admin',
    lastModified: new Date().toISOString()
  }
};

export const useFeatureToggleStore = create<FeatureToggleState>()(
  persist(
    (set, get) => ({
      features: defaultFeatures,

      isFeatureEnabled: (featureId: string) => {
        const feature = get().features[featureId];
        return feature?.enabled ?? false;
      },

      updateFeatureToggle: (featureId: string, enabled: boolean, modifiedBy: string) => {
        set((state) => ({
          features: {
            ...state.features,
            [featureId]: {
              ...state.features[featureId],
              enabled,
              lastModified: new Date().toISOString(),
              modifiedBy
            }
          }
        }));
      },

      loadFeatureToggles: () => {
        // In a real app, this would load from backend
        // For now, it ensures defaults are set
        const currentFeatures = get().features;
        const mergedFeatures = { ...defaultFeatures };
        
        // Preserve any existing enabled states
        Object.keys(currentFeatures).forEach(key => {
          if (mergedFeatures[key]) {
            mergedFeatures[key].enabled = currentFeatures[key].enabled;
            mergedFeatures[key].lastModified = currentFeatures[key].lastModified;
            mergedFeatures[key].modifiedBy = currentFeatures[key].modifiedBy;
          }
        });

        set({ features: mergedFeatures });
      },

      resetToDefaults: () => {
        set({ features: defaultFeatures });
      }
    }),
    {
      name: 'cf1-feature-toggles',
      version: 1
    }
  )
);