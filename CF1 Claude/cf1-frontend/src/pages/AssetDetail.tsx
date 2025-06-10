import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  TrendingUp, 
  Shield,
  DollarSign,
  Share2,
  Heart,
  AlertTriangle,
  BarChart3,
  Users,
  Clock,
  Activity
} from 'lucide-react';

interface AssetData {
  id: string;
  name: string;
  type: string;
  location: string;
  tokenPrice: string;
  tokensAvailable: number;
  totalTokens: number;
  apy: string;
  rating: number;
  imageUrl: string;
  description: string;
  priceChange24h: string;
  volume24h: string;
  marketCap: string;
  transactions: {
    id: string;
    type: 'buy' | 'sell';
    amount: number;
    price: string;
    time: string;
    user: string;
  }[];
  holderStats: {
    totalHolders: number;
    top10Percentage: number;
    averageHolding: number;
  };
}

const TradingModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  asset: AssetData;
  mode: 'buy' | 'sell';
}> = ({ isOpen, onClose, asset, mode }) => {
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');

  if (!isOpen) return null;

  const currentPrice = parseFloat(asset.tokenPrice.replace('$', ''));
  const totalCost = quantity ? parseFloat(quantity) * currentPrice : 0;

  const handleTrade = () => {
    // Mock trading logic
    alert(`${mode === 'buy' ? 'Buy' : 'Sell'} order placed for ${quantity} tokens at ${orderType === 'market' ? 'market price' : '$' + limitPrice}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              {mode === 'buy' ? 'Buy' : 'Sell'} {asset.name}
            </h2>
            <button 
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Current Price Info */}
            <div className="bg-secondary-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-secondary-600">Current Price</p>
                  <p className="font-semibold text-lg">{asset.tokenPrice}</p>
                </div>
                <div>
                  <p className="text-secondary-600">Available Tokens</p>
                  <p className="font-semibold text-lg">{asset.tokensAvailable.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Order Type Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Order Type
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOrderType('market')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    orderType === 'market' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Market Order
                </button>
                <button
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    orderType === 'limit' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Limit Order
                </button>
              </div>
            </div>

            {/* Limit Price Input */}
            {orderType === 'limit' && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Limit Price (USD)
                </label>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder="Enter limit price"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Quantity (Tokens)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter number of tokens"
                min="1"
                max={mode === 'sell' ? 100 : asset.tokensAvailable}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {totalCost > 0 && (
                <p className="text-sm text-secondary-600 mt-2">
                  <strong>Total Cost: ${totalCost.toFixed(2)}</strong>
                </p>
              )}
            </div>

            {/* Trading Notice */}
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-warning-800">Trading Notice</p>
                  <p className="text-warning-700 mt-1">
                    {mode === 'buy' 
                      ? 'Market orders execute immediately at current market price. Limit orders may take time to fill.'
                      : 'Ensure you own sufficient tokens before placing a sell order. Sales are final once executed.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleTrade}
                disabled={!quantity || (orderType === 'limit' && !limitPrice)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  mode === 'buy'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500`}
              >
                {mode === 'buy' ? 'Buy Tokens' : 'Sell Tokens'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState('transactions');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const sections = ['overview', 'about', 'trading', 'statistics'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -50% 0px',
        threshold: 0.1
      }
    );

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  // Mock asset data
  const asset: AssetData = {
    id: id || '1',
    name: 'Manhattan Office Complex',
    type: 'Commercial Real Estate',
    location: 'New York, NY',
    tokenPrice: '$100.00',
    tokensAvailable: 15000,
    totalTokens: 25000,
    apy: '8.5%',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    description: 'Prime commercial office building in Manhattan\'s financial district with AAA-rated tenants and long-term leases generating stable rental income.',
    priceChange24h: '+1.52%',
    volume24h: '$125,400',
    marketCap: '$2.5M',
    transactions: [
      { id: '1', type: 'buy', amount: 250, price: '$100.00', time: '2 minutes ago', user: '0x1234...5678' },
      { id: '2', type: 'sell', amount: 180, price: '$99.50', time: '15 minutes ago', user: '0xabcd...efgh' },
      { id: '3', type: 'buy', amount: 500, price: '$99.25', time: '1 hour ago', user: '0x9876...5432' },
      { id: '4', type: 'buy', amount: 320, price: '$98.80', time: '3 hours ago', user: '0xdef0...1234' },
      { id: '5', type: 'sell', amount: 150, price: '$98.75', time: '5 hours ago', user: '0x5555...9999' },
      { id: '6', type: 'buy', amount: 750, price: '$98.50', time: '8 hours ago', user: '0x1111...2222' },
    ],
    holderStats: {
      totalHolders: 1247,
      top10Percentage: 35.2,
      averageHolding: 125
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/marketplace')}
          className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-secondary-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-secondary-900">{asset.name}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1 text-secondary-600">
              <MapPin className="w-4 h-4" />
              <span>{asset.location}</span>
            </div>
            <span className="text-secondary-300">•</span>
            <span className="text-secondary-600">{asset.type}</span>
            <span className="text-secondary-300">•</span>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-warning-400 fill-current" />
              <span className="text-secondary-600">{asset.rating}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
            <Heart className="w-5 h-5 text-secondary-400" />
          </button>
          <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-secondary-400" />
          </button>
        </div>
      </div>

      {/* Price Information */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-secondary-900">{asset.tokenPrice}</div>
            <div className={`text-xl font-medium ${asset.priceChange24h.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {asset.priceChange24h}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-secondary-600">Expected APY</p>
            <p className="text-2xl font-bold text-green-600">{asset.apy}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-secondary-600 mb-1">24h Volume</p>
            <p className="text-lg font-semibold text-secondary-900">{asset.volume24h}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-600 mb-1">Market Cap</p>
            <p className="text-lg font-semibold text-secondary-900">{asset.marketCap}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-600 mb-1">Tokens Available</p>
            <p className="text-lg font-semibold text-secondary-900">{asset.tokensAvailable.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6 py-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'about', label: 'About' },
            { id: 'trading', label: 'Trading' },
            { id: 'statistics', label: 'Statistics' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === section.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Overview Section */}
        <div id="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card p-0 overflow-hidden">
                <div className="aspect-video">
                  <img 
                    src={asset.imageUrl} 
                    alt={asset.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            </div>
            
            {/* Quick Trading Card */}
            <div className="card p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-900">Quick Trade</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsBuyModalOpen(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Buy Tokens</span>
                  </button>
                  
                  <button 
                    onClick={() => setIsSellModalOpen(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Sell Tokens</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Token Distribution */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Token Distribution</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Tokens Sold</span>
                <span className="font-medium">{(asset.totalTokens - asset.tokensAvailable).toLocaleString()} / {asset.totalTokens.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${((asset.totalTokens - asset.tokensAvailable) / asset.totalTokens) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-secondary-600">
                <span>Sold: {Math.round(((asset.totalTokens - asset.tokensAvailable) / asset.totalTokens) * 100)}%</span>
                <span>Available: {Math.round((asset.tokensAvailable / asset.totalTokens) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">About This Asset</h2>
            <p className="text-secondary-700 leading-relaxed mb-6">{asset.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-secondary-900 mb-3">Asset Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Asset Type</span>
                    <span className="font-medium">{asset.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Location</span>
                    <span className="font-medium">{asset.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Total Tokens</span>
                    <span className="font-medium">{asset.totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Token Price</span>
                    <span className="font-medium">{asset.tokenPrice}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-secondary-900 mb-3">Performance Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Expected APY</span>
                    <span className="font-medium text-green-600">{asset.apy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">24h Change</span>
                    <span className={`font-medium ${asset.priceChange24h.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.priceChange24h}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Market Cap</span>
                    <span className="font-medium">{asset.marketCap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Rating</span>
                    <span className="font-medium flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      {asset.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Section */}
        <div id="trading" className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Trading</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsBuyModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Buy</span>
                </button>
                
                <button 
                  onClick={() => setIsSellModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Sell</span>
                </button>
              </div>
            </div>
            
            {/* Price Chart Placeholder */}
            <div className="bg-gray-100 rounded-lg p-8 mb-6">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Price Chart</h3>
                <p className="text-gray-500">Interactive price chart will be displayed here</p>
                <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Current Price</p>
                    <p className="font-bold text-lg">{asset.tokenPrice}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">24h Volume</p>
                    <p className="font-bold text-lg">{asset.volume24h}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">24h Change</p>
                    <p className={`font-bold text-lg ${asset.priceChange24h.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.priceChange24h}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-navigation for Trading */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-6">
                <button
                  onClick={() => setActiveSubSection('transactions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeSubSection === 'transactions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Recent Transactions
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            {activeSubSection === 'transactions' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asset.transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === 'buy' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{transaction.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 font-medium">{transaction.price}</td>
                          <td className="py-3 px-4 text-gray-600">{transaction.time}</td>
                          <td className="py-3 px-4 text-gray-600 font-mono text-sm">{transaction.user}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Section */}
        <div id="statistics" className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">Statistics & Holders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-secondary-900">{asset.holderStats.totalHolders.toLocaleString()}</p>
                <p className="text-sm text-secondary-600">Total Holders</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-secondary-900">{asset.holderStats.top10Percentage}%</p>
                <p className="text-sm text-secondary-600">Held by Top 10</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-secondary-900">{asset.holderStats.averageHolding}</p>
                <p className="text-sm text-secondary-600">Average Holding</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-secondary-900">{asset.volume24h}</p>
                <p className="text-sm text-secondary-600">24h Volume</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-secondary-900 mb-4">Market Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Market Cap</span>
                    <span className="font-medium">{asset.marketCap}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Total Supply</span>
                    <span className="font-medium">{asset.totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Circulating</span>
                    <span className="font-medium">{(asset.totalTokens - asset.tokensAvailable).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Available</span>
                    <span className="font-medium">{asset.tokensAvailable.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-secondary-900 mb-4">Token Distribution</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Tokens Sold</span>
                    <span className="font-medium">{Math.round(((asset.totalTokens - asset.tokensAvailable) / asset.totalTokens) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${((asset.totalTokens - asset.tokensAvailable) / asset.totalTokens) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-secondary-600">
                    <p>Concentration: {asset.holderStats.top10Percentage}% held by top 10 holders</p>
                    <p>Distribution: Well distributed among {asset.holderStats.totalHolders.toLocaleString()} holders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Modals */}
      <TradingModal 
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        asset={asset}
        mode="buy"
      />

      <TradingModal 
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        asset={asset}
        mode="sell"
      />
    </div>
  );
};

export default AssetDetail;