import React, { useState } from 'react';
import { TrendingUp, ArrowRight, Eye, Crown, Award, Medal, Star, Shield, Gem, ChevronRight } from 'lucide-react';
import { AssetTier } from '../../types/tiers';
import { useTierManagement } from '../../services/tierManagementService';
import TierBadge from './TierBadge';

interface PortfolioAssetTierCardProps {
  assetId: string;
  assetName: string;
  userTokens: number;
  currentValue: string;
  className?: string;
  onViewAllTiers?: (assetId: string) => void;
}

const TIER_ICONS: Record<string, any> = {
  diamond: Gem,
  platinum: Award,
  gold: Medal,
  silver: Star,
  bronze: Shield
};

const PortfolioAssetTierCard: React.FC<PortfolioAssetTierCardProps> = ({
  assetId,
  assetName,
  userTokens,
  currentValue,
  className = '',
  onViewAllTiers
}) => {
  const { getUserUpgradePath, getUpgradeIncentive } = useTierManagement();
  
  const upgradePath = getUserUpgradePath(assetId, userTokens);
  const upgradeIncentive = getUpgradeIncentive(assetId, userTokens);
  
  // Don't show if no tiers exist for this asset
  if (!upgradePath.currentTier && !upgradePath.nextTier) {
    return null;
  }

  const CurrentTierIcon = upgradePath.currentTier 
    ? TIER_ICONS[upgradePath.currentTier.name.toLowerCase()] || Star
    : null;

  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
      upgradePath.currentTier 
        ? 'border-blue-200 dark:border-blue-700' 
        : 'border-gray-200 dark:border-gray-600'
    } ${className}`}>
      {/* Asset Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{assetName}</h3>
            <p className="text-blue-100 text-sm">{userTokens.toLocaleString()} tokens • {currentValue}</p>
          </div>
          {onViewAllTiers && (
            <button
              onClick={() => onViewAllTiers(assetId)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>View Tiers</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Tier Status */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {upgradePath.currentTier ? (
              <>
                <div className="flex items-center space-x-3">
                  <TierBadge tier={upgradePath.currentTier} size="lg" showName />
                  <div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Active Member</span>
                    <p className="text-xs text-gray-500">Tier benefits active</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium">
                  No Tier
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Not enough tokens</p>
                  <p className="text-xs text-gray-500">Hold more to unlock benefits</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {onViewAllTiers && (
          <button
            onClick={() => onViewAllTiers(assetId)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>View All</span>
          </button>
        )}

        {/* Current Tier Benefits (if user has a tier) */}
        {upgradePath.currentTier && (
          <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
            <div className="flex items-center space-x-2 mb-3">
              <Crown className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-bold text-green-800 dark:text-green-200">Your Active Benefits</h4>
            </div>
            <div className="space-y-3">
              {upgradePath.currentTier.benefits?.slice(0, 2).map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">{benefit}</span>
                </div>
              ))}
              {upgradePath.currentTier.rewards[0] && (
                <div className="flex items-center space-x-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">{upgradePath.currentTier.rewards[0].title}</span>
                  {upgradePath.currentTier.rewards[0].value && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-bold">
                      {upgradePath.currentTier.rewards[0].value}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upgrade Incentive */}
        {upgradeIncentive && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    Upgrade to {upgradeIncentive.nextTierName}
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Unlock premium benefits</p>
                </div>
              </div>
              <TierBadge tier={upgradePath.nextTier!} size="md" showName />
            </div>
            
            {/* Tokens Needed - Big CTA style */}
            <div className="mb-4 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tokens needed:</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {upgradeIncentive.tokensNeeded.toLocaleString()}
                </span>
              </div>
              
              {/* Progress Bar - More prominent */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ 
                    width: `${Math.min(100, (userTokens / upgradePath.nextTier!.threshold) * 100)}%`
                  }}
                />
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {Math.round((userTokens / upgradePath.nextTier!.threshold) * 100)}% of requirement met
              </div>
            </div>

            {/* Next Tier Benefits Preview - More prominent */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <p className="font-semibold text-gray-800 dark:text-gray-200">You'll unlock:</p>
              </div>
              <div className="space-y-2">
                {upgradeIncentive.rewardHighlight && (
                  <div className="flex items-center space-x-3 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="font-bold text-green-800 dark:text-green-200">
                      {upgradeIncentive.rewardHighlight}
                    </span>
                  </div>
                )}
                {upgradeIncentive.topBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">{benefit}</span>
                  </div>
                ))}
                {upgradePath.upgradeTiers.length > 1 && (
                  <div className="flex items-center space-x-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <ChevronRight className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="font-medium text-purple-800 dark:text-purple-200">
                      Plus {upgradePath.upgradeTiers.length - 1} more tier{upgradePath.upgradeTiers.length > 2 ? 's' : ''} available
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Max Tier Achievement */}
        {!upgradeIncentive && upgradePath.currentTier && (
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center space-x-3 text-center justify-center">
              <Crown className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="font-bold text-yellow-800 dark:text-yellow-200 text-lg">
                  🏆 Maximum Tier Achieved!
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  You're enjoying all available benefits for this asset
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioAssetTierCard;