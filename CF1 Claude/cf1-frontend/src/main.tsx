import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Absolute minimal test - no polyfills, no CSS, no App component
console.log('✅ JavaScript is running!');

// Test if React can render anything at all
function SimpleTest() {
  return (
    <div style={{
      padding: '50px', 
      fontSize: '24px', 
      backgroundColor: '#f0f0f0',
      border: '2px solid red'
    }}>
      <h1>🎉 SUCCESS! React is working on production!</h1>
      <p>This means the issue was in our complex App component or imports.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimpleTest />
  </StrictMode>,
)
