import { useState, useEffect, useMemo } from 'react';
import { useDataModeStore } from '../store/dataModeStore';
import { useDemoModeStore, DemoScenario } from '../store/demoModeStore';
import { useGovernanceStore, type GovernanceProposal } from '../store/governanceStore';

// Demo data for different scenarios
const getDemoProposals = (scenario: DemoScenario = 'demo'): GovernanceProposal[] => {
  // Base demo proposals for general demo mode
  const baseProposals: GovernanceProposal[] = [
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

  // Return scenario-specific proposals
  switch (scenario) {
    case 'sales_demo':
      return [
        ...baseProposals,
        {
          id: 'demo-sales-g4',
          title: 'Q1 Earnings Distribution - Tech Hub',
          description: 'Proposal to distribute $89,000 in quarterly profits to Austin Tech Hub token holders',
          assetName: 'Austin Tech Hub Office Complex',
          assetType: 'Commercial Real Estate',
          assetId: 'austin-tech-hub',
          proposalType: 'dividend',
          status: 'active',
          votesFor: 1584,
          votesAgainst: 267,
          totalVotes: 1851,
          quorumRequired: 2200,
          timeLeft: '8 days 12 hours',
          proposedBy: 'Property Manager',
          proposedByAddress: 'neutron1sales1...',
          createdDate: '2024-01-18',
          endDate: '2024-01-26',
          submissionDate: '2024-01-18',
          impact: '+$2.78 per token',
          rationale: 'Excellent Q1 performance with 97% occupancy and rising rental rates',
          votingDuration: 8,
          isPrivate: false,
          visibilityPolicy: 'always_public',
          detailedBreakdown: {
            totalRevenue: '$387,500',
            operationalExpenses: '$145,000',
            maintenanceReserve: '$42,500',
            availableForDistribution: '$200,000',
            tokensOutstanding: 32000,
            distributionPerToken: '$6.25'
          }
        },
        {
          id: 'demo-sales-g5',
          title: 'Miami Resort Pool Renovation',
          description: 'Proposal to upgrade resort pool area and add premium cabanas for enhanced guest experience',
          assetName: 'Miami Beachfront Resort',
          assetType: 'Hospitality Real Estate',
          assetId: 'miami-resort',
          proposalType: 'renovation',
          status: 'active',
          votesFor: 2156,
          votesAgainst: 445,
          totalVotes: 2601,
          quorumRequired: 3000,
          timeLeft: '6 days 4 hours',
          proposedBy: 'Resort Management',
          proposedByAddress: 'neutron1sales2...',
          createdDate: '2024-01-19',
          endDate: '2024-01-25',
          submissionDate: '2024-01-19',
          impact: '+12% occupancy rate',
          requiredAmount: '$285,000',
          rationale: 'Market research shows premium pool amenities increase booking rates and nightly rates',
          votingDuration: 6,
          isPrivate: false,
          visibilityPolicy: 'always_public'
        },
        {
          id: 'demo-sales-g6',
          title: 'Warehouse Security System Upgrade',
          description: 'Install state-of-the-art security systems across all Phoenix warehouse facilities',
          assetName: 'Industrial Warehouse Portfolio',
          assetType: 'Industrial Real Estate',
          assetId: 'phoenix-warehouse',
          proposalType: 'security',
          status: 'active',
          votesFor: 1789,
          votesAgainst: 178,
          totalVotes: 1967,
          quorumRequired: 2500,
          timeLeft: '11 days 16 hours',
          proposedBy: 'Security Consultant',
          proposedByAddress: 'neutron1sales3...',
          createdDate: '2024-01-14',
          endDate: '2024-01-25',
          submissionDate: '2024-01-14',
          impact: 'Reduced insurance premiums',
          requiredAmount: '$156,000',
          rationale: 'Enhanced security reduces liability and attracts higher-value tenants',
          votingDuration: 11,
          isPrivate: false,
          visibilityPolicy: 'always_public'
        },
        {
          id: 'demo-sales-g7',
          title: 'Green Energy Office Park - Solar Installation',
          description: 'Install 500kW solar array system to achieve net-zero energy consumption',
          assetName: 'Green Building Office Park',
          assetType: 'Sustainable Real Estate',
          assetId: 'green-office-park',
          proposalType: 'infrastructure',
          status: 'passed',
          votesFor: 3245,
          votesAgainst: 156,
          totalVotes: 3401,
          quorumRequired: 3000,
          timeLeft: 'Voting ended',
          proposedBy: 'Sustainability Manager',
          proposedByAddress: 'neutron1sales4...',
          createdDate: '2024-01-05',
          endDate: '2024-01-12',
          submissionDate: '2024-01-05',
          impact: '-35% energy costs',
          requiredAmount: '$425,000',
          rationale: 'Solar installation provides long-term cost savings and increases property value',
          votingDuration: 7,
          isPrivate: false,
          visibilityPolicy: 'always_public'
        },
        {
          id: 'demo-sales-g8',
          title: 'Medical Center Expansion Planning',
          description: 'Approve architectural plans for adding third building to medical office complex',
          assetName: 'Medical Office Building Network',
          assetType: 'Healthcare Real Estate',
          assetId: 'medical-office-network',
          proposalType: 'expansion',
          status: 'active',
          votesFor: 2678,
          votesAgainst: 234,
          totalVotes: 2912,
          quorumRequired: 3500,
          timeLeft: '4 days 8 hours',
          proposedBy: 'Development Team',
          proposedByAddress: 'neutron1sales5...',
          createdDate: '2024-01-20',
          endDate: '2024-01-24',
          submissionDate: '2024-01-20',
          impact: '+40% rental capacity',
          requiredAmount: '$850,000',
          rationale: 'High demand from medical practices, 18-month waiting list for space',
          votingDuration: 4,
          isPrivate: false,
          visibilityPolicy: 'always_public'
        },
        {
          id: 'demo-sales-g9',
          title: 'Student Housing WiFi Infrastructure',
          description: 'Upgrade to enterprise-grade WiFi 6E throughout all student housing units',
          assetName: 'Student Housing Complex Austin',
          assetType: 'Educational Real Estate',
          assetId: 'student-housing-austin',
          proposalType: 'technology',
          status: 'active',
          votesFor: 1456,
          votesAgainst: 89,
          totalVotes: 1545,
          quorumRequired: 1800,
          timeLeft: '9 days 2 hours',
          proposedBy: 'Student Affairs',
          proposedByAddress: 'neutron1sales6...',
          createdDate: '2024-01-16',
          endDate: '2024-01-25',
          submissionDate: '2024-01-16',
          impact: '+15% student satisfaction',
          requiredAmount: '$125,000',
          rationale: 'Modern connectivity essential for student recruitment and retention',
          votingDuration: 9,
          isPrivate: false,
          visibilityPolicy: 'always_public'
        },
        {
          id: 'demo-sales-g10',
          title: 'Luxury Vehicle Collection Insurance',
          description: 'Upgrade insurance coverage for high-value vehicles with comprehensive protection',
          assetName: 'Luxury Vehicle Collection',
          assetType: 'Collectible Vehicles',
          assetId: 'luxury-vehicle-collection',
          proposalType: 'insurance',
          status: 'passed',
          votesFor: 2845,
          votesAgainst: 234,
          totalVotes: 3079,
          quorumRequired: 2500,
          timeLeft: 'Voting ended',
          proposedBy: 'Risk Management',
          proposedByAddress: 'neutron1sales7...',
          createdDate: '2024-01-02',
          endDate: '2024-01-09',
          submissionDate: '2024-01-02',
          impact: 'Full replacement coverage',
          requiredAmount: '$85,000',
          rationale: 'Current insurance insufficient for high-value collectibles',
          votingDuration: 7,
          isPrivate: false,
          visibilityPolicy: 'always_public'
        },
        {
          id: 'demo-sales-g11',
          title: 'Farmland Water Rights Acquisition',
          description: 'Purchase additional water rights to secure long-term agricultural production',
          assetName: 'Agricultural Farmland Portfolio',
          assetType: 'Agricultural Real Estate',
          assetId: 'farmland-portfolio',
          proposalType: 'expansion',
          status: 'passed',
          votesFor: 3156,
          votesAgainst: 287,
          totalVotes: 3443,
          quorumRequired: 3000,
          timeLeft: 'Voting ended',
          proposedBy: 'Farm Management',
          proposedByAddress: 'neutron1sales8...',
          createdDate: '2023-12-28',
          endDate: '2024-01-04',
          submissionDate: '2023-12-28',
          impact: '+25% crop yield potential',
          requiredAmount: '$340,000',
          rationale: 'Water rights essential for drought protection and increased yields',
          votingDuration: 7,
          isPrivate: false,
          visibilityPolicy: 'always_public'
        },
        {
          id: 'demo-sales-g12',
          title: 'Industrial Equipment Maintenance Contract',
          description: 'Renewal of maintenance contract for warehouse automation systems',
          assetName: 'Industrial Warehouse Portfolio',
          assetType: 'Industrial Real Estate',
          assetId: 'warehouse-portfolio',
          proposalType: 'maintenance',
          status: 'rejected',
          votesFor: 892,
          votesAgainst: 2156,
          totalVotes: 3048,
          quorumRequired: 2500,
          timeLeft: 'Voting ended',
          proposedBy: 'Operations Manager',
          proposedByAddress: 'neutron1sales9...',
          createdDate: '2024-01-08',
          endDate: '2024-01-15',
          submissionDate: '2024-01-08',
          impact: 'Equipment reliability',
          requiredAmount: '$195,000',
          rationale: 'Existing contract too expensive, seeking alternative providers',
          votingDuration: 7,
          isPrivate: false,
          visibilityPolicy: 'always_public'
        },
        {
          id: 'demo-sales-g13',
          title: 'Mining Equipment Upgrade Initiative',
          description: 'Purchase new cryptocurrency mining hardware for increased efficiency',
          assetName: 'Cryptocurrency Data Center',
          assetType: 'Digital Infrastructure',
          assetId: 'crypto-data-center',
          proposalType: 'equipment',
          status: 'passed',
          votesFor: 2567,
          votesAgainst: 445,
          totalVotes: 3012,
          quorumRequired: 2800,
          timeLeft: 'Voting ended',
          proposedBy: 'Technical Operations',
          proposedByAddress: 'neutron1sales10...',
          createdDate: '2023-12-20',
          endDate: '2023-12-27',
          submissionDate: '2023-12-20',
          impact: '+30% mining efficiency',
          requiredAmount: '$750,000',
          rationale: 'New hardware generation offers significant efficiency improvements',
          votingDuration: 7,
          isPrivate: false,
          visibilityPolicy: 'always_public'
        }
      ];
    
    case 'investor_presentation':
    case 'user_onboarding':
    case 'regulatory_showcase':
    case 'development_testing':
    case 'custom':
    default:
      return baseProposals;
  }
};

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
  try {
    const allProposals = useGovernanceStore.getState().proposals || [];
    // Return only approved proposals (not drafts)
    return allProposals.filter(proposal => 
      proposal.status !== 'draft' && 
      proposal.status !== 'submitted' && 
      proposal.status !== 'under_review'
    );
  } catch (error) {
    console.warn('Failed to load development proposals:', error);
    return [];
  }
};

// Main data service
export const useGovernanceData = () => {
  const { currentMode } = useDataModeStore();
  const { isEnabled: isDemoModeEnabled, scenario } = useDemoModeStore();
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
        // Use scenario-specific data when demo mode is enabled with scenarios
        if (isDemoModeEnabled && scenario) {
          return getDemoProposals(scenario);
        }
        return getDemoProposals();
      default:
        return productionProposals;
    }
  };


  // Memoize proposals to prevent creating new array references on every render
  const proposals = useMemo(() => getProposals(), [currentMode, isDemoModeEnabled, scenario, productionProposals]);
  
  // Memoize stats calculation based on proposals
  const stats = useMemo(() => {
    // Optimize by calculating counts in a single pass
    const counts = proposals.reduce((acc, proposal) => {
      switch (proposal.status) {
        case 'active':
          acc.active++;
          break;
        case 'passed':
          acc.passed++;
          break;
        case 'rejected':
          acc.rejected++;
          break;
      }
      return acc;
    }, { active: 0, passed: 0, rejected: 0 });
    
    return {
      total: proposals.length,
      active: counts.active,
      passed: counts.passed,
      rejected: counts.rejected,
      participationRate: proposals.length > 0 ? '89%' : '0%', // Mock for demo
      avgDuration: '7 days',
      pendingVotes: counts.active // Set pending votes to active proposals count
    };
  }, [proposals]);

  return {
    proposals,
    stats,
    currentMode,
    isLoading,
    isEmpty: proposals.length === 0,
  };
};