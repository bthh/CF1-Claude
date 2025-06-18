import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Zap,
  Target,
  FileText,
  BarChart3,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Bot,
  ArrowRight,
  Info,
  Wand2
} from 'lucide-react';
import { useAIProposalAssistantStore, ProposalSuggestion, ValidationResult } from '../../store/aiProposalAssistantStore';
import { formatAmount, formatPercentage } from '../../utils/format';

interface AIProposalAssistantProps {
  formData: any;
  onSuggestionApply: (field: string, value: string) => void;
  onFieldGenerate: (field: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const AIProposalAssistant: React.FC<AIProposalAssistantProps> = ({
  formData,
  onSuggestionApply,
  onFieldGenerate,
  isVisible,
  onToggle
}) => {
  const {
    isAnalyzing,
    suggestions,
    marketData,
    validationResults,
    templates,
    generatingField,
    preferences,
    usageStats,
    analyzeProposal,
    generateSuggestions,
    applySuggestion,
    dismissSuggestion,
    generateFieldContent,
    loadMarketData,
    validateProposal,
    applyTemplate,
    optimizeProposal,
    clearSuggestions
  } = useAIProposalAssistantStore();

  const [activeTab, setActiveTab] = useState<'suggestions' | 'market' | 'validation' | 'templates'>('suggestions');
  const [showOptimizations, setShowOptimizations] = useState(false);

  // Auto-analyze when form data changes
  useEffect(() => {
    if (formData.assetType && preferences.enableAutoSuggestions) {
      const timer = setTimeout(() => {
        analyzeProposal(formData);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [formData.assetType, formData.expectedAPY, formData.targetAmount]);

  const handleApplySuggestion = async (suggestion: ProposalSuggestion) => {
    applySuggestion(suggestion.id);
    onSuggestionApply(suggestion.field, suggestion.suggestion);
  };

  const handleGenerateContent = async (field: string) => {
    try {
      const content = await generateFieldContent(field, formData);
      onFieldGenerate(field);
      onSuggestionApply(field, content);
    } catch (error) {
      console.error('Failed to generate content:', error);
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    const templateData = applyTemplate(templateId);
    Object.entries(templateData).forEach(([field, value]) => {
      onSuggestionApply(field, value as string);
    });
  };

  const getValidationColor = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'warning': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getSuggestionIcon = (field: string) => {
    switch (field) {
      case 'expectedAPY': return <BarChart3 className="w-4 h-4" />;
      case 'targetAmount': return <Target className="w-4 h-4" />;
      case 'fundingDays': return <Clock className="w-4 h-4" />;
      case 'description': return <FileText className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const activeSuggestions = suggestions.filter(s => !s.applied);
  const unreadValidations = validationResults.filter(v => !v.isValid);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 bottom-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <Brain className="w-6 h-6" />
        {(activeSuggestions.length > 0 || unreadValidations.length > 0) && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeSuggestions.length + unreadValidations.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 top-4 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {usageStats.suggestionsGenerated} suggestions generated
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isAnalyzing && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => analyzeProposal(formData)}
            disabled={!formData.assetType || isAnalyzing}
            className="flex items-center space-x-2 p-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50"
          >
            <Brain className="w-3 h-3" />
            <span>Analyze</span>
          </button>
          
          <button
            onClick={() => setShowOptimizations(!showOptimizations)}
            disabled={!formData.assetType}
            className="flex items-center space-x-2 p-2 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50"
          >
            <Zap className="w-3 h-3" />
            <span>Optimize</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'suggestions', label: 'Ideas', count: activeSuggestions.length },
          { id: 'market', label: 'Market', count: 0 },
          { id: 'validation', label: 'Check', count: unreadValidations.length },
          { id: 'templates', label: 'Templates', count: 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-medium ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="p-4 space-y-3">
            {activeSuggestions.length > 0 ? (
              activeSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSuggestionIcon(suggestion.field)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.field === 'expectedAPY' ? 'Expected APY' :
                         suggestion.field === 'targetAmount' ? 'Target Amount' :
                         suggestion.field === 'fundingDays' ? 'Funding Timeline' :
                         suggestion.field.charAt(0).toUpperCase() + suggestion.field.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {suggestion.reasoning}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Suggest: {suggestion.field === 'targetAmount' ? formatAmount(parseInt(suggestion.suggestion)) : suggestion.suggestion}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApplySuggestion(suggestion)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => dismissSuggestion(suggestion.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No suggestions yet</p>
                <p className="text-xs">Add asset type to get AI suggestions</p>
              </div>
            )}

            {/* Content Generation */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Content
              </h4>
              <div className="space-y-2">
                {['description', 'riskFactors', 'useOfFunds'].map((field) => (
                  <button
                    key={field}
                    onClick={() => handleGenerateContent(field)}
                    disabled={generatingField === field || !formData.assetType}
                    className="w-full flex items-center justify-between p-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                  >
                    <span>
                      {field === 'riskFactors' ? 'Risk Factors' :
                       field === 'useOfFunds' ? 'Use of Funds' :
                       'Description'}
                    </span>
                    {generatingField === field ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                    ) : (
                      <ArrowRight className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Market Tab */}
        {activeTab === 'market' && (
          <div className="p-4">
            {marketData ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {formData.assetType?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Market
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Avg APY:</span>
                      <span className="font-medium text-gray-900 dark:text-white ml-2">
                        {formatPercentage(marketData.averageAPY / 100)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
                      <span className="font-medium text-gray-900 dark:text-white ml-2">
                        {formatPercentage(marketData.successRate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Median Funding:</span>
                      <span className="font-medium text-gray-900 dark:text-white ml-2">
                        {formatAmount(marketData.medianFundingAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                      <span className="font-medium text-gray-900 dark:text-white ml-2">
                        {marketData.typicalFundingDays} days
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Market Trends</h4>
                  <div className="space-y-2">
                    {marketData.marketTrends.map((trend, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">{trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No market data</p>
                <p className="text-xs">Select asset type to view market insights</p>
              </div>
            )}
          </div>
        )}

        {/* Validation Tab */}
        {activeTab === 'validation' && (
          <div className="p-4 space-y-3">
            {validationResults.length > 0 ? (
              validationResults.map((result, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-3 ${getValidationColor(result.severity)}`}
                >
                  <div className="flex items-start space-x-2">
                    {result.severity === 'error' ? <AlertTriangle className="w-4 h-4 mt-0.5" /> :
                     result.severity === 'warning' ? <AlertTriangle className="w-4 h-4 mt-0.5" /> :
                     <Info className="w-4 h-4 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{result.message}</p>
                      {result.suggestion && (
                        <p className="text-xs mt-1 opacity-75">{result.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All validations passed</p>
                <p className="text-xs">Your proposal looks good!</p>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="p-4 space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {template.category} • {formatPercentage(template.suggestedAPY / 100)} APY
                    </p>
                  </div>
                  <button
                    onClick={() => handleApplyTemplate(template.id)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Use Template
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {template.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {activeSuggestions.length} suggestions • {usageStats.suggestionsApplied} applied
          </span>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>AI Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProposalAssistant;