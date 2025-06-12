// CF1 Platform - User Verification State Management
// Progressive KYC and compliance tracking with Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  UserVerificationState, 
  VerificationLevel, 
  BasicVerification,
  IdentityVerification,
  AccreditedInvestorVerification,
  InvestmentEligibilityCheck,
  UserProfile
} from '../types/verification';

interface VerificationStore extends UserVerificationState {
  // Actions
  initializeUser: (walletAddress: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  submitBasicVerification: (data: Omit<BasicVerification, 'status' | 'submittedAt'>) => Promise<void>;
  submitIdentityVerification: (data: Omit<IdentityVerification, 'status' | 'submittedAt'>) => Promise<void>;
  submitAccreditedVerification: (data: Omit<AccreditedInvestorVerification, 'status' | 'submittedAt'>) => Promise<void>;
  checkInvestmentEligibility: (amount: number, proposalId: string) => InvestmentEligibilityCheck;
  refreshVerificationStatus: () => Promise<void>;
  resetVerification: () => void;
  
  // Utility functions
  getRequiredStepsForAction: (action: 'invest' | 'create_proposal' | 'vote') => string[];
  canPerformAction: (action: 'invest' | 'create_proposal' | 'vote') => boolean;
  getNextVerificationStep: () => string | null;
}

// Default state for new users
const getDefaultState = (): UserVerificationState => ({
  level: 'anonymous',
  canBrowse: true,
  canCreateProposals: false,
  canInvest: false,
  canVote: false,
  blockedActions: ['invest', 'create_proposal', 'vote']
});

export const useVerificationStore = create<VerificationStore>()(
  persist(
    (set, get) => ({
      ...getDefaultState(),

      // Initialize user when wallet connects
      initializeUser: (walletAddress: string) => {
        const currentState = get();
        
        // If already initialized for this wallet, don't reset
        if (currentState.profile?.walletAddress === walletAddress) {
          return;
        }

        set({
          ...getDefaultState(),
          profile: {
            id: `user_${Date.now()}`,
            walletAddress,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          level: 'anonymous'
        });
      },

      // Update user profile
      updateProfile: (profileUpdates: Partial<UserProfile>) => {
        set((state) => ({
          profile: state.profile ? {
            ...state.profile,
            ...profileUpdates,
            updatedAt: new Date().toISOString()
          } : undefined
        }));
      },

      // Submit basic verification (email, name, terms)
      submitBasicVerification: async (data: Omit<BasicVerification, 'status' | 'submittedAt'>) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const basicVerification: BasicVerification = {
            ...data,
            status: 'pending',
            submittedAt: new Date().toISOString()
          };

          set((state) => ({
            basicVerification,
            level: 'basic',
            canCreateProposals: true, // Allow proposal creation after basic verification
            blockedActions: state.blockedActions.filter(action => action !== 'create_proposal'),
            profile: state.profile ? {
              ...state.profile,
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              updatedAt: new Date().toISOString()
            } : state.profile
          }));

          // Simulate auto-approval for basic verification
          setTimeout(() => {
            set((state) => ({
              basicVerification: state.basicVerification ? {
                ...state.basicVerification,
                status: 'approved',
                completedAt: new Date().toISOString()
              } : state.basicVerification
            }));
          }, 2000);

        } catch (error) {
          console.error('Basic verification submission failed:', error);
          throw error;
        }
      },

      // Submit identity verification (government ID, address)
      submitIdentityVerification: async (data: Omit<IdentityVerification, 'status' | 'submittedAt'>) => {
        try {
          // Simulate API call to third-party verification service
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const identityVerification: IdentityVerification = {
            ...data,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            verificationProvider: 'jumio',
            verificationSessionId: `session_${Date.now()}`
          };

          // Calculate investment limits based on verification
          const investmentLimits = calculateInvestmentLimits(data);

          set((state) => ({
            identityVerification,
            investmentLimits,
            level: 'verified',
            canInvest: true,
            canVote: true,
            blockedActions: state.blockedActions.filter(action => 
              !['invest', 'vote'].includes(action)
            )
          }));

          // Simulate verification processing (would be webhook in real implementation)
          setTimeout(() => {
            set((state) => ({
              identityVerification: state.identityVerification ? {
                ...state.identityVerification,
                status: 'approved',
                completedAt: new Date().toISOString()
              } : state.identityVerification
            }));
          }, 5000);

        } catch (error) {
          console.error('Identity verification submission failed:', error);
          throw error;
        }
      },

      // Submit accredited investor verification
      submitAccreditedVerification: async (data: Omit<AccreditedInvestorVerification, 'status' | 'submittedAt'>) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const accreditedVerification: AccreditedInvestorVerification = {
            ...data,
            status: 'pending',
            submittedAt: new Date().toISOString()
          };

          // Calculate unlimited investment limits for accredited investors
          const investmentLimits = {
            annualLimit: Infinity,
            perOfferingLimit: Infinity,
            currentYearInvested: 0,
            availableToInvest: Infinity,
            limitBasis: 'accredited_unlimited' as const,
            calculatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          };

          set((state) => ({
            accreditedVerification,
            investmentLimits,
            level: 'accredited'
          }));

          // Simulate manual review process
          setTimeout(() => {
            set((state) => ({
              accreditedVerification: state.accreditedVerification ? {
                ...state.accreditedVerification,
                status: 'approved',
                completedAt: new Date().toISOString()
              } : state.accreditedVerification
            }));
          }, 10000);

        } catch (error) {
          console.error('Accredited verification submission failed:', error);
          throw error;
        }
      },

      // Check if user can invest specific amount
      checkInvestmentEligibility: (amount: number, proposalId: string): InvestmentEligibilityCheck => {
        const state = get();
        
        if (!state.canInvest) {
          return {
            eligible: false,
            reason: 'Identity verification required before investing',
            requiredVerificationLevel: 'verified',
            nextSteps: ['complete_identity_verification']
          };
        }

        if (!state.investmentLimits) {
          return {
            eligible: false,
            reason: 'Investment limits not calculated',
            requiredVerificationLevel: 'verified'
          };
        }

        const limits = state.investmentLimits;
        
        // Check annual limit
        if (limits.currentYearInvested + amount > limits.annualLimit) {
          return {
            eligible: false,
            amount: limits.annualLimit - limits.currentYearInvested,
            reason: 'Amount exceeds annual investment limit',
            investmentLimits: {
              maxAmount: limits.annualLimit - limits.currentYearInvested,
              remainingThisYear: limits.availableToInvest,
              perOfferingLimit: limits.perOfferingLimit
            }
          };
        }

        // Check per-offering limit
        if (amount > limits.perOfferingLimit) {
          return {
            eligible: false,
            amount: limits.perOfferingLimit,
            reason: 'Amount exceeds per-offering limit',
            investmentLimits: {
              maxAmount: limits.perOfferingLimit,
              remainingThisYear: limits.availableToInvest,
              perOfferingLimit: limits.perOfferingLimit
            }
          };
        }

        return {
          eligible: true,
          investmentLimits: {
            maxAmount: Math.min(limits.perOfferingLimit, limits.availableToInvest),
            remainingThisYear: limits.availableToInvest,
            perOfferingLimit: limits.perOfferingLimit
          }
        };
      },

      // Refresh verification status from backend
      refreshVerificationStatus: async () => {
        try {
          // Simulate API call to check latest verification status
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // In real implementation, this would fetch from backend
          console.log('Refreshed verification status');
        } catch (error) {
          console.error('Failed to refresh verification status:', error);
        }
      },

      // Reset all verification data
      resetVerification: () => {
        set(getDefaultState());
      },

      // Get required steps for specific action
      getRequiredStepsForAction: (action: 'invest' | 'create_proposal' | 'vote') => {
        const state = get();
        const steps: string[] = [];

        switch (action) {
          case 'create_proposal':
            if (!state.basicVerification || state.basicVerification.status !== 'approved') {
              steps.push('basic_verification');
            }
            break;
          
          case 'invest':
          case 'vote':
            if (!state.basicVerification || state.basicVerification.status !== 'approved') {
              steps.push('basic_verification');
            }
            if (!state.identityVerification || state.identityVerification.status !== 'approved') {
              steps.push('identity_verification');
            }
            break;
        }

        return steps;
      },

      // Check if user can perform action
      canPerformAction: (action: 'invest' | 'create_proposal' | 'vote') => {
        const state = get();
        return !state.blockedActions.includes(action);
      },

      // Get next required verification step
      getNextVerificationStep: () => {
        const state = get();
        
        if (!state.basicVerification || state.basicVerification.status !== 'approved') {
          return 'basic';
        }
        
        if (!state.identityVerification || state.identityVerification.status !== 'approved') {
          return 'identity';
        }
        
        // Accredited verification is optional
        if (state.level !== 'accredited') {
          return 'accredited';
        }
        
        return null;
      }
    }),
    {
      name: 'cf1-verification-store',
      partialize: (state) => ({
        level: state.level,
        profile: state.profile,
        basicVerification: state.basicVerification,
        identityVerification: state.identityVerification,
        accreditedVerification: state.accreditedVerification,
        investmentLimits: state.investmentLimits,
        canBrowse: state.canBrowse,
        canCreateProposals: state.canCreateProposals,
        canInvest: state.canInvest,
        canVote: state.canVote,
        blockedActions: state.blockedActions
      })
    }
  )
);

// Helper function to calculate investment limits based on income/net worth
function calculateInvestmentLimits(identityData: Omit<IdentityVerification, 'status' | 'submittedAt'>) {
  // Simplified Reg CF limit calculation
  // Real implementation would need actual income/net worth data
  
  // For demo purposes, using conservative limits
  const annualLimit = 10000; // $10k annual limit for non-accredited
  const perOfferingLimit = 5000; // $5k per offering limit
  
  return {
    annualLimit,
    perOfferingLimit,
    currentYearInvested: 0,
    availableToInvest: annualLimit,
    limitBasis: 'income_networth' as const,
    calculatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };
}