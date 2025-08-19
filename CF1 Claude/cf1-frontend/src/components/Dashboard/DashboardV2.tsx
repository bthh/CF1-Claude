import React, { useEffect, lazy, Suspense, memo, useMemo } from 'react';
import { useCosmJS } from '../../hooks/useCosmJS';
import { useSessionStore } from '../../store/sessionStore';
import { usePortfolioStore } from '../../store/portfolioStore';
import { useDashboardV2Store } from '../../store/dashboardV2Store';
import LoadingSpinner from '../UI/LoadingSpinner';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceTracker';

// Lazy load dashboard variants for code splitting
const DashboardVariantA = lazy(() => import('./DashboardVariantA'));
const DashboardVariantB = lazy(() => import('./DashboardVariantB'));
const DashboardVariantC = lazy(() => import('./DashboardVariantC'));

export type DashboardVariant = 'A' | 'B' | 'C';

export interface DashboardV2Props {
  className?: string;
}

const DashboardV2: React.FC<DashboardV2Props> = memo(({ className = '' }) => {
  const { isConnected } = useCosmJS();
  const { selectedRole, isRoleSelected } = useSessionStore();
  const { assets, loading: portfolioLoading } = usePortfolioStore();
  const { 
    selectedVariant, 
    loading, 
    determineVariant, 
    setVariant,
    loadDashboardData 
  } = useDashboardV2Store();

  // Performance monitoring
  const { startRender, endRender, trackCustomInteraction } = usePerformanceMonitoring('DashboardV2');

  // Memoize variant context to prevent unnecessary re-calculations
  const variantContext = useMemo(() => ({
    isConnected,
    isRoleSelected,
    selectedRole,
    hasAssets: assets.length > 0
  }), [isConnected, isRoleSelected, selectedRole, assets.length]);

  // Memoize the determined variant to prevent recalculation
  const determinedVariant = useMemo(() => {
    return determineVariant(variantContext);
  }, [variantContext, determineVariant]);

  // Update variant only when it actually changes
  useEffect(() => {
    if (determinedVariant !== selectedVariant) {
      startRender?.();
      setVariant(determinedVariant);
      trackCustomInteraction?.('variant_determined', 0);
      endRender?.();
    }
  }, [determinedVariant, selectedVariant]);

  // Load dashboard data when variant changes
  useEffect(() => {
    if (selectedVariant) {
      const startTime = performance.now();
      loadDashboardData(selectedVariant).then(() => {
        const duration = performance.now() - startTime;
        trackCustomInteraction?.('data_loaded', duration);
      }).catch((error) => {
        console.error('Failed to load dashboard data:', error);
      });
    }
  }, [selectedVariant]);

  if (loading || portfolioLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderVariant = () => {
    const VariantLoadingSpinner = () => (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );

    switch (selectedVariant) {
      case 'A':
        return (
          <Suspense fallback={<VariantLoadingSpinner />}>
            <DashboardVariantA />
          </Suspense>
        );
      case 'B':
        return (
          <Suspense fallback={<VariantLoadingSpinner />}>
            <DashboardVariantB />
          </Suspense>
        );
      case 'C':
        return (
          <Suspense fallback={<VariantLoadingSpinner />}>
            <DashboardVariantC />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<VariantLoadingSpinner />}>
            <DashboardVariantA />
          </Suspense>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Development indicator */}
      {import.meta.env.MODE === 'development' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Dashboard V2</strong> - Currently showing Variant {selectedVariant}
            {selectedVariant === 'A' && ' (Not logged in / No assets)'}
            {selectedVariant === 'B' && ' (Active investor)'}
            {selectedVariant === 'C' && ' (Creator)'}
          </p>
        </div>
      )}
      
      {renderVariant()}
    </div>
  );
});

// Add display name for debugging
DashboardV2.displayName = 'DashboardV2';

export default DashboardV2;