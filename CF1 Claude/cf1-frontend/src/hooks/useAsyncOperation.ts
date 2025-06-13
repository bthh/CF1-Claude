import { useState, useCallback, useRef, useEffect } from 'react';
import { ErrorHandler } from '../lib/errorHandler';
import { useNotifications } from './useNotifications';

interface AsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  context?: string;
}

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useAsyncOperation<T = any>(
  operation: (...args: any[]) => Promise<T>,
  options: AsyncOperationOptions = {}
): AsyncOperationState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Get notification system (optional - won't fail if not in provider)
  let notifications: any;
  try {
    notifications = useNotifications();
  } catch (e) {
    // Not in notification provider context
  }
  
  // Track if component is mounted
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      if (!isMounted.current) return null;
      
      setLoading(true);
      setError(null);

      try {
        const result = await operation(...args);
        
        if (!isMounted.current) return null;
        
        setData(result);
        
        // Call success callback
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        // Show success message if provided
        if (options.successMessage && notifications) {
          notifications.success('Success', options.successMessage);
        }
        
        return result;
      } catch (err) {
        if (!isMounted.current) return null;
        
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        
        // Handle error with ErrorHandler
        ErrorHandler.handle(error, options.context || 'Async Operation');
        
        // Call error callback
        if (options.onError) {
          options.onError(error);
        }
        
        // Show error message if provided
        if (options.errorMessage && notifications) {
          notifications.error('Error', options.errorMessage);
        }
        
        return null;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [operation, options, notifications]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Variant for mutations that don't return data
export function useAsyncMutation(
  operation: (...args: any[]) => Promise<void>,
  options: AsyncOperationOptions = {}
) {
  const { execute: baseExecute, ...rest } = useAsyncOperation(operation, options);
  
  const execute = useCallback(
    async (...args: any[]): Promise<boolean> => {
      const result = await baseExecute(...args);
      return result !== null;
    },
    [baseExecute]
  );
  
  return {
    ...rest,
    execute,
  };
}

// Hook for form submissions with error handling
export function useFormSubmit<T = any>(
  onSubmit: (data: T) => Promise<any>,
  options: AsyncOperationOptions = {}
) {
  const { execute, loading, error } = useAsyncOperation(onSubmit, {
    ...options,
    context: options.context || 'Form Submission',
  });

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      return execute;
    },
    [execute]
  );

  return {
    handleSubmit,
    submitting: loading,
    error,
  };
}