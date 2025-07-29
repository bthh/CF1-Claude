import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpDown, TrendingUp, TrendingDown, DollarSign, Clock,
  Filter, Search, ChevronDown, ChevronUp, Eye, ShoppingCart,
  AlertTriangle, CheckCircle, RefreshCw, BarChart3, Globe,
  Users, Building, Zap, Target, Award, Bookmark, BookmarkCheck
} from 'lucide-react';
import { useSecondaryMarketStore } from '../../store/secondaryMarketStore';
import { useSecondaryMarketData, type AssetListing, type TradeHistory } from '../../services/secondaryMarketDataService';
import { useDataMode } from '../../store/dataModeStore';
import { TradeModal } from './TradeModal';
import { OrderBookModal } from './OrderBookModal';
import { PriceHistoryChart } from './PriceHistoryChart';
import { MarketDepthChart } from './MarketDepthChart';

export const SecondaryMarketplace: React.FC = () => {
  // Data mode integration
  const { listings, tradeHistory, stats, currentMode, isEmpty } = useSecondaryMarketData();
  const { isDemo } = useDataMode();
  
  // Keep store for user interactions and favorites
  const {
    userOrders,
    favorites,
    filters,
    isLoading,
    updateFilters,
    createOrder,
    cancelOrder,
    addToFavorites,
    removeFromFavorites,
    getAssetDetails,
    getPriceHistory,
    getOrderBook,
    getMarketStats,
    refreshData
  } = useSecondaryMarketStore();

  const [activeView, setActiveView] = useState<'listings' | 'orderbook' | 'history' | 'portfolio'>('listings');
  const [selectedAsset, setSelectedAsset] = useState<AssetListing | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showOrderBookModal, setShowOrderBookModal] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'volume' | 'change' | 'date'>('volume');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    let filtered = listings.filter(listing => {
      const matchesSearch = listing.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.assetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !filters.assetType || listing.assetType === filters.assetType;
      const matchesStatus = !filters.status || listing.status === filters.status;
      const matchesPriceRange = (!filters.minPrice || listing.pricePerToken >= filters.minPrice) &&
                               (!filters.maxPrice || listing.pricePerToken <= filters.maxPrice);
      
      return matchesSearch && matchesType && matchesStatus && matchesPriceRange;
    });

    // Sort listings
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'price':
          aValue = a.pricePerToken;
          bValue = b.pricePerToken;
          break;
        case 'volume':
          aValue = a.marketData.volume24h;
          bValue = b.marketData.volume24h;
          break;
        case 'change':
          aValue = a.marketData.priceChange24h;
          bValue = b.marketData.priceChange24h;
          break;
        case 'date':
          aValue = new Date(a.listingDate).getTime();
          bValue = new Date(b.listingDate).getTime();
          break;
        default:
          return 0;
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [listings, searchQuery, filters, sortBy, sortDirection]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const handleTrade = (listing: AssetListing) => {
    setSelectedAsset(listing);
    setShowTradeModal(true);
  };

  const handleViewOrderBook = (listing: AssetListing) => {
    setSelectedAsset(listing);
    setShowOrderBookModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'partial': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'expired': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <ArrowUpDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Secondary Marketplace
              </h1>
              {isDemo && (
                <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">DEMO MODE</span>
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {currentMode.toUpperCase()}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Trade tokenized assets with other investors
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Total Listings</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalListings}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">24h Volume</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalVolume}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Active Trades</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeTrades}</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <ArrowUpDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No secondary market listings available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {currentMode === 'production' 
              ? "No live secondary market listings available yet. Switch to Demo mode to explore sample listings."
              : currentMode === 'development'
                ? "No development secondary market listings created yet. Create assets first or switch to Demo mode."
                : "No demo secondary market listings available."
            }
          </p>
          {currentMode !== 'demo' && (
            <button
              onClick={() => window.location.href = '/super-admin'}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Switch to Demo Mode</span>
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      {!isEmpty && (
        <>
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                {[
                  { id: 'listings', label: 'Listings', icon: Globe },
                  { id: 'orderbook', label: 'Order Book', icon: BarChart3 },
                  { id: 'history', label: 'Trade History', icon: Clock },
                  { id: 'portfolio', label: 'My Orders', icon: Users }
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
                      activeView === view.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    } ${view.id === 'listings' ? 'rounded-l-lg' : view.id === 'portfolio' ? 'rounded-r-lg' : ''}`}
                  >
                    <view.icon className="w-4 h-4" />
                    <span>{view.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Listings Table */}
          {activeView === 'listings' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Asset
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Price</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleSort('volume')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>24h Volume</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleSort('change')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>24h Change</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAndSortedListings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {listing.assetName.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {listing.assetName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {listing.assetType} • {listing.sellerName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(listing.pricePerToken)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Last: {formatCurrency(listing.marketData.lastSalePrice)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumber(listing.quantity)} tokens
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Min: {formatNumber(listing.minimumPurchase)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(listing.marketData.volume24h)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm font-medium ${getPriceChangeColor(listing.marketData.priceChange24h)}`}>
                            {listing.marketData.priceChange24h > 0 ? '+' : ''}
                            {formatPercentage(listing.marketData.priceChange24h)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                            {listing.status}
                          </span>
                          {listing.verified && (
                            <CheckCircle className="inline w-4 h-4 text-green-500 ml-2" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleTrade(listing)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              Trade
                            </button>
                            <button
                              onClick={() => handleViewOrderBook(listing)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium"
                            >
                              Order Book
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trade History View */}
          {activeView === 'history' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Trades</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tradeHistory.map((trade) => (
                      <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Asset {trade.assetId}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatNumber(trade.quantity)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(trade.pricePerToken)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(trade.totalValue)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(trade.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trade.status)}`}>
                            {trade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showTradeModal && selectedAsset && (
        <TradeModal
          asset={selectedAsset}
          onClose={() => setShowTradeModal(false)}
          onTrade={(order) => {
            createOrder(order);
            setShowTradeModal(false);
          }}
        />
      )}

      {showOrderBookModal && selectedAsset && (
        <OrderBookModal
          asset={selectedAsset}
          onClose={() => setShowOrderBookModal(false)}
        />
      )}
    </div>
  );
};