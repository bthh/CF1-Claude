# Demo Mode Integration Example

This example shows how to integrate the demo mode system with an existing component (using the Launchpad as an example).

## Before: Original Component

```typescript
// Original Launchpad.tsx
import React, { useEffect } from 'react';
import { useProposalStore } from '../store/proposalStore';

const Launchpad: React.FC = () => {
  const { proposals, loading, fetchProposals } = useProposalStore();

  useEffect(() => {
    fetchProposals(); // Always fetches real data
  }, []);

  return (
    <div>
      <h1>Investment Proposals</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map(proposal => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  );
};
```

## After: Demo-Aware Component

```typescript
// Enhanced Launchpad.tsx
import React, { useEffect } from 'react';
import { useEnhancedProposalStore } from '../store/enhancedProposalStore';
import { useDemoMode } from '../components/DemoMode';

const Launchpad: React.FC = () => {
  const { proposals, loading, fetchProposals } = useEnhancedProposalStore();
  const { isDemoMode, scenario } = useDemoMode();

  useEffect(() => {
    fetchProposals(); // Now automatically switches between real/demo data
  }, []);

  // Demo-specific UI enhancements
  const getHeaderMessage = () => {
    if (!isDemoMode) return "Investment Proposals";
    
    switch (scenario) {
      case 'investor_presentation':
        return "Premium Investment Opportunities";
      case 'user_onboarding':
        return "Explore Investment Proposals (Demo)";
      case 'sales_demo':
        return "Discover Investment Opportunities";
      default:
        return "Investment Proposals (Demo Mode)";
    }
  };

  // Demo-specific filtering
  const getDisplayProposals = () => {
    if (!isDemoMode) return proposals;
    
    // For investor presentations, show only the most impressive proposals
    if (scenario === 'investor_presentation') {
      return proposals
        .filter(p => parseFloat(p.financial_terms.expected_apy) >= 8)
        .sort((a, b) => parseFloat(b.financial_terms.expected_apy) - parseFloat(a.financial_terms.expected_apy))
        .slice(0, 6);
    }
    
    return proposals;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getHeaderMessage()}
        </h1>
        
        {/* Demo-specific indicators */}
        {isDemoMode && scenario === 'user_onboarding' && (
          <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg text-sm">
            ✨ Try clicking on any proposal to learn more!
          </div>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getDisplayProposals().map(proposal => (
            <ProposalCard 
              key={proposal.id} 
              proposal={proposal} 
              demoMode={isDemoMode}
              scenario={scenario}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

## Store Integration

```typescript
// enhancedProposalStore.ts (already created)
import { createDemoDataService } from '../services/demoDataService';

// Demo-aware data fetching
const fetchProposalsService = createDemoDataService(
  () => realAPI.getProposals(),      // Real data
  () => demoService.getProposals()   // Demo data
);

export const useEnhancedProposalStore = create((set, get) => ({
  proposals: [],
  loading: false,

  fetchProposals: async () => {
    set({ loading: true });
    try {
      const proposals = await fetchProposalsService(); // Automatically chooses real/demo
      set({ proposals, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
```

## Component Enhancement

```typescript
// Enhanced ProposalCard.tsx
interface ProposalCardProps {
  proposal: Proposal;
  demoMode?: boolean;
  scenario?: string;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ 
  proposal, 
  demoMode = false, 
  scenario 
}) => {
  // Demo-specific styling
  const getCardStyling = () => {
    if (!demoMode) return "bg-white dark:bg-gray-800";
    
    switch (scenario) {
      case 'investor_presentation':
        return "bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/10 border-green-200";
      case 'sales_demo':
        return "bg-white dark:bg-gray-800 hover:shadow-lg transform hover:scale-105 transition-all";
      default:
        return "bg-white dark:bg-gray-800";
    }
  };

  // Demo-specific badges
  const getDemoBadge = () => {
    if (!demoMode || scenario === 'investor_presentation') return null;
    
    return (
      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
        Demo
      </div>
    );
  };

  return (
    <div className={`relative rounded-lg p-6 shadow-sm ${getCardStyling()}`}>
      {getDemoBadge()}
      
      <h3 className="text-lg font-semibold mb-2">
        {proposal.basic_info.title}
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Expected APY:</span>
          <span className={`font-semibold ${
            demoMode && scenario === 'investor_presentation' 
              ? 'text-green-600' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {proposal.financial_terms.expected_apy}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Target Amount:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${proposal.financial_terms.target_amount.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Demo-specific call-to-action */}
      <button className={`w-full mt-4 py-2 px-4 rounded-lg transition-colors ${
        demoMode && scenario === 'sales_demo'
          ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}>
        {demoMode && scenario === 'user_onboarding' ? 'Learn More (Demo)' : 'View Details'}
      </button>
    </div>
  );
};
```

## Key Integration Points

### 1. **Data Layer**
- Replace `useProposalStore` with `useEnhancedProposalStore`
- Data automatically switches based on demo mode
- No manual data management needed

### 2. **Component Logic**
- Add `useDemoMode()` hook for demo state
- Create scenario-specific rendering logic
- Add demo-aware UI enhancements

### 3. **User Experience**
- Different headers for different scenarios
- Visual indicators for demo mode
- Enhanced styling for presentation modes
- Educational hints for onboarding

### 4. **Store Integration**
- Use `createDemoDataService` for data fetching
- Automatic real/demo data switching
- Scenario-aware data transformations

## Testing the Integration

```typescript
// Test different scenarios
const TestDemoIntegration = () => {
  const { enableDemo, disableDemo } = useDemoMode();

  const testScenarios = [
    'investor_presentation',
    'sales_demo', 
    'user_onboarding',
    'regulatory_showcase'
  ];

  return (
    <div className="p-4 space-y-4">
      <h2>Demo Mode Testing</h2>
      
      <div className="flex space-x-2">
        {testScenarios.map(scenario => (
          <button
            key={scenario}
            onClick={() => enableDemo(scenario)}
            className="px-3 py-2 bg-blue-500 text-white rounded"
          >
            {scenario}
          </button>
        ))}
        
        <button
          onClick={disableDemo}
          className="px-3 py-2 bg-red-500 text-white rounded"
        >
          Disable Demo
        </button>
      </div>
      
      <Launchpad />
    </div>
  );
};
```

This integration example shows how easy it is to make existing components demo-aware while maintaining their original functionality.