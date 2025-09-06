import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface UIState {
  // Theme and appearance
  darkMode: boolean;
  sidebarCollapsed: boolean;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Modals and overlays
  modals: {
    investmentModal: boolean;
    walletModal: boolean;
    profileModal: boolean;
    proposalModal: boolean;
  };
  
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Error handling
  errors: Record<string, string>;
  
  // Navigation
  currentPage: string;
  breadcrumb: Array<{ label: string; path: string }>;

  // Actions
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Modal actions
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setLoading: (key: string, loading: boolean) => void;
  clearLoadingStates: () => void;
  
  // Error actions
  setError: (key: string, error: string) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  
  // Navigation actions
  setCurrentPage: (page: string) => void;
  setBreadcrumb: (breadcrumb: Array<{ label: string; path: string }>) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        darkMode: true,
        sidebarCollapsed: false,
        notifications: [],
        unreadCount: 0,
        modals: {
          investmentModal: false,
          walletModal: false,
          profileModal: false,
          proposalModal: false
        },
        globalLoading: false,
        loadingStates: {},
        errors: {},
        currentPage: '/',
        breadcrumb: [],

        // Theme actions
        toggleDarkMode: () => {
          set(state => {
            const newDarkMode = !state.darkMode;
            
            // Update document class for Tailwind dark mode
            if (typeof document !== 'undefined') {
              if (newDarkMode) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            }
            
            return { darkMode: newDarkMode };
          });
        },

        toggleSidebar: () => {
          set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
        },

        setSidebarCollapsed: (collapsed: boolean) => {
          set({ sidebarCollapsed: collapsed });
        },

        // Notification actions
        addNotification: (notificationData) => {
          const notification: Notification = {
            ...notificationData,
            id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            read: false
          };

          set(state => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }));
        },

        markNotificationRead: (id: string) => {
          set(state => {
            const notification = state.notifications.find(n => n.id === id);
            if (notification && !notification.read) {
              return {
                notifications: state.notifications.map(n =>
                  n.id === id ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
              };
            }
            return state;
          });
        },

        markAllNotificationsRead: () => {
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0
          }));
        },

        removeNotification: (id: string) => {
          set(state => {
            const notification = state.notifications.find(n => n.id === id);
            const wasUnread = notification && !notification.read;
            
            return {
              notifications: state.notifications.filter(n => n.id !== id),
              unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
            };
          });
        },

        clearNotifications: () => {
          set({
            notifications: [],
            unreadCount: 0
          });
        },

        // Modal actions
        openModal: (modal: keyof UIState['modals']) => {
          set(state => ({
            modals: { ...state.modals, [modal]: true }
          }));
        },

        closeModal: (modal: keyof UIState['modals']) => {
          set(state => ({
            modals: { ...state.modals, [modal]: false }
          }));
        },

        closeAllModals: () => {
          set({
            modals: {
              investmentModal: false,
              walletModal: false,
              profileModal: false,
              proposalModal: false
            }
          });
        },

        // Loading actions
        setGlobalLoading: (loading: boolean) => {
          set({ globalLoading: loading });
        },

        setLoading: (key: string, loading: boolean) => {
          set(state => ({
            loadingStates: {
              ...state.loadingStates,
              [key]: loading
            }
          }));
        },

        clearLoadingStates: () => {
          set({ loadingStates: {} });
        },

        // Error actions
        setError: (key: string, error: string) => {
          set(state => ({
            errors: { ...state.errors, [key]: error }
          }));
        },

        clearError: (key: string) => {
          set(state => {
            const { [key]: _, ...remainingErrors } = state.errors;
            return { errors: remainingErrors };
          });
        },

        clearAllErrors: () => {
          set({ errors: {} });
        },

        // Navigation actions
        setCurrentPage: (page: string) => {
          set({ currentPage: page });
        },

        setBreadcrumb: (breadcrumb: Array<{ label: string; path: string }>) => {
          set({ breadcrumb });
        }
      }),
      {
        name: 'cf1-ui-storage',
        partialize: (state) => ({
          darkMode: state.darkMode,
          sidebarCollapsed: state.sidebarCollapsed
        })
      }
    ),
    {
      name: 'ui-store'
    }
  )
);

// Initialize dark mode on load - Apply immediately to prevent flash
if (typeof window !== 'undefined') {
  const storedDarkMode = localStorage.getItem('cf1-ui-storage');
  let shouldUseDarkMode = true; // Default to dark mode
  
  if (storedDarkMode) {
    try {
      const parsed = JSON.parse(storedDarkMode);
      shouldUseDarkMode = parsed.state?.darkMode !== undefined ? parsed.state.darkMode : true;
    } catch (e) {
      // Ignore parsing errors, default to dark mode
      shouldUseDarkMode = true;
    }
  }
  
  if (shouldUseDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}