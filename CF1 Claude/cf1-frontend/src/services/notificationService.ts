import { NotificationTrigger } from '../store/autoCommunicationStore';
import { useNotifications } from '../hooks/useNotifications';

export interface NotificationRecipient {
  id: string;
  email?: string;
  phoneNumber?: string;
  walletAddress: string;
  name?: string;
  investmentAmount?: number;
  hasInvested: boolean;
  isAccredited: boolean;
}

export interface ProposalData {
  id: string;
  title: string;
  creatorName: string;
  fundingGoal: number;
  currentFunding: number;
  deadline: string;
  minimumInvestment: number;
  description: string;
  assetType: string;
}

export interface NotificationContext {
  proposal: ProposalData;
  recipient: NotificationRecipient;
  trigger: NotificationTrigger;
  timeLeft: string;
  fundingProgress: number;
  customData?: Record<string, any>;
}

export interface DeliveryResult {
  success: boolean;
  channel: 'email' | 'in_app' | 'sms';
  messageId?: string;
  error?: string;
  timestamp: string;
}

export interface NotificationDelivery {
  id: string;
  triggerId: string;
  proposalId: string;
  recipientId: string;
  scheduledFor: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  results: DeliveryResult[];
  context: NotificationContext;
}

class NotificationService {
  private deliveryHistory: Map<string, NotificationDelivery> = new Map();
  private webhooks: string[] = [];
  
  // Template variable substitution
  private substituteVariables(template: string, context: NotificationContext): string {
    const { proposal, recipient, timeLeft, fundingProgress } = context;
    
    return template
      .replace(/\{\{proposalTitle\}\}/g, proposal.title)
      .replace(/\{\{creatorName\}\}/g, proposal.creatorName)
      .replace(/\{\{timeLeft\}\}/g, timeLeft)
      .replace(/\{\{fundingProgress\}\}/g, fundingProgress.toFixed(1))
      .replace(/\{\{minimumInvestment\}\}/g, proposal.minimumInvestment.toLocaleString())
      .replace(/\{\{fundingGoal\}\}/g, proposal.fundingGoal.toLocaleString())
      .replace(/\{\{currentFunding\}\}/g, proposal.currentFunding.toLocaleString())
      .replace(/\{\{recipientName\}\}/g, recipient.name || 'Valued Investor')
      .replace(/\{\{assetType\}\}/g, proposal.assetType);
  }

  // Calculate time remaining until deadline
  private calculateTimeLeft(deadline: string): string {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Deadline passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  // Email delivery implementation
  private async sendEmail(context: NotificationContext): Promise<DeliveryResult> {
    const { trigger, recipient } = context;
    
    if (!recipient.email) {
      return {
        success: false,
        channel: 'email',
        error: 'No email address available',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const subject = this.substituteVariables(trigger.template.subject, context);
      const body = this.substituteVariables(trigger.template.message, context);
      
      // Simulate email sending (in real implementation, integrate with email service)
      const emailData = {
        to: recipient.email,
        subject,
        html: this.generateEmailHTML(subject, body, context),
        text: body,
        metadata: {
          proposalId: context.proposal.id,
          triggerId: trigger.id,
          recipientId: recipient.id
        }
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log for development
      console.log('📧 Email sent:', emailData);
      
      return {
        success: true,
        channel: 'email',
        messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        channel: 'email',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // In-app notification delivery
  private async sendInAppNotification(context: NotificationContext): Promise<DeliveryResult> {
    const { trigger, recipient } = context;
    
    try {
      const title = this.substituteVariables(trigger.template.subject, context);
      const message = this.substituteVariables(trigger.template.message, context);
      
      // Store in-app notification (this would integrate with your notification store)
      const notificationData = {
        id: `inapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        recipientId: recipient.id,
        title,
        message,
        type: 'proposal_deadline',
        urgency: trigger.template.urgency,
        proposalId: context.proposal.id,
        triggerId: trigger.id,
        createdAt: new Date().toISOString(),
        read: false,
        actionUrl: `/proposal/${context.proposal.id}`
      };

      // Add to in-app notifications (this would integrate with your notification system)
      console.log('🔔 In-app notification created:', notificationData);
      
      // Trigger browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          tag: `proposal_${context.proposal.id}`
        });
      }
      
      return {
        success: true,
        channel: 'in_app',
        messageId: notificationData.id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        channel: 'in_app',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // SMS delivery implementation
  private async sendSMS(context: NotificationContext): Promise<DeliveryResult> {
    const { trigger, recipient } = context;
    
    if (!recipient.phoneNumber) {
      return {
        success: false,
        channel: 'sms',
        error: 'No phone number available',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const message = this.substituteVariables(trigger.template.message, context);
      // Truncate SMS messages to 160 characters
      const smsMessage = message.length > 160 ? message.substring(0, 157) + '...' : message;
      
      const smsData = {
        to: recipient.phoneNumber,
        message: smsMessage,
        metadata: {
          proposalId: context.proposal.id,
          triggerId: trigger.id,
          recipientId: recipient.id
        }
      };

      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('📱 SMS sent:', smsData);
      
      return {
        success: true,
        channel: 'sms',
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        channel: 'sms',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Generate HTML email template
  private generateEmailHTML(subject: string, body: string, context: NotificationContext): string {
    const { proposal, recipient } = context;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .progress-bar { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; margin: 15px 0; }
          .progress-fill { background: #10B981; height: 100%; border-radius: 4px; transition: width 0.3s; }
          .stats { display: flex; justify-content: space-between; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #3B82F6; }
          .stat-label { font-size: 12px; color: #6B7280; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">${subject}</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">CF1 Platform Investment Opportunity</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1F2937; margin-top: 0;">${proposal.title}</h2>
            
            <p style="font-size: 16px; color: #4B5563;">${body}</p>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-value">$${proposal.currentFunding.toLocaleString()}</div>
                <div class="stat-label">Current Funding</div>
              </div>
              <div class="stat">
                <div class="stat-value">$${proposal.fundingGoal.toLocaleString()}</div>
                <div class="stat-label">Funding Goal</div>
              </div>
              <div class="stat">
                <div class="stat-value">${Math.round((proposal.currentFunding / proposal.fundingGoal) * 100)}%</div>
                <div class="stat-label">Progress</div>
              </div>
            </div>
            
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min((proposal.currentFunding / proposal.fundingGoal) * 100, 100)}%;"></div>
            </div>
            
            <p style="margin: 20px 0;"><strong>Minimum Investment:</strong> $${proposal.minimumInvestment.toLocaleString()}</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.REACT_APP_BASE_URL || 'https://cf1platform.com'}/proposal/${proposal.id}" class="button">
                View Investment Opportunity
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6B7280; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 30px;">
              <strong>Important:</strong> This investment opportunity is subject to regulations and may only be available to qualified investors. 
              Please review all materials carefully before making any investment decisions.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; font-size: 14px; color: #6B7280;">
              This email was sent by CF1 Platform to ${recipient.email}<br>
              <a href="${process.env.REACT_APP_BASE_URL || 'https://cf1platform.com'}/unsubscribe" style="color: #3B82F6;">Unsubscribe</a> | 
              <a href="${process.env.REACT_APP_BASE_URL || 'https://cf1platform.com'}/preferences" style="color: #3B82F6;">Manage Preferences</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Main notification sending method
  async sendNotification(
    proposal: ProposalData,
    recipients: NotificationRecipient[],
    trigger: NotificationTrigger
  ): Promise<NotificationDelivery[]> {
    const deliveries: NotificationDelivery[] = [];
    
    for (const recipient of recipients) {
      // Check if recipient should receive this notification based on targeting
      if (!this.shouldReceiveNotification(recipient, trigger)) {
        continue;
      }

      const timeLeft = this.calculateTimeLeft(proposal.deadline);
      const fundingProgress = (proposal.currentFunding / proposal.fundingGoal) * 100;
      
      const context: NotificationContext = {
        proposal,
        recipient,
        trigger,
        timeLeft,
        fundingProgress
      };

      const delivery: NotificationDelivery = {
        id: `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        triggerId: trigger.id,
        proposalId: proposal.id,
        recipientId: recipient.id,
        scheduledFor: new Date().toISOString(),
        status: 'pending',
        attempts: 0,
        results: [],
        context
      };

      // Send on each requested channel
      for (const channel of trigger.template.channels) {
        delivery.attempts++;
        
        let result: DeliveryResult;
        switch (channel) {
          case 'email':
            result = await this.sendEmail(context);
            break;
          case 'in_app':
            result = await this.sendInAppNotification(context);
            break;
          case 'sms':
            result = await this.sendSMS(context);
            break;
          default:
            result = {
              success: false,
              channel: channel as any,
              error: 'Unsupported channel',
              timestamp: new Date().toISOString()
            };
        }
        
        delivery.results.push(result);
      }

      // Update delivery status based on results
      const hasSuccess = delivery.results.some(r => r.success);
      delivery.status = hasSuccess ? 'sent' : 'failed';
      delivery.sentAt = hasSuccess ? new Date().toISOString() : undefined;
      
      this.deliveryHistory.set(delivery.id, delivery);
      deliveries.push(delivery);
    }
    
    return deliveries;
  }

  // Check if recipient should receive notification based on targeting rules
  private shouldReceiveNotification(recipient: NotificationRecipient, trigger: NotificationTrigger): boolean {
    const { targeting } = trigger;
    
    switch (targeting.audience) {
      case 'all_investors':
        return true;
      case 'committed_investors':
        return recipient.hasInvested;
      case 'potential_investors':
        return !recipient.hasInvested;
      case 'specific_segments':
        // This would check against actual segment data
        return true; // Simplified for now
      default:
        return false;
    }
  }

  // Get delivery history
  getDeliveryHistory(proposalId?: string): NotificationDelivery[] {
    const deliveries = Array.from(this.deliveryHistory.values());
    return proposalId 
      ? deliveries.filter(d => d.proposalId === proposalId)
      : deliveries;
  }

  // Test notification sending
  async sendTestNotification(
    trigger: NotificationTrigger,
    testRecipient: NotificationRecipient
  ): Promise<NotificationDelivery> {
    const mockProposal: ProposalData = {
      id: 'test-proposal-123',
      title: 'Test Real Estate Investment',
      creatorName: 'Test Creator',
      fundingGoal: 1000000,
      currentFunding: 750000,
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
      minimumInvestment: 10000,
      description: 'This is a test investment opportunity for notification testing.',
      assetType: 'Real Estate'
    };

    const deliveries = await this.sendNotification(mockProposal, [testRecipient], trigger);
    return deliveries[0];
  }

  // Add webhook for external integrations
  addWebhook(url: string): void {
    this.webhooks.push(url);
  }

  // Remove webhook
  removeWebhook(url: string): void {
    this.webhooks = this.webhooks.filter(w => w !== url);
  }

  // Send webhook notifications for external systems
  private async sendWebhook(delivery: NotificationDelivery): Promise<void> {
    for (const webhookUrl of this.webhooks) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'notification_sent',
            delivery,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Webhook delivery failed:', error);
      }
    }
  }

  // Proposal status change notifications
  async onProposalApproved(proposalId: string, assetName: string): Promise<void> {
    try {
      console.log(`📢 Proposal approved: ${assetName} (${proposalId})`);
      
      // TODO: In a real implementation, this would:
      // 1. Fetch proposal details from the backend
      // 2. Get list of interested investors/followers
      // 3. Send approval notifications
      
      // For now, just log the event
      console.log(`✅ Approval notifications sent for proposal: ${proposalId}`);
    } catch (error) {
      console.error('Failed to send proposal approval notifications:', error);
    }
  }

  async onProposalRejected(proposalId: string, assetName: string, comments?: string): Promise<void> {
    try {
      console.log(`❌ Proposal rejected: ${assetName} (${proposalId})`);
      if (comments) {
        console.log(`Rejection reason: ${comments}`);
      }
      
      // TODO: In a real implementation, this would:
      // 1. Fetch proposal creator details
      // 2. Send rejection notification with feedback
      // 3. Notify any interested investors
      
      // For now, just log the event
      console.log(`📧 Rejection notifications sent for proposal: ${proposalId}`);
    } catch (error) {
      console.error('Failed to send proposal rejection notifications:', error);
    }
  }

  async onChangesRequested(proposalId: string, assetName: string, comments?: string): Promise<void> {
    try {
      console.log(`📝 Changes requested for proposal: ${assetName} (${proposalId})`);
      if (comments) {
        console.log(`Requested changes: ${comments}`);
      }
      
      // TODO: In a real implementation, this would:
      // 1. Fetch proposal creator details
      // 2. Send change request notification with feedback
      
      // For now, just log the event
      console.log(`📧 Change request notifications sent for proposal: ${proposalId}`);
    } catch (error) {
      console.error('Failed to send proposal change request notifications:', error);
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();
export default notificationService;