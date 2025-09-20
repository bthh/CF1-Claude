import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Receipt,
  Download,
  Eye,
  AlertCircle,
  Target,
  Activity
} from 'lucide-react';
import { PriceChart } from '../components/PriceChart';
import { usePortfolioData } from '../services/portfolioDataService';
import { useDataMode } from '../store/dataModeStore';
import { getAssetImage } from '../utils/assetImageUtils';

// Generate dynamic portfolio-specific data based on the selected asset
const generatePortfolioAssetData = (assetId: string, portfolioAsset?: any) => {
  // If we have the actual portfolio asset, use its data as base
  const baseName = portfolioAsset?.name || 'Investment Asset';
  const baseType = portfolioAsset?.type || 'Real Estate';
  const baseTokens = portfolioAsset?.tokens || 1000;

  // Parse current and purchase values from portfolio asset
  const currentVal = portfolioAsset ? parseFloat(portfolioAsset.currentValue.replace(/[$,]/g, '')) : 125000;
  const purchaseVal = portfolioAsset ? parseFloat(portfolioAsset.purchaseValue.replace(/[$,]/g, '')) : 100000;

  // Calculate realistic values based on the actual asset
  const totalGain = currentVal - purchaseVal;
  const gainPercent = purchaseVal > 0 ? (totalGain / purchaseVal) * 100 : 0;
  const sharePrice = currentVal / baseTokens;
  const avgCost = purchaseVal / baseTokens;

  // Generate realistic fees based on asset value
  const managementFee = currentVal * 0.015; // 1.5% annually
  const performanceFee = Math.max(0, totalGain * 0.1); // 10% of gains

  // Generate realistic cashflow based on APY from portfolio asset
  const apyStr = portfolioAsset?.apy || '8.5%';
  const apy = parseFloat(apyStr.replace('%', ''));
  const annualCashflow = currentVal * (apy / 100);
  const monthlyPayment = annualCashflow / 12;

  // Generate variation in monthly returns based on asset type
  const volatility = baseType.includes('Tech') ? 0.15 : baseType.includes('Gold') ? 0.08 : 0.12;
  const monthlyReturns = Array.from({ length: 10 }, (_, i) =>
    (apy / 12) + (Math.random() - 0.5) * volatility * 24
  );
  const benchmarkReturns = monthlyReturns.map(r => r * 0.85 + (Math.random() - 0.5) * 0.02);

  return {
    id: assetId,
    name: baseName,
    type: baseType,
    totalShares: baseTokens,
    sharePrice: sharePrice,
    currentValue: currentVal,
    purchaseValue: purchaseVal,
    totalGain: totalGain,
    totalGainPercent: gainPercent,
    purchaseDate: '2024-03-15',
    averageCost: avgCost,
    fees: {
      managementFee: managementFee,
      performanceFee: performanceFee,
      totalFees: managementFee + performanceFee
    },
    cashflow: {
      totalReceived: annualCashflow * 0.75, // 9 months received
      lastPayment: monthlyPayment,
      nextPaymentDate: '2025-10-15',
      annualYield: apy
    },
    performance: {
      monthlyReturns: monthlyReturns,
      benchmarkReturns: benchmarkReturns
    },
    distributions: Array.from({ length: 5 }, (_, i) => ({
      date: new Date(2025, 8 - i, 15).toISOString().split('T')[0],
      amount: monthlyPayment,
      type: 'Dividend'
    })),
    transactions: [
      {
        date: '2024-03-15',
        type: 'Purchase',
        shares: Math.floor(baseTokens * 0.4),
        price: avgCost * 0.9,
        amount: -(purchaseVal * 0.4)
      },
      {
        date: '2024-06-15',
        type: 'Purchase',
        shares: Math.floor(baseTokens * 0.2),
        price: avgCost * 0.95,
        amount: -(purchaseVal * 0.2)
      },
      {
        date: '2024-09-15',
        type: 'Purchase',
        shares: Math.floor(baseTokens * 0.25),
        price: avgCost * 1.05,
        amount: -(purchaseVal * 0.25)
      },
      {
        date: '2024-12-15',
        type: 'Purchase',
        shares: Math.floor(baseTokens * 0.15),
        price: avgCost * 1.1,
        amount: -(purchaseVal * 0.15)
      }
    ]
  };
};

const PortfolioAssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDemo } = useDataMode();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'cashflow' | 'transactions'>('overview');
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');

  // Get the specific asset data from portfolio
  const { assets } = usePortfolioData();
  const portfolioAsset = assets.find(asset => asset.id === id);

  // Debug logging to understand the data issue
  console.log('🔍 PortfolioAssetDetail Debug:', {
    id,
    assetsLength: assets.length,
    assetIds: assets.map(a => ({ id: a.id, name: a.name })),
    portfolioAsset: portfolioAsset ? { id: portfolioAsset.id, name: portfolioAsset.name } : null
  });


  // Generate detailed portfolio data for this asset
  const assetData = generatePortfolioAssetData(id || '', portfolioAsset);

  // If asset not found in portfolio, create a placeholder asset for demo purposes
  const displayAsset = portfolioAsset || {
    id: id || 'unknown',
    name: assetData.name,
    type: assetData.type,
    tokens: assetData.totalShares,
    currentValue: `$${assetData.currentValue.toLocaleString()}`,
    purchaseValue: `$${assetData.purchaseValue.toLocaleString()}`,
    change: `+$${(assetData.currentValue - assetData.purchaseValue).toLocaleString()}`,
    changePercent: `+${assetData.totalGainPercent.toFixed(1)}%`,
    isPositive: assetData.totalGain >= 0,
    apy: `${assetData.cashflow.annualYield}%`
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'cashflow', label: 'Cash Flow', icon: DollarSign },
    { id: 'transactions', label: 'Transactions', icon: Receipt }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/portfolio')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Portfolio</span>
          </button>

          <div className="w-12 h-12 rounded-lg overflow-hidden">
            <img
              src={displayAsset.imageUrl || getAssetImage(displayAsset.id || displayAsset.name, displayAsset.type)}
              alt={displayAsset.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{displayAsset.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{displayAsset.type}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isDemo && (
            <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm">
              <Eye className="w-4 h-4" />
              <span className="font-medium">DEMO MODE</span>
            </div>
          )}
          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2 h-9 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Value</h3>
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${assetData.currentValue.toLocaleString()}</p>
          <div className="flex items-center space-x-1 mt-2">
            {assetData.totalGain >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${assetData.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${assetData.totalGain.toLocaleString()} ({assetData.totalGainPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Shares</h3>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{assetData.totalShares.toLocaleString()}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            @ ${assetData.sharePrice.toFixed(2)}/share
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Cash Flow (YTD)</h3>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${assetData.cashflow.totalReceived.toLocaleString()}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {assetData.cashflow.annualYield.toFixed(1)}% yield
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Fees</h3>
            <Receipt className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${assetData.fees.totalFees.toLocaleString()}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Management + Performance
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Investment Overview</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Investment Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Purchase Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{new Date(assetData.purchaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Invested:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${assetData.purchaseValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Average Cost:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${assetData.averageCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Price:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${assetData.sharePrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Fee Breakdown</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Management Fee (1.5%):</span>
                    <span className="font-medium text-gray-900 dark:text-white">${assetData.fees.managementFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Performance Fee (10%):</span>
                    <span className="font-medium text-gray-900 dark:text-white">${assetData.fees.performanceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Total Fees:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${assetData.fees.totalFees.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'performance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Analysis</h3>
              <div className="flex space-x-2">
                {['1M', '3M', '6M', '1Y'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period as any)}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      timeframe === period
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64">
              <PriceChart />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Monthly Returns</h4>
                <div className="space-y-2 text-sm">
                  {assetData.performance.monthlyReturns.slice(-6).map((ret, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Month {idx + 1}:</span>
                      <span className={`font-medium ${ret >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {ret >= 0 ? '+' : ''}{ret.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">vs. Benchmark</h4>
                <div className="space-y-2 text-sm">
                  {assetData.performance.benchmarkReturns.slice(-6).map((ret, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Benchmark {idx + 1}:</span>
                      <span className={`font-medium ${ret >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {ret >= 0 ? '+' : ''}{ret.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'cashflow' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash Flow History</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Total Received</h4>
                <p className="text-2xl font-bold text-blue-600">${assetData.cashflow.totalReceived.toLocaleString()}</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100">Last Payment</h4>
                <p className="text-2xl font-bold text-green-600">${assetData.cashflow.lastPayment.toLocaleString()}</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-100">Next Payment</h4>
                <p className="text-2xl font-bold text-purple-600">{new Date(assetData.cashflow.nextPaymentDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Distributions</h4>
              <div className="space-y-2">
                {assetData.distributions.map((dist, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{new Date(dist.date).toLocaleDateString()}</span>
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        {dist.type}
                      </span>
                    </div>
                    <span className="font-medium text-green-600">${dist.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'transactions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>

            <div className="space-y-2">
              {assetData.transactions.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{tx.type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{tx.shares.toLocaleString()} shares</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">@ ${tx.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${Math.abs(tx.amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioAssetDetail;