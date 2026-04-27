import React, { type ReactNode, useEffect, useState } from 'react';
import { useSidebarController } from '../hooks/ui/sidebar';
import { useNavbarController } from '../hooks/ui/navbar';
import Sidebar from './Sidebar';
import Navbar from './NavBar';
import type { SidebarConfig } from '../models/sidebar/model';

interface BasePortalProps {
  sidebarConfig: SidebarConfig;
  children: ReactNode;
}

const BasePortal: React.FC<BasePortalProps> = ({ 
  sidebarConfig, 
  children 
}) => {
  const { collapsed: sidebarCollapsed, navigateToPage } = useSidebarController();
  const { config: navbarConfig } = useNavbarController();
  const defaultRoute = sidebarConfig.mainNavItems[0]?.route;

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (defaultRoute) {
      navigateToPage(defaultRoute);
    }
  }, [sidebarConfig.portalName, defaultRoute, navigateToPage]);

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Floating Sidebar */}
      <Sidebar 
        config={sidebarConfig} 
        isMobileOpen={isMobileOpen}
        onMobileToggle={handleMobileToggle}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-0 md:ml-24' : 'ml-0 md:ml-68'
        } p-2 md:p-3`}
      >
        {/* Navbar - only render if config exists */}
        {navbarConfig && (
          <Navbar 
            config={navbarConfig} 
            isMobileOpen={isMobileOpen}
            onMobileToggle={handleMobileToggle}
          />
        )}
        
        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BasePortal;
