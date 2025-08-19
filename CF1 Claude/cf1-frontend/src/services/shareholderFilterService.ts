/**
 * Shareholder Data Filtering Service
 * Provides creator-specific data isolation and filtering logic
 */

import { useSessionStore } from '../store/sessionStore';
import { useCosmJS } from '../hooks/useCosmJS';

export interface CreatorAsset {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'funded' | 'closed';
  creatorAddress: string;
  createdAt: string;
  totalRaised: number;
  targetAmount: number;
  shareholderCount: number;
}

export interface CreatorShareholder {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalInvested: number;
  tokenBalance: number;
  joinedAt: string;
  lastActive: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  // Asset-specific holdings for this creator
  assetHoldings: Array<{
    assetId: string;
    assetName: string;
    tokenBalance: number;
    investmentAmount: number;
    purchaseDate: string;
    currentValue: number;
    performance: number;
  }>;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface ShareholderEngagement {
  id: string;
  shareholderId: string;
  assetId: string;
  type: 'VOTE' | 'COMMENT' | 'QUESTION' | 'FEEDBACK';
  content: string;
  timestamp: string;
  resolved: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CreatorAnalytics {
  totalShareholders: number;
  totalAssetsCreated: number;
  totalFundsRaised: number;
  averageHolding: number;
  shareholderGrowth: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  assetPerformance: {
    best: { assetId: string; performance: number };
    worst: { assetId: string; performance: number };
    average: number;
  };
  engagementMetrics: {
    totalEngagements: number;
    resolvedEngagements: number;
    averageResponseTime: number; // in hours
  };
}

export class ShareholderFilterService {
  
  /**
   * Get creator's wallet address from current session
   */
  static getCurrentCreatorAddress(): string | null {
    try {
      const { isConnected, address } = useCosmJS.getState();
      return isConnected ? address : null;
    } catch (error) {
      console.error('Error getting creator address:', error);
      return null;
    }
  }

  /**
   * Filter assets to show only those created by the current creator
   */
  static filterCreatorAssets(allAssets: any[], creatorAddress?: string): CreatorAsset[] {
    const currentCreator = creatorAddress || this.getCurrentCreatorAddress();
    
    if (!currentCreator) {
      console.warn('No creator address available for filtering');
      return [];
    }

    console.log(`🔍 Filtering assets for creator: ${currentCreator}`);
    
    const filteredAssets = allAssets.filter(asset => 
      asset.creatorAddress === currentCreator || 
      asset.creator === currentCreator ||
      asset.owner === currentCreator
    );

    console.log(`📊 Found ${filteredAssets.length} assets for creator`);
    
    return filteredAssets.map(asset => ({
      id: asset.id,
      name: asset.name || asset.title,
      type: asset.type || 'Real Estate',
      status: asset.status || 'active',
      creatorAddress: currentCreator,
      createdAt: asset.createdAt || asset.timestamp || new Date().toISOString(),
      totalRaised: asset.totalRaised || asset.raised_amount || 0,
      targetAmount: asset.targetAmount || asset.target_amount || 1000000,
      shareholderCount: asset.shareholderCount || asset.investor_count || 0
    }));
  }

  /**
   * Filter shareholders to show only those who invested in creator's assets
   */
  static filterCreatorShareholders(
    allShareholders: any[], 
    creatorAssets: CreatorAsset[]
  ): CreatorShareholder[] {
    if (!creatorAssets.length) {
      console.log('📭 No creator assets found, returning empty shareholders list');
      return [];
    }

    const creatorAssetIds = creatorAssets.map(asset => asset.id);
    console.log(`🔍 Filtering shareholders for assets: ${creatorAssetIds.join(', ')}`);

    // Filter shareholders who have holdings in any of the creator's assets
    const filteredShareholders = allShareholders.filter(shareholder => {
      return shareholder.assetHoldings?.some((holding: any) => 
        creatorAssetIds.includes(holding.assetId)
      ) || shareholder.investments?.some((investment: any) => 
        creatorAssetIds.includes(investment.assetId)
      );
    });

    console.log(`👥 Found ${filteredShareholders.length} shareholders for creator's assets`);

    return filteredShareholders.map(shareholder => ({
      id: shareholder.id,
      walletAddress: shareholder.walletAddress,
      email: shareholder.email,
      name: shareholder.name,
      tier: shareholder.tier || 'BRONZE',
      totalInvested: this.calculateCreatorInvestment(shareholder, creatorAssetIds),
      tokenBalance: this.calculateCreatorTokens(shareholder, creatorAssetIds),
      joinedAt: shareholder.joinedAt || new Date().toISOString(),
      lastActive: shareholder.lastActive || new Date().toISOString(),
      kycStatus: shareholder.kycStatus || 'PENDING',
      assetHoldings: this.getCreatorAssetHoldings(shareholder, creatorAssets),
      communicationPreferences: shareholder.communicationPreferences || {
        email: true,
        sms: false,
        push: true
      }
    }));
  }

  /**
   * Calculate total investment amount for creator's assets only
   */
  private static calculateCreatorInvestment(shareholder: any, creatorAssetIds: string[]): number {
    const holdings = shareholder.assetHoldings || shareholder.investments || [];
    
    return holdings
      .filter((holding: any) => creatorAssetIds.includes(holding.assetId))
      .reduce((total: number, holding: any) => total + (holding.investmentAmount || holding.amount || 0), 0);
  }

  /**
   * Calculate total token balance for creator's assets only
   */
  private static calculateCreatorTokens(shareholder: any, creatorAssetIds: string[]): number {
    const holdings = shareholder.assetHoldings || shareholder.investments || [];
    
    return holdings
      .filter((holding: any) => creatorAssetIds.includes(holding.assetId))
      .reduce((total: number, holding: any) => total + (holding.tokenBalance || holding.shares || 0), 0);
  }

  /**
   * Get asset holdings for creator's assets only
   */
  private static getCreatorAssetHoldings(shareholder: any, creatorAssets: CreatorAsset[]): CreatorShareholder['assetHoldings'] {
    const holdings = shareholder.assetHoldings || shareholder.investments || [];
    const creatorAssetIds = creatorAssets.map(asset => asset.id);
    
    return holdings
      .filter((holding: any) => creatorAssetIds.includes(holding.assetId))
      .map((holding: any) => {
        const asset = creatorAssets.find(a => a.id === holding.assetId);
        return {
          assetId: holding.assetId,
          assetName: asset?.name || holding.assetName || 'Unknown Asset',
          tokenBalance: holding.tokenBalance || holding.shares || 0,
          investmentAmount: holding.investmentAmount || holding.amount || 0,
          purchaseDate: holding.purchaseDate || holding.timestamp || new Date().toISOString(),
          currentValue: holding.currentValue || holding.investmentAmount || 0,
          performance: holding.performance || 0
        };
      });
  }

  /**
   * Filter engagements to show only those related to creator's assets
   */
  static filterCreatorEngagements(
    allEngagements: ShareholderEngagement[], 
    creatorAssets: CreatorAsset[]
  ): ShareholderEngagement[] {
    const creatorAssetIds = creatorAssets.map(asset => asset.id);
    
    return allEngagements.filter(engagement => 
      creatorAssetIds.includes(engagement.assetId)
    );
  }

  /**
   * Generate analytics for creator's assets and shareholders
   */
  static generateCreatorAnalytics(
    creatorAssets: CreatorAsset[],
    creatorShareholders: CreatorShareholder[],
    creatorEngagements: ShareholderEngagement[]
  ): CreatorAnalytics {
    const totalFundsRaised = creatorAssets.reduce((total, asset) => total + asset.totalRaised, 0);
    const totalTokensIssued = creatorShareholders.reduce((total, shareholder) => total + shareholder.tokenBalance, 0);
    const totalInvestments = creatorShareholders.reduce((total, shareholder) => total + shareholder.totalInvested, 0);

    // Calculate shareholder growth (mock calculation for now)
    const thisMonth = Math.floor(creatorShareholders.length * 0.3);
    const lastMonth = Math.floor(creatorShareholders.length * 0.2);
    
    // Calculate asset performance (mock calculation)
    const assetPerformances = creatorAssets.map(asset => ({
      assetId: asset.id,
      performance: Math.random() * 30 - 5 // -5% to +25%
    }));
    
    const bestAsset = assetPerformances.reduce((best, current) => 
      current.performance > best.performance ? current : best, 
      assetPerformances[0] || { assetId: '', performance: 0 }
    );
    
    const worstAsset = assetPerformances.reduce((worst, current) => 
      current.performance < worst.performance ? current : worst,
      assetPerformances[0] || { assetId: '', performance: 0 }
    );
    
    const averagePerformance = assetPerformances.length > 0 
      ? assetPerformances.reduce((sum, asset) => sum + asset.performance, 0) / assetPerformances.length
      : 0;

    // Engagement metrics
    const resolvedEngagements = creatorEngagements.filter(e => e.resolved).length;

    return {
      totalShareholders: creatorShareholders.length,
      totalAssetsCreated: creatorAssets.length,
      totalFundsRaised,
      averageHolding: creatorShareholders.length > 0 ? totalInvestments / creatorShareholders.length : 0,
      shareholderGrowth: {
        thisMonth,
        lastMonth,
        growth: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0
      },
      assetPerformance: {
        best: bestAsset,
        worst: worstAsset,
        average: averagePerformance
      },
      engagementMetrics: {
        totalEngagements: creatorEngagements.length,
        resolvedEngagements,
        averageResponseTime: 24 // Mock: 24 hours average
      }
    };
  }

  /**
   * Apply additional filters to shareholder list
   */
  static applyShareholderFilters(
    shareholders: CreatorShareholder[],
    filters: {
      search?: string;
      tier?: string;
      kycStatus?: string;
      assetId?: string;
      minInvestment?: number;
      maxInvestment?: number;
    }
  ): CreatorShareholder[] {
    let filtered = [...shareholders];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(shareholder =>
        shareholder.name?.toLowerCase().includes(searchLower) ||
        shareholder.email?.toLowerCase().includes(searchLower) ||
        shareholder.walletAddress.toLowerCase().includes(searchLower)
      );
    }

    // Tier filter
    if (filters.tier) {
      filtered = filtered.filter(shareholder => shareholder.tier === filters.tier);
    }

    // KYC status filter
    if (filters.kycStatus) {
      filtered = filtered.filter(shareholder => shareholder.kycStatus === filters.kycStatus);
    }

    // Asset-specific filter
    if (filters.assetId) {
      filtered = filtered.filter(shareholder =>
        shareholder.assetHoldings.some(holding => holding.assetId === filters.assetId)
      );
    }

    // Investment amount filters
    if (filters.minInvestment !== undefined) {
      filtered = filtered.filter(shareholder => shareholder.totalInvested >= filters.minInvestment!);
    }

    if (filters.maxInvestment !== undefined) {
      filtered = filtered.filter(shareholder => shareholder.totalInvested <= filters.maxInvestment!);
    }

    console.log(`🔍 Applied filters, showing ${filtered.length}/${shareholders.length} shareholders`);
    
    return filtered;
  }

  /**
   * Sort shareholders by various criteria
   */
  static sortShareholders(
    shareholders: CreatorShareholder[],
    sortBy: 'name' | 'investment' | 'tokens' | 'joinDate' | 'lastActive',
    direction: 'asc' | 'desc' = 'desc'
  ): CreatorShareholder[] {
    const sorted = [...shareholders].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'investment':
          comparison = a.totalInvested - b.totalInvested;
          break;
        case 'tokens':
          comparison = a.tokenBalance - b.tokenBalance;
          break;
        case 'joinDate':
          comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
          break;
        case 'lastActive':
          comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }
}

export default ShareholderFilterService;