interface MarketData {
  price: number;
  volume: number;
  timestamp: number;
  change24h: number;
  marketCap: number;
}

interface Asset {
  id: string;
  name: string;
  symbol: string;
  category: string;
  basePrice: number;
  volatility: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  marketData: MarketData[];
}

interface MarketSimulationConfig {
  updateInterval: number;
  maxHistoryPoints: number;
  volatilityMultiplier: number;
  trendStrength: number;
}

class MarketSimulation {
  private assets: Map<string, Asset> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private config: MarketSimulationConfig;
  private subscribers: Map<string, Set<(data: MarketData) => void>> = new Map();
  private globalTrend: 'bull' | 'bear' | 'neutral' = 'neutral';
  private marketSentiment: number = 0.5; // 0-1 scale

  constructor(config: Partial<MarketSimulationConfig> = {}) {
    this.config = {
      updateInterval: 5000, // 5 seconds
      maxHistoryPoints: 288, // 24 hours of 5-minute data
      volatilityMultiplier: 1.0,
      trendStrength: 0.1,
      ...config
    };

    this.initializeAssets();
    this.startSimulation();
  }

  private initializeAssets() {
    const defaultAssets = [
      {
        id: 'residential-realestate',
        name: 'Residential Real Estate',
        symbol: 'RRE',
        category: 'Real Estate',
        basePrice: 100000,
        volatility: 0.02,
        trend: 'bullish' as const
      },
      {
        id: 'commercial-realestate',
        name: 'Commercial Real Estate',
        symbol: 'CRE',
        category: 'Real Estate',
        basePrice: 500000,
        volatility: 0.03,
        trend: 'neutral' as const
      },
      {
        id: 'green-energy',
        name: 'Green Energy Projects',
        symbol: 'GEP',
        category: 'Energy',
        basePrice: 50000,
        volatility: 0.05,
        trend: 'bullish' as const
      },
      {
        id: 'agriculture',
        name: 'Agricultural Assets',
        symbol: 'AGR',
        category: 'Agriculture',
        basePrice: 25000,
        volatility: 0.04,
        trend: 'neutral' as const
      },
      {
        id: 'infrastructure',
        name: 'Infrastructure Bonds',
        symbol: 'INF',
        category: 'Infrastructure',
        basePrice: 75000,
        volatility: 0.015,
        trend: 'bullish' as const
      }
    ];

    defaultAssets.forEach(asset => {
      const now = Date.now();
      const initialData: MarketData = {
        price: asset.basePrice,
        volume: this.generateVolume(asset.basePrice),
        timestamp: now,
        change24h: 0,
        marketCap: asset.basePrice * 1000000 // Simulated market cap
      };

      const assetWithHistory: Asset = {
        ...asset,
        marketData: [initialData]
      };

      // Generate historical data (last 24 hours)
      for (let i = 1; i < this.config.maxHistoryPoints; i++) {
        const timestamp = now - (this.config.maxHistoryPoints - i) * this.config.updateInterval;
        const prevData = assetWithHistory.marketData[i - 1];
        const newData = this.generateNextDataPoint(assetWithHistory, prevData, timestamp);
        assetWithHistory.marketData.push(newData);
      }

      this.assets.set(asset.id, assetWithHistory);
    });
  }

  private generateNextDataPoint(asset: Asset, prevData: MarketData, timestamp: number): MarketData {
    // Base random walk
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
    
    // Apply asset-specific volatility
    const volatilityFactor = randomFactor * asset.volatility * this.config.volatilityMultiplier;
    
    // Apply trend
    const trendFactor = this.getTrendFactor(asset.trend) * this.config.trendStrength;
    
    // Apply global market sentiment
    const sentimentFactor = (this.marketSentiment - 0.5) * 0.02;
    
    // Apply market news events (random)
    const newsFactor = this.generateNewsEventFactor();
    
    // Calculate price change
    const totalFactor = volatilityFactor + trendFactor + sentimentFactor + newsFactor;
    const newPrice = Math.max(prevData.price * (1 + totalFactor), asset.basePrice * 0.1); // Min 10% of base price
    
    // Calculate 24h change
    const dataPointsIn24h = Math.floor(86400000 / this.config.updateInterval);
    const data24hAgo = asset.marketData[Math.max(0, asset.marketData.length - dataPointsIn24h)];
    const change24h = data24hAgo ? ((newPrice - data24hAgo.price) / data24hAgo.price) * 100 : 0;
    
    return {
      price: newPrice,
      volume: this.generateVolume(newPrice, prevData.volume),
      timestamp,
      change24h,
      marketCap: newPrice * 1000000
    };
  }

  private getTrendFactor(trend: 'bullish' | 'bearish' | 'neutral'): number {
    switch (trend) {
      case 'bullish': return 0.5;
      case 'bearish': return -0.5;
      case 'neutral': return 0;
    }
  }

  private generateNewsEventFactor(): number {
    // 5% chance of significant news event
    if (Math.random() < 0.05) {
      return (Math.random() - 0.5) * 0.1; // ±5% impact
    }
    return 0;
  }

  private generateVolume(price: number, prevVolume?: number): number {
    const baseVolume = price * 10; // Base volume proportional to price
    const randomMultiplier = 0.5 + Math.random(); // 0.5 to 1.5
    const newVolume = baseVolume * randomMultiplier;
    
    // Smooth volume changes if previous volume exists
    if (prevVolume) {
      return prevVolume * 0.7 + newVolume * 0.3;
    }
    
    return newVolume;
  }

  private startSimulation() {
    this.intervalId = setInterval(() => {
      this.updateMarketData();
      this.updateGlobalSentiment();
    }, this.config.updateInterval);
  }

  private updateMarketData() {
    const now = Date.now();
    
    this.assets.forEach((asset, assetId) => {
      const prevData = asset.marketData[asset.marketData.length - 1];
      const newData = this.generateNextDataPoint(asset, prevData, now);
      
      // Add new data point
      asset.marketData.push(newData);
      
      // Remove old data points to maintain max history
      if (asset.marketData.length > this.config.maxHistoryPoints) {
        asset.marketData.shift();
      }
      
      // Notify subscribers
      this.notifySubscribers(assetId, newData);
    });
  }

  private updateGlobalSentiment() {
    // Randomly adjust global sentiment
    const change = (Math.random() - 0.5) * 0.02; // Small random changes
    this.marketSentiment = Math.max(0, Math.min(1, this.marketSentiment + change));
    
    // Update global trend based on sentiment
    if (this.marketSentiment > 0.7) {
      this.globalTrend = 'bull';
    } else if (this.marketSentiment < 0.3) {
      this.globalTrend = 'bear';
    } else {
      this.globalTrend = 'neutral';
    }
  }

  private notifySubscribers(assetId: string, data: MarketData) {
    const subscribers = this.subscribers.get(assetId);
    if (subscribers) {
      subscribers.forEach(callback => callback(data));
    }
  }

  // Public methods
  public subscribe(assetId: string, callback: (data: MarketData) => void): () => void {
    if (!this.subscribers.has(assetId)) {
      this.subscribers.set(assetId, new Set());
    }
    
    this.subscribers.get(assetId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(assetId)?.delete(callback);
    };
  }

  public getAsset(assetId: string): Asset | undefined {
    return this.assets.get(assetId);
  }

  public getAllAssets(): Asset[] {
    return Array.from(this.assets.values());
  }

  public getCurrentPrice(assetId: string): number | undefined {
    const asset = this.assets.get(assetId);
    return asset?.marketData[asset.marketData.length - 1]?.price;
  }

  public getHistoricalData(assetId: string, timeRange?: number): MarketData[] {
    const asset = this.assets.get(assetId);
    if (!asset) return [];
    
    if (timeRange) {
      const cutoffTime = Date.now() - timeRange;
      return asset.marketData.filter(data => data.timestamp >= cutoffTime);
    }
    
    return asset.marketData;
  }

