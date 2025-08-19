// Import polyfills first
import './polyfills';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Simplified initialization for debugging
console.log('CF1 Platform starting...');

// Minimal React app rendering

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
