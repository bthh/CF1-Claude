import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 
  | 'proposal_approved' 
  | 'proposal_rejected' 
  | 'proposal_changes_requested'
  | 'governance_voting_started'
  | 'governance_voting_ended'
  | 'investment_confirmed'
  | 'investment_failed'
  | 'dividend_received'
  | 'token_unlock'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'system_maintenance'
  | 'security_alert'
  | 'general';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

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
  enablePush: boolean;
  categories: {
    [K in NotificationType]: {
      enabled: boolean;
      priority: NotificationPriority;
      inApp: boolean;
      email: boolean;
      push: boolean;
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
  enablePush: false,
  categories: {
    proposal_approved: { enabled: true, priority: 'high', inApp: true, email: true, push: false },
    proposal_rejected: { enabled: true, priority: 'high', inApp: true, email: true, push: false },
    proposal_changes_requested: { enabled: true, priority: 'medium', inApp: true, email: true, push: false },
    governance_voting_started: { enabled: true, priority: 'medium', inApp: true, email: false, push: false },
    governance_voting_ended: { enabled: true, priority: 'medium', inApp: true, email: false, push: false },
    investment_confirmed: { enabled: true, priority: 'high', inApp: true, email: true, push: false },
    investment_failed: { enabled: true, priority: 'high', inApp: true, email: true, push: false },
    dividend_received: { enabled: true, priority: 'high', inApp: true, email: true, push: false },
    token_unlock: { enabled: true, priority: 'high', inApp: true, email: true, push: false },
    kyc_approved: { enabled: true, priority: 'high', inApp: true, email: true, push: false },
    kyc_rejected: { enabled: true, priority: 'high', inApp: true, email: true, push: false },
    system_maintenance: { enabled: true, priority: 'medium', inApp: true, email: false, push: false },
    security_alert: { enabled: true, priority: 'urgent', inApp: true, email: true, push: true },
    general: { enabled: true, priority: 'low', inApp: true, email: false, push: false }
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
    priority: 'high',
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
    type: 'governance_voting_started',
    priority: 'medium',
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
    type: 'investment_confirmed',
    priority: 'high',
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
    type: 'kyc_approved',
    priority: 'high',
    title: 'KYC Verification Complete',
    message: 'Your identity verification has been approved. You can now make investments up to $50,000.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    read: true,
    actionable: false,
    persistent: false
  },
  {
    id: 'notif_5',
    type: 'system_maintenance',
    priority: 'medium',
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
  priority: options.priority || 'medium',
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
    case 'high': return 'orange';
    case 'medium': return 'blue';
    case 'low': return 'gray';
    default: return 'gray';
  }
};

export const getPriorityIcon = (type: NotificationType): string => {
  switch (type) {
    case 'proposal_approved': return '✅';
    case 'proposal_rejected': return '❌';
    case 'proposal_changes_requested': return '✏️';
    case 'governance_voting_started': return '🗳️';
    case 'governance_voting_ended': return '📊';
    case 'investment_confirmed': return '💰';
    case 'investment_failed': return '⚠️';
    case 'dividend_received': return '💵';
    case 'token_unlock': return '🔓';
    case 'kyc_approved': return '✅';
    case 'kyc_rejected': return '❌';
    case 'system_maintenance': return '🔧';
    case 'security_alert': return '🚨';
    case 'general': return 'ℹ️';
    default: return 'ℹ️';
  }
};