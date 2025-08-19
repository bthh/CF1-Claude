import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SessionRole } from './sessionStore';

// Enhanced widget types with role-specific widgets
export type EnhancedWidgetType = 
  // Common widgets
  | 'marketplace' | 'launchpad' | 'governance' | 'portfolio' | 'analytics' | 'activity' 
  | 'quickActions' | 'notifications' | 'profile' | 'spotlight'
  // Role-specific widgets
  | 'creatorAnalytics' | 'creatorAssets' | 'creatorShareholders' | 'creatorCommunications'
  | 'investorRecommendations' | 'investorPerformance' | 'investorWatchlist'
  | 'adminFeatureToggles' | 'adminUserManagement' | 'adminSystemHealth' | 'adminAuditLog'
  | 'ownerPlatformMetrics' | 'ownerFinancials' | 'ownerStrategicInsights';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';
export type WidgetLayout = 'grid' | 'list' | 'cards';

export interface EnhancedDashboardWidget {
  id: string;
  type: EnhancedWidgetType;
  size: WidgetSize;
  position: number;
  isVisible: boolean;
  allowedRoles: SessionRole[];
  settings?: Record<string, any>;
  dataFilters?: Record<string, any>;
  refreshInterval?: number; // in seconds
  lastUpdated?: string;
}

export interface DashboardTheme {
  id: string;
  name: string;
  colorScheme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  layout: WidgetLayout;
}

export interface RoleBasedMetrics {
  investor: {
    portfolioValue: number;
    totalReturns: number;
    avgAPY: number;
    assetsCount: number;
    recentActivity: Array<{
      id: string;
      type: 'investment' | 'dividend' | 'trade';
      description: string;
      timestamp: string;
      amount?: number;
    }>;
  };
  creator: {
    totalAssets: number;
    totalRaised: number;
    totalShareholders: number;
    avgFundingTime: number;
    assetSnapshots: Array<{
      id: string;
      name: string;
      status: 'active' | 'funded' | 'closed';
      raisedAmount: number;
      targetAmount: number;
      shareholderCount: number;
      performance: number;
    }>;
    recentActivity: Array<{
      id: string;
      type: 'funding' | 'communication' | 'shareholder_update';
      description: string;
      timestamp: string;
      assetId?: string;
    }>;
  };
  admin: {
    totalUsers: number;
    totalAssets: number;
    totalVolume: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    recentActions: Array<{
      id: string;
      type: 'user_action' | 'system_event' | 'security_event';
      description: string;
      timestamp: string;
      severity: 'info' | 'warning' | 'error';
    }>;
  };
}

export interface EnhancedDashboardState {
  // Widget Management
  widgets: Record<SessionRole, EnhancedDashboardWidget[]>;
  globalWidgets: EnhancedDashboardWidget[];
  gridCols: number;
  layout: WidgetLayout;
  theme: DashboardTheme;
  isEditMode: boolean;
  
  // Data Management
  metrics: Partial<RoleBasedMetrics>;
  isLoading: boolean;
  lastRefresh: string | null;
  refreshInterval: number; // in seconds
  
  // Real-time Updates
  subscribedEvents: string[];
  realTimeEnabled: boolean;
  
  // Actions - Widget Management
  toggleEditMode: () => void;
  addWidget: (role: SessionRole, type: EnhancedWidgetType, size?: WidgetSize) => void;
  removeWidget: (role: SessionRole, id: string) => void;
  toggleWidgetVisibility: (role: SessionRole, id: string) => void;
  resizeWidget: (role: SessionRole, id: string, size: WidgetSize) => void;
  reorderWidgets: (role: SessionRole, startIndex: number, endIndex: number) => void;
  updateWidgetSettings: (role: SessionRole, id: string, settings: Record<string, any>) => void;
  
  // Actions - Data Management
  refreshMetrics: (role: SessionRole) => Promise<void>;
  updateMetrics: (role: SessionRole, metrics: Partial<RoleBasedMetrics[SessionRole]>) => void;
  setRefreshInterval: (interval: number) => void;
  
