import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEnhancedDashboardStore } from '../../store/enhancedDashboardStore';
import { mockDashboardWidgets } from '../mocks/enhancedMockData';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('EnhancedDashboardStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    expect(result.current.widgets).toEqual([]);
    expect(result.current.currentRole).toBe('investor');
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.currentTheme.id).toBe('default');
    expect(result.current.isLoading).toBe(false);
  });

  it('should load dashboard for specific role', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    await act(async () => {
      await result.current.loadDashboardForRole('creator');
    });

    expect(result.current.currentRole).toBe('creator');
    expect(result.current.widgets.length).toBeGreaterThan(0);
    
    // Should only contain widgets allowed for creator role
    const creatorWidgets = result.current.widgets.filter(widget => 
      widget.allowedRoles.includes('creator')
    );
    expect(result.current.widgets).toEqual(creatorWidgets);
  });

  it('should filter widgets by role correctly', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    // Load admin dashboard
    await act(async () => {
      await result.current.loadDashboardForRole('admin');
    });

    const adminWidgets = result.current.widgets;
    
    // Switch to investor role
    await act(async () => {
      await result.current.switchRole('investor');
    });

    const investorWidgets = result.current.widgets;
    
    // Should have different widgets for different roles
    expect(adminWidgets).not.toEqual(investorWidgets);
    
    // All investor widgets should allow investor role
    investorWidgets.forEach(widget => {
      expect(widget.allowedRoles).toContain('investor');
    });
  });

  it('should toggle edit mode', () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    expect(result.current.isEditMode).toBe(false);
    
    act(() => {
      result.current.toggleEditMode();
    });
    
    expect(result.current.isEditMode).toBe(true);
    
    act(() => {
      result.current.toggleEditMode();
    });
    
    expect(result.current.isEditMode).toBe(false);
  });

  it('should add widget to dashboard', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    const initialWidgetCount = result.current.widgets.length;
    
    await act(async () => {
      await result.current.addWidget('marketplace', 'medium', ['investor', 'creator']);
    });
    
    expect(result.current.widgets.length).toBe(initialWidgetCount + 1);
    
    const newWidget = result.current.widgets[result.current.widgets.length - 1];
    expect(newWidget.type).toBe('marketplace');
    expect(newWidget.size).toBe('medium');
    expect(newWidget.allowedRoles).toEqual(['investor', 'creator']);
    expect(newWidget.isVisible).toBe(true);
  });

  it('should remove widget from dashboard', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    // Add a widget first
    await act(async () => {
      await result.current.addWidget('portfolio', 'large', ['investor']);
    });
    
    const widgetToRemove = result.current.widgets[result.current.widgets.length - 1];
    const initialCount = result.current.widgets.length;
    
    await act(async () => {
      await result.current.removeWidget(widgetToRemove.id);
    });
    
    expect(result.current.widgets.length).toBe(initialCount - 1);
    expect(result.current.widgets.find(w => w.id === widgetToRemove.id)).toBeUndefined();
  });

  it('should update widget configuration', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    // Add a widget first
    await act(async () => {
      await result.current.addWidget('analytics', 'medium', ['investor']);
    });
    
    const widget = result.current.widgets[result.current.widgets.length - 1];
    const newConfig = {
      showBenchmark: true,
      timeRange: '1Y',
      includeDividends: false
    };
    
    await act(async () => {
      await result.current.updateWidgetConfiguration(widget.id, newConfig);
    });
    
    const updatedWidget = result.current.widgets.find(w => w.id === widget.id);
    expect(updatedWidget?.settings).toEqual(newConfig);
  });

  it('should reorder widgets', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    // Add multiple widgets
    await act(async () => {
      await result.current.addWidget('marketplace', 'medium', ['investor']);
      await result.current.addWidget('portfolio', 'large', ['investor']);
      await result.current.addWidget('analytics', 'small', ['investor']);
    });
    
    const widgets = result.current.widgets;
    const firstWidget = widgets[0];
    const lastWidget = widgets[widgets.length - 1];
    
    // Move first widget to last position
    await act(async () => {
      await result.current.reorderWidgets(firstWidget.id, widgets.length - 1);
    });
    
    const reorderedWidgets = result.current.widgets;
    expect(reorderedWidgets[reorderedWidgets.length - 1].id).toBe(firstWidget.id);
    expect(reorderedWidgets[0].id).not.toBe(firstWidget.id);
  });

  it('should toggle widget visibility', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    // Add a widget
    await act(async () => {
      await result.current.addWidget('notifications', 'medium', ['investor']);
    });
    
    const widget = result.current.widgets[result.current.widgets.length - 1];
    expect(widget.isVisible).toBe(true);
    
    await act(async () => {
      await result.current.toggleWidgetVisibility(widget.id);
    });
    
    const updatedWidget = result.current.widgets.find(w => w.id === widget.id);
    expect(updatedWidget?.isVisible).toBe(false);
    
    await act(async () => {
      await result.current.toggleWidgetVisibility(widget.id);
    });
    
    const retoggledWidget = result.current.widgets.find(w => w.id === widget.id);
    expect(retoggledWidget?.isVisible).toBe(true);
  });

  it('should resize widget', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    // Add a widget
    await act(async () => {
      await result.current.addWidget('quickActions', 'small', ['investor']);
    });
    
    const widget = result.current.widgets[result.current.widgets.length - 1];
    expect(widget.size).toBe('small');
    
    await act(async () => {
      await result.current.resizeWidget(widget.id, 'large');
    });
    
    const resizedWidget = result.current.widgets.find(w => w.id === widget.id);
    expect(resizedWidget?.size).toBe('large');
  });

  it('should update role-based metrics', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    const investorMetrics = {
      portfolioValue: 75000,
      totalReturns: 15.5,
      avgAPY: 9.2,
      assetsCount: 8,
      recentActivity: []
    };
    
    await act(async () => {
      await result.current.updateRoleMetrics('investor', investorMetrics);
    });
    
    expect(result.current.roleBasedMetrics.investor).toEqual(investorMetrics);
  });

  it('should apply dashboard theme', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    const customTheme = {
      id: 'dark',
      name: 'Dark Theme',
      colorScheme: 'dark' as const,
      primaryColor: '#1f2937',
      layout: 'grid' as const
    };
    
    await act(async () => {
      await result.current.applyTheme(customTheme);
    });
    
    expect(result.current.currentTheme).toEqual(customTheme);
  });

  it('should reset dashboard to defaults', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    // Modify dashboard state
    await act(async () => {
      await result.current.addWidget('marketplace', 'large', ['investor']);
      result.current.toggleEditMode();
      await result.current.switchRole('creator');
    });
    
    // Verify state is modified
    expect(result.current.widgets.length).toBeGreaterThan(0);
    expect(result.current.isEditMode).toBe(true);
    expect(result.current.currentRole).toBe('creator');
    
    // Reset to defaults
    await act(async () => {
      await result.current.resetToDefaults();
    });
    
    expect(result.current.widgets.length).toBe(0);
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.currentRole).toBe('investor');
    expect(result.current.currentTheme.id).toBe('default');
  });

  it('should persist dashboard state to localStorage', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    await act(async () => {
      await result.current.addWidget('portfolio', 'medium', ['investor']);
      result.current.toggleEditMode();
    });
    
    // Should have called localStorage.setItem
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should load dashboard state from localStorage', () => {
    const savedState = {
      widgets: [
        {
          id: 'saved-widget-1',
          type: 'marketplace',
          size: 'large',
          position: 0,
          isVisible: true,
          allowedRoles: ['investor'],
          settings: {},
          refreshInterval: 300
        }
      ],
      currentRole: 'creator',
      isEditMode: true,
      currentTheme: { id: 'dark', name: 'Dark', colorScheme: 'dark', primaryColor: '#000', layout: 'grid' }
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
    
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    expect(result.current.widgets).toEqual(savedState.widgets);
    expect(result.current.currentRole).toBe(savedState.currentRole);
    expect(result.current.isEditMode).toBe(savedState.isEditMode);
    expect(result.current.currentTheme).toEqual(savedState.currentTheme);
  });

  it('should handle widget refresh intervals', async () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    // Add widget with refresh interval
    await act(async () => {
      await result.current.addWidget('analytics', 'medium', ['investor']);
    });
    
    const widget = result.current.widgets[result.current.widgets.length - 1];
    
    // Update refresh interval
    await act(async () => {
      await result.current.updateWidgetConfiguration(widget.id, { refreshInterval: 60 });
    });
    
    const updatedWidget = result.current.widgets.find(w => w.id === widget.id);
    expect(updatedWidget?.refreshInterval).toBe(60);
    
    vi.useRealTimers();
  });

  it('should validate widget constraints', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    // Try to add widget with invalid type
    await expect(
      act(async () => {
        await result.current.addWidget('invalidWidget' as any, 'medium', ['investor']);
      })
    ).rejects.toThrow();
    
    // Try to resize widget to invalid size
    await act(async () => {
      await result.current.addWidget('portfolio', 'medium', ['investor']);
    });
    
    const widget = result.current.widgets[result.current.widgets.length - 1];
    
    await expect(
      act(async () => {
        await result.current.resizeWidget(widget.id, 'invalidSize' as any);
      })
    ).rejects.toThrow();
  });

  it('should handle concurrent operations', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    // Perform multiple operations concurrently
    await act(async () => {
      await Promise.all([
        result.current.addWidget('marketplace', 'medium', ['investor']),
        result.current.addWidget('portfolio', 'large', ['investor']),
        result.current.addWidget('analytics', 'small', ['investor']),
        result.current.switchRole('creator'),
      ]);
    });
    
    expect(result.current.widgets.length).toBe(3);
    expect(result.current.currentRole).toBe('creator');
  });

  it('should cleanup on unmount', () => {
    const { result, unmount } = renderHook(() => useEnhancedDashboardStore());
    
    // Add some state
    act(() => {
      result.current.toggleEditMode();
    });
    
    expect(result.current.isEditMode).toBe(true);
    
    // Unmount should not throw errors
    expect(() => unmount()).not.toThrow();
  });

  it('should handle error states gracefully', async () => {
    const { result } = renderHook(() => useEnhancedDashboardStore());
    
    // Mock network error
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Try to load dashboard with network error
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    
    await act(async () => {
      await result.current.loadDashboardForRole('admin');
    });
    
    // Should handle error gracefully without crashing
    expect(result.current.isLoading).toBe(false);
    expect(consoleError).toHaveBeenCalled();
    
    consoleError.mockRestore();
  });
});