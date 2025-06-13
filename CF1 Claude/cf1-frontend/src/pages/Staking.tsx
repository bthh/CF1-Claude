import React, { useState } from 'react';
import { Lock, Unlock, TrendingUp, Clock, Award, AlertCircle } from 'lucide-react';
import { useCosmJS } from '../hooks/useCosmJS';
import { useNotifications } from '../hooks/useNotifications';
import { formatAmount, formatPercentage, formatTimeAgo } from '../utils/format';

interface StakingPool {
  id: string;
  name: string;
  stakingToken: {
    symbol: string;
    name: string;
    address: string;
  };
  rewardToken: {
    symbol: string;
    name: string;
    address: string;
  };
  totalStaked: number;
  apy: number;
  lockPeriod?: number; // in days
  minStake: number;
  myStake?: {
    amount: number;
    rewards: number;
    stakedAt: number;
    lockedUntil?: number;
  };
}

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: StakingPool;
  mode: 'stake' | 'unstake';
}

const StakeModal: React.FC<StakeModalProps> = ({ isOpen, onClose, pool, mode }) => {
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('0');
  const { stake, unstake } = useCosmJS();
  const { success, error } = useNotifications();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      if (mode === 'stake') {
        await stake(pool.id, amount, parseInt(lockPeriod) || undefined);
        success('Tokens staked successfully');
      } else {
        await unstake(pool.id, amount);
        success('Unstaking initiated');
      }
      onClose();
    } catch (err) {
      error('Transaction failed');
    }
  };

  const lockOptions = [
    { days: 0, bonus: 0, label: 'No Lock' },
    { days: 30, bonus: 5, label: '30 Days (+5% APY)' },
    { days: 90, bonus: 15, label: '90 Days (+15% APY)' },
    { days: 180, bonus: 30, label: '180 Days (+30% APY)' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {mode === 'stake' ? 'Stake Tokens' : 'Unstake Tokens'}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount ({pool.stakingToken.symbol})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="0.00"
          />
          {mode === 'stake' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum stake: {pool.minStake} {pool.stakingToken.symbol}
            </p>
          )}
        </div>

        {mode === 'stake' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lock Period (Optional)
            </label>
            <div className="space-y-2">
              {lockOptions.map((option) => (
                <label
                  key={option.days}
                  className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="radio"
                    value={option.days}
                    checked={lockPeriod === option.days.toString()}
                    onChange={(e) => setLockPeriod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                    {option.bonus > 0 && (
                      <span className="ml-2 text-green-600 text-sm">
                        {pool.apy + option.bonus}% APY
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {mode === 'unstake' && pool.myStake?.lockedUntil && pool.myStake.lockedUntil > Date.now() && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Your tokens are locked until {new Date(pool.myStake.lockedUntil).toLocaleDateString()}.
                  Early withdrawal will incur a 5% penalty.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {mode === 'stake' ? 'Stake' : 'Unstake'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Staking: React.FC = () => {
  const { isConnected } = useCosmJS();
  const { success } = useNotifications();
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [modalMode, setModalMode] = useState<'stake' | 'unstake'>('stake');
  const [showModal, setShowModal] = useState(false);

  const stakingPools: StakingPool[] = [
    {
      id: '1',
      name: 'CF1 Governance Staking',
      stakingToken: {
        symbol: 'CF1',
        name: 'CF1 Token',
        address: 'cosmos1...',
      },
      rewardToken: {
        symbol: 'CF1',
        name: 'CF1 Token',
        address: 'cosmos1...',
      },
      totalStaked: 5000000,
      apy: 15,
      minStake: 100,
      myStake: {
        amount: 1000,
        rewards: 15.5,
        stakedAt: Date.now() - 86400000 * 30,
      },
    },
    {
      id: '2',
      name: 'RWA-1 Liquidity Mining',
      stakingToken: {
        symbol: 'RWA1-LP',
        name: 'RWA-1/NTRN LP Token',
        address: 'cosmos1...',
      },
      rewardToken: {
        symbol: 'RWA-1',
        name: 'Manhattan Office Tower',
        address: 'cosmos1...',
      },
      totalStaked: 250000,
      apy: 25,
      minStake: 10,
    },
    {
      id: '3',
      name: 'Neutron Staking',
      stakingToken: {
        symbol: 'NTRN',
        name: 'Neutron',
        address: 'cosmos1...',
      },
      rewardToken: {
        symbol: 'CF1',
        name: 'CF1 Token',
        address: 'cosmos1...',
      },
      totalStaked: 1000000,
      apy: 8,
      lockPeriod: 21,
      minStake: 50,
      myStake: {
        amount: 500,
        rewards: 3.2,
        stakedAt: Date.now() - 86400000 * 7,
        lockedUntil: Date.now() + 86400000 * 14,
      },
    },
  ];

  const handleStake = (pool: StakingPool) => {
    setSelectedPool(pool);
    setModalMode('stake');
    setShowModal(true);
  };

  const handleUnstake = (pool: StakingPool) => {
    setSelectedPool(pool);
    setModalMode('unstake');
    setShowModal(true);
  };

  const handleClaimRewards = async (pool: StakingPool) => {
    try {
      const { claimRewards } = useCosmJS();
      await claimRewards(pool.id);
      success(`Claimed ${pool.myStake?.rewards} ${pool.rewardToken.symbol}`);
    } catch (err) {
      // Error handled by hook
    }
  };

  const totalStakedValue = stakingPools.reduce((sum, pool) => {
    return sum + (pool.myStake?.amount || 0);
  }, 0);

  const totalRewards = stakingPools.reduce((sum, pool) => {
    return sum + (pool.myStake?.rewards || 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Staking
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stake your tokens to earn rewards and participate in governance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Value Staked</p>
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatAmount(totalStakedValue)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Rewards</p>
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatAmount(totalRewards)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Average APY</p>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(16.5)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Positions</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stakingPools.filter(pool => pool.myStake).length}
          </p>
        </div>
      </div>

      {/* Staking Pools */}
      <div className="space-y-4">
        {stakingPools.map((pool) => (
          <div
            key={pool.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pool.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Stake {pool.stakingToken.symbol} → Earn {pool.rewardToken.symbol}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {formatPercentage(pool.apy)} APY
                </p>
                {pool.lockPeriod && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {pool.lockPeriod} day lock
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Staked</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatAmount(pool.totalStaked)} {pool.stakingToken.symbol}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Min Stake</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pool.minStake} {pool.stakingToken.symbol}
                </p>
              </div>
              
              {pool.myStake && (
                <>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">My Stake</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatAmount(pool.myStake.amount)} {pool.stakingToken.symbol}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rewards</p>
                    <p className="text-lg font-semibold text-green-600">
                      {pool.myStake.rewards.toFixed(2)} {pool.rewardToken.symbol}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {pool.myStake && (
                  <>
                    {pool.myStake.lockedUntil && pool.myStake.lockedUntil > Date.now() ? (
                      <div className="flex items-center space-x-1 text-sm text-orange-600">
                        <Lock className="w-4 h-4" />
                        <span>Locked until {new Date(pool.myStake.lockedUntil).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Staked {formatTimeAgo(pool.myStake.stakedAt)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {isConnected && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStake(pool)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Stake
                  </button>
                  
                  {pool.myStake && (
                    <>
                      <button
                        onClick={() => handleUnstake(pool)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Unstake
                      </button>
                      
                      {pool.myStake.rewards > 0 && (
                        <button
                          onClick={() => handleClaimRewards(pool)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Claim
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stake Modal */}
      {selectedPool && (
        <StakeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          pool={selectedPool}
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default Staking;