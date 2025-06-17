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
      {/* Navigation Section */}
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

      {/* DeFi Features Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          DeFi Features
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
            to="/liquidity" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/liquidity' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Liquidity Pools
          </Link>
          <Link 
            to="/staking" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/staking' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Staking
          </Link>
          <Link 
            to="/lending" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/lending' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Lending
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
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Marketplace</h2>
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Search assets..." 
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <nav className="space-y-1">
        <Link to="/marketplace" className={`block px-3 py-2 rounded-lg ${isActive('/marketplace') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          All Assets
        </Link>
        <Link to="/marketplace/real-estate" className={`block px-3 py-2 rounded-lg ${isActive('/marketplace/real-estate') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Real Estate
        </Link>
        <Link to="/marketplace/precious-metals" className={`block px-3 py-2 rounded-lg ${isActive('/marketplace/precious-metals') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Precious Metals
        </Link>
      </nav>
      
      {/* DeFi Trading Section */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Trading & DeFi
        </h3>
        <nav className="space-y-1">
          <Link to="/trading/RWA-1" className={`block px-3 py-2 rounded-lg ${location.pathname.startsWith('/trading') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
            Trading
          </Link>
          {isFeatureEnabled('liquidity_pools') && (
            <Link to="/liquidity" className={`block px-3 py-2 rounded-lg ${isActive('/liquidity') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              Liquidity Pools
            </Link>
          )}
          {isFeatureEnabled('staking') && (
            <Link to="/staking" className={`block px-3 py-2 rounded-lg ${isActive('/staking') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              Staking
            </Link>
          )}
          {isFeatureEnabled('lending') && (
            <Link to="/lending" className={`block px-3 py-2 rounded-lg ${isActive('/lending') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              Lending
            </Link>
          )}
        </nav>
      </div>
    </>
  );

  const renderPortfolioSidebar = () => (
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio</h2>
      <nav className="space-y-1">
        <Link to="/portfolio" className={`block px-3 py-2 rounded-lg ${isActive('/portfolio') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Overview
        </Link>
        <Link to="/portfolio/performance" className={`block px-3 py-2 rounded-lg ${isActive('/portfolio/performance') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Performance
        </Link>
        <Link to="/portfolio/transactions" className={`block px-3 py-2 rounded-lg ${isActive('/portfolio/transactions') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Transactions
        </Link>
      </nav>
    </>
  );

  const renderLaunchpadSidebar = () => (
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Launchpad</h2>
      <nav className="space-y-1">
        <Link to="/launchpad" className={`block px-3 py-2 rounded-lg ${isActive('/launchpad') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          All Proposals
        </Link>
        <Link to="/launchpad/active" className={`block px-3 py-2 rounded-lg ${isActive('/launchpad/active') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Active
        </Link>
        <Link to="/launchpad/funded" className={`block px-3 py-2 rounded-lg ${isActive('/launchpad/funded') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Funded
        </Link>
        <Link to="/launchpad/upcoming" className={`block px-3 py-2 rounded-lg ${isActive('/launchpad/upcoming') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Upcoming
        </Link>
        <Link to="/my-submissions" className={`block px-3 py-2 rounded-lg ${isActive('/my-submissions') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          My Submissions
        </Link>
        <Link to="/launchpad/drafts" className={`block px-3 py-2 rounded-lg ${isActive('/launchpad/drafts') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Drafts
        </Link>
      </nav>
      <div className="mt-8">
        <button 
          onClick={() => navigate('/launchpad/create')}
          className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-800"
        >
          Submit Proposal
        </button>
      </div>
    </>
  );

  const renderGovernanceSidebar = () => (
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Governance</h2>
      <nav className="space-y-1">
        <Link to="/governance" className={`block px-3 py-2 rounded-lg ${isActive('/governance') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          All Proposals
        </Link>
        <Link to="/governance/active" className={`block px-3 py-2 rounded-lg ${isActive('/governance/active') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Active Voting
        </Link>
        <Link to="/governance/passed" className={`block px-3 py-2 rounded-lg ${isActive('/governance/passed') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Passed
        </Link>
        <Link to="/governance/rejected" className={`block px-3 py-2 rounded-lg ${isActive('/governance/rejected') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Rejected
        </Link>
        <Link to="/governance/my-votes" className={`block px-3 py-2 rounded-lg ${isActive('/governance/my-votes') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          My Votes
        </Link>
        <Link to="/governance/drafts" className={`block px-3 py-2 rounded-lg ${isActive('/governance/drafts') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Drafts
        </Link>
      </nav>
      <div className="mt-8">
        <button 
          onClick={() => navigate('/governance/create')}
          className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-800"
        >
          Create Governance Proposal
        </button>
      </div>
    </>
  );

  const renderProfileSidebar = () => (
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
      <nav className="space-y-1">
        <Link to="/profile" className={`block px-3 py-2 rounded-lg ${isActive('/profile') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Overview
        </Link>
        <Link to="/profile/settings" className={`block px-3 py-2 rounded-lg ${isActive('/profile/settings') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Settings
        </Link>
      </nav>
    </>
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