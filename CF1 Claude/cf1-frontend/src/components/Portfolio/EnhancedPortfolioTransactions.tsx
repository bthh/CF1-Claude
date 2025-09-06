import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Calendar, ArrowUpRight, ArrowDownLeft, Eye, CheckCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import TransactionDetailsModal from './TransactionDetailsModal';

interface TransactionsTabProps {
  className?: string;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'dividend' | 'fee';
  assetName: string;
  assetType: string;
  amount: number;
  quantity?: number;
  pricePerToken?: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
  fees: number;
  description: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'tx_001',
    type: 'dividend',
    assetName: 'Manhattan Premium Office Tower',
    assetType: 'Commercial Real Estate',
    amount: 156.50,
    date: '2024-07-15T14:30:00Z',
    status: 'completed',
    txHash: '0xabc123...',
    fees: 2.50,
    description: 'Q2 2024 dividend payment'
  },
  {
    id: 'tx_002',
    type: 'purchase',
    assetName: 'Solar Energy Project Nevada',
    assetType: 'Renewable Energy',
    amount: 3200.00,
    quantity: 25,
    pricePerToken: 128.00,
    date: '2024-07-12T09:15:00Z',
    status: 'completed',
    txHash: '0xdef456...',
    fees: 8.00,
    description: 'Additional investment in solar project'
  },
  {
    id: 'tx_003',
    type: 'dividend',
    assetName: 'Miami Beach Luxury Resort',
    assetType: 'Hospitality Real Estate',
    amount: 89.75,
    date: '2024-07-10T16:45:00Z',
    status: 'completed',
    txHash: '0xghi789...',
    fees: 1.25,
    description: 'Monthly revenue distribution'
  },
  {
    id: 'tx_004',
    type: 'purchase',
    assetName: 'Vintage Wine Collection Series A',
    assetType: 'Collectibles',
    amount: 4375.00,
    quantity: 5,
    pricePerToken: 875.00,
    date: '2024-07-08T11:20:00Z',
    status: 'completed',
    txHash: '0xjkl012...',
    fees: 15.00,
    description: 'Initial investment in wine collection'
  },
  {
    id: 'tx_005',
    type: 'sale',
    assetName: 'Tech Startup Portfolio',
    assetType: 'Private Equity',
    amount: 2150.00,
    quantity: 10,
    pricePerToken: 215.00,
    date: '2024-07-05T13:10:00Z',
    status: 'completed',
    txHash: '0xmno345...',
    fees: 12.50,
    description: 'Partial liquidation for rebalancing'
  },
  {
    id: 'tx_006',
    type: 'fee',
    assetName: 'Platform Management Fee',
    assetType: 'Service Fee',
    amount: 45.80,
    date: '2024-07-01T00:00:00Z',
    status: 'completed',
    txHash: '0xpqr678...',
    fees: 0,
    description: 'Monthly platform management fee'
  },
  {
    id: 'tx_007',
    type: 'purchase',
    assetName: 'Tesla Supercharger Network',
    assetType: 'Infrastructure',
    amount: 8000.00,
    quantity: 20,
    pricePerToken: 400.00,
    date: '2024-06-28T10:30:00Z',
    status: 'pending',
    fees: 20.00,
    description: 'Investment in EV charging infrastructure'
  },
  {
    id: 'tx_008',
    type: 'dividend',
    assetName: 'European Logistics Hub',
    assetType: 'Industrial Real Estate',
    amount: 124.30,
    date: '2024-06-25T15:20:00Z',
    status: 'completed',
    txHash: '0xstu901...',
    fees: 1.70,
    description: 'Quarterly dividend payment'
  }
];

const transactionSummary = {
  totalTransactions: mockTransactions.length,
  totalInvested: mockTransactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0),
  totalDividends: mockTransactions
    .filter(t => t.type === 'dividend')
    .reduce((sum, t) => sum + t.amount, 0),
  totalFees: mockTransactions.reduce((sum, t) => sum + t.fees, 0),
  pendingTransactions: mockTransactions.filter(t => t.status === 'pending').length
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'purchase':
      return <ArrowDownLeft className="w-4 h-4 text-red-500" />;
    case 'sale':
      return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    case 'dividend':
      return <ArrowUpRight className="w-4 h-4 text-blue-500" />;
    case 'fee':
      return <ArrowDownLeft className="w-4 h-4 text-orange-500" />;
    default:
      return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'failed':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:
      return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  }
};

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'purchase':
      return 'text-red-600';
    case 'sale':
    case 'dividend':
      return 'text-green-600';
    case 'fee':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

export const EnhancedPortfolioTransactions: React.FC<TransactionsTabProps> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-blue-600 text-sm font-medium">Total</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Transactions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {transactionSummary.totalTransactions}
            </p>
            <p className="text-blue-600 text-sm">All time</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-red-600 text-sm font-medium">Invested</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Invested</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(transactionSummary.totalInvested)}
            </p>
            <p className="text-red-600 text-sm">Across all assets</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">Earnings</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Dividends</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(transactionSummary.totalDividends)}
            </p>
            <p className="text-green-600 text-sm">Passive income</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-orange-600 text-sm font-medium">Pending</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Transactions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {transactionSummary.pendingTransactions}
            </p>
            <p className="text-orange-600 text-sm">Awaiting confirmation</p>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="purchase">Purchases</option>
              <option value="sale">Sales</option>
              <option value="dividend">Dividends</option>
              <option value="fee">Fees</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Showing {filteredTransactions.length} of {mockTransactions.length} transactions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {transaction.type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.assetName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.assetType}
                      </p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'purchase' || transaction.type === 'fee' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      {transaction.quantity && transaction.pricePerToken && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.quantity} × {formatCurrency(transaction.pricePerToken)}
                        </p>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(transaction.date)}
                    </p>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <span className={`text-sm capitalize ${
                        transaction.status === 'completed' ? 'text-green-600' :
                        transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {transaction.txHash && (
                        <button
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View on blockchain"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetails(transaction)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No transactions found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </motion.div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
      />
    </div>
  );
};