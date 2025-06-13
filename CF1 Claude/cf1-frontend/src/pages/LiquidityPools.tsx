import React, { useState } from 'react';
import { Plus, Minus, TrendingUp, Droplets, Info, Settings } from 'lucide-react';
import { useCosmJS } from '../hooks/useCosmJS';
import { useNotifications } from '../hooks/useNotifications';
import { formatAmount, formatPercentage } from '../utils/format';

interface Pool {
  id: string;
  tokenA: {
    symbol: string;
    name: string;
    amount: number;
  };
  tokenB: {
    symbol: string;
    name: string;
    amount: number;
  };
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  myLiquidity?: number;
  myShare?: number;
}

interface LiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: Pool;
  mode: 'add' | 'remove';
}

const LiquidityModal: React.FC<LiquidityModalProps> = ({ isOpen, onClose, pool, mode }) => {
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [percentage, setPercentage] = useState('50');
  const { addLiquidity, removeLiquidity } = useCosmJS();
  const { success, error } = useNotifications();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      if (mode === 'add') {
        // await addLiquidity(pool.id, amountA, amountB);
        success('Liquidity added successfully');
      } else {
        // await removeLiquidity(pool.id, percentage);
        success('Liquidity removed successfully');
      }
      onClose();
    } catch (err) {
      error('Transaction failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {mode === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
        </h2>

        {mode === 'add' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {pool.tokenA.symbol} Amount
              </label>
              <input
                type="number"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {pool.tokenB.symbol} Amount
              </label>
              <input
                type="number"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remove Percentage
              </label>
              <input
                type="range"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                min="0"
                max="100"
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>0%</span>
                <span className="font-semibold">{percentage}%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{pool.tokenA.symbol}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {((pool.myLiquidity || 0) * (parseInt(percentage) / 100) * 0.5).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{pool.tokenB.symbol}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {((pool.myLiquidity || 0) * (parseInt(percentage) / 100) * 0.5).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3 mt-6">
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
            {mode === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LiquidityPools: React.FC = () => {
  const { isConnected } = useCosmJS();
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'remove'>('add');
  const [showModal, setShowModal] = useState(false);
  const [filterMyPools, setFilterMyPools] = useState(false);

  const pools: Pool[] = [
    {
      id: '1',
      tokenA: { symbol: 'RWA-1', name: 'Manhattan Office Tower', amount: 10000 },
      tokenB: { symbol: 'NTRN', name: 'Neutron', amount: 50000 },
      totalLiquidity: 100000,
      volume24h: 25000,
      fees24h: 75,
      apy: 12.5,
      myLiquidity: 1000,
      myShare: 1,
    },
    {
      id: '2',
      tokenA: { symbol: 'RWA-2', name: 'Miami Luxury Apartments', amount: 5000 },
      tokenB: { symbol: 'NTRN', name: 'Neutron', amount: 25000 },
      totalLiquidity: 50000,
      volume24h: 15000,
      fees24h: 45,
      apy: 18.2,
    },
    {
      id: '3',
      tokenA: { symbol: 'RWA-3', name: 'London Retail Complex', amount: 7500 },
      tokenB: { symbol: 'NTRN', name: 'Neutron', amount: 37500 },
      totalLiquidity: 75000,
      volume24h: 20000,
      fees24h: 60,
      apy: 15.8,
      myLiquidity: 500,
      myShare: 0.67,
    },
  ];

  const filteredPools = filterMyPools ? pools.filter(pool => pool.myLiquidity) : pools;

  const handleAddLiquidity = (pool: Pool) => {
    setSelectedPool(pool);
    setModalMode('add');
    setShowModal(true);
  };

  const handleRemoveLiquidity = (pool: Pool) => {
    setSelectedPool(pool);
    setModalMode('remove');
    setShowModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Liquidity Pools
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Provide liquidity to earn trading fees and rewards
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Value Locked</p>
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatAmount(225000)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatAmount(60000)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">24h Fees</p>
            <Info className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatAmount(180)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">My Liquidity</p>
            <Settings className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatAmount(1500)}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filterMyPools}
            onChange={(e) => setFilterMyPools(e.target.checked)}
            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show only my pools</span>
        </label>
      </div>

      {/* Pools List */}
      <div className="space-y-4">
        {filteredPools.map((pool) => (
          <div
            key={pool.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {pool.tokenA.symbol.slice(0, 2)}
                  </div>
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {pool.tokenB.symbol.slice(0, 2)}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pool.tokenA.symbol} / {pool.tokenB.symbol}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {pool.tokenA.name} / {pool.tokenB.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isConnected && (
                  <>
                    <button
                      onClick={() => handleAddLiquidity(pool)}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                    {pool.myLiquidity && (
                      <button
                        onClick={() => handleRemoveLiquidity(pool)}
                        className="flex items-center space-x-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Liquidity</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${formatAmount(pool.totalLiquidity)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${formatAmount(pool.volume24h)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">24h Fees</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${pool.fees24h.toFixed(2)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">APY</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatPercentage(pool.apy)}
                </p>
              </div>
              
              {pool.myLiquidity && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">My Liquidity</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${formatAmount(pool.myLiquidity)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {pool.myShare}% share
                  </p>
                </div>
              )}
            </div>

            {/* Pool Composition */}
            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-gray-400">Pool:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatAmount(pool.tokenA.amount)} {pool.tokenA.symbol}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">+</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatAmount(pool.tokenB.amount)} {pool.tokenB.symbol}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  1 {pool.tokenA.symbol} = {(pool.tokenB.amount / pool.tokenA.amount).toFixed(2)} {pool.tokenB.symbol}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Liquidity Modal */}
      {selectedPool && (
        <LiquidityModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          pool={selectedPool}
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default LiquidityPools;