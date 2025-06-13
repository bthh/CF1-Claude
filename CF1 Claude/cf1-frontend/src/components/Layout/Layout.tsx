import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import SimpleSidebar from './SimpleSidebar';
import { useEventStream } from '../../lib/realtime/useEventStream';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { useKeyboardShortcuts, useCommonShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useAccessibility } from '../../hooks/useAccessibility';
import { KeyboardShortcutsHelp } from '../KeyboardShortcutsHelp';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
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
  const { announce } = useAccessibility();
  
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
    if (process.env.NODE_ENV === 'development' && simulateChange) {
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

  const getSidebarType = () => {
    if (location.pathname.startsWith('/marketplace')) {
      return 'marketplace';
    } else if (location.pathname.startsWith('/portfolio')) {
      return 'portfolio';
    } else if (location.pathname.startsWith('/launchpad') || location.pathname.startsWith('/my-submissions')) {
      return 'launchpad';
    } else if (location.pathname.startsWith('/governance')) {
      return 'governance';
    } else if (location.pathname.startsWith('/profile')) {
      return 'profile';
    } else if (location.pathname.startsWith('/trading') || location.pathname.startsWith('/liquidity') || location.pathname.startsWith('/staking') || location.pathname.startsWith('/lending')) {
      return 'marketplace'; // Use marketplace sidebar for DeFi features since it includes trading
    } else {
      return 'dashboard';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <SimpleSidebar type={getSidebarType()} />
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