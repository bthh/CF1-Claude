/**
 * CF1 Backend - Governance Routes
 * Handles governance proposal management and voting
 */

import express from 'express';
import { Request, Response } from 'express';
import { requireAdmin, requirePermission, logAdminOperation, AdminAuthenticatedRequest } from '../middleware/adminAuth';

const router = express.Router();

// Mock governance proposals storage (in production, use a database)
const governanceProposals = new Map<string, any>();
const votes = new Map<string, any[]>();

// Production governance proposals start empty - no mock data
// Proposals are added only through legitimate API calls

/**
 * GET /api/v1/governance/proposals
 * Get all governance proposals
 */
router.get('/proposals', (_req: Request, res: Response) => {
  const proposalsArray = Array.from(governanceProposals.values());
  
  res.json({
    success: true,
    data: proposalsArray,
    count: proposalsArray.length
  });
});

/**
 * GET /api/v1/governance/proposals/:id
 * Get a specific governance proposal
 */
router.get('/proposals/:id', (req: Request, res: Response) => {
  const proposalId = req.params.id;
  
  if (!governanceProposals.has(proposalId)) {
    return res.status(404).json({
      success: false,
      error: 'Governance proposal not found'
    });
  }
  
  const proposal = governanceProposals.get(proposalId);
  
  res.json({
    success: true,
    data: proposal
  });
});

/**
 * POST /api/v1/governance/proposals/:id/admin/simulate-pass
 * Admin shortcut to simulate passing a governance proposal for testing
 */
