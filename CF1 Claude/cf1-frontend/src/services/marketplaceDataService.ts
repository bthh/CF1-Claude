import { useDataModeStore } from '../store/dataModeStore';

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

// Demo data for testing
const getDemoAssets = (): AssetListing[] => [
  {
    id: 'demo-1',
    name: 'Prime Manhattan Office Tower',
    type: 'Commercial Real Estate',
    location: 'New York, NY',
    totalValue: '$8,500,000',
    tokenPrice: '$500',
    tokensAvailable: 2000,
    totalTokens: 17000,
    apy: '14.2%',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    tags: ['Prime Location', 'High Yield', 'Institutional Grade'],
    source: 'demo'
  },
  {
    id: 'demo-2',
    name: 'Swiss Gold Reserve Vault',
    type: 'Precious Metals',
    location: 'Zurich, Switzerland',
    totalValue: '$5,200,000',
    tokenPrice: '$250',
    tokensAvailable: 1500,
    totalTokens: 20800,
    apy: '12.1%',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop',
    tags: ['Ultra Stable', 'Inflation Hedge', 'Bank Grade'],
    source: 'demo'
  },
  {
    id: 'demo-3',
    name: 'Renewable Energy Portfolio',
    type: 'Green Infrastructure',
    location: 'California, US',
    totalValue: '$12,000,000',
    tokenPrice: '$400',
    tokensAvailable: 3000,
    totalTokens: 30000,
    apy: '13.5%',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
    tags: ['ESG Compliant', 'Growth Sector', 'Tax Incentives'],
    source: 'demo'
  }
];

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