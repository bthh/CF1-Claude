import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  TrendingUp, 
  Vote, 
  Gift, 
  Eye, 
  ArrowRight, 
  Clock,
  DollarSign,
  BarChart3,
  Users,
  ChevronRight,
  Award,
  Target
} from 'lucide-react';
import { useDashboardV2Store } from '../../store/dashboardV2Store';
import { useDataMode } from '../../store/dataModeStore';
import Card from '../UI/Card';
import CF1Button from '../UI/CF1Button';
import ProgressBar from '../UI/ProgressBar';
import EnhancedPortfolioWidget from './EnhancedPortfolioWidget';
import EnhancedMarketplaceWidget from './EnhancedMarketplaceWidget';

const DashboardVariantB: React.FC = () => {
  const { 
    portfolioMetrics, 
    userAssets, 
    votingProposals, 
    recentRewards,
    newOpportunities 
  } = useDashboardV2Store();
  
  const { currentMode } = useDataMode();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, Investor! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening with your investments today
        </p>
      </div>

      {/* Portfolio Overview & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Portfolio Overview - Enhanced with Professional Images in Demo Mode */}
        <div className="lg:col-span-2">
          {currentMode === 'demo' ? (
            <EnhancedPortfolioWidget size="large" />
          ) : (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-blue-600" />
                  Portfolio Overview
                </h2>
                <Link to="/portfolio" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details →
                </Link>
              </div>

              {portfolioMetrics && (
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(portfolioMetrics.totalValue)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(portfolioMetrics.monthlyChange)} ({formatPercent(portfolioMetrics.monthlyChangePercent)})
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">this month</span>
                    </div>
                  </div>

                  {/* Mock Portfolio Chart */}
                  <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    <div className="text-center text-gray-600 dark:text-gray-300">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm">Portfolio Chart</span>
                      <div className="mt-2 flex justify-center space-x-8 text-xs">
                        <span>Jan: $110K</span>
                        <span>Feb: $118K</span>
                        <span>Mar: $125K</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
              Quick Stats
            </h3>
            {portfolioMetrics && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Assets:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">{portfolioMetrics.totalAssets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Votes:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">{portfolioMetrics.totalVotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Rewards:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">{formatCurrency(portfolioMetrics.totalRewards)}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 dark:border-blue-700 pt-2">
                  <span className="text-blue-700 dark:text-blue-300">ROI:</span>
                  <span className="font-bold text-blue-900 dark:text-blue-100">{formatPercent(portfolioMetrics.roi)}</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-600" />
              Performance
            </h3>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              Excellent
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Above market average
            </div>
          </Card>
        </div>
      </div>

      {/* Active Voting & New Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Voting */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Vote className="w-6 h-6 mr-3 text-purple-600" />
              Active Voting
            </h2>
            <Link to="/governance" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {votingProposals.map((proposal) => (
              <div key={proposal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Proposal #{proposal.id}: {proposal.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {proposal.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {proposal.timeLeft} left
                  </div>
                  <CF1Button size="sm">
                    Vote Now
                  </CF1Button>
                </div>
                {proposal.votingPower && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Your voting power: {proposal.votingPower} tokens
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* New Opportunities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Target className="w-6 h-6 mr-3 text-green-600" />
              New Opportunities
            </h2>
            <Link to="/launchpad" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {newOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {opportunity.name}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                    {opportunity.type}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(opportunity.value)} target
                  </div>
                  {opportunity.name.includes('Tech') && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      15% completed
                    </div>
                  )}
                  {opportunity.name.includes('Wine') && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      78% completed
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <ProgressBar 
                    value={opportunity.name.includes('Tech') ? 15 : 78} 
                    className="h-2" 
                  />
                </div>

                <CF1Button size="sm" variant="outline" className="w-full">
                  {opportunity.name.includes('Wine') ? 'Invest Now' : 'View Details'}
                </CF1Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Rewards */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Gift className="w-6 h-6 mr-3 text-yellow-600" />
            Recent Rewards
          </h2>
          <Link to="/portfolio/transactions" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentRewards.map((reward, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-800/30 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white">
                  {reward.assetName}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {formatCurrency(reward.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <CF1Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
            <Gift className="w-4 h-4 mr-2" />
            Claim All Rewards
          </CF1Button>
        </div>
      </Card>

      {/* Enhanced Marketplace in Demo Mode */}
      {currentMode === 'demo' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Target className="w-6 h-6 mr-3 text-purple-600" />
              More Investment Opportunities
            </h2>
            <Link to="/marketplace" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <EnhancedMarketplaceWidget size="medium" />
        </Card>
      )}
    </div>
  );
};

export default DashboardVariantB;