import { useDataModeStore } from '../store/dataModeStore';
import { usePortfolioStore } from '../store/portfolioStore';

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

export interface PortfolioStats {
  totalAssets: number;
  totalValue: string;
  totalGain: string;
  bestPerformer: string;
}

// Production data - empty since no real portfolio exists yet
const getProductionAssets = (): PortfolioAsset[] => {
  return [];
};

const getProductionSummary = (): PortfolioSummary => {
  return {
    totalValue: '$0',
    totalInvested: '$0',
    totalGain: '$0',
    totalGainPercent: '0%',
    isPositive: true
  };
};

// Development data - based on user investments
const getDevelopmentAssets = (): PortfolioAsset[] => {
  // Get actual investments from portfolio store
  try {
    const portfolioState = usePortfolioStore.getState();
    const transactions = portfolioState.transactions || [];
    
    console.log('🔍 Portfolio Debug - All transactions:', transactions);
    console.log('🔍 Portfolio Debug - Transactions count:', transactions.length);
    
    // Convert investment transactions to portfolio assets
    const investmentTransactions = transactions.filter(tx => tx.type === 'investment' && tx.status === 'completed');
    console.log('🔍 Portfolio Debug - Investment transactions:', investmentTransactions);
    
    if (investmentTransactions.length === 0) {
      console.log('📊 Portfolio Debug - No investment transactions found in development mode');
      return [];
    }
    
    // Group by asset and calculate totals
    const assetMap = new Map();
    
    investmentTransactions.forEach(tx => {
      console.log('🔍 Processing transaction:', tx);
      
      const existing = assetMap.get(tx.assetId) || {
        id: tx.assetId,
        name: tx.assetName,
        type: 'Real Estate', // Default type
        tokens: 0,
        purchaseValue: 0,
        currentValue: 0
      };
      
      // Handle both string and number amounts
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : (tx.amount || 0);
      const shares = tx.shares || Math.floor(amount / 1000); // Default: $1000 per share
      
      existing.tokens += shares;
      existing.purchaseValue += amount;
      existing.currentValue += amount * 1.1; // Assume 10% growth
      
      console.log('🔍 Updated asset data:', existing);
      assetMap.set(tx.assetId, existing);
    });
    
    console.log('📈 Portfolio Debug - Asset map:', assetMap);
    
    // Convert map to portfolio asset format
    const assets = Array.from(assetMap.values()).map(asset => {
      const gain = asset.currentValue - asset.purchaseValue;
      const gainPercent = asset.purchaseValue > 0 ? ((gain / asset.purchaseValue) * 100) : 0;
      
      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        tokens: asset.tokens,
        currentValue: `$${asset.currentValue.toLocaleString()}`,
        purchaseValue: `$${asset.purchaseValue.toLocaleString()}`,
        change: `${gain >= 0 ? '+' : ''}$${gain.toLocaleString()}`,
        changePercent: `${gain >= 0 ? '+' : ''}${gainPercent.toFixed(1)}%`,
        isPositive: gain >= 0,
        apy: '10.0%', // Default APY
        imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop'
      };
    });
    
    console.log('✅ Portfolio Debug - Final assets:', assets);
    return assets;
  } catch (error) {
    console.error('❌ Error loading development portfolio:', error);
    return [];
  }
};

const getDevelopmentSummary = (): PortfolioSummary => {
  try {
    const assets = getDevelopmentAssets();
    
    if (assets.length === 0) {
      return {
        totalValue: '$0',
        totalInvested: '$0',
        totalGain: '$0',
        totalGainPercent: '0%',
        isPositive: true
      };
    }
    
    const totalValue = assets.reduce((sum, asset) => 
      sum + parseFloat(asset.currentValue.replace(/[$,]/g, '')), 0);
    const totalInvested = assets.reduce((sum, asset) => 
      sum + parseFloat(asset.purchaseValue.replace(/[$,]/g, '')), 0);
    const totalGain = totalValue - totalInvested;
    const totalGainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100) : 0;
    
    return {
      totalValue: `$${totalValue.toLocaleString()}`,
      totalInvested: `$${totalInvested.toLocaleString()}`,
      totalGain: `${totalGain >= 0 ? '+' : ''}$${totalGain.toLocaleString()}`,
      totalGainPercent: `${totalGain >= 0 ? '+' : ''}${totalGainPercent.toFixed(1)}%`,
      isPositive: totalGain >= 0
    };
  } catch (error) {
    console.log('Error calculating development summary:', error);
    return {
      totalValue: '$0',
      totalInvested: '$0',
      totalGain: '$0',
      totalGainPercent: '0%',
      isPositive: true
    };
  }
};

