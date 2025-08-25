import { useState, useEffect } from 'react';
import { useDemoModeStore } from '../store/demoModeStore';
import { usePortfolioData } from '../services/demoPortfolioData';

interface CreatorAsset {
  id: string;
  name: string;
  type: string;
  totalTokens?: number;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: string;
}

interface UseCreatorAssetsReturn {
  assets: CreatorAsset[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCreatorAssets = (creatorId: string): UseCreatorAssetsReturn => {
  const [assets, setAssets] = useState<CreatorAsset[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isEnabled } = useDemoModeStore();
  const { assets: portfolioAssets } = usePortfolioData();

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (isEnabled && portfolioAssets.length > 0) {
        // In demo mode, use portfolio assets to match tier management
        const demoCreatorAssets: CreatorAsset[] = portfolioAssets.map(asset => ({
          id: asset.id,
          name: asset.name,
          type: asset.type,
          totalTokens: asset.tokens * 100, // Estimate total tokens based on user holdings
          status: 'active' as const,
          createdAt: '2024-01-15T10:00:00Z'
        }));
        
        setAssets(demoCreatorAssets);
        console.log('✅ useCreatorAssets: Loaded', demoCreatorAssets.length, 'demo portfolio assets for tier management');
      } else {
        // Production mode - mock assets for testing
        const mockAssets: CreatorAsset[] = [
          {
            id: 'asset_solar_1',
            name: 'Solar Farm Project Alpha',
            type: 'Renewable Energy',
            totalTokens: 1000000,
            status: 'active',
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            id: 'asset_wind_1',
            name: 'Wind Farm Project Beta',
            type: 'Renewable Energy',
            totalTokens: 750000,
            status: 'active',
            createdAt: '2024-02-20T09:15:00Z'
          },
          {
            id: 'asset_real_1',
            name: 'Commercial Real Estate Fund',
            type: 'Real Estate',
            totalTokens: 2000000,
            status: 'active',
            createdAt: '2024-03-10T16:20:00Z'
          },
          {
            id: 'asset_tech_1',
            name: 'Tech Startup Portfolio',
            type: 'Technology',
            totalTokens: 500000,
            status: 'active',
            createdAt: '2024-04-05T14:30:00Z'
          },
          {
            id: 'asset_agriculture_1',
            name: 'Sustainable Farming Initiative',
            type: 'Agriculture',
            totalTokens: 300000,
            status: 'active',
            createdAt: '2024-05-20T11:45:00Z'
          }
        ];
        
        setAssets(mockAssets);
        console.log('✅ useCreatorAssets: Loaded', mockAssets.length, 'mock assets for production testing');
      }
    } catch (err) {
      setError('Failed to load creator assets');
      console.error('Error loading creator assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always load assets for testing, regardless of creatorId
    // In production, this should check if creatorId is valid
    loadAssets().catch((err) => {
      console.error('Unhandled error in useCreatorAssets:', err);
      setError('Failed to load creator assets');
      setLoading(false);
    });
  }, [creatorId, isEnabled, portfolioAssets.length]);

  return {
    assets,
    loading,
    error,
    refetch: loadAssets
  };
};

export default useCreatorAssets;