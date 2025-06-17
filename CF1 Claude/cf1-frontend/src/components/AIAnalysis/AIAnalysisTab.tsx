/**
 * CF1 Frontend - AI Analysis Tab Component
 * Displays AI-generated proposal analysis with legal disclaimer
 */

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Shield
} from 'lucide-react';
import { aiAnalysisService, AIAnalysisResult } from '../../services/aiAnalysis';

interface AIAnalysisTabProps {
  proposalId: string;
  className?: string;
}

export const AIAnalysisTab: React.FC<AIAnalysisTabProps> = ({ 
  proposalId, 
  className = '' 
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [proposalId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await aiAnalysisService.getAnalysis(proposalId);
      
      if (result) {
        setAnalysis(result);
        
        // If analysis is still processing, start polling
        if (result.status === 'pending' || result.status === 'in_progress') {
          startPolling();
        }
      } else {
        setError('Analysis not found for this proposal');
      }
    } catch (err) {
      setError('Failed to load AI analysis');
      console.error('Error loading analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = async () => {
    if (polling) return;
    
    setPolling(true);
    
    try {
      const result = await aiAnalysisService.pollForCompletion(
        proposalId,
        (updatedAnalysis) => {
          setAnalysis(updatedAnalysis);
        },
        20, // max 20 attempts
        10000 // poll every 10 seconds
      );
      
      if (result) {
        setAnalysis(result);
      }
    } catch (err) {
      console.error('Polling error:', err);
    } finally {
      setPolling(false);
    }
  };

  const getComplexityColor = (score: number): string => {
    if (score <= 3) return 'text-green-600 bg-green-100';
    if (score <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getComplexityLabel = (score: number): string => {
    if (score <= 3) return 'Simple';
    if (score <= 6) return 'Moderate';
    return 'Complex';
  };

  const renderLegalDisclaimer = () => (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Important Legal Disclaimer
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
            This analysis is AI-generated and for informational purposes only. It is not financial 
            advice, and it may contain errors or omissions. Please conduct your own research and 
            consult with a professional financial advisor before making any investment decisions.
          </p>
        </div>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Loading AI Analysis
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Retrieving analysis results...
        </p>
      </div>
    </div>
  );

  const renderProcessingState = () => (
    <div className="text-center py-12">
      <div className="relative">
        <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Analysis in Progress
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Our AI is analyzing the proposal documents. This usually takes 1-3 minutes.
      </p>
      {polling && (
        <div className="inline-flex items-center space-x-2 text-sm text-blue-600">
          <Clock className="w-4 h-4" />
          <span>Checking for updates...</span>
        </div>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Analysis Unavailable
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {error || 'The AI analysis could not be completed.'}
      </p>
      <button
        onClick={loadAnalysis}
        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );

  const renderComplexityGauge = (score: number) => {
    const percentage = (score / 10) * 100;
    const colorClass = getComplexityColor(score);
    
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Complexity Score
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
            {getComplexityLabel(score)}
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                score <= 3 ? 'bg-green-500' : score <= 6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>1 - Simple</span>
            <span>5 - Moderate</span>
            <span>10 - Complex</span>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{score}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">out of 10</div>
        </div>
      </div>
    );
  };

  const renderAnalysisResults = () => {
    if (!analysis || analysis.status !== 'completed') return null;

    return (
      <div className="space-y-6">
        {/* Summary Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Executive Summary
            </h3>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {analysis.summary}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Potential Strengths */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Potential Strengths
              </h3>
            </div>
            <ul className="space-y-3">
              {analysis.potentialStrengths?.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {strength}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Consideration */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingDown className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Areas for Consideration
              </h3>
            </div>
            <ul className="space-y-3">
              {analysis.areasForConsideration?.map((consideration, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {consideration}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Complexity Score */}
          {analysis.complexityScore && renderComplexityGauge(analysis.complexityScore)}
        </div>

        {/* Analysis Metadata */}
        {analysis.processingTimeSeconds && (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Analysis completed in {analysis.processingTimeSeconds}s</span>
              <span>Generated on {new Date(analysis.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={className}>
        {renderLegalDisclaimer()}
        {renderLoadingState()}
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className={className}>
        {renderLegalDisclaimer()}
        {renderErrorState()}
      </div>
    );
  }

  if (analysis.status === 'failed') {
    return (
      <div className={className}>
        {renderLegalDisclaimer()}
        {renderErrorState()}
      </div>
    );
  }

  if (analysis.status === 'pending' || analysis.status === 'in_progress') {
    return (
      <div className={className}>
        {renderLegalDisclaimer()}
        {renderProcessingState()}
      </div>
    );
  }

  return (
    <div className={className}>
      {renderLegalDisclaimer()}
      {renderAnalysisResults()}
    </div>
  );
};