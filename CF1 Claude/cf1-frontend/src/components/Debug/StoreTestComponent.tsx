import React from 'react';

export const StoreTestComponent: React.FC = () => {
  try {
    // Test if we can even import the store
    console.log('Testing store import...');
    
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h2 className="text-green-800 dark:text-green-200 font-bold text-xl mb-4">
          🟢 Store Test Component Loaded Successfully
        </h2>
        <div className="space-y-2 text-green-700 dark:text-green-300">
          <p>✅ React component rendering</p>
          <p>✅ TypeScript compilation working</p>
          <p>✅ Tailwind CSS classes loading</p>
          <p>✅ Component export/import working</p>
        </div>
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/40 rounded">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Next step:</strong> Test Zustand store access
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Basic component error:', error);
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-red-800 dark:text-red-200 font-bold text-xl mb-4">
          ❌ Component Test Failed
        </h2>
        <pre className="text-red-600 dark:text-red-300 text-sm">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
};