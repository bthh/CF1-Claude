import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Users, 
  DollarSign, 
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Send,
  ArrowRight,
  Award,
  Building,
  Vote
} from 'lucide-react';
import { useDashboardV2Store } from '../../store/dashboardV2Store';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ProgressBar from '../UI/ProgressBar';
import StatusBadge from '../UI/StatusBadge';

const DashboardVariantC: React.FC = () => {
  const { 
    creatorMetrics, 
    creatorAssets, 
    proposalPipeline, 
    shareholderUpdates,
    votingProposals
  } = useDashboardV2Store();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'review':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, Creator! 🏗️
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your assets, track performance, and engage with your shareholders
        </p>
      </div>

      {/* Creator Dashboard & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creator Dashboard */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-orange-600" />
                Creator Dashboard
              </h2>
              <Link to="/admin/creator" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                View Admin Panel →
              </Link>
            </div>

            {creatorMetrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/50">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {creatorMetrics.activeAssets}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    Active Assets
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(creatorMetrics.totalRaised)}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Total Raised
                  </div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {creatorMetrics.shareholders}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Shareholders
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/50">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatPercent(creatorMetrics.avgPerformance)}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    Avg Performance
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
            <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button size="sm" className="w-full justify-start bg-orange-600 hover:bg-orange-700">
                <FileText className="w-4 h-4 mr-2" />
                New Proposal
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Building className="w-4 h-4 mr-2" />
                Manage Assets
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Send className="w-4 h-4 mr-2" />
                Send Update
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* My Active Assets */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Building className="w-6 h-6 mr-3 text-blue-600" />
            My Active Assets
          </h2>
          <Link to="/admin/creator/assets" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Manage All →
          </Link>
        </div>

        <div className="space-y-4">
          {creatorAssets.map((asset) => (
            <div key={asset.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {asset.name}
                  </h3>
                  <StatusBadge variant={getStatusColor(asset.status)}>
                    {asset.status}
                  </StatusBadge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Manage
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Raised:</span>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(asset.raised)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Shareholders:</span>
                  <div className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {asset.shareholders}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Performance:</span>
                  <div className={`font-semibold ${asset.performance > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatPercent(asset.performance)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Active
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Proposal Pipeline & Shareholder Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Proposal Pipeline */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-6 h-6 mr-3 text-purple-600" />
              Proposal Pipeline
            </h2>
            <Link to="/launchpad/drafts" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {proposalPipeline.map((proposal) => (
              <div key={proposal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {proposal.title}
                  </h3>
                  <StatusBadge variant={getStatusColor(proposal.status)}>
                    {proposal.status}
                  </StatusBadge>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300">
                      Completion
                    </span>
                    <span className="font-medium">
                      {proposal.completion}%
                    </span>
                  </div>
                  <ProgressBar value={proposal.completion} className="h-2" />
                </div>

                <Button size="sm" variant="outline" className="w-full">
                  {proposal.status === 'draft' ? 'Continue' : 'View Details'}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Shareholder Updates */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-green-600" />
              Shareholder Updates
            </h2>
            <Link to="/admin/creator/communications" className="text-green-600 hover:text-green-700 text-sm font-medium">
              Draft Messages →
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                Pending Updates: <strong>2</strong>
              </span>
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
            </div>

            {shareholderUpdates.map((update, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(update.priority).replace('text-', 'bg-')}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {update.assetName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {update.type} update • {update.priority} priority
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Platform Voting (As Investor) */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Vote className="w-6 h-6 mr-3 text-indigo-600" />
            Platform Voting (As Investor)
          </h2>
          <Link to="/governance" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {votingProposals && votingProposals.slice(0, 2).map((proposal) => (
            <div key={proposal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {proposal.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {proposal.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {proposal.timeLeft} left
                </div>
                <Button size="sm" variant="outline">
                  Vote Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Market Opportunities */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
            Market Opportunities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Real Estate
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Trending category with high demand
            </div>
          </div>
          <div className="text-center p-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Technology
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Strong growth potential in AI/ML
            </div>
          </div>
          <div className="text-center p-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Sustainable
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              ESG-focused investments growing
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardVariantC;