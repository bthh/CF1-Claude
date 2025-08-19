/**
 * Portfolio Integration Test Utility
 * Tests the complete instant fund -> portfolio integration flow
 */

import { usePortfolioStore } from '../store/portfolioStore';
import { useDataModeStore } from '../store/dataModeStore';

export interface IntegrationTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class PortfolioIntegrationTester {
  
  static testInstantFundToPortfolioFlow(): IntegrationTestResult {
    try {
      console.log('🧪 Starting Portfolio Integration Test...');
      
      // 1. Test Portfolio Store State
      const portfolioState = usePortfolioStore.getState();
      console.log('📊 Portfolio Store State:', {
        assetsCount: portfolioState.assets.length,
        transactionsCount: portfolioState.transactions.length,
        summary: portfolioState.summary
      });
      
      // 2. Test Data Mode
      const dataMode = useDataModeStore.getState().currentMode;
      console.log('📋 Current Data Mode:', dataMode);
      
      // 3. Simulate Instant Fund Transaction
      const mockTransaction = {
        type: 'investment' as const,
        assetId: 'test_asset_integration',
        assetName: 'Integration Test Asset',
        amount: '50000',
        shares: 50,
        timestamp: new Date().toISOString(),
        status: 'completed' as const
      };
      
      const mockAsset = {
        proposalId: 'test_asset_integration',
        name: 'Integration Test Asset',
        type: 'Test Asset',
        shares: 50,
        currentValue: '50000',
        totalInvested: '50000',
        unrealizedGain: '0',
        unrealizedGainPercent: 0,
        apy: '10.0%',
        locked: true,
        unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log('🎯 Adding test transaction:', mockTransaction);
      portfolioState.addTransaction(mockTransaction);
      
      console.log('🏢 Adding test asset:', mockAsset);
      portfolioState.addAsset(mockAsset);
      
      // 4. Verify State Updates
      setTimeout(() => {
        const updatedState = usePortfolioStore.getState();
        const foundTransaction = updatedState.transactions.find(t => t.assetId === 'test_asset_integration');
        const foundAsset = updatedState.assets.find(a => a.proposalId === 'test_asset_integration');
        
        console.log('✅ Verify Transaction Added:', !!foundTransaction);
        console.log('✅ Verify Asset Added:', !!foundAsset);
        
        if (foundTransaction && foundAsset) {
          console.log('🎉 Portfolio Integration Test PASSED');
          return {
            success: true,
            message: 'Portfolio integration working correctly',
            data: {
              transaction: foundTransaction,
              asset: foundAsset,
              updatedState: {
                assetsCount: updatedState.assets.length,
                transactionsCount: updatedState.transactions.length,
                summary: updatedState.summary
              }
            }
          };
        } else {
          console.log('❌ Portfolio Integration Test FAILED');
          return {
            success: false,
            message: 'Portfolio integration not working',
            error: `Transaction found: ${!!foundTransaction}, Asset found: ${!!foundAsset}`
          };
        }
      }, 200);
      
      return {
        success: true,
        message: 'Test initiated - check console for results'
      };
      
    } catch (error) {
      console.error('❌ Portfolio Integration Test Error:', error);
      return {
        success: false,
        message: 'Test failed with error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  static testPortfolioDataServiceIntegration(): IntegrationTestResult {
    try {
      console.log('🧪 Testing Portfolio Data Service Integration...');
      
      // This needs to be done in a React component context
      // but we can test the store state
      const portfolioState = usePortfolioStore.getState();
      
      console.log('📊 Portfolio Store Raw Data:');
      console.log('- Assets:', portfolioState.assets);
      console.log('- Transactions:', portfolioState.transactions);
      console.log('- Summary:', portfolioState.summary);
      
      // Test transaction processing logic
      const transactions = portfolioState.transactions || [];
      const investmentTransactions = transactions.filter(tx => tx.type === 'investment' && tx.status === 'completed');
      
      console.log('💰 Investment Transactions:', investmentTransactions);
      
      if (investmentTransactions.length > 0) {
        console.log('✅ Found investment transactions for portfolio display');
        return {
          success: true,
          message: 'Portfolio data service integration working',
          data: {
            totalTransactions: transactions.length,
            investmentTransactions: investmentTransactions.length,
            assets: portfolioState.assets.length
          }
        };
      } else {
        console.log('⚠️ No investment transactions found');
        return {
          success: false,
          message: 'No investment transactions found',
          data: {
            totalTransactions: transactions.length,
            investmentTransactions: 0,
            assets: portfolioState.assets.length
          }
        };
      }
      
    } catch (error) {
      console.error('❌ Portfolio Data Service Test Error:', error);
      return {
        success: false,
        message: 'Portfolio data service test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  static runFullDiagnostic(): IntegrationTestResult {
    console.log('🔍 Running Full Portfolio Integration Diagnostic...');
    
    try {
      // 1. Check stores
      const portfolioState = usePortfolioStore.getState();
      const dataMode = useDataModeStore.getState().currentMode;
      
      console.log('📊 Store States:');
      console.log('- Portfolio Assets:', portfolioState.assets.length);
      console.log('- Portfolio Transactions:', portfolioState.transactions.length);
      console.log('- Data Mode:', dataMode);
      
      // 2. Check for common issues
      const issues = [];
      
      if (portfolioState.transactions.length === 0) {
        issues.push('No transactions in portfolio store');
      }
      
      if (portfolioState.assets.length === 0) {
        issues.push('No assets in portfolio store');
      }
      
      if (dataMode !== 'development') {
        issues.push(`Data mode is ${dataMode}, should be development for testing`);
      }
      
      // 3. Test function availability
      if (typeof portfolioState.addTransaction !== 'function') {
        issues.push('addTransaction function not available');
      }
      
      if (typeof portfolioState.addAsset !== 'function') {
        issues.push('addAsset function not available');
      }
      
      console.log('🔧 Diagnostic Results:');
      if (issues.length === 0) {
        console.log('✅ All systems operational');
        return {
          success: true,
          message: 'All portfolio integration systems operational'
        };
      } else {
        console.log('⚠️ Issues found:', issues);
        return {
          success: false,
          message: 'Portfolio integration issues detected',
          error: issues.join(', ')
        };
      }
      
    } catch (error) {
      console.error('❌ Diagnostic Error:', error);
      return {
        success: false,
        message: 'Diagnostic failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Utility function to add to window for browser console testing
declare global {
  interface Window {
    portfolioIntegrationTest: typeof PortfolioIntegrationTester;
  }
}

if (typeof window !== 'undefined') {
  window.portfolioIntegrationTest = PortfolioIntegrationTester;
}

export default PortfolioIntegrationTester;