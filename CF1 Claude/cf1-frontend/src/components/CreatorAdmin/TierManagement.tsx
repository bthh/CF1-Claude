import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Award, 
  Medal, 
  Star, 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  TrendingUp, 
  Settings,
  Eye,
  EyeOff,
  Copy,
  MoreVertical,
  DollarSign,
  Vote,
  Zap,
  Lock,
  Gem
} from 'lucide-react';
import { AssetTier, TierReward, DEFAULT_TIER_TEMPLATES, TierStats } from '../../types/tiers';
import { useCreatorAssets } from '../../hooks/useCreatorAssets';
import { useNotifications } from '../../hooks/useNotifications';
import { useTierManagement, usePortfolioTiers } from '../../services/tierManagementService';
import { usePortfolioData } from '../../services/demoPortfolioData';
import TierFormModal from './TierFormModal';

interface TierManagementProps {
  creatorId: string;
}

const REWARD_TYPE_ICONS: Record<TierReward['type'], any> = {
  dividend_bonus: TrendingUp,
  exclusive_access: Lock,
  governance_weight: Vote,
  fee_discount: DollarSign,
  custom: Star
};

const TIER_ICONS: Record<string, any> = {
  diamond: Gem,
  platinum: Award,
  gold: Medal,
  silver: Star,
  bronze: Shield
};

