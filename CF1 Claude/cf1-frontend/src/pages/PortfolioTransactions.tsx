import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, Calendar, DollarSign } from 'lucide-react';
import { TouchTable } from '../components/TouchOptimized';
import TransactionDetailsModal from '../components/Portfolio/TransactionDetailsModal';

interface Transaction {
  id: string;
  assetName: string;
  transactionType: 'Purchase' | 'Sale' | 'Dividend' | 'Interest' | 'Fee' | 'Transfer';
  transactionValue: number;
  status: 'Completed' | 'Pending' | 'Failed' | 'Processing';
  timestamp: Date;
  assetType?: string;
  quantity?: number;
  pricePerToken?: number;
  fees?: number;
  description?: string;
  txHash?: string;
}

const PortfolioTransactions: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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

  const transactions: Transaction[] = [
    {
      id: '1',
      assetName: 'Manhattan Office Complex',
      transactionType: 'Purchase',
      transactionValue: 45000,
      status: 'Completed',
      timestamp: new Date('2024-01-28T14:30:00'),
      assetType: 'Commercial Real Estate',
      quantity: 50,
      pricePerToken: 900,
      fees: 45,
      description: 'Initial investment in Manhattan office complex',
      txHash: '0xabc123def456789...'  
    },
    {
      id: '2',
      assetName: 'Gold Bullion Vault',
      transactionType: 'Dividend',
      transactionValue: 485,
      status: 'Completed',
      timestamp: new Date('2024-01-27T09:15:00'),
      assetType: 'Precious Metals',
      fees: 2.5,
      description: 'Quarterly dividend payment from gold bullion holdings',
      txHash: '0xdef456abc789012...'
    },
    {
      id: '3',
      assetName: 'Tesla Model S Collection',
      transactionType: 'Purchase',
      transactionValue: 18900,
      status: 'Completed',
      timestamp: new Date('2024-01-26T16:45:00'),
      assetType: 'Collectible Vehicles',
      quantity: 15,
      pricePerToken: 1260,
      fees: 18.90,
      description: 'Investment in rare Tesla Model S collection',
      txHash: '0x123abc456def789...'
    },
    {
      id: '4',
      assetName: 'Picasso Artwork',
      transactionType: 'Interest',
      transactionValue: 820,
      status: 'Pending',
      timestamp: new Date('2024-01-25T11:20:00'),
      assetType: 'Fine Art',
      fees: 4.10,
      description: 'Interest payment from art appreciation fund',
      txHash: '0x789def123abc456...'
    },
    {
      id: '5',
      assetName: 'Miami Beach Resort',
      transactionType: 'Purchase',
      transactionValue: 68450,
      status: 'Processing',
      timestamp: new Date('2024-01-24T13:10:00'),
      assetType: 'Hospitality Real Estate',
      quantity: 25,
      pricePerToken: 2738,
      fees: 68.45,
      description: 'Investment in Miami luxury beachfront resort property',
      txHash: '0x456def789abc123...'
    },
    {
      id: '6',
      assetName: 'Tech Startup Equity',
      transactionType: 'Sale',
      transactionValue: 12800,
      status: 'Completed',
      timestamp: new Date('2024-01-23T10:30:00'),
      assetType: 'Private Equity',
      quantity: 20,
      pricePerToken: 640,
      fees: 12.80,
      description: 'Partial sale of tech startup equity for portfolio rebalancing',
      txHash: '0x321fed654cba987...'
    },
    {
      id: '7',
      assetName: 'Gold Bullion Vault',
      transactionType: 'Fee',
      transactionValue: -25,
      status: 'Completed',
      timestamp: new Date('2024-01-22T08:45:00'),
      assetType: 'Precious Metals',
      fees: 0,
      description: 'Monthly storage and management fee for gold bullion vault',
      txHash: '0x987cba321fed456...'
    },
    {
      id: '8',
      assetName: 'Manhattan Office Complex',
      transactionType: 'Transfer',
      transactionValue: 0,
      status: 'Failed',
      timestamp: new Date('2024-01-21T15:20:00'),
      assetType: 'Commercial Real Estate',
      quantity: 5,
      fees: 2.50,
      description: 'Failed transfer of tokens between wallets - insufficient gas',
      txHash: '0x654cba987fed321...'
    },
    {
      id: '9',
      assetName: 'Picasso Artwork',
      transactionType: 'Purchase',
      transactionValue: 35120,
      status: 'Completed',
      timestamp: new Date('2024-01-20T12:00:00'),
      assetType: 'Fine Art',
      quantity: 8,
      pricePerToken: 4390,
      fees: 35.12,
      description: 'Initial investment in authenticated Picasso artwork collection',
      txHash: '0x159abc753def864...'
    },
    {
      id: '10',
      assetName: 'Tech Startup Equity',
      transactionType: 'Dividend',
      transactionValue: 340,
      status: 'Completed',
      timestamp: new Date('2024-01-19T14:15:00'),
      assetType: 'Private Equity',
      fees: 1.70,
      description: 'Quarterly dividend payment from tech startup revenue sharing',
      txHash: '0x864def159abc753...'
    }
  ];

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.transactionType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || transaction.transactionType === filterType;
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return (aValue.getTime() - bValue.getTime()) * multiplier;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * multiplier;
      }
      return String(aValue).localeCompare(String(bValue)) * multiplier;
    });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
      case 'Processing':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
      case 'Failed':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getTransactionTypeColor = (type: Transaction['transactionType']) => {
    switch (type) {
      case 'Purchase':
        return 'text-blue-600 dark:text-blue-400';
      case 'Sale':
        return 'text-green-600 dark:text-green-400';
      case 'Dividend':
      case 'Interest':
        return 'text-green-600 dark:text-green-400';
      case 'Fee':
        return 'text-red-600 dark:text-red-400';
      case 'Transfer':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Define table columns
  const columns = [
    {
      key: 'assetName',
      title: 'Asset Name',
      sortable: true,
      responsive: 'always' as const,
      render: (value: string, row: Transaction) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex-shrink-0"></div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'transactionType',
      title: 'Type',
      sortable: true,
      responsive: 'tablet' as const,
      render: (value: Transaction['transactionType']) => (
        <span className={`font-medium ${getTransactionTypeColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'transactionValue',
      title: 'Value',
      sortable: true,
      responsive: 'always' as const,
      className: 'text-right',
      render: (value: number, row: Transaction) => (
        <span className={`font-semibold ${
          value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {row.transactionType === 'Transfer' ? '-' : (
            value < 0 ? '-' : '+'
          )}
          {row.transactionType === 'Transfer' ? '-' : formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      responsive: 'desktop' as const,
      className: 'text-center',
      render: (value: Transaction['status']) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'timestamp',
      title: 'Date & Time',
      sortable: true,
      responsive: 'desktop' as const,
      className: 'text-right',
      render: (value: Date) => (
        <span className="text-gray-600 dark:text-gray-400">{formatDateTime(value)}</span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      responsive: 'always' as const,
      className: 'text-center',
      render: (_: any, row: Transaction) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all your portfolio transaction history and activity.</p>
        </div>
      </div>

      {/* Transaction Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{transactions.length}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">7</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {transactions.filter(t => t.status === 'Pending' || t.status === 'Processing').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
              <Filter className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(transactions.reduce((sum, t) => sum + Math.abs(t.transactionValue), 0))}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <DollarSign className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <TouchTable
        data={transactions}
        columns={columns}
        title="Transaction History"
        searchable={true}
        sortable={true}
        paginated={true}
        pageSize={10}
        mobileCardView={true}
        exportable={true}
        emptyMessage="No transactions found matching your criteria."
        className="shadow-sm"
      />

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default PortfolioTransactions;