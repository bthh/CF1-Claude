import { useState, useEffect } from 'react';
import { useDataModeStore } from '../store/dataModeStore';
import { useDemoModeStore } from '../store/demoModeStore';
import { useSubmissionStore } from '../store/submissionStore';
import { getDemoLaunchpadProposals } from './demoLaunchpadData';

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

// Demo data using expanded demo launchpad data
const getDemoProposals = (): LaunchpadProposal[] => {
  const demoModeState = useDemoModeStore.getState();
  const scenario = demoModeState.scenario || 'sales_demo';
  const demoProposals = getDemoLaunchpadProposals(scenario);
  
  // Convert demo launchpad proposals to LaunchpadProposal format
  return demoProposals.map(proposal => ({
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    category: proposal.category,
    location: proposal.location,
    targetAmount: proposal.targetAmount,
    raisedAmount: proposal.raisedAmount,
    raisedPercentage: Math.round((parseFloat(proposal.raisedAmount.replace(/[$,]/g, '')) / parseFloat(proposal.targetAmount.replace(/[$,]/g, ''))) * 100),
    backers: proposal.backers,
    daysLeft: proposal.daysLeft,
    expectedAPY: proposal.expectedAPY,
    minimumInvestment: proposal.minimumInvestment,
    imageUrl: proposal.imageUrl,
    status: proposal.status,
    source: 'demo' as const
  }));
};

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