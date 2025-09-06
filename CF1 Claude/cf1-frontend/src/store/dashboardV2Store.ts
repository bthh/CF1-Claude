import { create } from 'zustand';
import { DashboardVariant } from '../components/Dashboard/DashboardV2';
import { useDataModeStore } from './dataModeStore';
import { useDemoModeStore } from './demoModeStore';
import { useLaunchpadProposals } from '../services/demoLaunchpadData';
import { useMarketplaceAssets } from '../services/demoMarketplaceData';

// Stable functions defined outside the store to prevent recreating on every update
const determineVariant = ({ isConnected, isRoleSelected, selectedRole, hasAssets }: {
  isConnected: boolean;
  isRoleSelected: boolean;
  selectedRole: string | null;
  hasAssets: boolean;
}): DashboardVariant => {
  // Variant A: Not logged in OR no assets
  if (!isConnected || !isRoleSelected || !hasAssets) {
    return 'A';
  }
  
  // Variant C: Creator role
  if (selectedRole === 'creator' || selectedRole === 'super_admin' || selectedRole === 'owner') {
    return 'C';
  }
  
  // Variant B: Active investor (has assets)
  if (hasAssets && selectedRole === 'investor') {
    return 'B';
  }
  
  // Default to variant A
  return 'A';
};

export interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
  performance: number;
  image?: string;
}

export interface PortfolioMetrics {
  totalValue: number;
  monthlyChange: number;
  monthlyChangePercent: number;
  totalAssets: number;
  totalVotes: number;
  totalRewards: number;
  roi: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  timeLeft: string;
  category: string;
  votingPower?: number;
}

export interface CreatorMetrics {
  activeAssets: number;
  totalRaised: number;
  shareholders: number;
  avgPerformance: number;
}

export interface PlatformHighlight {
  label: string;
  value: string;
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  category: string;
}

export interface DashboardV2State {
  selectedVariant: DashboardVariant | null;
  loading: boolean;
  
  // Variant A data (not logged in / no assets)
  featuredProposals: Proposal[];
  platformHighlights: PlatformHighlight[];
  latestNews: NewsItem[];
  
  // Variant B data (active investors)
  portfolioMetrics: PortfolioMetrics | null;
  userAssets: Asset[];
  votingProposals: Proposal[];
  recentRewards: Array<{
    assetName: string;
    amount: number;
    date: string;
  }>;
  newOpportunities: Asset[];
  
  // Variant C data (creators)
  creatorMetrics: CreatorMetrics | null;
  creatorAssets: Array<{
    id: string;
    name: string;
    raised: number;
    shareholders: number;
    performance: number;
    status: 'active' | 'draft' | 'review';
  }>;
  proposalPipeline: Array<{
    id: string;
    title: string;
    status: 'draft' | 'review' | 'approved' | 'rejected';
    completion: number;
  }>;
  shareholderUpdates: Array<{
    assetId: string;
    assetName: string;
    type: 'performance' | 'expansion' | 'dividend';
    priority: 'high' | 'medium' | 'low';
  }>;
  