const TierCard: React.FC<{
  tier: AssetTier;
  stats?: TierStats;
  onEdit: (tier: AssetTier) => void;
  onDelete: (tierId: string) => void;
  onToggleStatus: (tierId: string) => void;
}> = ({ tier, stats, onEdit, onDelete, onToggleStatus }) => {
  const [showMenu, setShowMenu] = useState(false);
  const TierIcon = TIER_ICONS[tier.name.toLowerCase()] || Star;

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-200 ${
      tier.status === 'active' 
        ? 'border-blue-200 dark:border-blue-700 shadow-lg' 
        : 'border-gray-200 dark:border-gray-600 opacity-75'
    }`}>
      {/* Tier Header */}
      <div 
        className="p-6 rounded-t-xl"
        style={{ 
          background: tier.colorScheme?.background || 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center`}
                 style={{ backgroundColor: tier.colorScheme?.primary || '#F3F4F6' }}>
              <TierIcon 
                className="w-6 h-6" 
                style={{ color: tier.colorScheme?.secondary || '#6B7280' }}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900" style={{ color: tier.colorScheme?.text || '#111827' }}>{tier.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tier.threshold.toLocaleString()} tokens minimum
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              tier.status === 'active' 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : tier.status === 'inactive'
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
            }`}>
              {tier.status}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                  <button
                    onClick={() => { onEdit(tier); setShowMenu(false); }}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Tier</span>
                  </button>
                  <button
                    onClick={() => { onToggleStatus(tier.id); setShowMenu(false); }}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {tier.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{tier.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                  </button>
                  <button
                    onClick={() => { onDelete(tier.id); setShowMenu(false); }}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Tier</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tier Content */}
      <div className="p-6">
        <p className="text-gray-700 dark:text-gray-300 mb-4">{tier.description}</p>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.memberCount}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Members</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.totalTokensHeld.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Tokens</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.percentageOfHolders.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">of Holders</p>
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Rewards & Benefits</h4>
          {tier.rewards.map((reward) => {
            const RewardIcon = REWARD_TYPE_ICONS[reward.type];
            return (
              <div key={reward.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <RewardIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-white">{reward.title}</p>
                    {reward.value && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        {reward.value}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{reward.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Benefits */}
        {tier.benefits && tier.benefits.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Additional Benefits</h4>
            <ul className="space-y-1">
              {tier.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const TierManagement: React.FC<TierManagementProps> = ({ creatorId }) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTier, setEditingTier] = useState<AssetTier | null>(null);
  
  const { assets: portfolioAssets, isDemoMode } = usePortfolioData();
  const { tiers, loading, createTier, updateTier, deleteTier, getTiersForAsset } = useTierManagement();
  const { success, error } = useNotifications();
  
  // Get tiers for selected asset
  const selectedAssetTiers = selectedAsset ? (tiers[selectedAsset] || []) : [];
  
  // Use portfolio assets if in demo mode, otherwise use creator assets
  const { assets: creatorAssets, loading: assetsLoading, error: assetsError } = useCreatorAssets(creatorId || '');
  const availableAssets = isDemoMode ? portfolioAssets : creatorAssets;

  // Handle assets loading error (only for production mode)
  if (!isDemoMode && assetsError) {
    return (
      <div className="text-center py-12">
        <Crown className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Assets
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {assetsError}
        </p>
      </div>
    );
  }

  // Mock tier stats - in real implementation, this would come from your backend
  const mockTierStats: Record<string, TierStats> = {
    'tier-1': {
      tierName: 'Diamond',
      memberCount: 12,
      totalTokensHeld: 125000,
      averageHolding: 10416,
      percentageOfHolders: 2.4
    },
    'tier-2': {
      tierName: 'Platinum', 
      memberCount: 34,
      totalTokensHeld: 285000,
      averageHolding: 8382,
      percentageOfHolders: 6.8
    }
  };

  // No need for manual tier loading - service handles it automatically

  const handleCreateTier = () => {
    if (selectedAssetTiers.length >= 5) {
      error('Maximum of 5 tiers allowed per asset');
      return;
    }
    setShowCreateModal(true);
  };

  const handleEditTier = (tier: AssetTier) => {
    setEditingTier(tier);
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!selectedAsset) return;
    
    if (confirm('Are you sure you want to delete this tier? This action cannot be undone.')) {
      try {
        await deleteTier(selectedAsset, tierId);
        success('Tier deleted successfully');
      } catch (err) {
        error('Failed to delete tier');
      }
    }
  };

  const handleToggleStatus = async (tierId: string) => {
    if (!selectedAsset) return;
    
    try {
      const tier = selectedAssetTiers.find(t => t.id === tierId);
      if (!tier) return;
      
      await updateTier(selectedAsset, tierId, {
        status: tier.status === 'active' ? 'inactive' : 'active'
      });
      success('Tier status updated');
    } catch (err) {
      error('Failed to update tier status');
    }
  };

  const handleSaveTier = async (tierData: Partial<AssetTier>) => {
    if (!selectedAsset) return;
    
    try {
      if (editingTier) {
        // Update existing tier
        await updateTier(selectedAsset, editingTier.id, tierData);
        success('Tier updated successfully');
      } else {
        // Create new tier
        await createTier(selectedAsset, tierData);
        success('Tier created successfully');
      }
      
      // Reset form state
      setShowCreateModal(false);
      setEditingTier(null);
    } catch (err) {
      error(editingTier ? 'Failed to update tier' : 'Failed to create tier');
      throw err; // Re-throw so modal can handle the error
    }
  };

  // Show loading state while assets are loading (only in production mode)
  if (!isDemoMode && assetsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Loading Assets...
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we load your assets.
        </p>
      </div>
    );
  }

  if (!availableAssets || availableAssets.length === 0) {
    return (
      <div className="text-center py-12">
        <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Assets Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          You need to have launched assets to create tiers. Create an asset first to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tier Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage membership tiers for your assets
          </p>
        </div>
        
        {selectedAsset && (
          <button
            onClick={handleCreateTier}
            disabled={selectedAssetTiers.length >= 5}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedAssetTiers.length >= 5
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Tier</span>
            <span className="text-xs opacity-75">({selectedAssetTiers.length}/5)</span>
          </button>
        )}
      </div>

      {/* Asset Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Select Asset</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableAssets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setSelectedAsset(asset.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedAsset === asset.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <h4 className="font-medium text-gray-900 dark:text-white">{asset.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{asset.type}</p>
              {isDemoMode ? (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {asset.tokens?.toLocaleString()} tokens owned
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {asset.totalTokens?.toLocaleString()} tokens issued
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tiers Display */}
      {selectedAsset && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="w-32 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="w-3/4 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedAssetTiers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedAssetTiers
                .sort((a, b) => a.order - b.order)
                .map((tier) => (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    stats={mockTierStats[tier.id]}
                    onEdit={handleEditTier}
                    onDelete={handleDeleteTier}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Tiers Created
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first tier to start rewarding your token holders
              </p>
              <button
                onClick={handleCreateTier}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium mx-auto transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Tier</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tier Form Modal */}
      {selectedAsset && (
        <TierFormModal
          isOpen={showCreateModal || editingTier !== null}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTier(null);
          }}
          onSave={handleSaveTier}
          tier={editingTier}
          assetId={selectedAsset}
          existingTiers={selectedAssetTiers}
        />
      )}
    </div>
  );
};

export default TierManagement;