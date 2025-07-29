import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export interface MarketOrder {
  id: string;
  assetId: string;
  assetName: string;
  userId: string;
  userName: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop_loss' | 'take_profit';
  quantity: number;
  pricePerToken?: number; // For limit orders
  triggerPrice?: number; // For stop/take profit orders
  totalValue: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled' | 'expired';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  filledQuantity: number;
  averageFillPrice: number;
  fees: {
    platformFee: number;
    gasFee: number;
    total: number;
  };
  compliance: {
    kycVerified: boolean;
    accreditationChecked: boolean;
    jurisdictionAllowed: boolean;
  };
}

export interface Trade {
  id: string;
  assetId: string;
  buyOrderId: string;
  sellOrderId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  pricePerToken: number;
  totalValue: number;
  executedAt: string;
  status: 'pending' | 'completed' | 'failed' | 'disputed';
  settlement: {
    blockHash?: string;
    transactionHash?: string;
    confirmations: number;
    settledAt?: string;
  };
  fees: {
    buyerFee: number;
    sellerFee: number;
    platformFee: number;
    gasFee: number;
    total: number;
  };
}

export interface AssetMarketData {
  assetId: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  volumeChange24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  high24h: number;
  low24h: number;
  averagePrice24h: number;
  lastTradePrice: number;
  lastTradeTime: string;
  bidPrice: number;
  askPrice: number;
  spread: number;
  spreadPercent: number;
  orderBookDepth: {
    bids: Array<{ price: number; quantity: number; total: number }>;
    asks: Array<{ price: number; quantity: number; total: number }>;
  };
  priceHistory: Array<{
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  technicalIndicators: {
    rsi: number;
    macd: number;
    movingAverage7d: number;
    movingAverage30d: number;
    volatility: number;
    momentum: number;
  };
}

export interface UserPortfolioAsset {
  assetId: string;
  assetName: string;
  assetType: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  lockedQuantity: number; // In active sell orders
  availableQuantity: number;
  lastUpdated: string;
}

export interface MarketFilters {
  assetType?: string;
  status?: 'active' | 'partial' | 'completed' | 'cancelled' | 'expired';
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  maxVolume?: number;
  verifiedOnly?: boolean;
  escrowedOnly?: boolean;
  accreditationRequired?: boolean;
  sortBy?: 'price' | 'volume' | 'change' | 'date' | 'marketCap';
  sortDirection?: 'asc' | 'desc';
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
  orderCount: number;
  cumulative: number;
  timestamp: string;
  userId?: string; // Optional for privacy
}

export interface OrderBook {
  assetId: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastPrice: number;
  spread: number;
  spreadPercent: number;
  lastUpdated: number;
  depth: {
    totalBidVolume: number;
    totalAskVolume: number;
  };
}

export interface MarketStats {
  totalVolume24h: number;
  totalVolumeChange24h: number;
  totalMarketCap: number;
  totalMarketCapChange24h: number;
  activeListings: number;
  activeUsers: number;
  totalTrades24h: number;
  averageTradeSize: number;
  topPerformingAsset: {
    assetId: string;
    name: string;
    priceChange: number;
  };
  mostTradedAsset: {
    assetId: string;
    name: string;
    volume: number;
  };
}

interface SecondaryMarketState {
  // Data
  orders: MarketOrder[];
  userOrders: MarketOrder[];
  trades: Trade[];
  userTrades: Trade[];
  tradeHistory: Trade[];
  marketData: Record<string, AssetMarketData>;
  userPortfolio: UserPortfolioAsset[];
  favorites: string[]; // Asset IDs
  orderBooks: Record<string, OrderBook>;
  marketStats: MarketStats | null;
  listings: AssetListing[];
  
  // UI State
  filters: MarketFilters;
  isLoading: boolean;
  error: string | null;
  selectedAsset: string | null;
  lastUpdated: string;
  
  // Settings
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  notifications: {
    orderFilled: boolean;
    priceAlerts: boolean;
    newListings: boolean;
  };
  
  // Price Alerts
  priceAlerts: Array<{
    id: string;
    assetId: string;
    condition: 'above' | 'below';
    targetPrice: number;
    enabled: boolean;
    createdAt: string;
  }>;
  
