import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SessionRole = 'investor' | 'creator' | 'platform_admin' | 'super_admin' | 'owner';

interface SessionStore {
  selectedRole: SessionRole | null;
  isRoleSelected: boolean;
  
  // Actions
  setRole: (role: SessionRole) => void;
  clearRole: () => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      selectedRole: null,
      isRoleSelected: false,
      
      setRole: (role: SessionRole) => {
        set({ 
          selectedRole: role, 
          isRoleSelected: true 
        });
      },
      
      clearRole: () => {
        set({ 
          selectedRole: null, 
          isRoleSelected: false 
        });
      },
      
      resetSession: () => {
        set({ 
          selectedRole: null, 
          isRoleSelected: false 
        });
      }
    }),
    {
      name: 'cf1-session-storage',
      // Only persist selectedRole and isRoleSelected
      partialize: (state) => ({ 
        selectedRole: state.selectedRole,
        isRoleSelected: state.isRoleSelected
      }),
    }
  )
);

// Utility functions
export const getRoleDisplayName = (role: SessionRole): string => {
  switch (role) {
    case 'investor':
      return 'Investor';
    case 'creator':
      return 'Creator';
    case 'platform_admin':
      return 'Platform Admin';
    case 'super_admin':
      return 'Super Admin';
    case 'owner':
      return 'Owner';
    default:
      return 'Unknown';
  }
};

export const getRoleDescription = (role: SessionRole): string => {
  switch (role) {
    case 'investor':
      return 'Standard user with investment capabilities';
    case 'creator':
      return 'Asset creator with proposal management rights';
    case 'platform_admin':
      return 'Platform administrator with user management';
    case 'super_admin':
      return 'Super administrator with full platform access';
    case 'owner':
      return 'Platform owner with complete control';
    default:
      return '';
  }
};