import { useAutoCommunicationStore } from '../store/autoCommunicationStore';
import notificationService, { ProposalData, NotificationRecipient } from './notificationService';
import { useProposalStore, Proposal, FundingStatus } from '../store/proposalStore';
import { useSubmissionStore } from '../store/submissionStore';

interface ScheduledNotification {
  id: string;
  proposalId: string;
  triggerId: string;
  scheduledFor: Date;
  recipients: NotificationRecipient[];
  executed: boolean;
  lastChecked?: Date;
}

interface ProposalDeadlineInfo {
  proposalId: string;
  creatorId: string;
  deadline: Date;
  currentFunding: number;
  fundingGoal: number;
  lastNotificationCheck?: Date;
}

class NotificationScheduler {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private checkIntervalMs = 60000; // Check every minute

  // Start the scheduler
  start(): void {
    if (this.isRunning) {
      console.log('📅 Notification scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('📅 Starting notification scheduler...');
    
    // Run immediately, then set interval
    this.checkAndExecuteNotifications();
    this.intervalId = setInterval(() => {
      this.checkAndExecuteNotifications();
    }, this.checkIntervalMs);
  }

  // Stop the scheduler
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('📅 Notification scheduler stopped');
  }

  // Schedule notifications for a specific proposal
  scheduleProposalNotifications(
    proposal: ProposalData,
    creatorId: string,
    recipients: NotificationRecipient[]
  ): void {
    const store = useAutoCommunicationStore.getState();
    const triggers = store.getEffectiveTriggersForProposal(proposal.id, creatorId);
    
    const deadlineDate = new Date(proposal.deadline);
    const now = new Date();

    for (const trigger of triggers) {
      if (!trigger.enabled) continue;

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
      } else if (trigger.type === 'milestone_based') {
        // For milestone-based triggers, schedule for immediate evaluation
        scheduledFor = now;
      } else {
        // Custom triggers - schedule for next check
        scheduledFor = new Date(now.getTime() + this.checkIntervalMs);
      }

      // Only schedule if the time hasn't passed
      if (scheduledFor > now) {
        const notificationId = `${proposal.id}-${trigger.id}-${scheduledFor.getTime()}`;
        
        const scheduledNotification: ScheduledNotification = {
          id: notificationId,
          proposalId: proposal.id,
          triggerId: trigger.id,
          scheduledFor,
          recipients: [...recipients],
          executed: false
        };

        this.scheduledNotifications.set(notificationId, scheduledNotification);
        console.log(`⏰ Scheduled notification: ${trigger.name} for ${proposal.title} at ${scheduledFor.toISOString()}`);
      }
    }
  }

  // Update notification schedule when proposal data changes
  updateProposalSchedule(
    proposal: ProposalData,
    creatorId: string,
    recipients: NotificationRecipient[]
  ): void {
    // Remove existing notifications for this proposal
    this.cancelProposalNotifications(proposal.id);
    
    // Reschedule with updated data
    this.scheduleProposalNotifications(proposal, creatorId, recipients);
  }

  // Cancel all notifications for a proposal
  cancelProposalNotifications(proposalId: string): void {
    const toRemove: string[] = [];
    
    for (const [id, notification] of this.scheduledNotifications) {
      if (notification.proposalId === proposalId) {
        toRemove.push(id);
      }
    }
    
    toRemove.forEach(id => {
      this.scheduledNotifications.delete(id);
      console.log(`❌ Cancelled notification: ${id}`);
    });
  }