  // Actions - Orders
  createOrder: (orderData: Omit<MarketOrder, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'filledQuantity' | 'averageFillPrice'>) => Promise<string>;
  cancelOrder: (orderId: string) => Promise<void>;
  modifyOrder: (orderId: string, updates: Partial<Pick<MarketOrder, 'quantity' | 'pricePerToken'>>) => Promise<void>;
  
  // Actions - Trading
  executeMarketOrder: (assetId: string, type: 'buy' | 'sell', quantity: number) => Promise<string>;
  placeLimitOrder: (assetId: string, type: 'buy' | 'sell', quantity: number, pricePerToken: number, expiresAt?: string) => Promise<string>;
  
  // Actions - Data
  refreshData: () => Promise<void>;
  getAssetDetails: (assetId: string) => Promise<AssetMarketData>;
  getPriceHistory: (assetId: string, period: '1d' | '7d' | '30d' | '90d' | '1y') => Promise<AssetMarketData['priceHistory']>;
  getOrderBook: (assetId: string) => Promise<OrderBook>;
  getMarketStats: () => Promise<MarketStats>;
  
  // Actions - Portfolio
  getUserPortfolio: () => Promise<UserPortfolioAsset[]>;
  calculatePortfolioValue: () => number;
  getPortfolioPerformance: (period: '1d' | '7d' | '30d' | '90d' | '1y') => Promise<{
    totalValue: number;
    totalPnl: number;
    totalPnlPercent: number;
    bestPerformer: UserPortfolioAsset;
    worstPerformer: UserPortfolioAsset;
  }>;
  
  // Actions - Favorites & Alerts
  addToFavorites: (assetId: string) => void;
  removeFromFavorites: (assetId: string) => void;
  createPriceAlert: (assetId: string, condition: 'above' | 'below', targetPrice: number) => void;
  removePriceAlert: (alertId: string) => void;
  
  // Actions - Filters
  updateFilters: (filters: Partial<MarketFilters>) => void;
  clearFilters: () => void;
  
  // Actions - Settings
  updateSettings: (settings: Partial<SecondaryMarketState['notifications']>) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (seconds: number) => void;
  
  // Utility Actions
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
  calculateFees: (orderValue: number, orderType: 'market' | 'limit') => { platformFee: number; gasFee: number; total: number };
  validateOrder: (orderData: Partial<MarketOrder>) => { valid: boolean; errors: string[] };
  exportData: (format: 'csv' | 'json') => string;
  
