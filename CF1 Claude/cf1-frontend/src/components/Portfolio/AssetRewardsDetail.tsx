import React, { useState } from 'react';
import { 
  ArrowLeft, Trophy, Calendar, DollarSign, TrendingUp, 
  Clock, CheckCircle, AlertCircle, Gift, Info, Star, Eye
} from 'lucide-react';
import { useRewardsStore } from '../../store/rewardsStore';
import { useTierManagement } from '../../services/tierManagementService';
import LoadingSpinner from '../UI/LoadingSpinner';
import AllTiersModal from './AllTiersModal';

interface AssetRewardsDetailProps {
  assetId: string;
  onBack: () => void;
}

export const AssetRewardsDetail: React.FC<AssetRewardsDetailProps> = ({ assetId, onBack }) => {
  const { getAssetReward } = useRewardsStore();
  const { getUserTier } = useTierManagement();
  const [showAllTiersModal, setShowAllTiersModal] = useState(false);
  
  const assetReward = getAssetReward(assetId);
  const actualUserTier = assetReward ? getUserTier(assetId, assetReward.tokensHeld) : null;

  if (!assetReward) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

  const getTierBadgeColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'bronze': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'dividend':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'appreciation':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'tier_upgrade':
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {assetReward.assetName} Rewards
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed rewards and tier information
          </p>
        </div>
      </div>

      {/* Tier Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Tier Status</h2>
          <div className="flex items-center space-x-3">
            {actualUserTier ? (
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierBadgeColor(actualUserTier.name)}`}>
                <Trophy className="w-4 h-4 inline mr-1" />
                {actualUserTier.name}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                No Tier
              </span>
            )}
            <button
              onClick={() => setShowAllTiersModal(true)}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg font-medium transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>View All Tiers</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {assetReward.tokensHeld.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tokens Held</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {actualUserTier?.votingMultiplier || 1}x
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Reward Multiplier</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(assetReward.monthlyRewards)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rewards</p>
          </div>
        </div>

        {/* Tier Benefits */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Your Tier Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {actualUserTier?.benefits ? (
              actualUserTier.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{benefit}</span>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No tier benefits available. Hold more tokens to unlock tiers.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rewards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(assetReward.totalRewards)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Distribution</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(assetReward.nextDistribution)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yearly Projection</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(assetReward.yearlyProjection)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reward History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reward History</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your recent rewards and distributions
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {assetReward.rewardHistory.map((entry) => (
            <div key={entry.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {getRewardTypeIcon(entry.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {entry.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>{formatDate(entry.date)}</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(entry.status)}
                        <span className="capitalize">{entry.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(entry.amount)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {entry.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Progression Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Tier Progression
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Increase your token holdings to unlock higher tier benefits and reward multipliers. Click "View All Tiers" above to see all available tiers for this asset.
            </p>
          </div>
        </div>
      </div>

      {/* All Tiers Modal */}
      {showAllTiersModal && assetReward && (
        <AllTiersModal
          isOpen={true}
          onClose={() => setShowAllTiersModal(false)}
          assetId={assetId}
          assetName={assetReward.assetName}
          userTokens={assetReward.tokensHeld}
        />
      )}
    </div>
  );
};