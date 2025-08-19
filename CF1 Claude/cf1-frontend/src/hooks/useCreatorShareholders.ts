/**
 * Creator Shareholders Hook
 * Provides creator-specific shareholder data with filtering and analytics
 */

import { useState, useEffect, useCallback } from 'react';
import { useCosmJS } from './useCosmJS';
import { useSessionStore } from '../store/sessionStore';
import { useNotifications } from './useNotifications';
import ShareholderFilterService, { 
  CreatorAsset, 
  CreatorShareholder, 
  ShareholderEngagement,
  CreatorAnalytics 
} from '../services/shareholderFilterService';

interface ShareholderFilters {
  search: string;
  tier: string;
  kycStatus: string;
  assetId: string;
  minInvestment?: number;
  maxInvestment?: number;
}

interface ShareholderSorting {
  sortBy: 'name' | 'investment' | 'tokens' | 'joinDate' | 'lastActive';
  direction: 'asc' | 'desc';
}

interface UseCreatorShareholdersReturn {
  // Data
  creatorAssets: CreatorAsset[];
  shareholders: CreatorShareholder[];
  filteredShareholders: CreatorShareholder[];
  engagements: ShareholderEngagement[];
  analytics: CreatorAnalytics | null;
  
  // Loading states
  loading: boolean;
  assetsLoading: boolean;
  shareholdersLoading: boolean;
  analyticsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Filters and sorting
  filters: ShareholderFilters;
  sorting: ShareholderSorting;
  
  // Actions
  loadCreatorData: () => Promise<void>;
  refreshShareholders: () => Promise<void>;
  updateFilters: (newFilters: Partial<ShareholderFilters>) => void;
  updateSorting: (newSorting: Partial<ShareholderSorting>) => void;
  clearFilters: () => void;
  
  // Shareholder actions
  updateShareholderTier: (shareholderId: string, newTier: string) => Promise<void>;
  getShareholderDetails: (shareholderId: string) => CreatorShareholder | null;
  getAssetShareholders: (assetId: string) => CreatorShareholder[];
  
  // Analytics
  refreshAnalytics: () => Promise<void>;
  getAssetAnalytics: (assetId: string) => {
    shareholderCount: number;
    totalInvestment: number;
    averageInvestment: number;
  };
}

export const useCreatorShareholders = (): UseCreatorShareholdersReturn => {
  const { isConnected, address } = useCosmJS();
  const { selectedRole } = useSessionStore();
  const { success, error: showError } = useNotifications();

  // State
  const [creatorAssets, setCreatorAssets] = useState<CreatorAsset[]>([]);
  const [shareholders, setShareholders] = useState<CreatorShareholder[]>([]);
  const [filteredShareholders, setFilteredShareholders] = useState<CreatorShareholder[]>([]);
  const [engagements, setEngagements] = useState<ShareholderEngagement[]>([]);
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [shareholdersLoading, setShareholdersLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Filters and sorting
  const [filters, setFilters] = useState<ShareholderFilters>({
    search: '',
    tier: '',
    kycStatus: '',
    assetId: '',
    minInvestment: undefined,
    maxInvestment: undefined
  });
  
  const [sorting, setSorting] = useState<ShareholderSorting>({
    sortBy: 'investment',
    direction: 'desc'
  });

  // Load creator's assets
  const loadCreatorAssets = useCallback(async (): Promise<CreatorAsset[]> => {
    if (!isConnected || !address || selectedRole !== 'creator') {
      console.log('🚫 Not a connected creator, skipping asset loading');
      return [];
    }

    setAssetsLoading(true);
    try {
      console.log('📊 Loading creator assets...');
      
      // In a real app, this would fetch from API
      // For now, we'll simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock creator assets data
      const mockAssets: CreatorAsset[] = [
        {
          id: 'asset_creator_1',
          name: 'Downtown Office Complex',
          type: 'Commercial Real Estate',
          status: 'funded',
          creatorAddress: address,
          createdAt: '2024-01-15T10:00:00Z',
          totalRaised: 2500000,
          targetAmount: 2500000,
          shareholderCount: 45
        },
        {
          id: 'asset_creator_2',
          name: 'Green Energy Solar Farm',
          type: 'Renewable Energy',
          status: 'active',
          creatorAddress: address,
          createdAt: '2024-03-20T14:30:00Z',
          totalRaised: 1800000,
          targetAmount: 3000000,
          shareholderCount: 32
        },
        {
          id: 'asset_creator_3',
          name: 'Premium Wine Collection',
          type: 'Collectibles',
          status: 'funded',
          creatorAddress: address,
          createdAt: '2024-05-10T09:15:00Z',
          totalRaised: 750000,
          targetAmount: 750000,
          shareholderCount: 28
        }
      ];

      console.log(`✅ Loaded ${mockAssets.length} creator assets`);
      setCreatorAssets(mockAssets);
      return mockAssets;
      
    } catch (err) {
      console.error('❌ Error loading creator assets:', err);
      setError('Failed to load creator assets');
      return [];
    } finally {
      setAssetsLoading(false);
    }
  }, [isConnected, address, selectedRole]);

  // Load shareholders for creator's assets
  const loadShareholders = useCallback(async (assets: CreatorAsset[]): Promise<CreatorShareholder[]> => {
    if (!assets.length) {
      console.log('📭 No assets to load shareholders for');
      setShareholders([]);
      return [];
    }

    setShareholdersLoading(true);
    try {
      console.log('👥 Loading shareholders for creator assets...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock shareholders data - only those who invested in this creator's assets
      const mockShareholders: CreatorShareholder[] = [
        {
          id: 'sh_creator_1',
          walletAddress: 'neutron1investor1...',
          email: 'investor1@example.com',
          name: 'Alice Johnson',
          tier: 'GOLD',
          totalInvested: 125000, // Total across all creator's assets
          tokenBalance: 125,
          joinedAt: '2024-01-20T12:00:00Z',
          lastActive: '2024-12-15T10:30:00Z',
          kycStatus: 'VERIFIED',
          assetHoldings: [
            {
              assetId: 'asset_creator_1',
              assetName: 'Downtown Office Complex',
              tokenBalance: 75,
              investmentAmount: 75000,
              purchaseDate: '2024-01-20T12:00:00Z',
              currentValue: 82500,
              performance: 10.0
            },
            {
              assetId: 'asset_creator_2',
              assetName: 'Green Energy Solar Farm',
              tokenBalance: 50,
              investmentAmount: 50000,
              purchaseDate: '2024-03-25T15:00:00Z',
              currentValue: 55000,
              performance: 10.0
            }
          ],
          communicationPreferences: {
            email: true,
            sms: false,
            push: true
          }
        },
        {
          id: 'sh_creator_2',
          walletAddress: 'neutron1investor2...',
          email: 'investor2@example.com',
          name: 'Bob Smith',
          tier: 'PLATINUM',
          totalInvested: 200000,
          tokenBalance: 200,
          joinedAt: '2024-02-01T09:00:00Z',
          lastActive: '2024-12-14T16:45:00Z',
          kycStatus: 'VERIFIED',
          assetHoldings: [
            {
              assetId: 'asset_creator_1',
              assetName: 'Downtown Office Complex',
              tokenBalance: 100,
              investmentAmount: 100000,
              purchaseDate: '2024-02-01T09:00:00Z',
              currentValue: 110000,
              performance: 10.0
            },
            {
              assetId: 'asset_creator_3',
              assetName: 'Premium Wine Collection',
              tokenBalance: 100,
              investmentAmount: 100000,
              purchaseDate: '2024-05-15T11:30:00Z',
              currentValue: 115000,
              performance: 15.0
            }
          ],
          communicationPreferences: {
            email: true,
            sms: true,
            push: true
          }
        },
        {
          id: 'sh_creator_3',
          walletAddress: 'neutron1investor3...',
          email: 'investor3@example.com',
          name: 'Carol Davis',
          tier: 'SILVER',
          totalInvested: 75000,
          tokenBalance: 75,
          joinedAt: '2024-03-10T14:20:00Z',
          lastActive: '2024-12-13T08:15:00Z',
          kycStatus: 'VERIFIED',
          assetHoldings: [
            {
              assetId: 'asset_creator_2',
              assetName: 'Green Energy Solar Farm',
              tokenBalance: 75,
              investmentAmount: 75000,
              purchaseDate: '2024-03-30T10:00:00Z',
              currentValue: 82500,
              performance: 10.0
            }
          ],
          communicationPreferences: {
            email: true,
            sms: false,
            push: false
          }
        }
      ];

      console.log(`✅ Loaded ${mockShareholders.length} shareholders for creator`);
      setShareholders(mockShareholders);
      return mockShareholders;
      
    } catch (err) {
      console.error('❌ Error loading shareholders:', err);
      setError('Failed to load shareholders');
      return [];
    } finally {
      setShareholdersLoading(false);
    }
  }, []);

  // Load engagements
  const loadEngagements = useCallback(async (assets: CreatorAsset[]): Promise<ShareholderEngagement[]> => {
    if (!assets.length) return [];

    try {
      // Mock engagements data
      const mockEngagements: ShareholderEngagement[] = [
        {
          id: 'eng_creator_1',
          shareholderId: 'sh_creator_1',
          assetId: 'asset_creator_1',
          type: 'QUESTION',
          content: 'When is the next dividend payment scheduled?',
          timestamp: '2024-12-10T14:30:00Z',
          resolved: false,
          priority: 'MEDIUM'
        },
        {
          id: 'eng_creator_2',
          shareholderId: 'sh_creator_2',
          assetId: 'asset_creator_2',
          type: 'FEEDBACK',
          content: 'Great progress on the solar installation! Looking forward to the next update.',
          timestamp: '2024-12-08T11:15:00Z',
          resolved: true,
          priority: 'LOW'
        }
      ];

      setEngagements(mockEngagements);
      return mockEngagements;
    } catch (err) {
      console.error('❌ Error loading engagements:', err);
      return [];
    }
  }, []);

  // Generate analytics
  const generateAnalytics = useCallback(async (
    assets: CreatorAsset[], 
    shareholderList: CreatorShareholder[], 
    engagementList: ShareholderEngagement[]
  ): Promise<void> => {
    setAnalyticsLoading(true);
    try {
      const analyticsData = ShareholderFilterService.generateCreatorAnalytics(
        assets,
        shareholderList,
        engagementList
      );
      
      setAnalytics(analyticsData);
      console.log('📊 Generated creator analytics:', analyticsData);
    } catch (err) {
      console.error('❌ Error generating analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Main data loading function
  const loadCreatorData = useCallback(async (): Promise<void> => {
    if (!isConnected || selectedRole !== 'creator') {
      console.log('🚫 Not authorized to load creator data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading complete creator shareholder data...');
      
      // Load data sequentially to maintain dependency order
      const assets = await loadCreatorAssets();
      const shareholderList = await loadShareholders(assets);
      const engagementList = await loadEngagements(assets);
      
      // Generate analytics
      await generateAnalytics(assets, shareholderList, engagementList);
      
      console.log('✅ Creator data loading complete');
      
    } catch (err) {
      console.error('❌ Error loading creator data:', err);
      setError('Failed to load creator data');
      showError('Failed to load creator data');
    } finally {
      setLoading(false);
    }
  }, [isConnected, selectedRole, loadCreatorAssets, loadShareholders, loadEngagements, generateAnalytics, showError]);

  // Apply filters and sorting to shareholders
  useEffect(() => {
    let filtered = ShareholderFilterService.applyShareholderFilters(shareholders, filters);
    filtered = ShareholderFilterService.sortShareholders(filtered, sorting.sortBy, sorting.direction);
    setFilteredShareholders(filtered);
  }, [shareholders, filters, sorting]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (isConnected && selectedRole === 'creator') {
      loadCreatorData();
    }
  }, [isConnected, selectedRole, loadCreatorData]);

  // Action functions
  const refreshShareholders = useCallback(async (): Promise<void> => {
    await loadShareholders(creatorAssets);
  }, [loadShareholders, creatorAssets]);

  const updateFilters = useCallback((newFilters: Partial<ShareholderFilters>): void => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateSorting = useCallback((newSorting: Partial<ShareholderSorting>): void => {
    setSorting(prev => ({ ...prev, ...newSorting }));
  }, []);

  const clearFilters = useCallback((): void => {
    setFilters({
      search: '',
      tier: '',
      kycStatus: '',
      assetId: '',
      minInvestment: undefined,
      maxInvestment: undefined
    });
  }, []);

  const updateShareholderTier = useCallback(async (shareholderId: string, newTier: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setShareholders(prev => prev.map(s => 
        s.id === shareholderId ? { ...s, tier: newTier as any } : s
      ));
      
      success(`Shareholder tier updated to ${newTier}`);
    } catch (err) {
      showError('Failed to update shareholder tier');
      throw err;
    }
  }, [success, showError]);

  const getShareholderDetails = useCallback((shareholderId: string): CreatorShareholder | null => {
    return shareholders.find(s => s.id === shareholderId) || null;
  }, [shareholders]);

  const getAssetShareholders = useCallback((assetId: string): CreatorShareholder[] => {
    return shareholders.filter(s => 
      s.assetHoldings.some(holding => holding.assetId === assetId)
    );
  }, [shareholders]);

  const refreshAnalytics = useCallback(async (): Promise<void> => {
    await generateAnalytics(creatorAssets, shareholders, engagements);
  }, [generateAnalytics, creatorAssets, shareholders, engagements]);

  const getAssetAnalytics = useCallback((assetId: string) => {
    const assetShareholders = getAssetShareholders(assetId);
    const totalInvestment = assetShareholders.reduce((total, s) => {
      const holding = s.assetHoldings.find(h => h.assetId === assetId);
      return total + (holding?.investmentAmount || 0);
    }, 0);

    return {
      shareholderCount: assetShareholders.length,
      totalInvestment,
      averageInvestment: assetShareholders.length > 0 ? totalInvestment / assetShareholders.length : 0
    };
  }, [getAssetShareholders]);

  return {
    // Data
    creatorAssets,
    shareholders,
    filteredShareholders,
    engagements,
    analytics,
    
    // Loading states
    loading,
    assetsLoading,
    shareholdersLoading,
    analyticsLoading,
    
    // Error state
    error,
    
    // Filters and sorting
    filters,
    sorting,
    
    // Actions
    loadCreatorData,
    refreshShareholders,
    updateFilters,
    updateSorting,
    clearFilters,
    
    // Shareholder actions
    updateShareholderTier,
    getShareholderDetails,
    getAssetShareholders,
    
    // Analytics
    refreshAnalytics,
    getAssetAnalytics
  };
};

export default useCreatorShareholders;