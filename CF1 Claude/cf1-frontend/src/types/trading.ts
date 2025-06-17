export interface TradingAsset {
  id: string;
  name: string;
  symbol: string;
  totalSupply: number;
  availableSupply: number;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  description: string;
  imageUrl?: string;
  category: 'real-estate' | 'commodities' | 'art' | 'collectibles' | 'other';
  verified: boolean;
  createdAt: string;
  metadata: {
    location?: string;
    valuation: number;
    lastAppraisal: string;
    riskRating: 'low' | 'medium' | 'high';
  };
}

export interface TradingOrder {
  id: string;
  assetId: string;
  userId: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop-loss';
  quantity: number;
  price: number;
  totalValue: number;
  status: 'pending' | 'partially-filled' | 'filled' | 'cancelled' | 'expired';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  filledQuantity: number;
  remainingQuantity: number;
  fees: {
    platformFee: number;
    networkFee: number;
    totalFee: number;
  };
}

export interface TradeExecution {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  assetId: string;
  quantity: number;
  price: number;
  totalValue: number;
  buyerId: string;
  sellerId: string;
  status: 'pending' | 'settling' | 'completed' | 'failed';
  executedAt: string;
  settledAt?: string;
  fees: {
    buyerFee: number;
    sellerFee: number;
    networkFee: number;
  };
  escrowId?: string;
}

export interface OrderBook {
  assetId: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastPrice: number;
  spread: number;
  depth: {
    totalBidVolume: number;
    totalAskVolume: number;
  };
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
  orderCount: number;
  cumulative: number;
}

export interface UserPosition {
  assetId: string;
  quantity: number;
  averageCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  availableForSale: number;
  lockedInOrders: number;
}

export interface TradingPair {
  baseAsset: string;
  quoteAsset: string;
  symbol: string;
  minOrderSize: number;
  maxOrderSize: number;
  priceIncrement: number;
  quantityIncrement: number;
  tradingEnabled: boolean;
}

export interface MarketStats {
  totalVolume24h: number;
  totalTrades24h: number;
  activeOrders: number;
  totalAssets: number;
  topGainers: TradingAsset[];
  topLosers: TradingAsset[];
  mostTraded: TradingAsset[];
}

export interface EscrowDetails {
  id: string;
  tradeId: string;
  assetId: string;
  quantity: number;
  value: number;
  buyerId: string;
  sellerId: string;
  status: 'created' | 'funded' | 'releasing' | 'released' | 'disputed' | 'cancelled';
  createdAt: string;
  expiresAt: string;
  conditions: {
    autoRelease: boolean;
    requiresApproval: boolean;
    disputeTimeWindow: number;
  };
  timeline: EscrowEvent[];
}

export interface EscrowEvent {
  id: string;
  type: 'created' | 'funded' | 'approved' | 'disputed' | 'resolved' | 'released';
  timestamp: string;
  actor: string;
  details: string;
}