  // Main scheduler loop
  private async checkAndExecuteNotifications(): Promise<void> {
    const now = new Date();
    const toExecute: ScheduledNotification[] = [];
    
    // Find notifications that should be executed
    for (const notification of this.scheduledNotifications.values()) {
      if (!notification.executed && notification.scheduledFor <= now) {
        toExecute.push(notification);
      }
    }

    if (toExecute.length === 0) {
      return;
    }

    console.log(`📋 Found ${toExecute.length} notifications to execute`);

    // Execute each notification
    for (const notification of toExecute) {
      try {
        await this.executeNotification(notification);
        notification.executed = true;
        notification.lastChecked = now;
      } catch (error) {
        console.error(`❌ Failed to execute notification ${notification.id}:`, error);
      }
    }

    // Clean up executed notifications (keep for history)
    this.cleanupOldNotifications();
  }

  // Execute a specific notification
  private async executeNotification(notification: ScheduledNotification): Promise<void> {
    const store = useAutoCommunicationStore.getState();
    
    // Get the trigger configuration
    const allTriggers = [
      ...store.platformDefaults,
      ...Object.values(store.creatorConfigs).flatMap(config => config.triggers),
      ...Object.values(store.proposalConfigs).flatMap(config => config.triggers)
    ];
    
    const trigger = allTriggers.find(t => t.id === notification.triggerId);
    if (!trigger || !trigger.enabled) {
      console.log(`⚠️ Trigger ${notification.triggerId} not found or disabled, skipping notification`);
      return;
    }

    // Get proposal data (this would come from your proposal store/API)
    const proposal = await this.getProposalData(notification.proposalId);
    if (!proposal) {
      console.log(`⚠️ Proposal ${notification.proposalId} not found, skipping notification`);
      return;
    }

    // Check if deadline has passed
    if (new Date() > new Date(proposal.deadline)) {
      console.log(`⚠️ Proposal ${notification.proposalId} deadline has passed, skipping notification`);
      return;
    }

    // For milestone-based triggers, check if conditions are met
    if (trigger.type === 'milestone_based') {
      const fundingProgress = (proposal.currentFunding / proposal.fundingGoal) * 100;
      
      // Check milestone conditions based on trigger name
      const shouldTrigger = this.checkMilestoneCondition(trigger, fundingProgress);
      if (!shouldTrigger) {
        console.log(`⚠️ Milestone condition not met for ${trigger.name} (${fundingProgress.toFixed(1)}%), rescheduling`);
        // Reschedule for later check
        notification.scheduledFor = new Date(Date.now() + this.checkIntervalMs);
        notification.executed = false;
        return;
      }
    }

    console.log(`🚀 Executing notification: ${trigger.name} for proposal ${proposal.title}`);

    // Send the notification
    const deliveries = await notificationService.sendNotification(
      proposal,
      notification.recipients,
      trigger
    );

    console.log(`✅ Notification executed: ${deliveries.length} deliveries sent`);

    // Handle recurring notifications
    if (trigger.frequency?.type === 'recurring') {
      await this.scheduleRecurringNotification(notification, trigger);
    }
  }

  // Schedule next occurrence of recurring notification
  private async scheduleRecurringNotification(
    originalNotification: ScheduledNotification,
    trigger: any
  ): Promise<void> {
    const { frequency } = trigger;
    if (!frequency || frequency.type !== 'recurring') return;

    const { interval, maxReminders = 3 } = frequency;
    if (!interval) return;

    // Check if we've reached the maximum number of reminders
    const sentCount = this.getSentNotificationCount(originalNotification.proposalId, trigger.id);
    if (sentCount >= maxReminders) {
      console.log(`📊 Maximum reminders (${maxReminders}) reached for trigger ${trigger.id}`);
      return;
    }

    // Calculate next occurrence
    const nextOccurrence = new Date(originalNotification.scheduledFor);
    switch (interval.unit) {
      case 'hours':
        nextOccurrence.setHours(nextOccurrence.getHours() + interval.value);
        break;
      case 'days':
        nextOccurrence.setDate(nextOccurrence.getDate() + interval.value);
        break;
    }

    // Only schedule if before deadline
    const proposal = await this.getProposalData(originalNotification.proposalId);
    if (proposal && nextOccurrence < new Date(proposal.deadline)) {
      const recurringNotification: ScheduledNotification = {
        id: `${originalNotification.proposalId}-${trigger.id}-${nextOccurrence.getTime()}`,
        proposalId: originalNotification.proposalId,
        triggerId: trigger.id,
        scheduledFor: nextOccurrence,
        recipients: originalNotification.recipients,
        executed: false
      };

      this.scheduledNotifications.set(recurringNotification.id, recurringNotification);
      console.log(`🔄 Scheduled recurring notification for ${nextOccurrence.toISOString()}`);
    }
  }

  // Get count of sent notifications for a specific trigger
  private getSentNotificationCount(proposalId: string, triggerId: string): number {
    const deliveries = notificationService.getDeliveryHistory(proposalId);
    return deliveries.filter(d => d.triggerId === triggerId && d.status === 'sent').length;
  }

  // Get proposal data from the proposal store
  private async getProposalData(proposalId: string): Promise<ProposalData | null> {
    const proposalStore = useProposalStore.getState();
    const proposal = proposalStore.proposals.find(p => p.id === proposalId);
    
    if (!proposal) {
      console.log(`⚠️ Proposal ${proposalId} not found in store`);
      return null;
    }

    // Transform CF1 proposal to notification service format
    return this.transformProposalData(proposal);
  }

  // Transform CF1 proposal data to notification service format
  private transformProposalData(proposal: Proposal): ProposalData {
    return {
      id: proposal.id,
      title: proposal.basic_info.title,
      creatorName: proposal.basic_info.creator_name || 'Unknown Creator',
      fundingGoal: proposal.financial_terms.target_amount,
      currentFunding: proposal.funding_status?.raised_amount || 0,
      deadline: new Date(proposal.financial_terms.funding_deadline * 1000).toISOString(), // Convert Unix timestamp
      minimumInvestment: proposal.financial_terms.minimum_investment,
      description: proposal.basic_info.description,
      assetType: proposal.basic_info.asset_type
    };
  }

  // Clean up old executed notifications
  private cleanupOldNotifications(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const toRemove: string[] = [];

    for (const [id, notification] of this.scheduledNotifications) {
      if (notification.executed && notification.lastChecked && notification.lastChecked < cutoffTime) {
        toRemove.push(id);
      }
    }

    toRemove.forEach(id => {
      this.scheduledNotifications.delete(id);
    });

    if (toRemove.length > 0) {
      console.log(`🧹 Cleaned up ${toRemove.length} old notifications`);
    }
  }

