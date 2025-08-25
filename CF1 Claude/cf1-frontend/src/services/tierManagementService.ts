import React from 'react';
import { useDemoModeStore } from '../store/demoModeStore';
import { AssetTier, TierReward, DEFAULT_TIER_TEMPLATES } from '../types/tiers';
import { usePortfolioData } from './demoPortfolioData';

export interface TierManagementState {
  tiers: Record<string, AssetTier[]>; // assetId -> tiers[]
  loading: boolean;
  error: string | null;
}

// Demo tier data that matches demo portfolio assets by scenario
const DEMO_TIER_DATA: Record<string, Record<string, AssetTier[]>> = {
  sales_demo: {
    'port-sales-1': [ // Austin Tech Hub Office Complex
      {
        id: 'tier-sales-1-diamond',
        assetId: 'port-sales-1',
        name: 'Diamond',
        description: 'Elite commercial real estate investors with premium benefits',
        threshold: 500, // 500+ tokens
        rewards: [
          {
            id: 'reward-1',
            type: 'dividend_bonus',
            title: 'Premium Dividend Bonus',
            description: 'Receive 25% bonus on quarterly dividend distributions',
            value: '25%',
            icon: 'TrendingUp'
          },
          {
            id: 'reward-2',
            type: 'governance_weight',
            title: 'Enhanced Voting Power',
            description: 'Triple voting power in property management decisions',
            value: '3x',
            icon: 'Vote'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.diamond.colorScheme,
        benefits: ['VIP property tours', 'Direct line to property management', 'Exclusive investment opportunities'],
        votingMultiplier: 3,
        priorityAccess: true,
        discountPercentage: 15,
        badge: DEFAULT_TIER_TEMPLATES.diamond.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-1',
        order: 1
      },
      {
        id: 'tier-sales-1-platinum',
        assetId: 'port-sales-1',
        name: 'Platinum',
        description: 'Premium commercial real estate investors',
        threshold: 200, // 200+ tokens
        rewards: [
          {
            id: 'reward-3',
            type: 'dividend_bonus',
            title: 'Platinum Dividend Bonus',
            description: 'Receive 15% bonus on dividend distributions',
            value: '15%',
            icon: 'TrendingUp'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.platinum.colorScheme,
        benefits: ['Priority customer support', 'Monthly property updates'],
        votingMultiplier: 2,
        priorityAccess: true,
        discountPercentage: 10,
        badge: DEFAULT_TIER_TEMPLATES.platinum.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-1',
        order: 2
      }
    ],
    'port-sales-2': [ // Diversified Precious Metals Fund
      {
        id: 'tier-sales-2-gold',
        assetId: 'port-sales-2',
        name: 'Gold',
        description: 'Premium precious metals investors',
        threshold: 400, // 400+ tokens
        rewards: [
          {
            id: 'reward-4',
            type: 'dividend_bonus',
            title: 'Gold Dividend Bonus',
            description: 'Receive 20% bonus on precious metals distributions',
            value: '20%',
            icon: 'TrendingUp'
          },
          {
            id: 'reward-5',
            type: 'exclusive_access',
            title: 'Vault Access',
            description: 'Exclusive access to vault viewing and reports',
            icon: 'Lock'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.gold.colorScheme,
        benefits: ['Physical gold viewing access', 'Quarterly vault reports', 'Metal market insights'],
        votingMultiplier: 2,
        priorityAccess: true,
        discountPercentage: 12,
        badge: DEFAULT_TIER_TEMPLATES.gold.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-2',
        order: 1
      }
    ],
    'port-sales-3': [ // Contemporary Art Investment Portfolio
      {
        id: 'tier-sales-3-platinum',
        assetId: 'port-sales-3',
        name: 'Platinum',
        description: 'Elite art collectors and investors',
        threshold: 100, // 100+ tokens
        rewards: [
          {
            id: 'reward-6',
            type: 'exclusive_access',
            title: 'Gallery VIP Access',
            description: 'Exclusive access to gallery events and private viewings',
            icon: 'Crown'
          },
          {
            id: 'reward-7',
            type: 'dividend_bonus',
            title: 'Art Appreciation Bonus',
            description: 'Enhanced returns from art appreciation events',
            value: '18%',
            icon: 'TrendingUp'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.platinum.colorScheme,
        benefits: ['Private gallery viewings', 'Artist meet & greets', 'Art market analysis reports'],
        votingMultiplier: 2,
        priorityAccess: true,
        discountPercentage: 15,
        badge: DEFAULT_TIER_TEMPLATES.platinum.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-3',
        order: 1
      }
    ],

    'port-sales-4': [ // Clean Energy Infrastructure Fund
      {
        id: 'tier-sales-4-gold',
        assetId: 'port-sales-4',
        name: 'Gold',
        description: 'Committed renewable energy investors with green benefits',
        threshold: 250, // 250+ tokens
        rewards: [
          {
            id: 'reward-4',
            type: 'dividend_bonus',
            title: 'Green Energy Bonus',
            description: 'Receive 12% bonus on clean energy dividend distributions',
            value: '12%',
            icon: 'TrendingUp'
          },
          {
            id: 'reward-5',
            type: 'exclusive_access',
            title: 'Facility Tours',
            description: 'Exclusive access to renewable energy facility tours',
            icon: 'Lock'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.gold.colorScheme,
        benefits: ['Clean energy facility tours', 'Environmental impact reports', 'Green investment priority'],
        votingMultiplier: 2,
        priorityAccess: true,
        discountPercentage: 10,
        badge: DEFAULT_TIER_TEMPLATES.gold.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-4',
        order: 1
      },
      {
        id: 'tier-sales-4-silver',
        assetId: 'port-sales-4',
        name: 'Silver',
        description: 'Entry-level renewable energy supporters',
        threshold: 100, // 100+ tokens
        rewards: [
          {
            id: 'reward-6',
            type: 'custom',
            title: 'Green Newsletter',
            description: 'Monthly sustainable energy market updates',
            icon: 'Mail'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.silver.colorScheme,
        benefits: ['Monthly green energy reports', 'Community forum access'],
        votingMultiplier: 1.5,
        priorityAccess: false,
        discountPercentage: 5,
        badge: DEFAULT_TIER_TEMPLATES.silver.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-4',
        order: 2
      }
    ],

    'port-sales-5': [ // Luxury Vehicle Collection Fund
      {
        id: 'tier-sales-5-platinum',
        assetId: 'port-sales-5',
        name: 'Platinum',
        description: 'Premium luxury vehicle collectors with exclusive perks',
        threshold: 150, // 150+ tokens
        rewards: [
          {
            id: 'reward-7',
            type: 'dividend_bonus',
            title: 'Luxury Bonus',
            description: 'Receive 10% bonus on luxury vehicle appreciation',
            value: '10%',
            icon: 'TrendingUp'
          },
          {
            id: 'reward-8',
            type: 'exclusive_access',
            title: 'Vehicle Events',
            description: 'VIP access to luxury car shows and auctions',
            icon: 'Lock'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.platinum.colorScheme,
        benefits: ['VIP car show access', 'Private vehicle viewings', 'Collector community events'],
        votingMultiplier: 2,
        priorityAccess: true,
        discountPercentage: 12,
        badge: DEFAULT_TIER_TEMPLATES.platinum.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-5',
        order: 1
      },
      {
        id: 'tier-sales-5-bronze',
        assetId: 'port-sales-5',
        name: 'Bronze',
        description: 'Entry-level luxury vehicle enthusiasts',
        threshold: 50, // 50+ tokens
        rewards: [
          {
            id: 'reward-9',
            type: 'custom',
            title: 'Vehicle Reports',
            description: 'Quarterly luxury vehicle market analysis',
            icon: 'FileText'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.bronze.colorScheme,
        benefits: ['Market analysis reports', 'Vehicle investment guides'],
        votingMultiplier: 1,
        priorityAccess: false,
        discountPercentage: 3,
        badge: DEFAULT_TIER_TEMPLATES.bronze.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-5',
        order: 2
      }
    ]
  },
  
  investor_presentation: {
    'port-inv-1': [ // Prime Manhattan Office Tower
      {
        id: 'tier-inv-1-diamond',
        assetId: 'port-inv-1',
        name: 'Diamond',
        description: 'Elite Manhattan real estate investors',
        threshold: 800, // 800+ tokens
        rewards: [
          {
            id: 'reward-inv-1',
            type: 'dividend_bonus',
            title: 'Premium Manhattan Dividend',
            description: 'Receive 30% bonus on all property distributions',
            value: '30%',
            icon: 'TrendingUp'
          },
          {
            id: 'reward-inv-2',
            type: 'exclusive_access',
            title: 'Executive Floor Access',
            description: 'Access to executive conference facilities',
            icon: 'Crown'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.diamond.colorScheme,
        benefits: ['Executive floor privileges', 'Manhattan real estate network access', 'Priority in future NYC developments'],
        votingMultiplier: 3,
        priorityAccess: true,
        discountPercentage: 20,
        badge: DEFAULT_TIER_TEMPLATES.diamond.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-inv-1',
        order: 1
      }
    ],
    'port-inv-2': [ // Swiss Gold Reserve Vault
      {
        id: 'tier-inv-2-diamond',
        assetId: 'port-inv-2',
        name: 'Diamond',
        description: 'Elite Swiss gold vault investors',
        threshold: 1000, // 1000+ tokens
        rewards: [
          {
            id: 'reward-inv-3',
            type: 'dividend_bonus',
            title: 'Swiss Vault Premium',
            description: 'Maximum returns from Swiss gold operations',
            value: '35%',
            icon: 'TrendingUp'
          },
          {
            id: 'reward-inv-4',
            type: 'exclusive_access',
            title: 'Vault Visit Rights',
            description: 'Annual Swiss vault inspection tours',
            icon: 'Lock'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.diamond.colorScheme,
        benefits: ['Annual Swiss vault tours', 'Direct precious metals trading', 'Gold market intelligence'],
        votingMultiplier: 3,
        priorityAccess: true,
        discountPercentage: 25,
        badge: DEFAULT_TIER_TEMPLATES.diamond.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-inv-2',
        order: 1
      }
    ]
  },

  user_onboarding: {
    'port-onboard-1': [ // Beginner Real Estate Investment Trust
      {
        id: 'tier-onboard-1-bronze',
        assetId: 'port-onboard-1',
        name: 'Bronze',
        description: 'Entry-level real estate investors',
        threshold: 100, // 100+ tokens
        rewards: [
          {
            id: 'reward-onboard-1',
            type: 'exclusive_access',
            title: 'Learning Center Access',
            description: 'Access to real estate investment education materials',
            icon: 'Lock'
          },
          {
            id: 'reward-onboard-2',
            type: 'custom',
            title: 'New Investor Support',
            description: 'Dedicated support for first-time real estate investors',
            icon: 'Users'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.bronze.colorScheme,
        benefits: ['Real estate education materials', 'New investor webinars', 'Community forum access'],
        votingMultiplier: 1,
        priorityAccess: false,
        discountPercentage: 5,
        badge: DEFAULT_TIER_TEMPLATES.bronze.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-onboard-1',
        order: 1
      },
      {
        id: 'tier-onboard-1-silver',
        assetId: 'port-onboard-1',
        name: 'Silver',
        description: 'Growing real estate investors',
        threshold: 200, // 200+ tokens
        rewards: [
          {
            id: 'reward-onboard-3',
            type: 'dividend_bonus',
            title: 'Growth Dividend Bonus',
            description: 'Small bonus for growing your investment',
            value: '8%',
            icon: 'TrendingUp'
          }
        ],
        colorScheme: DEFAULT_TIER_TEMPLATES.silver.colorScheme,
        benefits: ['Enhanced support', 'Investment growth tracking', 'Market insights'],
        votingMultiplier: 1.5,
        priorityAccess: true,
        discountPercentage: 8,
        badge: DEFAULT_TIER_TEMPLATES.silver.badge,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'creator-onboard-1',
        order: 2
      }
    ]
  }
};

class TierManagementService {
  private state: TierManagementState = {
    tiers: {},
    loading: false,
    error: null
  };

  private subscribers: Array<(state: TierManagementState) => void> = [];
  private storageKey = 'cf1-user-created-tiers';

  constructor() {
    this.loadFromStorage();
  }

  subscribe(callback: (state: TierManagementState) => void) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const tierData = JSON.parse(stored);
        this.state.tiers = tierData;
        console.log(`🔄 tierManagementService: Loaded user tiers from localStorage:`, Object.keys(tierData).length, 'assets');
      }
    } catch (error) {
      console.warn('Failed to load user tiers from localStorage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state.tiers));
      console.log(`💾 tierManagementService: Saved user tiers to localStorage:`, Object.keys(this.state.tiers).length, 'assets');
    } catch (error) {
      console.warn('Failed to save user tiers to localStorage:', error);
    }
  }

  private notify() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  private setState(newState: Partial<TierManagementState>) {
    this.state = { ...this.state, ...newState };
    this.saveToStorage(); // Save to localStorage whenever state changes
    this.notify();
  }

  async getTiersForAsset(assetId: string): Promise<AssetTier[]> {
    const { isEnabled, scenario } = useDemoModeStore.getState();
    
    if (!isEnabled) {
      // In production mode, return empty for now (would call real API)
      return [];
    }

    // First check if there are user-created tiers in state
    if (this.state.tiers[assetId] && this.state.tiers[assetId].length > 0) {
      console.log(`🎯 tierManagementService: Returning ${this.state.tiers[assetId].length} user-created tiers for ${assetId}`);
      return this.state.tiers[assetId];
    }

    // Fallback to demo data for the current scenario
    const scenarioData = DEMO_TIER_DATA[scenario];
    if (!scenarioData) {
      return [];
    }

    const defaultTiers = scenarioData[assetId] || [];
    console.log(`🎭 tierManagementService: Returning ${defaultTiers.length} default demo tiers for ${assetId}`);
    return defaultTiers;
  }

  async getAllTiers(): Promise<Record<string, AssetTier[]>> {
    const { isEnabled, scenario } = useDemoModeStore.getState();
    
    if (!isEnabled) {
      // In production mode, would call real API
      return {};
    }

    // Start with demo data as base
    const baseTiers = { ...DEMO_TIER_DATA[scenario] } || {};
    
    // Override with any user-created tiers
    const allTiers = { ...baseTiers, ...this.state.tiers };
    
    console.log(`🎯 tierManagementService: getAllTiers returning`, Object.keys(allTiers).length, 'assets with tiers');
    return allTiers;
  }

  async createTier(assetId: string, tierData: Partial<AssetTier>): Promise<AssetTier> {
    const { isEnabled } = useDemoModeStore.getState();
    
    if (!isEnabled) {
      // In production mode, would call real API
      throw new Error('Tier creation not available in production mode');
    }

    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newTier: AssetTier = {
      id: `tier-${Date.now()}`,
      assetId,
      name: tierData.name || '',
      description: tierData.description || '',
      threshold: tierData.threshold || 0,
      rewards: tierData.rewards || [],
      colorScheme: tierData.colorScheme,
      benefits: tierData.benefits || [],
      votingMultiplier: tierData.votingMultiplier || 1,
      priorityAccess: tierData.priorityAccess || false,
      discountPercentage: tierData.discountPercentage || 0,
      badge: tierData.badge,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'demo-creator',
      order: (this.state.tiers[assetId]?.length || 0) + 1
    };

    // Update local state
    const currentTiers = this.state.tiers[assetId] || [];
    this.setState({
      tiers: {
        ...this.state.tiers,
        [assetId]: [...currentTiers, newTier]
      }
    });

    return newTier;
  }

  async updateTier(assetId: string, tierId: string, tierData: Partial<AssetTier>): Promise<AssetTier> {
    const { isEnabled } = useDemoModeStore.getState();
    
    if (!isEnabled) {
      throw new Error('Tier updates not available in production mode');
    }

    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentTiers = this.state.tiers[assetId] || [];
    const tierIndex = currentTiers.findIndex(tier => tier.id === tierId);
    
    if (tierIndex === -1) {
      throw new Error('Tier not found');
    }

    const updatedTier = {
      ...currentTiers[tierIndex],
      ...tierData,
      updatedAt: new Date().toISOString()
    };

    const updatedTiers = [...currentTiers];
    updatedTiers[tierIndex] = updatedTier;

    this.setState({
      tiers: {
        ...this.state.tiers,
        [assetId]: updatedTiers
      }
    });

    return updatedTier;
  }

  async deleteTier(assetId: string, tierId: string): Promise<void> {
    const { isEnabled } = useDemoModeStore.getState();
    
    if (!isEnabled) {
      throw new Error('Tier deletion not available in production mode');
    }

    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentTiers = this.state.tiers[assetId] || [];
    const updatedTiers = currentTiers.filter(tier => tier.id !== tierId);

    this.setState({
      tiers: {
        ...this.state.tiers,
        [assetId]: updatedTiers
      }
    });
  }

  async loadTiersForCurrentScenario(): Promise<void> {
    this.setState({ loading: true, error: null });

    try {
      const allTiers = await this.getAllTiers();
      this.setState({ tiers: allTiers, loading: false });
    } catch (error) {
      this.setState({ 
        error: error instanceof Error ? error.message : 'Failed to load tiers',
        loading: false 
      });
    }
  }

  // Get user's tier for a specific asset based on their token holdings
  getUserTierForAsset(assetId: string, userTokens: number): AssetTier | null {
    // Get tiers using the same logic as getTiersForAsset
    const { isEnabled, scenario } = useDemoModeStore.getState();
    
    let tiers: AssetTier[] = [];
    
    // First check if there are user-created tiers in state
    if (this.state.tiers[assetId] && this.state.tiers[assetId].length > 0) {
      tiers = this.state.tiers[assetId];
    } else if (isEnabled) {
      // Fallback to demo data for the current scenario
      const scenarioData = DEMO_TIER_DATA[scenario];
      tiers = scenarioData?.[assetId] || [];
    }
    
    // Sort tiers by threshold descending to find highest qualifying tier
    const sortedTiers = [...tiers]
      .filter(tier => tier.status === 'active')
      .sort((a, b) => b.threshold - a.threshold);

    return sortedTiers.find(tier => userTokens >= tier.threshold) || null;
  }

  // Get upgrade path for user - their current tier + all higher tiers
  getUserUpgradePath(assetId: string, userTokens: number): {
    currentTier: AssetTier | null;
    nextTier: AssetTier | null;
    upgradeTiers: AssetTier[];
    tokensToNextTier: number;
  } {
    // Get tiers using the same logic as getTiersForAsset
    const { isEnabled, scenario } = useDemoModeStore.getState();
    
    let tiers: AssetTier[] = [];
    
    // First check if there are user-created tiers in state
    if (this.state.tiers[assetId] && this.state.tiers[assetId].length > 0) {
      tiers = this.state.tiers[assetId];
    } else if (isEnabled) {
      // Fallback to demo data for the current scenario
      const scenarioData = DEMO_TIER_DATA[scenario];
      tiers = scenarioData?.[assetId] || [];
    }
    
    const activeTiers = tiers.filter(tier => tier.status === 'active');
    
    // Sort by threshold ascending for upgrade path
    const sortedTiers = [...activeTiers].sort((a, b) => a.threshold - b.threshold);
    
    // Find current tier (highest threshold user meets)
    const currentTier = this.getUserTierForAsset(assetId, userTokens);
    
    // Find all tiers above current (upgrade path)
    const currentTierIndex = currentTier 
      ? sortedTiers.findIndex(tier => tier.id === currentTier.id)
      : -1;
    
    const upgradeTiers = sortedTiers.slice(currentTierIndex + 1);
    const nextTier = upgradeTiers[0] || null;
    const tokensToNextTier = nextTier ? Math.max(0, nextTier.threshold - userTokens) : 0;

    return {
      currentTier,
      nextTier,
      upgradeTiers,
      tokensToNextTier
    };
  }

  // Get incentive summary for portfolio display
  getUpgradeIncentive(assetId: string, userTokens: number): {
    hasUpgrade: boolean;
    nextTierName: string;
    tokensNeeded: number;
    topBenefits: string[];
    rewardHighlight: string;
  } | null {
    const upgradePath = this.getUserUpgradePath(assetId, userTokens);
    
    if (!upgradePath.nextTier) {
      return null; // Already at highest tier
    }

    const nextTier = upgradePath.nextTier;
    
    return {
      hasUpgrade: true,
      nextTierName: nextTier.name,
      tokensNeeded: upgradePath.tokensToNextTier,
      topBenefits: nextTier.benefits?.slice(0, 2) || [],
      rewardHighlight: nextTier.rewards[0]?.title || ''
    };
  }

  getState(): TierManagementState {
    return this.state;
  }

  // Method to reset all user-created tiers (for testing)
  clearUserTiers() {
    this.setState({
      tiers: {}
    });
    console.log(`🗑️ tierManagementService: Cleared all user-created tiers`);
  }

  // Method to reset tiers for a specific asset (for testing)
  clearAssetTiers(assetId: string) {
    const { [assetId]: removed, ...remainingTiers } = this.state.tiers;
    this.setState({
      tiers: remainingTiers
    });
    console.log(`🗑️ tierManagementService: Cleared user tiers for asset ${assetId}`);
  }
}

// Export singleton instance
export const tierManagementService = new TierManagementService();

// React hook for using tier management service
export const useTierManagement = () => {
  const [state, setState] = React.useState<TierManagementState>(tierManagementService.getState());

  React.useEffect(() => {
    const unsubscribe = tierManagementService.subscribe(setState);
    
    // Load tiers when component mounts or demo mode changes
    tierManagementService.loadTiersForCurrentScenario();
    
    return unsubscribe;
  }, []);

  return {
    ...state,
    getTiersForAsset: tierManagementService.getTiersForAsset.bind(tierManagementService),
    createTier: tierManagementService.createTier.bind(tierManagementService),
    updateTier: tierManagementService.updateTier.bind(tierManagementService),
    deleteTier: tierManagementService.deleteTier.bind(tierManagementService),
    getUserTier: tierManagementService.getUserTierForAsset.bind(tierManagementService),
    getUserUpgradePath: tierManagementService.getUserUpgradePath.bind(tierManagementService),
    getUpgradeIncentive: tierManagementService.getUpgradeIncentive.bind(tierManagementService),
    refreshTiers: tierManagementService.loadTiersForCurrentScenario.bind(tierManagementService),
    clearUserTiers: tierManagementService.clearUserTiers.bind(tierManagementService),
    clearAssetTiers: tierManagementService.clearAssetTiers.bind(tierManagementService)
  };
};

// Hook for getting tier information in portfolio displays
export const usePortfolioTiers = () => {
  const { assets } = usePortfolioData();
  const { tiers, getUserTier } = useTierManagement();

  const getAssetWithTiers = (assetId: string, userTokens?: number) => {
    const asset = assets.find(a => a.id === assetId);
    const assetTiers = tiers[assetId] || [];
    const userTier = userTokens ? getUserTier(assetId, userTokens) : null;

    return {
      asset,
      tiers: assetTiers,
      userTier,
      hasActiveTiers: assetTiers.some(tier => tier.status === 'active')
    };
  };

  return {
    getAssetWithTiers,
    getAllTiers: () => tiers,
    assets: assets.map(asset => getAssetWithTiers(asset.id, asset.tokens))
  };
};