// CF1 Platform - Global State Management
// Zustand store configuration with TypeScript support

export { useAuthStore } from './authStore';
export { usePortfolioStore } from './portfolioStore';
export { useProposalStore } from './proposalStore';
export { useUIStore } from './uiStore';
export { useWalletStore } from './walletStore';

// Store types
import type { AuthState } from './authStore';
import type { PortfolioState } from './portfolioStore';
import type { ProposalState } from './proposalStore';
import type { UIState } from './uiStore';
import type { WalletState } from './walletStore';

export type { AuthState, PortfolioState, ProposalState, UIState, WalletState };

// Combined store type for development tools
export interface GlobalState {
  auth: AuthState;
  portfolio: PortfolioState;
  proposals: ProposalState;
  ui: UIState;
  wallet: WalletState;
}