  // Get status of all scheduled notifications
  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }

  // Get status for a specific proposal
  getProposalNotifications(proposalId: string): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values())
      .filter(n => n.proposalId === proposalId);
  }

  // Manual trigger for testing
  async triggerNotificationNow(notificationId: string): Promise<void> {
    const notification = this.scheduledNotifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    await this.executeNotification(notification);
    notification.executed = true;
    notification.lastChecked = new Date();
  }

  // Check if milestone condition is met
  private checkMilestoneCondition(trigger: any, fundingProgress: number): boolean {
    const name = trigger.name.toLowerCase();
    
    // Parse milestone percentage from trigger name
    if (name.includes('25%') || name.includes('25 percent')) {
      return fundingProgress >= 25;
    } else if (name.includes('50%') || name.includes('50 percent')) {
      return fundingProgress >= 50;
    } else if (name.includes('75%') || name.includes('75 percent')) {
      return fundingProgress >= 75;
    } else if (name.includes('90%') || name.includes('90 percent')) {
      return fundingProgress >= 90;
    } else if (name.includes('fully funded') || name.includes('100%')) {
      return fundingProgress >= 100;
    }
    
    // Default: trigger for any milestone
    return true;
  }

  // Get investors for a proposal (recipients for notifications)
  private async getProposalInvestors(proposalId: string): Promise<NotificationRecipient[]> {
    const proposalStore = useProposalStore.getState();
    const proposal = proposalStore.proposals.find(p => p.id === proposalId);
    
    if (!proposal || !proposal.funding_status?.investors) {
      return [];
    }

    // Transform investor data to notification recipients
    return proposal.funding_status.investors.map((investor, index) => ({
      id: investor.address || `investor-${index}`,
      email: investor.email,
      phoneNumber: investor.phone,
      walletAddress: investor.address,
      name: investor.name || 'Valued Investor',
      investmentAmount: investor.amount,
      hasInvested: true,
      isAccredited: investor.accredited || false
    }));
  }

  // Schedule notifications for a proposal when it's created
  async scheduleForNewProposal(proposalId: string, creatorId: string): Promise<void> {
    const proposalData = await this.getProposalData(proposalId);
    if (!proposalData) {
      console.error(`Cannot schedule notifications: Proposal ${proposalId} not found`);
      return;
    }

    // Get all potential investors (for time-based notifications)
    // Note: This could be enhanced to include users who have shown interest
    const potentialInvestors: NotificationRecipient[] = [
      // This would typically come from a user/investor database
      // For now, we'll schedule for existing investors only
    ];

    this.scheduleProposalNotifications(proposalData, creatorId, potentialInvestors);
    console.log(`✅ Scheduled notifications for new proposal: ${proposalData.title}`);
  }

  // Update notifications when proposal funding changes
  async handleFundingUpdate(proposalId: string, creatorId: string): Promise<void> {
    const proposalData = await this.getProposalData(proposalId);
    if (!proposalData) {
      return;
    }

    const investors = await this.getProposalInvestors(proposalId);
    
    // Check for milestone-based notifications that should trigger now
    const store = useAutoCommunicationStore.getState();
    const triggers = store.getEffectiveTriggersForProposal(proposalId, creatorId);
    
    for (const trigger of triggers) {
      if (trigger.type === 'milestone_based' && trigger.enabled) {
        const fundingProgress = (proposalData.currentFunding / proposalData.fundingGoal) * 100;
        const shouldTrigger = this.checkMilestoneCondition(trigger, fundingProgress);
        
        if (shouldTrigger) {
          // Check if this milestone notification was already sent
          const existingNotifications = this.getProposalNotifications(proposalId);
          const alreadySent = existingNotifications.some(
            n => n.triggerId === trigger.id && n.executed
          );
          
          if (!alreadySent) {
            console.log(`🎯 Triggering milestone notification: ${trigger.name}`);
            // Send notification immediately
            const delivery = await notificationService.sendNotification(
              proposalData,
              investors,
              trigger
            );
            console.log(`✅ Milestone notification sent: ${delivery.length} deliveries`);
          }
        }
      }
    }
  }

  // Cancel notifications when proposal is funded or expires
  async handleProposalStatusChange(proposalId: string, newStatus: string): Promise<void> {
    if (newStatus === 'Funded' || newStatus === 'Expired' || newStatus === 'Cancelled') {
      this.cancelProposalNotifications(proposalId);
      console.log(`📋 Cancelled notifications for proposal ${proposalId} (Status: ${newStatus})`);
    }
  }

  // Set check interval (for testing purposes)
  setCheckInterval(intervalMs: number): void {
    this.checkIntervalMs = intervalMs;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  // Get scheduler status
  getStatus(): {
    isRunning: boolean;
    checkInterval: number;
    scheduledCount: number;
    executedCount: number;
  } {
    const notifications = Array.from(this.scheduledNotifications.values());
    
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkIntervalMs,
      scheduledCount: notifications.filter(n => !n.executed).length,
      executedCount: notifications.filter(n => n.executed).length
    };
  }
}

// Singleton instance
export const notificationScheduler = new NotificationScheduler();

// Auto-start scheduler when module loads (in production environment)
if (typeof window !== 'undefined' && import.meta.env.MODE === 'production') {
  notificationScheduler.start();
}

export default notificationScheduler;