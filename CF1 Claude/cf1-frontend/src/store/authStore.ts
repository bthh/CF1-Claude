import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  id: string;
  address: string;
  email?: string;
  name?: string;
  verified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not_started';
  joinDate: string;
  profileImage?: string;
}

export interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  login: (address: string, signature?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  setKycStatus: (status: User['kycStatus']) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,

        // Actions
        login: async (address: string, _?: string) => {
          set({ loading: true, error: null });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const user: User = {
              id: `user_${Date.now()}`,
              address,
              verified: true,
              kycStatus: 'verified',
              joinDate: new Date().toISOString(),
              name: 'Demo User',
              profileImage: address.slice(0, 2).toUpperCase()
            };

            const token = `token_${Date.now()}`;

            set({
              isAuthenticated: true,
              user,
              token,
              loading: false,
              error: null
            });
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Login failed'
            });
          }
        },

        logout: () => {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            error: null
          });
        },

        updateProfile: (updates: Partial<User>) => {
          const { user } = get();
          if (user) {
            set({
              user: { ...user, ...updates }
            });
          }
        },

        setKycStatus: (status: User['kycStatus']) => {
          const { user } = get();
          if (user) {
            set({
              user: { ...user, kycStatus: status }
            });
          }
        },

        clearError: () => set({ error: null }),
        setLoading: (loading: boolean) => set({ loading })
      }),
      {
        name: 'cf1-auth-storage',
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          token: state.token
        })
      }
    ),
    {
      name: 'auth-store'
    }
  )
);