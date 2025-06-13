import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Shield, PiggyBank, Zap, Users, BarChart3, Plus } from 'lucide-react';
import { useCosmJS } from '../hooks/useCosmJS';
import { useNotifications } from '../hooks/useNotifications';
import { formatAmount, formatPercentage, formatTimeAgo } from '../utils/format';

interface LendingPool {
  id: string;
  name: string;
  assetDenom: string;
  assetSymbol: string;
  totalSupplied: number;
  totalBorrowed: number;
  supplyAPY: number;
  borrowAPR: number;
  utilizationRate: number;
  reserveFactor: number;
  liquidationThreshold: number;
  collateralFactor: number;
  mySupplied?: number;
  myBorrowed?: number;
  healthFactor?: number;
}

interface LendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: LendingPool;
  mode: 'supply' | 'borrow' | 'repay';
  userBalance: number;
  onTransactionComplete: () => void;
}

const LendingModal: React.FC<LendingModalProps> = ({ isOpen, onClose, pool, mode, userBalance, onTransactionComplete }) => {
  const [amount, setAmount] = useState('');
  const [collateralTokenId, setCollateralTokenId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { supplyToPool, borrowFromPool, repayLoan, depositCollateral } = useCosmJS();
  const { success, error } = useNotifications();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      error('Please enter a valid amount');
      return;
    }

    // Validate user has enough balance for supply/repay
    if ((mode === 'supply' || mode === 'repay') && parseFloat(amount) > userBalance) {
      error(`Insufficient balance. You have ${userBalance.toFixed(2)} ${pool.assetSymbol}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const amountInMicroUnits = (parseFloat(amount) * 1000000).toString();
      
      if (mode === 'supply') {
        const result = await supplyToPool(pool.id, amountInMicroUnits);
        success(`Successfully supplied ${amount} ${pool.assetSymbol}`);
        console.log('Supply result:', result);
      } else if (mode === 'borrow') {
        const result = await borrowFromPool(pool.id, amountInMicroUnits);
        success(`Successfully borrowed ${amount} ${pool.assetSymbol}`);
        console.log('Borrow result:', result);
      } else if (mode === 'repay') {
        const result = await repayLoan(pool.id, amountInMicroUnits);
        success(`Successfully repaid ${amount} ${pool.assetSymbol}`);
        console.log('Repay result:', result);
      }
      
      // Refresh data and close modal
      onTransactionComplete();
      onClose();
      setAmount('');
    } catch (err: any) {
      error(err.message || 'Transaction failed');
      console.error('Transaction error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepositCollateral = async () => {
    try {
      await depositCollateral(pool.id, 'token_contract_address', collateralTokenId, '1000000');
      success('Collateral deposited successfully');
    } catch (err) {
      error('Failed to deposit collateral');
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'supply': return `Supply ${pool.assetSymbol}`;
      case 'borrow': return `Borrow ${pool.assetSymbol}`;
      case 'repay': return `Repay ${pool.assetSymbol}`;
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'supply': return 'Supply';
      case 'borrow': return 'Borrow';
      case 'repay': return 'Repay';
    }
  };

  const getButtonColor = () => {
    switch (mode) {
      case 'supply': return 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800';
      case 'borrow': return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';
      case 'repay': return 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {getModalTitle()}
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6">

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {mode === 'supply' ? 'Supply APY' : mode === 'borrow' ? 'Borrow APR' : 'Current Debt'}
                  </p>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">
                    {mode === 'supply' ? formatPercentage(pool.supplyAPY) : 
                     mode === 'borrow' ? formatPercentage(pool.borrowAPR) :
                     formatAmount(pool.myBorrowed || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Utilization</p>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">
                    {formatPercentage(pool.utilizationRate)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount ({pool.assetSymbol})
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setAmount(userBalance.toString())}
                  className="absolute right-3 top-3 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm transition-all duration-200"
                >
                  MAX
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Available: {userBalance.toFixed(2)} {pool.assetSymbol}
              </p>
            </div>

            {mode === 'borrow' && (
              <>
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        Collateral Required
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        You need to deposit RWA tokens as collateral before borrowing.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    RWA Token ID (Collateral)
                  </label>
                  <input
                    type="text"
                    value={collateralTokenId}
                    onChange={(e) => setCollateralTokenId(e.target.value)}
                    placeholder="Enter RWA token ID"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                  <button
                    onClick={handleDepositCollateral}
                    disabled={!collateralTokenId}
                    className="mt-3 w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    Deposit Collateral
                  </button>
                </div>
              </>
            )}

            {pool.healthFactor && pool.healthFactor < 1.2 && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl p-4 shadow-sm">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                      Low Health Factor: {pool.healthFactor.toFixed(2)}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      Your position is at risk of liquidation. Consider repaying or adding collateral.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!amount || isSubmitting}
                className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${getButtonColor()}`}
              >
                {isSubmitting ? 'Processing...' : getButtonText()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPoolCreated: () => void;
}

const CreatePoolModal: React.FC<CreatePoolModalProps> = ({ isOpen, onClose, onPoolCreated }) => {
  const [poolId, setPoolId] = useState('');
  const [assetDenom, setAssetDenom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createLendingPool } = useCosmJS();
  const { success, error } = useNotifications();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!poolId || !assetDenom) {
      error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createLendingPool(poolId, assetDenom);
      success(`Successfully created lending pool: ${poolId}`);
      console.log('Pool creation result:', result);
      onPoolCreated();
      onClose();
      setPoolId('');
      setAssetDenom('');
    } catch (err: any) {
      error(err.message || 'Failed to create lending pool');
      console.error('Pool creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Create Lending Pool
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6">

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pool ID
              </label>
              <input
                type="text"
                value={poolId}
                onChange={(e) => setPoolId(e.target.value)}
                placeholder="e.g., pool_4"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asset Denomination
              </label>
              <select
                value={assetDenom}
                onChange={(e) => setAssetDenom(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              >
                <option value="">Select asset...</option>
                <option value="untrn">NTRN (untrn)</option>
                <option value="ibc/USD">USD (ibc/USD)</option>
                <option value="ibc/ETH">ETH (ibc/ETH)</option>
                <option value="rwa1">RWA-1 (rwa1)</option>
              </select>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Creating a pool will initialize it with default parameters:
                6% supply APY, 8% borrow APR, 75% collateral factor, and 85% liquidation threshold.
              </p>
            </div>

            <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!poolId || !assetDenom || isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                {isSubmitting ? 'Creating...' : 'Create Pool'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Lending: React.FC = () => {
  const { isConnected, balance, address } = useCosmJS();
  const [selectedPool, setSelectedPool] = useState<LendingPool | null>(null);
  const [modalMode, setModalMode] = useState<'supply' | 'borrow' | 'repay'>('supply');
  const [showModal, setShowModal] = useState(false);
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [pools, setPools] = useState<LendingPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});

  // Load lending pools and user data
  useEffect(() => {
    loadLendingData();
  }, [isConnected, address]);

  const loadLendingData = async () => {
    setLoading(true);
    try {
      // In demo mode, use mock data
      // In real mode, would query contract: cosmjsClient.queryAllLendingPools()
      const mockPools = await simulateLoadPools();
      setPools(mockPools);
      
      if (isConnected) {
        // Load user balances
        const balances = await simulateLoadBalances();
        setUserBalances(balances);
      }
    } catch (error) {
      console.error('Failed to load lending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateLoadPools = async (): Promise<LendingPool[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: '1',
        name: 'NTRN Lending Pool',
        assetDenom: 'untrn',
        assetSymbol: 'NTRN',
        totalSupplied: 1000000,
        totalBorrowed: 750000,
        supplyAPY: 6.5,
        borrowAPR: 8.2,
        utilizationRate: 75,
        reserveFactor: 10,
        liquidationThreshold: 85,
        collateralFactor: 75,
        mySupplied: isConnected ? 5000 : 0,
        myBorrowed: isConnected ? 2000 : 0,
        healthFactor: isConnected ? 2.1 : undefined,
      },
      {
        id: '2',
        name: 'USD Lending Pool',
        assetDenom: 'ibc/USD',
        assetSymbol: 'USD',
        totalSupplied: 500000,
        totalBorrowed: 300000,
        supplyAPY: 4.2,
        borrowAPR: 6.8,
        utilizationRate: 60,
        reserveFactor: 10,
        liquidationThreshold: 85,
        collateralFactor: 80,
        mySupplied: 0,
        myBorrowed: 0,
      },
      {
        id: '3',
        name: 'RWA-1 Backed Pool',
        assetDenom: 'rwa1',
        assetSymbol: 'RWA-1',
        totalSupplied: 250000,
        totalBorrowed: 150000,
        supplyAPY: 12.5,
        borrowAPR: 15.0,
        utilizationRate: 60,
        reserveFactor: 15,
        liquidationThreshold: 80,
        collateralFactor: 70,
        mySupplied: isConnected ? 1000 : 0,
        myBorrowed: isConnected ? 500 : 0,
        healthFactor: isConnected ? 1.8 : undefined,
      },
    ];
  };

  const simulateLoadBalances = async (): Promise<Record<string, number>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      'untrn': parseFloat(balance) / 1000000 || 50, // Convert from micro units
      'ibc/USD': 1000,
      'rwa1': 500,
    };
  };

  const handleAction = (pool: LendingPool, action: 'supply' | 'borrow' | 'repay') => {
    setSelectedPool(pool);
    setModalMode(action);
    setShowModal(true);
  };

  const handleTransactionComplete = () => {
    // Reload data after successful transaction
    loadLendingData();
  };

  const totalSupplied = pools.reduce((sum, pool) => sum + (pool.mySupplied || 0), 0);
  const totalBorrowed = pools.reduce((sum, pool) => sum + (pool.myBorrowed || 0), 0);
  const averageHealthFactor = pools
    .filter(pool => pool.healthFactor)
    .reduce((sum, pool) => sum + (pool.healthFactor || 0), 0) / 
    pools.filter(pool => pool.healthFactor).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lending & Borrowing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Lend your assets to earn yield or borrow against your RWA token collateral
          </p>
        </div>
        {isConnected && (
          <button
            onClick={() => setShowCreatePool(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Create Pool</span>
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Supplied</p>
            <PiggyBank className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatAmount(totalSupplied)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Borrowed</p>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatAmount(totalBorrowed)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Net Position</p>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatAmount(totalSupplied - totalBorrowed)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Health Factor</p>
            <Shield className="w-5 h-5 text-orange-600" />
          </div>
          <p className={`text-2xl font-bold ${averageHealthFactor > 1.5 ? 'text-green-600' : averageHealthFactor > 1.2 ? 'text-yellow-600' : 'text-red-600'}`}>
            {averageHealthFactor ? averageHealthFactor.toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Lending Pools */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lending Pools</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading pools...</span>
          </div>
        ) : pools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No lending pools available</p>
            {isConnected && (
              <button
                onClick={() => setShowCreatePool(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                Create First Pool
              </button>
            )}
          </div>
        ) : (
          pools.map((pool) => (
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
                  {pool.assetSymbol} • {formatPercentage(pool.utilizationRate)} utilized
                </p>
              </div>
              
              <div className="text-right">
                <div className="flex space-x-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Supply APY</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatPercentage(pool.supplyAPY)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Borrow APR</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatPercentage(pool.borrowAPR)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Supplied</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatAmount(pool.totalSupplied)} {pool.assetSymbol}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Borrowed</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatAmount(pool.totalBorrowed)} {pool.assetSymbol}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">My Supply</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatAmount(pool.mySupplied || 0)} {pool.assetSymbol}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">My Borrowed</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatAmount(pool.myBorrowed || 0)} {pool.assetSymbol}
                </p>
              </div>
            </div>

            {pool.healthFactor && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Health Factor</span>
                  <span className={`font-semibold ${pool.healthFactor > 1.5 ? 'text-green-600' : pool.healthFactor > 1.2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {pool.healthFactor.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${pool.healthFactor > 1.5 ? 'bg-green-500' : pool.healthFactor > 1.2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(pool.healthFactor * 50, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {isConnected && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleAction(pool, 'supply')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Supply
                </button>
                
                <button
                  onClick={() => handleAction(pool, 'borrow')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Borrow
                </button>
                
                {(pool.myBorrowed || 0) > 0 && (
                  <button
                    onClick={() => handleAction(pool, 'repay')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Repay
                  </button>
                )}
              </div>
            )}
          </div>
        ))
        )}
      </div>

      {/* How It Works Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How Lending & Borrowing Works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-3">
              <PiggyBank className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Supply Assets</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deposit your crypto assets to earn passive yield. Your supplied assets help provide liquidity for borrowers.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Collateralized Borrowing</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use your RWA tokens as collateral to borrow other assets. Maintain a healthy collateral ratio to avoid liquidation.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Dynamic Rates</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Interest rates adjust automatically based on supply and demand. Higher utilization means higher rates for suppliers.
            </p>
          </div>
        </div>
      </div>

      {/* Lending Modal */}
      {selectedPool && (
        <LendingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          pool={selectedPool}
          mode={modalMode}
          userBalance={userBalances[selectedPool.assetDenom] || 0}
          onTransactionComplete={handleTransactionComplete}
        />
      )}

      {/* Create Pool Modal */}
      <CreatePoolModal
        isOpen={showCreatePool}
        onClose={() => setShowCreatePool(false)}
        onPoolCreated={handleTransactionComplete}
      />
    </div>
  );
};

export default Lending;