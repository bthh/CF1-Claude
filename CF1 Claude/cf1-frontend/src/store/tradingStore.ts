import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  TradingAsset, 
  TradingOrder, 
  TradeExecution, 
  OrderBook, 
  UserPosition, 
  MarketStats,
  EscrowDetails 
} from '../types/trading';

interface TradingState {
  // Assets
  assets: TradingAsset[];
  selectedAsset: TradingAsset | null;
  
  // Orders
  userOrders: TradingOrder[];
  allOrders: TradingOrder[];
  orderBook: OrderBook | null;
  
  // Trades
  tradeHistory: TradeExecution[];
  userTrades: TradeExecution[];
  
  // Positions
  userPositions: UserPosition[];
  
  // Market data
  marketStats: MarketStats | null;
  
  // Escrow
  activeEscrows: EscrowDetails[];
  
  // UI state
  selectedTab: 'buy' | 'sell' | 'orders' | 'history';
  loading: boolean;
  error: string | null;
  
  // Actions
  setSelectedAsset: (asset: TradingAsset | null) => void;
  setSelectedTab: (tab: 'buy' | 'sell' | 'orders' | 'history') => void;
  
  // Asset actions
  loadAssets: () => Promise<void>;
  loadAssetDetails: (assetId: string) => Promise<TradingAsset | null>;
  
  // Order actions
  createOrder: (order: Omit<TradingOrder, 'id' | 'createdAt' | 'updatedAt' | 'filledQuantity' | 'remainingQuantity'>) => Promise<TradingOrder>;
  cancelOrder: (orderId: string) => Promise<void>;
  loadUserOrders: () => Promise<void>;
  loadOrderBook: (assetId: string) => Promise<void>;
  
  // Trading actions
  executeMarketOrder: (assetId: string, type: 'buy' | 'sell', quantity: number) => Promise<TradeExecution>;
  loadTradeHistory: (assetId?: string) => Promise<void>;
  
  // Position actions
  loadUserPositions: () => Promise<void>;
  
  // Market data actions
  loadMarketStats: () => Promise<void>;
  
  // Escrow actions
  loadActiveEscrows: () => Promise<void>;
  createEscrow: (tradeId: string) => Promise<EscrowDetails>;
  releaseEscrow: (escrowId: string) => Promise<void>;
}

// Mock data generators
const generateMockAssets = (): TradingAsset[] => [
  {
    id: 'asset-1',
    name: 'Manhattan Office Complex',
    symbol: 'MOC',
    totalSupply: 1000,
    availableSupply: 450,
    currentPrice: 5250.00,
    priceChange24h: 2.34,
    volume24h: 125000,
    marketCap: 5250000,
    description: 'Premium office space in downtown Manhattan with high-profile tenants.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    category: 'real-estate',
    verified: true,
    createdAt: '2024-01-15T10:00:00Z',
    metadata: {
      location: 'Manhattan, NY',
      valuation: 5250000,
      lastAppraisal: '2024-01-10T00:00:00Z',
      riskRating: 'low'
    }
  },
  {
    id: 'asset-2',
    name: 'Rare Wine Collection',
    symbol: 'RWC',
    totalSupply: 500,
    availableSupply: 180,
    currentPrice: 1850.00,
    priceChange24h: -1.25,
    volume24h: 67000,
    marketCap: 925000,
    description: 'Curated collection of vintage wines from renowned vineyards.',
    imageUrl: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=300&fit=crop',
    category: 'collectibles',
    verified: true,
    createdAt: '2024-01-20T14:30:00Z',
    metadata: {
      location: 'Bordeaux, France',
      valuation: 925000,
      lastAppraisal: '2024-01-18T00:00:00Z',
      riskRating: 'medium'
    }
  },
  {
    id: 'asset-3',
    name: 'Gold Bullion Vault',
    symbol: 'GBV',
    totalSupply: 2000,
    availableSupply: 800,
    currentPrice: 2100.00,
    priceChange24h: 0.75,
    volume24h: 340000,
    marketCap: 4200000,
    description: 'Physical gold bars stored in secure vaults with full insurance.',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop',
    category: 'commodities',
    verified: true,
    createdAt: '2024-01-12T09:15:00Z',
    metadata: {
      location: 'Swiss Bank Vault',
      valuation: 4200000,
      lastAppraisal: '2024-01-11T00:00:00Z',
      riskRating: 'low'
    }
  }
];

