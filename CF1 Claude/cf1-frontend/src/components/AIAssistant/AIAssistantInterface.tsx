import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Lightbulb,
  Shield,
  FileText,
  BarChart3,
  RefreshCw,
  Settings,
  Crown,
  Star,
  MessageCircle,
  Zap,
  Target,
  Brain,
  Filter,
  Download,
  X,
  ChevronRight,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useAIAssistantStore, AIInsight, RiskAlert, PerformanceRecommendation } from '../../store/aiAssistantStore';
import { formatTimeAgo, formatAmount } from '../../utils/format';
import { useNotifications } from '../../hooks/useNotifications';

interface AIAssistantInterfaceProps {
  selectedAssetId?: string;
  embedded?: boolean;
}

const AIAssistantInterface: React.FC<AIAssistantInterfaceProps> = ({ 
  selectedAssetId,
  embedded = false 
}) => {
  const {
    subscriptionTier,
    premiumFeatures,
    insights,
    riskAlerts,
    performanceRecommendations,
    contentSuggestions,
    chatHistory,
    isProcessing,
    preferences,
    usageStats,
    analyzeAsset,
    generateMarketInsights,
    createPerformanceRecommendations,
    generateContent,
    performRiskAssessment,
    runComplianceCheck,
    sendChatMessage,
    acknowledgeRisk,
    dismissInsight,
    upgradeSubscription,
    clearChatHistory
  } = useAIAssistantStore();
  
  const { success, error } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'insights' | 'chat' | 'recommendations' | 'risks' | 'content'>('insights');
  const [chatMessage, setChatMessage] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);
  
  const isPremiumFeature = (feature: string) => {
    return premiumFeatures.includes(feature as any) && subscriptionTier === 'free';
  };
  
  const handlePremiumAction = (action: () => Promise<void>, featureName: string) => {
    if (isPremiumFeature(featureName)) {
      setShowUpgradeModal(true);
      return;
    }
    
    action().catch((err) => {
      error(err.message || 'An error occurred');
    });
  };
  
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    try {
      await sendChatMessage(chatMessage, { assetId: selectedAssetId });
      setChatMessage('');
    } catch (err: any) {
      error(err.message);
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };
  
  const filteredInsights = insights.filter(insight => {
    if (selectedInsightType === 'all') return true;
    return insight.type === selectedInsightType;
  });
  
  const unacknowledgedRisks = riskAlerts.filter(risk => !risk.acknowledged);

  return (
    <div className={`${embedded ? 'h-96' : 'h-full'} flex flex-col bg-gray-50 dark:bg-gray-900 rounded-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Creator Assistant
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                subscriptionTier === 'premium' 
                  ? 'bg-gold-100 text-gold-800 dark:bg-gold-900/20 dark:text-gold-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
              </span>
              {subscriptionTier !== 'premium' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {usageStats.dailyQueries}/50 daily queries
          </span>
          {subscriptionTier === 'premium' && (
            <Sparkles className="w-4 h-4 text-gold-500" />
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            onClick={() => selectedAssetId && analyzeAsset(selectedAssetId)}
            disabled={!selectedAssetId || isProcessing}
            className="flex items-center space-x-2 p-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analyze</span>
          </button>
          
          <button
            onClick={() => handlePremiumAction(
              () => selectedAssetId ? generateMarketInsights(selectedAssetId, 'renewable') : Promise.resolve(),
              'market_insights'
            )}
            disabled={!selectedAssetId || isProcessing}
            className="flex items-center space-x-2 p-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 relative"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Market</span>
            {isPremiumFeature('market_insights') && (
              <Lock className="w-3 h-3 absolute -top-1 -right-1" />
            )}
          </button>
          
          <button
            onClick={() => selectedAssetId && performRiskAssessment(selectedAssetId)}
            disabled={!selectedAssetId || isProcessing}
            className="flex items-center space-x-2 p-2 text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 disabled:opacity-50"
          >
            <Shield className="w-4 h-4" />
            <span>Risk</span>
          </button>
          
          <button
            onClick={() => handlePremiumAction(
              () => selectedAssetId ? createPerformanceRecommendations(selectedAssetId) : Promise.resolve(),
              'performance_optimization'
            )}
            disabled={!selectedAssetId || isProcessing}
            className="flex items-center space-x-2 p-2 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 relative"
          >
            <Target className="w-4 h-4" />
            <span>Optimize</span>
            {isPremiumFeature('performance_optimization') && (
              <Lock className="w-3 h-3 absolute -top-1 -right-1" />
            )}
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {[
          { id: 'insights', label: 'Insights', icon: Lightbulb, count: filteredInsights.length },
          { id: 'chat', label: 'Chat', icon: MessageCircle, count: chatHistory.length },
          { id: 'recommendations', label: 'Actions', icon: Target, count: performanceRecommendations.length },
          { id: 'risks', label: 'Risks', icon: AlertTriangle, count: unacknowledgedRisks.length },
          { id: 'content', label: 'Content', icon: FileText, count: contentSuggestions.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="ml-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <select
                  value={selectedInsightType}
                  onChange={(e) => setSelectedInsightType(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700"
                >
                  <option value="all">All Insights</option>
                  <option value="asset_analysis">Asset Analysis</option>
                  <option value="market_insights">Market Insights</option>
                  <option value="risk_assessment">Risk Assessment</option>
                  <option value="performance_optimization">Performance</option>
                </select>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredInsights.length} insights
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(insight.timestamp)}
                        </span>
                        {insight.metadata?.confidence && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            {Math.round(insight.metadata.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {insight.title}
                      </h4>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {insight.description}
                      </p>
                      
                      {insight.actionable && (
                        <div className="flex items-center space-x-2">
                          <button className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30">
                            Take Action
                          </button>
                          <button
                            onClick={() => dismissInsight(insight.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <Brain className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  </div>
                </div>
              ))}
              
              {filteredInsights.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No insights available yet</p>
                  <p className="text-sm">Try analyzing an asset to get started</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {formatTimeAgo(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask AI about your assets..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || isProcessing}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Press Enter to send
                </span>
                <button
                  onClick={clearChatHistory}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Other tabs would be implemented similarly... */}
        {activeTab === 'recommendations' && (
          <div className="h-full overflow-y-auto p-4 space-y-3">
            {performanceRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full">
                        {rec.category}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        {rec.difficulty}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {rec.title}
                    </h4>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {rec.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Impact: {rec.expectedImpact}</span>
                      <span>Time: {rec.timeToImplement}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Priority {rec.priority}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
            
            {performanceRecommendations.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recommendations available</p>
                <p className="text-sm">Generate performance analysis to see recommendations</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'risks' && (
          <div className="h-full overflow-y-auto p-4 space-y-3">
            {riskAlerts.map((risk) => (
              <div
                key={risk.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(risk.severity)}`}>
                        {risk.severity} risk
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        {risk.category}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {risk.title}
                    </h4>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {risk.description}
                    </p>
                    
                    {risk.mitigation.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Recommended Actions:
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {risk.mitigation.map((action, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {!risk.acknowledged && (
                      <button
                        onClick={() => acknowledgeRisk(risk.id)}
                        className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/30"
                      >
                        Acknowledge Risk
                      </button>
                    )}
                  </div>
                  
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                    risk.severity === 'critical' ? 'text-red-500' : 
                    risk.severity === 'high' ? 'text-orange-500' :
                    risk.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                </div>
              </div>
            ))}
            
            {riskAlerts.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No risk alerts</p>
                <p className="text-sm">Your assets are operating within normal parameters</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-6 h-6 text-gold-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upgrade to Premium
                </h3>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Unlock advanced AI features including market insights, content generation, and compliance automation.
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Premium Features:
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Advanced market analysis</li>
                  <li>• AI content generation</li>
                  <li>• Performance optimization</li>
                  <li>• Compliance monitoring</li>
                  <li>• Unlimited AI queries</li>
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    upgradeSubscription('premium');
                    setShowUpgradeModal(false);
                    success('Upgraded to Premium! All features unlocked.');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  Upgrade Now
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistantInterface;