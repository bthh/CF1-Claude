import React, { useState, memo, useCallback, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, MoreHorizontal, Download, Eye, Settings, PieChart, BarChart3, Receipt, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioData, PortfolioAsset } from '../services/portfolioDataService';
import { useDataMode } from '../store/dataModeStore';
import { useFeatureToggleStore } from '../store/featureToggleStore';
import { getAssetImage } from '../utils/assetImageUtils';

// Lazy load components to prevent blocking
const EnhancedPortfolioOverview = React.lazy(() => 
  import('../components/Portfolio/EnhancedPortfolioOverview').then(module => ({
    default: module.EnhancedPortfolioOverview
  }))
);
const EnhancedPortfolioPerformance = React.lazy(() => 
  import('../components/Portfolio/EnhancedPortfolioPerformance').then(module => ({
    default: module.EnhancedPortfolioPerformance
  }))
);
const EnhancedPortfolioTransactions = React.lazy(() => 
  import('../components/Portfolio/EnhancedPortfolioTransactions').then(module => ({
    default: module.EnhancedPortfolioTransactions
  }))
);
const RewardsTab = React.lazy(() => 
  import('../components/Portfolio/RewardsTab').then(module => ({
    default: module.RewardsTab
  }))
);

// Use PortfolioAsset type from demo service
type PortfolioAssetProps = PortfolioAsset;

const PortfolioAssetRow: React.FC<PortfolioAssetProps> = ({
  id,
  name,
  type,
  tokens,
  currentValue,
  purchaseValue,
  change,
  changePercent,
  isPositive,
  apy,
  imageUrl
}) => {
  const navigate = useNavigate();
  
  return (
    <tr 
      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={() => navigate(`/portfolio/assets/${id}`)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src={imageUrl || getAssetImage(id || name, type)} 
              alt={name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-gray-600 dark:text-gray-400 font-semibold text-sm">${name.charAt(0)}</span>`;
                }
              }}
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{type}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{tokens.toLocaleString()}</td>
      <td className="px-6 py-4">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{currentValue}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{purchaseValue} invested</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-medium">{change}</span>
          <span className="text-sm">({changePercent})</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-green-600 font-medium">{apy}</span>
      </td>
      <td className="px-6 py-4">
        <button 
          className="p-1 hover:bg-secondary-200 rounded transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </td>
    </tr>
  );
};

const Portfolio: React.FC = memo(() => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('30d');
  
  // Data mode integration - memoized to prevent unnecessary re-renders
  const portfolioData = usePortfolioData();
  const { isDemo } = useDataMode();
  
  // Feature toggle integration
  const { isFeatureEnabled } = useFeatureToggleStore();
  const showPerformanceTab = isFeatureEnabled('portfolio_performance');
  
  // Memoize expensive calculations
  const { assets: portfolioAssets, summary, stats, currentMode, isEmpty } = useMemo(() => portfolioData, [portfolioData]);

  const { totalValue: totalPortfolioValue, totalInvested, totalGain, totalGainPercent } = useMemo(() => summary, [summary]);

  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'transactions' | 'rewards'>('overview');

  // Listen for custom events to set tab from GlobalSidebar
  useEffect(() => {
    const handleSetTab = (event: CustomEvent) => {
      setActiveTab(event.detail.tab);
    };
    
    window.addEventListener('setPortfolioTab', handleSetTab as EventListener);
    return () => window.removeEventListener('setPortfolioTab', handleSetTab as EventListener);
  }, []);

  // Memoize tab change handler to prevent re-renders
  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab);
  }, []);

  // Memoize tabs array to prevent re-creation on each render
  const tabs = useMemo(() => {
    const baseTabs = [
      { id: 'overview' as const, label: 'Overview', icon: PieChart },
      { id: 'transactions' as const, label: 'Transactions', icon: Receipt },
      { id: 'rewards' as const, label: 'Rewards', icon: Gift }
    ];
    
    // Only include Performance tab if feature is enabled
    if (showPerformanceTab) {
      baseTabs.splice(1, 0, { id: 'performance' as const, label: 'Performance', icon: BarChart3 });
    }
    
    return baseTabs;
  }, [showPerformanceTab]);

  return (
    <div className="space-y-responsive">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="heading-responsive-xl">Portfolio [CI TEST]</h1>
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
            Track and manage your tokenized asset investments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2 h-9 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2 h-9 flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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
      <div className="min-h-screen pt-6">
        {isEmpty ? (
          <div className="text-center py-12">
            <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No portfolio data available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {currentMode === 'production' 
                ? "No live portfolio data available yet. Switch to Demo mode to explore sample portfolio data."
                : currentMode === 'development'
                  ? "No development portfolio data created yet. Make investments first or switch to Demo mode."
                  : "No demo portfolio data available."
              }
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/marketplace')}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                <span>Explore Marketplace</span>
              </button>
              {currentMode !== 'demo' && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  or{' '}
                  <button
                    onClick={() => navigate('/super-admin')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    switch to demo mode
                  </button>
                  {' '}to see sample portfolio data
                </div>
              )}
            </div>
          </div>
        ) : (
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            {activeTab === 'overview' && <EnhancedPortfolioOverview />}
            {activeTab === 'performance' && showPerformanceTab && <EnhancedPortfolioPerformance />}
            {activeTab === 'transactions' && <EnhancedPortfolioTransactions />}
            {activeTab === 'rewards' && <RewardsTab />}
          </React.Suspense>
        )}
      </div>
    </div>
  );
});

Portfolio.displayName = 'Portfolio';

export default Portfolio;
