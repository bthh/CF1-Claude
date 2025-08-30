import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Investor-level notifications
export type InvestorNotificationType = 
  | 'proposal_new'
  | 'proposal_ending'
  | 'proposal_invested_alert'
  | 'voting_asset_owned'
  | 'dividend_received'
  | 'token_unlock'
  | 'system_alert';

// Creator-level notifications  
export type CreatorNotificationType = 
  | 'proposal_approved' 
  | 'proposal_rejected' 
  | 'proposal_changes_requested';

export type NotificationType = InvestorNotificationType | CreatorNotificationType;

// Simplified - no priority system
export type NotificationPriority = 'normal' | 'urgent';

export interface InAppNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    proposalId?: string;
    assetId?: string;
    amount?: string;
    userId?: string;
    [key: string]: any;
  };
  expiresAt?: string;
  persistent: boolean; // Whether notification stays until manually dismissed
}

export interface NotificationPreferences {
  enableInApp: boolean;
  enableEmail: boolean;
  // Removed enablePush - no mobile push notifications
  categories: {
    [K in NotificationType]: {
      enabled: boolean;
      inApp: boolean;
      email: boolean;
      // Removed priority and push
    };
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
  };
  maxNotifications: number; // Maximum notifications to keep in memory
}

interface NotificationSystemState {
  notifications: InAppNotification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  isEnabled: boolean;
  
  // Actions
  addNotification: (notification: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => string;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  clearExpiredNotifications: () => void;
  
  // Notification management
  getNotificationsByType: (type: NotificationType) => InAppNotification[];
  getUnreadNotifications: () => InAppNotification[];
  getRecentNotifications: (limit?: number) => InAppNotification[];
  
  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  updateCategoryPreference: (type: NotificationType, settings: Partial<NotificationPreferences['categories'][NotificationType]>) => void;
  
  // System controls
  enableNotifications: () => void;
  disableNotifications: () => void;
  
  // Bulk operations
  markMultipleAsRead: (notificationIds: string[]) => void;
  deleteMultiple: (notificationIds: string[]) => void;
}

// Default notification preferences
const defaultPreferences: NotificationPreferences = {
  enableInApp: true,
  enableEmail: true,
  categories: {
    // Investor notifications
    proposal_new: { enabled: true, inApp: true, email: false },
    proposal_ending: { enabled: true, inApp: true, email: true },
    proposal_invested_alert: { enabled: true, inApp: true, email: true },
    voting_asset_owned: { enabled: true, inApp: true, email: false },
    dividend_received: { enabled: true, inApp: true, email: true },
    token_unlock: { enabled: true, inApp: true, email: true },
    system_alert: { enabled: true, inApp: true, email: true },
    
    // Creator notifications
    proposal_approved: { enabled: true, inApp: true, email: true },
    proposal_rejected: { enabled: true, inApp: true, email: true },
    proposal_changes_requested: { enabled: true, inApp: true, email: true }
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00'
  },
  maxNotifications: 100
};

// Mock notifications for development
const mockNotifications: InAppNotification[] = [
  {
    id: 'notif_1',
    type: 'proposal_approved',
    priority: 'normal',
    title: 'Proposal Approved!',
    message: 'Your "Manhattan Office Complex" proposal has been approved and is now live for funding.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    actionable: true,
    actionUrl: '/launchpad/manhattan-office',
    actionText: 'View Proposal',
    metadata: {
      proposalId: 'manhattan-office',
      assetId: 'manhattan-office'
    },
    persistent: true
  },
  {
    id: 'notif_2',
    type: 'voting_asset_owned',
    priority: 'normal',
    title: 'New Governance Vote',
    message: 'Voting has started for "Q4 Dividend Distribution" - Manhattan Office Complex.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    read: false,
    actionable: true,
    actionUrl: '/governance/gov_proposal_1',
    actionText: 'Vote Now',
    metadata: {
      proposalId: 'gov_proposal_1',
      assetId: 'manhattan-office'
    },
    persistent: false
  },
  {
    id: 'notif_3',
    type: 'proposal_invested_alert',
    priority: 'normal',
    title: 'Investment Confirmed',
    message: 'Your $5,000 investment in Gold Bullion Vault has been confirmed.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
    actionable: true,
    actionUrl: '/portfolio',
    actionText: 'View Portfolio',
    metadata: {
      assetId: 'gold-vault',
      amount: '$5,000'
    },
    persistent: false
  },
  {
    id: 'notif_4',
    type: 'dividend_received',
    priority: 'normal',
    title: 'Dividend Payment Received',
    message: 'You received $125.50 in dividends from Manhattan Office Complex.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    read: true,
    actionable: true,
    actionUrl: '/portfolio',
    actionText: 'View Portfolio',
    metadata: {
      assetId: 'manhattan-office',
      amount: '$125.50'
    },
    persistent: false
  },
  {
    id: 'notif_5',
    type: 'system_alert',
    priority: 'urgent',
    title: 'Scheduled Maintenance',
    message: 'Platform maintenance scheduled for Sunday 2:00 AM - 4:00 AM EST. Limited functionality expected.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    read: false,
    actionable: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
    persistent: false
  }
];

export const useNotificationSystemStore = create<NotificationSystemState>()(
  persist(
    (set, get) => ({
      notifications: mockNotifications,
      preferences: defaultPreferences,
      unreadCount: mockNotifications.filter(n => !n.read).length,
      isEnabled: true,

      addNotification: (notificationData) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const notification: InAppNotification = {
          ...notificationData,
          id,
          timestamp: new Date().toISOString(),
          read: false
        };

        set((state) => {
          // Check if notifications are enabled
          if (!state.isEnabled) return state;

          // Check category preferences
          const categoryPref = state.preferences.categories[notification.type];
          if (!categoryPref.enabled || !categoryPref.inApp) return state;

          // Check quiet hours
          if (state.preferences.quietHours.enabled) {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const { startTime, endTime } = state.preferences.quietHours;
            
            // Simple quiet hours check (doesn't handle overnight ranges perfectly)
            if (currentTime >= startTime || currentTime <= endTime) {
              // During quiet hours, only allow urgent notifications
              if (notification.priority !== 'urgent') return state;
            }
          }

          let newNotifications = [notification, ...state.notifications];

          // Enforce max notifications limit
          if (newNotifications.length > state.preferences.maxNotifications) {
            newNotifications = newNotifications.slice(0, state.preferences.maxNotifications);
          }

          const newUnreadCount = newNotifications.filter(n => !n.read).length;

          return {
            ...state,
            notifications: newNotifications,
            unreadCount: newUnreadCount
          };
        });

        return id;
      },

      markAsRead: (notificationId) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          );
          
          const newUnreadCount = updatedNotifications.filter(n => !n.read).length;

          return {
            ...state,
            notifications: updatedNotifications,
            unreadCount: newUnreadCount
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          ...state,
          notifications: state.notifications.map(notification => ({
            ...notification,
            read: true
          })),
          unreadCount: 0
        }));
      },

      deleteNotification: (notificationId) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter(n => n.id !== notificationId);
          const newUnreadCount = updatedNotifications.filter(n => !n.read).length;

          return {
            ...state,
            notifications: updatedNotifications,
            unreadCount: newUnreadCount
          };
        });
      },

      clearAllNotifications: () => {
        set((state) => ({
          ...state,
          notifications: [],
          unreadCount: 0
        }));
      },

      clearExpiredNotifications: () => {
        const now = new Date().toISOString();
        set((state) => {
          const validNotifications = state.notifications.filter(notification => 
            !notification.expiresAt || notification.expiresAt > now
          );
          
          const newUnreadCount = validNotifications.filter(n => !n.read).length;

          return {
            ...state,
            notifications: validNotifications,
            unreadCount: newUnreadCount
          };
        });
      },

      getNotificationsByType: (type) => {
        return get().notifications.filter(notification => notification.type === type);
      },

      getUnreadNotifications: () => {
        return get().notifications.filter(notification => !notification.read);
      },

      getRecentNotifications: (limit = 10) => {
        return get().notifications
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
      },

      updatePreferences: (newPreferences) => {
        set((state) => ({
          ...state,
          preferences: {
            ...state.preferences,
            ...newPreferences
          }
        }));
      },

      updateCategoryPreference: (type, settings) => {
        set((state) => ({
          ...state,
          preferences: {
            ...state.preferences,
            categories: {
              ...state.preferences.categories,
              [type]: {
                ...state.preferences.categories[type],
                ...settings
              }
            }
          }
        }));
      },

      enableNotifications: () => {
        set((state) => ({ ...state, isEnabled: true }));
      },

      disableNotifications: () => {
        set((state) => ({ ...state, isEnabled: false }));
      },

      markMultipleAsRead: (notificationIds) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification =>
            notificationIds.includes(notification.id)
              ? { ...notification, read: true }
              : notification
          );
          
          const newUnreadCount = updatedNotifications.filter(n => !n.read).length;

          return {
            ...state,
            notifications: updatedNotifications,
            unreadCount: newUnreadCount
          };
        });
      },

      deleteMultiple: (notificationIds) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter(n => 
            !notificationIds.includes(n.id)
          );
          
          const newUnreadCount = updatedNotifications.filter(n => !n.read).length;

          return {
            ...state,
            notifications: updatedNotifications,
            unreadCount: newUnreadCount
          };
        });
      }
    }),
    {
      name: 'cf1-notification-system',
      partialize: (state) => ({
        notifications: state.notifications.filter(n => n.persistent || !n.read), // Only persist unread and persistent notifications
        preferences: state.preferences,
        isEnabled: state.isEnabled
      })
    }
  )
);

// Notification helper functions
export const createNotification = (
  type: NotificationType,
  title: string,
  message: string,
  options: Partial<Pick<InAppNotification, 'priority' | 'actionable' | 'actionUrl' | 'actionText' | 'metadata' | 'expiresAt' | 'persistent'>> = {}
): Omit<InAppNotification, 'id' | 'timestamp' | 'read'> => ({
  type,
  title,
  message,
  priority: options.priority || 'normal',
  actionable: options.actionable || false,
  actionUrl: options.actionUrl,
  actionText: options.actionText,
  metadata: options.metadata,
  expiresAt: options.expiresAt,
  persistent: options.persistent || false
});

// Priority-based styling helpers
export const getPriorityColor = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'urgent': return 'red';
    case 'normal': return 'blue';
    default: return 'blue';
  }
};

export const getPriorityIcon = (type: NotificationType): string => {
  switch (type) {
    // Creator notifications
    case 'proposal_approved': return '✅';
    case 'proposal_rejected': return '❌';
    case 'proposal_changes_requested': return '✏️';
    
    // Investor notifications  
    case 'proposal_new': return '📢';
    case 'proposal_ending': return '⏰';
    case 'proposal_invested_alert': return '💰';
    case 'voting_asset_owned': return '🗳️';
    case 'dividend_received': return '💵';
    case 'token_unlock': return '🔓';
    case 'system_alert': return '🚨';
    
    default: return 'ℹ️';
  }
};