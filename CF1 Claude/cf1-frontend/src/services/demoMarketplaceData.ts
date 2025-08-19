import { useDemoModeStore, DemoScenario } from '../store/demoModeStore';
import { getScenarioOptimizedImage, getAssetImage } from './assetImageService';

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
}

// Utility function to add realistic variance to numbers
const varyNumber = (base: number, variance: number = 0.02): number => {
  const variation = (Math.random() - 0.5) * 2 * variance;
  return Math.round(base * (1 + variation));
};

// Base asset templates for different scenarios
const generateDemoAssets = (scenario: DemoScenario): AssetListing[] => {
  switch (scenario) {
    case 'investor_presentation':
      return [
        {
          id: 'demo-1',
          name: 'Prime Manhattan Office Tower',
          type: 'Commercial Real Estate',
          location: 'New York, NY',
          totalValue: `$${varyNumber(8500000).toLocaleString()}`,
          tokenPrice: '$500',
          tokensAvailable: varyNumber(2000),
          totalTokens: 17000,
          apy: `${Math.min(varyNumber(14, 0.05), 15).toFixed(1)}%`,
          rating: 4.9,
          imageUrl: getScenarioOptimizedImage('Commercial Real Estate', scenario, 0)?.url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
          tags: ['Prime Location', 'High Yield', 'Institutional Grade']
        },
        {
          id: 'demo-2',
          name: 'Swiss Gold Reserve Vault',
          type: 'Precious Metals',
          location: 'Zurich, Switzerland',
          totalValue: `$${varyNumber(5200000).toLocaleString()}`,
          tokenPrice: '$250',
          tokensAvailable: varyNumber(1500),
          totalTokens: 20800,
          apy: `${Math.min(varyNumber(12, 0.05), 15).toFixed(1)}%`,
          rating: 5.0,
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop',
          tags: ['Ultra Stable', 'Inflation Hedge', 'Bank Grade']
        },
        {
          id: 'demo-3',
          name: 'Renewable Energy Portfolio',
          type: 'Green Infrastructure',
          location: 'California, US',
          totalValue: `$${varyNumber(12000000).toLocaleString()}`,
          tokenPrice: '$400',
          tokensAvailable: varyNumber(3000),
          totalTokens: 30000,
          apy: `${Math.min(varyNumber(13, 0.05), 15).toFixed(1)}%`,
          rating: 4.8,
          imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
          tags: ['ESG Compliant', 'Growth Sector', 'Tax Incentives']
        },
        {
          id: 'demo-4',
          name: 'Luxury Resort Collection',
          type: 'Hospitality Real Estate',
          location: 'French Riviera',
          totalValue: `$${varyNumber(15000000).toLocaleString()}`,
          tokenPrice: '$750',
          tokensAvailable: varyNumber(1200),
          totalTokens: 20000,
          apy: `${Math.min(varyNumber(11, 0.05), 15).toFixed(1)}%`,
          rating: 4.9,
          imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop',
          tags: ['Premium Location', 'Seasonal Revenue', 'International']
        }
      ];

    case 'sales_demo':
      return [
        {
          id: 'demo-s1',
          name: 'Tech Hub Office Complex',
          type: 'Commercial Real Estate',
          location: 'Austin, TX',
          totalValue: `$${varyNumber(3200000).toLocaleString()}`,
          tokenPrice: '$100',
          tokensAvailable: varyNumber(8000),
          totalTokens: 32000,
          apy: `${varyNumber(9, 0.1).toFixed(1)}%`,
          rating: 4.7,
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
          tags: ['Growing Market', 'Tech Sector', 'High Demand']
        },
        {
          id: 'demo-s2',
          name: 'Diversified Precious Metals',
          type: 'Precious Metals',
          location: 'Secure Vault',
          totalValue: `$${varyNumber(1800000).toLocaleString()}`,
          tokenPrice: '$75',
          tokensAvailable: varyNumber(6000),
          totalTokens: 24000,
          apy: `${varyNumber(7, 0.1).toFixed(1)}%`,
          rating: 4.8,
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop',
          tags: ['Stable Returns', 'Portfolio Diversification', 'Liquidity']
        },
        {
          id: 'demo-s3',
          name: 'Contemporary Art Portfolio',
          type: 'Fine Art',
          location: 'Gallery Network',
          totalValue: `$${varyNumber(950000).toLocaleString()}`,
          tokenPrice: '$200',
          tokensAvailable: varyNumber(2500),
          totalTokens: 4750,
          apy: `${varyNumber(11, 0.1).toFixed(1)}%`,
          rating: 4.6,
          imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
          tags: ['Cultural Value', 'Appreciation Potential', 'Unique Assets']
        },
        {
          id: 'demo-s4',
          name: 'Urban Retail Properties',
          type: 'Retail Real Estate',
          location: 'Multi-City',
          totalValue: `$${varyNumber(4500000).toLocaleString()}`,
          tokenPrice: '$150',
          tokensAvailable: varyNumber(5000),
          totalTokens: 30000,
          apy: `${varyNumber(8, 0.1).toFixed(1)}%`,
          rating: 4.5,
          imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
          tags: ['Steady Income', 'Multiple Locations', 'Retail Recovery']
        },
        {
          id: 'demo-s5',
          name: 'Clean Energy Infrastructure',
          type: 'Renewable Energy',
          location: 'Texas, US',
          totalValue: `$${varyNumber(6800000).toLocaleString()}`,
          tokenPrice: '$300',
          tokensAvailable: varyNumber(4200),
          totalTokens: 22667,
          apy: `${varyNumber(10, 0.1).toFixed(1)}%`,
          rating: 4.7,
          imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
          tags: ['ESG Focus', 'Government Incentives', 'Future Growth']
        },
        {
          id: 'demo-s6',
          name: 'Luxury Vehicle Collection',
          type: 'Collectible Vehicles',
          location: 'Private Garage',
          totalValue: `$${varyNumber(2100000).toLocaleString()}`,
          tokenPrice: '$175',
          tokensAvailable: varyNumber(3000),
          totalTokens: 12000,
          apy: `${varyNumber(9, 0.1).toFixed(1)}%`,
          rating: 4.4,
          imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop',
          tags: ['Collectible Market', 'Rental Income', 'Appreciation']
        },
        {
          id: 'demo-s7',
          name: 'Miami Beachfront Resort',
          type: 'Hospitality Real Estate',
          location: 'Miami Beach, FL',
          totalValue: `$${varyNumber(8200000).toLocaleString()}`,
          tokenPrice: '$250',
          tokensAvailable: varyNumber(6500),
          totalTokens: 32800,
          apy: `${varyNumber(11, 0.1).toFixed(1)}%`,
          rating: 4.8,
          imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop',
          tags: ['Tourism Recovery', 'Seasonal Revenue', 'Premium Location']
        },
        {
          id: 'demo-s8',
          name: 'Industrial Warehouse Portfolio',
          type: 'Industrial Real Estate',
          location: 'Phoenix, AZ',
          totalValue: `$${varyNumber(5600000).toLocaleString()}`,
          tokenPrice: '$125',
          tokensAvailable: varyNumber(8200),
          totalTokens: 44800,
          apy: `${varyNumber(8, 0.1).toFixed(1)}%`,
          rating: 4.6,
          imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
          tags: ['E-commerce Demand', 'Long-term Leases', 'Distribution Hub']
        },
        {
          id: 'demo-s9',
          name: 'Vintage Wine Investment Fund',
          type: 'Collectibles',
          location: 'Napa Valley, CA',
          totalValue: `$${varyNumber(1850000).toLocaleString()}`,
          tokenPrice: '$350',
          tokensAvailable: varyNumber(2400),
          totalTokens: 5286,
          apy: `${varyNumber(12, 0.1).toFixed(1)}%`,
          rating: 4.5,
          imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
          tags: ['Luxury Market', 'Age Appreciation', 'Expert Curation']
        },
        {
          id: 'demo-s10',
          name: 'Student Housing Complex',
          type: 'Educational Real Estate',
          location: 'Austin, TX',
          totalValue: `$${varyNumber(3400000).toLocaleString()}`,
          tokenPrice: '$85',
          tokensAvailable: varyNumber(9500),
          totalTokens: 40000,
          apy: `${varyNumber(9, 0.1).toFixed(1)}%`,
          rating: 4.4,
          imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e460b1e1?w=400&h=300&fit=crop',
          tags: ['Student Demand', 'Stable Occupancy', 'University Partnership']
        },
        {
          id: 'demo-s11',
          name: 'Green Building Office Park',
          type: 'Sustainable Real Estate',
          location: 'Portland, OR',
          totalValue: `$${varyNumber(7200000).toLocaleString()}`,
          tokenPrice: '$180',
          tokensAvailable: varyNumber(7800),
          totalTokens: 40000,
          apy: `${varyNumber(10, 0.1).toFixed(1)}%`,
          rating: 4.7,
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
          tags: ['LEED Certified', 'ESG Investment', 'Tax Benefits']
        },
        {
          id: 'demo-s12',
          name: 'Cryptocurrency Mining Facility',
          type: 'Digital Infrastructure',
          location: 'Wyoming, US',
          totalValue: `$${varyNumber(4100000).toLocaleString()}`,
          tokenPrice: '$205',
          tokensAvailable: varyNumber(4500),
          totalTokens: 20000,
          apy: `${varyNumber(15, 0.1).toFixed(1)}%`,
          rating: 4.3,
          imageUrl: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?w=400&h=300&fit=crop',
          tags: ['High Yield', 'Tech Infrastructure', 'Crypto Exposure']
        },
        {
          id: 'demo-s13',
          name: 'Farmland Agriculture Fund',
          type: 'Agricultural Real Estate',
          location: 'Iowa, US',
          totalValue: `$${varyNumber(6800000).toLocaleString()}`,
          tokenPrice: '$95',
          tokensAvailable: varyNumber(12000),
          totalTokens: 71579,
          apy: `${varyNumber(7, 0.1).toFixed(1)}%`,
          rating: 4.5,
          imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
          tags: ['Food Security', 'Stable Returns', 'Commodity Exposure']
        },
        {
          id: 'demo-s14',
          name: 'Medical Office Buildings',
          type: 'Healthcare Real Estate',
          location: 'Dallas, TX',
          totalValue: `$${varyNumber(9200000).toLocaleString()}`,
          tokenPrice: '$275',
          tokensAvailable: varyNumber(5800),
          totalTokens: 33455,
          apy: `${varyNumber(8, 0.1).toFixed(1)}%`,
          rating: 4.6,
          imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop',
          tags: ['Healthcare Growth', 'Essential Services', 'Long-term Leases']
        },
        {
          id: 'demo-s15',
          name: 'Self-Storage Facility Network',
          type: 'Storage Real Estate',
          location: 'Multi-State',
          totalValue: `$${varyNumber(2900000).toLocaleString()}`,
          tokenPrice: '$65',
          tokensAvailable: varyNumber(11500),
          totalTokens: 44615,
          apy: `${varyNumber(9, 0.1).toFixed(1)}%`,
          rating: 4.4,
          imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
          tags: ['Recession Resistant', 'High Margins', 'Growing Demand']
        }
      ];

    case 'user_onboarding':
      return [
        {
          id: 'demo-u1',
          name: 'Starter Real Estate Fund',
          type: 'Residential Real Estate',
          location: 'Denver, CO',
          totalValue: `$${varyNumber(850000).toLocaleString()}`,
          tokenPrice: '$25',
          tokensAvailable: varyNumber(12000),
          totalTokens: 34000,
          apy: `${varyNumber(6, 0.1).toFixed(1)}%`,
          rating: 4.3,
          imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
          tags: ['Beginner Friendly', 'Low Entry', 'Education Included']
        },
        {
          id: 'demo-u2',
          name: 'Silver Investment Basics',
          type: 'Precious Metals',
          location: 'Certified Vault',
          totalValue: `$${varyNumber(420000).toLocaleString()}`,
          tokenPrice: '$10',
          tokensAvailable: varyNumber(15000),
          totalTokens: 42000,
          apy: `${varyNumber(5, 0.1).toFixed(1)}%`,
          rating: 4.2,
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop',
          tags: ['Educational', 'Stable Investment', 'Learning Module']
        },
        {
          id: 'demo-u3',
          name: 'Community Solar Project',
          type: 'Renewable Energy',
          location: 'Arizona, US',
          totalValue: `$${varyNumber(1200000).toLocaleString()}`,
          tokenPrice: '$50',
          tokensAvailable: varyNumber(8000),
          totalTokens: 24000,
          apy: `${varyNumber(7, 0.1).toFixed(1)}%`,
          rating: 4.5,
          imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
          tags: ['Community Impact', 'Green Investment', 'Tutorial Available']
        }
      ];

    case 'regulatory_showcase':
      return [
        {
          id: 'demo-r1',
          name: 'Compliant Office REIT',
          type: 'Commercial Real Estate',
          location: 'Washington, DC',
          totalValue: `$${varyNumber(2800000).toLocaleString()}`,
          tokenPrice: '$100',
          tokensAvailable: varyNumber(7500),
          totalTokens: 28000,
          apy: `${varyNumber(6, 0.05).toFixed(1)}%`,
          rating: 4.4,
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
          tags: ['SEC Compliant', 'Regulated Entity', 'Transparent']
        },
        {
          id: 'demo-r2',
          name: 'Audited Gold Holdings',
          type: 'Precious Metals',
          location: 'Federal Reserve Vault',
          totalValue: `$${varyNumber(1500000).toLocaleString()}`,
          tokenPrice: '$75',
          tokensAvailable: varyNumber(5000),
          totalTokens: 20000,
          apy: `${varyNumber(4, 0.05).toFixed(1)}%`,
          rating: 4.6,
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop',
          tags: ['Third-Party Audited', 'Regulatory Compliant', 'Insured']
        },
        {
          id: 'demo-r3',
          name: 'Infrastructure Bond Fund',
          type: 'Government Bonds',
          location: 'Multi-State',
          totalValue: `$${varyNumber(5000000).toLocaleString()}`,
          tokenPrice: '$250',
          tokensAvailable: varyNumber(3000),
          totalTokens: 20000,
          apy: `${varyNumber(5, 0.05).toFixed(1)}%`,
          rating: 4.8,
          imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop',
          tags: ['Government Backed', 'AAA Rated', 'Low Risk']
        }
      ];

    case 'development_testing':
      return [
        {
          id: 'test-1',
          name: 'Test Asset Alpha',
          type: 'Test Category',
          location: 'Test Location',
          totalValue: '$999,999',
          tokenPrice: '$1',
          tokensAvailable: 50000,
          totalTokens: 100000,
          apy: '1.0%',
          rating: 3.0,
          imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
          tags: ['Test', 'Alpha', 'Development']
        },
        {
          id: 'test-2',
          name: 'Test Asset Beta',
          type: 'Another Test Category',
          location: 'Beta Location',
          totalValue: '$888,888',
          tokenPrice: '$2',
          tokensAvailable: 25000,
          totalTokens: 50000,
          apy: '2.0%',
          rating: 4.0,
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop',
          tags: ['Test', 'Beta', 'QA']
        }
      ];

    case 'custom':
    default:
      // Return mixed realistic data for custom scenarios
      return [
        {
          id: 'custom-1',
          name: 'Mixed Portfolio Asset',
          type: 'Diversified',
          location: 'Various',
          totalValue: `$${varyNumber(2000000).toLocaleString()}`,
          tokenPrice: '$100',
          tokensAvailable: varyNumber(5000),
          totalTokens: 20000,
          apy: `${varyNumber(8, 0.2).toFixed(1)}%`,
          rating: 4.5,
          imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
          tags: ['Custom', 'Flexible', 'Demo']
        }
      ];
  }
};

// Real marketplace assets (empty when not in demo mode - should come from API)
export const getRealMarketplaceAssets = (): AssetListing[] => {
  // In production, this would fetch from your API
  // For now, return empty array to show that no real assets are available yet
  return [];
};

// Demo-aware marketplace data service
export const useMarketplaceAssets = () => {
  const { isEnabled, scenario } = useDemoModeStore();
  
  const getAssets = (): AssetListing[] => {
    console.log(`🔍 [MARKETPLACE] Demo Mode State - isEnabled: ${isEnabled}, scenario: ${scenario}`);
    if (isEnabled) {
      console.log(`🎭 [MARKETPLACE] Demo Mode ON: Loading ${scenario} marketplace assets`);
      const demoAssets = generateDemoAssets(scenario);
      console.log(`🎭 [MARKETPLACE] Generated ${demoAssets.length} demo assets for scenario: ${scenario}`);
      return demoAssets;
    }
    console.log(`🔧 [MARKETPLACE] Demo Mode OFF: Loading real marketplace assets (should be empty)`);
    const realAssets = getRealMarketplaceAssets();
    console.log(`🔧 [MARKETPLACE] Real assets count: ${realAssets.length} (should be 0)`);
    
    // Extra validation
    if (realAssets.length > 0) {
      console.warn(`⚠️ [MARKETPLACE] WARNING: Real assets returned ${realAssets.length} items when demo mode is OFF. This should be 0.`);
    }
    
    return realAssets;
  };

  const getQuickStats = () => {
    const assets = getAssets();
    const totalAssets = assets.length;
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
    isDemoMode: isEnabled,
    scenario: isEnabled ? scenario : null
  };
};

// Helper function to get a single demo asset by ID for use in asset detail pages
export const getDemoMarketplaceAssetById = (id: string, scenario: DemoScenario): AssetListing | null => {
  const assets = generateDemoAssets(scenario);
  return assets.find(asset => asset.id === id) || null;
};