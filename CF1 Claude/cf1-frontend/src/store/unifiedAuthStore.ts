/**
 * CF1 Frontend - Unified Authentication Store
 * Handles both traditional email/password and wallet authentication
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SessionRole } from './sessionStore';
import { apiClient } from '../lib/api/client';

export type AuthMethod = 'email' | 'wallet' | 'hybrid';
export type AccountStatus = 'active' | 'suspended' | 'pending_verification' | 'locked';
export type KycStatus = 'pending' | 'verified' | 'rejected' | 'not_started';

export interface UnifiedUser {
  id: string;
  email?: string;
  walletAddress?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImageUrl?: string;
  role: SessionRole;
  authMethod: AuthMethod;
  emailVerified: boolean;
  accountStatus: AccountStatus;
  kycStatus: KycStatus;
  canPerformBlockchainOperations: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  acceptedTerms: boolean;
}

export interface WalletCredentials {
  walletAddress: string;
  signature?: string;
}

interface UnifiedAuthState {
  // State
  isAuthenticated: boolean;
  user: UnifiedUser | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  
  // UI State
  showAuthModal: boolean;
  authMode: 'login' | 'register' | 'forgot-password' | 'reset-password';
  
  // Actions
  loginWithEmail: (credentials: LoginCredentials) => Promise<void>;
  registerWithEmail: (credentials: RegisterCredentials) => Promise<void>;
  loginWithWallet: (credentials: WalletCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  linkWallet: (walletAddress: string) => Promise<void>;
  
  // UI Actions
  showLogin: () => void;
  showRegister: () => void;
  showForgotPassword: () => void;
  hideAuthModal: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const useUnifiedAuthStore = create<UnifiedAuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isAuthenticated: false,
        user: null,
        accessToken: null,
        loading: false,
        error: null,
        showAuthModal: false,
        authMode: 'login',

        // Authentication Actions
        loginWithEmail: async (credentials: LoginCredentials) => {
          set({ loading: true, error: null });
          
          try {
            // First try regular user login
            let response = await fetch(`${API_BASE}/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(credentials),
            });

            let data = await response.json();

            // If regular login fails, try admin login
            if (!response.ok) {
              console.log('Regular login failed, trying admin login...');
              const adminUrl = `${API_BASE}/admin/auth/login`;
              console.log('Admin login URL:', adminUrl);
              
              const adminResponse = await fetch(adminUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  username: credentials.email,
                  password: credentials.password
                }),
              });

              const adminData = await adminResponse.json();

              if (adminResponse.ok) {
                console.log('Admin login successful');
                // Handle admin login success
                set({
                  isAuthenticated: true,
                  user: {
                    id: adminData.user.id,
                    email: adminData.user.email,
                    displayName: adminData.user.name,
                    role: 'admin',
                    authMethod: 'email',
                    emailVerified: true,
                    accountStatus: 'active',
                    kycStatus: 'verified',
                    canPerformBlockchainOperations: true,
                    createdAt: new Date().toISOString(),
                    lastLoginAt: adminData.user.lastLoginAt
                  },
                  accessToken: adminData.token,
                  loading: false,
                  error: null,
                });
                
                // Set API client auth token for admin requests
                apiClient.setAuthToken(adminData.token);
                return;
              } else {
                // Both regular and admin login failed
                throw new Error(data.message || adminData.message || 'Login failed');
              }
            }

            // Regular login was successful
            // Set API client auth token for authenticated requests
            apiClient.setAuthToken(data.data.accessToken);

            set({
              isAuthenticated: true,
              user: data.data.user,
              accessToken: data.data.accessToken,
              loading: false,
              error: null,
              showAuthModal: false,
            });

            console.log('Email login successful:', data.data.user);
          } catch (error) {
            console.error('Email login error:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Login failed'
            });
          }
        },

        registerWithEmail: async (credentials: RegisterCredentials) => {
          set({ loading: true, error: null });
          
          try {
            const response = await fetch(`${API_BASE}/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || 'Registration failed');
            }

            // Set API client auth token for authenticated requests
            apiClient.setAuthToken(data.data.accessToken);

            set({
              isAuthenticated: true,
              user: data.data.user,
              accessToken: data.data.accessToken,
              loading: false,
              error: null,
              showAuthModal: false,
            });

            console.log('Email registration successful:', data.data.user);
          } catch (error) {
            console.error('Email registration error:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Registration failed'
            });
          }
        },

        loginWithWallet: async (credentials: WalletCredentials) => {
          set({ loading: true, error: null });
          
          try {
            const response = await fetch(`${API_BASE}/auth/wallet-login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || 'Wallet authentication failed');
            }

            // Set API client auth token for authenticated requests
            apiClient.setAuthToken(data.data.accessToken);

            set({
              isAuthenticated: true,
              user: data.data.user,
              accessToken: data.data.accessToken,
              loading: false,
              error: null,
              showAuthModal: false,
            });

            console.log('Wallet login successful:', data.data.user);
          } catch (error) {
            console.error('Wallet login error:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Wallet authentication failed'
            });
          }
        },

        logout: async () => {
          set({ loading: true });
          
          try {
            await fetch(`${API_BASE}/auth/logout`, {
              method: 'POST',
              credentials: 'include',
            });
          } catch (error) {
            console.error('Logout error:', error);
          }

          // Clear API client auth token
          apiClient.setAuthToken(null);

          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            loading: false,
            error: null,
            showAuthModal: false,
          });
        },

        refreshToken: async () => {
          try {
            const response = await fetch(`${API_BASE}/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
            });

            if (response.ok) {
              const data = await response.json();
              // Update API client with refreshed token
              apiClient.setAuthToken(data.data.accessToken);
              set({ accessToken: data.data.accessToken });
            } else {
              // Token refresh failed, logout user
              get().logout();
            }
          } catch (error) {
            console.error('Token refresh error:', error);
            get().logout();
          }
        },

        forgotPassword: async (email: string) => {
          set({ loading: true, error: null });
          
          try {
            const response = await fetch(`${API_BASE}/auth/forgot-password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || 'Password reset request failed');
            }

            set({ loading: false, error: null });
            // Show success message - email sent
          } catch (error) {
            console.error('Forgot password error:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Password reset request failed'
            });
          }
        },

        resetPassword: async (token: string, password: string) => {
          set({ loading: true, error: null });
          
          try {
            const response = await fetch(`${API_BASE}/auth/reset-password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || 'Password reset failed');
            }

            set({ loading: false, error: null, showAuthModal: false });
            // Password reset successful, user can now login
          } catch (error) {
            console.error('Reset password error:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Password reset failed'
            });
          }
        },

        verifyEmail: async (token: string) => {
          set({ loading: true, error: null });
          
          try {
            const response = await fetch(`${API_BASE}/auth/verify-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || 'Email verification failed');
            }

            // Update user verification status if currently logged in
            const { user } = get();
            if (user) {
              set({ 
                user: { ...user, emailVerified: true },
                loading: false,
                error: null 
              });
            } else {
              set({ loading: false, error: null });
            }
          } catch (error) {
            console.error('Email verification error:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Email verification failed'
            });
          }
        },

        linkWallet: async (walletAddress: string) => {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          set({ loading: true, error: null });
          
          try {
            const response = await fetch(`${API_BASE}/auth/link-wallet`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              credentials: 'include',
              body: JSON.stringify({ walletAddress }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || 'Wallet linking failed');
            }

            // Update user with new wallet info
            set({ 
              user: data.data.user,
              loading: false,
              error: null 
            });

            console.log('Wallet linked successfully:', data.data.user);
          } catch (error) {
            console.error('Link wallet error:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Wallet linking failed'
            });
          }
        },

        // UI Actions
        showLogin: () => set({ authMode: 'login', showAuthModal: true, error: null }),
        showRegister: () => set({ authMode: 'register', showAuthModal: true, error: null }),
        showForgotPassword: () => set({ authMode: 'forgot-password', showAuthModal: true, error: null }),
        hideAuthModal: () => set({ showAuthModal: false, error: null }),
        clearError: () => set({ error: null }),
        setLoading: (loading: boolean) => set({ loading }),
      }),
      {
        name: 'cf1-unified-auth-storage',
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          accessToken: state.accessToken,
        }),
        onRehydrateStorage: () => (state) => {
          // Set API client token when store rehydrates from localStorage
          if (state?.accessToken && state?.isAuthenticated) {
            apiClient.setAuthToken(state.accessToken);
            console.log('🔑 API client token restored from persistent storage');
          }
        },
      }
    ),
    {
      name: 'unified-auth-store'
    }
  )
);

// Auto-refresh token every 10 minutes if authenticated
setInterval(async () => {
  const store = useUnifiedAuthStore.getState();
  if (store.isAuthenticated && store.accessToken) {
    try {
      await store.refreshToken();
    } catch (error) {
      console.error('Auto token refresh failed:', error);
    }
  }
}, 10 * 60 * 1000); // 10 minutes

// Helper functions
export const getAuthHeaders = (): HeadersInit => {
  const { accessToken } = useUnifiedAuthStore.getState();
  return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
};

export const isWalletUser = (user?: UnifiedUser | null): boolean => {
  return user?.authMethod === 'wallet' || user?.authMethod === 'hybrid';
};

export const isEmailUser = (user?: UnifiedUser | null): boolean => {
  return user?.authMethod === 'email' || user?.authMethod === 'hybrid';
};

export const canPerformBlockchainOps = (user?: UnifiedUser | null): boolean => {
  return user?.canPerformBlockchainOperations === true;
};