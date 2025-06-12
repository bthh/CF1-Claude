// @ts-nocheck
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { PriceChart } from '../components/PriceChart';
import { InvestmentModal } from '../components/InvestmentModal';
import { SellModal } from '../components/SellModal';

// Generate price history data for different timeframes
const generatePriceHistory = () => {
  const data = [];
  const basePrice = 100;
  const now = new Date();
  
  // Generate 1 year of daily data
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily variation
    const price = basePrice * (1 + randomChange * (365 - i) / 365);
    const volume = Math.floor(Math.random() * 100000 + 50000);
    
    data.push({
      date: date.toISOString(),
      price: Math.max(price, 50), // Minimum price of $50
      volume
    });
  }
  
  return data;
};

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7D' | '1M' | '3M' | '1Y'>('7D');

  // Mock asset data
  const asset = {
    id: id || '1',
    name: 'Manhattan Office Complex',
    type: 'Commercial Real Estate',
    location: 'New York, NY',
    description: 'Prime commercial office building in Manhattan\'s financial district',
    currentPrice: '$105.25',
    priceChange24h: '+1.52%',
    volume24h: '$125,400',
    marketCap: '$2.63M',
    expectedAPY: '8.5%',
    rating: 4.8,
    totalTokens: 25000,
    availableTokens: 15000,
    totalHolders: 1247,
    priceHistory: generatePriceHistory(),
  };

  // Convert asset to proposal format for InvestmentModal
  const assetAsProposal = {
    id: asset.id,
    asset_details: {
      name: asset.name,
      asset_type: asset.type,
      location: asset.location,
      description: asset.description
    },
    financial_terms: {
      token_price: '105250000', // $105.25 in micro units
      minimum_investment: '100000000', // $100 minimum
      expected_apy: asset.expectedAPY,
      total_shares: asset.totalTokens
    },
    funding_progress: {
      raised_percentage: 60
    }
  };

  const TradingModal = ({ isOpen, onClose, mode }: { isOpen: boolean; onClose: () => void; mode: 'buy' | 'sell' }) => {
    const [quantity, setQuantity] = useState('');
    
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {mode === 'buy' ? 'Buy' : 'Sell'} {asset.name}
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Current Price</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {asset.currentPrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">24h Change</p>
                    <p className="font-semibold text-lg text-green-600">
                      {asset.priceChange24h}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity (Tokens)
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter number of tokens"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {quantity && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Total Cost: ${(parseFloat(quantity) * 105.25).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert(`${mode === 'buy' ? 'Buy' : 'Sell'} order placed for ${quantity} tokens`);
                    onClose();
                  }}
                  disabled={!quantity}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${
                    mode === 'buy'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {mode === 'buy' ? 'Buy' : 'Sell'} Tokens
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/marketplace')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {asset.name}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{asset.location}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-600 dark:text-gray-400">{asset.type}</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-gray-600 dark:text-gray-400">{asset.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {asset.currentPrice}
            </div>
            <div className="text-xl font-medium text-green-600">
              {asset.priceChange24h}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Expected APY</p>
            <p className="text-2xl font-bold text-green-600">{asset.expectedAPY}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">24h Volume</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{asset.volume24h}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Market Cap</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{asset.marketCap}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available to Trade</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {asset.availableTokens.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Holders</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {asset.totalHolders.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Trading Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Price Chart</h2>
            <PriceChart
              data={asset.priceHistory}
              currentPrice={asset.currentPrice}
              priceChange24h={asset.priceChange24h}
              volume24h={asset.volume24h}
              onTimeframeChange={(timeframe) => {
                setSelectedTimeframe(timeframe);
                console.log('Timeframe changed to:', timeframe);
              }}
            />
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
                <span>Buy Tokens (Market/Limit)</span>
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

      {/* About Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About This Asset</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          {asset.description}. This asset represents ownership in a premium real estate 
          investment with strong fundamentals and experienced management.
        </p>
        
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
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Performance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Expected APY</span>
                <span className="font-medium text-green-600">{asset.expectedAPY}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">24h Change</span>
                <span className="font-medium text-green-600">{asset.priceChange24h}</span>
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

      {/* Investment Modal with Limit Buy */}
      <InvestmentModal 
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        proposal={assetAsProposal}
        onSuccess={() => {
          console.log('Investment successful');
          setIsBuyModalOpen(false);
        }}
      />

      <SellModal 
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        asset={asset}
        onSuccess={() => {
          console.log('Sell successful');
          setIsSellModalOpen(false);
        }}
      />
    </div>
  );
};

export default AssetDetail;