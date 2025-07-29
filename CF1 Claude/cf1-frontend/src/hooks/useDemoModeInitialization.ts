import { useEffect, useState } from 'react';
import { useDemoModeStore } from '../store/demoModeStore';
import { roleBasedDemoData } from '../services/roleBasedDemoData';

/**
 * Hook to initialize demo mode with role-based data when app starts
 * This ensures that when demo mode is enabled by default, users have data immediately
 */
export const useDemoModeInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const { isDemoMode } = useDemoModeStore();

  useEffect(() => {
    const initializeDemoData = async () => {
      // Only initialize once and only if demo mode is enabled
      if (isInitialized || isInitializing || !isDemoMode()) {
        return;
      }

      setIsInitializing(true);
      
      try {
        console.log('🎭 [DEMO INIT] Initializing role-based demo data...');
        
        // Generate initial data for common roles to provide immediate content
        await Promise.all([
          roleBasedDemoData.seedDataForRole('investor'),
          roleBasedDemoData.seedDataForRole('creator'),
          roleBasedDemoData.seedDataForRole('super_admin')
        ]);

        console.log('✅ [DEMO INIT] Role-based demo data initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ [DEMO INIT] Error initializing demo data:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    // Initialize on app start
    initializeDemoData();
  }, [isDemoMode, isInitialized, isInitializing]);

  return { isInitialized, isInitializing };
};