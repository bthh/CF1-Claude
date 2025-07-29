import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RewardTier {
  name: string;
  minTokens: number;
  maxTokens: number | null;
  color: string;
  benefits: string[];
  multiplier: number;
}

export interface AssetReward {
  assetId: string;
  assetName: string;
  totalRewards: number;
  monthlyRewards: number;
  yearlyProjection: number;
  lastDistribution: string;
  nextDistribution: string;
  tier: RewardTier;
  tokensHeld: number;
  rewardHistory: RewardHistoryEntry[];
}

export interface RewardHistoryEntry {
  id: string;
  date: string;
  amount: number;
  type: 'dividend' | 'appreciation' | 'bonus' | 'tier_upgrade';
  description: string;
  status: 'completed' | 'pending' | 'processing';
}

export interface RewardsState {
  assetRewards: AssetReward[];
  totalRewardsEarned: number;
  totalMonthlyRewards: number;
  totalYearlyProjection: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAssetRewards: () => Promise<void>;
  getAssetReward: (assetId: string) => AssetReward | undefined;
  getTierForTokens: (assetId: string, tokens: number) => RewardTier;
  calculateRewards: (assetId: string, tokens: number) => number;
  updateAssetRewards: (assetId: string, rewards: Partial<AssetReward>) => void;
  clearError: () => void;
}

// Default tier system
const DEFAULT_TIERS: RewardTier[] = [
  {
    name: 'Bronze',
    minTokens: 1,
    maxTokens: 99,
    color: '#CD7F32',
    benefits: ['Basic rewards', 'Monthly distributions', 'Platform updates'],
    multiplier: 1.0
  },
  {
    name: 'Silver',
    minTokens: 100,
    maxTokens: 499,
    color: '#C0C0C0',
    benefits: ['Enhanced rewards', 'Bi-weekly distributions', 'Early access to proposals', 'Community forum access'],
    multiplier: 1.25
  },
  {
    name: 'Gold',
    minTokens: 500,
    maxTokens: 999,
    color: '#FFD700',
    benefits: ['Premium rewards', 'Weekly distributions', 'Exclusive proposals', 'Direct creator access', 'Priority support'],
    multiplier: 1.5
  },
  {
    name: 'Platinum',
    minTokens: 1000,
    maxTokens: null,
    color: '#E5E4E2',
    benefits: ['Maximum rewards', 'Real-time distributions', 'VIP proposals', 'Creator advisory board', 'Personalized service', 'Bonus rewards'],
    multiplier: 2.0
  }
];

// Mock reward history data
const generateRewardHistory = (assetId: string): RewardHistoryEntry[] => [
  {
    id: '1',
    date: '2024-12-15',
    amount: 125.50,
    type: 'dividend',
    description: 'Monthly dividend distribution',
    status: 'completed'
  },
  {
    id: '2',
    date: '2024-11-15',
    amount: 118.75,
    type: 'dividend',
    description: 'Monthly dividend distribution',
    status: 'completed'
  },
  {
    id: '3',
    date: '2024-10-22',
    amount: 50.00,
    type: 'bonus',
    description: 'Asset performance bonus',
    status: 'completed'
  },
  {
    id: '4',
    date: '2024-10-15',
    amount: 110.25,
    type: 'dividend',
    description: 'Monthly dividend distribution',
    status: 'completed'
  },
  {
    id: '5',
    date: '2024-09-15',
    amount: 105.00,
    type: 'dividend',
    description: 'Monthly dividend distribution',
    status: 'completed'
  }
];

// Mock asset reward data
const MOCK_ASSET_REWARDS: AssetReward[] = [
  {
    assetId: '1',
    assetName: 'Manhattan Office Complex',
    totalRewards: 1247.50,
    monthlyRewards: 125.50,
    yearlyProjection: 1506.00,
    lastDistribution: '2024-12-15',
    nextDistribution: '2025-01-15',
    tier: DEFAULT_TIERS[2], // Gold tier
    tokensHeld: 450,
    rewardHistory: generateRewardHistory('1')
  },
  {
    assetId: '2',
    assetName: 'Gold Bullion Vault',
    totalRewards: 892.25,
    monthlyRewards: 89.25,
    yearlyProjection: 1071.00,
    lastDistribution: '2024-12-15',
    nextDistribution: '2025-01-15',
    tier: DEFAULT_TIERS[2], // Gold tier
    tokensHeld: 580,
    rewardHistory: generateRewardHistory('2')
  },
  {
    assetId: '3',
    assetName: 'Tesla Model S Collection',
    totalRewards: 344.75,
    monthlyRewards: 34.50,
    yearlyProjection: 414.00,
    lastDistribution: '2024-12-15',
    nextDistribution: '2025-01-15',
    tier: DEFAULT_TIERS[1], // Silver tier
    tokensHeld: 125,
    rewardHistory: generateRewardHistory('3')
  },
  {
    assetId: '4',
    assetName: 'Modern Art Collection',
    totalRewards: 1125.00,
    monthlyRewards: 112.50,
    yearlyProjection: 1350.00,
    lastDistribution: '2024-12-15',
    nextDistribution: '2025-01-15',
    tier: DEFAULT_TIERS[0], // Bronze tier
    tokensHeld: 75,
    rewardHistory: generateRewardHistory('4')
  },
  {
    assetId: '5',
    assetName: 'Miami Beach Resort',
    totalRewards: 2150.00,
    monthlyRewards: 215.00,
    yearlyProjection: 2580.00,
    lastDistribution: '2024-12-15',
    nextDistribution: '2025-01-15',
    tier: DEFAULT_TIERS[1], // Silver tier
    tokensHeld: 200,
    rewardHistory: generateRewardHistory('5')
  }
];

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      assetRewards: [],
      totalRewardsEarned: 0,
      totalMonthlyRewards: 0,
      totalYearlyProjection: 0,
      isLoading: false,
      error: null,

      fetchAssetRewards: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const totalRewards = MOCK_ASSET_REWARDS.reduce((sum, asset) => sum + asset.totalRewards, 0);
          const totalMonthly = MOCK_ASSET_REWARDS.reduce((sum, asset) => sum + asset.monthlyRewards, 0);
          const totalYearly = MOCK_ASSET_REWARDS.reduce((sum, asset) => sum + asset.yearlyProjection, 0);
          
          set({
            assetRewards: MOCK_ASSET_REWARDS,
            totalRewardsEarned: totalRewards,
            totalMonthlyRewards: totalMonthly,
            totalYearlyProjection: totalYearly,
            isLoading: false
          });
        } catch (error) {
          set({
            error: 'Failed to fetch asset rewards',
            isLoading: false
          });
        }
      },

      getAssetReward: (assetId: string) => {
        const { assetRewards } = get();
        return assetRewards.find(reward => reward.assetId === assetId);
      },

      getTierForTokens: (assetId: string, tokens: number) => {
        return DEFAULT_TIERS.find(tier => 
          tokens >= tier.minTokens && (tier.maxTokens === null || tokens <= tier.maxTokens)
        ) || DEFAULT_TIERS[0];
      },

      calculateRewards: (assetId: string, tokens: number) => {
        const tier = get().getTierForTokens(assetId, tokens);
        const baseReward = tokens * 0.25; // Base reward calculation
        return baseReward * tier.multiplier;
      },

      updateAssetRewards: (assetId: string, updates: Partial<AssetReward>) => {
        set(state => ({
          assetRewards: state.assetRewards.map(reward =>
            reward.assetId === assetId
              ? { ...reward, ...updates }
              : reward
          )
        }));
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'cf1-rewards-store',
      partialize: (state) => ({
        assetRewards: state.assetRewards,
        totalRewardsEarned: state.totalRewardsEarned,
        totalMonthlyRewards: state.totalMonthlyRewards,
        totalYearlyProjection: state.totalYearlyProjection
      })
    }
  )
);