import { SessionRole } from '../store/sessionStore';
import { useDemoModeStore, DemoScenario } from '../store/demoModeStore';
import { LaunchpadProposal } from './demoLaunchpadData';
import { PortfolioAsset, PortfolioSummary } from './demoPortfolioData';

/**
 * Role-Based Demo Data Service
 * 
 * Provides comprehensive, role-specific datasets for testing and demonstration
 * Integrates with existing demo mode system while adding role-based data seeding
 */

export interface UserPersona {
  id: string;
  role: SessionRole;
  name: string;
  email: string;
  address: string;
  verified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not_started';
  profileImage?: string;
  joinDate: string;
  totalInvested?: number;
  portfolioValue?: number;
  assetsCreated?: number;
  governance?: {
    votingPower: number;
    proposalsSubmitted: number;
    votesParticipated: number;
  };
  permissions?: string[];
}

export interface AdminData {
  platformStats: {
    totalUsers: number;
    totalProposals: number;
    totalValueLocked: string;
    activeInvestments: number;
    completedFundings: number;
    complianceScore: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'proposal_submitted' | 'investment_made' | 'user_registered' | 'compliance_issue' | 'payout_completed';
    description: string;
    timestamp: string;
    severity?: 'low' | 'medium' | 'high';
    actionRequired?: boolean;
  }>;
  pendingApprovals: Array<{
    id: string;
    type: 'proposal' | 'user_verification' | 'payout_request';
    title: string;
    submittedBy: string;
    submittedAt: string;
    status: 'pending' | 'under_review' | 'requires_changes';
    priority: 'low' | 'medium' | 'high';
  }>;
  complianceReports: Array<{
    id: string;
    title: string;
    type: 'kyc' | 'aml' | 'reg_cf' | 'sec_filing';
    generated: string;
    status: 'completed' | 'in_progress' | 'requires_attention';
  }>;
}

export interface CreatorData {
  myProposals: LaunchpadProposal[];
  drafts: Array<{
    id: string;
    title: string;
    category: string;
    lastModified: string;
    completionStatus: number;
    status: 'draft' | 'under_review' | 'approved' | 'rejected';
  }>;
  analytics: {
    totalRaised: string;
    averageAPY: string;
    successfulProposals: number;
    totalBackers: number;
    portfolioPerformance: string;
  };
  shareholders: Array<{
    id: string;
    name: string;
    tokens: number;
    percentage: number;
    investedAmount: string;
    joinDate: string;
    communicationPrefs: string[];
  }>;
  communications: Array<{
    id: string;
    title: string;
    type: 'update' | 'announcement' | 'financial_report' | 'campaign';
    recipients: number;
    sent: string;
    engagement: {
      opened: number;
      clicked: number;
      responded: number;
    };
  }>;
}

export interface InvestorData {
  portfolio: {
    assets: PortfolioAsset[];
    summary: PortfolioSummary;
  };
  recommendations: Array<{
    id: string;
    title: string;
    category: string;
    expectedAPY: string;
    minimumInvestment: string;
    riskLevel: 'low' | 'medium' | 'high';
    matchScore: number;
    reason: string;
  }>;
  governance: Array<{
    id: string;
    title: string;
    type: 'platform' | 'asset_specific';
    status: 'active' | 'passed' | 'failed';
    votingDeadline?: string;
    userVoted: boolean;
    votingPower: number;
  }>;
  transactions: Array<{
    id: string;
    type: 'investment' | 'dividend' | 'sale' | 'purchase';
    assetName: string;
    amount: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    txHash?: string;
  }>;
  analytics: {
    totalReturn: string;
    bestPerformer: string;
    diversificationScore: number;
    riskProfile: 'conservative' | 'moderate' | 'aggressive';
  };
}

// Role-specific personas
const generateUserPersona = (role: SessionRole, scenario: DemoScenario): UserPersona => {
  const baseId = `${role}_${Date.now()}`;
  const basePersona: UserPersona = {
    id: baseId,
    role,
    name: getRolePersonaName(role, scenario),
    email: `${role}@cf1platform.com`,
    address: `neutron1${role}${Math.random().toString(36).substr(2, 8)}`,
    verified: true,
    kycStatus: 'verified',
    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    profileImage: `https://ui-avatars.com/api/?name=${role}&background=0D8ABC&color=fff`,
  };

  switch (role) {
    case 'investor':
      return {
        ...basePersona,
        totalInvested: getInvestorAmount(scenario),
        portfolioValue: getPortfolioValue(scenario),
        governance: {
          votingPower: Math.floor(Math.random() * 1000) + 100,
          proposalsSubmitted: Math.floor(Math.random() * 3),
          votesParticipated: Math.floor(Math.random() * 15) + 5,
        },
        permissions: ['invest', 'vote', 'view_portfolio', 'trade_secondary'],
      };

    case 'creator':
      return {
        ...basePersona,
        assetsCreated: Math.floor(Math.random() * 5) + 1,
        totalInvested: getCreatorTotalRaised(scenario),
        portfolioValue: getCreatorPortfolioValue(scenario),
        permissions: ['create_proposals', 'manage_assets', 'communicate_shareholders', 'view_analytics'],
      };

    case 'super_admin':
      return {
        ...basePersona,
        permissions: [
          'platform_admin', 'user_management', 'proposal_approval', 'compliance_monitoring',
          'financial_reports', 'system_configuration', 'audit_access'
        ],
      };

    case 'owner':
      return {
        ...basePersona,
        permissions: [
          'full_platform_control', 'financial_controls', 'legal_compliance',
          'strategic_decisions', 'emergency_actions', 'data_access'
        ],
      };

    default:
      return basePersona;
  }
};

// Helper functions for persona generation
const getRolePersonaName = (role: SessionRole, scenario: DemoScenario): string => {
  const names = {
    investor: {
      investor_presentation: 'Alexandra Sterling',
      sales_demo: 'Michael Chen',
      user_onboarding: 'Sarah Johnson',
      regulatory_showcase: 'David Williams',
      development_testing: 'Test Investor',
      custom: 'Demo Investor',
    },
    creator: {
      investor_presentation: 'Robert Blackstone',
      sales_demo: 'Emily Rodriguez',
      user_onboarding: 'James Mitchell',
      regulatory_showcase: 'Jennifer Davis',
      development_testing: 'Test Creator',
      custom: 'Demo Creator',
    },
    super_admin: {
      investor_presentation: 'Platform Administrator',
      sales_demo: 'System Admin',
      user_onboarding: 'Support Admin',
      regulatory_showcase: 'Compliance Officer',
      development_testing: 'Test Admin',
      custom: 'Demo Admin',
    },
    owner: {
      investor_presentation: 'CF1 Platform Owner',
      sales_demo: 'Platform Owner',
      user_onboarding: 'CF1 Owner',
      regulatory_showcase: 'Platform Owner',
      development_testing: 'Test Owner',
      custom: 'Demo Owner',
    },
  };

  return names[role]?.[scenario] || `${role} User`;
};

const getInvestorAmount = (scenario: DemoScenario): number => {
  switch (scenario) {
    case 'investor_presentation': return Math.floor(Math.random() * 500000) + 100000;
    case 'sales_demo': return Math.floor(Math.random() * 100000) + 25000;
    case 'user_onboarding': return Math.floor(Math.random() * 10000) + 1000;
    case 'regulatory_showcase': return Math.floor(Math.random() * 250000) + 50000;
    default: return Math.floor(Math.random() * 50000) + 5000;
  }
};

const getPortfolioValue = (scenario: DemoScenario): number => {
  switch (scenario) {
    case 'investor_presentation': return Math.floor(Math.random() * 625000) + 125000;
    case 'sales_demo': return Math.floor(Math.random() * 125000) + 30000;
    case 'user_onboarding': return Math.floor(Math.random() * 12000) + 1200;
    case 'regulatory_showcase': return Math.floor(Math.random() * 300000) + 60000;
    default: return Math.floor(Math.random() * 60000) + 6000;
  }
};

