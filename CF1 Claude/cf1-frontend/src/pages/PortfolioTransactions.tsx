import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, Calendar, DollarSign } from 'lucide-react';

interface Transaction {
  id: string;
  assetName: string;
  transactionType: 'Purchase' | 'Sale' | 'Dividend' | 'Interest' | 'Fee' | 'Transfer';
  transactionValue: number;
  status: 'Completed' | 'Pending' | 'Failed' | 'Processing';
  timestamp: Date;
}

const PortfolioTransactions: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const transactions: Transaction[] = [
    {
      id: '1',
      assetName: 'Manhattan Office Complex',
      transactionType: 'Purchase',
      transactionValue: 45000,
      status: 'Completed',
      timestamp: new Date('2024-01-28T14:30:00')
    },
    {
      id: '2',
      assetName: 'Gold Bullion Vault',
      transactionType: 'Dividend',
      transactionValue: 485,
      status: 'Completed',
      timestamp: new Date('2024-01-27T09:15:00')
    },
    {
      id: '3',
      assetName: 'Tesla Model S Collection',
      transactionType: 'Purchase',
      transactionValue: 18900,
      status: 'Completed',
      timestamp: new Date('2024-01-26T16:45:00')
    },
    {
      id: '4',
      assetName: 'Picasso Artwork',
      transactionType: 'Interest',
      transactionValue: 820,
      status: 'Pending',
      timestamp: new Date('2024-01-25T11:20:00')
    },
    {
      id: '5',
      assetName: 'Miami Beach Resort',
      transactionType: 'Purchase',
      transactionValue: 68450,
      status: 'Processing',
      timestamp: new Date('2024-01-24T13:10:00')
    },
    {
      id: '6',
      assetName: 'Tech Startup Equity',
      transactionType: 'Sale',
      transactionValue: 12800,
      status: 'Completed',
      timestamp: new Date('2024-01-23T10:30:00')
    },
    {
      id: '7',
      assetName: 'Gold Bullion Vault',
      transactionType: 'Fee',
      transactionValue: -25,
      status: 'Completed',
      timestamp: new Date('2024-01-22T08:45:00')
    },
    {
      id: '8',
      assetName: 'Manhattan Office Complex',
      transactionType: 'Transfer',
      transactionValue: 0,
      status: 'Failed',
      timestamp: new Date('2024-01-21T15:20:00')
    },
    {
      id: '9',
      assetName: 'Picasso Artwork',
      transactionType: 'Purchase',
      transactionValue: 35120,
      status: 'Completed',
      timestamp: new Date('2024-01-20T12:00:00')
    },
    {
      id: '10',
      assetName: 'Tech Startup Equity',
      transactionType: 'Dividend',
      transactionValue: 340,
      status: 'Completed',
      timestamp: new Date('2024-01-19T14:15:00')
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

  const transactionTypes = ['Purchase', 'Sale', 'Dividend', 'Interest', 'Fee', 'Transfer'];
  const statuses = ['Completed', 'Pending', 'Processing', 'Failed'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all your portfolio transaction history and activity.</p>
        </div>
      </div>

      {/* Transaction Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
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
        
        <div className="card p-6">
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

        <div className="card p-6">
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

        <div className="card p-6">
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

      {/* Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      {/* Transaction History Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-40"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {transactionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('assetName')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Asset Name</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('transactionType')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Transaction Type</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('transactionValue')}
                    className="flex items-center space-x-1 font-semibold text-secondary-700 hover:text-secondary-900 ml-auto"
                  >
                    <span>Value</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-center py-3 px-4">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 font-semibold text-secondary-700 hover:text-secondary-900 mx-auto"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center space-x-1 font-semibold text-secondary-700 hover:text-secondary-900 ml-auto"
                  >
                    <span>Date & Time</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-secondary-100 hover:bg-secondary-50 cursor-pointer">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg"></div>
                      <div>
                        <p className="font-semibold text-secondary-900">{transaction.assetName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-medium ${getTransactionTypeColor(transaction.transactionType)}`}>
                      {transaction.transactionType}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-semibold ${
                      transaction.transactionValue >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {transaction.transactionType === 'Transfer' ? '-' : (
                        transaction.transactionValue < 0 ? '-' : '+'
                      )}
                      {transaction.transactionType === 'Transfer' ? '-' : formatCurrency(transaction.transactionValue)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-secondary-600">{formatDateTime(transaction.timestamp)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedTransactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-secondary-500">No transactions found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioTransactions;