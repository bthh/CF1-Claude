import React, { useState, useEffect } from 'react';
import { X, Crown, Award, Medal, Star, Shield, Gem, TrendingUp, Vote, Lock, DollarSign } from 'lucide-react';
import { AssetTier, TierReward } from '../../types/tiers';
import { useTierManagement } from '../../services/tierManagementService';
import TierBadge from './TierBadge';
import LoadingSpinner from '../UI/LoadingSpinner';

interface AllTiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  assetName: string;
  userTokens: number;
}

const TIER_ICONS: Record<string, any> = {
  diamond: Gem,
  platinum: Award,
  gold: Medal,
  silver: Star,
  bronze: Shield
};

const REWARD_TYPE_ICONS: Record<TierReward['type'], any> = {
  dividend_bonus: TrendingUp,
  exclusive_access: Lock,
  governance_weight: Vote,
  fee_discount: DollarSign,
  custom: Star
};

const AllTiersModal: React.FC<AllTiersModalProps> = ({
  isOpen,
  onClose,
  assetId,
  assetName,
  userTokens
}) => {
  const { getUserTier, tiers } = useTierManagement();
  const [allTiers, setAllTiers] = useState<AssetTier[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!isOpen || !assetId) return;

    const loadTiers = async () => {
      setLoading(true);
      console.log('🎯 AllTiersModal: Loading tiers for asset:', assetId);
      try {
        // Check if tiers are already loaded in the hook
        if (tiers && tiers[assetId]) {
          console.log('✅ AllTiersModal: Found tiers in hook:', tiers[assetId].length);
          setAllTiers(tiers[assetId].filter(tier => tier.status === 'active'));
          setLoading(false);
          return;
        }
        
        // Fallback to service call
        console.log('🔄 AllTiersModal: Falling back to service call');
        const { tierManagementService } = await import('../../services/tierManagementService');
        const tiersList = await tierManagementService.getTiersForAsset(assetId);
        console.log('📦 AllTiersModal: Service returned:', tiersList.length, 'tiers');
        setAllTiers(tiersList.filter(tier => tier.status === 'active'));
      } catch (error) {
        console.error('❌ AllTiersModal: Error loading tiers:', error);
        setAllTiers([]);
      } finally {
        setLoading(false);
      }
    };

    loadTiers();
  }, [isOpen, assetId, tiers]);
  
  if (!isOpen) return null;

  const sortedTiers = [...allTiers].sort((a, b) => b.threshold - a.threshold); // Highest to lowest
  const userCurrentTier = getUserTier(assetId, userTokens);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              All Membership Tiers
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {assetName} • You hold {userTokens.toLocaleString()} tokens
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : sortedTiers.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Tiers Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This asset doesn't have any membership tiers set up yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedTiers.map((tier, index) => {
                const isUserTier = userCurrentTier?.id === tier.id;
                const userQualifies = userTokens >= tier.threshold;
                const TierIcon = TIER_ICONS[tier.name.toLowerCase()] || Star;

                return (
                  <div
                    key={tier.id}
                    className={`border-2 rounded-xl transition-all ${
                      isUserTier
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : userQualifies
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    {/* Tier Header */}
                    <div 
                      className="p-6 rounded-t-xl"
                      style={{ 
                        background: tier.colorScheme?.background || 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: tier.colorScheme?.primary || '#F3F4F6' }}
                          >
                            <TierIcon 
                              className="w-8 h-8" 
                              style={{ color: tier.colorScheme?.secondary || '#6B7280' }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {tier.name}
                              </h3>
                              {isUserTier && (
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                  Your Tier
                                </span>
                              )}
                              {!isUserTier && userQualifies && (
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                                  Qualified
                                </span>
                              )}
                            </div>
                            <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                              {tier.threshold.toLocaleString()} tokens minimum
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {tier.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* User Progress */}
                        {!userQualifies && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              Need {(tier.threshold - userTokens).toLocaleString()} more
                            </p>
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, (userTokens / tier.threshold) * 100)}%`,
                                  backgroundColor: tier.colorScheme?.secondary || '#3B82F6'
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tier Content */}
                    <div className="p-6">
                      {/* Rewards */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                          Rewards & Benefits
                        </h4>
                        {tier.rewards && tier.rewards.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tier.rewards.map((reward) => {
                              const RewardIcon = REWARD_TYPE_ICONS[reward.type] || Star;
                              return (
                                <div key={reward.id || Math.random()} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <RewardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {reward.title || 'Tier Reward'}
                                      </p>
                                      {reward.value && (
                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                          {reward.value}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {reward.description || 'Exclusive tier benefit'}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400">
                              This tier provides basic membership benefits
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Additional Benefits */}
                      {tier.benefits && tier.benefits.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            Additional Benefits
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {tier.benefits.map((benefit, benefitIndex) => (
                              <div key={benefitIndex} className="flex items-center space-x-2 text-sm">
                                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-600 p-6 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {userCurrentTier ? (
                <span>
                  You're currently in the <strong>{userCurrentTier.name}</strong> tier
                </span>
              ) : (
                <span>
                  You don't qualify for any tier yet. Hold more tokens to unlock benefits!
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTiersModal;