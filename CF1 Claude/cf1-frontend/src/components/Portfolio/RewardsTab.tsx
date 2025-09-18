import React, { useEffect, useState } from 'react';
import { Gift, TrendingUp, Calendar, Trophy, DollarSign, Eye, ChevronRight, Crown, Star, ArrowRight } from 'lucide-react';
import { useRewardsStore } from '../../store/rewardsStore';
import { useTierManagement } from '../../services/tierManagementService';
import { getAssetImage } from '../../utils/assetImageUtils';
import LoadingSpinner from '../UI/LoadingSpinner';
import { AssetRewardsDetail } from './AssetRewardsDetail';
import AllTiersModal from './AllTiersModal';

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

  const { getUserTier } = useTierManagement();

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssetRewards();
  }, [fetchAssetRewards]);

  // Helper function to get user's actual tier for an asset
  const getActualUserTier = (assetId: string, userTokens: number) => {
    return getUserTier(assetId, userTokens);
  };

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
      case 'bronze': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'gold': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'platinum': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Rewards Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <DollarSign className="w-6 h-6 text-slate-700 dark:text-slate-300" />
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
              <div className="p-2 bg-slate-100 dark:bg-slate-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yearly Projection</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalYearlyProjection)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Tiers - Prominent Section */}
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
          <div className="px-6 py-5 border-b border-blue-200 dark:border-blue-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Membership Tiers</h2>
                  <p className="text-blue-700 dark:text-blue-300 font-medium">Unlock exclusive rewards and benefits by holding more tokens</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assetRewards.map((reward) => {
                const actualTier = getActualUserTier(reward.assetId, reward.tokensHeld);
                return (
                  <div
                    key={reward.assetId}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 h-full flex flex-col"
                  >
                    <div className="flex-1 flex flex-col">
                      {/* Fixed height asset header section */}
                      <div className="h-16 mb-4 flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                          <img
                            src={getAssetImage(reward.assetId || reward.assetName, reward.assetType)}
                            alt={reward.assetName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.className = "w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0";
                                parent.innerHTML = `<span class="text-gray-700 dark:text-gray-300 font-bold">${reward.assetName.charAt(0)}</span>`;
                              }
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm truncate">
                            {reward.assetName}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {reward.tokensHeld.toLocaleString()} tokens held
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col">
                        {/* Fixed height tier section */}
                        <div className="h-20 mb-4">
                          {actualTier ? (
                            <div className="p-4 bg-gradient-to-r from-blue-500 to-slate-600 rounded-lg text-white h-full flex items-center">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-2">
                                  <Trophy className="w-4 h-4" />
                                  <span className="font-semibold">{actualTier.name} Tier</span>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">{actualTier.votingMultiplier || 1}x</p>
                                  <p className="text-xs text-blue-100">Multiplier</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg h-full flex items-center">
                              <div className="text-center w-full">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No Tier Qualified</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Hold more tokens to unlock tiers</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Fixed height benefits section */}
                        <div className="h-24 mb-4">
                          <div className="space-y-2 h-full flex flex-col">
                            {(actualTier?.benefits || []).slice(0, 2).map((benefit, index) => (
                              <div key={index} className="flex items-center space-x-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <Star className="w-3 h-3 text-slate-700 dark:text-slate-300 flex-shrink-0" />
                                <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{benefit}</span>
                              </div>
                            ))}
                            {(actualTier?.benefits || []).length > 2 && (
                              <div className="text-center mt-auto">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  +{actualTier.benefits.length - 2} more benefits
                                </span>
                              </div>
                            )}
                            {/* Fill remaining space if fewer than 2 benefits */}
                            {(actualTier?.benefits || []).length < 2 && (
                              <div className="flex-1"></div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedAssetId(reward.assetId)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors text-sm mt-auto"
                      >
                        <span>View Rewards</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reward History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reward History</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Recent reward distributions and earnings for your portfolio
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
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img
                        src={getAssetImage(reward.assetId || reward.assetName, reward.assetType)}
                        alt={reward.assetName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.className = "w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center";
                            parent.innerHTML = `<span class="text-gray-600 dark:text-gray-400 font-semibold">${reward.assetName.charAt(0)}</span>`;
                          }
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {reward.assetName}
                        </h3>
                        {(() => {
                          const actualTier = getActualUserTier(reward.assetId, reward.tokensHeld);
                          return actualTier ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(actualTier.name)}`}>
                              <Trophy className="w-3 h-3 inline mr-1" />
                              {actualTier.name}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                              No Tier
                            </span>
                          );
                        })()}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                      <p className="font-semibold text-gray-900 dark:text-white">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};