import { useCallback, useEffect } from 'react';
import { useProposalStore } from '../store/proposalStore';
import { useSubmissionStore } from '../store/submissionStore';
import { notificationScheduler } from '../services/notificationScheduler';
import { useAutoCommunicationStore } from '../store/autoCommunicationStore';

/**
 * Hook to manage auto-communication integration with proposal lifecycle
 * Automatically schedules, updates, and cancels notifications based on proposal events
 */
export const useProposalNotifications = (creatorId?: string) => {
  const { proposals } = useProposalStore();
  const { submissions } = useSubmissionStore();
  const { platformDefaults, creatorConfigs } = useAutoCommunicationStore();

  // Schedule notifications when a proposal is created/approved
  const scheduleNotificationsForProposal = useCallback(async (proposalId: string, creatorId: string) => {
    try {
      await notificationScheduler.scheduleForNewProposal(proposalId, creatorId);
      console.log(`📅 Auto-communications scheduled for proposal: ${proposalId}`);
    } catch (error) {
      console.error('Failed to schedule proposal notifications:', error);
    }
  }, []);

  // Update notifications when funding changes
  const handleFundingUpdate = useCallback(async (proposalId: string, creatorId: string) => {
    try {
      await notificationScheduler.handleFundingUpdate(proposalId, creatorId);
    } catch (error) {
      console.error('Failed to handle funding update:', error);
    }
  }, []);

  // Cancel notifications when proposal status changes
  const handleStatusChange = useCallback(async (proposalId: string, newStatus: string) => {
    try {
      await notificationScheduler.handleProposalStatusChange(proposalId, newStatus);
    } catch (error) {
      console.error('Failed to handle proposal status change:', error);
    }
  }, []);

  // Check if auto-communications are configured for a creator
  const hasConfiguredNotifications = useCallback((creatorId: string): boolean => {
    const creatorConfig = creatorConfigs[creatorId];
    const activeTriggersCount = (creatorConfig?.triggers || platformDefaults).filter(t => t.enabled).length;
    return activeTriggersCount > 0;
  }, [creatorConfigs, platformDefaults]);

  // Get summary of active notifications for a proposal
  const getNotificationSummary = useCallback((proposalId: string) => {
    const scheduledNotifications = notificationScheduler.getProposalNotifications(proposalId);
    const pendingCount = scheduledNotifications.filter(n => !n.executed).length;
    const executedCount = scheduledNotifications.filter(n => n.executed).length;
    
    return {
      total: scheduledNotifications.length,
      pending: pendingCount,
      executed: executedCount,
      notifications: scheduledNotifications
    };
  }, []);

  // Auto-start the notification scheduler when component mounts
  useEffect(() => {
    if (!notificationScheduler.getStatus().isRunning) {
      notificationScheduler.start();
      console.log('📅 Auto-communication scheduler started');
    }

    // Cleanup on unmount
    return () => {
      // Don't stop the scheduler here as it should run globally
      // The scheduler will be stopped when the app unmounts
    };
  }, []);

  // Monitor proposal status changes and trigger notifications accordingly
  useEffect(() => {
    if (!creatorId) return;

    // This effect would monitor changes in proposal status
    // and automatically trigger the appropriate notification handlers
    
    // Note: In a real implementation, you might want to use a more sophisticated
    // change detection mechanism or WebSocket updates
  }, [proposals, submissions, creatorId, handleStatusChange, handleFundingUpdate]);

  return {
    // Functions to manually trigger notification events
    scheduleNotificationsForProposal,
    handleFundingUpdate,
    handleStatusChange,
    
    // Utility functions
    hasConfiguredNotifications,
    getNotificationSummary,
    
    // Status
    isSchedulerRunning: notificationScheduler.getStatus().isRunning,
    schedulerStatus: notificationScheduler.getStatus()
  };
};

export default useProposalNotifications;