import React from 'react';
import { X, ExternalLink, Calendar, DollarSign, Hash, FileText, Building2, CheckCircle, Clock, AlertTriangle, Copy } from 'lucide-react';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  if (!isOpen || !transaction) return null;

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
      case 'Processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed':
      case 'Failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'Completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing':
      case 'Processing':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'failed':
      case 'Failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'purchase':
        return 'text-red-600 dark:text-red-400';
      case 'sale':
        return 'text-green-600 dark:text-green-400';
      case 'dividend':
      case 'interest':
        return 'text-blue-600 dark:text-blue-400';
      case 'fee':
        return 'text-orange-600 dark:text-orange-400';
      case 'transfer':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here if needed
  };

  const openBlockchainExplorer = (txHash: string) => {
    // This would open the transaction in a blockchain explorer
    // For demo purposes, we'll just show an alert
    window.open(`https://explorer.neutron.org/tx/${txHash}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Transaction Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: {transaction.id}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Transaction Overview */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`text-lg font-semibold capitalize ${getTransactionTypeColor(transaction.transactionType || transaction.type)}`}>
                    {transaction.transactionType || transaction.type}
                  </span>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                    {getStatusIcon(transaction.status)}
                    <span className="capitalize">{transaction.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {transaction.transactionType === 'Transfer' ? 
                  'Transfer' : 
                  `${(transaction.transactionValue || transaction.amount) >= 0 ? '+' : ''}${formatCurrency(Math.abs(transaction.transactionValue || transaction.amount))}`
                }
              </div>
              
              {transaction.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {transaction.description}
                </p>
              )}
            </div>

            {/* Asset Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Asset Information
              </h3>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Asset Name</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {transaction.assetName}
                    </p>
                  </div>
                  {transaction.assetType && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Asset Type</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {transaction.assetType}
                      </p>
                    </div>
                  )}
                  {transaction.quantity && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quantity</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {transaction.quantity} tokens
                      </p>
                    </div>
                  )}
                  {transaction.pricePerToken && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price per Token</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(transaction.pricePerToken)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Financial Details
              </h3>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction Amount</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(Math.abs(transaction.transactionValue || transaction.amount))}
                    </p>
                  </div>
                  {(transaction.fees !== undefined && transaction.fees > 0) && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction Fees</p>
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(transaction.fees)}
                      </p>
                    </div>
                  )}
                  {transaction.quantity && transaction.pricePerToken && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calculation</p>
                      <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
                        {transaction.quantity} × {formatCurrency(transaction.pricePerToken)} = {formatCurrency(transaction.quantity * transaction.pricePerToken)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Transaction Timeline
              </h3>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Transaction Initiated
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(transaction.timestamp || transaction.date)}
                      </p>
                    </div>
                  </div>
                  
                  {transaction.status === 'Completed' || transaction.status === 'completed' ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Transaction Completed
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(transaction.timestamp || transaction.date)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.status === 'Pending' ? 'Awaiting Confirmation' : `Status: ${transaction.status}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Transaction is being processed
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Blockchain Information */}
            {transaction.txHash && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  Blockchain Information
                </h3>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction Hash</p>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded">
                          {transaction.txHash}
                        </code>
                        <button
                          onClick={() => copyToClipboard(transaction.txHash)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openBlockchainExplorer(transaction.txHash)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="View on blockchain explorer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center space-x-4">
            {transaction.txHash && (
              <button
                onClick={() => openBlockchainExplorer(transaction.txHash)}
                className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Explorer</span>
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;