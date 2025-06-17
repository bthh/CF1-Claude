import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Users, 
  Plus, 
  Settings, 
  Award,
  Star,
  CheckCircle,
  X,
  Search,
  Filter,
  Eye,
  Gift,
  Lock,
  Unlock
} from 'lucide-react';
import { AnimatedButton, AnimatedCounter } from '../LoadingStates/TransitionWrapper';
import { SwipeableModal } from '../GestureComponents/SwipeableModal';

interface Holder {
  id: string;
  walletAddress: string;
  tokenBalance: number;
  totalInvested: number;
  joinDate: number;
  lastActivity: number;
  isPremier: boolean;
  premierSince?: number;
  tier: 'standard' | 'premier' | 'vip';
  engagement: {
    governance: number; // votes participated
    claims: number; // income distributions claimed
    community: number; // community activity score
  };
  verification: {
    kyc: boolean;
    accredited: boolean;
  };
}

interface PremierCriteria {
  id: string;
  name: string;
  description: string;
  type: 'balance' | 'investment' | 'time' | 'engagement' | 'manual';
  enabled: boolean;
  conditions: {
    minTokenBalance?: number;
    minInvestment?: number;
    minHoldingDays?: number;
    minGovernanceVotes?: number;
    minClaimedDistributions?: number;
  };
}

interface PremierBenefit {
  id: string;
  title: string;
  description: string;
  type: 'access' | 'information' | 'communication' | 'rewards';
  enabled: boolean;
  tiers: ('premier' | 'vip')[];
}

interface PremierHolderSystemProps {
  assetId: string;
  isCreator?: boolean;
  className?: string;
}

