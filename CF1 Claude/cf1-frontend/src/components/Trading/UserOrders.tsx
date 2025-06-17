import React, { useEffect, useState } from 'react';
import { Clock, X, Edit, CheckCircle, AlertCircle, Pause } from 'lucide-react';
import { useTradingStore } from '../../store/tradingStore';
import { useNotifications } from '../../hooks/useNotifications';
import { formatCurrency, formatTimeAgo } from '../../utils/format';
import { TradingOrder } from '../../types/trading';

const UserOrders: React.FC = () => {
  const { 
    userOrders, 
    loading, 
    cancelOrder, 
    loadUserOrders 
  } = useTradingStore();
  
  const { success, error } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'pending' | 'filled' | 'cancelled'>('all');

  useEffect(() => {
    loadUserOrders();
  }, [loadUserOrders]);

  const handleCancelOrder = async (orderId: string, orderType: string) => {
    try {
      await cancelOrder(orderId);
      success(`${orderType} order cancelled successfully`);
    } catch (err) {
      error('Failed to cancel order');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'partially-filled':
        return <Pause className="w-4 h-4 text-blue-600" />;
      case 'filled':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'partially-filled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'filled':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'expired':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredOrders = userOrders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

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
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'pending', label: 'Pending' },
          { id: 'filled', label: 'Filled' },
          { id: 'cancelled', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No {filter !== 'all' ? filter : ''} orders found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' 
              ? "You haven't placed any orders yet"
              : `You don't have any ${filter} orders`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.type === 'buy' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {order.type.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {order.orderType} Order
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Order ID: {order.id}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.replace('-', ' ')}
                  </span>
                  
                  {(order.status === 'pending' || order.status === 'partially-filled') && (
                    <button
                      onClick={() => handleCancelOrder(order.id, order.type)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Cancel Order"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Quantity</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {order.quantity.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Price</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(order.price)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Total Value</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(order.totalValue)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Created</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatTimeAgo(order.createdAt)}
                  </p>
                </div>
              </div>

              {/* Progress Bar (for partially filled orders) */}
              {order.status === 'partially-filled' && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Filled: {order.filledQuantity} / {order.quantity}</span>
                    <span>{((order.filledQuantity / order.quantity) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(order.filledQuantity / order.quantity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Expiration (for pending orders) */}
              {order.status === 'pending' && order.expiresAt && (
                <div className="mt-4 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>
                    Expires: {formatTimeAgo(order.expiresAt)}
                  </span>
                </div>
              )}

              {/* Fees Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Platform Fee</p>
                    <p className="text-gray-900 dark:text-white">
                      {formatCurrency(order.fees.platformFee)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Network Fee</p>
                    <p className="text-gray-900 dark:text-white">
                      {formatCurrency(order.fees.networkFee)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Total Fees</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(order.fees.totalFee)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredOrders.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            Load More Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default UserOrders;