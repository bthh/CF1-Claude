/**
 * Portfolio Testing Workflow Utility for CF1 Platform
 * 
 * This utility provides comprehensive testing functions for validating
 * the complete investment-to-portfolio workflow in development mode.
 */

import { usePortfolioStore } from '../store/portfolioStore';
import { useDataModeStore } from '../store/dataModeStore';
import { useWalletStore } from '../store/walletStore';

export interface TestResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export interface TestScenario {
  name: string;
  description: string;
  steps: TestStep[];
}

export interface TestStep {
  name: string;
  action: () => Promise<TestResult>;
}

/**
 * Validates the current development environment setup
 */
export const validateEnvironment = async (): Promise<TestResult[]> => {
  console.log('🧪 Starting Environment Validation...');
  const results: TestResult[] = [];

  // Check data mode
  try {
    const dataMode = useDataModeStore.getState();
    if (dataMode.currentMode === 'development') {
      results.push({
        step: 'Data Mode Check',
        status: 'success',
        message: 'Platform is in development mode',
        data: { mode: dataMode.currentMode }
      });
    } else {
      results.push({
        step: 'Data Mode Check',
        status: 'warning',
        message: `Platform is in ${dataMode.currentMode} mode, not development`,
        data: { mode: dataMode.currentMode }
      });
    }
  } catch (error) {
    results.push({
      step: 'Data Mode Check',
      status: 'error',
      message: 'Failed to check data mode',
      data: { error: error.message }
    });
  }

  // Check wallet connection
  try {
    const wallet = useWalletStore.getState();
    if (wallet.address) {
      results.push({
        step: 'Wallet Check',
        status: 'success',
        message: 'Wallet is connected',
        data: { address: wallet.address }
      });
    } else {
      results.push({
        step: 'Wallet Check',
        status: 'warning',
        message: 'No wallet connected',
        data: { address: null }
      });
    }
  } catch (error) {
    results.push({
      step: 'Wallet Check',
      status: 'error',
      message: 'Failed to check wallet status',
      data: { error: error.message }
    });
  }

  // Check portfolio store state
  try {
    const portfolio = usePortfolioStore.getState();
    results.push({
      step: 'Portfolio Store Check',
      status: 'success',
      message: `Found ${portfolio.transactions.length} transactions in portfolio store`,
      data: { 
        transactionCount: portfolio.transactions.length,
        transactions: portfolio.transactions
      }
    });
  } catch (error) {
    results.push({
      step: 'Portfolio Store Check',
      status: 'error',
      message: 'Failed to check portfolio store',
      data: { error: error.message }
    });
  }

  console.log('✅ Environment Validation Complete:', results);
  return results;
};

/**
 * Simulates an instant fund transaction for testing
 */
export const simulateInstantFund = async (proposalId: string, assetName: string, amount: number): Promise<TestResult> => {
  console.log(`🚀 Simulating instant fund for ${assetName} with amount $${amount}`);
  
  try {
    const portfolio = usePortfolioStore.getState();
    const wallet = useWalletStore.getState();

    if (!wallet.address) {
      return {
        step: 'Simulate Instant Fund',
        status: 'error',
        message: 'No wallet address available for transaction'
      };
    }

    const transactionData = {
      type: 'investment' as const,
      assetId: proposalId,
      assetName: assetName,
      amount: amount,
      shares: Math.floor(amount / 1000), // $1000 per share
      timestamp: new Date().toISOString(),
      status: 'completed' as const
    };

    console.log('🔍 Adding simulated transaction:', transactionData);
    portfolio.addTransaction(transactionData);

    // Verify transaction was added
    const updatedState = usePortfolioStore.getState();
    const addedTransaction = updatedState.transactions.find(tx => tx.assetId === proposalId);

    if (addedTransaction) {
      return {
        step: 'Simulate Instant Fund',
        status: 'success',
        message: `Successfully added investment transaction for ${assetName}`,
        data: { transaction: addedTransaction }
      };
    } else {
      return {
        step: 'Simulate Instant Fund',
        status: 'error',
        message: 'Transaction was not found after adding'
      };
    }
  } catch (error) {
    return {
      step: 'Simulate Instant Fund',
      status: 'error',
      message: `Failed to simulate instant fund: ${error.message}`,
      data: { error }
    };
  }
};

/**
 * Validates that development portfolio assets reflect transactions
 */
export const validatePortfolioIntegration = async (): Promise<TestResult> => {
  console.log('📊 Validating Portfolio Integration...');
  
  try {
    // Import the portfolio data service dynamically to avoid circular deps
    const portfolioDataService = await import('../services/portfolioDataService');
    const { usePortfolioData } = portfolioDataService;
    
    // Get portfolio data
    const portfolioData = usePortfolioData();
    const portfolio = usePortfolioStore.getState();
    
    console.log('🔍 Portfolio data assets:', portfolioData.assets);
    console.log('🔍 Portfolio store transactions:', portfolio.transactions);
    
    const investmentTransactions = portfolio.transactions.filter(tx => tx.type === 'investment' && tx.status === 'completed');
    
    if (portfolioData.currentMode !== 'development') {
      return {
        step: 'Portfolio Integration',
        status: 'warning',
        message: `Portfolio is not in development mode (current: ${portfolioData.currentMode})`
      };
    }
    
    if (investmentTransactions.length === 0) {
      return {
        step: 'Portfolio Integration',
        status: 'warning',
        message: 'No investment transactions found to validate against',
        data: { assets: portfolioData.assets, transactions: investmentTransactions }
      };
    }
    
    if (portfolioData.assets.length === 0) {
      return {
        step: 'Portfolio Integration',
        status: 'error',
        message: 'Portfolio has transactions but no assets showing in development mode',
        data: { assets: portfolioData.assets, transactions: investmentTransactions }
      };
    }
    
    // Validate that transactions match assets
    const assetIds = portfolioData.assets.map(asset => asset.id);
    const transactionAssetIds = [...new Set(investmentTransactions.map(tx => tx.assetId))];
    
    const missingAssets = transactionAssetIds.filter(id => !assetIds.includes(id));
    
    if (missingAssets.length > 0) {
      return {
        step: 'Portfolio Integration',
        status: 'error',
        message: `Assets missing from portfolio view: ${missingAssets.join(', ')}`,
        data: { 
          assets: portfolioData.assets, 
          transactions: investmentTransactions,
          missingAssets 
        }
      };
    }
    
    return {
      step: 'Portfolio Integration',
      status: 'success',
      message: `Successfully validated ${portfolioData.assets.length} assets against ${investmentTransactions.length} transactions`,
      data: { 
        assets: portfolioData.assets, 
        transactions: investmentTransactions,
        summary: portfolioData.summary 
      }
    };
  } catch (error) {
    return {
      step: 'Portfolio Integration',
      status: 'error',
      message: `Failed to validate portfolio integration: ${error.message}`,
      data: { error }
    };
  }
};

/**
 * Clears all development transactions for clean testing
 */
export const clearDevelopmentData = async (): Promise<TestResult> => {
  console.log('🧹 Clearing Development Data...');
  
  try {
    // Clear portfolio transactions
    const portfolio = usePortfolioStore.getState();
    // Since there's no direct clear method, we'll reset the store
    portfolio.transactions = [];
    usePortfolioStore.setState({ transactions: [] });
    
    return {
      step: 'Clear Development Data',
      status: 'success',
      message: 'Successfully cleared all development transactions'
    };
  } catch (error) {
    return {
      step: 'Clear Development Data',
      status: 'error',
      message: `Failed to clear development data: ${error.message}`,
      data: { error }
    };
  }
};

/**
 * Complete end-to-end testing scenario
 */
