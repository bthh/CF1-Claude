/**
 * CF1 Backend - Governance Routes
 * Handles governance proposal management and voting
 */

import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// Mock governance proposals storage (in production, use a database)
const governanceProposals = new Map<string, any>();
const votes = new Map<string, any[]>();

// Initialize some mock governance proposals
const mockGovernanceProposals = [
  {
    id: '1',
    title: 'Increase Asset Management Fee to 3%',
    description: 'Proposal to increase the annual asset management fee from 2% to 3% to cover increased operational costs and compliance requirements.',
    proposer: 'creator_wallet_address',
    assetId: '1',
    type: 'fee_change',
    status: 'active',
    votingPeriod: {
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      duration: 7 // days
    },
    voting: {
      totalVotes: 15000,
      yesVotes: 8500,
      noVotes: 6500,
      participationRate: 45.2,
      quorumRequired: 30,
      majorityRequired: 60,
      currentResult: 'leading_yes'
    },
    proposalData: {
      currentFee: '2%',
      proposedFee: '3%',
      effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reasoning: 'Increased regulatory compliance costs and enhanced asset management services'
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Approve Emergency Maintenance Fund',
    description: 'Proposal to establish a $50,000 emergency maintenance fund for critical building repairs and unexpected expenses.',
    proposer: 'creator_wallet_address',
    assetId: '1',
    type: 'fund_allocation',
    status: 'active',
    votingPeriod: {
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
      duration: 7 // days
    },
    voting: {
      totalVotes: 8200,
      yesVotes: 7100,
      noVotes: 1100,
      participationRate: 24.7,
      quorumRequired: 30,
      majorityRequired: 60,
      currentResult: 'leading_yes'
    },
    proposalData: {
      fundAmount: '$50,000',
      fundSource: 'Reserve funds',
      approvalThreshold: '$10,000 per expense',
      reasoning: 'Proactive maintenance to protect asset value and tenant satisfaction'
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize mock data
mockGovernanceProposals.forEach(proposal => {
  governanceProposals.set(proposal.id, proposal);
});

/**
 * GET /api/v1/governance/proposals
 * Get all governance proposals
 */
router.get('/proposals', (req: Request, res: Response) => {
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
router.post('/proposals/:id/admin/simulate-pass', (req: Request, res: Response) => {
  const proposalId = req.params.id;
  
  // TODO: Add proper admin authentication middleware
  // For now, accepting the admin call directly
  
  console.log(`🚀 Admin Simulate Pass triggered for governance proposal ${proposalId}`);
  
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
        const currentNoVotes = proposal.voting.noVotes;
        
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