// Demo data - sample portfolio for demonstration
const getDemoAssets = (): PortfolioAsset[] => {
  return [
    {
      id: 'port-demo-1',
      name: 'Prime Manhattan Office Tower',
      type: 'Commercial Real Estate',
      tokens: 850,
      currentValue: '$125,200',
      purchaseValue: '$105,000',
      change: '+$20,200',
      changePercent: '+19.2%',
      isPositive: true,
      apy: '14.5%',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop'
    },
    {
      id: 'port-demo-2',
      name: 'Solar Energy Project Alpha',
      type: 'Renewable Energy',
      tokens: 1200,
      currentValue: '$89,650',
      purchaseValue: '$75,000',
      change: '+$14,650',
      changePercent: '+19.5%',
      isPositive: true,
      apy: '16.2%',
      imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=100&h=100&fit=crop'
    },
    {
      id: 'port-demo-3',
      name: 'Physical Gold Vault Beta',
      type: 'Precious Metals',
      tokens: 500,
      currentValue: '$42,750',
      purchaseValue: '$40,000',
      change: '+$2,750',
      changePercent: '+6.9%',
      isPositive: true,
      apy: '8.5%',
      imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=100&h=100&fit=crop'
    },
    {
      id: 'port-demo-4',
      name: 'Vintage Wine Collection',
      type: 'Collectibles',
      tokens: 300,
      currentValue: '$35,800',
      purchaseValue: '$32,000',
      change: '+$3,800',
      changePercent: '+11.9%',
      isPositive: true,
      apy: '12.2%',
      imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=100&h=100&fit=crop'
    },
    {
      id: 'port-demo-5',
      name: 'Tech Startup Equity Fund',
      type: 'Technology',
      tokens: 750,
      currentValue: '$28,400',
      purchaseValue: '$30,000',
      change: '-$1,600',
      changePercent: '-5.3%',
      isPositive: false,
      apy: '22.5%',
      imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=100&fit=crop'
    }
  ];
};

const getDemoSummary = (): PortfolioSummary => {
  return {
    totalValue: '$321,800',
    totalInvested: '$282,000',
    totalGain: '+$39,800',
    totalGainPercent: '+14.1%',
    isPositive: true
  };
};

export const usePortfolioData = () => {
  const { currentMode } = useDataModeStore();

  const getAssets = (): PortfolioAsset[] => {
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

  const getSummary = (): PortfolioSummary => {
    switch (currentMode) {
      case 'production':
        return getProductionSummary();
      case 'development':
        return getDevelopmentSummary();
      case 'demo':
        return getDemoSummary();
      default:
        return getProductionSummary();
    }
  };

  const getStats = (): PortfolioStats => {
    const assets = getAssets();
    const summary = getSummary();
    
    if (assets.length === 0) {
      return {
        totalAssets: 0,
        totalValue: '$0',
        totalGain: '$0',
        bestPerformer: 'None'
      };
    }

    const bestPerformer = assets.reduce((best, current) => {
      const bestPercent = parseFloat(best.changePercent.replace(/[^0-9.-]/g, ''));
      const currentPercent = parseFloat(current.changePercent.replace(/[^0-9.-]/g, ''));
      return currentPercent > bestPercent ? current : best;
    });

    return {
      totalAssets: assets.length,
      totalValue: summary.totalValue,
      totalGain: summary.totalGain,
      bestPerformer: bestPerformer.name
    };
  };

  const assets = getAssets();
  const summary = getSummary();
  const stats = getStats();
  const isEmpty = assets.length === 0;

  return {
    assets,
    summary,
    stats,
    currentMode,
    isEmpty
  };
};