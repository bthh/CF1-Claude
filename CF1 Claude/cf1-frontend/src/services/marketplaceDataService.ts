import { useDataModeStore } from '../store/dataModeStore';
import { useDemoModeStore } from '../store/demoModeStore';
import { demoMarketplaceAssets, getDemoMarketplaceAssetsByScenario } from './demoMarketplaceData';

export interface AssetListing {
  id: string;
  name: string;
  type: string;
  location: string;
  totalValue: string;
  tokenPrice: string;
  tokensAvailable: number;
  totalTokens: number;
  apy: string;
  rating: number;
  imageUrl?: string;
  tags: string[];
  // Add source tracking
  source: 'production' | 'development' | 'demo';
}

// Demo data using expanded demo marketplace data
const getDemoAssets = (): AssetListing[] => {
  const demoModeState = useDemoModeStore.getState();
  const scenario = demoModeState.scenario || 'sales_demo';
  const demoAssets = getDemoMarketplaceAssetsByScenario(scenario);
  
  // Convert demo marketplace assets to AssetListing format
  return demoAssets.map(asset => ({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    location: asset.location,
    totalValue: asset.totalValue,
    tokenPrice: asset.tokenPrice,
    tokensAvailable: Math.floor(asset.totalTokens * (1 - asset.fundedPercentage / 100)),
    totalTokens: asset.totalTokens,
    apy: asset.apy,
    rating: asset.rating,
    imageUrl: asset.imageUrl,
    tags: asset.tags,
    source: 'demo' as const
  }));
};

// Production data (empty - will come from API)
const getProductionAssets = (): AssetListing[] => {
  // In production, this would fetch from your API
  return [];
};

// Development data (user-created assets from UI)
const getDevelopmentAssets = (): AssetListing[] => {
  // This would come from your submission store or database
  // For now, return empty - will be populated by user submissions
  return [];
};

// Main data service
export const useMarketplaceData = () => {
  const { currentMode } = useDataModeStore();
  
  const getAssets = (): AssetListing[] => {
    switch (currentMode) {
      case 'production':
        return getProductionAssets();
      case 'development':
        return getDevelopmentAssets();
      case 'demo':
        return getDemoAssets();
      default:
        return getProductionAssets();
    }
  };

  const getQuickStats = () => {
    const assets = getAssets();
    const totalAssets = assets.length;
    
    if (totalAssets === 0) {
      return {
        totalAssets: 0,
        avgAPY: '0.0%',
        totalVolume: '$0'
      };
    }
    
    const avgAPY = assets.reduce((sum, asset) => sum + parseFloat(asset.apy.replace('%', '')), 0) / totalAssets;
    const totalVolume = assets.reduce((sum, asset) => {
      const value = parseFloat(asset.totalValue.replace(/[$,M]/g, ''));
      return sum + (asset.totalValue.includes('M') ? value * 1000000 : value);
    }, 0);

    return {
      totalAssets,
      avgAPY: `${avgAPY.toFixed(1)}%`,
      totalVolume: `$${(totalVolume / 1000000).toFixed(1)}M`
    };
  };

  return {
    assets: getAssets(),
    quickStats: getQuickStats(),
    currentMode,
    isEmpty: getAssets().length === 0,
  };
};