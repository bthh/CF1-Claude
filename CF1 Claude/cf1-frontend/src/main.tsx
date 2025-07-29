// Import polyfills first
import './polyfills';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeMonitoring, initializePerformanceMonitoring, startSession } from './lib/monitoring'
import { performanceMonitor } from './utils/performanceMonitoring'

// Initialize monitoring before app starts
initializeMonitoring();
initializePerformanceMonitoring();

// Initialize our enhanced performance monitoring
performanceMonitor.init();

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