const generateMockOrders = (): TradingOrder[] => [
  {
    id: 'order-1',
    assetId: 'asset-1',
    userId: 'user-1',
    type: 'buy',
    orderType: 'limit',
    quantity: 10,
    price: 5200.00,
    totalValue: 52000.00,
    status: 'pending',
    createdAt: '2024-01-25T10:30:00Z',
    updatedAt: '2024-01-25T10:30:00Z',
    expiresAt: '2024-02-01T10:30:00Z',
    filledQuantity: 0,
    remainingQuantity: 10,
    fees: {
      platformFee: 130.00,
      networkFee: 25.00,
      totalFee: 155.00
    }
  },
  {
    id: 'order-2',
    assetId: 'asset-2',
    userId: 'user-1',
    type: 'sell',
    orderType: 'limit',
    quantity: 5,
    price: 1900.00,
    totalValue: 9500.00,
    status: 'partially-filled',
    createdAt: '2024-01-24T14:20:00Z',
    updatedAt: '2024-01-25T09:15:00Z',
    expiresAt: '2024-01-31T14:20:00Z',
    filledQuantity: 2,
    remainingQuantity: 3,
    fees: {
      platformFee: 23.75,
      networkFee: 12.50,
      totalFee: 36.25
    }
  }
];

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      // Initial state
      assets: [],
      selectedAsset: null,
      userOrders: [],
      allOrders: [],
      orderBook: null,
      tradeHistory: [],
      userTrades: [],
      userPositions: [],
      marketStats: null,
      activeEscrows: [],
      selectedTab: 'buy',
      loading: false,
      error: null,

      // UI actions
      setSelectedAsset: (asset) => set({ selectedAsset: asset }),
      setSelectedTab: (tab) => set({ selectedTab: tab }),

      // Asset actions
      loadAssets: async () => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          const assets = generateMockAssets();
          set({ assets, loading: false });
        } catch (error) {
          set({ error: 'Failed to load assets', loading: false });
        }
      },

      loadAssetDetails: async (assetId: string) => {
        const { assets } = get();
        return assets.find(asset => asset.id === assetId) || null;
      },

      // Order actions
      createOrder: async (orderData) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const newOrder: TradingOrder = {
            ...orderData,
            id: `order-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            filledQuantity: 0,
            remainingQuantity: orderData.quantity,
          };

          set(state => ({
            userOrders: [...state.userOrders, newOrder],
            allOrders: [...state.allOrders, newOrder],
            loading: false
          }));

          return newOrder;
        } catch (error) {
          set({ error: 'Failed to create order', loading: false });
          throw error;
        }
      },

      cancelOrder: async (orderId: string) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            userOrders: state.userOrders.map(order =>
              order.id === orderId ? { ...order, status: 'cancelled' as const } : order
            ),
            allOrders: state.allOrders.map(order =>
              order.id === orderId ? { ...order, status: 'cancelled' as const } : order
            ),
            loading: false
          }));
        } catch (error) {
          set({ error: 'Failed to cancel order', loading: false });
        }
      },

      loadUserOrders: async () => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 600));
          const orders = generateMockOrders();
          set({ userOrders: orders, loading: false });
        } catch (error) {
          set({ error: 'Failed to load orders', loading: false });
        }
      },

      loadOrderBook: async (assetId: string) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 400));
          
          const mockOrderBook: OrderBook = {
            assetId,
            bids: [
              { price: 5240, quantity: 15, total: 78600, orderCount: 3, cumulative: 15 },
              { price: 5235, quantity: 25, total: 130875, orderCount: 5, cumulative: 40 },
              { price: 5230, quantity: 18, total: 94140, orderCount: 2, cumulative: 58 },
            ],
            asks: [
              { price: 5250, quantity: 12, total: 63000, orderCount: 2, cumulative: 12 },
              { price: 5255, quantity: 20, total: 105100, orderCount: 4, cumulative: 32 },
              { price: 5260, quantity: 8, total: 42080, orderCount: 1, cumulative: 40 },
            ],
            lastPrice: 5245,
            spread: 10,
            depth: {
              totalBidVolume: 58,
              totalAskVolume: 40
            }
          };

          set({ orderBook: mockOrderBook, loading: false });
        } catch (error) {
          set({ error: 'Failed to load order book', loading: false });
        }
      },

      // Trading actions
      executeMarketOrder: async (assetId: string, type: 'buy' | 'sell', quantity: number) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          const { assets } = get();
          const asset = assets.find(a => a.id === assetId);
          if (!asset) throw new Error('Asset not found');

          const execution: TradeExecution = {
            id: `trade-${Date.now()}`,
            buyOrderId: `order-${Date.now()}-buy`,
            sellOrderId: `order-${Date.now()}-sell`,
            assetId,
            quantity,
            price: asset.currentPrice,
            totalValue: asset.currentPrice * quantity,
            buyerId: type === 'buy' ? 'user-1' : 'user-2',
            sellerId: type === 'sell' ? 'user-1' : 'user-2',
            status: 'completed',
            executedAt: new Date().toISOString(),
            settledAt: new Date().toISOString(),
            fees: {
              buyerFee: asset.currentPrice * quantity * 0.0025,
              sellerFee: asset.currentPrice * quantity * 0.0025,
              networkFee: 10.00
            }
          };

          set(state => ({
            tradeHistory: [...state.tradeHistory, execution],
            userTrades: [...state.userTrades, execution],
            loading: false
          }));

          return execution;
        } catch (error) {
          set({ error: 'Failed to execute market order', loading: false });
          throw error;
        }
      },

      loadTradeHistory: async (assetId?: string) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          // Mock trade history would be loaded here
          set({ loading: false });
        } catch (error) {
          set({ error: 'Failed to load trade history', loading: false });
        }
      },

      // Position actions
      loadUserPositions: async () => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 700));
          // Mock positions would be loaded here
          set({ loading: false });
        } catch (error) {
          set({ error: 'Failed to load positions', loading: false });
        }
      },

      // Market data actions
      loadMarketStats: async () => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 600));
          
          const mockStats: MarketStats = {
            totalVolume24h: 532000,
            totalTrades24h: 89,
            activeOrders: 156,
            totalAssets: 3,
            topGainers: [],
            topLosers: [],
            mostTraded: []
          };

          set({ marketStats: mockStats, loading: false });
        } catch (error) {
          set({ error: 'Failed to load market stats', loading: false });
        }
      },

      // Escrow actions
      loadActiveEscrows: async () => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          // Mock escrows would be loaded here
          set({ activeEscrows: [], loading: false });
        } catch (error) {
          set({ error: 'Failed to load escrows', loading: false });
        }
      },

      createEscrow: async (tradeId: string) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockEscrow: EscrowDetails = {
            id: `escrow-${Date.now()}`,
            tradeId,
            assetId: 'asset-1',
            quantity: 10,
            value: 52500,
            buyerId: 'user-1',
            sellerId: 'user-2',
            status: 'created',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            conditions: {
              autoRelease: true,
              requiresApproval: false,
              disputeTimeWindow: 48
            },
            timeline: [{
              id: `event-${Date.now()}`,
              type: 'created',
              timestamp: new Date().toISOString(),
              actor: 'system',
              details: 'Escrow created for trade settlement'
            }]
          };

          set(state => ({
            activeEscrows: [...state.activeEscrows, mockEscrow],
            loading: false
          }));

          return mockEscrow;
        } catch (error) {
          set({ error: 'Failed to create escrow', loading: false });
          throw error;
        }
      },

      releaseEscrow: async (escrowId: string) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set(state => ({
            activeEscrows: state.activeEscrows.map(escrow =>
              escrow.id === escrowId 
                ? { ...escrow, status: 'released' as const }
                : escrow
            ),
            loading: false
          }));
        } catch (error) {
          set({ error: 'Failed to release escrow', loading: false });
        }
      }
    }),
    {
      name: 'cf1-trading-store',
      version: 1,
    }
  )
);