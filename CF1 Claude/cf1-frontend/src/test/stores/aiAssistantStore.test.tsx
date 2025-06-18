import { describe, it, expect, beforeEach } from 'vitest';
import { useAIAssistantStore } from '../../store/aiAssistantStore';

describe('AI Assistant Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useAIAssistantStore.getState();
    useAIAssistantStore.setState({
      insights: [],
      riskAlerts: [],
      performanceRecommendations: [],
      contentSuggestions: [],
      chatHistory: [],
      isProcessing: false,
      subscriptionTier: 'free',
      usageStats: {
        dailyQueries: 0,
        monthlyQueries: 0,
        lastReset: new Date().toISOString()
      }
    });
  });

  it('should initialize with default state', () => {
    // Get fresh store instance without reset
    const store = useAIAssistantStore.getState();
    
    expect(store.subscriptionTier).toBe('free');
    expect(store.insights).toBeDefined();
    expect(store.riskAlerts).toBeDefined();
    expect(store.chatHistory).toHaveLength(0); // Should start empty
    expect(store.isProcessing).toBe(false);
    expect(store.preferences).toBeDefined();
    expect(store.usageStats).toBeDefined();
  });

  it('should update subscription tier', () => {
    const { upgradeSubscription } = useAIAssistantStore.getState();
    
    upgradeSubscription('premium');
    
    const store = useAIAssistantStore.getState();
    expect(store.subscriptionTier).toBe('premium');
  });

  it('should acknowledge risk alerts', () => {
    const store = useAIAssistantStore.getState();
    const firstRisk = store.riskAlerts[0];
    
    if (firstRisk) {
      const { acknowledgeRisk } = store;
      acknowledgeRisk(firstRisk.id);
      
      const updatedStore = useAIAssistantStore.getState();
      const updatedRisk = updatedStore.riskAlerts.find(r => r.id === firstRisk.id);
      expect(updatedRisk?.acknowledged).toBe(true);
    }
  });

  it('should dismiss insights', () => {
    const store = useAIAssistantStore.getState();
    const initialInsightCount = store.insights.length;
    const firstInsight = store.insights[0];
    
    if (firstInsight) {
      const { dismissInsight } = store;
      dismissInsight(firstInsight.id);
      
      const updatedStore = useAIAssistantStore.getState();
      expect(updatedStore.insights).toHaveLength(initialInsightCount - 1);
      expect(updatedStore.insights.find(i => i.id === firstInsight.id)).toBeUndefined();
    }
  });

  it('should update preferences', () => {
    const { updatePreferences } = useAIAssistantStore.getState();
    
    updatePreferences({
      enableRealTimeInsights: false,
      riskAlertThreshold: 'high'
    });
    
    const store = useAIAssistantStore.getState();
    expect(store.preferences.enableRealTimeInsights).toBe(false);
    expect(store.preferences.riskAlertThreshold).toBe('high');
  });

  it('should handle asset analysis', async () => {
    const { analyzeAsset } = useAIAssistantStore.getState();
    
    expect(useAIAssistantStore.getState().isProcessing).toBe(false);
    
    const analysisPromise = analyzeAsset('test-asset-id');
    expect(useAIAssistantStore.getState().isProcessing).toBe(true);
    
    await analysisPromise;
    
    const store = useAIAssistantStore.getState();
    expect(store.isProcessing).toBe(false);
    expect(store.usageStats.dailyQueries).toBe(1);
    expect(store.usageStats.monthlyQueries).toBe(1);
  });

  it('should clear chat history', () => {
    const { sendChatMessage, clearChatHistory } = useAIAssistantStore.getState();
    
    // Add a message first
    sendChatMessage('test message');
    
    // Verify message was added
    let store = useAIAssistantStore.getState();
    expect(store.chatHistory.length).toBeGreaterThan(0);
    
    // Clear history
    clearChatHistory();
    
    store = useAIAssistantStore.getState();
    expect(store.chatHistory).toHaveLength(0);
  });

  it('should export insights', () => {
    const { exportInsights } = useAIAssistantStore.getState();
    
    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = vi.fn(() => 'mock-url');
    const mockRevokeObjectURL = vi.fn();
    const mockClick = vi.fn();
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick
    };
    
    // Mock global objects
    global.URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL
    } as any;
    
    global.document = {
      createElement: vi.fn(() => mockAnchor)
    } as any;
    
    exportInsights();
    
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
  });

  it('should validate premium features access', () => {
    const store = useAIAssistantStore.getState();
    
    // For free tier, premium features should be blocked
    expect(store.subscriptionTier).toBe('free');
    expect(store.premiumFeatures).toContain('market_insights');
    expect(store.premiumFeatures).toContain('content_generation');
    
    // Upgrade to premium
    store.upgradeSubscription('premium');
    const premiumStore = useAIAssistantStore.getState();
    expect(premiumStore.subscriptionTier).toBe('premium');
  });

  it('should manage usage statistics correctly', async () => {
    const { analyzeAsset } = useAIAssistantStore.getState();
    
    // Initial state
    expect(useAIAssistantStore.getState().usageStats.dailyQueries).toBe(0);
    
    // Perform multiple analyses
    await analyzeAsset('asset-1');
    await analyzeAsset('asset-2');
    
    const store = useAIAssistantStore.getState();
    expect(store.usageStats.dailyQueries).toBe(2);
    expect(store.usageStats.monthlyQueries).toBe(2);
  });
});