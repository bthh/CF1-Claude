import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  TrendingUp, 
  Vote, 
  DollarSign, 
  Lock, 
  Star,
  Palette,
  Crown,
  Award,
  Medal,
  Shield,
  Gem
} from 'lucide-react';
import { AssetTier, TierReward, DEFAULT_TIER_TEMPLATES, TierTemplate } from '../../types/tiers';
import { useNotifications } from '../../hooks/useNotifications';

interface TierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tier: Partial<AssetTier>) => Promise<void>;
  tier?: AssetTier | null;
  assetId: string;
  existingTiers: AssetTier[];
}

const REWARD_TYPES: Array<{
  type: TierReward['type'];
  label: string;
  icon: any;
  description: string;
  placeholder: string;
}> = [
  {
    type: 'dividend_bonus',
    label: 'Dividend Bonus',
    icon: TrendingUp,
    description: 'Enhanced dividend distributions',
    placeholder: 'e.g., 15%'
  },
  {
    type: 'governance_weight',
    label: 'Voting Power',
    icon: Vote,
    description: 'Increased governance voting influence',
    placeholder: 'e.g., 2x'
  },
  {
    type: 'fee_discount',
    label: 'Fee Discount',
    icon: DollarSign,
    description: 'Reduced transaction fees',
    placeholder: 'e.g., 10%'
  },
  {
    type: 'exclusive_access',
    label: 'Exclusive Access',
    icon: Lock,
    description: 'Special access to features or content',
    placeholder: 'Access type'
  },
  {
    type: 'custom',
    label: 'Custom Reward',
    icon: Star,
    description: 'Define your own custom benefit',
    placeholder: 'Custom value'
  }
];

const COLOR_SCHEMES = [
  {
    name: 'Blue',
    primary: '#DBEAFE',
    secondary: '#3B82F6',
    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
  },
  {
    name: 'Purple',
    primary: '#E9D5FF',
    secondary: '#8B5CF6',
    background: 'linear-gradient(135deg, #F5F3FF 0%, #E9D5FF 100%)'
  },
  {
    name: 'Green',
    primary: '#D1FAE5',
    secondary: '#10B981',
    background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
  },
  {
    name: 'Red',
    primary: '#FED7D7',
    secondary: '#EF4444',
    background: 'linear-gradient(135deg, #FEF2F2 0%, #FED7D7 100%)'
  },
  {
    name: 'Yellow',
    primary: '#FEF3C7',
    secondary: '#F59E0B',
    background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
  },
  {
    name: 'Gray',
    primary: '#F3F4F6',
    secondary: '#6B7280',
    background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)'
  }
];

const TierFormModal: React.FC<TierFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tier,
  assetId,
  existingTiers
}) => {
  const [formData, setFormData] = useState<Partial<AssetTier>>({
    assetId,
    name: '',
    description: '',
    threshold: 0,
    rewards: [],
    colorScheme: DEFAULT_TIER_TEMPLATES.gold.colorScheme,
    benefits: [],
    votingMultiplier: 1,
    priorityAccess: false,
    discountPercentage: 0,
    status: 'active',
    order: existingTiers.length + 1
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newReward, setNewReward] = useState<Partial<TierReward>>({
    type: 'dividend_bonus',
    title: '',
    description: '',
    value: ''
  });
  const [newBenefit, setNewBenefit] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { success, error } = useNotifications();

  useEffect(() => {
    if (tier) {
      setFormData({
        ...tier,
        rewards: [...tier.rewards]
      });
    } else {
      // Reset form for new tier
      setFormData({
        assetId,
        name: '',
        description: '',
        threshold: 0,
        rewards: [],
        colorScheme: DEFAULT_TIER_TEMPLATES.gold.colorScheme,
        benefits: [],
        votingMultiplier: 1,
        priorityAccess: false,
        discountPercentage: 0,
        status: 'active',
        order: existingTiers.length + 1
      });
    }
  }, [tier, assetId, existingTiers]);

  const handleTemplateSelect = (templateKey: string) => {
    const template = DEFAULT_TIER_TEMPLATES[templateKey];
    if (template && !isTemplateUsed(templateKey)) {
      setSelectedTemplate(templateKey);
      setFormData(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        colorScheme: template.colorScheme,
        rewards: template.defaultRewards.map(reward => ({
          ...reward,
          id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        })),
        badge: template.badge
      }));
    }
  };

  const isTemplateUsed = (templateKey: string): boolean => {
    const templateName = DEFAULT_TIER_TEMPLATES[templateKey]?.name;
    return existingTiers.some(tier => tier.name === templateName && tier.id !== formData.id);
  };

  const handleAddReward = () => {
    if (!newReward.title || !newReward.description) {
      error('Please fill in reward title and description');
      return;
    }

    const reward: TierReward = {
      id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: newReward.type!,
      title: newReward.title!,
      description: newReward.description!,
      value: newReward.value || undefined,
      icon: newReward.icon
    };

    setFormData(prev => ({
      ...prev,
      rewards: [...(prev.rewards || []), reward]
    }));

    setNewReward({
      type: 'dividend_bonus',
      title: '',
      description: '',
      value: ''
    });
  };

  const handleRemoveReward = (rewardId: string) => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards?.filter(r => r.id !== rewardId) || []
    }));
  };

  const handleAddBenefit = () => {
    if (!newBenefit.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      benefits: [...(prev.benefits || []), newBenefit.trim()]
    }));
    
    setNewBenefit('');
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = (): boolean => {
    if (!selectedTemplate && !tier) {
      error('Please select a tier template');
      return false;
    }
    
    if (!formData.description?.trim()) {
      error('Tier description is required');
      return false;
    }
    
    if (!formData.threshold || formData.threshold <= 0) {
      error('Token threshold must be greater than 0');
      return false;
    }
    
    if (!formData.rewards || formData.rewards.length === 0) {
      error('At least one reward is required');
      return false;
    }

    // Check if threshold conflicts with existing tiers
    const conflictingTier = existingTiers.find(t => 
      t.id !== tier?.id && t.threshold === formData.threshold
    );
    if (conflictingTier) {
      error(`Threshold ${formData.threshold} is already used by ${conflictingTier.name} tier`);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
      success(tier ? 'Tier updated successfully' : 'Tier created successfully');
      onClose();
    } catch (err) {
      error(tier ? 'Failed to update tier' : 'Failed to create tier');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {tier ? 'Edit Tier' : 'Create New Tier'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6 pb-4">
            {/* Templates Section */}
            {!tier && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Templates</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose a tier template. Each tier can only be used once per asset.
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(DEFAULT_TIER_TEMPLATES)
                    .sort(([a], [b]) => {
                      const order = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
                      return order.indexOf(a) - order.indexOf(b);
                    })
                    .map(([key, template]) => {
                      const isUsed = isTemplateUsed(key);
                      return (
                        <button
                          key={key}
                          onClick={() => !isUsed && handleTemplateSelect(key)}
                          disabled={isUsed}
                          className={`p-3 rounded-lg border-2 transition-all text-center relative ${
                            selectedTemplate === key
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : isUsed
                              ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center"
                               style={{ backgroundColor: template.colorScheme.primary }}>
                            {key === 'diamond' && <Gem className="w-4 h-4" style={{ color: template.colorScheme.secondary }} />}
                            {key === 'platinum' && <Award className="w-4 h-4" style={{ color: template.colorScheme.secondary }} />}
                            {key === 'gold' && <Medal className="w-4 h-4" style={{ color: template.colorScheme.secondary }} />}
                            {key === 'silver' && <Star className="w-4 h-4" style={{ color: template.colorScheme.secondary }} />}
                            {key === 'bronze' && <Shield className="w-4 h-4" style={{ color: template.colorScheme.secondary }} />}
                          </div>
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{template.name}</p>
                          {isUsed && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                              <span className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded">USED</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Basic Information */}
            {selectedTemplate && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Selected Tier: {DEFAULT_TIER_TEMPLATES[selectedTemplate]?.name}</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">{DEFAULT_TIER_TEMPLATES[selectedTemplate]?.description}</p>
              </div>
            )}

            {/* Show tier name when editing */}
            {tier && (
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Editing Tier: {formData.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tier name cannot be changed after creation</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Token Threshold *
              </label>
              <input
                type="number"
                value={formData.threshold || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Minimum tokens required"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the minimum number of tokens required to qualify for this tier
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe this tier and its benefits"
              />
            </div>


            {/* Rewards Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Rewards * (At least 1 required)
              </label>
              
              {/* Existing Rewards */}
              <div className="space-y-3 mb-4">
                {formData.rewards?.map((reward) => {
                  const RewardIcon = REWARD_TYPES.find(type => type.type === reward.type)?.icon || Star;
                  return (
                    <div key={reward.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <RewardIcon className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">{reward.title}</span>
                          {reward.value && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                              {reward.value}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{reward.description}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveReward(reward.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add New Reward */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add New Reward</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <select
                    value={newReward.type}
                    onChange={(e) => setNewReward(prev => ({ ...prev, type: e.target.value as TierReward['type'] }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {REWARD_TYPES.map(type => (
                      <option key={type.type} value={type.type}>{type.label}</option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Reward title"
                    value={newReward.title}
                    onChange={(e) => setNewReward(prev => ({ ...prev, title: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  
                  <input
                    type="text"
                    placeholder="Value (optional)"
                    value={newReward.value}
                    onChange={(e) => setNewReward(prev => ({ ...prev, value: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  
                  <button
                    onClick={handleAddReward}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Reward description"
                  value={newReward.description}
                  onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Additional Benefits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Additional Benefits (Optional)
              </label>
              
              <div className="space-y-2 mb-3">
                {formData.benefits?.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="flex-1 text-gray-900 dark:text-white">{benefit}</span>
                    <button
                      onClick={() => handleRemoveBenefit(index)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add additional benefit..."
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBenefit()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleAddBenefit}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voting Multiplier
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={formData.votingMultiplier || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, votingMultiplier: parseFloat(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fee Discount %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountPercentage || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  id="priorityAccess"
                  checked={formData.priorityAccess || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, priorityAccess: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="priorityAccess" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority Access
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : tier ? 'Update Tier' : 'Create Tier'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TierFormModal;