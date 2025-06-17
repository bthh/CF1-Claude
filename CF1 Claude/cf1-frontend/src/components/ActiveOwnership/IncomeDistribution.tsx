import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Eye,
  Award
} from 'lucide-react';
import { AnimatedButton, AnimatedCounter } from '../LoadingStates/TransitionWrapper';
import { SwipeableModal } from '../GestureComponents/SwipeableModal';

interface Distribution {
  id: string;
  assetId: string;
  assetName: string;
  totalAmount: number;
  currency: 'USDC' | 'USDT' | 'USD';
  snapshotBlock: number;
  snapshotDate: number;
  distributionDate: number;
  status: 'pending' | 'active' | 'completed' | 'expired';
  totalHolders: number;
  claimedCount: number;
  userEligible: boolean;
  userShare?: number;
  userClaimed: boolean;
  description: string;
  period: string; // e.g., "Q1 2024", "January 2024"
}

interface IncomeDistributionProps {
  assetId?: string;
  className?: string;
}

export const IncomeDistribution: React.FC<IncomeDistributionProps> = ({
  assetId,
  className = ''
}) => {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    loadDistributions();
  }, [assetId]);

  const loadDistributions = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDistributions: Distribution[] = [
        {
          id: 'dist_1',
          assetId: 'asset_1',
          assetName: 'Green Energy Solar Farm',
          totalAmount: 125000,
          currency: 'USDC',
          snapshotBlock: 12345678,
          snapshotDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
          distributionDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
          status: 'active',
          totalHolders: 342,
          claimedCount: 189,
          userEligible: true,
          userShare: 245.67,
          userClaimed: false,
          description: 'Q1 2024 net operating income from solar energy production',
          period: 'Q1 2024'
        },
        {
          id: 'dist_2',
          assetId: 'asset_1',
          assetName: 'Green Energy Solar Farm',
          totalAmount: 98000,
          currency: 'USDC',
          snapshotBlock: 12200000,
          snapshotDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
          distributionDate: Date.now() - 85 * 24 * 60 * 60 * 1000,
          status: 'completed',
          totalHolders: 328,
          claimedCount: 328,
          userEligible: true,
          userShare: 198.45,
          userClaimed: true,
          description: 'Q4 2023 net operating income from solar energy production',
          period: 'Q4 2023'
        },
        {
          id: 'dist_3',
          assetId: 'asset_2',
          assetName: 'Downtown Commercial Property',
          totalAmount: 250000,
          currency: 'USDC',
          snapshotBlock: 12400000,
          snapshotDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
          distributionDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
          status: 'pending',
          totalHolders: 156,
          claimedCount: 0,
          userEligible: true,
          userShare: 1250.00,
          userClaimed: false,
          description: 'Q1 2024 rental income from commercial tenants',
          period: 'Q1 2024'
        }
      ];

      // Filter by assetId if provided
      const filtered = assetId 
        ? mockDistributions.filter(d => d.assetId === assetId)
        : mockDistributions;

      setDistributions(filtered);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load distributions:', error);
      setLoading(false);
    }
  };

  const handleClaimIncome = async (distributionId: string) => {
    setClaiming(distributionId);
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update distribution status
      setDistributions(prev => 
        prev.map(d => 
          d.id === distributionId 
            ? { ...d, userClaimed: true, claimedCount: d.claimedCount + 1 }
            : d
        )
      );
      
      // Show success notification
      console.log('Income claimed successfully!');
    } catch (error) {
      console.error('Failed to claim income:', error);
    } finally {
      setClaiming(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 dark:bg-green-900/20';
      case 'completed': return 'text-blue-700 bg-blue-100 dark:bg-blue-900/20';
      case 'pending': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20';
      case 'expired': return 'text-red-700 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const totalUserIncome = distributions
    .filter(d => d.userClaimed && d.userShare)
    .reduce((sum, d) => sum + d.userShare!, 0);

  const pendingUserIncome = distributions
    .filter(d => !d.userClaimed && d.userEligible && d.userShare && d.status === 'active')
    .reduce((sum, d) => sum + d.userShare!, 0);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Income Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Income Distribution Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Total Earned</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  $<AnimatedCounter value={totalUserIncome} decimals={2} />
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              From {distributions.filter(d => d.userClaimed).length} distributions
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Available to Claim</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  $<AnimatedCounter value={pendingUserIncome} decimals={2} />
                </p>
              </div>
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              From {distributions.filter(d => !d.userClaimed && d.status === 'active').length} active distributions
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Next Distribution</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {distributions.find(d => d.status === 'pending') ? 
                    new Date(distributions.find(d => d.status === 'pending')!.distributionDate).toLocaleDateString() :
                    'TBD'
                  }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              Estimated based on asset performance
            </p>
          </div>
        </div>
      </div>

      {/* Distribution List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Income Distributions
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <AnimatePresence>
            {distributions.map((distribution, index) => (
              <motion.div
                key={distribution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {distribution.assetName} - {distribution.period}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(distribution.status)}`}>
                        {getStatusIcon(distribution.status)}
                        <span className="ml-1 capitalize">{distribution.status}</span>
                      </span>
                      {distribution.userEligible && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          <Award className="w-3 h-3 mr-1" />
                          Eligible
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {distribution.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${distribution.totalAmount.toLocaleString()} {distribution.currency}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Your Share:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {distribution.userShare ? `$${distribution.userShare.toFixed(2)}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {distribution.claimedCount}/{distribution.totalHolders} claimed
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Snapshot Date:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(distribution.snapshotDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Claim Progress</span>
                        <span>{Math.round((distribution.claimedCount / distribution.totalHolders) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(distribution.claimedCount / distribution.totalHolders) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-6">
                    <AnimatedButton
                      onClick={() => {
                        setSelectedDistribution(distribution);
                        setShowDetailModal(true);
                      }}
                      variant="secondary"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </AnimatedButton>

                    {distribution.status === 'active' && 
                     distribution.userEligible && 
                     !distribution.userClaimed && (
                      <AnimatedButton
                        onClick={() => handleClaimIncome(distribution.id)}
                        disabled={claiming === distribution.id}
                        loading={claiming === distribution.id}
                        variant="primary"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Claim ${distribution.userShare?.toFixed(2)}</span>
                      </AnimatedButton>
                    )}

                    {distribution.userClaimed && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Claimed</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {distributions.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No income distributions available</p>
              <p className="text-sm mt-1">Income distributions will appear here when assets generate revenue</p>
            </div>
          )}
        </div>
      </div>

      {/* Distribution Detail Modal */}
      <SwipeableModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Distribution Details"
        className="max-w-4xl mx-auto"
      >
        {selectedDistribution && (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedDistribution.assetName}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {selectedDistribution.period} Income Distribution
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDistribution.status)}`}>
                {getStatusIcon(selectedDistribution.status)}
                <span className="ml-2 capitalize">{selectedDistribution.status}</span>
              </span>
            </div>

            {/* Distribution Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Distribution Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Amount:</span>
                    <span className="font-medium">${selectedDistribution.totalAmount.toLocaleString()} {selectedDistribution.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Holders:</span>
                    <span className="font-medium">{selectedDistribution.totalHolders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Claims Processed:</span>
                    <span className="font-medium">{selectedDistribution.claimedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Snapshot Block:</span>
                    <span className="font-medium font-mono">{selectedDistribution.snapshotBlock.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Your Allocation</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Eligible:</span>
                    <span className={`font-medium ${selectedDistribution.userEligible ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedDistribution.userEligible ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {selectedDistribution.userShare && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Your Share:</span>
                      <span className="font-medium">${selectedDistribution.userShare.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${selectedDistribution.userClaimed ? 'text-green-600' : 'text-blue-600'}`}>
                      {selectedDistribution.userClaimed ? 'Claimed' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Snapshot Taken</p>
                    <p className="text-sm text-gray-500">{new Date(selectedDistribution.snapshotDate).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Distribution Active</p>
                    <p className="text-sm text-gray-500">{new Date(selectedDistribution.distributionDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedDistribution.description}
              </p>
            </div>

            {/* Action Button */}
            {selectedDistribution.status === 'active' && 
             selectedDistribution.userEligible && 
             !selectedDistribution.userClaimed && (
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <AnimatedButton
                  onClick={() => {
                    handleClaimIncome(selectedDistribution.id);
                    setShowDetailModal(false);
                  }}
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Claim ${selectedDistribution.userShare?.toFixed(2)} {selectedDistribution.currency}</span>
                </AnimatedButton>
              </div>
            )}
          </div>
        )}
      </SwipeableModal>
    </div>
  );
};