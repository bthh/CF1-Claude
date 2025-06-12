import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeMonitoring, initializePerformanceMonitoring, startSession } from './lib/monitoring'

// Initialize monitoring before app starts
initializeMonitoring();
initializePerformanceMonitoring();

// Start session tracking
const sessionId = startSession();

// Track app initialization
console.log('CF1 Platform initialized with session:', sessionId);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
