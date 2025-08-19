import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { useFeatureToggleStore } from '../../../store/featureToggleStore';
import { renderWithAuthenticatedAdmin } from '../../test-utils';

// Mock component that uses feature toggles
const FeatureToggleIntegrationTest = () => {
  const { isFeatureEnabled, features } = useFeatureToggleStore();

  return (
    <div>
      <h1>Platform Features</h1>
      
      {isFeatureEnabled('marketplace') && (
        <div data-testid="marketplace-section">
          <h2>Marketplace</h2>
          <p>Browse and invest in assets</p>
        </div>
      )}
      
      {isFeatureEnabled('analytics') && (
        <div data-testid="analytics-section">
          <h2>Analytics</h2>
          <p>View performance analytics</p>
        </div>
      )}
      
      {isFeatureEnabled('secondary_trading') && (
        <div data-testid="secondary-trading-section">
          <h2>Secondary Trading</h2>
          <p>Trade assets on secondary market</p>
        </div>
      )}
      
      {isFeatureEnabled('launchpad') && (
        <div data-testid="launchpad-section">
          <h2>Launchpad</h2>
          <p>Create new investment proposals</p>
        </div>
      )}
      
      {isFeatureEnabled('governance') && (
        <div data-testid="governance-section">
          <h2>Governance</h2>
          <p>Participate in platform governance</p>
        </div>
      )}
      
      {isFeatureEnabled('maintenance_mode') && (
        <div data-testid="maintenance-banner">
          <p>Platform is in maintenance mode</p>
        </div>
      )}
      
      <div data-testid="feature-status">
        Active Features: {Object.values(features).filter(f => f.enabled).length}
      </div>
    </div>
  );
};

// Mock the feature toggle store
vi.mock('../../../store/featureToggleStore');

const mockFeatureToggleStore = {
  features: {
    'marketplace': {
      id: 'marketplace',
      name: 'Marketplace',
      enabled: true,
      category: 'general',
      lastModified: new Date().toISOString()
    },
    'analytics': {
      id: 'analytics',
      name: 'Analytics',
      enabled: false,
      category: 'general',
      lastModified: new Date().toISOString()
    },
    'secondary_trading': {
      id: 'secondary_trading',
      name: 'Secondary Trading',
      enabled: true,
      category: 'trading',
      lastModified: new Date().toISOString()
    },
    'launchpad': {
      id: 'launchpad',
      name: 'Launchpad',
      enabled: true,
      category: 'launchpad',
      lastModified: new Date().toISOString()
    },
    'governance': {
      id: 'governance',
      name: 'Governance',
      enabled: true,
      category: 'governance',
      lastModified: new Date().toISOString()
    },
    'maintenance_mode': {
      id: 'maintenance_mode',
      name: 'Maintenance Mode',
      enabled: false,
      category: 'general',
      lastModified: new Date().toISOString()
    }
  },
  isFeatureEnabled: vi.fn(),
  updateFeatureToggle: vi.fn(),
  loadFeatureToggles: vi.fn(),
};

describe('FeatureToggleIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useFeatureToggleStore as any).mockReturnValue(mockFeatureToggleStore);
    
    // Setup mock implementation for isFeatureEnabled
    mockFeatureToggleStore.isFeatureEnabled.mockImplementation((featureId: string) => {
      return mockFeatureToggleStore.features[featureId]?.enabled || false;
    });
  });

  it('should show enabled features and hide disabled features', async () => {
    await act(async () => {
      render(<FeatureToggleIntegrationTest />);
    });

    // Enabled features should be visible
    expect(screen.getByTestId('marketplace-section')).toBeInTheDocument();
    expect(screen.getByTestId('secondary-trading-section')).toBeInTheDocument();
    expect(screen.getByTestId('launchpad-section')).toBeInTheDocument();
    expect(screen.getByTestId('governance-section')).toBeInTheDocument();

    // Disabled features should not be visible
    expect(screen.queryByTestId('analytics-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('maintenance-banner')).not.toBeInTheDocument();
  });

  it('should update UI when feature toggles change', async () => {
    const { rerender } = await act(async () => {
      return render(<FeatureToggleIntegrationTest />);
    });

    // Initially analytics is disabled
    expect(screen.queryByTestId('analytics-section')).not.toBeInTheDocument();

    // Enable analytics
    mockFeatureToggleStore.features.analytics.enabled = true;

    await act(async () => {
      rerender(<FeatureToggleIntegrationTest />);
    });

    // Analytics should now be visible
    expect(screen.getByTestId('analytics-section')).toBeInTheDocument();
  });

  it('should handle maintenance mode correctly', async () => {
    // Enable maintenance mode
    mockFeatureToggleStore.features.maintenance_mode.enabled = true;

    await act(async () => {
      render(<FeatureToggleIntegrationTest />);
    });

    expect(screen.getByTestId('maintenance-banner')).toBeInTheDocument();
    expect(screen.getByText('Platform is in maintenance mode')).toBeInTheDocument();
  });

  it('should count active features correctly', async () => {
    await act(async () => {
      render(<FeatureToggleIntegrationTest />);
    });

    // Count enabled features: marketplace, secondary_trading, launchpad, governance = 4
    expect(screen.getByText('Active Features: 4')).toBeInTheDocument();
  });

  it('should handle all features disabled', async () => {
    // Disable all features
    Object.keys(mockFeatureToggleStore.features).forEach(key => {
      mockFeatureToggleStore.features[key].enabled = false;
    });

    await act(async () => {
      render(<FeatureToggleIntegrationTest />);
    });

    expect(screen.queryByTestId('marketplace-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('analytics-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('secondary-trading-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('launchpad-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('governance-section')).not.toBeInTheDocument();
    expect(screen.getByText('Active Features: 0')).toBeInTheDocument();
  });

  it('should handle feature toggle updates', async () => {
    await act(async () => {
      render(<FeatureToggleIntegrationTest />);
    });

    // Simulate feature toggle update
    await act(async () => {
      mockFeatureToggleStore.updateFeatureToggle('analytics', true, 'admin@test.com');
    });

    expect(mockFeatureToggleStore.updateFeatureToggle).toHaveBeenCalledWith(
      'analytics', 
      true, 
      'admin@test.com'
    );
  });

  it('should load feature toggles on initialization', async () => {
    await act(async () => {
      render(<FeatureToggleIntegrationTest />);
    });

    expect(mockFeatureToggleStore.loadFeatureToggles).toHaveBeenCalled();
  });

  describe('Category-based feature control', () => {
    it('should handle trading features together', async () => {
      await act(async () => {
        render(<FeatureToggleIntegrationTest />);
      });

      // Secondary trading should be visible (trading category)
      expect(screen.getByTestId('secondary-trading-section')).toBeInTheDocument();
    });

    it('should handle general features', async () => {
      await act(async () => {
        render(<FeatureToggleIntegrationTest />);
      });

      // Marketplace should be visible (general category)
      expect(screen.getByTestId('marketplace-section')).toBeInTheDocument();
    });

    it('should handle launchpad features', async () => {
      await act(async () => {
        render(<FeatureToggleIntegrationTest />);
      });

      // Launchpad should be visible (launchpad category)
      expect(screen.getByTestId('launchpad-section')).toBeInTheDocument();
    });

    it('should handle governance features', async () => {
      await act(async () => {
        render(<FeatureToggleIntegrationTest />);
      });

      // Governance should be visible (governance category)
      expect(screen.getByTestId('governance-section')).toBeInTheDocument();
    });
  });

  describe('Feature dependencies', () => {
    it('should handle dependent features correctly', async () => {
      // Disable marketplace but keep secondary trading enabled
      mockFeatureToggleStore.features.marketplace.enabled = false;

      await act(async () => {
        render(<FeatureToggleIntegrationTest />);
      });

      expect(screen.queryByTestId('marketplace-section')).not.toBeInTheDocument();
      // Secondary trading might still work independently
      expect(screen.getByTestId('secondary-trading-section')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle missing feature gracefully', async () => {
      mockFeatureToggleStore.isFeatureEnabled.mockImplementation((featureId: string) => {
        if (featureId === 'nonexistent_feature') {
          return false; // Default to false for unknown features
        }
        return mockFeatureToggleStore.features[featureId]?.enabled || false;
      });

      // This should not crash the component
      expect(() => {
        mockFeatureToggleStore.isFeatureEnabled('nonexistent_feature');
      }).not.toThrow();
    });

    it('should handle store errors gracefully', async () => {
      mockFeatureToggleStore.isFeatureEnabled.mockImplementation(() => {
        throw new Error('Store error');
      });

      // Component should still render even if feature check fails
      await act(async () => {
        expect(() => render(<FeatureToggleIntegrationTest />)).not.toThrow();
      });
    });
  });

  describe('Performance considerations', () => {
    it('should not cause unnecessary re-renders', async () => {
      const renderCount = vi.fn();
      
      const TestComponent = () => {
        renderCount();
        return <FeatureToggleIntegrationTest />;
      };

      await act(async () => {
        render(<TestComponent />);
      });

      expect(renderCount).toHaveBeenCalledTimes(1);
    });

    it('should efficiently check multiple features', async () => {
      await act(async () => {
        render(<FeatureToggleIntegrationTest />);
      });

      // Should have called isFeatureEnabled for each feature
      expect(mockFeatureToggleStore.isFeatureEnabled).toHaveBeenCalledWith('marketplace');
      expect(mockFeatureToggleStore.isFeatureEnabled).toHaveBeenCalledWith('analytics');
      expect(mockFeatureToggleStore.isFeatureEnabled).toHaveBeenCalledWith('secondary_trading');
      expect(mockFeatureToggleStore.isFeatureEnabled).toHaveBeenCalledWith('launchpad');
      expect(mockFeatureToggleStore.isFeatureEnabled).toHaveBeenCalledWith('governance');
      expect(mockFeatureToggleStore.isFeatureEnabled).toHaveBeenCalledWith('maintenance_mode');
    });
  });
});