const getCreatorTotalRaised = (scenario: DemoScenario): number => {
  switch (scenario) {
    case 'investor_presentation': return Math.floor(Math.random() * 10000000) + 2000000;
    case 'sales_demo': return Math.floor(Math.random() * 5000000) + 1000000;
    case 'user_onboarding': return Math.floor(Math.random() * 1000000) + 100000;
    case 'regulatory_showcase': return Math.floor(Math.random() * 8000000) + 1500000;
    default: return Math.floor(Math.random() * 2000000) + 500000;
  }
};

const getCreatorPortfolioValue = (scenario: DemoScenario): number => {
  const totalRaised = getCreatorTotalRaised(scenario);
  return Math.floor(totalRaised * (1 + Math.random() * 0.3)); // 0-30% appreciation
};

// Generate admin-specific data
const generateAdminData = (scenario: DemoScenario): AdminData => {
  const baseMultiplier = getScenarioMultiplier(scenario);
  
  return {
    platformStats: {
      totalUsers: Math.floor(baseMultiplier * 1500) + 500,
      totalProposals: Math.floor(baseMultiplier * 150) + 50,
      totalValueLocked: `$${((baseMultiplier * 50) + 10).toFixed(1)}M`,
      activeInvestments: Math.floor(baseMultiplier * 800) + 200,
      completedFundings: Math.floor(baseMultiplier * 75) + 25,
      complianceScore: Math.floor(Math.random() * 10) + 85, // 85-95%
    },
    recentActivity: generateRecentActivity(scenario),
    pendingApprovals: generatePendingApprovals(scenario),
    complianceReports: generateComplianceReports(scenario),
  };
};

const generateCreatorData = (scenario: DemoScenario): CreatorData => {
  return {
    myProposals: generateCreatorProposals(scenario),
    drafts: generateDrafts(scenario),
    analytics: generateCreatorAnalytics(scenario),
    shareholders: generateShareholders(scenario),
    communications: generateCommunications(scenario),
  };
};

const generateInvestorData = (scenario: DemoScenario): InvestorData => {
  return {
    portfolio: generateInvestorPortfolio(scenario),
    recommendations: generateRecommendations(scenario),
    governance: generateGovernanceProposals(scenario),
    transactions: generateTransactions(scenario),
    analytics: generateInvestorAnalytics(scenario),
  };
};

// Helper functions
const getScenarioMultiplier = (scenario: DemoScenario): number => {
  switch (scenario) {
    case 'investor_presentation': return 5;
    case 'sales_demo': return 3;
    case 'regulatory_showcase': return 4;
    case 'user_onboarding': return 1;
    default: return 2;
  }
};

const generateRecentActivity = (scenario: DemoScenario) => {
  const activities = [
    {
      id: 'act_1',
      type: 'proposal_submitted' as const,
      description: 'New real estate proposal submitted for review',
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      severity: 'medium' as const,
      actionRequired: true,
    },
    {
      id: 'act_2',
      type: 'investment_made' as const,
      description: 'Large investment ($50K+) completed in precious metals fund',
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
      severity: 'low' as const,
      actionRequired: false,
    },
    {
      id: 'act_3',
      type: 'compliance_issue' as const,
      description: 'KYC verification requires manual review',
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      severity: 'high' as const,
      actionRequired: true,
    },
  ];

  return activities.slice(0, getScenarioMultiplier(scenario));
};

