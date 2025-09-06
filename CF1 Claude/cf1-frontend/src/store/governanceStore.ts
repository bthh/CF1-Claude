import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useDemoModeStore } from './demoModeStore';

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  assetName: string;
  assetType: string;
  assetId: string;
  proposalType: 'dividend' | 'renovation' | 'sale' | 'management' | 'expansion';
  status: 'active' | 'passed' | 'rejected' | 'pending' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'changes_requested';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorumRequired: number;
  timeLeft: string;
  proposedBy: string;
  proposedByAddress: string;
  createdDate: string;
  endDate: string;
  submissionDate: string;
  impact: string;
  requiredAmount?: string;
  rationale: string;
  additionalDetails?: string;
  votingDuration: number; // in days
  
  // Privacy controls for Card 22
  isPrivate: boolean; // Whether this specific proposal is private
  visibilityPolicy?: 'always_private' | 'always_public' | 'creator_decides'; // Asset-level policy
  
  // Additional details for proposal detail page
  detailedBreakdown?: {
    totalRevenue?: string;
    operationalExpenses?: string;
    maintenanceReserve?: string;
    availableForDistribution?: string;
    tokensOutstanding?: number;
    distributionPerToken?: string;
  };
  
  risks?: string[];
  timeline?: Array<{
    date: string;
    event: string;
    status: 'completed' | 'pending';
  }>;
  
  // User-specific data
  userVoted?: 'for' | 'against' | null;
  userVotingPower?: number;
  userTokens?: number;
  userEstimatedDistribution?: number;
  
  // Admin review fields
  reviewComments?: string;
  reviewDate?: string;
  reviewedBy?: string;
}

interface GovernanceState {
  proposals: GovernanceProposal[];
  
  // Actions
  addProposal: (proposalData: Omit<GovernanceProposal, 'id' | 'createdDate' | 'submissionDate' | 'status' | 'votesFor' | 'votesAgainst' | 'totalVotes' | 'endDate' | 'timeLeft' | 'proposedByAddress' | 'proposedBy' | 'quorumRequired'>, userAddress?: string) => { success: boolean; proposalId?: string; error?: string };
  saveDraft: (proposalData: Omit<GovernanceProposal, 'id' | 'createdDate' | 'submissionDate' | 'status' | 'votesFor' | 'votesAgainst' | 'totalVotes' | 'endDate' | 'timeLeft' | 'proposedByAddress' | 'proposedBy' | 'quorumRequired'>) => string;
  submitDraft: (draftId: string) => { success: boolean; proposalId?: string; error?: string };
  updateDraft: (draftId: string, proposalData: Partial<GovernanceProposal>) => void;
  deleteDraft: (draftId: string) => void;
  getDrafts: () => GovernanceProposal[];
  getProposalById: (id: string) => GovernanceProposal | undefined;
  getProposalsByStatus: (status: GovernanceProposal['status']) => GovernanceProposal[];
  getProposalsByType: (type: GovernanceProposal['proposalType']) => GovernanceProposal[];
  voteOnProposal: (proposalId: string, vote: 'for' | 'against', votingPower: number) => boolean;
  updateProposalStatus: (proposalId: string, status: GovernanceProposal['status'], comments?: string) => void;
  getProposalsForAdmin: () => GovernanceProposal[];
  getProposalsForVoting: (userTokenHoldings?: string[]) => GovernanceProposal[];
  approveProposal: (proposalId: string, comments?: string) => void;
  rejectProposal: (proposalId: string, comments?: string) => void;
  requestChanges: (proposalId: string, comments?: string) => void;
  saveReviewComments: (proposalId: string, comments: string) => void;
  resubmitProposal: (proposalId: string, updatedData: Partial<GovernanceProposal>) => { success: boolean; error?: string };
  updateProposalFromSimulate: (proposalId: string, updatedData: { status: GovernanceProposal['status']; votesFor?: number; votesAgainst?: number; totalVotes?: number }) => void;
  syncWithBackend: () => Promise<void>;
  refreshDataForDemoMode: () => void;
}

// Data validation helper
const validateProposalData = (proposal: Partial<GovernanceProposal>): GovernanceProposal => {
  return {
    ...proposal,
    // Ensure all numeric fields have valid defaults
    votesFor: typeof proposal.votesFor === 'number' ? proposal.votesFor : 0,
    votesAgainst: typeof proposal.votesAgainst === 'number' ? proposal.votesAgainst : 0,
    totalVotes: typeof proposal.totalVotes === 'number' ? proposal.totalVotes : 0,
    quorumRequired: typeof proposal.quorumRequired === 'number' ? proposal.quorumRequired : 1000,
    userVotingPower: typeof proposal.userVotingPower === 'number' ? proposal.userVotingPower : 0,
    userTokens: typeof proposal.userTokens === 'number' ? proposal.userTokens : 0,
    userEstimatedDistribution: typeof proposal.userEstimatedDistribution === 'number' ? proposal.userEstimatedDistribution : 0,
    votingDuration: typeof proposal.votingDuration === 'number' ? proposal.votingDuration : 7,
    // Ensure all string fields have valid defaults
    id: proposal.id || '',
    title: proposal.title || '',
    description: proposal.description || '',
    assetName: proposal.assetName || '',
    assetType: proposal.assetType || '',
    assetId: proposal.assetId || '',
    proposalType: proposal.proposalType || 'dividend',
    status: proposal.status || 'draft',
    timeLeft: proposal.timeLeft || '',
    proposedBy: proposal.proposedBy || '',
    proposedByAddress: proposal.proposedByAddress || '',
    createdDate: proposal.createdDate || '',
    endDate: proposal.endDate || '',
    submissionDate: proposal.submissionDate || '',
    impact: proposal.impact || '',
    rationale: proposal.rationale || '',
    // Privacy fields
    isPrivate: typeof proposal.isPrivate === 'boolean' ? proposal.isPrivate : false,
    visibilityPolicy: proposal.visibilityPolicy || 'creator_decides'
  } as GovernanceProposal;
};

// Calculate proposal end date and time left
const calculateProposalTiming = (votingDuration: number) => {
  const now = new Date();
  const endDate = new Date(now.getTime() + votingDuration * 24 * 60 * 60 * 1000);
  
  const timeLeft = votingDuration > 1 ? `${votingDuration} days left` : 
                   votingDuration === 1 ? '1 day left' : 'Ended';
  
  return {
    endDate: endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    timeLeft
  };
};

// Mock initial governance proposals for demonstration
const mockGovernanceProposals: GovernanceProposal[] = [
  {
    id: '1',
    title: 'Q4 Dividend Distribution',
    description: 'Proposal to distribute quarterly dividends of $2.50 per token based on rental income from Manhattan Office Complex.',
    assetName: 'Manhattan Office Complex',
    assetType: 'Commercial Real Estate',
    assetId: 'manhattan-office',
    proposalType: 'dividend',
    status: 'active',
    votesFor: 1247,
    votesAgainst: 156,
    totalVotes: 1403,
    quorumRequired: 1500,
    timeLeft: '5 days left',
    proposedBy: 'Asset Manager',
    proposedByAddress: '0x742d...3B5f',
    createdDate: 'Dec 3, 2024',
    endDate: 'Dec 10, 2024',
    submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    impact: '+$2.50/token',
    requiredAmount: '$625,000',
    rationale: 'The Manhattan Office Complex has generated strong rental income this quarter, with 95% occupancy and rent increases implemented according to lease agreements.',
    votingDuration: 7,
    detailedBreakdown: {
      totalRevenue: '$850,000',
      operationalExpenses: '$175,000',
      maintenanceReserve: '$50,000',
      availableForDistribution: '$625,000',
      tokensOutstanding: 250000,
      distributionPerToken: '$2.50'
    },
    risks: [
      'Future rental income may be affected by market conditions',
      'Large distributions may reduce available capital for emergency repairs',
      'Tax implications for token holders should be considered'
    ],
    timeline: [
      { date: 'Dec 3, 2024', event: 'Proposal submitted', status: 'completed' },
      { date: 'Dec 10, 2024', event: 'Voting period ends', status: 'pending' },
      { date: 'Dec 12, 2024', event: 'Results announced', status: 'pending' },
      { date: 'Dec 15, 2024', event: 'Distribution (if approved)', status: 'pending' }
    ],
    userVotingPower: 450,
    userEstimatedDistribution: 1125,
    // Privacy settings
    isPrivate: false, // Public proposal - everyone can see
    visibilityPolicy: 'creator_decides'
  },
  {
    id: '2',
    title: 'Lobby Renovation Project',
    description: 'Modernize the main lobby with new marble flooring, LED lighting, and digital directory system to increase property value.',
    assetName: 'Miami Beach Resort',
    assetType: 'Hospitality Real Estate',
    assetId: 'miami-beach-resort',
    proposalType: 'renovation',
    status: 'active',
    votesFor: 892,
    votesAgainst: 234,
    totalVotes: 1126,
    quorumRequired: 1200,
    timeLeft: '12 days left',
    proposedBy: 'Property Manager',
    proposedByAddress: '0x851c...4A2e',
    createdDate: 'Nov 28, 2024',
    endDate: 'Dec 15, 2024',
    submissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    impact: '+8% property value',
    requiredAmount: '$150,000',
    rationale: 'The lobby is the first impression for guests and potential buyers. A modern renovation will significantly increase property appeal and market value.',
    votingDuration: 14,
    risks: [
      'Construction may temporarily affect guest experience',
      'Cost overruns are possible with renovation projects',
      'ROI timeline may be longer than projected'
    ],
    userVoted: 'for',
    userVotingPower: 180,
    userTokens: 180,
    userEstimatedDistribution: 0,
    // Privacy settings
    isPrivate: true, // Private proposal - only art collection token holders can see
    visibilityPolicy: 'creator_decides'
  },
  {
    id: '3',
    title: 'Change Property Management Company',
    description: 'Switch to a new property management firm with better track record and lower fees to improve net returns.',
    assetName: 'Gold Bullion Vault',
    assetType: 'Precious Metals',
    assetId: 'gold-vault',
    proposalType: 'management',
    status: 'passed',
    votesFor: 2156,
    votesAgainst: 344,
    totalVotes: 2500,
    quorumRequired: 2000,
    timeLeft: 'Ended',
    proposedBy: 'Token Holder',
    proposedByAddress: '0x923f...8D1c',
    createdDate: 'Nov 15, 2024',
    endDate: 'Nov 30, 2024',
    submissionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    impact: '-0.5% fees',
    rationale: 'Current management fees are above market rate. The proposed company offers better security protocols and 0.5% lower fees.',
    votingDuration: 15,
    userVoted: 'for',
    userVotingPower: 580,
    userTokens: 580,
    userEstimatedDistribution: 0,
    // Privacy settings
    isPrivate: false, // Public proposal
    visibilityPolicy: 'always_public'
  },
  {
    id: '4',
    title: 'Expand Wine Storage Facility',
    description: 'Add temperature-controlled storage units to accommodate additional wine inventory and increase revenue potential.',
    assetName: 'Rare Wine Collection',
    assetType: 'Collectibles',
    assetId: 'wine-collection',
    proposalType: 'expansion',
    status: 'active',
    votesFor: 567,
    votesAgainst: 123,
    totalVotes: 690,
    quorumRequired: 800,
    timeLeft: '8 days left',
    proposedBy: 'Collection Manager',
    proposedByAddress: '0x445b...7E9a',
    createdDate: 'Dec 1, 2024',
    endDate: 'Dec 12, 2024',
    submissionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    impact: '+15% capacity',
    requiredAmount: '$75,000',
    rationale: 'Current storage is at 98% capacity. Expansion will allow acquisition of premium vintages and increase collection value.',
    votingDuration: 11,
    userVotingPower: 92,
    userTokens: 92,
    userEstimatedDistribution: 0,
    // Privacy settings
    isPrivate: true, // Private proposal - only wine collection token holders can see
    visibilityPolicy: 'always_private'
  },
  {
    id: '5',
    title: 'Partial Asset Sale - Classic Cars',
    description: 'Sell 3 vehicles from the classic car collection to realize gains and redistribute proceeds to token holders.',
    assetName: 'Classic Car Collection',
    assetType: 'Luxury Vehicles',
    assetId: 'classic-cars',
    proposalType: 'sale',
    status: 'rejected',
    votesFor: 234,
    votesAgainst: 1456,
    totalVotes: 1690,
    quorumRequired: 1500,
    timeLeft: 'Ended',
    proposedBy: 'Token Holder',
    proposedByAddress: '0x167d...9C3f',
    createdDate: 'Nov 20, 2024',
    endDate: 'Dec 5, 2024',
    submissionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    impact: '$45,000 distribution',
    rationale: 'Three vehicles have appreciated significantly. Sale would provide immediate returns to token holders.',
    votingDuration: 15,
    userVoted: 'against',
    userVotingPower: 85,
    userTokens: 85,
    userEstimatedDistribution: 0,
    // Privacy settings
    isPrivate: false, // Public proposal
    visibilityPolicy: 'creator_decides'
  }
];

export const useGovernanceStore = create<GovernanceState>()(
  persist(
    (set, get) => ({
      proposals: useDemoModeStore.getState().isDemoMode() 
        ? mockGovernanceProposals.map(proposal => validateProposalData(proposal))
        : [], // Empty array in development mode

      addProposal: (proposalData, userAddress) => {
        try {
          // Validate required fields
          if (!proposalData.title || !proposalData.description) {
            return { success: false, error: 'Missing required proposal data' };
          }

          const id = `gov_proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date();
          const submissionDate = now.toISOString();
          const createdDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          
          const timing = calculateProposalTiming(proposalData.votingDuration);
          
          // Set quorum based on asset (mock calculation)
          const quorumRequired = 1000; // In real app, this would be calculated based on total tokens for the asset
          
          const proposalBase = {
            id,
            submissionDate,
            createdDate,
            endDate: timing.endDate,
            timeLeft: timing.timeLeft,
            status: 'submitted' as const,
            votesFor: 0,
            votesAgainst: 0,
            totalVotes: 0,
            quorumRequired,
            proposedBy: 'You',
            proposedByAddress: userAddress || '0x123...456',
            userVotingPower: proposalData.userVotingPower || 0,
            userTokens: proposalData.userTokens || 0,
            userEstimatedDistribution: proposalData.userEstimatedDistribution || 0,
            ...proposalData
          };
          
          const newProposal = validateProposalData(proposalBase);

          set((state) => ({
            proposals: [newProposal, ...state.proposals]
          }));

          return { success: true, proposalId: id };
        } catch (error) {
          console.error('Error submitting proposal:', error);
          return { success: false, error: 'Failed to submit proposal. Please try again.' };
        }
      },

      saveDraft: (proposalData) => {
        const id = `gov_draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();
        const submissionDate = now.toISOString();
        const createdDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        const draftBase = {
          id,
          submissionDate,
          createdDate,
          endDate: 'Draft',
          timeLeft: 'Draft',
          status: 'draft' as const,
          votesFor: 0,
          votesAgainst: 0,
          totalVotes: 0,
          quorumRequired: 1000,
          proposedBy: 'You',
          proposedByAddress: '0x123...456',
          userVotingPower: proposalData.userVotingPower || 0,
          userTokens: proposalData.userTokens || 0,
          userEstimatedDistribution: proposalData.userEstimatedDistribution || 0,
          ...proposalData
        };
        
        const newDraft = validateProposalData(draftBase);

        set((state) => ({
          proposals: [newDraft, ...state.proposals]
        }));

        return id;
      },

      submitDraft: (draftId) => {
        try {
          const proposals = get().proposals;
          const draftIndex = proposals.findIndex(p => p.id === draftId && p.status === 'draft');
          
          if (draftIndex === -1) {
            return { success: false, error: 'Draft not found' };
          }

          const draft = proposals[draftIndex];
          
          // Validate required fields
          if (!draft.title || !draft.description) {
            return { success: false, error: 'Missing required proposal data' };
          }

          const timing = calculateProposalTiming(draft.votingDuration);
          const newId = `gov_proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const submittedBase = {
            ...draft,
            id: newId,
            status: 'submitted' as const,
            endDate: timing.endDate,
            timeLeft: timing.timeLeft,
            submissionDate: new Date().toISOString(),
            createdDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            votesFor: 0,
            votesAgainst: 0,
            totalVotes: 0,
            quorumRequired: 1000,
            proposedBy: 'You',
            proposedByAddress: window.localStorage.getItem('connectedWalletAddress') || '0x123...456'
          };
          
          const submittedProposal = validateProposalData(submittedBase);

          set((state) => ({
            proposals: [
              submittedProposal,
              ...state.proposals.filter(p => p.id !== draftId)
            ]
          }));

          return { success: true, proposalId: newId };
        } catch (error) {
          console.error('Error submitting draft:', error);
          return { success: false, error: 'Failed to submit draft. Please try again.' };
        }
      },

      updateDraft: (draftId, proposalData) => {
        set((state) => ({
          proposals: state.proposals.map((proposal) =>
            proposal.id === draftId && proposal.status === 'draft'
              ? { ...proposal, ...proposalData }
              : proposal
          )
        }));
      },

      deleteDraft: (draftId) => {
        set((state) => ({
          proposals: state.proposals.filter(p => p.id !== draftId)
        }));
      },

      getDrafts: () => {
        return get().proposals.filter(p => p.status === 'draft');
      },

      getProposalById: (id) => {
        return get().proposals.find((proposal) => proposal.id === id);
      },

      getProposalsByStatus: (status) => {
        return get().proposals.filter((proposal) => proposal.status === status);
      },

      getProposalsByType: (type) => {
        return get().proposals.filter((proposal) => proposal.proposalType === type);
      },

      voteOnProposal: (proposalId, vote, votingPower) => {
        const proposals = get().proposals;
        const proposalIndex = proposals.findIndex(p => p.id === proposalId);
        
        if (proposalIndex === -1) return false;
        
        const proposal = proposals[proposalIndex];
        
        // Check if user already voted
        if (proposal.userVoted) return false;
        
        // Check if proposal is still active
        if (proposal.status !== 'active') return false;
        
        set((state) => ({
          proposals: state.proposals.map((p, index) => {
            if (index === proposalIndex) {
              const newVotesFor = vote === 'for' ? p.votesFor + votingPower : p.votesFor;
              const newVotesAgainst = vote === 'against' ? p.votesAgainst + votingPower : p.votesAgainst;
              const newTotalVotes = p.totalVotes + votingPower;
              
              // Check if quorum is met and update status if needed
              let newStatus = p.status;
              if (newTotalVotes >= p.quorumRequired) {
                const forPercentage = (newVotesFor / newTotalVotes) * 100;
                if (forPercentage > 50) {
                  newStatus = 'passed';
                } else {
                  newStatus = 'rejected';
                }
              }
              
              return {
                ...p,
                votesFor: newVotesFor,
                votesAgainst: newVotesAgainst,
                totalVotes: newTotalVotes,
                userVoted: vote,
                status: newStatus
              };
            }
            return p;
          })
        }));
        
        return true;
      },

      updateProposalStatus: (proposalId, status, comments) => {
        set((state) => ({
          proposals: state.proposals.map((proposal) =>
            proposal.id === proposalId
              ? { 
                  ...proposal, 
                  status,
                  reviewComments: comments,
                  reviewDate: new Date().toISOString(),
                  reviewedBy: localStorage.getItem('adminUsername') || 'Platform Admin'
                }
              : proposal
          )
        }));
      },

      getProposalsForAdmin: () => {
        // Return proposals that need admin review
        return get().proposals.filter(proposal => 
          proposal.status === 'submitted' || 
          proposal.status === 'under_review' || 
          proposal.status === 'changes_requested'
        );
      },

      getProposalsForVoting: (userTokenHoldings = []) => {
        // Return only proposals that are approved and visible to users for voting/viewing
        return get().proposals.filter(proposal => {
          // First check if proposal is in a votable status
          const isVotableStatus = proposal.status === 'active' || 
                                proposal.status === 'approved' ||
                                proposal.status === 'passed' ||
                                proposal.status === 'rejected';
          
          if (!isVotableStatus) return false;
          
          // If proposal is public, show it to everyone
          if (!proposal.isPrivate) return true;
          
          // If proposal is private, only show to token holders of that asset
          return userTokenHoldings.includes(proposal.assetId);
        });
      },

      approveProposal: (proposalId, comments) => {
        set((state) => ({
          proposals: state.proposals.map((proposal) =>
            proposal.id === proposalId
              ? { 
                  ...proposal, 
                  status: 'active', // Approved proposals become active for voting
                  reviewComments: comments,
                  reviewDate: new Date().toISOString(),
                  reviewedBy: localStorage.getItem('adminUsername') || 'Platform Admin'
                }
              : proposal
          )
        }));
      },

      rejectProposal: (proposalId, comments) => {
        set((state) => ({
          proposals: state.proposals.map((proposal) =>
            proposal.id === proposalId
              ? { 
                  ...proposal, 
                  status: 'rejected',
                  reviewComments: comments,
                  reviewDate: new Date().toISOString(),
                  reviewedBy: localStorage.getItem('adminUsername') || 'Platform Admin'
                }
              : proposal
          )
        }));
      },

      requestChanges: (proposalId, comments) => {
        set((state) => ({
          proposals: state.proposals.map((proposal) =>
            proposal.id === proposalId
              ? { 
                  ...proposal, 
                  status: 'changes_requested',
                  reviewComments: comments,
                  reviewDate: new Date().toISOString(),
                  reviewedBy: localStorage.getItem('adminUsername') || 'Platform Admin'
                }
              : proposal
          )
        }));
      },

      saveReviewComments: (proposalId, comments) => {
        set((state) => ({
          proposals: state.proposals.map((proposal) =>
            proposal.id === proposalId
              ? { 
                  ...proposal, 
                  reviewComments: comments,
                  reviewDate: new Date().toISOString(),
                  reviewedBy: localStorage.getItem('adminUsername') || 'Platform Admin'
                  // Note: Status remains unchanged - only saving comments
                }
              : proposal
          )
        }));
      },

      resubmitProposal: (proposalId, updatedData) => {
        const state = get();
        const existingProposal = state.proposals.find(p => p.id === proposalId);
        
        if (!existingProposal) {
          return { success: false, error: 'Proposal not found' };
        }
        
        if (existingProposal.status !== 'changes_requested') {
          return { success: false, error: 'Only proposals with requested changes can be resubmitted' };
        }
        
        try {
          set((state) => ({
            proposals: state.proposals.map((proposal) =>
              proposal.id === proposalId
                ? { 
                    ...proposal,
                    ...updatedData,
                    status: 'submitted' as GovernanceProposal['status'],
                    reviewComments: undefined, // Clear previous admin comments
                    updatedAt: new Date().toISOString(),
                    submissionDate: new Date().toISOString()
                  }
                : proposal
            )
          }));
          
          console.log(`🔄 Proposal ${proposalId} resubmitted for review`);
          return { success: true };
        } catch (error) {
          console.error('❌ Failed to resubmit proposal:', error);
          return { success: false, error: 'Failed to resubmit proposal' };
        }
      },

      updateProposalFromSimulate: (proposalId, updatedData) => {
        set((state) => ({
          proposals: state.proposals.map((proposal) =>
            proposal.id === proposalId
              ? { 
                  ...proposal,
                  status: updatedData.status,
                  votesFor: updatedData.votesFor || proposal.votesFor,
                  votesAgainst: updatedData.votesAgainst || proposal.votesAgainst, 
                  totalVotes: updatedData.totalVotes || proposal.totalVotes,
                  updatedAt: new Date().toISOString(),
                  timeLeft: updatedData.status === 'passed' || updatedData.status === 'rejected' ? 'Ended' : proposal.timeLeft
                }
              : proposal
          )
        }));
      },

      syncWithBackend: async () => {
        try {
          const response = await fetch('http://localhost:3001/api/v1/governance/proposals');
          const result = await response.json();
          
          if (response.ok && result.success) {
            // Convert backend data to frontend format
            const backendProposals = result.data.map((backendProposal: any) => ({
              id: backendProposal.id,
              title: backendProposal.title,
              description: backendProposal.description,
              assetName: 'Backend Asset', // Default since backend doesn't have this field
              assetType: 'Real Estate', // Default since backend doesn't have this field  
              assetId: backendProposal.assetId,
              proposalType: backendProposal.type === 'fee_change' ? 'management' : 'dividend',
              status: backendProposal.status,
              votesFor: backendProposal.voting.yesVotes,
              votesAgainst: backendProposal.voting.noVotes,
              totalVotes: backendProposal.voting.totalVotes,
              quorumRequired: backendProposal.voting.quorumRequired * 1000, // Convert to token count
              timeLeft: backendProposal.status === 'passed' || backendProposal.status === 'rejected' ? 'Ended' : '5 days left',
              proposedBy: backendProposal.proposer || 'Backend User',
              proposedByAddress: '0x123...456',
              createdDate: new Date(backendProposal.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
              endDate: new Date(backendProposal.votingPeriod.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
              submissionDate: backendProposal.createdAt,
              impact: '+2.5%', // Default
              rationale: backendProposal.description,
              votingDuration: backendProposal.votingPeriod.duration,
              isPrivate: false,
              visibilityPolicy: 'creator_decides' as const
            }));
            
            // Merge backend proposals with existing user-created proposals
            set((state) => {
              const userProposals = state.proposals.filter(p => 
                // Keep proposals that start with 'gov_proposal_' (user-created) or don't exist in backend
                p.id.startsWith('gov_proposal_') || !backendProposals.find(bp => bp.id === p.id)
              );
              
              // Update existing backend proposals or add new ones
              const mergedProposals = [...userProposals];
              backendProposals.forEach(backendProposal => {
                const existingIndex = mergedProposals.findIndex(p => p.id === backendProposal.id);
                if (existingIndex >= 0) {
                  // Update existing backend proposal
                  mergedProposals[existingIndex] = backendProposal;
                } else {
                  // Add new backend proposal
                  mergedProposals.push(backendProposal);
                }
              });
              
              return {
                ...state,
                proposals: mergedProposals
              };
            });
            
            console.log('✅ Governance store synced with backend data');
          }
        } catch (error) {
          console.error('❌ Failed to sync governance store with backend:', error);
        }
      },

      refreshDataForDemoMode: () => {
        set(() => ({
          proposals: useDemoModeStore.getState().isDemoMode() 
            ? mockGovernanceProposals.map(proposal => validateProposalData(proposal))
            : [] // Clear all proposals in development mode
        }));
        console.log('🔄 Governance store refreshed for demo mode change');
      }
    }),
    {
      name: 'cf1-governance-v3',
      // Only persist essential data
      partialize: (state) => ({
        proposals: state.proposals
      })
    }
  )
);