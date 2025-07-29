import { useState, useEffect } from 'react';
import { useDataModeStore } from '../store/dataModeStore';
import { useGovernanceStore, type GovernanceProposal } from '../store/governanceStore';

// Demo data for testing
const getDemoProposals = (): GovernanceProposal[] => [
  {
    id: 'demo-g1',
    title: 'Q4 Dividend Distribution - Manhattan Office',
    description: 'Proposal to distribute $125,000 in quarterly earnings to token holders',
    assetName: 'Manhattan Office Complex',
    assetType: 'Commercial Real Estate',
    assetId: 'manhattan-office',
    proposalType: 'dividend',
    status: 'active',
    votesFor: 1247,
    votesAgainst: 156,
    totalVotes: 1403,
    quorumRequired: 2000,
    timeLeft: '5 days 14 hours',
    proposedBy: 'Asset Manager',
    proposedByAddress: 'neutron1demo...',
    createdDate: '2024-01-15',
    endDate: '2024-01-22',
    submissionDate: '2024-01-15',
    impact: '+$2.85 per token',
    rationale: 'Strong Q4 performance with 95% occupancy rate and above-market rents',
    votingDuration: 7,
    isPrivate: false,
    visibilityPolicy: 'always_public',
    detailedBreakdown: {
      totalRevenue: '$485,000',
      operationalExpenses: '$185,000',
      maintenanceReserve: '$50,000',
      availableForDistribution: '$250,000',
      tokensOutstanding: 17000,
      distributionPerToken: '$14.71'
    }
  },
  {
    id: 'demo-g2',
    title: 'HVAC System Upgrade',
    description: 'Proposal to upgrade the building\'s HVAC system for improved efficiency',
    assetName: 'Austin Tech Hub',
    assetType: 'Commercial Real Estate',
    assetId: 'austin-tech-hub',
    proposalType: 'renovation',
    status: 'active',
    votesFor: 892,
    votesAgainst: 345,
    totalVotes: 1237,
    quorumRequired: 1500,
    timeLeft: '12 days 3 hours',
    proposedBy: 'Property Manager',
    proposedByAddress: 'neutron1demo2...',
    createdDate: '2024-01-10',
    endDate: '2024-01-25',
    submissionDate: '2024-01-10',
    impact: '+8% property value',
    requiredAmount: '$185,000',
    rationale: 'Current system is 15 years old and causing higher utility costs',
    votingDuration: 14,
    isPrivate: false,
    visibilityPolicy: 'always_public'
  },
  {
    id: 'demo-g3',
    title: 'New Property Management Company',
    description: 'Proposal to switch to Apex Property Management for better service',
    assetName: 'Gold Vault Holdings',
    assetType: 'Precious Metals',
    assetId: 'gold-vault',
    proposalType: 'management',
    status: 'passed',
    votesFor: 2156,
    votesAgainst: 234,
    totalVotes: 2390,
    quorumRequired: 2000,
    timeLeft: 'Voting ended',
    proposedBy: 'Token Holder Coalition',
    proposedByAddress: 'neutron1demo3...',
    createdDate: '2024-01-01',
    endDate: '2024-01-08',
    submissionDate: '2024-01-01',
    impact: '-0.5% management fees',
    rationale: 'Current management fees are above market rate',
    votingDuration: 7,
    isPrivate: false,
    visibilityPolicy: 'always_public'
  }
];

// Production data (empty for true production environment)
const getProductionProposals = async (): Promise<GovernanceProposal[]> => {
  // In a real production environment, this would connect to a production database
  // For this development environment, we keep production mode empty to ensure
  // proper data isolation between development and production modes
  console.log('🏛️ Production mode: No governance proposals (clean production environment)');
  return [];
};

// Development data (from governance store - user created)
const getDevelopmentProposals = (): GovernanceProposal[] => {
  const allProposals = useGovernanceStore.getState().proposals || [];
  // Return only approved proposals (not drafts)
  return allProposals.filter(proposal => 
    proposal.status !== 'draft' && 
    proposal.status !== 'submitted' && 
    proposal.status !== 'under_review'
  );
};

// Main data service
export const useGovernanceData = () => {
  const { currentMode } = useDataModeStore();
  const [productionProposals, setProductionProposals] = useState<GovernanceProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load production data when mode changes to production
  useEffect(() => {
    if (currentMode === 'production') {
      setIsLoading(true);
      getProductionProposals().then(proposals => {
        setProductionProposals(proposals);
        setIsLoading(false);
      });
    }
  }, [currentMode]);
  
  const getProposals = (): GovernanceProposal[] => {
    switch (currentMode) {
      case 'production':
        return productionProposals;
      case 'development':
        return getDevelopmentProposals();
      case 'demo':
        return getDemoProposals();
      default:
        return productionProposals;
    }
  };

  const getStats = () => {
    const proposals = getProposals();
    const activeCount = proposals.filter(p => p.status === 'active').length;
    const passedCount = proposals.filter(p => p.status === 'passed').length;
    const rejectedCount = proposals.filter(p => p.status === 'rejected').length;
    
    return {
      total: proposals.length,
      active: activeCount,
      passed: passedCount,
      rejected: rejectedCount,
      participationRate: proposals.length > 0 ? '89%' : '0%', // Mock for demo
      avgDuration: '7 days'
    };
  };

  return {
    proposals: getProposals(),
    stats: getStats(),
    currentMode,
    isLoading,
    isEmpty: getProposals().length === 0,
  };
};