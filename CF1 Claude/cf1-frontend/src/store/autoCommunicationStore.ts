import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationTrigger {
  id: string;
  name: string;
  type: 'time_based' | 'milestone_based' | 'custom';
  enabled: boolean;
  
  // Time-based settings
  timeBeforeDeadline?: {
    value: number;
    unit: 'hours' | 'days' | 'weeks';
  };
  
  // Frequency settings
  frequency?: {
    type: 'once' | 'recurring';
    interval?: {
      value: number;
      unit: 'hours' | 'days';
    };
    maxReminders?: number;
  };
  
  // Content settings
  template: {
    subject: string;
    message: string;
    channels: ('email' | 'in_app' | 'sms')[];
    urgency: 'low' | 'medium' | 'high';
  };
  
  // Targeting
  targeting: {
    audience: 'all_investors' | 'committed_investors' | 'potential_investors' | 'specific_segments';
    segments?: string[];
    minimumInvestment?: number;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDefault: boolean;
}

export interface AutoCommunicationConfig {
  id: string;
  creatorId?: string; // undefined for platform defaults
  proposalId?: string; // specific to proposal or global
  triggers: NotificationTrigger[];
  enabled: boolean;
  lastModified: string;
}

interface AutoCommunicationState {
  // Platform-level defaults
  platformDefaults: NotificationTrigger[];
  
  // Creator-specific configurations
  creatorConfigs: Record<string, AutoCommunicationConfig>;
  
  // Proposal-specific overrides
  proposalConfigs: Record<string, AutoCommunicationConfig>;
  
  // Active notifications tracking
  activeNotifications: {
    triggerId: string;
    proposalId: string;
    scheduledFor: string;
    status: 'pending' | 'sent' | 'failed';
    attempt: number;
  }[];
  
  // Actions
  setPlatformDefaults: (triggers: NotificationTrigger[]) => void;
  updatePlatformDefault: (triggerId: string, updates: Partial<NotificationTrigger>) => void;
  addPlatformDefault: (trigger: Omit<NotificationTrigger, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removePlatformDefault: (triggerId: string) => void;
  
  // Creator configuration actions
  setCreatorConfig: (creatorId: string, config: Omit<AutoCommunicationConfig, 'id'>) => void;
  updateCreatorTrigger: (creatorId: string, triggerId: string, updates: Partial<NotificationTrigger>) => void;
  addCreatorTrigger: (creatorId: string, trigger: Omit<NotificationTrigger, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeCreatorTrigger: (creatorId: string, triggerId: string) => void;
  
  // Proposal-specific overrides
  setProposalConfig: (proposalId: string, config: Omit<AutoCommunicationConfig, 'id'>) => void;
  
  // Utility functions
  getEffectiveTriggersForProposal: (proposalId: string, creatorId: string) => NotificationTrigger[];
  scheduleNotifications: (proposalId: string, creatorId: string, deadline: string) => void;
  markNotificationSent: (triggerId: string, proposalId: string) => void;
  
  // Bulk operations
  resetCreatorToDefaults: (creatorId: string) => void;
  exportConfiguration: (creatorId?: string) => AutoCommunicationConfig;
  importConfiguration: (config: AutoCommunicationConfig, creatorId?: string) => void;
}

// Default notification triggers
const defaultPlatformTriggers: NotificationTrigger[] = [
  {
    id: 'deadline-7days',
    name: '7 Days Before Deadline',
    type: 'time_based',
    enabled: true,
    timeBeforeDeadline: { value: 7, unit: 'days' },
    frequency: { type: 'once' },
    template: {
      subject: 'Proposal Deadline Approaching - 7 Days Remaining',
      message: 'The funding deadline for {{proposalTitle}} is approaching. Only 7 days left to participate in this investment opportunity.',
      channels: ['email', 'in_app'],
      urgency: 'medium'
    },
    targeting: {
      audience: 'all_investors'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    isDefault: true
  },
  {
    id: 'deadline-48hours',
    name: '48 Hours Before Deadline',
    type: 'time_based',
    enabled: true,
    timeBeforeDeadline: { value: 48, unit: 'hours' },
    frequency: { type: 'once' },
    template: {
      subject: 'Final 48 Hours - Proposal Closing Soon',
      message: 'Last chance! The funding period for {{proposalTitle}} ends in 48 hours. Current progress: {{fundingProgress}}%.',
      channels: ['email', 'in_app', 'sms'],
      urgency: 'high'
    },
    targeting: {
      audience: 'potential_investors'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    isDefault: true
  },
  {
    id: 'deadline-6hours',
    name: '6 Hours Final Warning',
    type: 'time_based',
    enabled: false, // Disabled by default as it's very aggressive
    timeBeforeDeadline: { value: 6, unit: 'hours' },
    frequency: { type: 'once' },
    template: {
      subject: 'URGENT: Proposal Closing in 6 Hours',
      message: 'This is your final opportunity to invest in {{proposalTitle}}. The funding period closes in just 6 hours.',
      channels: ['email', 'in_app'],
      urgency: 'high'
    },
    targeting: {
      audience: 'potential_investors'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    isDefault: true
  },
  {
    id: 'milestone-75percent',
    name: '75% Funding Milestone',
    type: 'milestone_based',
    enabled: true,
    frequency: { type: 'once' },
    template: {
      subject: 'Milestone Alert: 75% Funded!',
      message: '{{proposalTitle}} has reached 75% of its funding goal! Join the success before the deadline.',
      channels: ['email', 'in_app'],
      urgency: 'medium'
    },
    targeting: {
      audience: 'potential_investors'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    isDefault: true
  }
];

export const useAutoCommunicationStore = create<AutoCommunicationState>()(
  persist(
    (set, get) => ({
      platformDefaults: defaultPlatformTriggers,
      creatorConfigs: {},
      proposalConfigs: {},
      activeNotifications: [],

      setPlatformDefaults: (triggers) => set({ platformDefaults: triggers }),

      updatePlatformDefault: (triggerId, updates) => 
        set((state) => ({
          platformDefaults: state.platformDefaults.map(trigger =>
            trigger.id === triggerId 
              ? { ...trigger, ...updates, updatedAt: new Date().toISOString() }
              : trigger
          )
        })),

      addPlatformDefault: (triggerData) => {
        const trigger: NotificationTrigger = {
          ...triggerData,
          id: `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: true
        };
        
        set((state) => ({
          platformDefaults: [...state.platformDefaults, trigger]
        }));
      },

      removePlatformDefault: (triggerId) =>
        set((state) => ({
          platformDefaults: state.platformDefaults.filter(trigger => trigger.id !== triggerId)
        })),

      setCreatorConfig: (creatorId, configData) => {
        const config: AutoCommunicationConfig = {
          ...configData,
          id: `config-${creatorId}-${Date.now()}`,
          creatorId,
          lastModified: new Date().toISOString()
        };
        
        set((state) => ({
          creatorConfigs: {
            ...state.creatorConfigs,
            [creatorId]: config
          }
        }));
      },

      updateCreatorTrigger: (creatorId, triggerId, updates) => {
        set((state) => {
          const config = state.creatorConfigs[creatorId];
          if (!config) return state;

          return {
            creatorConfigs: {
              ...state.creatorConfigs,
              [creatorId]: {
                ...config,
                triggers: config.triggers.map(trigger =>
                  trigger.id === triggerId
                    ? { ...trigger, ...updates, updatedAt: new Date().toISOString() }
                    : trigger
                ),
                lastModified: new Date().toISOString()
              }
            }
          };
        });
      },

      addCreatorTrigger: (creatorId, triggerData) => {
        const trigger: NotificationTrigger = {
          ...triggerData,
          id: `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: false
        };

        set((state) => {
          const config = state.creatorConfigs[creatorId];
          if (!config) {
            // Create new config if it doesn't exist
            const newConfig: AutoCommunicationConfig = {
              id: `config-${creatorId}-${Date.now()}`,
              creatorId,
              triggers: [trigger],
              enabled: true,
              lastModified: new Date().toISOString()
            };
            
            return {
              creatorConfigs: {
                ...state.creatorConfigs,
                [creatorId]: newConfig
              }
            };
          }

          return {
            creatorConfigs: {
              ...state.creatorConfigs,
              [creatorId]: {
                ...config,
                triggers: [...config.triggers, trigger],
                lastModified: new Date().toISOString()
              }
            }
          };
        });
      },

      removeCreatorTrigger: (creatorId, triggerId) => {
        set((state) => {
          const config = state.creatorConfigs[creatorId];
          if (!config) return state;

          return {
            creatorConfigs: {
              ...state.creatorConfigs,
              [creatorId]: {
                ...config,
                triggers: config.triggers.filter(trigger => trigger.id !== triggerId),
                lastModified: new Date().toISOString()
              }
            }
          };
        });
      },

      setProposalConfig: (proposalId, configData) => {
        const config: AutoCommunicationConfig = {
          ...configData,
          id: `config-${proposalId}-${Date.now()}`,
          proposalId,
          lastModified: new Date().toISOString()
        };
        
        set((state) => ({
          proposalConfigs: {
            ...state.proposalConfigs,
            [proposalId]: config
          }
        }));
      },

      getEffectiveTriggersForProposal: (proposalId, creatorId) => {
        const state = get();
        
        // Start with platform defaults
        let triggers = [...state.platformDefaults];
        
        // Override with creator-specific config if it exists
        const creatorConfig = state.creatorConfigs[creatorId];
        if (creatorConfig && creatorConfig.enabled) {
          triggers = creatorConfig.triggers;
        }
        
        // Override with proposal-specific config if it exists
        const proposalConfig = state.proposalConfigs[proposalId];
        if (proposalConfig && proposalConfig.enabled) {
          triggers = proposalConfig.triggers;
        }
        
        return triggers.filter(trigger => trigger.enabled);
      },

      scheduleNotifications: (proposalId, creatorId, deadline) => {
        const triggers = get().getEffectiveTriggersForProposal(proposalId, creatorId);
        const deadlineDate = new Date(deadline);
        
        const notifications = triggers.map(trigger => {
          let scheduledFor: Date;
          
          if (trigger.type === 'time_based' && trigger.timeBeforeDeadline) {
            const { value, unit } = trigger.timeBeforeDeadline;
            scheduledFor = new Date(deadlineDate);
            
            switch (unit) {
              case 'hours':
                scheduledFor.setHours(scheduledFor.getHours() - value);
                break;
              case 'days':
                scheduledFor.setDate(scheduledFor.getDate() - value);
                break;
              case 'weeks':
                scheduledFor.setDate(scheduledFor.getDate() - (value * 7));
                break;
            }
          } else {
            // For milestone-based or custom triggers, schedule for immediate evaluation
            scheduledFor = new Date();
          }
          
          return {
            triggerId: trigger.id,
            proposalId,
            scheduledFor: scheduledFor.toISOString(),
            status: 'pending' as const,
            attempt: 0
          };
        });
        
        set((state) => ({
          activeNotifications: [...state.activeNotifications, ...notifications]
        }));
      },

      markNotificationSent: (triggerId, proposalId) => {
        set((state) => ({
          activeNotifications: state.activeNotifications.map(notification =>
            notification.triggerId === triggerId && notification.proposalId === proposalId
              ? { ...notification, status: 'sent' as const }
              : notification
          )
        }));
      },

      resetCreatorToDefaults: (creatorId) => {
        set((state) => {
          const newCreatorConfigs = { ...state.creatorConfigs };
          delete newCreatorConfigs[creatorId];
          return { creatorConfigs: newCreatorConfigs };
        });
      },

      exportConfiguration: (creatorId) => {
        const state = get();
        
        if (creatorId) {
          return state.creatorConfigs[creatorId] || {
            id: '',
            triggers: state.platformDefaults,
            enabled: true,
            lastModified: new Date().toISOString()
          };
        }
        
        return {
          id: 'platform-defaults',
          triggers: state.platformDefaults,
          enabled: true,
          lastModified: new Date().toISOString()
        };
      },

      importConfiguration: (config, creatorId) => {
        if (creatorId) {
          set((state) => ({
            creatorConfigs: {
              ...state.creatorConfigs,
              [creatorId]: {
                ...config,
                id: `config-${creatorId}-${Date.now()}`,
                creatorId,
                lastModified: new Date().toISOString()
              }
            }
          }));
        } else {
          set({ platformDefaults: config.triggers });
        }
      }
    }),
    {
      name: 'cf1-auto-communication-store',
      version: 1
    }
  )
);

// Export types for use in components
export type { AutoCommunicationConfig, NotificationTrigger };