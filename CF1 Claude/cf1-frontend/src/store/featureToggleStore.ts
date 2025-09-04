import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FeatureToggle {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'trading' | 'governance' | 'launchpad' | 'general' | 'dashboard' | 'portfolio';
  requiredRole?: 'super_admin' | 'platform_admin';
  lastModified: string;
  modifiedBy?: string;
}

interface FeatureToggleState {
  features: Record<string, FeatureToggle>;
  isFeatureEnabled: (featureId: string) => boolean;
  updateFeatureToggle: (featureId: string, enabled: boolean, modifiedBy: string) => Promise<void>;
  loadFeatureToggles: () => Promise<void>;
  resetToDefaults: () => void;
}

// Default feature toggles
const defaultFeatures: Record<string, FeatureToggle> = {
  'marketplace': {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Enable marketplace tab and asset browsing',
    enabled: false,
    category: 'general',
    requiredRole: 'platform_admin',
    lastModified: new Date().toISOString()
  },
  'analytics': {
    id: 'analytics',
    name: 'Analytics',
    description: 'Enable analytics dashboard and reports',
    enabled: false,
    category: 'general',
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
  },
  'dashboard_v2': {
    id: 'dashboard_v2',
    name: 'Dashboard V2',
    description: 'Enable new role-based dashboard variants',
    enabled: true,
    category: 'general',
    requiredRole: 'platform_admin',
    lastModified: new Date().toISOString()
  },
  'dashboard_platform_highlights': {
    id: 'dashboard_platform_highlights',
    name: 'Platform Highlights',
    description: 'Show platform highlights section on dashboard',
    enabled: true,
    category: 'dashboard',
    requiredRole: 'platform_admin',
    lastModified: new Date().toISOString()
  },
  'dashboard_featured_opportunities': {
    id: 'dashboard_featured_opportunities',
    name: 'Featured Investment Opportunities',
    description: 'Show featured investment opportunities section on dashboard',
    enabled: true,
    category: 'dashboard',
    requiredRole: 'platform_admin',
    lastModified: new Date().toISOString()
  },
  'portfolio_performance': {
    id: 'portfolio_performance',
    name: 'Portfolio Performance Tab',
    description: 'Show performance analytics tab in portfolio sections',
    enabled: true,
    category: 'portfolio',
    requiredRole: 'platform_admin',
    lastModified: new Date().toISOString()
  },
  'creator_ai_assistant': {
    id: 'creator_ai_assistant',
    name: 'Creator AI Assistant',
    description: 'Enable AI Assistant tab in creator admin page',
    enabled: true,
    category: 'general',
    requiredRole: 'platform_admin',
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

      updateFeatureToggle: async (featureId: string, enabled: boolean, modifiedBy: string) => {
        try {
          const response = await fetch(`/feature-toggles/${featureId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for CSRF token
            body: JSON.stringify({ enabled, modifiedBy })
          });

          if (response.ok) {
            const data = await response.json();
            // Update the local state with the response from backend
            set((state) => ({
              features: {
                ...state.features,
                [featureId]: data.feature
              }
            }));
          } else {
            console.error('Failed to update feature toggle on backend');
            // Still update locally as fallback
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
          }
        } catch (error) {
          console.error('Error updating feature toggle:', error);
          // Fall back to local update on error
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
        }
      },

      loadFeatureToggles: async () => {
        try {
          const response = await fetch('/feature-toggles');
          if (response.ok) {
            const data = await response.json();
            set({ features: data.features });
          } else {
            console.warn('Failed to load feature toggles from backend, using defaults');
            // Fall back to local defaults if backend is unavailable
            const currentFeatures = get().features;
            const mergedFeatures = { ...defaultFeatures };
            
            // Preserve any existing enabled states, but ensure all new defaults are included
            Object.keys(currentFeatures).forEach(key => {
              if (mergedFeatures[key]) {
                mergedFeatures[key].enabled = currentFeatures[key].enabled;
                mergedFeatures[key].lastModified = currentFeatures[key].lastModified;
                mergedFeatures[key].modifiedBy = currentFeatures[key].modifiedBy;
              }
            });
            
            // Ensure any new features from defaults that aren't in current features get added
            Object.keys(defaultFeatures).forEach(key => {
              if (!currentFeatures[key]) {
                mergedFeatures[key] = { ...defaultFeatures[key] };
              }
            });

            set({ features: mergedFeatures });
          }
        } catch (error) {
          console.error('Error loading feature toggles:', error);
          // Fall back to defaults on error
          set({ features: defaultFeatures });
        }
      },

      resetToDefaults: () => {
        set({ features: defaultFeatures });
      }
    }),
    {
      name: 'cf1-feature-toggles',
      version: 4,
      migrate: (persistedState: any, version: number) => {
        // Always merge with latest default features to ensure new features are included
        const mergedFeatures = { ...defaultFeatures };
        
        if (persistedState?.features) {
          // Preserve existing enabled states and modifications
          Object.keys(persistedState.features).forEach((key: string) => {
            if (mergedFeatures[key]) {
              mergedFeatures[key].enabled = persistedState.features[key].enabled;
              mergedFeatures[key].lastModified = persistedState.features[key].lastModified;
              mergedFeatures[key].modifiedBy = persistedState.features[key].modifiedBy;
            }
          });
        }
        
        return {
          ...persistedState,
          features: mergedFeatures
        };
      }
    }
  )
);