export const PremierHolderSystem: React.FC<PremierHolderSystemProps> = ({
  assetId,
  isCreator = false,
  className = ''
}) => {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [criteria, setCriteria] = useState<PremierCriteria[]>([]);
  const [benefits, setBenefits] = useState<PremierBenefit[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'holders' | 'criteria' | 'benefits'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHolders, setSelectedHolders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPremierData();
  }, [assetId]);

  const loadPremierData = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock holders data
      const mockHolders: Holder[] = [
        {
          id: '1',
          walletAddress: '0x1234...5678',
          tokenBalance: 15000,
          totalInvested: 50000,
          joinDate: Date.now() - 180 * 24 * 60 * 60 * 1000,
          lastActivity: Date.now() - 2 * 24 * 60 * 60 * 1000,
          isPremier: true,
          premierSince: Date.now() - 90 * 24 * 60 * 60 * 1000,
          tier: 'vip',
          engagement: {
            governance: 12,
            claims: 4,
            community: 85
          },
          verification: {
            kyc: true,
            accredited: true
          }
        },
        {
          id: '2',
          walletAddress: '0xabcd...efgh',
          tokenBalance: 8500,
          totalInvested: 25000,
          joinDate: Date.now() - 120 * 24 * 60 * 60 * 1000,
          lastActivity: Date.now() - 1 * 24 * 60 * 60 * 1000,
          isPremier: true,
          premierSince: Date.now() - 60 * 24 * 60 * 60 * 1000,
          tier: 'premier',
          engagement: {
            governance: 8,
            claims: 3,
            community: 62
          },
          verification: {
            kyc: true,
            accredited: false
          }
        },
        {
          id: '3',
          walletAddress: '0x9876...5432',
          tokenBalance: 3200,
          totalInvested: 12000,
          joinDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
          lastActivity: Date.now() - 7 * 24 * 60 * 60 * 1000,
          isPremier: false,
          tier: 'standard',
          engagement: {
            governance: 2,
            claims: 1,
            community: 28
          },
          verification: {
            kyc: true,
            accredited: false
          }
        }
      ];

      // Mock criteria
      const mockCriteria: PremierCriteria[] = [
        {
          id: 'criteria_1',
          name: 'Large Holder',
          description: 'Holders with significant token balances',
          type: 'balance',
          enabled: true,
          conditions: {
            minTokenBalance: 10000
          }
        },
        {
          id: 'criteria_2',
          name: 'High Investor',
          description: 'Users who have invested substantial amounts',
          type: 'investment',
          enabled: true,
          conditions: {
            minInvestment: 25000
          }
        },
        {
          id: 'criteria_3',
          name: 'Long-term Holder',
          description: 'Holders who have maintained positions for extended periods',
          type: 'time',
          enabled: true,
          conditions: {
            minHoldingDays: 90
          }
        },
        {
          id: 'criteria_4',
          name: 'Active Governance Participant',
          description: 'Users who actively participate in governance decisions',
          type: 'engagement',
          enabled: false,
          conditions: {
            minGovernanceVotes: 5
          }
        }
      ];

      // Mock benefits
      const mockBenefits: PremierBenefit[] = [
        {
          id: 'benefit_1',
          title: 'Exclusive Financial Reports',
          description: 'Monthly detailed financial performance reports with asset insights',
          type: 'information',
          enabled: true,
          tiers: ['premier', 'vip']
        },
        {
          id: 'benefit_2',
          title: 'Direct Creator Communication',
          description: 'Access to private Discord channel with the asset creator',
          type: 'communication',
          enabled: true,
          tiers: ['vip']
        },
        {
          id: 'benefit_3',
          title: 'Early Distribution Notifications',
          description: 'Advanced notice of upcoming income distributions',
          type: 'information',
          enabled: true,
          tiers: ['premier', 'vip']
        },
        {
          id: 'benefit_4',
          title: 'VIP Governance Access',
          description: 'Priority access to propose and vote on governance matters',
          type: 'access',
          enabled: false,
          tiers: ['vip']
        },
        {
          id: 'benefit_5',
          title: 'Bonus Reward Multiplier',
          description: '1.1x multiplier on income distributions',
          type: 'rewards',
          enabled: false,
          tiers: ['vip']
        }
      ];

      setHolders(mockHolders);
      setCriteria(mockCriteria);
      setBenefits(mockBenefits);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load premier data:', error);
      setLoading(false);
    }
  };

  const handlePromoteHolders = async () => {
    if (selectedHolders.length === 0) return;

    try {
      // Update selected holders to premier status
      setHolders(prev => 
        prev.map(holder => 
          selectedHolders.includes(holder.id)
            ? { 
                ...holder, 
                isPremier: true, 
                tier: 'premier' as const,
                premierSince: Date.now()
              }
            : holder
        )
      );

      setSelectedHolders([]);
      console.log(`Promoted ${selectedHolders.length} holders to Premier status`);
    } catch (error) {
      console.error('Failed to promote holders:', error);
    }
  };

  const handleRemovePremier = async (holderId: string) => {
    try {
      setHolders(prev => 
        prev.map(holder => 
          holder.id === holderId
            ? { 
                ...holder, 
                isPremier: false, 
                tier: 'standard' as const,
                premierSince: undefined
              }
            : holder
        )
      );

      console.log('Removed Premier status');
    } catch (error) {
      console.error('Failed to remove Premier status:', error);
    }
  };

  const handleUpdateCriteria = (criteriaId: string, enabled: boolean) => {
    setCriteria(prev => 
      prev.map(c => c.id === criteriaId ? { ...c, enabled } : c)
    );

    // Auto-apply criteria if enabled
    if (enabled) {
      applyAutomaticCriteria(criteriaId);
    }
  };

  const applyAutomaticCriteria = (criteriaId: string) => {
    const criterion = criteria.find(c => c.id === criteriaId);
    if (!criterion) return;

    setHolders(prev => 
      prev.map(holder => {
        let shouldBePremier = holder.isPremier;

        switch (criterion.type) {
          case 'balance':
            if (criterion.conditions.minTokenBalance && 
                holder.tokenBalance >= criterion.conditions.minTokenBalance) {
              shouldBePremier = true;
            }
            break;
          case 'investment':
            if (criterion.conditions.minInvestment && 
                holder.totalInvested >= criterion.conditions.minInvestment) {
              shouldBePremier = true;
            }
            break;
          case 'time':
            if (criterion.conditions.minHoldingDays) {
              const holdingDays = (Date.now() - holder.joinDate) / (1000 * 60 * 60 * 24);
              if (holdingDays >= criterion.conditions.minHoldingDays) {
                shouldBePremier = true;
              }
            }
            break;
          case 'engagement':
            if (criterion.conditions.minGovernanceVotes && 
                holder.engagement.governance >= criterion.conditions.minGovernanceVotes) {
              shouldBePremier = true;
            }
            break;
        }

        return shouldBePremier && !holder.isPremier
          ? { 
              ...holder, 
              isPremier: true, 
              tier: 'premier' as const,
              premierSince: Date.now()
            }
          : holder;
      })
    );
  };

  const filteredHolders = holders.filter(holder => {
    const matchesSearch = searchTerm === '' || 
      holder.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = filterTier === '' || holder.tier === filterTier;
    
    return matchesSearch && matchesTier;
  });

  const stats = {
    totalHolders: holders.length,
    premierHolders: holders.filter(h => h.isPremier).length,
    vipHolders: holders.filter(h => h.tier === 'vip').length,
    totalTokens: holders.reduce((sum, h) => sum + h.tokenBalance, 0),
    premierTokens: holders.filter(h => h.isPremier).reduce((sum, h) => sum + h.tokenBalance, 0)
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'vip': return 'text-purple-700 bg-purple-100 dark:bg-purple-900/20';
      case 'premier': return 'text-blue-700 bg-blue-100 dark:bg-blue-900/20';
      case 'standard': return 'text-gray-700 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'vip': return <Crown className="w-4 h-4" />;
      case 'premier': return <Star className="w-4 h-4" />;
      case 'standard': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Crown className="w-5 h-5 mr-2 text-purple-600" />
            Premier Holder System
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage exclusive access and benefits for valued investors
          </p>
        </div>
        
        {isCreator && (
          <div className="flex items-center space-x-3">
            {selectedHolders.length > 0 && (
              <AnimatedButton
                onClick={handlePromoteHolders}
                variant="primary"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Award className="w-4 h-4" />
                <span>Promote {selectedHolders.length} to Premier</span>
              </AnimatedButton>
            )}
            
            <AnimatedButton
              onClick={() => setShowAddModal(true)}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Settings className="w-4 h-4" />
              <span>Manage System</span>
            </AnimatedButton>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Holders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={stats.totalHolders} />
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Premier Holders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={stats.premierHolders} />
              </p>
            </div>
            <Star className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalHolders > 0 ? Math.round((stats.premierHolders / stats.totalHolders) * 100) : 0}% of total
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">VIP Holders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={stats.vipHolders} />
              </p>
            </div>
            <Crown className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Premier Token %</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalTokens > 0 ? Math.round((stats.premierTokens / stats.totalTokens) * 100) : 0}%
              </p>
            </div>
            <Award className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Benefits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={benefits.filter(b => b.enabled).length} />
              </p>
            </div>
            <Gift className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'holders', label: 'Holders', icon: Users },
              { id: 'criteria', label: 'Auto Criteria', icon: Settings },
              { id: 'benefits', label: 'Benefits', icon: Gift }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'holders' && (
              <motion.div
                key="holders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by wallet address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-700"
                    />
                  </div>

                  <select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="">All Tiers</option>
                    <option value="vip">VIP</option>
                    <option value="premier">Premier</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>

                {/* Holders List */}
                <div className="space-y-3">
                  {filteredHolders.map((holder) => (
                    <motion.div
                      key={holder.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {isCreator && (
                            <input
                              type="checkbox"
                              checked={selectedHolders.includes(holder.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedHolders(prev => [...prev, holder.id]);
                                } else {
                                  setSelectedHolders(prev => prev.filter(id => id !== holder.id));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                {holder.walletAddress}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(holder.tier)}`}>
                                {getTierIcon(holder.tier)}
                                <span className="ml-1 capitalize">{holder.tier}</span>
                              </span>
                              {holder.verification.kyc && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Token Balance:</span>
                                <p className="font-medium">{holder.tokenBalance.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Total Invested:</span>
                                <p className="font-medium">${holder.totalInvested.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Governance Votes:</span>
                                <p className="font-medium">{holder.engagement.governance}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Member Since:</span>
                                <p className="font-medium">{new Date(holder.joinDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {isCreator && (
                          <div className="flex items-center space-x-2">
                            {holder.isPremier ? (
                              <AnimatedButton
                                onClick={() => handleRemovePremier(holder.id)}
                                variant="secondary"
                                size="sm"
                                className="flex items-center space-x-1"
                              >
                                <X className="w-4 h-4" />
                                <span>Remove Premier</span>
                              </AnimatedButton>
                            ) : (
                              <AnimatedButton
                                onClick={() => {
                                  setHolders(prev => 
                                    prev.map(h => 
                                      h.id === holder.id 
                                        ? { ...h, isPremier: true, tier: 'premier' as const, premierSince: Date.now() }
                                        : h
                                    )
                                  );
                                }}
                                variant="primary"
                                size="sm"
                                className="flex items-center space-x-1"
                              >
                                <Award className="w-4 h-4" />
                                <span>Make Premier</span>
                              </AnimatedButton>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'criteria' && isCreator && (
              <motion.div
                key="criteria"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Automatic Premier Criteria</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Enable automatic promotion to Premier status based on holder activity and investment levels.
                  </p>
                </div>

                {criteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {criterion.name}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            criterion.enabled 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {criterion.enabled ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                            {criterion.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {criterion.description}
                        </p>
                        
                        {/* Criteria conditions */}
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {criterion.conditions.minTokenBalance && (
                            <span>Min tokens: {criterion.conditions.minTokenBalance.toLocaleString()}</span>
                          )}
                          {criterion.conditions.minInvestment && (
                            <span>Min investment: ${criterion.conditions.minInvestment.toLocaleString()}</span>
                          )}
                          {criterion.conditions.minHoldingDays && (
                            <span>Min holding period: {criterion.conditions.minHoldingDays} days</span>
                          )}
                          {criterion.conditions.minGovernanceVotes && (
                            <span>Min governance votes: {criterion.conditions.minGovernanceVotes}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={criterion.enabled}
                            onChange={(e) => handleUpdateCriteria(criterion.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {selectedTab === 'benefits' && (
              <motion.div
                key="benefits"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {benefits.map((benefit) => (
                  <div
                    key={benefit.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {benefit.title}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            benefit.enabled 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {benefit.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {benefit.description}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Available to:</span>
                          {benefit.tiers.map((tier) => (
                            <span
                              key={tier}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(tier)}`}
                            >
                              {getTierIcon(tier)}
                              <span className="ml-1 capitalize">{tier}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {isCreator && (
                        <div className="flex items-center space-x-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={benefit.enabled}
                              onChange={(e) => {
                                setBenefits(prev => 
                                  prev.map(b => 
                                    b.id === benefit.id ? { ...b, enabled: e.target.checked } : b
                                  )
                                );
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Management Modal */}
      <SwipeableModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Premier System Management"
        className="max-w-2xl mx-auto"
      >
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-4">
                <AnimatedButton
                  onClick={() => console.log('Apply all criteria')}
                  variant="primary"
                  className="w-full"
                >
                  Apply All Criteria
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => console.log('Bulk promote')}
                  variant="secondary"
                  className="w-full"
                >
                  Bulk Promote
                </AnimatedButton>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">System Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto-apply criteria changes</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Send notifications to promoted holders</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Require manual approval for VIP</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>
              </div>
            </div>
          </div>
        </div>
      </SwipeableModal>
    </div>
  );
};