const generatePendingApprovals = (scenario: DemoScenario) => {
  const approvals = [
    {
      id: 'app_1',
      type: 'proposal' as const,
      title: 'Miami Beachfront Hotel Development',
      submittedBy: 'Coastal Investments LLC',
      submittedAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
      status: 'pending' as const,
      priority: 'high' as const,
    },
    {
      id: 'app_2',
      type: 'user_verification' as const,
      title: 'Institutional Investor KYC Review',
      submittedBy: 'Sterling Capital Partners',
      submittedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      status: 'under_review' as const,
      priority: 'medium' as const,
    },
  ];

  return approvals.slice(0, Math.ceil(getScenarioMultiplier(scenario) / 2));
};

const generateComplianceReports = (scenario: DemoScenario) => {
  const reports = [
    {
      id: 'rep_1',
      title: 'Monthly KYC Compliance Report',
      type: 'kyc' as const,
      generated: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      status: 'completed' as const,
    },
    {
      id: 'rep_2',
      title: 'SEC Reg CF Filing Status',
      type: 'sec_filing' as const,
      generated: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      status: 'in_progress' as const,
    },
  ];

  return reports;
};

// Simplified implementations for other data generators
const generateCreatorProposals = (scenario: DemoScenario): LaunchpadProposal[] => {
  // This would integrate with existing demoLaunchpadData
  return [];
};

const generateDrafts = (scenario: DemoScenario) => {
  return [
    {
      id: 'draft_1',
      title: 'Renewable Energy Storage Facility',
      category: 'Clean Energy',
      lastModified: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      completionStatus: Math.floor(Math.random() * 70) + 30,
      status: 'draft' as const,
    },
  ];
};

const generateCreatorAnalytics = (scenario: DemoScenario) => {
  return {
    totalRaised: `$${(Math.random() * 5 + 1).toFixed(1)}M`,
    averageAPY: `${(Math.random() * 5 + 8).toFixed(1)}%`,
    successfulProposals: Math.floor(Math.random() * 5) + 2,
    totalBackers: Math.floor(Math.random() * 500) + 100,
    portfolioPerformance: `+${(Math.random() * 20 + 5).toFixed(1)}%`,
  };
};

const generateShareholders = (scenario: DemoScenario) => {
  return [
    {
      id: 'sh_1',
      name: 'Institutional Investor A',
      tokens: Math.floor(Math.random() * 1000) + 500,
      percentage: Math.floor(Math.random() * 15) + 5,
      investedAmount: `$${(Math.random() * 100 + 25).toFixed(0)}K`,
      joinDate: new Date(Date.now() - Math.random() * 86400000 * 180).toISOString(),
      communicationPrefs: ['email', 'quarterly_reports'],
    },
  ];
};

const generateCommunications = (scenario: DemoScenario) => {
  return [
    {
      id: 'comm_1',
      title: 'Q3 Performance Update',
      type: 'update' as const,
      recipients: Math.floor(Math.random() * 200) + 50,
      sent: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      engagement: {
        opened: Math.floor(Math.random() * 150) + 40,
        clicked: Math.floor(Math.random() * 50) + 10,
        responded: Math.floor(Math.random() * 20) + 2,
      },
    },
  ];
};

const generateInvestorPortfolio = (scenario: DemoScenario) => {
  // This would integrate with existing demoPortfolioData
  return {
    assets: [],
    summary: {
      totalValue: '$0',
      totalInvested: '$0',
      totalGain: '$0',
      totalGainPercent: '0.0%',
      isPositive: true,
    },
  };
};

const generateRecommendations = (scenario: DemoScenario) => {
  return [
    {
      id: 'rec_1',
      title: 'Diversified Real Estate REIT',
      category: 'Real Estate',
      expectedAPY: `${(Math.random() * 3 + 7).toFixed(1)}%`,
      minimumInvestment: '$1,000',
      riskLevel: 'medium' as const,
      matchScore: Math.floor(Math.random() * 20) + 80,
      reason: 'Matches your risk profile and investment preferences',
    },
  ];
};