  // Real-time Updates
  subscribeToAsset: (assetId: string) => void;
  unsubscribeFromAsset: (assetId: string) => void;
  onPriceUpdate: (assetId: string, price: number) => void;
  onOrderUpdate: (order: MarketOrder) => void;
  onTradeUpdate: (trade: Trade) => void;
}

// Mock data generators
const generateMockMarketData = (assetId: string): AssetMarketData => {
  const basePrice = 100 + Math.random() * 200;
  const change24h = (Math.random() - 0.5) * 20;
  
  return {
    assetId,
    currentPrice: basePrice,
    priceChange24h: change24h,
    priceChangePercent24h: (change24h / basePrice) * 100,
    volume24h: Math.random() * 100000,
    volumeChange24h: (Math.random() - 0.5) * 50,
    marketCap: basePrice * (1000000 + Math.random() * 9000000),
    circulatingSupply: 1000000 + Math.random() * 9000000,
    totalSupply: 10000000,
    high24h: basePrice * (1 + Math.random() * 0.1),
    low24h: basePrice * (1 - Math.random() * 0.1),
    averagePrice24h: basePrice * (0.95 + Math.random() * 0.1),
    lastTradePrice: basePrice * (0.98 + Math.random() * 0.04),
    lastTradeTime: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
    bidPrice: basePrice * 0.99,
    askPrice: basePrice * 1.01,
    spread: basePrice * 0.02,
    spreadPercent: 2,
    orderBookDepth: {
      bids: Array.from({ length: 10 }, (_, i) => ({
        price: basePrice * (1 - (i + 1) * 0.01),
        quantity: Math.random() * 1000,
        total: 0
      })),
      asks: Array.from({ length: 10 }, (_, i) => ({
        price: basePrice * (1 + (i + 1) * 0.01),
        quantity: Math.random() * 1000,
        total: 0
      }))
    },
    priceHistory: Array.from({ length: 30 }, (_, i) => {
      const timestamp = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString();
      const open = basePrice * (0.9 + Math.random() * 0.2);
      const high = open * (1 + Math.random() * 0.1);
      const low = open * (1 - Math.random() * 0.1);
      const close = low + Math.random() * (high - low);
      
      return {
        timestamp,
        open,
        high,
        low,
        close,
        volume: Math.random() * 10000
      };
    }),
    technicalIndicators: {
      rsi: 30 + Math.random() * 40,
      macd: (Math.random() - 0.5) * 5,
      movingAverage7d: basePrice * (0.95 + Math.random() * 0.1),
      movingAverage30d: basePrice * (0.9 + Math.random() * 0.2),
      volatility: Math.random() * 30,
      momentum: (Math.random() - 0.5) * 20
    }
  };
};

// Helper function to generate mock listings
const generateMockListings = (): AssetListing[] => {
  return [
    {
      id: 'listing_1',
      assetId: 'asset_manhattan_office',
      assetName: 'Manhattan Premium Office Tower',
      assetType: 'Commercial Real Estate',
      sellerId: 'user_seller_1',
      sellerName: 'Premium Real Estate Fund',
      quantity: 500,
      pricePerToken: 312.50,
      totalValue: 156250,
      listingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      description: 'Premium office tower tokens from institutional investor. Building has 98% occupancy with AAA-rated tenants.',
      minimumPurchase: 10,
      verified: true,
      escrowStatus: 'full',
      compliance: {
        kycVerified: true,
        accreditationRequired: false,
        jurisdictionRestrictions: []
      },
      marketData: {
        lastSalePrice: 310.00,
        priceChange24h: 0.81,
        volume24h: 45600,
        highestBid: 311.75,
        lowestAsk: 313.25,
        marketCap: 15625000
      }
    },
    {
      id: 'listing_2',
      assetId: 'asset_solar_nevada',
      assetName: 'Solar Energy Project Nevada',
      assetType: 'Renewable Energy',
      sellerId: 'user_seller_2',
      sellerName: 'GreenTech Investments',
      quantity: 750,
      pricePerToken: 128.75,
      totalValue: 96562.50,
      listingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      description: 'Government-backed solar project with 25-year power purchase agreement. Excellent cash flow history.',
      minimumPurchase: 25,
      verified: true,
      escrowStatus: 'partial',
      compliance: {
        kycVerified: true,
        accreditationRequired: false,
        jurisdictionRestrictions: []
      },
      marketData: {
        lastSalePrice: 126.50,
        priceChange24h: 1.78,
        volume24h: 32400,
        highestBid: 128.00,
        lowestAsk: 129.50,
        marketCap: 9656250
      }
    },
    {
      id: 'listing_3',
      assetId: 'asset_vintage_wine',
      assetName: 'Vintage Wine Collection Series A',
      assetType: 'Collectibles',
      sellerId: 'user_seller_3',
      sellerName: 'Fine Wine Capital',
      quantity: 200,
      pricePerToken: 875.00,
      totalValue: 175000,
      listingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      description: 'Rare Bordeaux collection from premier vintages. Professionally stored and insured.',
      minimumPurchase: 5,
      verified: true,
      escrowStatus: 'full',
      compliance: {
        kycVerified: true,
        accreditationRequired: true,
        jurisdictionRestrictions: ['US', 'EU']
      },
      marketData: {
        lastSalePrice: 862.00,
        priceChange24h: 1.51,
        volume24h: 28700,
        highestBid: 870.00,
        lowestAsk: 880.00,
        marketCap: 17500000
      }
    },
    {
      id: 'listing_4',
      assetId: 'asset_miami_resort',
      assetName: 'Miami Beach Luxury Resort',
      assetType: 'Hospitality Real Estate',
      sellerId: 'user_seller_4',
      sellerName: 'Hospitality Partners LLC',
      quantity: 1200,
      pricePerToken: 208.33,
      totalValue: 250000,
      listingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      description: 'Oceanfront luxury resort with consistent 85%+ occupancy. Strong seasonal performance.',
      minimumPurchase: 50,
      verified: true,
      escrowStatus: 'full',
      compliance: {
        kycVerified: true,
        accreditationRequired: false,
        jurisdictionRestrictions: []
      },
      marketData: {
        lastSalePrice: 205.80,
        priceChange24h: 1.23,
        volume24h: 52300,
        highestBid: 207.50,
        lowestAsk: 209.75,
        marketCap: 25000000
      }
    },
    {
      id: 'listing_5',
      assetId: 'asset_tesla_supercharger',
      assetName: 'Tesla Supercharger Network Expansion',
      assetType: 'Infrastructure',
      sellerId: 'user_seller_5',
      sellerName: 'Infrastructure Growth Partners',
      quantity: 300,
      pricePerToken: 400.00,
      totalValue: 120000,
      listingDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      description: 'EV charging infrastructure with partnership agreements. High growth sector exposure.',
      minimumPurchase: 20,
      verified: true,
      escrowStatus: 'partial',
      compliance: {
        kycVerified: true,
        accreditationRequired: false,
        jurisdictionRestrictions: []
      },
      marketData: {
        lastSalePrice: 395.50,
        priceChange24h: 1.14,
        volume24h: 19800,
        highestBid: 398.75,
        lowestAsk: 401.25,
        marketCap: 12000000
      }
    },
    {
      id: 'listing_6',
      assetId: 'asset_rare_earth_mining',
      assetName: 'Rare Earth Mining Operation',
      assetType: 'Natural Resources',
      sellerId: 'user_seller_6',
      sellerName: 'Strategic Resources Fund',
      quantity: 150,
      pricePerToken: 1533.33,
      totalValue: 230000,
      listingDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      description: 'Critical minerals extraction operation with government permits. Strategic resource exposure.',
      minimumPurchase: 2,
      verified: true,
      escrowStatus: 'full',
      compliance: {
        kycVerified: true,
        accreditationRequired: true,
        jurisdictionRestrictions: ['US']
      },
      marketData: {
        lastSalePrice: 1520.00,
        priceChange24h: 0.88,
        volume24h: 15600,
        highestBid: 1530.00,
        lowestAsk: 1537.50,
        marketCap: 23000000
      }
    }
  ];
};

const generateMockUserPortfolio = (): UserPortfolioAsset[] => [
  {
    assetId: 'asset_solar_alpha',
    assetName: 'Solar Energy Project Alpha',
    assetType: 'Renewable Energy',
    quantity: 500,
    averageBuyPrice: 98.50,
    currentPrice: 105.50,
    totalValue: 52750,
    unrealizedPnl: 3500,
    unrealizedPnlPercent: 7.11,
    lockedQuantity: 100,
    availableQuantity: 400,
    lastUpdated: new Date().toISOString()
  },
  {
    assetId: 'asset_real_estate_beta',
    assetName: 'Commercial Real Estate Fund Beta',
    assetType: 'Real Estate',
    quantity: 200,
    averageBuyPrice: 245.00,
    currentPrice: 250.75,
    totalValue: 50150,
    unrealizedPnl: 1150,
    unrealizedPnlPercent: 2.35,
    lockedQuantity: 0,
    availableQuantity: 200,
    lastUpdated: new Date().toISOString()
  }
];

export const useSecondaryMarketStore = create<SecondaryMarketState>()(
  persist(
    (set, get) => ({
      // Initial state
      orders: [],
      userOrders: [],
      trades: [],
      userTrades: [],
      tradeHistory: [],
      marketData: {},
      userPortfolio: generateMockUserPortfolio(),
      favorites: [],
      orderBooks: {},
      marketStats: null,
      listings: generateMockListings(),
      
      // UI State
      filters: {},
      isLoading: false,
      error: null,
      selectedAsset: null,
      lastUpdated: new Date().toISOString(),
      
      // Settings
      autoRefresh: true,
      refreshInterval: 30,
      notifications: {
        orderFilled: true,
        priceAlerts: true,
        newListings: true
      },
      
      // Price Alerts
      priceAlerts: [],
      
      // Actions - Orders
      createOrder: async (orderData) => {
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();
        
        const order: MarketOrder = {
          ...orderData,
          id: orderId,
          createdAt: timestamp,
          updatedAt: timestamp,
          status: 'pending',
          filledQuantity: 0,
          averageFillPrice: 0
        };
        
        set((state) => ({
          orders: [order, ...state.orders],
          userOrders: [order, ...state.userOrders]
        }));
        
        // Simulate order processing
        setTimeout(() => {
          set((state) => ({
            orders: state.orders.map(o => 
              o.id === orderId 
                ? { ...o, status: 'filled' as const, filledQuantity: o.quantity, averageFillPrice: o.pricePerToken || o.totalValue / o.quantity }
                : o
            ),
            userOrders: state.userOrders.map(o => 
              o.id === orderId 
                ? { ...o, status: 'filled' as const, filledQuantity: o.quantity, averageFillPrice: o.pricePerToken || o.totalValue / o.quantity }
                : o
            )
          }));
        }, 2000);
        
        return orderId;
      },
      
      cancelOrder: async (orderId) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId ? { ...order, status: 'cancelled' as const, updatedAt: new Date().toISOString() } : order
          ),
          userOrders: state.userOrders.map(order =>
            order.id === orderId ? { ...order, status: 'cancelled' as const, updatedAt: new Date().toISOString() } : order
          )
        }));
      },
      
      modifyOrder: async (orderId, updates) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order
          ),
          userOrders: state.userOrders.map(order =>
            order.id === orderId ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order
          )
        }));
      },
      
      // Actions - Trading
      executeMarketOrder: async (assetId, type, quantity) => {
        const marketData = get().marketData[assetId] || generateMockMarketData(assetId);
        const pricePerToken = type === 'buy' ? marketData.askPrice : marketData.bidPrice;
        const totalValue = quantity * pricePerToken;
        
        return get().createOrder({
          assetId,
          assetName: `Asset ${assetId}`,
          userId: 'current_user',
          userName: 'Current User',
          type,
          orderType: 'market',
          quantity,
          totalValue,
          fees: get().calculateFees(totalValue, 'market'),
          compliance: {
            kycVerified: true,
            accreditationChecked: true,
            jurisdictionAllowed: true
          }
        });
      },
      
      placeLimitOrder: async (assetId, type, quantity, pricePerToken, expiresAt) => {
        const totalValue = quantity * pricePerToken;
        
        return get().createOrder({
          assetId,
          assetName: `Asset ${assetId}`,
          userId: 'current_user',
          userName: 'Current User',
          type,
          orderType: 'limit',
          quantity,
          pricePerToken,
          totalValue,
          expiresAt,
          fees: get().calculateFees(totalValue, 'limit'),
          compliance: {
            kycVerified: true,
            accreditationChecked: true,
            jurisdictionAllowed: true
          }
        });
      },
      
      // Actions - Data
      refreshData: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API calls
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update market data for known assets
          const assetIds = ['asset_solar_alpha', 'asset_real_estate_beta', 'asset_tech_gamma'];
          const newMarketData: Record<string, AssetMarketData> = {};
          
          assetIds.forEach(assetId => {
            newMarketData[assetId] = generateMockMarketData(assetId);
          });
          
          set({
            marketData: newMarketData,
            lastUpdated: new Date().toISOString(),
            isLoading: false
          });
        } catch (error) {
          set({
            error: 'Failed to refresh market data',
            isLoading: false
          });
        }
      },
      
      getAssetDetails: async (assetId) => {
        const existing = get().marketData[assetId];
        if (existing) return existing;
        
        const marketData = generateMockMarketData(assetId);
        set((state) => ({
          marketData: { ...state.marketData, [assetId]: marketData }
        }));
        
        return marketData;
      },
      
      getPriceHistory: async (assetId, period) => {
        const marketData = await get().getAssetDetails(assetId);
        return marketData.priceHistory;
      },
      
      getOrderBook: async (assetId) => {
        const marketData = await get().getAssetDetails(assetId);
        const orderBook: OrderBook = {
          assetId,
          bids: marketData.orderBookDepth.bids.map((bid, index) => ({
            ...bid,
            orderCount: Math.floor(Math.random() * 5) + 1,
            cumulative: marketData.orderBookDepth.bids.slice(0, index + 1).reduce((sum, b) => sum + b.quantity, 0),
            timestamp: new Date().toISOString()
          })),
          asks: marketData.orderBookDepth.asks.map((ask, index) => ({
            ...ask,
            orderCount: Math.floor(Math.random() * 5) + 1,
            cumulative: marketData.orderBookDepth.asks.slice(0, index + 1).reduce((sum, a) => sum + a.quantity, 0),
            timestamp: new Date().toISOString()
          })),
          lastPrice: marketData.currentPrice,
          spread: marketData.spread,
          spreadPercent: marketData.spreadPercent,
          lastUpdated: new Date().toISOString(),
          depth: {
            totalBidVolume: marketData.orderBookDepth.bids.reduce((sum, bid) => sum + bid.quantity, 0),
            totalAskVolume: marketData.orderBookDepth.asks.reduce((sum, ask) => sum + ask.quantity, 0)
          }
        };
        
        set((state) => ({
          orderBooks: { ...state.orderBooks, [assetId]: orderBook }
        }));
        
        return orderBook;
      },
      
      getMarketStats: async () => {
        const stats: MarketStats = {
          totalVolume24h: 1250000,
          totalVolumeChange24h: 8.5,
          totalMarketCap: 125000000,
          totalMarketCapChange24h: 3.2,
          activeListings: 47,
          activeUsers: 1240,
          totalTrades24h: 156,
          averageTradeSize: 8012,
          topPerformingAsset: {
            assetId: 'asset_solar_alpha',
            name: 'Solar Energy Project Alpha',
            priceChange: 7.3
          },
          mostTradedAsset: {
            assetId: 'asset_real_estate_beta',
            name: 'Commercial Real Estate Fund Beta',
            volume: 425000
          }
        };
        
        set({ marketStats: stats });
        return stats;
      },
      
      // Actions - Portfolio
      getUserPortfolio: async () => {
        const portfolio = get().userPortfolio;
        return portfolio;
      },
      
      calculatePortfolioValue: () => {
        const portfolio = get().userPortfolio;
        return portfolio.reduce((total, asset) => total + asset.totalValue, 0);
      },
      
      getPortfolioPerformance: async (period) => {
        const portfolio = get().userPortfolio;
        const totalValue = portfolio.reduce((sum, asset) => sum + asset.totalValue, 0);
        const totalPnl = portfolio.reduce((sum, asset) => sum + asset.unrealizedPnl, 0);
        const totalPnlPercent = (totalPnl / (totalValue - totalPnl)) * 100;
        
        const bestPerformer = portfolio.reduce((best, asset) => 
          asset.unrealizedPnlPercent > best.unrealizedPnlPercent ? asset : best
        );
        
        const worstPerformer = portfolio.reduce((worst, asset) => 
          asset.unrealizedPnlPercent < worst.unrealizedPnlPercent ? asset : worst
        );
        
        return {
          totalValue,
          totalPnl,
          totalPnlPercent,
          bestPerformer,
          worstPerformer
        };
      },
      
      // Actions - Favorites & Alerts
      addToFavorites: (assetId) => {
        set((state) => ({
          favorites: Array.from(new Set([...state.favorites, assetId]))
        }));
      },
      
      removeFromFavorites: (assetId) => {
        set((state) => ({
          favorites: state.favorites.filter(id => id !== assetId)
        }));
      },
      
      createPriceAlert: (assetId, condition, targetPrice) => {
        const alert = {
          id: `alert_${Date.now()}`,
          assetId,
          condition,
          targetPrice,
          enabled: true,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          priceAlerts: [...state.priceAlerts, alert]
        }));
      },
      
      removePriceAlert: (alertId) => {
        set((state) => ({
          priceAlerts: state.priceAlerts.filter(alert => alert.id !== alertId)
        }));
      },
      
      // Actions - Filters
      updateFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters }
        }));
      },
      
      clearFilters: () => {
        set({ filters: {} });
      },
      
      // Actions - Settings
      updateSettings: (settings) => {
        set((state) => ({
          notifications: { ...state.notifications, ...settings }
        }));
      },
      
      setAutoRefresh: (enabled) => {
        set({ autoRefresh: enabled });
      },
      
      setRefreshInterval: (seconds) => {
        set({ refreshInterval: seconds });
      },
      
      // Utility Actions
      formatCurrency: (value) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      },
      
      formatPercentage: (value) => {
        return new Intl.NumberFormat('en-US', {
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value / 100);
      },
      
      calculateFees: (orderValue, orderType) => {
        const platformFeeRate = orderType === 'market' ? 0.005 : 0.003; // 0.5% for market, 0.3% for limit
        const platformFee = orderValue * platformFeeRate;
        const gasFee = 15 + (orderValue * 0.0001); // Base gas + variable component
        
        return {
          platformFee,
          gasFee,
          total: platformFee + gasFee
        };
      },
      
      validateOrder: (orderData) => {
        const errors: string[] = [];
        
        if (!orderData.quantity || orderData.quantity <= 0) {
          errors.push('Quantity must be greater than 0');
        }
        
        if (orderData.orderType === 'limit' && (!orderData.pricePerToken || orderData.pricePerToken <= 0)) {
          errors.push('Limit price must be greater than 0');
        }
        
        if (!orderData.assetId) {
          errors.push('Asset ID is required');
        }
        
        return {
          valid: errors.length === 0,
          errors
        };
      },

      exportData: (format) => {
        const state = get();
        
        if (format === 'json') {
          return JSON.stringify({
            orders: state.orders,
            trades: state.trades,
            userPortfolio: state.userPortfolio,
            marketStats: state.marketStats,
            exportDate: new Date().toISOString()
          }, null, 2);
        } else if (format === 'csv') {
          // Export portfolio as CSV
          const headers = ['Asset ID', 'Asset Name', 'Asset Type', 'Quantity', 'Current Price', 'Total Value', 'Unrealized PnL', 'PnL %'];
          const rows = state.userPortfolio.map(asset => [
            asset.assetId,
            asset.assetName,
            asset.assetType,
            asset.quantity.toString(),
            asset.currentPrice.toString(),
            asset.totalValue.toString(),
            asset.unrealizedPnl.toString(),
            asset.unrealizedPnlPercent.toFixed(2)
          ]);
          
          return [headers, ...rows].map(row => row.join(',')).join('\n');
        }
        
        return '';
      },
      
      // Real-time Updates (Mock implementation)
      subscribeToAsset: (assetId) => {
        // In real implementation, this would establish WebSocket connection
        console.log(`Subscribed to asset: ${assetId}`);
      },
      
      unsubscribeFromAsset: (assetId) => {
        // In real implementation, this would close WebSocket connection
        console.log(`Unsubscribed from asset: ${assetId}`);
      },
      
      onPriceUpdate: (assetId, price) => {
        set((state) => ({
          marketData: {
            ...state.marketData,
            [assetId]: {
              ...state.marketData[assetId],
              currentPrice: price,
              lastTradePrice: price,
              lastTradeTime: new Date().toISOString()
            }
          }
        }));
      },
      
      onOrderUpdate: (order) => {
        set((state) => ({
          orders: state.orders.map(o => o.id === order.id ? order : o),
          userOrders: state.userOrders.map(o => o.id === order.id ? order : o)
        }));
      },
      
      onTradeUpdate: (trade) => {
        set((state) => ({
          trades: [trade, ...state.trades.filter(t => t.id !== trade.id)],
          tradeHistory: [trade, ...state.tradeHistory.filter(t => t.id !== trade.id)]
        }));
      }
    }),
    {
      name: 'cf1-secondary-market',
      partialize: (state) => ({
        favorites: state.favorites,
        filters: state.filters,
        notifications: state.notifications,
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval,
        priceAlerts: state.priceAlerts
      })
    }
  )
);