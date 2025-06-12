// CF1 Platform - React Query Provider
// Global query client configuration and devtools

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from '../lib/queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Create a single query client instance
const queryClient = createQueryClient();

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
};

// Hook to access query client directly
export const useQueryClientInstance = () => queryClient;