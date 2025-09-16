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
  permissions?: string[];
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
  refreshUserData: () => Promise<void>;
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

// Production Railway backend with correct /api path
let API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Ensure API_BASE always ends with /api in production
if (import.meta.env.MODE === 'production' && !API_BASE.endsWith('/api')) {
  API_BASE = API_BASE.endsWith('/') 
    ? API_BASE + 'api' 
    : API_BASE + '/api';
}

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
            // Try admin login first since that's what works in local
            console.log('Trying admin login first...');
            const adminUrl = `${API_BASE}/admin/auth/login`;
            
            let response = await fetch(adminUrl, {
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

            let data = await response.json();

            // If admin login succeeds
            if (response.ok) {
              console.log('Admin login successful');
              // Handle admin login success
              set({
                isAuthenticated: true,
                user: {
                  id: data.user.id,
                  email: data.user.email,
                  displayName: data.user.name,
                  role: data.user.role || 'super_admin', // Use the actual role from backend
                  permissions: data.user.permissions || [], // Include permissions from backend
                  authMethod: 'email',
                  emailVerified: true,
                  accountStatus: 'active',
                  kycStatus: 'verified',
                  canPerformBlockchainOperations: true,
                  createdAt: new Date().toISOString(),
                  lastLoginAt: data.user.lastLoginAt
                },
                accessToken: data.token,
                loading: false,
                error: null,
                showAuthModal: false, // Close the auth modal
              });
              
              // Set API client auth token for admin requests
              apiClient.setAuthToken(data.token);
              return;
            }

            // If admin login fails, try regular user login
            console.log('Admin login failed, trying regular user login...');
            response = await fetch(`${API_BASE}/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(credentials),
            });

            data = await response.json();
            
            if (response.ok) {
              // Handle regular user login success
              set({
                isAuthenticated: true,
                user: {
                  id: data.user.id,
                  email: data.user.email,
                  displayName: data.user.displayName || data.user.name,
                  role: data.user.role || 'investor',
                  permissions: data.user.permissions || [],
                  authMethod: 'email',
                  emailVerified: data.user.emailVerified || false,
                  accountStatus: data.user.accountStatus || 'active',
                  kycStatus: data.user.kycStatus || 'not_started',
                  canPerformBlockchainOperations: data.user.canPerformBlockchainOperations || false,
                  createdAt: data.user.createdAt || new Date().toISOString(),
                  lastLoginAt: data.user.lastLoginAt
                },
                accessToken: data.token,
                loading: false,
                error: null,
                showAuthModal: false,
              });
              
              apiClient.setAuthToken(data.token);
              return;
            } else {
              // Both admin and regular login failed
              throw new Error(data.message || 'Login failed');
            }
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

        refreshUserData: async () => {
          const { accessToken, isAuthenticated } = get();
          if (!isAuthenticated || !accessToken) {
            return;
          }

          try {
            set({ loading: true });

            // Get updated user data from the backend
            const response = await fetch(`${API_BASE}/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data?.user) {
                console.log('🔄 User data refreshed successfully:', {
                  userId: data.data.user.id,
                  email: data.data.user.email,
                  newRole: data.data.user.role,
                  newPermissions: data.data.user.permissions,
                  oldRole: get().user?.role,
                  oldPermissions: get().user?.permissions
                });
                
                // Update user with fresh data from backend including permissions
                set({ 
                  user: {
                    ...get().user!,
                    ...data.data.user,
                    permissions: data.data.user.permissions || [],
                    // Ensure role and permissions are up to date
                    role: data.data.user.role,
                    authMethod: data.data.user.authMethod
                  },
                  loading: false 
                });

                // Update API client token to ensure consistency
                apiClient.setAuthToken(accessToken);
                
                console.log('✅ User session updated with new permissions');
              } else {
                console.warn('Invalid response format from /auth/me:', data);
                set({ loading: false });
              }
            } else {
              console.warn('Failed to refresh user data, response not ok:', response.status);
              set({ loading: false });
            }
          } catch (error) {
            console.error('Error refreshing user data:', error);
            set({ loading: false });
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