  // Actions
  setVariant: (variant: DashboardVariant) => void;
  determineVariant: (context: {
    isConnected: boolean;
    isRoleSelected: boolean;
    selectedRole: string | null;
    hasAssets: boolean;
  }) => DashboardVariant;
  loadDashboardData: (variant: DashboardVariant) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useDashboardV2Store = create<DashboardV2State>((set, get) => ({
  selectedVariant: null,
  loading: false,
  
  // Initial data
  featuredProposals: [],
  platformHighlights: [],
  latestNews: [],
  portfolioMetrics: null,
  userAssets: [],
  votingProposals: [],
  recentRewards: [],
  newOpportunities: [],
  creatorMetrics: null,
  creatorAssets: [],
  proposalPipeline: [],
  shareholderUpdates: [],

  setVariant: (variant) => {
    set({ selectedVariant: variant });
  },

  determineVariant,

  loadDashboardData: async (variant) => {
    set({ loading: true });
    
    try {
      // Get current data mode
      const { currentMode } = useDataModeStore.getState();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (variant) {
        case 'A':
          // In demo mode, show mock data
          // In development/production modes, show real data if available, otherwise clean empty state
          if (currentMode === 'demo') {
            // Get demo mode state and fetch actual demo proposals
            const demoModeState = useDemoModeStore.getState();
            const { getDemoLaunchpadProposals } = await import('../services/demoLaunchpadData');
            const demoProposals = getDemoLaunchpadProposals(demoModeState.scenario || 'sales_demo');
            
            // Convert launchpad proposals to featured proposals format (take first 6 active ones)
            const featuredProposals = demoProposals
              .filter(p => p.status === 'active')
              .slice(0, 6)
              .map(proposal => ({
                id: proposal.id,
                title: proposal.title,
                description: proposal.description,
                timeLeft: `${proposal.daysLeft} days`,
                category: proposal.category
              }));

            set({
              featuredProposals,
              platformHighlights: [
                { label: '$50M+ Funded', value: '$52.3M', description: 'Total Platform Funding' },
                { label: '1,200+ Assets', value: '1,247', description: 'Successfully Funded' },
                { label: '15% Avg Return', value: '15.2%', description: 'Investor ROI' }
              ],
              latestNews: [
                {
                  id: '1',
                  title: 'New Seattle Real Estate Proposal',
                  summary: 'Downtown office complex seeking $2.5M in funding',
                  timestamp: '2 hours ago',
                  category: 'real-estate'
                },
                {
                  id: '2',
                  title: 'Platform Upgrade: Enhanced Security Features',
                  summary: 'Multi-factor authentication and advanced encryption now live',
                  timestamp: '1 day ago',
                  category: 'platform'
                },
                {
                  id: '3',
                  title: 'Q3 Performance Report: 18% Portfolio Growth',
                  summary: 'Platform assets continue to outperform market benchmarks',
                  timestamp: '3 days ago',
                  category: 'performance'
                },
                {
                  id: '4',
                  title: 'AI-Powered Investment Analytics Now Live',
                  summary: 'New machine learning algorithms provide real-time market insights',
                  timestamp: '5 days ago',
                  category: 'technology'
                }
              ]
            });
          } else {
            // Production/Development mode: only show real data if available
            // For now, show clean empty state since no real data exists
            set({
              featuredProposals: [],
              platformHighlights: [
                { label: 'Total Assets', value: '0', description: 'Assets on Platform' },
                { label: 'Total Funding', value: '$0', description: 'Total Raised' },
                { label: 'Active Users', value: '0', description: 'Platform Users' }
              ],
              latestNews: []
            });
          }
          break;
          
        case 'B':
          // For active investors, show demo data only in demo mode
          // In development/production, show real portfolio data from portfolioDataService
          if (currentMode === 'demo') {
            set({
              portfolioMetrics: {
                totalValue: 124523,
                monthlyChange: 15847,
                monthlyChangePercent: 12.7,
                totalAssets: 8,
                totalVotes: 23,
                totalRewards: 3420,
                roi: 13.8
              },
              userAssets: [
                {
                  id: '1',
                  name: 'Seattle Office',
                  type: 'Real Estate',
                  value: 45000,
                  performance: 12.3,
                  image: '/api/placeholder/300/200'
                },
                {
                  id: '2',
                  name: 'Wine Collection',
                  type: 'Collectibles',
                  value: 32000,
                  performance: 8.7,
                  image: '/api/placeholder/300/200'
                },
                {
                  id: '3',
                  name: 'Gold Mining',
                  type: 'Commodities',
                  value: 28000,
                  performance: 15.2,
                  image: '/api/placeholder/300/200'
                },
                {
                  id: '4',
                  name: 'Tech Startup',
                  type: 'Technology',
                  value: 19523,
                  performance: 18.9,
                  image: '/api/placeholder/300/200'
                }
              ],
              votingProposals: [
                {
                  id: '47',
                  title: 'Fee Adjustment Proposal',
                  description: 'Proposal to adjust platform fees for improved sustainability',
                  timeLeft: '2 days',
                  category: 'Platform',
                  votingPower: 1250
                },
                {
                  id: '48',
                  title: 'New Asset Class Introduction',
                  description: 'Adding cryptocurrency mining operations to platform',
                  timeLeft: '5 days',
                  category: 'Platform',
                  votingPower: 890
                }
              ],
              recentRewards: [
                { assetName: 'Seattle Office', amount: 1240, date: '2024-01-15' },
                { assetName: 'Gold Mining', amount: 890, date: '2024-01-14' },
                { assetName: 'Wine Collection', amount: 1290, date: '2024-01-12' }
              ],
              newOpportunities: [
                {
                  id: '5',
                  name: 'Tech Startup A',
                  type: 'Technology',
                  value: 1000000,
                  performance: 0,
                  image: '/api/placeholder/300/200'
                },
                {
                  id: '6',
                  name: 'Wine Collection B',
                  type: 'Collectibles',
                  value: 500000,
                  performance: 0,
                  image: '/api/placeholder/300/200'
                }
              ]
            });
          } else {
            // Production/Development mode: show only real user data
            // This would normally fetch from backend API
            set({
              portfolioMetrics: null, // Would be populated from real data
              userAssets: [], // Would be populated from real portfolio
              votingProposals: [], // Would be populated from real governance data
              recentRewards: [],
              newOpportunities: []
            });
          }
          break;
          
        case 'C':
          set({
            creatorMetrics: {
              activeAssets: 3,
              totalRaised: 1200000,
              shareholders: 245,
              avgPerformance: 15.2
            },
            creatorAssets: [
              {
                id: '1',
                name: 'Seattle Office Complex',
                raised: 450000,
                shareholders: 89,
                performance: 12.3,
                status: 'active'
              },
              {
                id: '2',
                name: 'Premium Wine Collection',
                raised: 320000,
                shareholders: 67,
                performance: 8.7,
                status: 'active'
              },
              {
                id: '3',
                name: 'Tech Startup Portfolio',
                raised: 430000,
                shareholders: 89,
                performance: 18.9,
                status: 'active'
              }
            ],
            proposalPipeline: [
              {
                id: '1',
                title: 'Green Energy Fund',
                status: 'draft',
                completion: 67
              },
              {
                id: '2',
                title: 'Industrial Equipment',
                status: 'review',
                completion: 100
              }
            ],
            shareholderUpdates: [
              {
                assetId: '1',
                assetName: 'Seattle Office',
                type: 'performance',
                priority: 'high'
              },
              {
                assetId: '3',
                assetName: 'Tech Startup',
                type: 'expansion',
                priority: 'medium'
              }
            ]
          });
          break;
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      set({ loading: false });
    }
  },

  refreshData: async () => {
    const { selectedVariant, loadDashboardData } = get();
    if (selectedVariant) {
      await loadDashboardData(selectedVariant);
    }
  }
}));