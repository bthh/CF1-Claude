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
  Activity,
  RefreshCw,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useCosmJS } from '../hooks/useCosmJS';
import { WalletConnection } from '../components/WalletConnection';
import { PriceChart } from '../components/PriceChart';

interface AssetData {
  id: string;
  proposal_id?: string;
  asset_details: {
    name: string;
    asset_type: string;
    category: string;
    location: string;
    description: string;
    full_description?: string;
    risk_factors?: string[];
    highlights?: string[];
  };
  financial_terms: {
    target_amount: string;
    token_price: string;
    total_shares: number;
    minimum_investment: string;
    expected_apy: string;
    funding_deadline: number;
  };
  funding_status: {
    total_raised: string;
    investor_count: number;
    is_funded: boolean;
  };
  tokens: {
    contract_address?: string;
    total_supply: number;
    circulating_supply: number;
    available_for_trade: number;
    lockup_end_date?: number;
  };
  market_data: {
    current_price: string;
    price_change_24h: string;
    volume_24h: string;
    market_cap: string;
    last_trade_price?: string;
    highest_bid?: string;
    lowest_ask?: string;
  };
  trading_data: {
    is_tradeable: boolean;
    lockup_active: boolean;
    trades: {
      id: string;
      type: 'buy' | 'sell';
      amount: number;
      price: string;
      timestamp: number;
      trader: string;
      transaction_hash?: string;
    }[];
  };
  holder_stats: {
    total_holders: number;
    top_10_percentage: number;
    average_holding: number;
    concentration_score: number;
  };
  performance: {
    rating: number;
    historical_apy: string;
    price_history: {
      date: string;
      price: number;
      volume: number;
    }[];
  };
  compliance: {
    kyc_required: boolean;
    accredited_only: boolean;
    regulatory_status: string;
    compliance_notes: string[];
  };
  timestamps: {
    created_at: number;
    updated_at: number;
    token_minted_at?: number;
    lockup_end_at?: number;
    last_trade_at?: number;
  };
}

const TradingModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  asset: AssetData;
  mode: 'buy' | 'sell';
  onTradeSuccess?: () => void;
}> = ({ isOpen, onClose, asset, mode, onTradeSuccess }) => {
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { isConnected, formatAmount, balance, error, clearError } = useCosmJS();

  if (!isOpen) return null;

  const currentPrice = parseFloat(asset.market_data.current_price.replace('$', ''));
  const totalCost = quantity ? parseFloat(quantity) * currentPrice : 0;
  const isLockupActive = asset.trading_data.lockup_active;
  const isTradeable = asset.trading_data.is_tradeable && !isLockupActive;

  const handleTrade = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (!isTradeable) {
      alert('Trading is not available for this asset yet');
      return;
    }

    setIsProcessing(true);
    clearError();

    try {
      // Mock trading logic - in reality this would call smart contract functions
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      alert(`${mode === 'buy' ? 'Buy' : 'Sell'} order placed for ${quantity} tokens at ${orderType === 'market' ? 'market price' : '$' + limitPrice}`);
      
      setQuantity('');
      setLimitPrice('');
      onTradeSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Trading failed:', error);
      alert(`Trade failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {mode === 'buy' ? 'Buy' : 'Sell'} {asset.asset_details.name}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
              disabled={isProcessing}
            >
              ×
            </button>
          </div>

          {/* Lockup Warning */}
          {isLockupActive && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-amber-600 mr-2" />
                <div>
                  <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                    Trading Locked
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 text-xs">
                    This asset is still in its 12-month lockup period. Trading will be available after{' '}
                    {asset.timestamps.lockup_end_at ? 
                      new Date(asset.timestamps.lockup_end_at * 1000).toLocaleDateString() : 
                      'lockup period ends'
                    }.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Connection Warning */}
          {!isConnected && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="text-center">
                <p className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-2">
                  Wallet Connection Required
                </p>
                <WalletConnection />
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Current Price Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Current Price</p>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">
                    {asset.market_data.current_price}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Available for Trade</p>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">
                    {asset.tokens.available_for_trade.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">24h Change</p>
                  <p className={`font-semibold text-lg ${
                    asset.market_data.price_change_24h.startsWith('+') 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {asset.market_data.price_change_24h}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Your Balance</p>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">
                    {isConnected ? formatAmount(balance) : '---'} NTRN
                  </p>
                </div>
              </div>
            </div>

            {/* Order Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTrade}
                disabled={
                  isProcessing || 
                  !isConnected || 
                  !isTradeable || 
                  !quantity || 
                  (orderType === 'limit' && !limitPrice)
                }
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 ${
                  mode === 'buy'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : !isTradeable ? (
                  'Trading Locked'
                ) : (
                  `${mode === 'buy' ? 'Buy' : 'Sell'} Tokens`
                )}
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
  const [refreshKey, setRefreshKey] = useState(0);

  // Blockchain integration
  const { isConnected, formatAmount, error: cosmjsError } = useCosmJS();

  const handleTradeSuccess = () => {
    // Refresh asset data after successful trade
    setRefreshKey(prev => prev + 1);
  };

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

  // Mock asset data - in production this would come from blockchain
  const asset: AssetData = {
    id: id || '1',
    proposal_id: 'proposal-123',
    asset_details: {
      name: 'Manhattan Office Complex',
      asset_type: 'Commercial Real Estate',
      category: 'Commercial Real Estate',
      location: 'New York, NY',
      description: 'Prime commercial office building in Manhattan\'s financial district with AAA-rated tenants and long-term leases generating stable rental income.',
      full_description: 'This exceptional 15-story office building features 180,000 square feet of premium Class A office space in the heart of Manhattan\'s financial district. The property boasts state-of-the-art infrastructure, LEED Gold certification, and a prestigious tenant roster including Fortune 500 companies with long-term lease commitments.',
      risk_factors: [
        'Commercial real estate values may fluctuate based on market conditions',
        'Tenant vacancy could impact rental income',
        'Interest rate changes may affect property valuations',
        'Economic downturns could reduce demand for office space'
      ],
      highlights: [
        'Prime Manhattan financial district location',
        'AAA-rated tenant base with long-term contracts',
        'LEED Gold certified sustainable building',
        '95%+ occupancy rate maintained over 5 years',
        'Recent $15M renovation and modernization'
      ]
    },
    financial_terms: {
      target_amount: '2500000000000', // $2.5M in micro units
      token_price: '100000000', // $100 in micro units
      total_shares: 25000,
      minimum_investment: '1000000000', // $1000 in micro units
      expected_apy: '8.5%',
      funding_deadline: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year from now
    },
    funding_status: {
      total_raised: '2500000000000', // Fully funded
      investor_count: 247,
      is_funded: true
    },
    tokens: {
      contract_address: 'neutron1token123...',
      total_supply: 25000,
      circulating_supply: 25000,
      available_for_trade: 15000,
      lockup_end_date: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) // Lockup ended 30 days ago
    },
    market_data: {
      current_price: '$105.25',
      price_change_24h: '+1.52%',
      volume_24h: '$125,400',
      market_cap: '$2.63M',
      last_trade_price: '$105.00',
      highest_bid: '$104.80',
      lowest_ask: '$105.50'
    },
    trading_data: {
      is_tradeable: true,
      lockup_active: false,
      trades: [
        { id: '1', type: 'buy', amount: 250, price: '$105.25', timestamp: Date.now() - (2 * 60 * 1000), trader: 'neutron1234...5678', transaction_hash: '0xabc123' },
        { id: '2', type: 'sell', amount: 180, price: '$105.00', timestamp: Date.now() - (15 * 60 * 1000), trader: 'neutronabcd...efgh', transaction_hash: '0xdef456' },
        { id: '3', type: 'buy', amount: 500, price: '$104.75', timestamp: Date.now() - (60 * 60 * 1000), trader: 'neutron9876...5432', transaction_hash: '0x789xyz' },
        { id: '4', type: 'buy', amount: 320, price: '$104.50', timestamp: Date.now() - (3 * 60 * 60 * 1000), trader: 'neutrondef0...1234', transaction_hash: '0x123abc' },
        { id: '5', type: 'sell', amount: 150, price: '$104.25', timestamp: Date.now() - (5 * 60 * 60 * 1000), trader: 'neutron5555...9999', transaction_hash: '0x456def' },
        { id: '6', type: 'buy', amount: 750, price: '$104.00', timestamp: Date.now() - (8 * 60 * 60 * 1000), trader: 'neutron1111...2222', transaction_hash: '0x789ghi' },
      ]
    },
    holder_stats: {
      total_holders: 1247,
      top_10_percentage: 35.2,
      average_holding: 125,
      concentration_score: 7.8
    },
    performance: {
      rating: 4.8,
      historical_apy: '8.7%',
      price_history: [
        { date: '2024-01-01', price: 100.00, volume: 50000 },
        { date: '2024-01-02', price: 101.25, volume: 75000 },
        { date: '2024-01-03', price: 102.50, volume: 60000 },
        { date: '2024-01-04', price: 103.75, volume: 80000 },
        { date: '2024-01-05', price: 105.25, volume: 125000 },
      ]
    },
    compliance: {
      kyc_required: true,
      accredited_only: false,
      regulatory_status: 'SEC Regulation CF Compliant',
      compliance_notes: [
        'SEC Regulation CF Compliant',
        '12-month lockup period completed',
        'Secondary trading now available',
        'All investors have completed KYC verification'
      ]
    },
    timestamps: {
      created_at: Math.floor(Date.now() / 1000) - (400 * 24 * 60 * 60), // 400 days ago
      updated_at: Math.floor(Date.now() / 1000) - (2 * 60), // 2 minutes ago
      token_minted_at: Math.floor(Date.now() / 1000) - (370 * 24 * 60 * 60), // 370 days ago
      lockup_end_at: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
      last_trade_at: Date.now() - (2 * 60 * 1000) // 2 minutes ago
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      {cosmjsError && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                Using Mock Data
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                Unable to connect to blockchain. Showing sample asset data for demonstration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/marketplace')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {asset.asset_details.name}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{asset.asset_details.location}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-600 dark:text-gray-400">{asset.asset_details.asset_type}</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-gray-600 dark:text-gray-400">{asset.performance.rating}</span>
              </div>
              {/* Trading Status */}
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <div className={`flex items-center space-x-1 ${
                asset.trading_data.is_tradeable && !asset.trading_data.lockup_active
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}>
                {asset.trading_data.is_tradeable && !asset.trading_data.lockup_active ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {asset.trading_data.is_tradeable && !asset.trading_data.lockup_active 
                    ? 'Tradeable' 
                    : 'Locked'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Heart className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      </div>

      {/* Price Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {asset.market_data.current_price}
            </div>
            <div className={`text-xl font-medium ${
              asset.market_data.price_change_24h.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {asset.market_data.price_change_24h}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Expected APY</p>
            <p className="text-2xl font-bold text-green-600">{asset.financial_terms.expected_apy}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">24h Volume</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {asset.market_data.volume_24h}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Market Cap</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {asset.market_data.market_cap}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available to Trade</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {asset.tokens.available_for_trade.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Holders</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {asset.holder_stats.total_holders.toLocaleString()}
            </p>
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
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-0 overflow-hidden">
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
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Trade</h3>
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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Token Distribution</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tokens Sold</span>
                <span className="font-medium">{(asset.totalTokens - asset.tokensAvailable).toLocaleString()} / {asset.totalTokens.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${((asset.totalTokens - asset.tokensAvailable) / asset.totalTokens) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Sold: {Math.round(((asset.totalTokens - asset.tokensAvailable) / asset.totalTokens) * 100)}%</span>
                <span>Available: {Math.round((asset.tokensAvailable / asset.totalTokens) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About This Asset</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{asset.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Asset Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Asset Type</span>
                    <span className="font-medium">{asset.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Location</span>
                    <span className="font-medium">{asset.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Tokens</span>
                    <span className="font-medium">{asset.totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Token Price</span>
                    <span className="font-medium">{asset.tokenPrice}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Performance Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expected APY</span>
                    <span className="font-medium text-green-600">{asset.apy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">24h Change</span>
                    <span className={`font-medium ${asset.priceChange24h.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.priceChange24h}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Market Cap</span>
                    <span className="font-medium">{asset.marketCap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rating</span>
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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trading</h2>
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
            
            {/* Price Chart */}
            <PriceChart
              data={asset.performance.price_history}
              currentPrice={asset.market_data.current_price}
              priceChange24h={asset.market_data.price_change_24h}
              volume24h={asset.market_data.volume_24h}
              className="mb-6"
            />

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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Statistics & Holders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{asset.holderStats.totalHolders.toLocaleString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Holders</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{asset.holderStats.top10Percentage}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Held by Top 10</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{asset.holderStats.averageHolding}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Holding</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{asset.volume24h}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">24h Volume</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Market Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Market Cap</span>
                    <span className="font-medium">{asset.marketCap}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Supply</span>
                    <span className="font-medium">{asset.totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Circulating</span>
                    <span className="font-medium">{(asset.totalTokens - asset.tokensAvailable).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                    <span className="font-medium">{asset.tokensAvailable.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Token Distribution</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tokens Sold</span>
                    <span className="font-medium">{Math.round(((asset.totalTokens - asset.tokensAvailable) / asset.totalTokens) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${((asset.totalTokens - asset.tokensAvailable) / asset.totalTokens) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
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