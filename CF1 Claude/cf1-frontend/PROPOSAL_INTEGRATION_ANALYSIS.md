# CF1 Proposal Lifecycle & Auto-Communication Integration Analysis

## Overview

This document analyzes the existing proposal data structures and stores in the CF1 platform to enable integration of the auto-communication system with real proposal data instead of the current mock implementation.

## Current Proposal Data Architecture

### 1. Frontend Proposal Store (`proposalStore.ts`)

**Primary Interface:**
```typescript
interface Proposal {
  id: string;
  asset_details: {
    name: string;
    asset_type: string;
    category: string;
    location: string;
    description: string;
  };
  financial_terms: {
    target_amount: string;
    token_price: string;
    total_shares: number;
    minimum_investment: string;
    expected_apy: string;
    funding_deadline: number; // Unix timestamp
  };
  funding_status: {
    raised_amount: string;
    investor_count: number;
    is_funded: boolean;
    tokens_minted: boolean;
  };
  status: 'Active' | 'Funded' | 'Expired' | 'Cancelled';
  creator: string;
  created_at: string;
}
```

**Key Data Points for Notifications:**
- `funding_deadline`: Critical for time-based notifications
- `funding_status.raised_amount`: For milestone-based notifications
- `financial_terms.target_amount`: For calculating funding percentage
- `status`: For determining if notifications should still be sent

### 2. Submission Store (`submissionStore.ts`)

**Interface:**
```typescript
interface SubmittedProposal {
  id: string;
  submissionDate: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'changes_requested' | 'draft';
  
  // Asset & Financial Details
  assetName: string;
  targetAmount: string;
  expectedAPY: string;
  fundingDeadline: string; // ISO date string
  
  // Review Process
  reviewComments?: string;
  reviewDate?: string;
  estimatedReviewDate?: string;
  
  // Funding Status (for approved proposals)
  fundingStatus?: {
    raisedAmount: number;
    raisedPercentage: number;
    investorCount: number;
    isFunded: boolean;
    status: 'active' | 'funded' | 'upcoming';
  };
}
```

**Lifecycle Stages:**
1. `draft` → User saves incomplete proposal
2. `submitted` → User submits for review
3. `under_review` → Admin reviewing
4. `approved` → Moves to active funding
5. `rejected` / `changes_requested` → Needs attention

### 3. Backend Proposal Routes (`proposals.ts`)

**API Endpoints:**
- `GET /api/v1/proposals` - List all proposals
- `GET /api/v1/proposals/:id` - Get specific proposal
- `POST /api/v1/proposals` - Create new proposal
- `POST /api/v1/proposals/:id/invest` - Process investment
- `POST /api/v1/proposals/sync-submission` - Sync approved submissions

**Backend Data Structure:**
```typescript
interface BackendProposal {
  id: string;
  asset_details: { name, asset_type, category, location, description };
  financial_terms: {
    target_amount: number;
    token_price: number;
    total_shares: number;
    minimum_investment: number;
    expected_apy: number;
    funding_deadline: string;
  };
  funding_status: {
    raised_amount: number;
    investor_count: number;
    is_funded: boolean;
    tokens_minted: boolean;
  };
  status: 'Active' | 'Funded' | 'Expired' | 'Cancelled';
}
```

### 4. Governance Store (`governanceStore.ts`)

**Interface for governance proposals:**
```typescript
interface GovernanceProposal {
  id: string;
  title: string;
  assetId: string; // Links to main proposals
  proposalType: 'dividend' | 'renovation' | 'sale' | 'management' | 'expansion';
  status: 'active' | 'passed' | 'rejected' | 'pending' | 'draft';
  endDate: string;
  votingDuration: number; // in days
}
```

## Current Auto-Communication System

### Key Components:

1. **Auto-Communication Store** (`autoCommunicationStore.ts`)
   - Platform-level defaults
   - Creator-specific configurations  
   - Proposal-specific overrides
   - Notification triggers and templates

2. **Notification Scheduler** (`notificationScheduler.ts`)
   - Schedules time-based notifications
   - Executes milestone-based checks
   - Manages recurring notifications
   - Currently uses mock proposal data

3. **Notification Service** (`notificationService.ts`)
   - Handles actual notification delivery
   - Manages delivery history
   - Supports multiple channels (email, in-app, SMS)

## Integration Opportunities

### 1. Replace Mock Data with Real Proposal Data

