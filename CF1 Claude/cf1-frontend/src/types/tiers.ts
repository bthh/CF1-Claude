// Asset Tier Management Types

export interface TierReward {
  id: string;
  type: 'dividend_bonus' | 'exclusive_access' | 'governance_weight' | 'fee_discount' | 'custom';
  title: string;
  description: string;
  value?: string; // e.g., "5%", "2x", "$100"
  icon?: string;
}

export interface AssetTier {
  id: string;
  assetId: string;
  name: string;
  description: string;
  threshold: number; // Number of tokens required
  rewards: TierReward[];
  profilePicture?: string;
  
  // Optional tier properties
  colorScheme?: {
    primary: string;
    secondary: string;
    background: string;
  };
  benefits?: string[]; // Additional exclusive benefits
  votingMultiplier?: number; // Governance voting power multiplier (default 1.0)
  priorityAccess?: boolean; // Priority access to new offerings
  discountPercentage?: number; // Fee discount percentage
  badge?: {
    icon: string;
    label: string;
  };
  minimumHoldingPeriod?: number; // Days required to maintain tier
  
  // System properties
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  order: number; // Display order (1-5)
}

export interface TierTemplate {
  name: string;
  description: string;
  colorScheme: {
    primary: string;
    secondary: string;
    background: string;
  };
  defaultRewards: Omit<TierReward, 'id'>[];
  suggestedThreshold?: number;
  badge: {
    icon: string;
    label: string;
  };
}

export const DEFAULT_TIER_TEMPLATES: Record<string, TierTemplate> = {
  diamond: {
    name: 'Diamond',
    description: 'Elite tier with maximum benefits and exclusive access',
    colorScheme: {
      primary: '#E8F4FD',
      secondary: '#2563EB',
      background: 'linear-gradient(135deg, #E8F4FD 0%, #DBEAFE 100%)'
    },
    defaultRewards: [
      {
        type: 'dividend_bonus',
        title: 'Premium Dividend Bonus',
        description: 'Receive enhanced dividend distributions',
        value: '25%',
        icon: 'TrendingUp'
      },
      {
        type: 'governance_weight',
        title: 'Enhanced Voting Power',
        description: 'Increased influence in governance decisions',
        value: '3x',
        icon: 'Vote'
      },
      {
        type: 'exclusive_access',
        title: 'VIP Access',
        description: 'Priority access to new investment opportunities',
        icon: 'Crown'
      }
    ],
    badge: {
      icon: 'Gem',
      label: 'Diamond Member'
    }
  },
  platinum: {
    name: 'Platinum',
    description: 'Premium tier with enhanced benefits and priority access',
    colorScheme: {
      primary: '#F3F4F6',
      secondary: '#6B7280',
      background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)'
    },
    defaultRewards: [
      {
        type: 'dividend_bonus',
        title: 'Platinum Dividend Bonus',
        description: 'Enhanced dividend distributions',
        value: '15%',
        icon: 'TrendingUp'
      },
      {
        type: 'governance_weight',
        title: 'Elevated Voting Power',
        description: 'Increased voting influence',
        value: '2x',
        icon: 'Vote'
      },
      {
        type: 'fee_discount',
        title: 'Transaction Fee Discount',
        description: 'Reduced fees on platform transactions',
        value: '10%',
        icon: 'DollarSign'
      }
    ],
    badge: {
      icon: 'Award',
      label: 'Platinum Member'
    }
  },
  gold: {
    name: 'Gold',
    description: 'Premium tier with valuable benefits and recognition',
    colorScheme: {
      primary: '#FEF3C7',
      secondary: '#D97706',
      background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
    },
    defaultRewards: [
      {
        type: 'dividend_bonus',
        title: 'Gold Dividend Bonus',
        description: 'Bonus dividend distributions',
        value: '10%',
        icon: 'TrendingUp'
      },
      {
        type: 'governance_weight',
        title: 'Enhanced Voting Rights',
        description: 'Increased voting power in decisions',
        value: '1.5x',
        icon: 'Vote'
      },
      {
        type: 'exclusive_access',
        title: 'Early Access',
        description: 'Early access to platform updates and features',
        icon: 'Zap'
      }
    ],
    badge: {
      icon: 'Medal',
      label: 'Gold Member'
    }
  },
  silver: {
    name: 'Silver',
    description: 'Intermediate tier with solid benefits and community recognition',
    colorScheme: {
      primary: '#F1F5F9',
      secondary: '#64748B',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
    },
    defaultRewards: [
      {
        type: 'dividend_bonus',
        title: 'Silver Dividend Bonus',
        description: 'Additional dividend distributions',
        value: '5%',
        icon: 'TrendingUp'
      },
      {
        type: 'fee_discount',
        title: 'Platform Fee Discount',
        description: 'Reduced platform transaction fees',
        value: '5%',
        icon: 'DollarSign'
      },
      {
        type: 'custom',
        title: 'Community Recognition',
        description: 'Special member badge and community perks',
        icon: 'Users'
      }
    ],
    badge: {
      icon: 'Star',
      label: 'Silver Member'
    }
  },
  bronze: {
    name: 'Bronze',
    description: 'Entry tier with foundational benefits and community access',
    colorScheme: {
      primary: '#FED7AA',
      secondary: '#EA580C',
      background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)'
    },
    defaultRewards: [
      {
        type: 'exclusive_access',
        title: 'Member Access',
        description: 'Access to member-only content and updates',
        icon: 'Lock'
      },
      {
        type: 'custom',
        title: 'Community Membership',
        description: 'Join the exclusive token holder community',
        icon: 'Users'
      },
      {
        type: 'governance_weight',
        title: 'Voting Rights',
        description: 'Full participation in governance decisions',
        value: '1x',
        icon: 'Vote'
      }
    ],
    badge: {
      icon: 'Shield',
      label: 'Bronze Member'
    }
  }
};

export interface TierStats {
  tierName: string;
  memberCount: number;
  totalTokensHeld: number;
  averageHolding: number;
  percentageOfHolders: number;
}

export interface TierManagementState {
  tiers: AssetTier[];
  selectedTier: AssetTier | null;
  isCreating: boolean;
  isEditing: boolean;
  loading: boolean;
  error: string | null;
}