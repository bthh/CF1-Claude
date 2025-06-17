import React, { useEffect, useState } from 'react';
import { ArrowUpDown, Download, Filter, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useTradingStore } from '../../store/tradingStore';
import { formatCurrency, formatTimeAgo } from '../../utils/format';

const TradeHistory: React.FC = () => {
  const { 
    userTrades, 
    loading, 
    loadTradeHistory 
  } = useTradingStore();

  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');

  useEffect(() => {
    loadTradeHistory();
  }, [loadTradeHistory]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'settling':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'settling':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredTrades = userTrades.filter(trade => {
    if (filter === 'all') return true;
    // Determine if user was buyer or seller based on user ID
    const userType = trade.buyerId === 'user-1' ? 'buy' : 'sell';
    return userType === filter;
  });

  const handleExport = () => {
    // Mock export functionality
    const csvContent = "data:text/csv;charset=utf-8," +
      "Trade ID,Type,Asset,Quantity,Price,Total,Status,Date\n" +
      filteredTrades.map(trade => {
        const userType = trade.buyerId === 'user-1' ? 'Buy' : 'Sell';
        return `${trade.id},${userType},${trade.assetId},${trade.quantity},${trade.price},${trade.totalValue},${trade.status},${trade.executedAt}`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trade_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg h-24 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { id: 'all', label: 'All Trades' },
            { id: 'buy', label: 'Buys' },
            { id: 'sell', label: 'Sells' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Trade List */}
      {filteredTrades.length === 0 ? (
        <div className="text-center py-12">
          <ArrowUpDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No trades found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' 
              ? "You haven't completed any trades yet"
              : `You don't have any ${filter} trades`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrades.map((trade) => {
            const userType = trade.buyerId === 'user-1' ? 'buy' : 'sell';
            const counterparty = userType === 'buy' ? trade.sellerId : trade.buyerId;
            
            return (
              <div
                key={trade.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(trade.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          userType === 'buy' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {userType.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Market Order
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Trade ID: {trade.id}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trade.status)}`}>
                    {trade.status}
                  </span>
                </div>

                {/* Trade Details */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Asset</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trade.assetId}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Quantity</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trade.quantity.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Price</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(trade.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Total Value</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(trade.totalValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Executed</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatTimeAgo(trade.executedAt)}
                    </p>
                  </div>
                </div>

                {/* Counterparty Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>
                    Counterparty: {counterparty}
                  </span>
                  {trade.settledAt && (
                    <span>
                      Settled: {formatTimeAgo(trade.settledAt)}
                    </span>
                  )}
                </div>

                {/* Fee Breakdown */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        {userType === 'buy' ? 'Buyer' : 'Seller'} Fee
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {formatCurrency(userType === 'buy' ? trade.fees.buyerFee : trade.fees.sellerFee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Network Fee</p>
                      <p className="text-gray-900 dark:text-white">
                        {formatCurrency(trade.fees.networkFee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Net Amount</p>
                      <p className={`font-semibold ${
                        userType === 'buy' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {userType === 'buy' ? '-' : '+'}{formatCurrency(
                          userType === 'buy' 
                            ? trade.totalValue + trade.fees.buyerFee + trade.fees.networkFee/2
                            : trade.totalValue - trade.fees.sellerFee - trade.fees.networkFee/2
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Escrow Info */}
                {trade.escrowId && (
                  <div className="mt-4 flex items-center space-x-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-green-700 dark:text-green-300">
                      Escrow Protected - ID: {trade.escrowId}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {filteredTrades.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            Load More Trades
          </button>
        </div>
      )}
    </div>
  );
};

export default TradeHistory;