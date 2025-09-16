import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface CreditCard {
  id: string;
  type: 'credit' | 'debit';
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  nickname?: string;
  isDefault: boolean;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  accountType: 'checking' | 'savings';
  bankName: string;
  accountNumber: string; // Stored encrypted/masked
  routingNumber: string;
  accountHolderName: string;
  nickname?: string;
  isDefault: boolean;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationMethod?: 'micro_deposits' | 'instant' | 'manual';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'crypto_wallet';
  data: CreditCard | BankAccount | CryptoWallet;
  isEnabled: boolean;
  lastUsed?: string;
}

export interface CryptoWallet {
  id: string;
  address: string;
  network: 'ethereum' | 'bitcoin' | 'neutron' | 'polygon' | 'other';
  walletType: 'metamask' | 'coinbase' | 'hardware' | 'other';
  nickname?: string;
  balance?: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  paymentMethodId: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'dividend' | 'fee';
  amount: string;
  currency: 'USD' | 'USDC' | 'ETH' | 'NTRN';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference?: string; // External transaction ID
  fee?: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface PaymentLimits {
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  remainingDaily: number;
  remainingMonthly: number;
  currency: string;
}

interface PaymentMethodsState {
  // State
  creditCards: CreditCard[];
  bankAccounts: BankAccount[];
  cryptoWallets: CryptoWallet[];
  transactions: PaymentTransaction[];
  limits: PaymentLimits;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSyncTime: string | null;
  
  // UI State
  showAddCardModal: boolean;
  showAddBankModal: boolean;
  showAddCryptoModal: boolean;
  editingPaymentMethod: PaymentMethod | null;
  
  // Actions - Credit Cards
  loadPaymentMethods: () => Promise<void>;
  addCreditCard: (cardData: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'isExpired'>) => Promise<void>;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  setDefaultCreditCard: (id: string) => Promise<void>;
  
  // Actions - Bank Accounts
  addBankAccount: (accountData: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt' | 'isVerified' | 'verificationStatus'>) => Promise<void>;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  verifyBankAccount: (id: string, microDepositAmounts?: number[]) => Promise<void>;
  setDefaultBankAccount: (id: string) => Promise<void>;
  
  // Actions - Crypto Wallets  
  addCryptoWallet: (walletData: Omit<CryptoWallet, 'id' | 'createdAt' | 'updatedAt' | 'isVerified' | 'balance'>) => Promise<void>;
  updateCryptoWallet: (id: string, updates: Partial<CryptoWallet>) => Promise<void>;
  deleteCryptoWallet: (id: string) => Promise<void>;
  refreshWalletBalance: (id: string) => Promise<void>;
  setDefaultCryptoWallet: (id: string) => Promise<void>;
  
  // Actions - Transactions
  loadTransactions: (limit?: number) => Promise<void>;
  getTransactionsByPaymentMethod: (paymentMethodId: string) => PaymentTransaction[];
  initiateDeposit: (paymentMethodId: string, amount: string, currency: string) => Promise<string>;
  initiateWithdrawal: (paymentMethodId: string, amount: string, currency: string) => Promise<string>;
  
  // Actions - Limits & Validation
  checkTransactionLimits: (amount: number, currency: string) => { allowed: boolean; reason?: string };
  updatePaymentLimits: (limits: Partial<PaymentLimits>) => void;
  
  // UI Actions
  setShowAddCardModal: (show: boolean) => void;
  setShowAddBankModal: (show: boolean) => void;
  setShowAddCryptoModal: (show: boolean) => void;
  setEditingPaymentMethod: (method: PaymentMethod | null) => void;
  
  // Utility Actions
  validateCardNumber: (number: string) => { isValid: boolean; brand: CreditCard['brand'] };
  validateBankAccount: (routing: string, account: string) => { isValid: boolean; errors: string[] };
  formatCardNumber: (number: string) => string;
  maskAccountNumber: (number: string) => string;
  clearError: () => void;
  resetStore: () => void;
}

// Helper Functions
const validateCreditCardNumber = (number: string): { isValid: boolean; brand: CreditCard['brand'] } => {
  const cleaned = number.replace(/\D/g, '');
  
  // Basic Luhn algorithm check
  let sum = 0;
  let alternate = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let n = parseInt(cleaned.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n = (n % 10) + 1;
    }
    sum += n;
    alternate = !alternate;
  }
  