  // Actions - Theme & Layout
  setTheme: (theme: DashboardTheme) => void;
  setLayout: (layout: WidgetLayout) => void;
  setGridCols: (cols: number) => void;
  
  // Actions - Real-time
  subscribeToEvents: (events: string[]) => void;
  unsubscribeFromEvents: (events: string[]) => void;
  toggleRealTime: () => void;
  
  // Actions - Reset
  resetToDefaults: (role: SessionRole) => void;
  resetAllRoles: () => void;
}

// Default widget configurations for each role
const getDefaultWidgetsForRole = (role: SessionRole): EnhancedDashboardWidget[] => {
  const baseWidgets: EnhancedDashboardWidget[] = [
    {
      id: 'quick-actions-1',
      type: 'quickActions',
      size: 'medium',
      position: 0,
      isVisible: true,
      allowedRoles: ['investor', 'creator', 'super_admin', 'owner'],
      refreshInterval: 0
    },
    {
      id: 'notifications-1',
      type: 'notifications',
      size: 'small',
      position: 1,
      isVisible: true,
      allowedRoles: ['investor', 'creator', 'super_admin', 'owner'],
      refreshInterval: 30
    }
  ];

  switch (role) {
    case 'investor':
      return [
        ...baseWidgets,
        {
          id: 'portfolio-1',
          type: 'portfolio',
          size: 'large',
          position: 2,
          isVisible: true,
          allowedRoles: ['investor'],
          refreshInterval: 60
        },
        {
          id: 'investor-performance-1',
          type: 'investorPerformance',
          size: 'medium',
          position: 3,
          isVisible: true,
          allowedRoles: ['investor'],
          refreshInterval: 300
        },
        {
          id: 'marketplace-1',
          type: 'marketplace',
          size: 'medium',
          position: 4,
          isVisible: true,
          allowedRoles: ['investor'],
          refreshInterval: 120
        },
        {
          id: 'investor-recommendations-1',
          type: 'investorRecommendations',
          size: 'medium',
          position: 5,
          isVisible: true,
          allowedRoles: ['investor'],
          refreshInterval: 600
        }
      ];
      
    case 'creator':
      return [
        ...baseWidgets,
        {
          id: 'creator-assets-1',
          type: 'creatorAssets',
          size: 'large',
          position: 2,
          isVisible: true,
          allowedRoles: ['creator'],
          refreshInterval: 60
        },
        {
          id: 'creator-analytics-1',
          type: 'creatorAnalytics',
          size: 'medium',
          position: 3,
          isVisible: true,
          allowedRoles: ['creator'],
          refreshInterval: 300
        },
        {
          id: 'creator-shareholders-1',
          type: 'creatorShareholders',
          size: 'medium',
          position: 4,
          isVisible: true,
          allowedRoles: ['creator'],
          refreshInterval: 600
        },
        {
          id: 'launchpad-1',
          type: 'launchpad',
          size: 'medium',
          position: 5,
          isVisible: true,
          allowedRoles: ['creator'],
          refreshInterval: 120
        }
      ];
      
    case 'super_admin':
      return [
        ...baseWidgets,
        {
          id: 'admin-system-health-1',
          type: 'adminSystemHealth',
          size: 'large',
          position: 2,
          isVisible: true,
          allowedRoles: ['super_admin', 'owner'],
          refreshInterval: 30
        },
        {
          id: 'admin-user-management-1',
          type: 'adminUserManagement',
          size: 'medium',
          position: 3,
          isVisible: true,
          allowedRoles: ['super_admin', 'owner'],
          refreshInterval: 300
        },
        {
          id: 'admin-feature-toggles-1',
          type: 'adminFeatureToggles',
          size: 'medium',
          position: 4,
          isVisible: true,
          allowedRoles: ['super_admin', 'owner'],
          refreshInterval: 0 // Manual refresh only
        },
        {
          id: 'analytics-1',
          type: 'analytics',
          size: 'medium',
          position: 5,
          isVisible: true,
          allowedRoles: ['super_admin', 'owner'],
          refreshInterval: 300
        }
      ];
      
    case 'owner':
      return [
        ...baseWidgets,
        {
          id: 'owner-platform-metrics-1',
          type: 'ownerPlatformMetrics',
          size: 'large',
          position: 2,
          isVisible: true,
          allowedRoles: ['owner'],
          refreshInterval: 60
        },
        {
          id: 'owner-financials-1',
          type: 'ownerFinancials',
          size: 'medium',
          position: 3,
          isVisible: true,
          allowedRoles: ['owner'],
          refreshInterval: 300
        },
        {
          id: 'owner-strategic-insights-1',
          type: 'ownerStrategicInsights',
          size: 'medium',
          position: 4,
          isVisible: true,
          allowedRoles: ['owner'],
          refreshInterval: 600
        },
        {
          id: 'admin-audit-log-1',
          type: 'adminAuditLog',
          size: 'medium',
          position: 5,
          isVisible: true,
          allowedRoles: ['owner'],
          refreshInterval: 60
        }
      ];
      
    default:
      return baseWidgets;
  }
};

