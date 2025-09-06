import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Gift, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import { usePortfolioData } from '../../services/portfolioDataService';
import { useNotificationSystemStore } from '../../store/notificationSystemStore';

interface GlobalSidebarProps {
  className?: string;
}

const GlobalSidebar: React.FC<GlobalSidebarProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebar-width');
    return saved ? parseInt(saved) : 320;
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const MIN_WIDTH = 240; // Minimum width where compact mode works well
  const MAX_WIDTH = 352; // 110% of original 320px
  
  // Determine if we're in compact mode (at minimum width)
  const isCompactMode = sidebarWidth <= 260;

  // Data hooks
  const { summary, isEmpty } = usePortfolioData();
  const { getUnreadNotifications, unreadCount, getRecentNotifications } = useNotificationSystemStore();

  // Mock rewards data - will be replaced with actual rewards service integration
  const rewardsData = {
    totalEarned: '$5,759.50',
    monthlyRewards: '$576.75',
    yearlyProjection: '$6,921.00'
  };

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', newCollapsed.toString());
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !sidebarRef.current) return;
    
    const rect = sidebarRef.current.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    
    if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
      setSidebarWidth(newWidth);
      localStorage.setItem('sidebar-width', newWidth.toString());
    }
  }, [isResizing, MIN_WIDTH, MAX_WIDTH]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleViewPortfolio = () => {
    navigate('/portfolio');
  };

  const handleViewRewards = () => {
    navigate('/portfolio');
    // Use a small delay to ensure navigation completes, then programmatically set the rewards tab
    setTimeout(() => {
      // Dispatch a custom event that Portfolio can listen to
      window.dispatchEvent(new CustomEvent('setPortfolioTab', { detail: { tab: 'rewards' } }));
    }, 100);
  };

  const handleViewNotifications = () => {
    navigate('/dashboard/activity');
  };

  // Portfolio widget data
  const portfolioValue = isEmpty ? '$0' : summary.totalValue;
  const portfolioGain = isEmpty ? '$0' : summary.totalGain;
  const isPositive = isEmpty ? true : summary.isPositive;

  // Recent notifications for display
  const recentNotifications = getRecentNotifications(3);

  if (isCollapsed) {
    return (
      <aside ref={sidebarRef} className={`w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col shadow-sm ${className}`}>
        {/* Toggle Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleCollapsed}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Collapsed Widgets */}
        <div className="flex-1 p-3 space-y-4">
          {/* Portfolio Icon */}
          <button
            onClick={handleViewPortfolio}
            className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            title="Portfolio"
          >
            <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Portfolio</span>
          </button>

          {/* Rewards Icon */}
          <button
            onClick={handleViewRewards}
            className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            title="Rewards"
          >
            <Gift className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Rewards</span>
          </button>

          {/* Notifications Icon */}
          <button
            onClick={handleViewNotifications}
            className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Alerts</span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      ref={sidebarRef}
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex shadow-sm relative ${className}`}
      style={{ width: `${sidebarWidth}px`, minWidth: `${MIN_WIDTH}px`, maxWidth: `${MAX_WIDTH}px` }}
    >
      <div className="flex flex-col flex-1">
        {/* Header with Toggle */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {isCompactMode ? 'CF1' : 'Dashboard'}
            </h2>
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Widgets Container */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ minWidth: 0 }}>
          {/* Portfolio Value Widget */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl p-3 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1 min-w-0 flex-1">
                <Briefcase className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">Portfolio Value</h3>
              </div>
              <button
                onClick={handleViewPortfolio}
                className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                title="View Portfolio"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                {portfolioValue}
              </div>
              <div className="flex items-center space-x-1 min-w-0">
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 text-green-600 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600 flex-shrink-0" />
                )}
                <span className={`text-xs font-medium truncate ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioGain} ({summary.totalGainPercent})
                </span>
              </div>
            </div>
            
            <button
              onClick={handleViewPortfolio}
              className="w-full mt-3 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white py-2 px-2 rounded-lg text-xs font-medium transition-colors truncate"
            >
              {isCompactMode ? 'View' : 'View Portfolio'}
            </button>
          </div>

          {/* Rewards Widget */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl p-3 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1 min-w-0 flex-1">
                <Gift className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">Rewards</h3>
              </div>
              <button
                onClick={handleViewRewards}
                className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                title="View Rewards"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Total Earned</p>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{rewardsData.totalEarned}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 min-w-0">
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Monthly</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{rewardsData.monthlyRewards}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Yearly</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{rewardsData.yearlyProjection}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleViewRewards}
              className="w-full mt-3 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white py-2 px-2 rounded-lg text-xs font-medium transition-colors truncate"
            >
              {isCompactMode ? 'View' : 'View Rewards'}
            </button>
          </div>

          {/* Notifications Widget */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl p-3 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1 min-w-0 flex-1">
                <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={handleViewNotifications}
                className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                title="View All Notifications"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 min-w-0">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notification) => (
                  <div key={notification.id} className="border-b border-gray-200 dark:border-gray-600 pb-1 last:border-b-0 last:pb-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                      {notification.title}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">No recent notifications</p>
              )}
            </div>
            
            <button
              onClick={handleViewNotifications}
              className="w-full mt-3 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white py-2 px-2 rounded-lg text-xs font-medium transition-colors truncate"
            >
              {isCompactMode ? 'View' : 'View All'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:w-2 transition-all duration-200"
        onMouseDown={handleMouseDown}
        title="Drag to resize sidebar"
      >
        <div className="absolute inset-0 bg-transparent group-hover:bg-blue-500/20 transition-colors" />
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
        </div>
      </div>
    </aside>
  );
};

export default GlobalSidebar;