export const runCompleteTestScenario = async (): Promise<TestResult[]> => {
  console.log('🎯 Running Complete Test Scenario...');
  const results: TestResult[] = [];

  // Step 1: Validate environment
  const envResults = await validateEnvironment();
  results.push(...envResults);

  // Step 2: Clear existing data
  const clearResult = await clearDevelopmentData();
  results.push(clearResult);

  // Step 3: Simulate multiple investments
  const testInvestments = [
    { id: 'test-prop-1', name: 'Test Office Building', amount: 50000 },
    { id: 'test-prop-2', name: 'Test Solar Farm', amount: 25000 },
    { id: 'test-prop-3', name: 'Test Gold Vault', amount: 15000 }
  ];

  for (const investment of testInvestments) {
    const fundResult = await simulateInstantFund(investment.id, investment.name, investment.amount);
    results.push(fundResult);
  }

  // Step 4: Validate portfolio integration
  // Wait a bit for state updates
  await new Promise(resolve => setTimeout(resolve, 100));
  const validationResult = await validatePortfolioIntegration();
  results.push(validationResult);

  console.log('✅ Complete Test Scenario Results:', results);
  return results;
};

/**
 * Predefined test scenarios
 */
export const testScenarios: TestScenario[] = [
  {
    name: 'Basic Investment Flow',
    description: 'Tests basic instant fund to portfolio integration',
    steps: [
      {
        name: 'Environment Setup',
        action: async () => {
          const envResults = await validateEnvironment();
          const hasErrors = envResults.some(r => r.status === 'error');
          return {
            step: 'Environment Setup',
            status: hasErrors ? 'error' : 'success',
            message: hasErrors ? 'Environment has errors' : 'Environment ready',
            data: envResults
          };
        }
      },
      {
        name: 'Simulate Investment',
        action: () => simulateInstantFund('test-basic-1', 'Basic Test Asset', 10000)
      },
      {
        name: 'Validate Portfolio',
        action: () => validatePortfolioIntegration()
      }
    ]
  },
  {
    name: 'Multiple Investments',
    description: 'Tests multiple investments and portfolio aggregation',
    steps: [
      {
        name: 'Clear Data',
        action: () => clearDevelopmentData()
      },
      {
        name: 'Add Investment 1',
        action: () => simulateInstantFund('multi-test-1', 'Multi Test Asset 1', 5000)
      },
      {
        name: 'Add Investment 2',
        action: () => simulateInstantFund('multi-test-2', 'Multi Test Asset 2', 7500)
      },
      {
        name: 'Add Investment 3',
        action: () => simulateInstantFund('multi-test-3', 'Multi Test Asset 3', 12500)
      },
      {
        name: 'Validate Portfolio',
        action: () => validatePortfolioIntegration()
      }
    ]
  }
];

/**
 * Runs a specific test scenario
 */
export const runTestScenario = async (scenarioName: string): Promise<TestResult[]> => {
  const scenario = testScenarios.find(s => s.name === scenarioName);
  if (!scenario) {
    return [{
      step: 'Test Scenario',
      status: 'error',
      message: `Test scenario '${scenarioName}' not found`
    }];
  }

  console.log(`🧪 Running Test Scenario: ${scenario.name}`);
  const results: TestResult[] = [];

  for (const step of scenario.steps) {
    console.log(`🔄 Running step: ${step.name}`);
    try {
      const result = await step.action();
      results.push(result);
    } catch (error) {
      results.push({
        step: step.name,
        status: 'error',
        message: `Step failed: ${error.message}`,
        data: { error }
      });
    }
  }

  console.log(`✅ Test Scenario '${scenario.name}' Complete:`, results);
  return results;
};

/**
 * Console helper functions for easy testing
 */
export const testingHelpers = {
  // Quick environment check
  env: () => validateEnvironment(),
  
  // Quick portfolio validation
  portfolio: () => validatePortfolioIntegration(),
  
  // Quick fund simulation
  fund: (id: string, name: string, amount: number) => simulateInstantFund(id, name, amount),
  
  // Quick clear
  clear: () => clearDevelopmentData(),
  
  // Run complete test
  complete: () => runCompleteTestScenario(),
  
  // Run specific scenario
  scenario: (name: string) => runTestScenario(name),
  
  // List scenarios
  scenarios: () => {
    console.log('Available Test Scenarios:');
    testScenarios.forEach(scenario => {
      console.log(`- ${scenario.name}: ${scenario.description}`);
    });
  }
};

// Make helpers available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).cf1Test = testingHelpers;
  console.log('🧪 CF1 Testing Helpers available as window.cf1Test');
  console.log('Available commands: env(), portfolio(), fund(id, name, amount), clear(), complete(), scenario(name), scenarios()');
}