// Default theme
const defaultTheme: DashboardTheme = {
  id: 'default',
  name: 'CF1 Default',
  colorScheme: 'auto',
  primaryColor: '#3B82F6',
  layout: 'grid'
};

export const useEnhancedDashboardStore = create<EnhancedDashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      widgets: {
        investor: getDefaultWidgetsForRole('investor'),
        creator: getDefaultWidgetsForRole('creator'),
        super_admin: getDefaultWidgetsForRole('super_admin'),
        owner: getDefaultWidgetsForRole('owner')
      },
      globalWidgets: [],
      gridCols: 4,
      layout: 'grid',
      theme: defaultTheme,
      isEditMode: false,
      
      metrics: {},
      isLoading: false,
      lastRefresh: null,
      refreshInterval: 300, // 5 minutes default
      
      subscribedEvents: [],
      realTimeEnabled: true,

      // Widget Management Actions
      toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode })),

      addWidget: (role: SessionRole, type: EnhancedWidgetType, size: WidgetSize = 'medium') => {
        const id = `${type}-${Date.now()}`;
        const widgets = get().widgets;
        const roleWidgets = widgets[role] || [];
        
        const newWidget: EnhancedDashboardWidget = {
          id,
          type,
          size,
          position: roleWidgets.length,
          isVisible: true,
          allowedRoles: [role],
          refreshInterval: 300
        };
        
        set({
          widgets: {
            ...widgets,
            [role]: [...roleWidgets, newWidget]
          }
        });
      },

      removeWidget: (role: SessionRole, id: string) => {
        const widgets = get().widgets;
        set({
          widgets: {
            ...widgets,
            [role]: widgets[role]?.filter(w => w.id !== id) || []
          }
        });
      },

      toggleWidgetVisibility: (role: SessionRole, id: string) => {
        const widgets = get().widgets;
        set({
          widgets: {
            ...widgets,
            [role]: widgets[role]?.map(w => 
              w.id === id ? { ...w, isVisible: !w.isVisible } : w
            ) || []
          }
        });
      },

      resizeWidget: (role: SessionRole, id: string, size: WidgetSize) => {
        const widgets = get().widgets;
        set({
          widgets: {
            ...widgets,
            [role]: widgets[role]?.map(w => 
              w.id === id ? { ...w, size } : w
            ) || []
          }
        });
      },

      reorderWidgets: (role: SessionRole, startIndex: number, endIndex: number) => {
        const widgets = get().widgets;
        const roleWidgets = [...(widgets[role] || [])];
        const [removed] = roleWidgets.splice(startIndex, 1);
        roleWidgets.splice(endIndex, 0, removed);
        
        // Update positions
        const updatedWidgets = roleWidgets.map((w, index) => ({
          ...w,
          position: index
        }));
        
        set({
          widgets: {
            ...widgets,
            [role]: updatedWidgets
          }
        });
      },

      updateWidgetSettings: (role: SessionRole, id: string, settings: Record<string, any>) => {
        const widgets = get().widgets;
        set({
          widgets: {
            ...widgets,
            [role]: widgets[role]?.map(w => 
              w.id === id ? { ...w, settings: { ...w.settings, ...settings } } : w
            ) || []
          }
        });
      },

      // Data Management Actions
      refreshMetrics: async (role: SessionRole) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call - in real app, would fetch from backend
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock data based on role
          let mockMetrics: Partial<RoleBasedMetrics> = {};
          
          switch (role) {
            case 'investor':
              mockMetrics.investor = {
                portfolioValue: Math.floor(Math.random() * 500000 + 100000),
                totalReturns: Math.floor(Math.random() * 50000 + 10000),
                avgAPY: Math.random() * 15 + 5,
                assetsCount: Math.floor(Math.random() * 10 + 3),
                recentActivity: []
              };
              break;
              
            case 'creator':
              mockMetrics.creator = {
                totalAssets: Math.floor(Math.random() * 20 + 5),
                totalRaised: Math.floor(Math.random() * 2000000 + 500000),
                totalShareholders: Math.floor(Math.random() * 500 + 100),
                avgFundingTime: Math.floor(Math.random() * 30 + 10),
                assetSnapshots: [],
                recentActivity: []
              };
              break;
              
            case 'super_admin':
            case 'owner':
              mockMetrics.admin = {
                totalUsers: Math.floor(Math.random() * 10000 + 1000),
                totalAssets: Math.floor(Math.random() * 1000 + 200),
                totalVolume: Math.floor(Math.random() * 100000000 + 10000000),
                systemHealth: 'excellent',
                recentActions: []
              };
              break;
          }
          
          set(state => ({
            metrics: { ...state.metrics, ...mockMetrics },
            isLoading: false,
            lastRefresh: new Date().toISOString()
          }));
          
        } catch (error) {
          console.error('Failed to refresh metrics:', error);
          set({ isLoading: false });
        }
      },

      updateMetrics: (role: SessionRole, metrics: any) => {
        set(state => ({
          metrics: {
            ...state.metrics,
            [role]: { ...state.metrics[role as keyof RoleBasedMetrics], ...metrics }
          }
        }));
      },

      setRefreshInterval: (interval: number) => set({ refreshInterval: interval }),

      // Theme & Layout Actions
      setTheme: (theme: DashboardTheme) => set({ theme }),
      setLayout: (layout: WidgetLayout) => set({ layout }),
      setGridCols: (cols: number) => set({ gridCols: cols }),

      // Real-time Actions
      subscribeToEvents: (events: string[]) => {
        set(state => ({
          subscribedEvents: [...new Set([...state.subscribedEvents, ...events])]
        }));
      },

      unsubscribeFromEvents: (events: string[]) => {
        set(state => ({
          subscribedEvents: state.subscribedEvents.filter(e => !events.includes(e))
        }));
      },

      toggleRealTime: () => set(state => ({ realTimeEnabled: !state.realTimeEnabled })),

      // Reset Actions
      resetToDefaults: (role: SessionRole) => {
        const widgets = get().widgets;
        set({
          widgets: {
            ...widgets,
            [role]: getDefaultWidgetsForRole(role)
          },
          isEditMode: false
        });
      },

      resetAllRoles: () => {
        set({
          widgets: {
            investor: getDefaultWidgetsForRole('investor'),
            creator: getDefaultWidgetsForRole('creator'),
            super_admin: getDefaultWidgetsForRole('super_admin'),
            owner: getDefaultWidgetsForRole('owner')
          },
          globalWidgets: [],
          isEditMode: false,
          metrics: {},
          lastRefresh: null
        });
      }
    }),
    {
      name: 'cf1-enhanced-dashboard',
      version: 2,
      // Only persist configuration, not live data
      partialize: (state) => ({
        widgets: state.widgets,
        globalWidgets: state.globalWidgets,
        gridCols: state.gridCols,
        layout: state.layout,
        theme: state.theme,
        refreshInterval: state.refreshInterval,
        subscribedEvents: state.subscribedEvents,
        realTimeEnabled: state.realTimeEnabled
      })
    }
  )
);