  const isValid = (sum % 10) === 0 && cleaned.length >= 13;
  
  // Determine brand
  let brand: CreditCard['brand'] = 'other';
  if (cleaned.startsWith('4')) brand = 'visa';
  else if (cleaned.startsWith('5') || cleaned.startsWith('2')) brand = 'mastercard';
  else if (cleaned.startsWith('3')) brand = 'amex';
  else if (cleaned.startsWith('6')) brand = 'discover';
  
  return { isValid, brand };
};

const validateBankAccountInfo = (routing: string, account: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Routing number validation (US)
  if (!routing || routing.length !== 9 || !/^\d{9}$/.test(routing)) {
    errors.push('Routing number must be exactly 9 digits');
  }
  
  // Account number validation
  if (!account || account.length < 4 || account.length > 17 || !/^\d+$/.test(account)) {
    errors.push('Account number must be between 4-17 digits');
  }
  
  return { isValid: errors.length === 0, errors };
};

const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) return accountNumber;
  const visibleChars = 4;
  const maskedPart = '*'.repeat(accountNumber.length - visibleChars);
  return maskedPart + accountNumber.slice(-visibleChars);
};

const formatCardNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

export const usePaymentMethodsStore = create<PaymentMethodsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        creditCards: [],
        bankAccounts: [],
        cryptoWallets: [],
        transactions: [],
        limits: {
          dailyLimit: 10000,
          monthlyLimit: 100000,
          perTransactionLimit: 50000,
          remainingDaily: 10000,
          remainingMonthly: 100000,
          currency: 'USD'
        },
        loading: false,
        saving: false,
        error: null,
        lastSyncTime: null,
        showAddCardModal: false,
        showAddBankModal: false,
        showAddCryptoModal: false,
        editingPaymentMethod: null,

        // Load all payment methods
        loadPaymentMethods: async () => {
          set({ loading: true, error: null });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const mockCreditCards: CreditCard[] = [
              {
                id: 'card_1',
                type: 'credit',
                brand: 'visa',
                last4: '4242',
                expiryMonth: 12,
                expiryYear: 2027,
                holderName: 'John Doe',
                nickname: 'Main Card',
                isDefault: true,
                isExpired: false,
                createdAt: '2024-01-15T10:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z'
              },
              {
                id: 'card_2', 
                type: 'debit',
                brand: 'mastercard',
                last4: '5555',
                expiryMonth: 8,
                expiryYear: 2026,
                holderName: 'John Doe',
                nickname: 'Backup Card',
                isDefault: false,
                isExpired: false,
                createdAt: '2024-02-20T14:30:00Z',
                updatedAt: '2024-02-20T14:30:00Z'
              }
            ];
            
            const mockBankAccounts: BankAccount[] = [
              {
                id: 'bank_1',
                accountType: 'checking',
                bankName: 'Chase Bank',
                accountNumber: '****1234', // Masked
                routingNumber: '021000021',
                accountHolderName: 'John Doe',
                nickname: 'Primary Checking',
                isDefault: true,
                isVerified: true,
                verificationStatus: 'verified',
                verificationMethod: 'micro_deposits',
                createdAt: '2024-01-10T09:00:00Z',
                updatedAt: '2024-01-12T16:00:00Z'
              }
            ];
            
            const mockCryptoWallets: CryptoWallet[] = [
              {
                id: 'wallet_1',
                address: '0x742d35Cc5BF8EE5f7DB4C3e6B2c1A3B4f5F6D7E8',
                network: 'ethereum',
                walletType: 'metamask',
                nickname: 'MetaMask Wallet',
                balance: '1,234.56 ETH',
                isDefault: true,
                isVerified: true,
                createdAt: '2024-01-05T12:00:00Z',
                updatedAt: '2024-01-05T12:00:00Z'
              }
            ];
            
            set({
              creditCards: mockCreditCards,
              bankAccounts: mockBankAccounts,
              cryptoWallets: mockCryptoWallets,
              loading: false,
              lastSyncTime: new Date().toISOString()
            });
            
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load payment methods'
            });
          }
        },

        // Credit Card Actions
        addCreditCard: async (cardData) => {
          set({ saving: true, error: null });

          try {
            // Note: Card validation is already done in the form before calling this function
            // Determine brand from last4 for display purposes
            let brand: CreditCard['brand'] = 'other';
            if (cardData.last4.startsWith('4')) brand = 'visa';
            else if (cardData.last4.startsWith('5') || cardData.last4.startsWith('2')) brand = 'mastercard';
            else if (cardData.last4.startsWith('3')) brand = 'amex';
            else if (cardData.last4.startsWith('6')) brand = 'discover';
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newCard: CreditCard = {
              ...cardData,
              id: `card_${Date.now()}`,
              brand: brand,
              isExpired: cardData.expiryYear < new Date().getFullYear() || 
                        (cardData.expiryYear === new Date().getFullYear() && cardData.expiryMonth < new Date().getMonth() + 1),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            // If this is the first card or set as default, make it default
            const { creditCards } = get();
            if (creditCards.length === 0 || cardData.isDefault) {
              // Unset other defaults
              const updatedCards = creditCards.map(card => ({ ...card, isDefault: false }));
              set({ creditCards: [...updatedCards, newCard], saving: false });
            } else {
              set({ creditCards: [...creditCards, newCard], saving: false });
            }
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to add credit card'
            });
          }
        },

        updateCreditCard: async (id, updates) => {
          set({ saving: true, error: null });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { creditCards } = get();
            const updatedCards = creditCards.map(card =>
              card.id === id 
                ? { ...card, ...updates, updatedAt: new Date().toISOString() }
                : card
            );
            
            set({ creditCards: updatedCards, saving: false });
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to update credit card'
            });
          }
        },

        deleteCreditCard: async (id) => {
          set({ saving: true, error: null });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { creditCards } = get();
            const updatedCards = creditCards.filter(card => card.id !== id);
            
            set({ creditCards: updatedCards, saving: false });
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to delete credit card'
            });
          }
        },

        setDefaultCreditCard: async (id) => {
          const { creditCards } = get();
          const updatedCards = creditCards.map(card => ({
            ...card,
            isDefault: card.id === id,
            updatedAt: new Date().toISOString()
          }));
          
          set({ creditCards: updatedCards });
        },

        // Bank Account Actions
        addBankAccount: async (accountData) => {
          set({ saving: true, error: null });
          
          try {
            // Validate bank account
            const validation = validateBankAccountInfo(accountData.routingNumber, accountData.accountNumber);
            if (!validation.isValid) {
              throw new Error(`Invalid bank account: ${validation.errors.join(', ')}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newAccount: BankAccount = {
              ...accountData,
              id: `bank_${Date.now()}`,
              accountNumber: maskAccountNumber(accountData.accountNumber),
              isVerified: false,
              verificationStatus: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            const { bankAccounts } = get();
            if (bankAccounts.length === 0 || accountData.isDefault) {
              const updatedAccounts = bankAccounts.map(acc => ({ ...acc, isDefault: false }));
              set({ bankAccounts: [...updatedAccounts, newAccount], saving: false });
            } else {
              set({ bankAccounts: [...bankAccounts, newAccount], saving: false });
            }
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to add bank account'
            });
          }
        },

        updateBankAccount: async (id, updates) => {
          set({ saving: true, error: null });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { bankAccounts } = get();
            const updatedAccounts = bankAccounts.map(account =>
              account.id === id 
                ? { ...account, ...updates, updatedAt: new Date().toISOString() }
                : account
            );
            
            set({ bankAccounts: updatedAccounts, saving: false });
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to update bank account'
            });
          }
        },

        deleteBankAccount: async (id) => {
          set({ saving: true, error: null });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { bankAccounts } = get();
            const updatedAccounts = bankAccounts.filter(account => account.id !== id);
            
            set({ bankAccounts: updatedAccounts, saving: false });
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to delete bank account'
            });
          }
        },

        verifyBankAccount: async (id, microDepositAmounts) => {
          set({ saving: true, error: null });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate verification process
            const success = !microDepositAmounts || microDepositAmounts.every(amount => amount > 0 && amount < 1);
            
            const { bankAccounts } = get();
            const updatedAccounts = bankAccounts.map(account =>
              account.id === id 
                ? { 
                    ...account, 
                    isVerified: success,
                    verificationStatus: success ? 'verified' : 'failed',
                    updatedAt: new Date().toISOString()
                  }
                : account
            );
            
            set({ bankAccounts: updatedAccounts, saving: false });
            
            if (!success) {
              throw new Error('Bank account verification failed');
            }
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to verify bank account'
            });
          }
        },

        setDefaultBankAccount: async (id) => {
          const { bankAccounts } = get();
          const updatedAccounts = bankAccounts.map(account => ({
            ...account,
            isDefault: account.id === id,
            updatedAt: new Date().toISOString()
          }));
          
          set({ bankAccounts: updatedAccounts });
        },

        // Crypto Wallet Actions
        addCryptoWallet: async (walletData) => {
          set({ saving: true, error: null });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const newWallet: CryptoWallet = {
              ...walletData,
              id: `wallet_${Date.now()}`,
              isVerified: true, // Assume crypto wallets are verified on addition
              balance: '0.00',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            const { cryptoWallets } = get();
            if (cryptoWallets.length === 0 || walletData.isDefault) {
              const updatedWallets = cryptoWallets.map(wallet => ({ ...wallet, isDefault: false }));
              set({ cryptoWallets: [...updatedWallets, newWallet], saving: false });
            } else {
              set({ cryptoWallets: [...cryptoWallets, newWallet], saving: false });
            }
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to add crypto wallet'
            });
          }
        },

        updateCryptoWallet: async (id, updates) => {
          set({ saving: true, error: null });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { cryptoWallets } = get();
            const updatedWallets = cryptoWallets.map(wallet =>
              wallet.id === id 
                ? { ...wallet, ...updates, updatedAt: new Date().toISOString() }
                : wallet
            );
            
            set({ cryptoWallets: updatedWallets, saving: false });
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to update crypto wallet'
            });
          }
        },

        deleteCryptoWallet: async (id) => {
          set({ saving: true, error: null });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { cryptoWallets } = get();
            const updatedWallets = cryptoWallets.filter(wallet => wallet.id !== id);
            
            set({ cryptoWallets: updatedWallets, saving: false });
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to delete crypto wallet'
            });
          }
        },

        refreshWalletBalance: async (id) => {
          try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const { cryptoWallets } = get();
            const mockBalance = (Math.random() * 10).toFixed(4);
            
            const updatedWallets = cryptoWallets.map(wallet =>
              wallet.id === id 
                ? { ...wallet, balance: `${mockBalance} ${wallet.network.toUpperCase()}`, updatedAt: new Date().toISOString() }
                : wallet
            );
            
            set({ cryptoWallets: updatedWallets });
            
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to refresh wallet balance'
            });
          }
        },

        setDefaultCryptoWallet: async (id) => {
          const { cryptoWallets } = get();
          const updatedWallets = cryptoWallets.map(wallet => ({
            ...wallet,
            isDefault: wallet.id === id,
            updatedAt: new Date().toISOString()
          }));
          
          set({ cryptoWallets: updatedWallets });
        },

        // Transaction Actions
        loadTransactions: async (limit = 50) => {
          set({ loading: true, error: null });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock transaction data
            const mockTransactions: PaymentTransaction[] = [
              {
                id: 'tx_1',
                paymentMethodId: 'card_1',
                type: 'deposit',
                amount: '1000.00',
                currency: 'USD',
                status: 'completed',
                description: 'Deposit for Real Estate Investment',
                fee: '2.50',
                createdAt: '2024-01-20T10:00:00Z',
                completedAt: '2024-01-20T10:05:00Z'
              },
              {
                id: 'tx_2',
                paymentMethodId: 'bank_1',
                type: 'withdrawal',
                amount: '500.00',
                currency: 'USD',
                status: 'processing',
                description: 'Withdrawal to Bank Account',
                createdAt: '2024-01-19T14:30:00Z'
              }
            ];
            
            set({ transactions: mockTransactions.slice(0, limit), loading: false });
            
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load transactions'
            });
          }
        },

        getTransactionsByPaymentMethod: (paymentMethodId) => {
          const { transactions } = get();
          return transactions.filter(tx => tx.paymentMethodId === paymentMethodId);
        },

        initiateDeposit: async (paymentMethodId, amount, currency) => {
          set({ saving: true, error: null });
          
          try {
            // Check limits
            const { checkTransactionLimits } = get();
            const limitCheck = checkTransactionLimits(parseFloat(amount), currency);
            
            if (!limitCheck.allowed) {
              throw new Error(limitCheck.reason);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const transactionId = `tx_${Date.now()}`;
            const newTransaction: PaymentTransaction = {
              id: transactionId,
              paymentMethodId,
              type: 'deposit',
              amount,
              currency: currency as PaymentTransaction['currency'],
              status: 'processing',
              description: `Deposit via payment method`,
              createdAt: new Date().toISOString()
            };
            
            const { transactions } = get();
            set({ 
              transactions: [newTransaction, ...transactions],
              saving: false 
            });
            
            return transactionId;
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to initiate deposit'
            });
            throw error;
          }
        },

        initiateWithdrawal: async (paymentMethodId, amount, currency) => {
          set({ saving: true, error: null });
          
          try {
            const { checkTransactionLimits } = get();
            const limitCheck = checkTransactionLimits(parseFloat(amount), currency);
            
            if (!limitCheck.allowed) {
              throw new Error(limitCheck.reason);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const transactionId = `tx_${Date.now()}`;
            const newTransaction: PaymentTransaction = {
              id: transactionId,
              paymentMethodId,
              type: 'withdrawal',
              amount,
              currency: currency as PaymentTransaction['currency'],
              status: 'processing',
              description: `Withdrawal to payment method`,
              createdAt: new Date().toISOString()
            };
            
            const { transactions } = get();
            set({ 
              transactions: [newTransaction, ...transactions],
              saving: false 
            });
            
            return transactionId;
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to initiate withdrawal'
            });
            throw error;
          }
        },

        // Utility Functions
        checkTransactionLimits: (amount, currency) => {
          const { limits } = get();
          
          if (currency !== limits.currency) {
            return { allowed: true }; // Skip check for different currencies for now
          }
          
          if (amount > limits.perTransactionLimit) {
            return { 
              allowed: false, 
              reason: `Transaction exceeds per-transaction limit of $${limits.perTransactionLimit.toLocaleString()}` 
            };
          }
          
          if (amount > limits.remainingDaily) {
            return { 
              allowed: false, 
              reason: `Transaction exceeds remaining daily limit of $${limits.remainingDaily.toLocaleString()}` 
            };
          }
          
          if (amount > limits.remainingMonthly) {
            return { 
              allowed: false, 
              reason: `Transaction exceeds remaining monthly limit of $${limits.remainingMonthly.toLocaleString()}` 
            };
          }
          
          return { allowed: true };
        },

        updatePaymentLimits: (newLimits) => {
          const { limits } = get();
          set({ limits: { ...limits, ...newLimits } });
        },

        // UI Actions
        setShowAddCardModal: (show) => set({ showAddCardModal: show }),
        setShowAddBankModal: (show) => set({ showAddBankModal: show }),
        setShowAddCryptoModal: (show) => set({ showAddCryptoModal: show }),
        setEditingPaymentMethod: (method) => set({ editingPaymentMethod: method }),

        // Validation Functions
        validateCardNumber: (number) => validateCreditCardNumber(number),
        validateBankAccount: (routing, account) => validateBankAccountInfo(routing, account),
        formatCardNumber: (number) => formatCardNumber(number),
        maskAccountNumber: (number) => maskAccountNumber(number),

        clearError: () => set({ error: null }),
        resetStore: () => set({
          creditCards: [],
          bankAccounts: [],
          cryptoWallets: [],
          transactions: [],
          loading: false,
          saving: false,
          error: null,
          lastSyncTime: null,
          showAddCardModal: false,
          showAddBankModal: false,
          showAddCryptoModal: false,
          editingPaymentMethod: null
        })
      }),
      {
        name: 'cf1-payment-methods-storage',
        partialize: (state) => ({
          creditCards: state.creditCards,
          bankAccounts: state.bankAccounts,
          cryptoWallets: state.cryptoWallets,
          transactions: state.transactions,
          limits: state.limits,
          lastSyncTime: state.lastSyncTime
        })
      }
    ),
    {
      name: 'payment-methods-store'
    }
  )
);

// Export types for use in components
export type { PaymentMethod, PaymentTransaction, PaymentLimits };