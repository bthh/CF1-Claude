import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TokenHolding {
  assetId: string;
  assetName: string;
  balance: number;
  totalSupply: number;
  percentage: number;
}

interface TokenHoldingState {
  holdings: TokenHolding[];
  
  // Actions
  updateHoldings: (holdings: TokenHolding[]) => void;
  addHolding: (holding: TokenHolding) => void;
  removeHolding: (assetId: string) => void;
  getHoldingByAssetId: (assetId: string) => TokenHolding | undefined;
  hasTokensForAsset: (assetId: string) => boolean;
  getUserTokenBalance: (assetId: string) => number;
  clearHoldings: () => void;
}

// Mock data for development - represents user's current token holdings
const mockTokenHoldings: TokenHolding[] = [
  {
    assetId: 'manhattan-office',
    assetName: 'Manhattan Office Building',
    balance: 150,
    totalSupply: 5000,
    percentage: 3.0
  },
  {
    assetId: 'gold-vault',
    assetName: 'Gold Bullion Vault',
    balance: 580,
    totalSupply: 10000,
    percentage: 5.8
  },
  {
    assetId: 'art-collection',
    assetName: 'Renaissance Art Collection',
    balance: 87,
    totalSupply: 1000,
    percentage: 8.7
  },
  {
    assetId: 'wine-collection',
    assetName: 'Rare Wine Collection',
    balance: 230,
    totalSupply: 2000,
    percentage: 11.5
  }
];

export const useTokenHoldingStore = create<TokenHoldingState>()(
  persist(
    (set, get) => ({
      holdings: mockTokenHoldings,

      updateHoldings: (holdings) => {
        set({ holdings });
      },

      addHolding: (holding) => {
        set((state) => ({
          holdings: [
            ...state.holdings.filter(h => h.assetId !== holding.assetId),
            holding
          ]
        }));
      },

      removeHolding: (assetId) => {
        set((state) => ({
          holdings: state.holdings.filter(h => h.assetId !== assetId)
        }));
      },

      getHoldingByAssetId: (assetId) => {
        return get().holdings.find(h => h.assetId === assetId);
      },

      hasTokensForAsset: (assetId) => {
        const holding = get().holdings.find(h => h.assetId === assetId);
        return holding ? holding.balance > 0 : false;
      },

      getUserTokenBalance: (assetId) => {
        const holding = get().holdings.find(h => h.assetId === assetId);
        return holding ? holding.balance : 0;
      },

      clearHoldings: () => {
        set({ holdings: [] });
      }
    }),
    {
      name: 'cf1-token-holdings',
      partialize: (state) => ({
        holdings: state.holdings
      })
    }
  )
);