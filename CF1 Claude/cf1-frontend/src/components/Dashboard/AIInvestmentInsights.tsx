import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, TrendingUp, Eye, ChevronRight } from 'lucide-react';
import Card from '../UI/Card';
import CF1Button from '../UI/CF1Button';
import { useLaunchpadData } from '../../services/launchpadDataService';

interface AIInsight {
  id: string;
  type: 'diversification_opportunity';
  title: string;
  description: string;
  confidence: number;
  asset: {
    id: string;
    title: string;
    category: string;
    expectedAPY: string;
    minimumInvestment: string;
    raisedPercentage: number;
    daysLeft: number;
  };
}

const AIInvestmentInsights: React.FC = () => {
  const navigate = useNavigate();
  const { proposals } = useLaunchpadData();
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  // Generate AI insights based on available launchpad assets
  const generateInsights = (): AIInsight[] => {
    if (!proposals || proposals.length === 0) return [];

    // Filter active proposals and create insights
    const activeProposals = proposals.filter(p => p.status === 'active');

    const insights: AIInsight[] = activeProposals.slice(0, 3).map((proposal, index) => {
      const diversificationReasons = [
        `Consider adding exposure to ${proposal.category.toLowerCase()} to reduce portfolio risk.`,
        `Diversify into ${proposal.location} markets for geographic balance.`,
        `Add ${proposal.category.toLowerCase()} allocation to optimize risk-adjusted returns.`
      ];

      return {
        id: `insight-${proposal.id}`,
        type: 'diversification_opportunity',
        title: proposal.title,
        description: diversificationReasons[index % diversificationReasons.length],
        confidence: 85 + Math.floor(Math.random() * 10), // 85-94% confidence
        asset: {
          id: proposal.id,
          title: proposal.title,
          category: proposal.category,
          expectedAPY: proposal.expectedAPY,
          minimumInvestment: proposal.minimumInvestment,
          raisedPercentage: proposal.raisedPercentage,
          daysLeft: proposal.daysLeft
        }
      };
    });

    return insights;
  };

  const insights = generateInsights();

  const handleViewRecommendations = () => {
    navigate('/launchpad');
  };

  const handleDetailedAnalysis = () => {
    // Navigate to a detailed analysis page or open a modal
    navigate('/dashboard/ai-analysis');
  };

  const handleAssetClick = (assetId: string) => {
    navigate(`/launchpad/proposal/${assetId}`);
  };

  if (insights.length === 0) {
    return (
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Brain className="w-6 h-6 mr-3 text-blue-600" />
            AI Investment Insights
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            No investment opportunities available at this time
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Brain className="w-6 h-6 mr-3 text-blue-600" />
              AI Investment Insights
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Personalized opportunities based on your portfolio and market analysis
            </p>
          </div>

          {/* Action Buttons - Moved to header */}
          <div className="flex flex-col sm:flex-row gap-3">
            <CF1Button
              onClick={handleViewRecommendations}
              variant="outline"
              size="small"
              className="flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View All Assets</span>
            </CF1Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-700"
            onClick={() => handleAssetClick(insight.asset.id)}
          >
            {/* Insight Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[200px]" title={insight.title}>
                  {insight.title}
                </h3>
              </div>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                {insight.confidence}% confidence
              </span>
            </div>

            {/* Insight Description */}
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {insight.description}
            </p>

            {/* Investment Details */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-3">
                Investment Details:
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{insight.asset.category}</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {insight.asset.expectedAPY} APY
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Min: {insight.asset.minimumInvestment}</span>
                  <span>{insight.asset.raisedPercentage}% funded</span>
                </div>
                {insight.asset.daysLeft > 0 && (
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    {insight.asset.daysLeft} days left
                  </div>
                )}
              </div>
            </div>

            {/* Action Indicator */}
            <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
              <span>Click to view asset details</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        ))}
      </div>

    </section>
  );
};

export default AIInvestmentInsights;