**Current Issue:**
```typescript
// In notificationScheduler.ts line 295-309
private async getProposalData(proposalId: string): Promise<ProposalData | null> {
  // Mock data - needs to be replaced
  return {
    id: proposalId,
    title: 'Mock Proposal for Testing',
    // ... more mock data
  };
}
```

**Solution:**
Integrate with actual proposal stores:

```typescript
private async getProposalData(proposalId: string): Promise<ProposalData | null> {
  // Try frontend proposal store first
  const frontendProposal = useProposalStore.getState().proposals.find(p => p.id === proposalId);
  if (frontendProposal) {
    return this.convertFrontendProposal(frontendProposal);
  }
  
  // Try submission store
  const submission = useSubmissionStore.getState().getSubmissionById(proposalId);
  if (submission && submission.status === 'approved') {
    return this.convertSubmissionToProposal(submission);
  }
  
  // Fallback to backend API
  try {
    const response = await fetch(`/api/v1/proposals/${proposalId}`);
    const result = await response.json();
    if (result.success) {
      return this.convertBackendProposal(result.data);
    }
  } catch (error) {
    console.error('Failed to fetch proposal from backend:', error);
  }
  
  return null;
}
```

### 2. Proposal Lifecycle Integration Points

**A. Proposal Creation (CreateProposal.tsx)**
```typescript
// In handleSubmit function, after successful submission:
const result = await createProposal(submissionData);
if (result.success && result.data) {
  // Schedule notifications for the new proposal
  notificationScheduler.scheduleProposalNotifications(
    convertToProposalData(result.data),
    creatorId,
    getProposalRecipients(result.data.id)
  );
}
```

**B. Submission Approval (Admin flows)**
```typescript
// When admin approves a submission:
updateSubmissionStatus(id, 'approved', comments);

// Schedule notifications
const proposal = getSubmissionById(id);
if (proposal) {
  notificationScheduler.scheduleProposalNotifications(
    convertSubmissionToProposalData(proposal),
    proposal.creatorId,
    getProposalRecipients(proposal.id)
  );
}
```

**C. Investment Processing**
```typescript
// When investments are made:
const investment = await investInProposal(proposalId, amount, investorAddress);
if (investment.success) {
  // Check for milestone notifications
  notificationScheduler.checkMilestoneNotifications(proposalId);
}
```

**D. Proposal Status Changes**
```typescript
// When proposal status changes:
const updateProposalStatus = (id: string, newStatus: string) => {
  // Update store
  setProposals(prev => prev.map(p => 
    p.id === id ? { ...p, status: newStatus } : p
  ));
  
  // Cancel notifications if proposal is no longer active
  if (newStatus === 'Funded' || newStatus === 'Expired' || newStatus === 'Cancelled') {
    notificationScheduler.cancelProposalNotifications(id);
  }
};
```

### 3. Data Transformation Functions

Need utility functions to convert between different data formats:

```typescript
// Convert frontend proposal to notification data
function convertFrontendProposal(proposal: Proposal): ProposalData {
  return {
    id: proposal.id,
    title: proposal.asset_details.name,
    creatorName: proposal.creator,
    fundingGoal: parseFloat(proposal.financial_terms.target_amount.replace(/[^\d.]/g, '')),
    currentFunding: parseFloat(proposal.funding_status.raised_amount.replace(/[^\d.]/g, '')),
    deadline: new Date(proposal.financial_terms.funding_deadline * 1000).toISOString(),
    minimumInvestment: parseFloat(proposal.financial_terms.minimum_investment.replace(/[^\d.]/g, '')),
    description: proposal.asset_details.description,
    assetType: proposal.asset_details.asset_type
  };
}

// Convert submission to notification data
function convertSubmissionToProposal(submission: SubmittedProposal): ProposalData {
  return {
    id: submission.id,
    title: submission.assetName,
    creatorName: 'Creator', // Would need to be fetched
    fundingGoal: parseFloat(submission.targetAmount.replace(/[^\d.]/g, '')),
    currentFunding: submission.fundingStatus?.raisedAmount || 0,
    deadline: submission.fundingDeadline,
    minimumInvestment: parseFloat(submission.minimumInvestment || '0'),
    description: submission.description,
    assetType: submission.assetType
  };
}
```

### 4. Enhanced Milestone Detection

Current milestone checking is basic. Can be enhanced with real data:

```typescript
// Enhanced milestone checking
private async checkMilestoneNotifications(proposalId: string): Promise<void> {
  const proposal = await this.getProposalData(proposalId);
  if (!proposal) return;
  
  const fundingProgress = (proposal.currentFunding / proposal.fundingGoal) * 100;
  const store = useAutoCommunicationStore.getState();
  
  // Check all milestone triggers
  const milestoneStatuses = [
    { threshold: 25, triggered: false },
    { threshold: 50, triggered: false }, 
    { threshold: 75, triggered: false },
    { threshold: 90, triggered: false },
    { threshold: 100, triggered: false }
  ];
  
  for (const milestone of milestoneStatuses) {
    if (fundingProgress >= milestone.threshold && !milestone.triggered) {
      // Find relevant triggers
      const triggers = this.getTriggersForMilestone(milestone.threshold);
      
      for (const trigger of triggers) {
        if (trigger.enabled) {
          await this.executeMilestoneNotification(proposal, trigger, milestone.threshold);
        }
      }
      
      milestone.triggered = true;
    }
  }
}
```

### 5. Real-time Integration with Proposal Updates

**A. Listen to Proposal Store Changes:**
```typescript
// In notification scheduler initialization
useProposalStore.subscribe((state, prevState) => {
  // Check for funding status changes
  state.proposals.forEach(proposal => {
    const prevProposal = prevState.proposals.find(p => p.id === proposal.id);
    if (prevProposal && prevProposal.funding_status.raised_amount !== proposal.funding_status.raised_amount) {
      // Funding amount changed - check milestones
      this.checkMilestoneNotifications(proposal.id);
    }
    
    if (prevProposal && prevProposal.status !== proposal.status) {
      // Status changed - handle accordingly
      this.handleProposalStatusChange(proposal.id, proposal.status);
    }
  });
});
```

**B. Integration with Real-time Updates:**
```typescript
// If using WebSocket/EventSource for real-time updates
const eventSource = new EventSource('/api/events');
eventSource.addEventListener('proposal_updated', (event) => {
  const { proposalId, updateType, data } = JSON.parse(event.data);
  
  switch (updateType) {
    case 'investment_made':
      notificationScheduler.checkMilestoneNotifications(proposalId);
      break;
    case 'deadline_changed':
      notificationScheduler.updateProposalSchedule(data.proposal, data.creatorId, data.recipients);
      break;
    case 'status_changed':
      if (data.status === 'Funded' || data.status === 'Expired') {
        notificationScheduler.cancelProposalNotifications(proposalId);
      }
      break;
  }
});
```

## Implementation Roadmap

### Phase 1: Data Integration
1. ✅ Analyze existing proposal data structures
2. Create data transformation utilities
3. Replace mock data in notificationScheduler.ts
4. Test with real proposal data

### Phase 2: Lifecycle Integration  
1. Add notification scheduling to proposal creation flow
2. Integrate with submission approval process
3. Connect investment processing to milestone checks
4. Handle proposal status changes

### Phase 3: Real-time Enhancement
1. Add real-time proposal update listeners
2. Implement dynamic schedule updates
3. Enhanced milestone detection
4. Performance optimization

### Phase 4: Advanced Features
1. Creator-specific notification preferences
2. Investor communication preferences
3. Analytics and reporting
4. A/B testing for notification effectiveness

## Key Files to Modify

1. **`/src/services/notificationScheduler.ts`**
   - Replace mock getProposalData function
   - Add real-time update listeners
   - Enhanced milestone checking

2. **`/src/pages/CreateProposal.tsx`** 
   - Add notification scheduling to submission flow

3. **`/src/store/submissionStore.ts`**
   - Add notification scheduling to approval process

4. **`/src/store/proposalStore.ts`**
   - Add hooks for notification system

5. **New file: `/src/services/proposalDataAdapter.ts`**
   - Data transformation utilities
   - Unified proposal data interface

6. **New file: `/src/hooks/useProposalNotifications.ts`**
   - React hook for managing proposal notifications
   - Integration with proposal lifecycle

## Conclusion

The CF1 platform has a well-structured proposal lifecycle with multiple data stores tracking different stages. The auto-communication system can be seamlessly integrated by:

1. Replacing mock data with real proposal data from stores/API
2. Adding notification scheduling at key lifecycle points
3. Implementing real-time updates for dynamic schedule management
4. Creating unified data transformation utilities

This integration will enable the auto-communication system to work with actual proposal deadlines, funding progress, and status changes, providing meaningful and timely notifications to users based on real platform activity.