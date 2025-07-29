import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useDemoModeStore } from './demoModeStore';
import { createDemoDataService, demoDataUtils } from '../services/demoDataService';
import { notificationScheduler } from '../services/notificationScheduler';

// Re-export types from the original store
export type { Investor, FundingStatus, Proposal } from './proposalStore';
import type { Proposal, FundingStatus, Investor } from './proposalStore';

interface ProposalState {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  selectedProposal: Proposal | null;
  
  // Actions
  fetchProposals: () => Promise<void>;
  getProposal: (id: string) => Promise<Proposal | null>;
  createProposal: (proposalData: Partial<Proposal>) => Promise<string>;
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<void>;
  deleteProposal: (id: string) => Promise<void>;
  investInProposal: (proposalId: string, amount: number, investor: string) => Promise<void>;
  
  // Demo-specific actions
  generateDemoProposals: (count?: number) => Proposal[];
  switchToInvestorDemoData: () => void;
  switchToSalesDemoData: () => void;
  refreshDemoData: () => void;
}

// Enhanced demo proposal generator
const generateEnhancedDemoProposal = (id: string, scenario?: string): Proposal => {
  const { scenario: currentScenario, showRealisticNumbers, hideNegativeData, accelerateTimeframes } = useDemoModeStore.getState();
  const effectiveScenario = scenario || currentScenario;

  // Asset types with realistic data
  const assetTypes = [
    {
      type: 'Real Estate',
      categories: ['Commercial', 'Residential', 'Industrial', 'Retail'],
      locations: ['Manhattan, NY', 'Beverly Hills, CA', 'Downtown Chicago, IL', 'Miami Beach, FL'],
      basePrice: 50000,
      apyRange: [0.06, 0.12],
      descriptions: [
        'Premium commercial real estate with stable tenant base and growing revenue',
        'Luxury residential property in prime location with strong appreciation potential',
        'Modern industrial facility with long-term lease agreements',
        'High-traffic retail space in established shopping district'
      ]
    },
    {
      type: 'Technology',
      categories: ['Startup', 'Growth', 'Infrastructure', 'AI/ML'],
      locations: ['Silicon Valley, CA', 'Austin, TX', 'Seattle, WA', 'Boston, MA'],
      basePrice: 25000,
      apyRange: [0.08, 0.20],
      descriptions: [
        'Innovative technology startup with breakthrough product and strong team',
        'Established tech company expanding into new markets',
        'Critical infrastructure technology with government contracts',
        'AI-powered solution revolutionizing industry processes'
      ]
    },
    {
      type: 'Renewable Energy',
      categories: ['Solar', 'Wind', 'Hydroelectric', 'Storage'],
      locations: ['Texas', 'California', 'Nevada', 'Arizona'],
      basePrice: 100000,
      apyRange: [0.07, 0.15],
      descriptions: [
        'Large-scale solar installation with 20-year power purchase agreements',
        'Wind farm project in high-yield location with established utility partnerships',
        'Hydroelectric facility with stable long-term revenue streams',
        'Battery storage system supporting grid stability and peak demand'
      ]
    },
    {
      type: 'Agriculture',
      categories: ['Farmland', 'Livestock', 'Technology', 'Processing'],
      locations: ['Iowa', 'Nebraska', 'Kansas', 'Illinois'],
      basePrice: 75000,
      apyRange: [0.05, 0.10],
      descriptions: [
        'Premium farmland with strong soil quality and water rights',
        'Sustainable livestock operation with direct-to-consumer sales',
        'Agricultural technology improving crop yields and efficiency',
        'Food processing facility serving regional markets'
      ]
    },
    {
      type: 'Infrastructure',
      categories: ['Transportation', 'Utilities', 'Communications', 'Healthcare'],
      locations: ['Nationwide', 'Regional', 'Metropolitan', 'Rural'],
      basePrice: 200000,
      apyRange: [0.06, 0.12],
      descriptions: [
        'Critical transportation infrastructure with government backing',
        'Utility infrastructure serving growing metropolitan area',
        'Communications network expansion in underserved regions',
        'Healthcare facility modernization and expansion project'
      ]
    }
  ];

  const selectedType = assetTypes[Math.floor(Math.random() * assetTypes.length)];
  const category = selectedType.categories[Math.floor(Math.random() * selectedType.categories.length)];
  const location = selectedType.locations[Math.floor(Math.random() * selectedType.locations.length)];
  const description = selectedType.descriptions[Math.floor(Math.random() * selectedType.descriptions.length)];

  // Calculate financial terms based on scenario
  let targetAmount = demoDataUtils.varyNumber(selectedType.basePrice * 20, 0.3);
  let expectedAPY = Math.random() * (selectedType.apyRange[1] - selectedType.apyRange[0]) + selectedType.apyRange[0];
  
  // Apply scenario-specific adjustments
  switch (effectiveScenario) {
    case 'investor_presentation':
      targetAmount = Math.min(targetAmount * 1.5, 50000000); // Larger, more impressive projects
      expectedAPY = Math.min(expectedAPY * 1.2, 0.15); // Higher but realistic returns
      break;
    case 'user_onboarding':
      targetAmount = Math.max(targetAmount * 0.3, 50000); // Smaller, more approachable projects
      expectedAPY = Math.min(expectedAPY, 0.12); // Conservative returns
      break;
    case 'sales_demo':
      targetAmount = demoDataUtils.varyNumber(targetAmount, 0.2);
      expectedAPY = demoDataUtils.varyNumber(expectedAPY, 0.1);
      break;
  }

  if (hideNegativeData) {
    expectedAPY = Math.max(expectedAPY, 0.06); // Ensure positive returns
  }

  const tokenPrice = Math.max(100, Math.round(targetAmount / 10000));
  const totalShares = Math.round(targetAmount / tokenPrice);
  const minimumInvestment = Math.max(tokenPrice, Math.round(targetAmount * 0.001));

  // Generate funding status
  const isActive = Math.random() > 0.3;
  const fundingProgress = isActive ? Math.random() * 0.8 + 0.1 : Math.random() * 0.3 + 0.7;
  const raisedAmount = Math.round(targetAmount * fundingProgress);
  const investorCount = Math.floor(fundingProgress * 50 + Math.random() * 20);

  // Create realistic proposal names
  const nameTemplates = [
    `${selectedType.type} Development in ${location}`,
    `Premium ${category} ${selectedType.type} Investment`,
    `${location} ${category} ${selectedType.type} Project`,
    `Advanced ${category} ${selectedType.type} Opportunity`
  ];
  const name = nameTemplates[Math.floor(Math.random() * nameTemplates.length)];

  // Generate creator name based on scenario
  const creatorNames = effectiveScenario === 'investor_presentation' 
    ? ['Blackstone Group', 'KKR & Co', 'Apollo Global', 'Carlyle Group', 'Brookfield Asset Management']
    : ['John Smith Development', 'Sarah Johnson Properties', 'Mike Davis Holdings', 'Lisa Chen Investments', 'David Wilson Group'];
  
  const creatorName = creatorNames[Math.floor(Math.random() * creatorNames.length)];

  // Apply timeframe acceleration if enabled
  let fundingDeadline = Date.now() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000; // 30-90 days
  if (accelerateTimeframes) {
    fundingDeadline = Date.now() + (3 + Math.random() * 7) * 24 * 60 * 60 * 1000; // 3-10 days
  }

  const proposal: Proposal = {
    id,
    basic_info: {
      title: name,
      creator_name: creatorName,
      description: description,
      asset_type: selectedType.type,
    },
    asset_details: {
      name,
      asset_type: selectedType.type,
      category,
      location,
      description: `${description}. This investment opportunity offers strong fundamentals with experienced management and proven market demand.`,
    },
    financial_terms: {
      target_amount: targetAmount,
      token_price: tokenPrice.toString(),
      total_shares: totalShares,
      minimum_investment: minimumInvestment,
      expected_apy: `${(expectedAPY * 100).toFixed(1)}%`,
      funding_deadline: Math.floor(fundingDeadline / 1000),
    },
    funding_status: {
      raised_amount: raisedAmount.toString(),
      investor_count: investorCount,
      is_funded: fundingProgress > 0.99,
      tokens_minted: fundingProgress > 0.99,
      investors: [] // Can be populated if needed
    },
    status: fundingProgress > 0.99 ? 'Funded' : (Date.now() > fundingDeadline ? 'Expired' : 'Active'),
    creator: `neutron1creator${id.slice(-8)}`,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return proposal;
};

// Real data service (placeholder - replace with actual API calls)
const realProposalService = {
  async fetchProposals(): Promise<Proposal[]> {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/v1/proposals`);
    if (!response.ok) {
      throw new Error(`Failed to fetch proposals: ${response.statusText}`);
    }
    const data = await response.json();
    return data.proposals || [];
  },

  async getProposal(id: string): Promise<Proposal | null> {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/v1/proposals/${id}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.proposal || null;
  },

  async createProposal(data: Partial<Proposal>): Promise<string> {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/v1/proposals`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create proposal: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.id || result.proposal?.id;
  },

  async updateProposal(id: string, updates: Partial<Proposal>): Promise<void> {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/v1/proposals/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update proposal: ${response.statusText}`);
    }
  },

  async deleteProposal(id: string): Promise<void> {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/v1/proposals/${id}`, { 
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete proposal: ${response.statusText}`);
    }
  },

  async investInProposal(proposalId: string, amount: number, investor: string): Promise<void> {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/v1/proposals/${proposalId}/invest`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      },
      body: JSON.stringify({ amount, investor })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to invest in proposal: ${response.statusText}`);
    }
  }
};

// Demo data service
const demoProposalService = {
  async fetchProposals(): Promise<Proposal[]> {
    // Generate demo proposals based on current scenario
    const { scenario } = useDemoModeStore.getState();
    const count = scenario === 'investor_presentation' ? 12 : 8;
    
    return Array.from({ length: count }, (_, i) => 
      generateEnhancedDemoProposal(`demo_proposal_${i + 1}`, scenario)
    );
  },

  async getProposal(id: string): Promise<Proposal | null> {
    if (id.startsWith('demo_')) {
      return generateEnhancedDemoProposal(id);
    }
    return null;
  },

  async createProposal(data: Partial<Proposal>): Promise<string> {
    // Simulate successful creation
    const id = `demo_proposal_${Date.now()}`;
    console.log('Demo: Created proposal', id, data);
    return id;
  },

  async updateProposal(id: string, updates: Partial<Proposal>): Promise<void> {
    console.log('Demo: Updated proposal', id, updates);
  },

  async deleteProposal(id: string): Promise<void> {
    console.log('Demo: Deleted proposal', id);
  },

  async investInProposal(proposalId: string, amount: number, investor: string): Promise<void> {
    console.log('Demo: Investment made', { proposalId, amount, investor });
    // Simulate successful investment
  }
};

// Create demo-aware data services
const fetchProposalsService = createDemoDataService(
  () => realProposalService.fetchProposals(),
  () => demoProposalService.fetchProposals()
);

const getProposalService = createDemoDataService(
  (id: string) => realProposalService.getProposal(id),
  (id: string) => demoProposalService.getProposal(id)
);

export const useEnhancedProposalStore = create<ProposalState>()(
  devtools(
    (set, get) => ({
      proposals: [],
      loading: false,
      error: null,
      selectedProposal: null,

      fetchProposals: async () => {
        set({ loading: true, error: null });
        try {
          const proposals = await fetchProposalsService();
          set({ proposals, loading: false });
          
          // Schedule notifications for demo mode
          const { isDemoMode } = useDemoModeStore.getState();
          if (isDemoMode()) {
            notificationScheduler.scheduleProposalNotifications(proposals);
          }
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      getProposal: async (id: string) => {
        const { isDemoMode } = useDemoModeStore.getState();
        
        try {
          let proposal: Proposal | null;
          
          if (isDemoMode()) {
            proposal = await demoProposalService.getProposal(id);
          } else {
            proposal = await realProposalService.getProposal(id);
          }
          
          if (proposal) {
            set({ selectedProposal: proposal });
          }
          
          return proposal;
        } catch (error) {
          set({ error: (error as Error).message });
          return null;
        }
      },

      createProposal: async (proposalData: Partial<Proposal>) => {
        const { isDemoMode } = useDemoModeStore.getState();
        
        try {
          let id: string;
          
          if (isDemoMode()) {
            id = await demoProposalService.createProposal(proposalData);
          } else {
            id = await realProposalService.createProposal(proposalData);
          }
          
          // Refresh proposals list
          await get().fetchProposals();
          
          return id;
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      updateProposal: async (id: string, updates: Partial<Proposal>) => {
        const { isDemoMode } = useDemoModeStore.getState();
        
        try {
          if (isDemoMode()) {
            await demoProposalService.updateProposal(id, updates);
          } else {
            await realProposalService.updateProposal(id, updates);
          }
          
          // Update local state
          set(state => ({
            proposals: state.proposals.map(p => 
              p.id === id ? { ...p, ...updates } : p
            ),
            selectedProposal: state.selectedProposal?.id === id 
              ? { ...state.selectedProposal, ...updates }
              : state.selectedProposal
          }));
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      deleteProposal: async (id: string) => {
        const { isDemoMode } = useDemoModeStore.getState();
        
        try {
          if (isDemoMode()) {
            await demoProposalService.deleteProposal(id);
          } else {
            await realProposalService.deleteProposal(id);
          }
          
          // Remove from local state
          set(state => ({
            proposals: state.proposals.filter(p => p.id !== id),
            selectedProposal: state.selectedProposal?.id === id ? null : state.selectedProposal
          }));
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      investInProposal: async (proposalId: string, amount: number, investor: string) => {
        const { isDemoMode } = useDemoModeStore.getState();
        
        try {
          if (isDemoMode()) {
            await demoProposalService.investInProposal(proposalId, amount, investor);
          } else {
            await realProposalService.investInProposal(proposalId, amount, investor);
          }
          
          // Update proposal funding status
          set(state => ({
            proposals: state.proposals.map(p => {
              if (p.id === proposalId && p.funding_status) {
                const newRaisedAmount = parseInt(p.funding_status.raised_amount) + amount;
                return {
                  ...p,
                  funding_status: {
                    ...p.funding_status,
                    raised_amount: newRaisedAmount.toString(),
                    investor_count: p.funding_status.investor_count + 1,
                    is_funded: newRaisedAmount >= p.financial_terms.target_amount,
                  }
                };
              }
              return p;
            })
          }));
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      // Demo-specific actions
      generateDemoProposals: (count = 10) => {
        return Array.from({ length: count }, (_, i) => 
          generateEnhancedDemoProposal(`demo_proposal_${i + 1}`)
        );
      },

      switchToInvestorDemoData: () => {
        const { switchScenario } = useDemoModeStore.getState();
        switchScenario('investor_presentation');
        get().fetchProposals(); // Refresh with new scenario
      },

      switchToSalesDemoData: () => {
        const { switchScenario } = useDemoModeStore.getState();
        switchScenario('sales_demo');
        get().fetchProposals(); // Refresh with new scenario
      },

      refreshDemoData: () => {
        const { isDemoMode } = useDemoModeStore.getState();
        if (isDemoMode()) {
          get().fetchProposals();
        }
      }
    }),
    {
      name: 'enhanced-proposal-store',
    }
  )
);

// Hook for easy access to demo-aware proposal data
export const useProposalData = () => {
  const store = useEnhancedProposalStore();
  const { isDemoMode, scenario } = useDemoModeStore();
  
  return {
    ...store,
    isDemoMode: isDemoMode(),
    scenario,
    isRealistic: useDemoModeStore.getState().showRealisticNumbers,
  };
};