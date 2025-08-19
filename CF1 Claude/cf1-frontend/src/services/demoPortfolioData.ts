import { useDemoModeStore, DemoScenario } from '../store/demoModeStore';
import { getScenarioOptimizedImage, getAssetImage } from './assetImageService';

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
}

export interface PortfolioSummary {
  totalValue: string;
  totalInvested: string;
  totalGain: string;
  totalGainPercent: string;
  isPositive: boolean;
}

// Utility function to add realistic variance to numbers
const varyNumber = (base: number, variance: number = 0.02): number => {
  const variation = (Math.random() - 0.5) * 2 * variance;
  return Math.round(base * (1 + variation));
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
          tokens: varyNumber(850),
          currentValue: `$${varyNumber(125000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(105000).toLocaleString()}`,
          change: `+$${varyNumber(20000).toLocaleString()}`,
          changePercent: `+${varyNumber(19, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${Math.min(varyNumber(14, 0.05), 15).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Commercial Real Estate', scenario, 0)?.url || getAssetImage('Commercial Real Estate', 0)?.url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop'
        },
        {
          id: 'port-inv-2',
          name: 'Swiss Gold Reserve Vault',
          type: 'Precious Metals',
          tokens: varyNumber(1200),
          currentValue: `$${varyNumber(85000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(75000).toLocaleString()}`,
          change: `+$${varyNumber(10000).toLocaleString()}`,
          changePercent: `+${varyNumber(13, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${Math.min(varyNumber(12, 0.05), 15).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Precious Metals', scenario, 0)?.url || getAssetImage('Precious Metals', 0)?.url || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=100&h=100&fit=crop'
        },
        {
          id: 'port-inv-3',
          name: 'California Clean Energy Portfolio',
          type: 'Green Infrastructure',
          tokens: varyNumber(950),
          currentValue: `$${varyNumber(75000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(65000).toLocaleString()}`,
          change: `+$${varyNumber(10000).toLocaleString()}`,
          changePercent: `+${varyNumber(15, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${Math.min(varyNumber(13, 0.05), 15).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Green Infrastructure', scenario, 0)?.url || getAssetImage('Green Infrastructure', 0)?.url || 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=100&h=100&fit=crop'
        },
        {
          id: 'port-inv-4',
          name: 'Luxury Resort Collection',
          type: 'Hospitality Real Estate',
          tokens: varyNumber(600),
          currentValue: `$${varyNumber(95000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(82000).toLocaleString()}`,
          change: `+$${varyNumber(13000).toLocaleString()}`,
          changePercent: `+${varyNumber(16, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${Math.min(varyNumber(11, 0.05), 15).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Hospitality Real Estate', scenario, 0)?.url || getAssetImage('Hospitality Real Estate', 0)?.url || 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&h=100&fit=crop'
        }
      ];

      const investorTotalValue = varyNumber(380000);
      const investorTotalInvested = varyNumber(327000);
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
      const salesAssets: PortfolioAsset[] = [
        {
          id: 'port-sales-1',
          name: 'Austin Tech Hub Office Complex',
          type: 'Commercial Real Estate',
          tokens: varyNumber(425),
          currentValue: `$${varyNumber(48000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(42000).toLocaleString()}`,
          change: `+$${varyNumber(6000).toLocaleString()}`,
          changePercent: `+${varyNumber(14, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(9, 0.1).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Commercial Real Estate', scenario, 1)?.url || getAssetImage('Commercial Real Estate', 1)?.url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop'
        },
        {
          id: 'port-sales-2',
          name: 'Diversified Precious Metals Fund',
          type: 'Precious Metals',
          tokens: varyNumber(680),
          currentValue: `$${varyNumber(32000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(29000).toLocaleString()}`,
          change: `+$${varyNumber(3000).toLocaleString()}`,
          changePercent: `+${varyNumber(10, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(7, 0.1).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Precious Metals', scenario, 1)?.url || getAssetImage('Precious Metals', 1)?.url || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=100&h=100&fit=crop'
        },
        {
          id: 'port-sales-3',
          name: 'Contemporary Art Investment Portfolio',
          type: 'Fine Art',
          tokens: varyNumber(125),
          currentValue: `$${varyNumber(28000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(25000).toLocaleString()}`,
          change: `+$${varyNumber(3000).toLocaleString()}`,
          changePercent: `+${varyNumber(12, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(11, 0.1).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Fine Art', scenario, 0)?.url || getAssetImage('Fine Art', 0)?.url || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop'
        },
        {
          id: 'port-sales-4',
          name: 'Clean Energy Infrastructure Fund',
          type: 'Renewable Energy',
          tokens: varyNumber(350),
          currentValue: `$${varyNumber(42000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(38000).toLocaleString()}`,
          change: `+$${varyNumber(4000).toLocaleString()}`,
          changePercent: `+${varyNumber(11, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(10, 0.1).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Renewable Energy', scenario, 1)?.url || getAssetImage('Renewable Energy', 1)?.url || 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=100&h=100&fit=crop'
        },
        {
          id: 'port-sales-5',
          name: 'Luxury Vehicle Collection Fund',
          type: 'Luxury Vehicles',
          tokens: varyNumber(200),
          currentValue: `$${varyNumber(35000).toLocaleString()}`,
          purchaseValue: `$${varyNumber(32000).toLocaleString()}`,
          change: `+$${varyNumber(3000).toLocaleString()}`,
          changePercent: `+${varyNumber(9, 0.1).toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(8, 0.1).toFixed(1)}%`,
          imageUrl: getScenarioOptimizedImage('Luxury Vehicles', scenario, 0)?.url || getAssetImage('Luxury Vehicles', 0)?.url || 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=100&h=100&fit=crop'
        }
      ];

      const salesTotalValue = varyNumber(185000);
      const salesTotalInvested = varyNumber(166000);
      const salesTotalGain = salesTotalValue - salesTotalInvested;
      const salesGainPercent = ((salesTotalGain / salesTotalInvested) * 100);

      return {
        assets: salesAssets,
        summary: {
          totalValue: `$${salesTotalValue.toLocaleString()}`,
          totalInvested: `$${salesTotalInvested.toLocaleString()}`,
          totalGain: `+$${salesTotalGain.toLocaleString()}`,
          totalGainPercent: `+${salesGainPercent.toFixed(1)}%`,
          isPositive: true
        }
      };

    case 'user_onboarding':
      const onboardingAssets: PortfolioAsset[] = [
        {
          id: 'port-onboard-1',
          name: 'Beginner Real Estate Investment Trust',
          type: 'Residential Real Estate',
          tokens: varyNumber(250),
          currentValue: `$${varyNumber(2800).toLocaleString()}`,
          purchaseValue: `$${varyNumber(2500).toLocaleString()}`,
          change: `+$${varyNumber(300).toLocaleString()}`,
          changePercent: `+${varyNumber(12, 0.2).toFixed(1)}%`,
          isPositive: true,
          apy: `${varyNumber(6, 0.1).toFixed(1)}%`,
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

      const onboardingTotalValue = varyNumber(5900);
      const onboardingTotalInvested = varyNumber(5450);
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