import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Proposal {
  id: string;
  asset_details: {
    name: string;
    asset_type: string;
    category: string;
    location: string;
    description: string;
  };
  financial_terms: {
    target_amount: string;
    token_price: string;
    total_shares: number;
    minimum_investment: string;
    expected_apy: string;
    funding_deadline: number;
  };
  funding_status: {
    raised_amount: string;
    investor_count: number;
    is_funded: boolean;
    tokens_minted: boolean;
  };
  status: 'Active' | 'Funded' | 'Expired' | 'Cancelled';
  creator: string;
  created_at: string;
}

export interface Investment {
  id: string;
  proposalId: string;
  userAddress: string;
  amount: string;
  shares: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface ProposalState {
  // Data state
  proposals: Proposal[];
  userInvestments: Investment[];
  selectedProposal: Proposal | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    status: string;
    sortBy: 'newest' | 'funded' | 'deadline' | 'apy';
    searchTerm: string;
  };

  // Actions
  fetchProposals: () => Promise<void>;
  fetchProposal: (id: string) => Promise<void>;
  createProposal: (proposalData: Omit<Proposal, 'id' | 'created_at'>) => Promise<void>;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  invest: (proposalId: string, amount: string) => Promise<void>;
  fetchUserInvestments: (userAddress: string) => Promise<void>;
  setSelectedProposal: (proposal: Proposal | null) => void;
  setFilters: (filters: Partial<ProposalState['filters']>) => void;
  clearError: () => void;
}

// Mock data generator
const generateMockProposal = (id: string): Proposal => {
  const categories = ['Real Estate', 'Technology', 'Green Energy', 'Infrastructure'];
  const locations = ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Miami, FL', 'Seattle, WA'];
  const names = [
    'Downtown Office Complex',
    'Smart City Infrastructure',
    'Solar Energy Farm',
    'Luxury Hotel Portfolio',
    'Tech Innovation Center'
  ];

  const category = categories[Math.floor(Math.random() * categories.length)];
  const targetAmount = (Math.random() * 10000000 + 1000000).toString();
  const raisedAmount = (parseFloat(targetAmount) * (Math.random() * 0.8 + 0.1)).toString();

  return {
    id,
    asset_details: {
      name: names[Math.floor(Math.random() * names.length)],
      asset_type: category,
      category,
      location: locations[Math.floor(Math.random() * locations.length)],
      description: `Premium ${category.toLowerCase()} investment opportunity with strong fundamentals.`
    },
    financial_terms: {
      target_amount: targetAmount,
      token_price: '1000000',
      total_shares: Math.floor(parseFloat(targetAmount) / 1000),
      minimum_investment: '1000000000',
      expected_apy: `${(Math.random() * 10 + 8).toFixed(1)}%`,
      funding_deadline: Date.now() / 1000 + 86400 * (Math.random() * 60 + 30)
    },
    funding_status: {
      raised_amount: raisedAmount,
      investor_count: Math.floor(Math.random() * 100 + 10),
      is_funded: parseFloat(raisedAmount) >= parseFloat(targetAmount),
      tokens_minted: false
    },
    status: 'Active',
    creator: 'neutron1creator123',
    created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
  };
};

export const useProposalStore = create<ProposalState>()(
  devtools(
    (set, get) => ({
      // Initial state
      proposals: [],
      userInvestments: [],
      selectedProposal: null,
      loading: false,
      error: null,
      filters: {
        category: 'all',
        status: 'all',
        sortBy: 'newest',
        searchTerm: ''
      },

      // Actions
      fetchProposals: async () => {
        set({ loading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockProposals = Array.from({ length: 12 }, (_, i) => 
            generateMockProposal(`proposal_${i + 1}`)
          );

          set({
            proposals: mockProposals,
            loading: false
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch proposals'
          });
        }
      },

      fetchProposal: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { proposals } = get();
          let proposal = proposals.find(p => p.id === id);
          
          if (!proposal) {
            proposal = generateMockProposal(id);
          }

          set({
            selectedProposal: proposal,
            loading: false
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch proposal'
          });
        }
      },

      createProposal: async (proposalData) => {
        set({ loading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const newProposal: Proposal = {
            ...proposalData,
            id: `proposal_${Date.now()}`,
            created_at: new Date().toISOString()
          };

          set(state => ({
            proposals: [newProposal, ...state.proposals],
            loading: false
          }));
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to create proposal'
          });
        }
      },

      updateProposal: (id: string, updates: Partial<Proposal>) => {
        set(state => ({
          proposals: state.proposals.map(proposal =>
            proposal.id === id ? { ...proposal, ...updates } : proposal
          ),
          selectedProposal: state.selectedProposal?.id === id
            ? { ...state.selectedProposal, ...updates }
            : state.selectedProposal
        }));
      },

      invest: async (proposalId: string, amount: string) => {
        set({ loading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const investment: Investment = {
            id: `investment_${Date.now()}`,
            proposalId,
            userAddress: 'neutron1user123',
            amount,
            shares: Math.floor(parseFloat(amount) / 1000),
            timestamp: new Date().toISOString(),
            status: 'confirmed'
          };

          // Update proposal funding
          const { proposals } = get();
          const proposal = proposals.find(p => p.id === proposalId);
          if (proposal) {
            const newRaisedAmount = (
              parseFloat(proposal.funding_status.raised_amount) + parseFloat(amount)
            ).toString();
            
            set(state => ({
              proposals: state.proposals.map(p =>
                p.id === proposalId
                  ? {
                      ...p,
                      funding_status: {
                        ...p.funding_status,
                        raised_amount: newRaisedAmount,
                        investor_count: p.funding_status.investor_count + 1
                      }
                    }
                  : p
              ),
              userInvestments: [investment, ...state.userInvestments],
              loading: false
            }));
          }
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Investment failed'
          });
        }
      },

      fetchUserInvestments: async (userAddress: string) => {
        set({ loading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Mock user investments
          const mockInvestments: Investment[] = [
            {
              id: 'inv_1',
              proposalId: 'proposal_1',
              userAddress,
              amount: '5000000000',
              shares: 5000,
              timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
              status: 'confirmed'
            },
            {
              id: 'inv_2',
              proposalId: 'proposal_3',
              userAddress,
              amount: '2500000000',
              shares: 2500,
              timestamp: new Date(Date.now() - 86400000 * 14).toISOString(),
              status: 'confirmed'
            }
          ];

          set({
            userInvestments: mockInvestments,
            loading: false
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch investments'
          });
        }
      },

      setSelectedProposal: (proposal: Proposal | null) => {
        set({ selectedProposal: proposal });
      },

      setFilters: (filters: Partial<ProposalState['filters']>) => {
        set(state => ({
          filters: { ...state.filters, ...filters }
        }));
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'proposal-store'
    }
  )
);