import React from 'react';
import { useDemoModeStore, DemoScenario } from '../store/demoModeStore';
import { getScenarioOptimizedImage, getAssetImage } from './assetImageService';
import { AssetTier } from '../types/tiers';

export interface PortfolioAsset {
  id: string;
  name: string;
  type: string;
  tokens: number;
  currentValue: string;
  purchaseValue: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  apy: string;
  imageUrl?: string;
  // Tier information
  userTier?: AssetTier;
  availableTiers?: AssetTier[];
  tierBenefits?: string[];
}

export interface PortfolioSummary {
  totalValue: string;
  totalInvested: string;
  totalGain: string;
  totalGainPercent: string;
  isPositive: boolean;
}

// Cache for stable random values to prevent constant fluctuations
const randomCache = new Map<string, number>();

// Utility function to add realistic variance to numbers with stable seeding
const varyNumber = (base: number, variance: number = 0.02, seed?: string): number => {
  // Use cache key to ensure stable values across renders
  const cacheKey = `${base}_${variance}_${seed || 'default'}`;
  
  if (!randomCache.has(cacheKey)) {
    const variation = (Math.random() - 0.5) * 2 * variance;
    const result = Math.round(base * (1 + variation));
    randomCache.set(cacheKey, result);
  }
  
  return randomCache.get(cacheKey)!;
};

// Generate demo portfolio for different scenarios
const generateDemoPortfolio = (scenario: DemoScenario): { assets: PortfolioAsset[], summary: PortfolioSummary } => {
  switch (scenario) {
    case 'investor_presentation':
      const investorAssets: PortfolioAsset[] = [
        {
          id: 'port-inv-1',
          name: 'Prime Manhattan Office Tower',
          type: 'Commercial Real Estate',
          tokens: varyNumber(850, 0.02, 'inv_tokens_1'),
          currentValue: `$${varyNumber(125000, 0.02, 'inv_current_1').toLocaleString()}`,
          purchaseValue: `$${varyNumber(105000, 0.02, 'inv_purchase_1').toLocaleString()}`,
          change: `+$${varyNumber(20000, 0.02, 'inv_change_1').toLocaleString()}`,
          changePercent: `+${varyNumber(19, 0.1, 'inv_percent_1').toFixed(1)}%`,
          isPositive: true,
          apy: `${Math.min(varyNumber(14, 0.05, 'inv_apy_1'), 15).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Commercial Real Estate', scenario, 0)?.url || getAssetImage('Commercial Real Estate', 0)?.url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop'
        },
        {
          id: 'port-inv-2',
          name: 'Swiss Gold Reserve Vault',
          type: 'Precious Metals',
          tokens: varyNumber(1200, 0.02, 'inv_tokens_2'),
          currentValue: `$${varyNumber(85000, 0.02, 'inv_current_2').toLocaleString()}`,
          purchaseValue: `$${varyNumber(75000, 0.02, 'inv_purchase_2').toLocaleString()}`,
          change: `+$${varyNumber(10000, 0.02, 'inv_change_2').toLocaleString()}`,
          changePercent: `+${varyNumber(13, 0.1, 'inv_percent_2').toFixed(1)}%`,
          isPositive: true,
          apy: `${Math.min(varyNumber(12, 0.05, 'inv_apy_2'), 15).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Precious Metals', scenario, 0)?.url || getAssetImage('Precious Metals', 0)?.url || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=100&h=100&fit=crop'
        },
        {
          id: 'port-inv-3',
          name: 'California Clean Energy Portfolio',
          type: 'Green Infrastructure',
          tokens: varyNumber(950, 0.02, 'inv_tokens_3'),
          currentValue: `$${varyNumber(75000, 0.02, 'inv_current_3').toLocaleString()}`,
          purchaseValue: `$${varyNumber(65000, 0.02, 'inv_purchase_3').toLocaleString()}`,
          change: `+$${varyNumber(10000, 0.02, 'inv_change_3').toLocaleString()}`,
          changePercent: `+${varyNumber(15, 0.1, 'inv_percent_3').toFixed(1)}%`,
          isPositive: true,
          apy: `${Math.min(varyNumber(13, 0.05, 'inv_apy_3'), 15).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Green Infrastructure', scenario, 0)?.url || getAssetImage('Green Infrastructure', 0)?.url || 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=100&h=100&fit=crop'
        },
        {
          id: 'port-inv-4',
          name: 'Luxury Resort Collection',
          type: 'Hospitality Real Estate',
          tokens: varyNumber(600, 0.02, 'inv_tokens_4'),
          currentValue: `$${varyNumber(95000, 0.02, 'inv_current_4').toLocaleString()}`,
          purchaseValue: `$${varyNumber(82000, 0.02, 'inv_purchase_4').toLocaleString()}`,
          change: `+$${varyNumber(13000, 0.02, 'inv_change_4').toLocaleString()}`,
          changePercent: `+${varyNumber(16, 0.1, 'inv_percent_4').toFixed(1)}%`,
          isPositive: true,
          apy: `${Math.min(varyNumber(11, 0.05, 'inv_apy_4'), 15).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Hospitality Real Estate', scenario, 0)?.url || getAssetImage('Hospitality Real Estate', 0)?.url || 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&h=100&fit=crop'
        }
      ];

      const investorTotalValue = varyNumber(380000, 0.02, 'inv_total_value');
      const investorTotalInvested = varyNumber(327000, 0.02, 'inv_total_invested');
      const investorTotalGain = investorTotalValue - investorTotalInvested;
      const investorGainPercent = ((investorTotalGain / investorTotalInvested) * 100);

      return {
        assets: investorAssets,
        summary: {
          totalValue: `$${investorTotalValue.toLocaleString()}`,
          totalInvested: `$${investorTotalInvested.toLocaleString()}`,
          totalGain: `+$${investorTotalGain.toLocaleString()}`,
          totalGainPercent: `+${investorGainPercent.toFixed(1)}%`,
          isPositive: true
        }
      };

    case 'sales_demo':
      // Fixed consistent values for sales demo as per requirements
      const salesAssets: PortfolioAsset[] = [
        {
          id: 'port-sales-1',
          name: 'Austin Tech Hub Office Complex',
          type: 'Commercial Real Estate',
          tokens: 850,
          currentValue: '$89,500',
          purchaseValue: '$75,000',
          change: '+$14,500',
          changePercent: '+19.3%',
          isPositive: true,
          apy: '9.2%',
          imageUrl: getScenarioOptimizedImage('Commercial Real Estate', scenario, 1)?.url || getAssetImage('Commercial Real Estate', 1)?.url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop'
        },
        {
          id: 'port-sales-2',
          name: 'Diversified Precious Metals Fund',
          type: 'Precious Metals',
          tokens: 680,
          currentValue: '$68,200',
          purchaseValue: '$60,000',
          change: '+$8,200',
          changePercent: '+13.7%',
          isPositive: true,
          apy: '7.5%',
          imageUrl: getScenarioOptimizedImage('Precious Metals', scenario, 1)?.url || getAssetImage('Precious Metals', 1)?.url || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=100&h=100&fit=crop'
        },
        {
          id: 'port-sales-3',
          name: 'Contemporary Art Investment Portfolio',
          type: 'Fine Art',
          tokens: 125,
          currentValue: '$58,300',
          purchaseValue: '$50,000',
          change: '+$8,300',
          changePercent: '+16.6%',
          isPositive: true,
          apy: '11.2%',
          imageUrl: getScenarioOptimizedImage('Fine Art', scenario, 0)?.url || getAssetImage('Fine Art', 0)?.url || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop'
        },
        {
          id: 'port-sales-4',
          name: 'Clean Energy Infrastructure Fund',
          type: 'Renewable Energy',
          tokens: 350,
          currentValue: '$42,900',
          purchaseValue: '$38,000',
          change: '+$4,900',
          changePercent: '+12.9%',
          isPositive: true,
          apy: '10.1%',
          imageUrl: getScenarioOptimizedImage('Renewable Energy', scenario, 1)?.url || getAssetImage('Renewable Energy', 1)?.url || 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=100&h=100&fit=crop'
        },
        {
          id: 'port-sales-5',
          name: 'Luxury Vehicle Collection Fund',
          type: 'Luxury Vehicles',
          tokens: 200,
          currentValue: '$62,900',
          purchaseValue: '$53,909',
          change: '+$8,991.5',
          changePercent: '+16.7%',
          isPositive: true,
          apy: '8.3%',
          imageUrl: getScenarioOptimizedImage('Luxury Vehicles', scenario, 0)?.url || getAssetImage('Luxury Vehicles', 0)?.url || 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=100&h=100&fit=crop'
        }
      ];

      // Fixed totals matching requirements: Portfolio Value = $321,800, Total Returns = $44,891.5 (+16.0%)
      const salesTotalValue = 321800;
      const salesTotalInvested = 276908.5; // 321800 - 44891.5
      const salesTotalGain = 44891.5;
      const salesGainPercent = 16.0;

      return {
        assets: salesAssets,
        summary: {
          totalValue: '$321,800',
          totalInvested: '$276,909',
          totalGain: '+$44,891.5',
          totalGainPercent: '+16.0%',
          isPositive: true
        }
      };

    case 'user_onboarding':
      const onboardingAssets: PortfolioAsset[] = [
        {
          id: 'port-onboard-1',
          name: 'Beginner Real Estate Investment Trust',
          type: 'Residential Real Estate',
          tokens: varyNumber(250, 0.02, 'onboard_tokens_1'),
          currentValue: `$${varyNumber(2800, 0.02, 'onboard_current_1').toLocaleString()}`,
          purchaseValue: `$${varyNumber(2500, 0.02, 'onboard_purchase_1').toLocaleString()}`,
          change: `+$${varyNumber(300, 0.02, 'onboard_change_1').toLocaleString()}`,
          changePercent: `+${varyNumber(12, 0.2, 'onboard_percent_1').toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(6, 0.1, 'onboard_apy_1').toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Residential Real Estate', scenario, 0)?.url || getAssetImage('Residential Real Estate', 0)?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
        },
        {
          id: 'port-onboard-2',
          name: 'Silver Investment Starter Fund',
          type: 'Precious Metals',
          tokens: varyNumber(400),
          currentValue: `$${varyNumber(1250).toLocaleString()}`,
          purchaseValue: `$${varyNumber(1200).toLocaleString()}`,
          change: `+$${varyNumber(50).toLocaleString()}`,
          changePercent: `+${varyNumber(4, 0.2).toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(5, 0.1).toFixed(1)}%`,
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=100&h=100&fit=crop'
        },
        {
          id: 'port-onboard-3',
          name: 'Community Solar Learning Project',
          type: 'Renewable Energy',
          tokens: varyNumber(150),
          currentValue: `$${varyNumber(1850).toLocaleString()}`,
          purchaseValue: `$${varyNumber(1750).toLocaleString()}`,
          change: `+$${varyNumber(100).toLocaleString()}`,
          changePercent: `+${varyNumber(6, 0.2).toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(7, 0.1).toFixed(1)}%`,
          imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=100&h=100&fit=crop'
        }
      ];

      const onboardingTotalValue = varyNumber(5900, 0.02, 'onboard_total_value');
      const onboardingTotalInvested = varyNumber(5450, 0.02, 'onboard_total_invested');
      const onboardingTotalGain = onboardingTotalValue - onboardingTotalInvested;
      const onboardingGainPercent = ((onboardingTotalGain / onboardingTotalInvested) * 100);

      return {
        assets: onboardingAssets,
        summary: {
          totalValue: `$${onboardingTotalValue.toLocaleString()}`,
          totalInvested: `$${onboardingTotalInvested.toLocaleString()}`,
          totalGain: `+$${onboardingTotalGain.toLocaleString()}`,
          totalGainPercent: `+${onboardingGainPercent.toFixed(1)}%`,
          isPositive: true
        }
      };

    case 'regulatory_showcase':
      const regulatoryAssets: PortfolioAsset[] = [
        {
          id: 'port-reg-1',
          name: 'SEC-Compliant Office REIT',
          type: 'Commercial Real Estate',
          tokens: varyNumber(320),
          currentValue: `$${varyNumber(28500).toLocaleString()}`,
          purchaseValue: `$${varyNumber(27000).toLocaleString()}`,
          change: `+$${varyNumber(1500).toLocaleString()}`,
          changePercent: `+${varyNumber(6, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(6, 0.05).toFixed(1)}%`,
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop'
        },
        {
          id: 'port-reg-2',
          name: 'Audited Gold Reserve Holdings',
          type: 'Precious Metals',
          tokens: varyNumber(450),
          currentValue: `$${varyNumber(22000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(21500).toLocaleString()}`,
          change: `+$${varyNumber(500).toLocaleString()}`,
          changePercent: `+${varyNumber(2, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(4, 0.05).toFixed(1)}%`,
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=100&h=100&fit=crop'
        },
        {
          id: 'port-reg-3',
          name: 'Government-Backed Infrastructure Bonds',
          type: 'Government Bonds',
          tokens: varyNumber(280),
          currentValue: `$${varyNumber(35000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(34000).toLocaleString()}`,
          change: `+$${varyNumber(1000).toLocaleString()}`,
          changePercent: `+${varyNumber(3, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(5, 0.05).toFixed(1)}%`,
          imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=100&h=100&fit=crop'
        }
      ];

      const regulatoryTotalValue = varyNumber(85500);
      const regulatoryTotalInvested = varyNumber(82500);
      const regulatoryTotalGain = regulatoryTotalValue - regulatoryTotalInvested;
      const regulatoryGainPercent = ((regulatoryTotalGain / regulatoryTotalInvested) * 100);

      return {
        assets: regulatoryAssets,
        summary: {
          totalValue: `$${regulatoryTotalValue.toLocaleString()}`,
          totalInvested: `$${regulatoryTotalInvested.toLocaleString()}`,
          totalGain: `+$${regulatoryTotalGain.toLocaleString()}`,
          totalGainPercent: `+${regulatoryGainPercent.toFixed(1)}%`,
          isPositive: true
        }
      };

    case 'development_testing':
      const testAssets: PortfolioAsset[] = [
        {
          id: 'test-port-1',
          name: 'Test Asset Alpha',
          type: 'Test Category',
          tokens: 100,
          currentValue: '$1,000',
          purchaseValue: '$1,000',
          change: '$0',
          changePercent: '0.0%',
          isPositive: true,
          apy: '0.0%',
          imageUrl: getScenarioOptimizedImage('Residential Real Estate', scenario, 0)?.url || getAssetImage('Residential Real Estate', 0)?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
        },
        {
          id: 'test-port-2',
          name: 'Test Asset Beta',
          type: 'Another Test Category',
          tokens: 50,
          currentValue: '$500',
          purchaseValue: '$500',
          change: '$0',
          changePercent: '0.0%',
          isPositive: true,
          apy: '0.0%',
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=100&h=100&fit=crop'
        }
      ];

      return {
        assets: testAssets,
        summary: {
          totalValue: '$1,500',
          totalInvested: '$1,500',
          totalGain: '$0',
          totalGainPercent: '0.0%',
          isPositive: true
        }
      };

    case 'custom':
    default:
      // Return mixed realistic data for custom scenarios
      const customAssets: PortfolioAsset[] = [
        {
          id: 'custom-port-1',
          name: 'Mixed Portfolio Investment',
          type: 'Diversified',
          tokens: varyNumber(300),
          currentValue: `$${varyNumber(25000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(22000).toLocaleString()}`,
          change: `+$${varyNumber(3000).toLocaleString()}`,
          changePercent: `+${varyNumber(14, 0.2).toFixed(1)}%`,
          isPositive: varyNumber(1) > 0.5,
          apy: `${varyNumber(8, 0.2).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Residential Real Estate', scenario, 0)?.url || getAssetImage('Residential Real Estate', 0)?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
        }
      ];

      const customTotalValue = varyNumber(25000);
      const customTotalInvested = varyNumber(22000);
      const customTotalGain = customTotalValue - customTotalInvested;
      const customGainPercent = ((customTotalGain / customTotalInvested) * 100);

      return {
        assets: customAssets,
        summary: {
          totalValue: `$${customTotalValue.toLocaleString()}`,
          totalInvested: `$${customTotalInvested.toLocaleString()}`,
          totalGain: `${customTotalGain >= 0 ? '+' : ''}$${Math.abs(customTotalGain).toLocaleString()}`,
          totalGainPercent: `${customGainPercent >= 0 ? '+' : ''}${customGainPercent.toFixed(1)}%`,
          isPositive: customTotalGain >= 0
        }
      };
  }
};

// Real portfolio data (empty when not in demo mode - should come from API)
export const getRealPortfolioData = (): { assets: PortfolioAsset[], summary: PortfolioSummary } => {
  // In production, this would fetch from your API
  // For now, return empty data to show that user has no real investments yet
  return {
    assets: [],
    summary: {
      totalValue: '$0',
      totalInvested: '$0',
      totalGain: '$0',
      totalGainPercent: '0.0%',
      isPositive: true
    }
  };
};

// Cache to prevent repeated tier data loading
const tierDataCache = new Map<string, any>();

// Function to enhance portfolio data with tier information  
const enhanceWithTierData = async (assets: PortfolioAsset[]): Promise<PortfolioAsset[]> => {
  try {
    // Skip tier enhancement if no assets to avoid unnecessary processing
    if (!assets.length) return assets;
    
    // Dynamic import to avoid circular dependencies
    const { tierManagementService } = await import('./tierManagementService');
    
    const enhancedAssets = await Promise.all(assets.map(async (asset) => {
      const cacheKey = `${asset.id}_${asset.tokens}`;
      
      if (tierDataCache.has(cacheKey)) {
        const cachedData = tierDataCache.get(cacheKey);
        return {
          ...asset,
          ...cachedData
        };
      }

      try {
        const tiers = await tierManagementService.getTiersForAsset(asset.id);
        const userTier = tierManagementService.getUserTierForAsset(asset.id, asset.tokens);
        
        const tierData = {
          availableTiers: tiers,
          userTier: userTier || undefined,
          tierBenefits: userTier?.benefits || []
        };

        // Cache the tier data for 30 seconds to prevent repeated calls
        tierDataCache.set(cacheKey, tierData);
        setTimeout(() => tierDataCache.delete(cacheKey), 30000);
        
        return {
          ...asset,
          ...tierData
        };
      } catch (error) {
        // Return asset without tier data if there's an error
        return asset;
      }
    }));

    return enhancedAssets;
  } catch (error) {
    console.warn('Could not enhance portfolio data with tiers:', error);
    return assets;
  }
};

// Demo-aware portfolio data service
export const usePortfolioData = () => {
  const { isEnabled, scenario } = useDemoModeStore();
  
  const getPortfolioData = (): { assets: PortfolioAsset[], summary: PortfolioSummary } => {
    if (isEnabled) {
      console.log(`🎭 Demo Mode: Loading ${scenario} portfolio data`);
      return generateDemoPortfolio(scenario);
    }
    return getRealPortfolioData();
  };

  const { assets, summary } = getPortfolioData();

  const getPortfolioStats = () => {
    const assetTypes = assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgAPY = assets.reduce((sum, asset) => 
      sum + parseFloat(asset.apy.replace('%', '')), 0) / assets.length;

    const positiveAssets = assets.filter(asset => asset.isPositive).length;
    const performanceRatio = (positiveAssets / assets.length) * 100;

    return {
      totalAssets: assets.length,
      assetTypes: Object.keys(assetTypes).length,
      avgAPY: `${avgAPY.toFixed(1)}%`,
      performanceRatio: `${performanceRatio.toFixed(0)}%`
    };
  };

  return {
    assets,
    summary,
    stats: getPortfolioStats(),
    isDemoMode: isEnabled,
    scenario: isEnabled ? scenario : null
  };
};

// Enhanced portfolio data hook with tier information
export const useEnhancedPortfolioData = () => {
  const portfolioData = usePortfolioData();
  const [enhancedAssets, setEnhancedAssets] = React.useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Memoize the assets array to prevent unnecessary re-renders
  const assetsKey = React.useMemo(() => 
    portfolioData.assets.map(a => a.id).join(',') + '_' + portfolioData.isDemoMode + '_' + portfolioData.scenario
  , [portfolioData.assets, portfolioData.isDemoMode, portfolioData.scenario]);

  React.useEffect(() => {
    const loadTierData = async () => {
      if (portfolioData.assets.length === 0) {
        setEnhancedAssets([]);
        return;
      }

      setLoading(true);
      try {
        const enhanced = await enhanceWithTierData(portfolioData.assets);
        setEnhancedAssets(enhanced);
      } catch (error) {
        console.warn('Failed to load tier data for portfolio:', error);
        setEnhancedAssets(portfolioData.assets);
      } finally {
        setLoading(false);
      }
    };

    loadTierData();
  }, [assetsKey]);

  return {
    ...portfolioData,
    assets: enhancedAssets,
    loadingTiers: loading
  };
};