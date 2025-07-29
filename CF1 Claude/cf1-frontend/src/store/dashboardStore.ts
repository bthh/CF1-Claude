import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType = 'marketplace' | 'launchpad' | 'governance' | 'portfolio' | 'analytics' | 'activity' | 'quickActions' | 'notifications' | 'profile' | 'spotlight';
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  position: number;
  isVisible: boolean;
}

interface DashboardState {
  widgets: DashboardWidget[];
  gridCols: number;
  isEditMode: boolean;
  
  // Actions
  toggleEditMode: () => void;
  addWidget: (type: WidgetType, size?: WidgetSize) => void;
  removeWidget: (id: string) => void;
  toggleWidgetVisibility: (id: string) => void;
  resizeWidget: (id: string, size: WidgetSize) => void;
  reorderWidgets: (startIndex: number, endIndex: number) => void;
  resetToDefault: () => void;
  setGridCols: (cols: number) => void;
}

// Default widget configuration
const defaultWidgets: DashboardWidget[] = [
  { id: 'portfolio-1', type: 'portfolio', size: 'medium', position: 0, isVisible: true },
  { id: 'spotlight-1', type: 'spotlight', size: 'large', position: 1, isVisible: true },
  { id: 'marketplace-1', type: 'marketplace', size: 'medium', position: 2, isVisible: true },
  { id: 'launchpad-1', type: 'launchpad', size: 'medium', position: 3, isVisible: true },
  { id: 'governance-1', type: 'governance', size: 'medium', position: 4, isVisible: true },
  { id: 'analytics-1', type: 'analytics', size: 'medium', position: 5, isVisible: true },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: defaultWidgets,
      gridCols: 4,
      isEditMode: false,

      toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode })),

      addWidget: (type: WidgetType, size: WidgetSize = 'medium') => {
        const id = `${type}-${Date.now()}`;
        const widgets = get().widgets;
        const newWidget: DashboardWidget = {
          id,
          type,
          size,
          position: widgets.length,
          isVisible: true,
        };
        set({ widgets: [...widgets, newWidget] });
      },

      removeWidget: (id: string) => {
        set(state => ({
          widgets: state.widgets.filter(w => w.id !== id)
        }));
      },

      toggleWidgetVisibility: (id: string) => {
        set(state => ({
          widgets: state.widgets.map(w => 
            w.id === id ? { ...w, isVisible: !w.isVisible } : w
          )
        }));
      },

      resizeWidget: (id: string, size: WidgetSize) => {
        set(state => ({
          widgets: state.widgets.map(w => 
            w.id === id ? { ...w, size } : w
          )
        }));
      },

      reorderWidgets: (startIndex: number, endIndex: number) => {
        const widgets = [...get().widgets];
        const [removed] = widgets.splice(startIndex, 1);
        widgets.splice(endIndex, 0, removed);
        
        // Update positions
        const updatedWidgets = widgets.map((w, index) => ({
          ...w,
          position: index
        }));
        
        set({ widgets: updatedWidgets });
      },

      resetToDefault: () => {
        set({ widgets: defaultWidgets, isEditMode: false });
      },

      setGridCols: (cols: number) => {
        set({ gridCols: cols });
      }
    }),
    {
      name: 'cf1-dashboard-config',
      version: 1,
    }
  )
);