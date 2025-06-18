import { describe, it, expect, beforeEach } from 'vitest';
import { useAIProposalAssistantStore } from '../../store/aiProposalAssistantStore';

describe('AI Proposal Assistant Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAIProposalAssistantStore.setState({
      isAnalyzing: false,
      currentAssetType: null,
      suggestions: [],
      marketData: null,
      validationResults: [],
      appliedSuggestions: new Set(),
      generatingField: null,
      lastGenerationTime: null,
      usageStats: {
        suggestionsGenerated: 0,
        suggestionsApplied: 0,
        templatesUsed: 0,
        lastUsed: new Date().toISOString()
      }
    });
  });

  it('should initialize with default state', () => {
    const store = useAIProposalAssistantStore.getState();
    
    expect(store.isAnalyzing).toBe(false);
    expect(store.currentAssetType).toBeNull();
    expect(store.suggestions).toHaveLength(0);
    expect(store.marketData).toBeNull();
    expect(store.validationResults).toHaveLength(0);
    expect(store.templates).toBeDefined();
    expect(store.preferences).toBeDefined();
    expect(store.preferences.enableAutoSuggestions).toBe(true);
  });

  it('should analyze proposal and generate suggestions', async () => {
    const { analyzeProposal } = useAIProposalAssistantStore.getState();
    
    const mockFormData = {
      assetType: 'real_estate',
      expectedAPY: '10',
      targetAmount: '5000000',
      fundingDays: 30,
      description: 'Short description'
    };

    expect(useAIProposalAssistantStore.getState().isAnalyzing).toBe(false);
    
    const analysisPromise = analyzeProposal(mockFormData);
    expect(useAIProposalAssistantStore.getState().isAnalyzing).toBe(true);
    
    await analysisPromise;
    
    const store = useAIProposalAssistantStore.getState();
    expect(store.isAnalyzing).toBe(false);
    expect(store.currentAssetType).toBe('real_estate');
    expect(store.marketData).toBeDefined();
    expect(store.marketData?.assetType).toBe('real_estate');
    expect(store.suggestions.length).toBeGreaterThan(0);
  });

  it('should generate market data for asset types', async () => {
    const { loadMarketData } = useAIProposalAssistantStore.getState();
    
    await loadMarketData('renewable_energy');
    
    const store = useAIProposalAssistantStore.getState();
    expect(store.marketData).toBeDefined();
    expect(store.marketData?.assetType).toBe('renewable_energy');
    expect(store.marketData?.averageAPY).toBe(12.3);
    expect(store.marketData?.successRate).toBe(0.81);
    expect(store.currentAssetType).toBe('renewable_energy');
  });

  it('should apply and dismiss suggestions', () => {
    const { applySuggestion, dismissSuggestion } = useAIProposalAssistantStore.getState();
    
    // Add a test suggestion
    useAIProposalAssistantStore.setState({
      suggestions: [{
        id: 'test_suggestion',
        field: 'expectedAPY',
        suggestion: '8.5',
        confidence: 0.85,
        reasoning: 'Test reasoning',
        applied: false
      }]
    });

    let store = useAIProposalAssistantStore.getState();
    expect(store.suggestions[0].applied).toBe(false);
    expect(store.usageStats.suggestionsApplied).toBe(0);

    applySuggestion('test_suggestion');

    store = useAIProposalAssistantStore.getState();
    expect(store.suggestions[0].applied).toBe(true);
    expect(store.usageStats.suggestionsApplied).toBe(1);
    expect(store.appliedSuggestions.has('test_suggestion')).toBe(true);

    dismissSuggestion('test_suggestion');

    store = useAIProposalAssistantStore.getState();
    expect(store.suggestions).toHaveLength(0);
  });

  it('should generate field content', async () => {
    const { generateFieldContent } = useAIProposalAssistantStore.getState();
    
    const context = { assetType: 'real_estate' };
    
    expect(useAIProposalAssistantStore.getState().generatingField).toBeNull();
    
    const contentPromise = generateFieldContent('description', context);
    expect(useAIProposalAssistantStore.getState().generatingField).toBe('description');
    
    const content = await contentPromise;
    
    const store = useAIProposalAssistantStore.getState();
    expect(store.generatingField).toBeNull();
    expect(store.lastGenerationTime).toBeDefined();
    expect(store.usageStats.suggestionsGenerated).toBe(1);
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(10);
  });

  it('should validate proposal data', () => {
    const { validateProposal } = useAIProposalAssistantStore.getState();
    
    const formData = {
      assetType: 'real_estate',
      expectedAPY: '20', // High APY
      targetAmount: '10000000', // High amount
      description: 'Short' // Too short
    };

    const validationResults = validateProposal(formData);
    
    expect(validationResults.length).toBeGreaterThan(0);
    
    // Should have APY warning
    const apyValidation = validationResults.find(r => r.field === 'expectedAPY');
    expect(apyValidation).toBeDefined();
    expect(apyValidation?.severity).toBe('warning');
    
    // Should have description error
    const descValidation = validationResults.find(r => r.field === 'description');
    expect(descValidation).toBeDefined();
    expect(descValidation?.severity).toBe('error');
  });

  it('should apply templates correctly', () => {
    const { applyTemplate, templates } = useAIProposalAssistantStore.getState();
    
    const template = templates[0];
    expect(template).toBeDefined();
    
    const templateData = applyTemplate(template.id);
    
    expect(templateData.assetType).toBe(template.assetType);
    expect(templateData.category).toBe(template.category);
    expect(templateData.description).toBe(template.description);
    expect(templateData.expectedAPY).toBe(template.suggestedAPY.toString());
    
    const store = useAIProposalAssistantStore.getState();
    expect(store.usageStats.templatesUsed).toBe(1);
  });

  it('should optimize proposals', async () => {
    const { optimizeProposal } = useAIProposalAssistantStore.getState();
    
    const formData = {
      assetType: 'technology',
      expectedAPY: '15',
      targetAmount: '2000000'
    };

    expect(useAIProposalAssistantStore.getState().isAnalyzing).toBe(false);
    
    const optimizationPromise = optimizeProposal(formData);
    expect(useAIProposalAssistantStore.getState().isAnalyzing).toBe(true);
    
    const optimizations = await optimizationPromise;
    
    const store = useAIProposalAssistantStore.getState();
    expect(store.isAnalyzing).toBe(false);
    expect(optimizations).toBeDefined();
    expect(optimizations.length).toBeGreaterThan(0);
  });

  it('should update preferences', () => {
    const { updatePreferences } = useAIProposalAssistantStore.getState();
    
    const newPreferences = {
      enableAutoSuggestions: false,
      suggestionAggressiveness: 'conservative' as const
    };

    updatePreferences(newPreferences);

    const store = useAIProposalAssistantStore.getState();
    expect(store.preferences.enableAutoSuggestions).toBe(false);
    expect(store.preferences.suggestionAggressiveness).toBe('conservative');
  });

  it('should clear suggestions', () => {
    const { clearSuggestions } = useAIProposalAssistantStore.getState();
    
    // Add test suggestions
    useAIProposalAssistantStore.setState({
      suggestions: [{
        id: 'test1',
        field: 'expectedAPY',
        suggestion: '8.5',
        confidence: 0.85,
        reasoning: 'Test',
        applied: false
      }],
      appliedSuggestions: new Set(['test1'])
    });

    let store = useAIProposalAssistantStore.getState();
    expect(store.suggestions).toHaveLength(1);
    expect(store.appliedSuggestions.size).toBe(1);

    clearSuggestions();

    store = useAIProposalAssistantStore.getState();
    expect(store.suggestions).toHaveLength(0);
    expect(store.appliedSuggestions.size).toBe(0);
  });

  it('should reset usage stats', () => {
    const { resetUsageStats } = useAIProposalAssistantStore.getState();
    
    // Set some usage stats
    useAIProposalAssistantStore.setState({
      usageStats: {
        suggestionsGenerated: 10,
        suggestionsApplied: 5,
        templatesUsed: 2,
        lastUsed: '2023-01-01'
      }
    });

    let store = useAIProposalAssistantStore.getState();
    expect(store.usageStats.suggestionsGenerated).toBe(10);

    resetUsageStats();

    store = useAIProposalAssistantStore.getState();
    expect(store.usageStats.suggestionsGenerated).toBe(0);
    expect(store.usageStats.suggestionsApplied).toBe(0);
    expect(store.usageStats.templatesUsed).toBe(0);
  });

  it('should handle different asset types correctly', async () => {
    const { loadMarketData } = useAIProposalAssistantStore.getState();
    
    // Test different asset types
    const assetTypes = ['real_estate', 'renewable_energy', 'technology', 'commodities'];
    
    for (const assetType of assetTypes) {
      await loadMarketData(assetType as any);
      
      const store = useAIProposalAssistantStore.getState();
      expect(store.marketData?.assetType).toBe(assetType);
      expect(store.marketData?.averageAPY).toBeGreaterThan(0);
      expect(store.marketData?.successRate).toBeGreaterThan(0);
      expect(store.marketData?.medianFundingAmount).toBeGreaterThan(0);
    }
  });

  it('should generate appropriate suggestions based on form data', async () => {
    const { generateSuggestions } = useAIProposalAssistantStore.getState();
    
    const formData = {
      assetType: 'renewable_energy',
      expectedAPY: '', // Empty APY should trigger suggestion
      targetAmount: '', // Empty amount should trigger suggestion
      description: 'Short' // Short description should trigger suggestion
    };

    await generateSuggestions('renewable_energy', formData);

    const store = useAIProposalAssistantStore.getState();
    expect(store.suggestions.length).toBeGreaterThan(0);
    
    // Should suggest APY
    const apySuggestion = store.suggestions.find(s => s.field === 'expectedAPY');
    expect(apySuggestion).toBeDefined();
    expect(apySuggestion?.suggestion).toBe('12.3'); // renewable_energy average
    
    // Should suggest funding amount
    const amountSuggestion = store.suggestions.find(s => s.field === 'targetAmount');
    expect(amountSuggestion).toBeDefined();
    
    // Should suggest description
    const descSuggestion = store.suggestions.find(s => s.field === 'description');
    expect(descSuggestion).toBeDefined();
  });
});