const generateGovernanceProposals = (scenario: DemoScenario) => {
  return [
    {
      id: 'gov_1',
      title: 'Platform Fee Structure Update',
      type: 'platform' as const,
      status: 'active' as const,
      votingDeadline: new Date(Date.now() + Math.random() * 86400000 * 7).toISOString(),
      userVoted: false,
      votingPower: Math.floor(Math.random() * 1000) + 100,
    },
  ];
};

const generateTransactions = (scenario: DemoScenario) => {
  return [
    {
      id: 'tx_1',
      type: 'investment' as const,
      assetName: 'Prime Office REIT',
      amount: `$${(Math.random() * 10 + 1).toFixed(0)}K`,
      date: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      status: 'completed' as const,
      txHash: 'neutron1234567890abcdef',
    },
  ];
};

const generateInvestorAnalytics = (scenario: DemoScenario) => {
  return {
    totalReturn: `+${(Math.random() * 15 + 5).toFixed(1)}%`,
    bestPerformer: 'Real Estate Portfolio',
    diversificationScore: Math.floor(Math.random() * 30) + 70,
    riskProfile: 'moderate' as const,
  };
};

// Main service class
export class RoleBasedDemoDataService {
  private static instance: RoleBasedDemoDataService;

  public static getInstance(): RoleBasedDemoDataService {
    if (!RoleBasedDemoDataService.instance) {
      RoleBasedDemoDataService.instance = new RoleBasedDemoDataService();
    }
    return RoleBasedDemoDataService.instance;
  }

  public generateRoleData(role: SessionRole, scenario?: DemoScenario) {
    const currentScenario = scenario || useDemoModeStore.getState().scenario;
    
    const baseData = {
      persona: generateUserPersona(role, currentScenario),
      timestamp: new Date().toISOString(),
      scenario: currentScenario,
    };

    switch (role) {
      case 'super_admin':
      case 'owner':
        return {
          ...baseData,
          adminData: generateAdminData(currentScenario),
        };

      case 'creator':
        return {
          ...baseData,
          creatorData: generateCreatorData(currentScenario),
        };

      case 'investor':
        return {
          ...baseData,
          investorData: generateInvestorData(currentScenario),
        };

      default:
        return baseData;
    }
  }

  public seedDataForRole(role: SessionRole, scenario?: DemoScenario) {
    const data = this.generateRoleData(role, scenario);
    
    // Store in sessionStorage for immediate access
    sessionStorage.setItem(`cf1_role_data_${role}`, JSON.stringify(data));
    
    console.log(`🎭 [ROLE DATA] Generated and seeded data for role: ${role}`, data);
    
    return data;
  }

  public getRoleData(role: SessionRole) {
    const stored = sessionStorage.getItem(`cf1_role_data_${role}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Generate fresh data if none exists
    return this.seedDataForRole(role);
  }

  public clearRoleData(role?: SessionRole) {
    if (role) {
      sessionStorage.removeItem(`cf1_role_data_${role}`);
    } else {
      // Clear all role data
      ['investor', 'creator', 'super_admin', 'owner'].forEach(r => {
        sessionStorage.removeItem(`cf1_role_data_${r}`);
      });
    }
  }

  public switchToRole(role: SessionRole, scenario?: DemoScenario) {
    // Clear existing data and generate fresh data for new role
    this.clearRoleData();
    const data = this.seedDataForRole(role, scenario);
    
    // Update session store
    const sessionStore = (window as any).sessionStore;
    if (sessionStore) {
      sessionStore.getState().setRole(role);
    }

    console.log(`🔄 [ROLE SWITCH] Switched to role: ${role}`, data);
    
    return data;
  }
}

// Export singleton instance and hook
export const roleBasedDemoData = RoleBasedDemoDataService.getInstance();

// React hook for role-based data
export const useRoleBasedData = (role?: SessionRole) => {
  const currentRole = role || 'investor'; // Default fallback
  const { isDemoMode } = useDemoModeStore();
  
  if (!isDemoMode()) {
    return null;
  }

  return roleBasedDemoData.getRoleData(currentRole);
};

export default roleBasedDemoData;