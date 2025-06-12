import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useGovernanceStore } from '../store/governanceStore';
import { useSubmissionStore } from '../store/submissionStore';

interface StatusChange {
  id: string;
  type: 'governance' | 'submission';
  oldStatus: string;
  newStatus: string;
  title: string;
  timestamp: number;
}

export const useRealTimeUpdates = () => {
  const { info, success, warning } = useNotifications();
  const { proposals } = useGovernanceStore();
  const { submissions } = useSubmissionStore();
  
  const previousStatesRef = useRef<{
    governance: Map<string, string>;
    submissions: Map<string, string>;
  }>({
    governance: new Map(),
    submissions: new Map()
  });
  
  const lastUpdateRef = useRef<number>(Date.now());
  
  const handleStatusChange = useCallback((change: StatusChange) => {
    const timeSinceLastUpdate = Date.now() - lastUpdateRef.current;
    
    // Only show notifications for changes that happened recently (within last 30 seconds)
    // This prevents showing notifications for initial load
    if (timeSinceLastUpdate < 30000) {
      return;
    }
    
    if (change.type === 'governance') {
      handleGovernanceStatusChange(change);
    } else if (change.type === 'submission') {
      handleSubmissionStatusChange(change);
    }
  }, [info, success, warning]);
  
  const handleGovernanceStatusChange = (change: StatusChange) => {
    switch (change.newStatus) {
      case 'passed':
        success(
          'Proposal Passed!',
          `"${change.title}" has been approved by the community.`,
          {
            duration: 8000,
            actionLabel: 'View Details',
            onAction: () => window.location.href = `/governance/proposal/${change.id}`
          }
        );
        break;
      case 'rejected':
        warning(
          'Proposal Rejected',
          `"${change.title}" did not receive enough votes to pass.`,
          {
            duration: 6000,
            actionLabel: 'View Details',
            onAction: () => window.location.href = `/governance/proposal/${change.id}`
          }
        );
        break;
      case 'active':
        if (change.oldStatus === 'pending') {
          info(
            'Voting Now Open',
            `"${change.title}" is now open for voting.`,
            {
              duration: 6000,
              actionLabel: 'Vote Now',
              onAction: () => window.location.href = `/governance/proposal/${change.id}`
            }
          );
        }
        break;
    }
  };
  
  const handleSubmissionStatusChange = (change: StatusChange) => {
    switch (change.newStatus) {
      case 'approved':
        success(
          'Proposal Approved!',
          `Your submission "${change.title}" has been approved and will go live soon.`,
          {
            duration: 10000,
            actionLabel: 'View Submission',
            onAction: () => window.location.href = '/my-submissions'
          }
        );
        break;
      case 'rejected':
        warning(
          'Proposal Needs Changes',
          `Your submission "${change.title}" requires revisions before approval.`,
          {
            duration: 8000,
            actionLabel: 'View Feedback',
            onAction: () => window.location.href = '/my-submissions'
          }
        );
        break;
      case 'under_review':
        if (change.oldStatus === 'submitted') {
          info(
            'Review Started',
            `Your submission "${change.title}" is now under review.`,
            {
              duration: 6000,
              actionLabel: 'Track Progress',
              onAction: () => window.location.href = '/my-submissions'
            }
          );
        }
        break;
      case 'changes_requested':
        warning(
          'Changes Requested',
          `Please address the feedback for "${change.title}" and resubmit.`,
          {
            persistent: true,
            actionLabel: 'View Feedback',
            onAction: () => window.location.href = '/my-submissions'
          }
        );
        break;
    }
  };
  
  const checkForUpdates = useCallback(() => {
    const currentStates = {
      governance: new Map<string, string>(),
      submissions: new Map<string, string>()
    };
    
    // Check governance proposals
    proposals.forEach(proposal => {
      currentStates.governance.set(proposal.id, proposal.status);
      
      const previousStatus = previousStatesRef.current.governance.get(proposal.id);
      if (previousStatus && previousStatus !== proposal.status) {
        handleStatusChange({
          id: proposal.id,
          type: 'governance',
          oldStatus: previousStatus,
          newStatus: proposal.status,
          title: proposal.title,
          timestamp: Date.now()
        });
      }
    });
    
    // Check submission proposals
    submissions.forEach(submission => {
      currentStates.submissions.set(submission.id, submission.status);
      
      const previousStatus = previousStatesRef.current.submissions.get(submission.id);
      if (previousStatus && previousStatus !== submission.status) {
        handleStatusChange({
          id: submission.id,
          type: 'submission',
          oldStatus: previousStatus,
          newStatus: submission.status,
          title: submission.assetName,
          timestamp: Date.now()
        });
      }
    });
    
    // Update previous states
    previousStatesRef.current = currentStates;
    lastUpdateRef.current = Date.now();
  }, [proposals, submissions, handleStatusChange]);
  
  const simulateStatusChange = useCallback(() => {
    // Simulate random status changes for demonstration
    // In a real app, this would be replaced by WebSocket connections or polling
    
    if (Math.random() < 0.1) { // 10% chance per check
      const allProposals = [...proposals, ...submissions];
      if (allProposals.length > 0) {
        const randomProposal = allProposals[Math.floor(Math.random() * allProposals.length)];
        
        if ('votesFor' in randomProposal) {
          // Governance proposal
          const possibleStatuses = ['active', 'passed', 'rejected'];
          const newStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
          
          if (newStatus !== randomProposal.status) {
            handleStatusChange({
              id: randomProposal.id,
              type: 'governance',
              oldStatus: randomProposal.status,
              newStatus,
              title: randomProposal.title,
              timestamp: Date.now()
            });
          }
        } else {
          // Submission proposal
          const possibleStatuses = ['under_review', 'approved', 'rejected', 'changes_requested'];
          const newStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
          
          if (newStatus !== randomProposal.status) {
            handleStatusChange({
              id: randomProposal.id,
              type: 'submission',
              oldStatus: randomProposal.status,
              newStatus,
              title: randomProposal.assetName,
              timestamp: Date.now()
            });
          }
        }
      }
    }
  }, [proposals, submissions, handleStatusChange]);
  
  useEffect(() => {
    // Initialize previous states on first load
    const initialStates = {
      governance: new Map<string, string>(),
      submissions: new Map<string, string>()
    };
    
    proposals.forEach(proposal => {
      initialStates.governance.set(proposal.id, proposal.status);
    });
    
    submissions.forEach(submission => {
      initialStates.submissions.set(submission.id, submission.status);
    });
    
    previousStatesRef.current = initialStates;
    lastUpdateRef.current = Date.now();
  }, []);
  
  useEffect(() => {
    // Check for updates every 10 seconds
    const interval = setInterval(() => {
      checkForUpdates();
      
      // Simulate status changes in development
      if (process.env.NODE_ENV === 'development') {
        simulateStatusChange();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [checkForUpdates, simulateStatusChange]);
  
  return {
    checkForUpdates,
    // For manual testing in development
    simulateChange: process.env.NODE_ENV === 'development' ? simulateStatusChange : undefined
  };
};