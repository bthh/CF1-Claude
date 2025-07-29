import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface PortfolioAsset {
  id: string;
  proposalId: string;
  name: string;
  type: string;
  shares: number;
  currentValue: string;
  totalInvested: string;
  unrealizedGain: string;
  unrealizedGainPercent: number;
  apy: string;
  locked: boolean;
  unlockDate?: string;
  lastUpdated: string;
}

export interface PortfolioSummary {
  totalValue: string;
  totalInvested: string;
  totalGain: string;
  totalGainPercent: number;
  averageApy: string;
  assetCount: number;
  lockedValue: string;
  availableValue: string;
}

export interface PortfolioTransaction {
  id: string;
  type: 'investment' | 'dividend' | 'sale' | 'fee';
  assetId: string;
  assetName: string;
  amount: string;
  shares?: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface PerformanceData {
  date: string;
  totalValue: number;
  totalInvested: number;
  gain: number;
  gainPercent: number;
}

export interface PortfolioState {
  // Data state
  assets: PortfolioAsset[];
  summary: PortfolioSummary | null;
  transactions: PortfolioTransaction[];
  performance: PerformanceData[];
  
  // UI state
  loading: boolean;
  error: string | null;
  selectedTimeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

  // Actions
  fetchPortfolio: (userAddress: string) => Promise<void>;
  fetchTransactions: (userAddress: string) => Promise<void>;
  fetchPerformance: (userAddress: string, timeframe: PortfolioState['selectedTimeframe']) => Promise<void>;
  updateAsset: (assetId: string, updates: Partial<PortfolioAsset>) => void;
  addTransaction: (transaction: Omit<PortfolioTransaction, 'id'>) => void;
  setSelectedTimeframe: (timeframe: PortfolioState['selectedTimeframe']) => void;
  refreshPortfolio: (userAddress: string) => Promise<void>;
  clearError: () => void;
}

// Mock data generators
const generateMockAsset = (id: string, proposalId: string): PortfolioAsset => {
  const names = [
    'Downtown Seattle Office',
    'Miami Beach Resort',
    'Solar Energy Farm TX',
    'Tech Innovation Hub',
    'Luxury Hotel Portfolio'
  ];
  const types = ['Real Estate', 'Hospitality', 'Green Energy', 'Technology', 'Real Estate'];
  
  const shares = Math.floor(Math.random() * 10000 + 1000);
  const invested = shares * 1000; // $1000 per share
  const currentValue = invested * (Math.random() * 0.4 + 0.9); // -10% to +30%
  const gain = currentValue - invested;
  const gainPercent = (gain / invested) * 100;

  return {
    id,
    proposalId,
    name: names[Math.floor(Math.random() * names.length)],
    type: types[Math.floor(Math.random() * types.length)],
    shares,
    currentValue: currentValue.toFixed(2),
    totalInvested: invested.toString(),
    unrealizedGain: gain.toFixed(2),
    unrealizedGainPercent: gainPercent,
    apy: `${(Math.random() * 10 + 8).toFixed(1)}%`,
    locked: Math.random() > 0.3, // 70% locked
    unlockDate: Math.random() > 0.3 ? new Date(Date.now() + 86400000 * 365).toISOString() : undefined,
    lastUpdated: new Date().toISOString()
  };
};

const generatePerformanceData = (days: number): PerformanceData[] => {
  const data: PerformanceData[] = [];
  const startValue = 50000;
  const startInvested = 45000;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const volatility = Math.random() * 0.1 - 0.05; // -5% to +5% daily change
    const totalValue = startValue * (1 + volatility * (days - i) / days);
    const totalInvested = startInvested;
    const gain = totalValue - totalInvested;
    const gainPercent = (gain / totalInvested) * 100;
    
    data.push({
      date,
      totalValue,
      totalInvested,
      gain,
      gainPercent
    });
  }
  
  return data;
};

export const usePortfolioStore = create<PortfolioState>()(
  devtools(
    persist(
      (set, get) => ({
      // Initial state
      assets: [],
      summary: null,
      transactions: [],
      performance: [],
      loading: false,
      error: null,
      selectedTimeframe: '1M',

      // Actions
      fetchPortfolio: async (_: string) => {
        set({ loading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate mock assets
          const mockAssets = Array.from({ length: 5 }, (_, i) => 
            generateMockAsset(`asset_${i + 1}`, `proposal_${i + 1}`)
          );

          // Calculate summary
          const totalValue = mockAssets.reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);
          const totalInvested = mockAssets.reduce((sum, asset) => sum + parseFloat(asset.totalInvested), 0);
          const totalGain = totalValue - totalInvested;
          const totalGainPercent = (totalGain / totalInvested) * 100;
          const lockedValue = mockAssets
            .filter(asset => asset.locked)
            .reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);

          const summary: PortfolioSummary = {
            totalValue: totalValue.toFixed(2),
            totalInvested: totalInvested.toFixed(2),
            totalGain: totalGain.toFixed(2),
            totalGainPercent,
            averageApy: '12.3%',
            assetCount: mockAssets.length,
            lockedValue: lockedValue.toFixed(2),
            availableValue: (totalValue - lockedValue).toFixed(2)
          };

          set({
            assets: mockAssets,
            summary,
            loading: false
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch portfolio'
          });
        }
      },

      fetchTransactions: async (_: string) => {
        set({ loading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const mockTransactions: PortfolioTransaction[] = [
            {
              id: 'tx_1',
              type: 'investment',
              assetId: 'asset_1',
              assetName: 'Downtown Seattle Office',
              amount: '5000.00',
              shares: 5000,
              timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
              status: 'completed'
            },
            {
              id: 'tx_2',
              type: 'dividend',
              assetId: 'asset_2',
              assetName: 'Miami Beach Resort',
              amount: '247.50',
              timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
              status: 'completed'
            },
            {
              id: 'tx_3',
              type: 'investment',
              assetId: 'asset_3',
              assetName: 'Solar Energy Farm TX',
              amount: '2500.00',
              shares: 2500,
              timestamp: new Date(Date.now() - 86400000 * 14).toISOString(),
              status: 'completed'
            }
          ];

          set({
            transactions: mockTransactions,
            loading: false
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch transactions'
          });
        }
      },

      fetchPerformance: async (_: string, timeframe: PortfolioState['selectedTimeframe']) => {
        set({ loading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          const days = {
            '1D': 1,
            '1W': 7,
            '1M': 30,
            '3M': 90,
            '1Y': 365,
            'ALL': 730
          }[timeframe];

          const performanceData = generatePerformanceData(days);

          set({
            performance: performanceData,
            loading: false
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch performance data'
          });
        }
      },

      updateAsset: (assetId: string, updates: Partial<PortfolioAsset>) => {
        set(state => ({
          assets: state.assets.map(asset =>
            asset.id === assetId ? { ...asset, ...updates } : asset
          )
        }));
      },

      addTransaction: (transactionData) => {
        console.log('🔍 Portfolio Store - Adding transaction:', transactionData);
        
        // Validate required fields
        if (!transactionData.assetId || !transactionData.assetName || !transactionData.amount) {
          console.error('❌ Portfolio Store - Invalid transaction data:', transactionData);
          return;
        }

        const transaction: PortfolioTransaction = {
          ...transactionData,
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        console.log('✅ Portfolio Store - Transaction created:', transaction);

        set(state => {
          const newTransactions = [transaction, ...state.transactions];
          console.log('📈 Portfolio Store - Updated transactions count:', newTransactions.length);
          return { transactions: newTransactions };
        });

        // Verify the transaction was added
        setTimeout(() => {
          const currentState = get();
          const foundTransaction = currentState.transactions.find(t => t.id === transaction.id);
          if (foundTransaction) {
            console.log('✅ Portfolio Store - Transaction successfully persisted:', foundTransaction);
          } else {
            console.error('❌ Portfolio Store - Transaction not found after adding');
          }
        }, 100);
      },

      setSelectedTimeframe: (timeframe: PortfolioState['selectedTimeframe']) => {
        set({ selectedTimeframe: timeframe });
        
        // Auto-fetch performance data for new timeframe
        const { fetchPerformance } = get();
        fetchPerformance('neutron1user123', timeframe);
      },

      refreshPortfolio: async (userAddress: string) => {
        const { fetchPortfolio, fetchTransactions, fetchPerformance, selectedTimeframe } = get();
        
        await Promise.all([
          fetchPortfolio(userAddress),
          fetchTransactions(userAddress),
          fetchPerformance(userAddress, selectedTimeframe)
        ]);
      },

      clearError: () => set({ error: null })
      }),
      {
        name: 'cf1-portfolio-store',
        // Only persist transactions and user-specific data
        partialize: (state) => ({ transactions: state.transactions })
      }
    ),
    {
      name: 'portfolio-store'
    }
  )
);