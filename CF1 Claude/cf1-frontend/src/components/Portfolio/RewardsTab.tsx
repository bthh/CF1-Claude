import React, { useEffect, useState } from 'react';
import { Gift, TrendingUp, Calendar, Trophy, DollarSign, Eye, ChevronRight } from 'lucide-react';
import { useRewardsStore } from '../../store/rewardsStore';
import LoadingSpinner from '../UI/LoadingSpinner';
import { AssetRewardsDetail } from './AssetRewardsDetail';

export const RewardsTab: React.FC = () => {
  const {
    assetRewards,
    totalRewardsEarned,
    totalMonthlyRewards,
    totalYearlyProjection,
    isLoading,
    error,
    fetchAssetRewards
  } = useRewardsStore();

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssetRewards();
  }, [fetchAssetRewards]);

  if (selectedAssetId) {
    return (
      <AssetRewardsDetail
        assetId={selectedAssetId}
        onBack={() => setSelectedAssetId(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
        <p className="font-medium">Error loading rewards</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

  const getTierBadgeColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'bronze': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Rewards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rewards Earned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRewardsEarned)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Rewards</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalMonthlyRewards)}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalYearlyProjection)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Rewards List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Rewards</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View rewards and tier benefits for each asset in your portfolio
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {assetRewards.map((reward) => (
            <div
              key={reward.assetId}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              onClick={() => setSelectedAssetId(reward.assetId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">
                      {reward.assetName.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {reward.assetName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(reward.tier.name)}`}>
                        <Trophy className="w-3 h-3 inline mr-1" />
                        {reward.tier.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>{reward.tokensHeld.toLocaleString()} tokens</span>
                      <span>•</span>
                      <span>Last distribution: {formatDate(reward.lastDistribution)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(reward.totalRewards)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total earned
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(reward.monthlyRewards)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monthly
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Quick tier benefits preview */}
              <div className="mt-4 pl-16">
                <div className="flex flex-wrap gap-2">
                  {reward.tier.benefits.slice(0, 3).map((benefit, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                    >
                      {benefit}
                    </span>
                  ))}
                  {reward.tier.benefits.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{reward.tier.benefits.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier System Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tier System Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier, index) => {
            const multipliers = [1.0, 1.25, 1.5, 2.0];
            const minTokens = [1, 100, 500, 1000];
            return (
              <div key={tier} className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getTierBadgeColor(tier)}`}>
                  <Trophy className="w-4 h-4 mr-1" />
                  {tier}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {minTokens[index]}+ tokens
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {multipliers[index]}x rewards
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};