/**
 * Test utility to manually approve proposals for testing the Launchpad integration
 * This simulates the admin approval process
 */

import { useSubmissionStore } from '../store/submissionStore';

export const approveProposal = (proposalId: string, comments: string = 'Proposal approved for testing purposes') => {
  const { updateSubmissionStatus } = useSubmissionStore.getState();
  updateSubmissionStatus(proposalId, 'approved', comments);
  console.log(`✅ Proposal ${proposalId} approved and should now appear in All Proposals`);
};

export const getAllSubmissions = () => {
  const { submissions } = useSubmissionStore.getState();
  return submissions;
};

export const getSubmissionsByStatus = (status: string) => {
  const { getSubmissionsByStatus } = useSubmissionStore.getState();
  return getSubmissionsByStatus(status as any);
};

// Helper to approve the most recent submitted proposal
export const approveLatestProposal = () => {
  const { submissions, updateSubmissionStatus } = useSubmissionStore.getState();
  const submittedProposals = submissions.filter(s => s.status === 'submitted' || s.status === 'under_review');
  
  if (submittedProposals.length > 0) {
    const latest = submittedProposals[0];
    updateSubmissionStatus(latest.id, 'approved', 'Auto-approved for testing');
    console.log(`✅ Auto-approved latest proposal: ${latest.assetName} (${latest.id})`);
    console.log('🔄 Refresh the Launchpad page to see it in All Proposals');
    return latest;
  } else {
    console.log('❌ No submitted or under_review proposals found to approve');
    console.log('💡 Create a proposal first, then run this function');
    return null;
  }
};

// Helper to approve ALL pending proposals
export const approveAllPendingProposals = () => {
  const { submissions, updateSubmissionStatus } = useSubmissionStore.getState();
  const pendingProposals = submissions.filter(s => s.status === 'submitted' || s.status === 'under_review' || s.status === 'changes_requested');
  
  if (pendingProposals.length > 0) {
    pendingProposals.forEach(proposal => {
      updateSubmissionStatus(proposal.id, 'approved', 'Bulk auto-approved for testing');
      console.log(`✅ Approved: ${proposal.assetName}`);
    });
    console.log(`\n🎉 Approved ${pendingProposals.length} proposal(s)!`);
    console.log('🔄 Refresh the Launchpad page to see them in All Proposals');
    return pendingProposals;
  } else {
    console.log('❌ No pending proposals found to approve');
    return [];
  }
};

// Debug function to see all proposals and their statuses
export const debugProposals = () => {
  const { submissions } = useSubmissionStore.getState();
  console.log('📋 All Proposals in Store:');
  console.log('Total submissions:', submissions.length);
  
  const statusGroups = {
    approved: [],
    submitted: [],
    under_review: [],
    draft: [],
    rejected: [],
    changes_requested: []
  };
  
  submissions.forEach(submission => {
    console.log(`  ${submission.status.toUpperCase()}: ${submission.assetName} (${submission.id})`);
    if (statusGroups[submission.status]) {
      statusGroups[submission.status].push(submission);
    }
  });
  
  console.log('\n📊 Status Summary:');
  Object.entries(statusGroups).forEach(([status, items]) => {
    console.log(`  ${status.toUpperCase()}: ${items.length}`);
  });
  
  const approved = statusGroups.approved;
  console.log(`\n✅ ${approved.length} approved proposals should appear in Launchpad`);
  
  if (approved.length > 0) {
    console.log('\n🎯 Approved proposals details:');
    approved.forEach((submission, index) => {
      console.log(`  ${index + 1}. ${submission.assetName}`);
      console.log(`     - Category: ${submission.category}`);
      console.log(`     - Target: ${submission.targetAmount}`);
      console.log(`     - APY: ${submission.expectedAPY}%`);
      console.log(`     - Deadline: ${submission.fundingDeadline}`);
    });
  }
  
  return { 
    total: submissions.length, 
    ...Object.fromEntries(Object.entries(statusGroups).map(([status, items]) => [status, items.length]))
  };
};

// Make these available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testProposalFlow = {
    approveProposal,
    approveLatestProposal,
    approveAllPendingProposals,
    getAllSubmissions,
    getSubmissionsByStatus,
    debugProposals
  };
  
  console.log('🛠️ Test utilities loaded! Use window.testProposalFlow in browser console');
  console.log('📝 Available functions:');
  console.log('  - debugProposals() - See all proposals and their statuses');
  console.log('  - approveLatestProposal() - Approve most recent submitted proposal');
  console.log('  - approveAllPendingProposals() - Approve all pending proposals');
  console.log('  - approveProposal(id) - Approve specific proposal by ID');
}