import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  type: 'dashboard' | 'marketplace' | 'portfolio' | 'launchpad' | 'governance' | 'profile';
}

const SimpleSidebar: React.FC<SidebarProps> = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  const renderDashboardSidebar = () => (
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dashboard</h2>
      <nav className="space-y-1">
        <Link to="/dashboard" className={`block px-3 py-2 rounded-lg ${isActive('/dashboard') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Overview
        </Link>
        <Link to="/dashboard/performance" className={`block px-3 py-2 rounded-lg ${isActive('/dashboard/performance') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Spotlight
        </Link>
        <Link to="/dashboard/activity" className={`block px-3 py-2 rounded-lg ${isActive('/dashboard/activity') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Activity
        </Link>
      </nav>
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Portfolio Value</h4>
        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">$124,523</p>
        <p className="text-sm text-green-600 mt-1">+12.5% this month</p>
      </div>
    </>
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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Launchpad</h2>
      <nav className="space-y-1">
        <Link to="/launchpad" className={`block px-3 py-2 rounded-lg ${isActive('/launchpad') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          All Proposals
        </Link>
        <Link to="/launchpad/active" className={`block px-3 py-2 rounded-lg ${isActive('/launchpad/active') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          Active
        </Link>
        <Link to="/launchpad/funded" className={`block px-3 py-2 rounded-lg ${isActive('/launchpad/funded') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          Funded
        </Link>
        <Link to="/launchpad/upcoming" className={`block px-3 py-2 rounded-lg ${isActive('/launchpad/upcoming') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          Upcoming
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
      </nav>
      <div className="mt-8">
        <button 
          onClick={() => navigate('/launchpad/create')}
          className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-800"
        >
          Create Proposal
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
    <aside className="w-64 bg-blue-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-4">
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