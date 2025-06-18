import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFeatureToggleStore } from '../../store/featureToggleStore';

interface SidebarProps {
  type: 'dashboard' | 'marketplace' | 'portfolio' | 'launchpad' | 'governance' | 'profile';
}

const SimpleSidebar: React.FC<SidebarProps> = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isFeatureEnabled } = useFeatureToggleStore();
  
  const isActive = (path: string) => location.pathname === path;

  const renderDashboardSidebar = () => (
    <div className="space-y-6">
      {/* Main Navigation */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dashboard</h2>
        <nav className="space-y-1">
          <Link 
            to="/dashboard" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/dashboard') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Overview
          </Link>
          <Link 
            to="/dashboard/performance" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/dashboard/performance') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Spotlight
          </Link>
          <Link 
            to="/dashboard/activity" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/dashboard/activity') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Activity
          </Link>
        </nav>
      </div>

      {/* Portfolio Summary Widget */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          Portfolio Value
        </h4>
        <p className="text-2xl xl:text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">
          $124,523
        </p>
        <div className="flex items-center text-sm">
          <span className="text-green-600 dark:text-green-400 font-medium">+12.5%</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">this month</span>
        </div>
      </div>
    </div>
  );

  const renderMarketplaceSidebar = () => (
    <div className="space-y-6">
      {/* Main Navigation */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Marketplace</h2>
        <nav className="space-y-1">
          <Link 
            to="/marketplace" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/marketplace') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All Assets
          </Link>
        </nav>
      </div>
      
      {/* DeFi Features */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Trading & DeFi
        </h3>
        <nav className="space-y-1">
          <Link 
            to="/trading/RWA-1" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.startsWith('/trading') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Trading
          </Link>
          <Link 
            to="/secondary-trading" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/secondary-trading') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Secondary Market
          </Link>
          {isFeatureEnabled('liquidity_pools') && (
            <Link 
              to="/liquidity" 
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/liquidity') 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Liquidity Pools
            </Link>
          )}
          {isFeatureEnabled('staking') && (
            <Link 
              to="/staking" 
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/staking') 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Staking
            </Link>
          )}
          {isFeatureEnabled('lending') && (
            <Link 
              to="/lending" 
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/lending') 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Lending
            </Link>
          )}
        </nav>
      </div>
    </div>
  );

  const renderPortfolioSidebar = () => (
    <div className="space-y-6">
      {/* Main Navigation */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio</h2>
        <nav className="space-y-1">
          <Link 
            to="/portfolio" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/portfolio') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Overview
          </Link>
          <Link 
            to="/portfolio/performance" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/portfolio/performance') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Performance
          </Link>
          <Link 
            to="/portfolio/transactions" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/portfolio/transactions') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Transactions
          </Link>
        </nav>
      </div>
    </div>
  );

  const renderLaunchpadSidebar = () => (
    <div className="space-y-6">
      {/* Main Navigation */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Launchpad</h2>
        <nav className="space-y-1">
          <Link 
            to="/launchpad" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/launchpad') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All Proposals
          </Link>
          <Link 
            to="/my-submissions" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/my-submissions') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            My Submissions
          </Link>
          <Link 
            to="/launchpad/drafts" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/launchpad/drafts') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Drafts
          </Link>
        </nav>
      </div>
      
      {/* Quick Action */}
      <div>
        <button 
          onClick={() => navigate('/launchpad/create')}
          className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        >
          Submit Proposal
        </button>
      </div>
    </div>
  );

  const renderGovernanceSidebar = () => (
    <div className="space-y-6">
      {/* Main Navigation */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Governance</h2>
        <nav className="space-y-1">
          <Link 
            to="/governance" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/governance') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All Proposals
          </Link>
          <Link 
            to="/governance/active" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/governance/active') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Active Voting
          </Link>
          <Link 
            to="/governance/my-votes" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/governance/my-votes') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            My Votes
          </Link>
          <Link 
            to="/governance/drafts" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/governance/drafts') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Drafts
          </Link>
        </nav>
      </div>
      
      {/* Quick Action */}
      <div>
        <button 
          onClick={() => navigate('/governance/create')}
          className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        >
          Create Proposal
        </button>
      </div>
    </div>
  );

  const renderProfileSidebar = () => (
    <div className="space-y-6">
      {/* Main Navigation */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
        <nav className="space-y-1">
          <Link 
            to="/profile" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/profile') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Overview
          </Link>
          <Link 
            to="/profile/settings" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/profile/settings') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Settings
          </Link>
          <Link 
            to="/profile/verification" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/profile/verification') 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Verification
          </Link>
        </nav>
      </div>
    </div>
  );

  return (
    <aside className="w-64 xl:w-72 bg-blue-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex-shrink-0">
      <div className="p-4 h-full overflow-y-auto">
        {type === 'dashboard' && renderDashboardSidebar()}
        {type === 'marketplace' && renderMarketplaceSidebar()}
        {type === 'portfolio' && renderPortfolioSidebar()}
        {type === 'launchpad' && renderLaunchpadSidebar()}
        {type === 'governance' && renderGovernanceSidebar()}
        {type === 'profile' && renderProfileSidebar()}
      </div>
    </aside>
  );
};

export default SimpleSidebar;