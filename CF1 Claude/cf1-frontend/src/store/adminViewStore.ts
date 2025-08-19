import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminRole } from '../hooks/useAdminAuth';

export interface AdminViewState {
  currentView: 'main' | 'admin';
  adminRole: AdminRole;
  previousView: 'main' | 'admin';
  
  // Actions
  toggleView: () => void;
  setAdminView: (role: AdminRole) => void;
  setMainView: () => void;
  exitAdminView: () => void;
  resetView: () => void;
}

export const useAdminViewStore = create<AdminViewState>()(
  persist(
    (set, get) => ({
      currentView: 'main',
      adminRole: null,
      previousView: 'main',

      toggleView: () => {
        const { currentView } = get();
        const newView = currentView === 'main' ? 'admin' : 'main';
        
        set({
          previousView: currentView,
          currentView: newView
        });
      },

      setAdminView: (role: AdminRole) => {
        const { currentView } = get();
        
        set({
          previousView: currentView,
          currentView: 'admin',
          adminRole: role
        });
      },

      setMainView: () => {
        const { currentView } = get();
        
        set({
          previousView: currentView,
          currentView: 'main'
        });
      },

      exitAdminView: () => {
        const { currentView } = get();
        
        set({
          previousView: currentView,
          currentView: 'main',
          adminRole: null
        });
      },

      resetView: () => {
        set({
          currentView: 'main',
          adminRole: null,
          previousView: 'main'
        });
      }
    }),
    {
      name: 'admin-view-storage',
      partialize: (state) => ({
        currentView: state.currentView,
        adminRole: state.adminRole
      })
    }
  )
);