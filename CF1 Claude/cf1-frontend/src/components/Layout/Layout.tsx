import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import GlobalSidebar from './GlobalSidebar';
import { useEventStream } from '../../lib/realtime/useEventStream';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { useKeyboardShortcuts, useCommonShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useAccessibility } from '../../hooks/useAccessibility';
import { KeyboardShortcutsHelp } from '../KeyboardShortcutsHelp';
import { AdminHeader } from '../Admin/AdminHeader';
import { AdminSidebar } from '../Admin/AdminSidebar';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';
import { useAdminViewStore } from '../../store/adminViewStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // Admin authentication and view management
  const { isAdmin, adminRole, logoutAdmin } = useAdminAuthContext();
  const { currentView, toggleView, exitAdminView } = useAdminViewStore();
  
  // Initialize real-time event streaming for authenticated users
  useEventStream({
    topics: ['proposal.*', 'market.*', 'governance.*', 'system.*'],
    autoConnect: true,
    onConnect: () => {
      console.log('✅ Connected to CF1 real-time events');
    },
    onDisconnect: () => {
      console.log('❌ Disconnected from CF1 real-time events');
    },
    onError: (error) => {
      console.error('🔴 Event stream error:', error);
    }
  });
  
  // Initialize real-time proposal and submission status updates
  const { simulateChange } = useRealTimeUpdates();
  
  // Initialize accessibility features
  const accessibility = useAccessibility();
  
  // Scroll restoration on route change
  useEffect(() => {
    // Scroll to top on every route change
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Fallback for older browsers or if scrollTo doesn't work
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    // Execute immediately
    scrollToTop();
    
    // Also execute with small delay to handle any layout shifts
    const timeoutId = setTimeout(scrollToTop, 50);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
  
  // Setup keyboard shortcuts
  const commonShortcuts = useCommonShortcuts();
  const layoutShortcuts = [
    ...commonShortcuts,
    {
      key: '?',
      shiftKey: true,
      action: () => setShowKeyboardHelp(true),
      description: 'Show keyboard shortcuts',
      category: 'global'
    }
  ];
  
  const { getShortcutHelp, formatShortcut } = useKeyboardShortcuts({
    shortcuts: layoutShortcuts,
    enabled: true
  });
  
  // Development keyboard shortcut for testing real-time updates
  useEffect(() => {
    if (import.meta.env.MODE === 'development' && simulateChange) {
      const handleKeyPress = (event: KeyboardEvent) => {
        // Ctrl + Shift + T to trigger a test notification
        if (event.ctrlKey && event.shiftKey && event.key === 'T') {
          event.preventDefault();
          simulateChange();
          console.log('🧪 Triggered test status change notification');
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [simulateChange]);

  // No longer needed - using global sidebar for all pages
  // Keeping only for admin view logic

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Admin Header - Show when in admin mode */}
      {isAdmin && currentView === 'admin' && (
        <AdminHeader
          adminRole={adminRole}
          currentView={currentView}
          onToggleView={toggleView}
          onExitAdminMode={() => {
            exitAdminView();
            logoutAdmin();
          }}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          {isAdmin && currentView === 'admin' ? (
            <AdminSidebar adminRole={adminRole} />
          ) : (
            <GlobalSidebar />
          )}
        </div>
        
        <main 
          id="main-content"
          className="flex-1 overflow-y-auto"
          role="main"
          aria-label="Main content"
          tabIndex={-1}
        >
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        shortcuts={getShortcutHelp()}
        formatShortcut={formatShortcut}
      />
    </div>
  );
};

export default Layout;