  public getMarketSummary() {
    const assets = this.getAllAssets();
    const totalMarketCap = assets.reduce((sum, asset) => {
      const latestData = asset.marketData[asset.marketData.length - 1];
      return sum + latestData.marketCap;
    }, 0);
    
    const avgChange24h = assets.reduce((sum, asset) => {
      const latestData = asset.marketData[asset.marketData.length - 1];
      return sum + latestData.change24h;
    }, 0) / assets.length;
    
    return {
      totalMarketCap,
      avgChange24h,
      sentiment: this.marketSentiment,
      trend: this.globalTrend,
      activeAssets: assets.length
    };
  }

  public addAsset(asset: Omit<Asset, 'marketData'>): void {
    const now = Date.now();
    const initialData: MarketData = {
      price: asset.basePrice,
      volume: this.generateVolume(asset.basePrice),
      timestamp: now,
      change24h: 0,
      marketCap: asset.basePrice * 1000000
    };

    const newAsset: Asset = {
      ...asset,
      marketData: [initialData]
    };

    this.assets.set(asset.id, newAsset);
  }

  public removeAsset(assetId: string): void {
    this.assets.delete(assetId);
    this.subscribers.delete(assetId);
  }

  public updateConfig(newConfig: Partial<MarketSimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart simulation with new config
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.startSimulation();
    }
  }

  public simulateMarketEvent(type: 'crash' | 'boom' | 'news', impact: number = 0.1) {
    const factor = type === 'crash' ? -impact : impact;
    
    this.assets.forEach(asset => {
      const latestData = asset.marketData[asset.marketData.length - 1];
      const newPrice = latestData.price * (1 + factor);
      const newData: MarketData = {
        ...latestData,
        price: newPrice,
        timestamp: Date.now(),
        volume: latestData.volume * (1 + Math.abs(factor) * 2) // Increased volume during events
      };
      
      asset.marketData.push(newData);
      this.notifySubscribers(asset.id, newData);
    });
    
    // Adjust global sentiment
    this.marketSentiment = Math.max(0, Math.min(1, this.marketSentiment + factor));
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public start(): void {
    if (!this.intervalId) {
      this.startSimulation();
    }
  }
}

// Singleton instance
export const marketSimulation = new MarketSimulation();

// Utility functions for React components
export const useMarketData = (assetId: string) => {
  const [data, setData] = React.useState<MarketData | null>(null);
  
  React.useEffect(() => {
    const asset = marketSimulation.getAsset(assetId);
    if (asset) {
      const latestData = asset.marketData[asset.marketData.length - 1];
      setData(latestData);
    }
    
    const unsubscribe = marketSimulation.subscribe(assetId, (newData) => {
      setData(newData);
    });
    
    return unsubscribe;
  }, [assetId]);
  
  return data;
};

export const useMarketSummary = () => {
  const [summary, setSummary] = React.useState(marketSimulation.getMarketSummary());
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSummary(marketSimulation.getMarketSummary());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return summary;
};

// Mock data generators for demos
export const generateMockInvestors = (count: number = 50) => {
  const investors = [];
  const names = ['Alex Chen', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson'];
  const locations = ['New York', 'San Francisco', 'London', 'Tokyo', 'Singapore'];
  
  for (let i = 0; i < count; i++) {
    investors.push({
      id: `investor_${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      totalInvested: Math.floor(Math.random() * 100000) + 10000,
      activeInvestments: Math.floor(Math.random() * 10) + 1,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      riskProfile: ['conservative', 'moderate', 'aggressive'][Math.floor(Math.random() * 3)]
    });
  }
  
  return investors;
};

export const generateMockTransactions = (count: number = 100) => {
  const transactions = [];
  const assets = marketSimulation.getAllAssets();
  
  for (let i = 0; i < count; i++) {
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const amount = Math.floor(Math.random() * 50000) + 1000;
    
    transactions.push({
      id: `tx_${i}`,
      type: Math.random() > 0.5 ? 'investment' : 'withdrawal',
      assetId: asset.id,
      assetName: asset.name,
      amount,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      status: 'completed',
      investorId: `investor_${Math.floor(Math.random() * 50)}`
    });
  }
  
  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};