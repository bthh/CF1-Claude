import { useState, useEffect } from 'react';
import { useDataModeStore } from '../store/dataModeStore';
import { useSubmissionStore } from '../store/submissionStore';

export interface LaunchpadProposal {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  targetAmount: string;
  raisedAmount: string;
  raisedPercentage: number;
  backers: number;
  daysLeft: number;
  expectedAPY: string;
  minimumInvestment: string;
  imageUrl?: string;
  status: 'active' | 'funded' | 'upcoming';
  source: 'production' | 'development' | 'demo';
}

// Demo data for testing
const getDemoProposals = (): LaunchpadProposal[] => [
  {
    id: 'demo-l1',
    title: 'Downtown Austin Tech Hub',
    description: 'Modern office complex in the heart of Austin\'s tech district',
    category: 'Commercial Real Estate',
    location: 'Austin, TX',
    targetAmount: '$3,200,000',
    raisedAmount: '$2,100,000',
    raisedPercentage: 65,
    backers: 89,
    daysLeft: 23,
    expectedAPY: '11.2%',
    minimumInvestment: '$1,000',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    status: 'active',
    source: 'demo'
  },
  {
    id: 'demo-l2',
    title: 'Diversified Precious Metals Fund',
    description: 'Gold, silver, and platinum holdings in secure vaults',
    category: 'Precious Metals',
    location: 'Multiple Locations',
    targetAmount: '$1,800,000',
    raisedAmount: '$1,800,000',
    raisedPercentage: 100,
    backers: 124,
    daysLeft: 0,
    expectedAPY: '8.5%',
    minimumInvestment: '$500',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop',
    status: 'funded',
    source: 'demo'
  },
  {
    id: 'demo-l3',
    title: 'Contemporary Art Collection',
    description: 'Curated collection of emerging contemporary artists',
    category: 'Art & Collectibles',
    location: 'New York, NY',
    targetAmount: '$950,000',
    raisedAmount: '$320,000',
    raisedPercentage: 34,
    backers: 45,
    daysLeft: 45,
    expectedAPY: '15.3%',
    minimumInvestment: '$2,500',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    status: 'active',
    source: 'demo'
  }
];

// Production data (empty for true production environment)
const getProductionProposals = async (): Promise<LaunchpadProposal[]> => {
  // In a real production environment, this would connect to a production database
  // For this development environment, we keep production mode empty to ensure
  // proper data isolation between development and production modes
  console.log('📊 Production mode: No proposals (clean production environment)');
  return [];
};

// Development data (from submission store - user created)
const getDevelopmentProposals = (): LaunchpadProposal[] => {
  // Get approved submissions from the store and convert them
  const submissions = useSubmissionStore.getState().submissions || [];
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  
  return approvedSubmissions.map(submission => ({
    id: submission.id,
    title: submission.assetName,
    description: submission.description,
    category: submission.assetType,
    location: submission.location || 'TBD',
    targetAmount: submission.targetAmount || '$0',
    raisedAmount: submission.fundingStatus?.raisedAmount 
      ? `$${(submission.fundingStatus.raisedAmount / 1000000).toFixed(1)}M`
      : '$0',
    raisedPercentage: submission.fundingStatus?.raisedPercentage || 0,
    backers: submission.fundingStatus?.investorCount || 0,
    daysLeft: 30,
    expectedAPY: submission.expectedAPY || '0%',
    minimumInvestment: submission.minimumInvestment || '$1,000',
    status: submission.fundingStatus?.isFunded ? 'funded' : 'active',
    source: 'development' as const
  }));
};

// Main data service
export const useLaunchpadData = () => {
  const { currentMode } = useDataModeStore();
  const [productionProposals, setProductionProposals] = useState<LaunchpadProposal[]>([]);
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
  
  const getProposals = (): LaunchpadProposal[] => {
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
    const fundedCount = proposals.filter(p => p.status === 'funded').length;
    const upcomingCount = proposals.filter(p => p.status === 'upcoming').length;
    
    if (proposals.length === 0) {
      return {
        total: 0,
        active: 0,
        funded: 0,
        upcoming: 0,
        totalRaised: '$0',
        avgAPY: '0.0%'
      };
    }
    
    const totalRaised = proposals.reduce((sum, proposal) => {
      const raised = parseFloat(proposal.raisedAmount.replace(/[$,M]/g, ''));
      return sum + (proposal.raisedAmount.includes('M') ? raised * 1000000 : raised);
    }, 0);

    const avgAPY = proposals.reduce((sum, proposal) => 
      sum + parseFloat(proposal.expectedAPY.replace('%', '')), 0) / proposals.length;

    return {
      total: proposals.length,
      active: activeCount,
      funded: fundedCount,
      upcoming: upcomingCount,
      totalRaised: `$${(totalRaised / 1000000).toFixed(1)}M`,
      avgAPY: `${avgAPY.toFixed(1)}%`
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