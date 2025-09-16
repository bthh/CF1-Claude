// Import polyfills first
import './polyfills';

// Initialize dark mode BEFORE React renders to prevent flash
const initializeDarkMode = () => {
  if (typeof window !== 'undefined') {
    // Clean up old localStorage key if it exists
    const oldDarkMode = localStorage.getItem('darkMode');
    if (oldDarkMode !== null) {
      localStorage.removeItem('darkMode');
    }

    const storedUIState = localStorage.getItem('cf1-ui-storage');
    let shouldUseDarkMode = true; // Default to dark mode

    if (storedUIState) {
      try {
        const parsed = JSON.parse(storedUIState);
        shouldUseDarkMode = parsed.state?.darkMode !== undefined ? parsed.state.darkMode : true;
      } catch (e) {
        // Ignore parsing errors, default to dark mode
        shouldUseDarkMode = true;
      }
    } else if (oldDarkMode !== null) {
      // Use migrated value from old key
      shouldUseDarkMode = oldDarkMode === 'true';
    }

    // Apply immediately to prevent flash
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

// Initialize dark mode immediately
initializeDarkMode();

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/cf1-gradients.css'
import App from './App.tsx'
import { initializeMonitoring, initializePerformanceMonitoring, startSession } from './lib/monitoring'
import { performanceMonitor } from './utils/performanceMonitoring'
import { performanceBudgetManager } from './utils/performanceBudgets'

// Initialize monitoring before app starts
initializeMonitoring();
initializePerformanceMonitoring();

// Global error handlers for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  
  // Handle Vite HMR WebSocket errors gracefully (common in development)
  if (error.message.includes('WebSocket closed without opened') || 
      error.message.includes('WebSocket connection') ||
      error.stack?.includes('vite/client')) {
    console.warn('⚠️ Vite HMR WebSocket error (non-critical):', error.message);
    event.preventDefault();
    return; // Don't report these as user-facing errors
  }
  
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
  console.error('Promise:', event.promise);
  console.error('Stack trace:', event.reason?.stack);
  
  // Prevent the default browser error display
  event.preventDefault();
  
  // Track the error in our monitoring system
  import('./lib/monitoring').then(({ reportError, trackEvent }) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    reportError(error, {
      type: 'unhandled_promise_rejection',
      reason: event.reason,
      timestamp: new Date().toISOString()
    });
    
    trackEvent({
      action: 'unhandled_rejection',
      category: 'error',
      label: error.name || 'UnhandledRejection',
      metadata: {
        message: error.message,
        stack: error.stack,
        reason: String(event.reason)
      }
    });
  }).catch(console.error);
});

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('🚨 Unhandled Error:', event.error);
  console.error('Message:', event.message);
  console.error('Source:', event.filename, 'Line:', event.lineno, 'Column:', event.colno);
  
  // Track the error in our monitoring system
  import('./lib/monitoring').then(({ reportError, trackEvent }) => {
    const error = event.error instanceof Error ? event.error : new Error(event.message);
    reportError(error, {
      type: 'unhandled_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString()
    });
    
    trackEvent({
      action: 'unhandled_error',
      category: 'error',
      label: error.name || 'UnhandledError',
      metadata: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  }).catch(console.error);
});

// Initialize our enhanced performance monitoring
performanceMonitor.init();

// Initialize performance budgets and monitoring
performanceBudgetManager.init();

// Start session tracking
const sessionId = startSession();

// Track app initialization
console.log('CF1 Platform initialized with session:', sessionId);

// Add global debug functions for demo mode
declare global {
  interface Window {
    CF1Debug: {
      checkDemoMode: () => void;
      resetDemoMode: () => void;
      enableDemoMode: (scenario?: string) => void;
    };
  }
}

window.CF1Debug = {
  checkDemoMode: () => {
    const demoData = localStorage.getItem('cf1-demo-mode');
    console.log('🔍 CF1 Demo Mode Status:');
    if (demoData) {
      try {
        const parsed = JSON.parse(demoData);
        const isEnabled = parsed.state?.isEnabled || false;
        const scenario = parsed.state?.scenario || 'none';
        console.log(`  Demo Mode: ${isEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
        console.log(`  Scenario: ${scenario}`);
        console.log('  Full data:', parsed);
      } catch (e) {
        console.log('  ❌ Corrupted demo mode data:', demoData);
      }
    } else {
      console.log('  ✅ No demo mode data (should be OFF)');
    }
  },
  
  resetDemoMode: () => {
    console.log('🔧 Resetting demo mode to OFF...');
    localStorage.removeItem('cf1-demo-mode');
    console.log('✅ Demo mode reset. Reload the page to see changes.');
    console.log('🔄 Reloading page...');
    window.location.reload();
  },
  
  enableDemoMode: (scenario = 'investor_presentation') => {
    console.log(`🎭 Enabling demo mode with scenario: ${scenario}`);
    const demoState = {
      state: {
        isEnabled: true,
        scenario: scenario,
        sessionId: `debug_${Date.now()}`,
        showRealisticNumbers: true,
        showPositivePerformance: true,
        hideNegativeData: false,
        accelerateTimeframes: false,
        showDemoIndicator: true,
        enableDemoTutorials: false,
        highlightFeatures: false,
        allowedAdminUsers: [],
        sessionTimeout: 120,
        autoProgressSlides: false,
        presentationMode: false,
        fullScreenMode: false,
        enabledAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      },
      version: 1
    };
    localStorage.setItem('cf1-demo-mode', JSON.stringify(demoState));
    console.log('✅ Demo mode enabled. Reload the page to see changes.');
    console.log('🔄 Reloading page...');
    window.location.reload();
  }
};

console.log('🔧 CF1 Debug Tools Available:');
console.log('  CF1Debug.checkDemoMode() - Check current demo mode status');
console.log('  CF1Debug.resetDemoMode() - Force reset demo mode to OFF');
console.log('  CF1Debug.enableDemoMode() - Enable demo mode for testing');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
