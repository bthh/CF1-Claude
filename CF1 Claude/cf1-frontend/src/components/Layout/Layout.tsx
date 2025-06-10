import React from 'react';
import { useLocation } from 'react-router-dom';
import SimpleHeader from './SimpleHeader';
import SimpleSidebar from './SimpleSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const getSidebarType = () => {
    if (location.pathname.startsWith('/marketplace')) {
      return 'marketplace';
    } else if (location.pathname.startsWith('/portfolio')) {
      return 'portfolio';
    } else if (location.pathname.startsWith('/launchpad')) {
      return 'launchpad';
    } else if (location.pathname.startsWith('/governance')) {
      return 'governance';
    } else if (location.pathname.startsWith('/profile')) {
      return 'profile';
    } else {
      return 'dashboard';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <SimpleHeader />
      <div className="flex flex-1 overflow-hidden">
        <SimpleSidebar type={getSidebarType()} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;