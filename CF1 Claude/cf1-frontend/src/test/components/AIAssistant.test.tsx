import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAIAssistantStore } from '../../store/aiAssistantStore';
import AIAssistantInterface from '../../components/AIAssistant/AIAssistantInterface';

// Mock the AI Assistant store
vi.mock('../../store/aiAssistantStore', () => ({
  useAIAssistantStore: vi.fn()
}));

// Mock the notifications hook
vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }))
}));

const mockUseAIAssistantStore = vi.mocked(useAIAssistantStore);

describe('AIAssistantInterface', () => {
  const mockStoreState = {
    subscriptionTier: 'free' as const,
    premiumFeatures: ['market_insights', 'content_generation'],
    insights: [
      {
        id: 'test-insight-1',
        type: 'asset_analysis' as const,
        title: 'Test Insight',
        description: 'This is a test insight',
        priority: 'medium' as const,
        actionable: true,
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 0.85,
          impact: 'medium' as const,
          timeframe: '30 days',
          category: 'performance'
        }
      }
    ],
    riskAlerts: [],
    performanceRecommendations: [],
    contentSuggestions: [],
    chatHistory: [],
    isProcessing: false,
    preferences: {
      enableRealTimeInsights: true,
      riskAlertThreshold: 'medium' as const,
      autoGenerateContent: false,
      insightFrequency: 'weekly' as const,
      enabledFeatures: ['asset_analysis']
    },
    usageStats: {
      dailyQueries: 5,
      monthlyQueries: 150,
      lastReset: new Date().toISOString()
    },
    analyzeAsset: vi.fn(),
    generateMarketInsights: vi.fn(),
    createPerformanceRecommendations: vi.fn(),
    generateContent: vi.fn(),
    performRiskAssessment: vi.fn(),
    runComplianceCheck: vi.fn(),
    sendChatMessage: vi.fn(),
    acknowledgeRisk: vi.fn(),
    dismissInsight: vi.fn(),
    upgradeSubscription: vi.fn(),
    clearChatHistory: vi.fn()
  };

  beforeEach(() => {
    mockUseAIAssistantStore.mockReturnValue(mockStoreState);
  });

  it('renders AI Assistant interface correctly', () => {
    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    expect(screen.getByText('AI Creator Assistant')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('5/50 daily queries')).toBeInTheDocument();
  });

  it('displays upgrade button for free tier', () => {
    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    expect(screen.getByText('Upgrade')).toBeInTheDocument();
  });

  it('shows premium tier correctly', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      subscriptionTier: 'premium'
    });

    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.queryByText('Upgrade')).not.toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    expect(screen.getByText('Analyze')).toBeInTheDocument();
    expect(screen.getByText('Market')).toBeInTheDocument();
    expect(screen.getByText('Risk')).toBeInTheDocument();
    expect(screen.getByText('Optimize')).toBeInTheDocument();
  });

  it('calls analyze asset when analyze button is clicked', async () => {
    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);

    expect(mockStoreState.analyzeAsset).toHaveBeenCalledWith('test-asset-1');
  });

  it('displays insights correctly', () => {
    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    expect(screen.getByText('Test Insight')).toBeInTheDocument();
    expect(screen.getByText('This is a test insight')).toBeInTheDocument();
    expect(screen.getByText('85% confidence')).toBeInTheDocument();
  });

  it('shows tab navigation', () => {
    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Risks')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('switches tabs correctly', () => {
    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    const chatTab = screen.getByText('Chat');
    fireEvent.click(chatTab);

    expect(screen.getByPlaceholderText('Ask AI about your assets...')).toBeInTheDocument();
  });

  it('shows upgrade modal for premium features', async () => {
    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    const marketButton = screen.getByText('Market');
    fireEvent.click(marketButton);

    await waitFor(() => {
      expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
    });
  });

  it('dismisses insights correctly', () => {
    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);

    expect(mockStoreState.dismissInsight).toHaveBeenCalledWith('test-insight-1');
  });

  it('handles disabled state when no asset selected', () => {
    render(
      <React.Fragment>
        <AIAssistantInterface />
      </React.Fragment>
    );

    const analyzeButton = screen.getByText('Analyze');
    expect(analyzeButton).toBeDisabled();
  });

  it('shows processing state', () => {
    mockUseAIAssistantStore.mockReturnValue({
      ...mockStoreState,
      isProcessing: true
    });

    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    const buttons = screen.getAllByRole('button');
    const analyzeButton = buttons.find(button => button.textContent === 'Analyze');
    expect(analyzeButton).toBeDisabled();
  });

  it('renders in embedded mode', () => {
    render(
      <React.Fragment>
        <AIAssistantInterface 
          selectedAssetId="test-asset-1" 
          embedded={true}
        />
      </React.Fragment>
    );

    const container = screen.getByText('AI Creator Assistant').closest('div');
    expect(container).toHaveClass('h-96');
  });

  it('handles subscription upgrade', async () => {
    render(
      <AIAssistantInterface selectedAssetId="test-asset-1" />
    );

    const upgradeButton = screen.getByText('Upgrade');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
    });

    const upgradeNowButton = screen.getByText('Upgrade Now');
    fireEvent.click(upgradeNowButton);

    expect(mockStoreState.upgradeSubscription).toHaveBeenCalledWith('premium');
  });
});