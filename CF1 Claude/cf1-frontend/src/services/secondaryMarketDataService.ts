import { useDataModeStore } from '../store/dataModeStore';

export interface AssetListing {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  pricePerToken: number;
  totalValue: number;
  listingDate: string;
  expiryDate: string;
  status: 'active' | 'partial' | 'completed' | 'cancelled' | 'expired';
  description: string;
  minimumPurchase: number;
  verified: boolean;
  escrowStatus: 'none' | 'partial' | 'full';
  compliance: {
    kycVerified: boolean;
    accreditationRequired: boolean;
    jurisdictionRestrictions: string[];
  };
  marketData: {
    lastSalePrice: number;
    priceChange24h: number;
    volume24h: number;
    highestBid: number;
    lowestAsk: number;
    marketCap: number;
  };
}

export interface TradeHistory {
  id: string;
  assetId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  pricePerToken: number;
  totalValue: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  escrowId?: string;
}

export interface SecondaryMarketStats {
  totalListings: number;
  totalVolume: string;
  avgPrice: string;
  activeTrades: number;
}

// Production data - empty since no real secondary market activity exists yet
const getProductionListings = (): AssetListing[] => {
  return [];
};

const getProductionTradeHistory = (): TradeHistory[] => {
  return [];
};

// Development data - based on user-created listings
const getDevelopmentListings = (): AssetListing[] => {
  // This would typically come from a store or API
  // For now, return empty since no development secondary market data exists
  return [];
};

const getDevelopmentTradeHistory = (): TradeHistory[] => {
  return [];
};

// Demo data - sample secondary market listings for demonstration
const getDemoListings = (): AssetListing[] => {
  return [
    {
      id: 'listing_1',
      assetId: 'asset_solar_alpha',
      assetName: 'Solar Energy Project Alpha',
      assetType: 'Renewable Energy',
      sellerId: 'user_123',
      sellerName: 'GreenTech Investments',
      quantity: 1000,
      pricePerToken: 105.50,
      totalValue: 105500,
      listingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      description: 'High-performing solar project with 5-year track record. Seeking to liquidate position for portfolio rebalancing.',
      minimumPurchase: 100,
      verified: true,
      escrowStatus: 'full',
      compliance: {
        kycVerified: true,
        accreditationRequired: false,
        jurisdictionRestrictions: ['CN', 'IR']
      },
      marketData: {
        lastSalePrice: 102.30,
        priceChange24h: 3.13,
        volume24h: 25000,
        highestBid: 104.75,
        lowestAsk: 105.50,
        marketCap: 12500000
      }
    },
    {
      id: 'listing_2',
      assetId: 'asset_real_estate_beta',
      assetName: 'Commercial Real Estate Fund Beta',
      assetType: 'Real Estate',
      sellerId: 'user_456',
      sellerName: 'Property Ventures LLC',
      quantity: 500,
      pricePerToken: 250.75,
      totalValue: 125375,
      listingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'partial',
      description: 'Diversified commercial real estate portfolio across major metropolitan areas. Strong rental yield and appreciation potential.',
      minimumPurchase: 50,
      verified: true,
      escrowStatus: 'partial',
      compliance: {
        kycVerified: true,
        accreditationRequired: true,
        jurisdictionRestrictions: []
      },
      marketData: {
        lastSalePrice: 248.90,
        priceChange24h: 0.74,
        volume24h: 8500,
        highestBid: 249.25,
        lowestAsk: 250.75,
        marketCap: 3125000
      }
    },
    {
      id: 'listing_3',
      assetId: 'asset_gold_gamma',
      assetName: 'Physical Gold Vault Gamma',
      assetType: 'Precious Metals',
      sellerId: 'user_789',
      sellerName: 'Precious Assets Fund',
      quantity: 2000,
      pricePerToken: 85.25,
      totalValue: 170500,
      listingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      description: 'LBMA-certified gold bars stored in Swiss vault. Perfect hedge against inflation with instant liquidity.',
      minimumPurchase: 25,
      verified: true,
      escrowStatus: 'full',
      compliance: {
        kycVerified: true,
        accreditationRequired: false,
        jurisdictionRestrictions: ['US-NY']
      },
      marketData: {
        lastSalePrice: 84.10,
        priceChange24h: 1.37,
        volume24h: 15750,
        highestBid: 85.00,
        lowestAsk: 85.25,
        marketCap: 2130000
      }
    }
  ];
};

const getDemoTradeHistory = (): TradeHistory[] => {
  return [
    {
      id: 'trade_1',
      assetId: 'asset_solar_alpha',
      buyerId: 'user_buyer_1',
      sellerId: 'user_123',
      quantity: 100,
      pricePerToken: 102.30,
      totalValue: 10230,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: 'trade_2',
      assetId: 'asset_real_estate_beta',
      buyerId: 'user_buyer_2',
      sellerId: 'user_456',
      quantity: 250,
      pricePerToken: 248.90,
      totalValue: 62225,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ];
};

export const useSecondaryMarketData = () => {
  const { currentMode } = useDataModeStore();

  const getListings = (): AssetListing[] => {
    switch (currentMode) {
      case 'production':
        return getProductionListings();
      case 'development':
        return getDevelopmentListings();
      case 'demo':
        return getDemoListings();
      default:
        return getProductionListings();
    }
  };

  const getTradeHistory = (): TradeHistory[] => {
    switch (currentMode) {
      case 'production':
        return getProductionTradeHistory();
      case 'development':
        return getDevelopmentTradeHistory();
      case 'demo':
        return getDemoTradeHistory();
      default:
        return getProductionTradeHistory();
    }
  };

  const getStats = (): SecondaryMarketStats => {
    const listings = getListings();
    const trades = getTradeHistory();
    
    if (listings.length === 0) {
      return {
        totalListings: 0,
        totalVolume: '$0',
        avgPrice: '$0',
        activeTrades: 0
      };
    }

    const totalVolume = listings.reduce((sum, listing) => sum + listing.totalValue, 0);
    const avgPrice = totalVolume / listings.reduce((sum, listing) => sum + listing.quantity, 0);
    
    return {
      totalListings: listings.length,
      totalVolume: `$${totalVolume.toLocaleString()}`,
      avgPrice: `$${avgPrice.toFixed(2)}`,
      activeTrades: listings.filter(l => l.status === 'active').length
    };
  };

  const listings = getListings();
  const tradeHistory = getTradeHistory();
  const stats = getStats();
  const isEmpty = listings.length === 0;

  return {
    listings,
    tradeHistory,
    stats,
    currentMode,
    isEmpty
  };
};