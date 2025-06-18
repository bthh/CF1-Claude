import { useNotificationSystemStore, createNotification, NotificationType } from '../store/notificationSystemStore';

// Notification service for triggering platform-wide notifications
class NotificationService {
  private store: any;

  constructor() {
    // Initialize with store reference
    this.store = null;
  }

  // Initialize the service with the store
  init() {
    this.store = useNotificationSystemStore.getState();
  }

  // Trigger proposal approved notification
  onProposalApproved(proposalId: string, proposalTitle: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'proposal_approved',
      'Proposal Approved!',
      `Your "${proposalTitle}" proposal has been approved and is now live for funding.`,
      {
        priority: 'high',
        actionable: true,
        actionUrl: `/launchpad/${proposalId}`,
        actionText: 'View Proposal',
        metadata: { proposalId },
        persistent: true
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger proposal rejected notification
  onProposalRejected(proposalId: string, proposalTitle: string, reason?: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'proposal_rejected',
      'Proposal Rejected',
      `Your "${proposalTitle}" proposal has been rejected. ${reason ? `Reason: ${reason}` : 'Please review the feedback and resubmit.'}`,
      {
        priority: 'high',
        actionable: true,
        actionUrl: `/my-submissions`,
        actionText: 'View Details',
        metadata: { proposalId, reason },
        persistent: true
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger changes requested notification
  onChangesRequested(proposalId: string, proposalTitle: string, changes: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'proposal_changes_requested',
      'Changes Requested',
      `Changes have been requested for your "${proposalTitle}" proposal. Please review and resubmit.`,
      {
        priority: 'medium',
        actionable: true,
        actionUrl: `/create-proposal?draft=${proposalId}`,
        actionText: 'Edit Proposal',
        metadata: { proposalId, changes },
        persistent: true
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger governance voting started notification
  onGovernanceVotingStarted(proposalId: string, title: string, assetName: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'governance_voting_started',
      'New Governance Vote',
      `Voting has started for "${title}" - ${assetName}.`,
      {
        priority: 'medium',
        actionable: true,
        actionUrl: `/governance/${proposalId}`,
        actionText: 'Vote Now',
        metadata: { proposalId, assetName }
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger investment confirmed notification
  onInvestmentConfirmed(assetName: string, amount: string, txHash?: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'investment_confirmed',
      'Investment Confirmed',
      `Your ${amount} investment in ${assetName} has been confirmed.`,
      {
        priority: 'high',
        actionable: true,
        actionUrl: '/portfolio',
        actionText: 'View Portfolio',
        metadata: { assetName, amount, txHash }
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger investment failed notification
  onInvestmentFailed(assetName: string, amount: string, reason: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'investment_failed',
      'Investment Failed',
      `Your ${amount} investment in ${assetName} failed. Reason: ${reason}`,
      {
        priority: 'high',
        actionable: true,
        actionUrl: '/portfolio',
        actionText: 'Try Again',
        metadata: { assetName, amount, reason }
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger dividend received notification
  onDividendReceived(assetName: string, amount: string, period: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'dividend_received',
      'Dividend Received',
      `You received ${amount} in dividends from ${assetName} for ${period}.`,
      {
        priority: 'high',
        actionable: true,
        actionUrl: '/portfolio',
        actionText: 'View Details',
        metadata: { assetName, amount, period }
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger token unlock notification
  onTokenUnlock(assetName: string, tokenCount: number) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'token_unlock',
      'Tokens Unlocked',
      `${tokenCount} tokens for ${assetName} are now available for trading.`,
      {
        priority: 'high',
        actionable: true,
        actionUrl: '/portfolio',
        actionText: 'View Tokens',
        metadata: { assetName, tokenCount }
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger KYC approved notification
  onKYCApproved(level: string, investmentLimit: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'kyc_approved',
      'KYC Verification Complete',
      `Your identity verification has been approved. You can now make investments up to ${investmentLimit}.`,
      {
        priority: 'high',
        actionable: true,
        actionUrl: '/verification',
        actionText: 'View Status',
        metadata: { level, investmentLimit }
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger KYC rejected notification
  onKYCRejected(reason: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'kyc_rejected',
      'KYC Verification Failed',
      `Your identity verification was rejected. Reason: ${reason}`,
      {
        priority: 'high',
        actionable: true,
        actionUrl: '/verification',
        actionText: 'Resubmit',
        metadata: { reason }
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger system maintenance notification
  onSystemMaintenance(startTime: string, endTime: string, description: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'system_maintenance',
      'Scheduled Maintenance',
      `Platform maintenance scheduled for ${startTime} - ${endTime}. ${description}`,
      {
        priority: 'medium',
        actionable: false,
        expiresAt: endTime,
        metadata: { startTime, endTime, description }
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger security alert notification
  onSecurityAlert(title: string, message: string, actionUrl?: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'security_alert',
      title,
      message,
      {
        priority: 'urgent',
        actionable: !!actionUrl,
        actionUrl,
        actionText: 'Take Action',
        persistent: true
      }
    );

    this.store.addNotification(notification);
  }

  // Trigger general notification
  onGeneralNotification(title: string, message: string, actionUrl?: string, actionText?: string) {
    if (!this.store) this.init();
    
    const notification = createNotification(
      'general',
      title,
      message,
      {
        priority: 'low',
        actionable: !!actionUrl,
        actionUrl,
        actionText
      }
    );

    this.store.addNotification(notification);
  }

  // Batch notification for multiple events
  onBatchNotification(notifications: Array<{
    type: NotificationType;
    title: string;
    message: string;
    options?: any;
  }>) {
    if (!this.store) this.init();
    
    notifications.forEach(({ type, title, message, options = {} }) => {
      const notification = createNotification(type, title, message, options);
      this.store.addNotification(notification);
    });
  }

  // Clear all notifications (admin action)
  clearAllNotifications() {
    if (!this.store) this.init();
    this.store.clearAllNotifications();
  }

  // Send test notification (for development)
  sendTestNotification(type: NotificationType = 'general') {
    if (!this.store) this.init();
    
    const testNotifications = {
      proposal_approved: {
        title: 'Test: Proposal Approved',
        message: 'This is a test notification for proposal approval.'
      },
      investment_confirmed: {
        title: 'Test: Investment Confirmed',
        message: 'This is a test notification for investment confirmation.'
      },
      governance_voting_started: {
        title: 'Test: Voting Started',
        message: 'This is a test notification for governance voting.'
      },
      general: {
        title: 'Test Notification',
        message: 'This is a general test notification.'
      }
    };

    const testData = testNotifications[type] || testNotifications.general;
    const notification = createNotification(type, testData.title, testData.message, {
      priority: 'medium',
      actionable: true,
      actionUrl: '/dashboard',
      actionText: 'View Dashboard'
    });

    this.store.addNotification(notification);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Hook for components to access notification service
export const useNotificationService = () => {
  return notificationService;
};