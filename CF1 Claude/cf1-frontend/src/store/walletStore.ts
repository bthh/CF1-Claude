import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface WalletConnection {
  address: string;
  balance: string;
  chainId: string;
  walletType: 'keplr' | 'cosmostation' | 'leap' | 'other';
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'invest' | 'withdraw' | 'vote' | 'claim';
  amount?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  proposalId?: string;
}

export interface WalletState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connection: WalletConnection | null;
  error: string | null;

  // Transaction state
  transactions: Transaction[];
  pendingTransactions: Transaction[];

  // Network state
  networkStatus: 'online' | 'offline' | 'error';
  blockHeight: number;

  // Actions
  connect: (walletType: WalletConnection['walletType']) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;
  setNetworkStatus: (status: WalletState['networkStatus']) => void;
  setBlockHeight: (height: number) => void;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isConnected: false,
      isConnecting: false,
      connection: null,
      error: null,
      transactions: [],
      pendingTransactions: [],
      networkStatus: 'online',
      blockHeight: 0,

      // Actions
      connect: async (walletType: WalletConnection['walletType']) => {
        set({ isConnecting: true, error: null });

        try {
          // Simulate wallet connection
          await new Promise(resolve => setTimeout(resolve, 1500));

          const mockConnection: WalletConnection = {
            address: 'neutron1abcdef1234567890abcdef1234567890abcdef',
            balance: '1000.50',
            chainId: 'neutron-1',
            walletType
          };

          set({
            isConnected: true,
            isConnecting: false,
            connection: mockConnection,
            error: null
          });
        } catch (error) {
          set({
            isConnecting: false,
            error: error instanceof Error ? error.message : 'Connection failed'
          });
        }
      },

      disconnect: () => {
        set({
          isConnected: false,
          isConnecting: false,
          connection: null,
          transactions: [],
          pendingTransactions: [],
          error: null
        });
      },

      refreshBalance: async () => {
        const { connection } = get();
        if (!connection) return;

        try {
          // Simulate balance refresh
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newBalance = (Math.random() * 2000 + 500).toFixed(2);
          
          set({
            connection: {
              ...connection,
              balance: newBalance
            }
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Balance refresh failed'
          });
        }
      },

      addTransaction: (transactionData) => {
        const transaction: Transaction = {
          ...transactionData,
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString()
        };

        set(state => ({
          transactions: [transaction, ...state.transactions],
          pendingTransactions: transaction.status === 'pending' 
            ? [transaction, ...state.pendingTransactions]
            : state.pendingTransactions
        }));
      },

      updateTransaction: (id: string, updates: Partial<Transaction>) => {
        set(state => ({
          transactions: state.transactions.map(tx =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
          pendingTransactions: state.pendingTransactions.filter(tx => {
            if (tx.id === id && updates.status !== 'pending') {
              return false; // Remove from pending if status changed
            }
            return tx.id !== id;
          })
        }));
      },

      clearTransactions: () => {
        set({
          transactions: [],
          pendingTransactions: []
        });
      },

      setNetworkStatus: (status: WalletState['networkStatus']) => {
        set({ networkStatus: status });
      },

      setBlockHeight: (height: number) => {
        set({ blockHeight: height });
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'wallet-store'
    }
  )
);