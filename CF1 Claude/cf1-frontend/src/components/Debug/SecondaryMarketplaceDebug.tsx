import React from 'react';
import { StoreTestComponent } from './StoreTestComponent';

export const SecondaryMarketplaceDebug: React.FC = () => {
  console.log('SecondaryMarketplaceDebug component loaded');
  
  try {
    // Test basic component loading first
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h2 className="text-blue-800 dark:text-blue-200 font-bold text-lg mb-2">
            🔍 Secondary Marketplace Debug Mode
          </h2>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            This debug component will help identify what's causing the white screen issue.
          </p>
        </div>
        
        <StoreTestComponent />
        
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            If you can see this message, the basic React rendering is working properly.
            The issue is likely in the store access or data loading.
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Debug component error:', error);
    
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-red-800 dark:text-red-200 font-medium mb-3">Critical Debug Error</h3>
        <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
          <p><strong>Error:</strong> {error instanceof Error ? error.message : String(error)}</p>
          
          {error instanceof Error && error.stack && (
            <details className="mt-3">
              <summary className="cursor-pointer font-medium">Stack Trace</summary>
              <pre className="text-xs mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            <strong>Recommendation:</strong> Check browser console for additional error details.
          </p>
        </div>
      </div>
    );
  }
};