router.post('/proposals/:id/admin/simulate-pass', 
  requireAdmin,
  requirePermission('governance'),
  logAdminOperation,
  (req: AdminAuthenticatedRequest, res: Response) => {
    const proposalId = req.params.id;
    
    console.log(`🚀 Admin ${req.adminUser?.username} simulating pass for governance proposal ${proposalId}`);
  
  if (!governanceProposals.has(proposalId)) {
    return res.status(404).json({
      success: false,
      error: 'Governance proposal not found'
    });
  }
  
  const proposal = governanceProposals.get(proposalId)!;
  
  // Check if proposal is in active state
  if (proposal.status !== 'active') {
    return res.status(400).json({
      success: false,
      error: `Cannot simulate pass for proposal in ${proposal.status} state. Only active proposals can be passed.`
    });
  }
  
  try {
    // Calculate required votes to pass
    const quorumRequired = proposal.voting.quorumRequired; // 30%
    const majorityRequired = proposal.voting.majorityRequired; // 60%
    const totalTokens = 33000; // Mock total token supply for the asset
    
    const minVotesForQuorum = Math.ceil(totalTokens * (quorumRequired / 100));
    const currentTotalVotes = proposal.voting.totalVotes;
    
    console.log(`Current votes: ${currentTotalVotes}, Quorum needed: ${minVotesForQuorum}`);
    
    // Add enough mock votes to reach quorum and pass
    let additionalYesVotes = 0;
    let additionalTotalVotes = 0;
    
    if (currentTotalVotes < minVotesForQuorum) {
      // Need to reach quorum first
      additionalTotalVotes = minVotesForQuorum - currentTotalVotes + 1000; // Add extra buffer
      additionalYesVotes = Math.ceil(additionalTotalVotes * 0.75); // 75% yes votes
    } else {
      // Already have quorum, just need majority
      const currentYesPercentage = (proposal.voting.yesVotes / currentTotalVotes) * 100;
      if (currentYesPercentage < majorityRequired) {
        // Calculate exact number of yes votes needed to reach majority requirement plus buffer
        const targetPercentage = majorityRequired + 5; // Add 5% buffer (65% total)
        // const _currentNoVotes = proposal.voting.noVotes;
        
        // We need: yesVotes / totalVotes >= targetPercentage/100
        // Rearranging: yesVotes >= (targetPercentage/100) * totalVotes
        // Where totalVotes = currentYes + currentNo + additionalYes + additionalNo
        // To guarantee success, we'll only add yes votes (additionalNo = 0)
        
        const requiredYesVotes = Math.ceil((currentTotalVotes + 1000) * (targetPercentage / 100));
        additionalYesVotes = Math.max(requiredYesVotes - proposal.voting.yesVotes, 1000);
        additionalTotalVotes = additionalYesVotes; // Only adding yes votes
      }
    }
    
    // Create mock votes
    const mockVotes = [];
    for (let i = 0; i < additionalTotalVotes; i++) {
      const vote = {
        proposalId,
        voterAddress: `admin_mock_voter_${i}`,
        vote: i < additionalYesVotes ? 'yes' : 'no',
        tokens: Math.floor(Math.random() * 1000) + 100, // Random token weight
        timestamp: new Date().toISOString(),
        reason: i < additionalYesVotes ? 'Admin simulation - supporting proposal' : 'Admin simulation - opposing proposal'
      };
      mockVotes.push(vote);
    }
    
    // Add votes to storage
    if (!votes.has(proposalId)) {
      votes.set(proposalId, []);
    }
    votes.get(proposalId)!.push(...mockVotes);
    
    // Update proposal voting status
    proposal.voting.totalVotes += additionalTotalVotes;
    proposal.voting.yesVotes += additionalYesVotes;
    proposal.voting.noVotes += (additionalTotalVotes - additionalYesVotes);
    proposal.voting.participationRate = (proposal.voting.totalVotes / totalTokens) * 100;
    
    // Calculate if proposal passes
    const finalYesPercentage = (proposal.voting.yesVotes / proposal.voting.totalVotes) * 100;
    const hasQuorum = proposal.voting.participationRate >= quorumRequired;
    const hasMajority = finalYesPercentage >= majorityRequired;
    
    console.log(`Final results: Participation: ${proposal.voting.participationRate.toFixed(1)}%, Yes: ${finalYesPercentage.toFixed(1)}%`);
    console.log(`Quorum met: ${hasQuorum}, Majority met: ${hasMajority}`);
    
    // *** CRITICAL: Trigger state transition to Passed ***
    if (hasQuorum && hasMajority) {
      proposal.status = 'passed';
      proposal.voting.currentResult = 'passed';
      console.log(`✅ Governance proposal ${proposalId} status changed to: ${proposal.status}`);
    } else {
      proposal.status = 'rejected';
      proposal.voting.currentResult = 'rejected';
      console.log(`❌ Governance proposal ${proposalId} status changed to: ${proposal.status}`);
    }
    
    // Update timestamps
    proposal.updatedAt = new Date().toISOString();
    proposal.votingPeriod.endDate = new Date().toISOString(); // Mark as concluded
    
    // Update the proposals map
    governanceProposals.set(proposalId, proposal);
    
    // TODO: In production, trigger additional workflows:
    // - Execute proposal actions
    // - Send notifications to token holders
    // - Schedule implementation
    // - Update asset parameters if applicable
    
    res.json({
      success: true,
      message: `Governance proposal ${proposal.status} by admin simulation`,
      data: {
        proposalId,
        status: proposal.status,
        voting: proposal.voting,
        mockVotesAdded: mockVotes.length,
        finalResult: proposal.voting.currentResult
      }
    });
    
  } catch (error) {
    console.error('Error in simulate pass:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate governance proposal pass',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/governance/proposals/:id/vote
 * Submit a vote on a governance proposal
 */
router.post('/proposals/:id/vote', (req: Request, res: Response) => {
  const proposalId = req.params.id;
  const { voterAddress, vote, tokens, reason } = req.body;
  
  if (!governanceProposals.has(proposalId)) {
    return res.status(404).json({
      success: false,
      error: 'Governance proposal not found'
    });
  }
  
  const proposal = governanceProposals.get(proposalId)!;
  
  if (proposal.status !== 'active') {
    return res.status(400).json({
      success: false,
      error: 'Voting is closed for this proposal'
    });
  }
  
  // Check if voting period is still active
  const now = new Date();
  const endDate = new Date(proposal.votingPeriod.endDate);
  
  if (now > endDate) {
    return res.status(400).json({
      success: false,
      error: 'Voting period has ended'
    });
  }
  
  // Create vote record
  const voteRecord = {
    proposalId,
    voterAddress,
    vote: vote.toLowerCase(),
    tokens: parseInt(tokens),
    timestamp: new Date().toISOString(),
    reason: reason || ''
  };
  
  // Add vote to storage
  if (!votes.has(proposalId)) {
    votes.set(proposalId, []);
  }
  votes.get(proposalId)!.push(voteRecord);
  
  // Update proposal voting statistics
  proposal.voting.totalVotes += voteRecord.tokens;
  if (vote.toLowerCase() === 'yes') {
    proposal.voting.yesVotes += voteRecord.tokens;
  } else {
    proposal.voting.noVotes += voteRecord.tokens;
  }
  
  // Recalculate participation rate (assuming 33000 total tokens)
  const totalTokens = 33000;
  proposal.voting.participationRate = (proposal.voting.totalVotes / totalTokens) * 100;
  
  proposal.updatedAt = new Date().toISOString();
  governanceProposals.set(proposalId, proposal);
  
  res.json({
    success: true,
    message: 'Vote submitted successfully',
    data: {
      vote: voteRecord,
      updatedVoting: proposal.voting
    }
  });
});

export default router;