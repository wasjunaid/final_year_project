import React, { type ReactNode, useEffect, useState } from 'react';
import { useNavigationStore } from '../stores/navigation/navigationStore';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import type { SidebarConfig, PortalType } from '../models/navigation/model';

interface BasePortalProps {
  portalType: PortalType;
  sidebarConfig: SidebarConfig;
  children: ReactNode;
}

const BasePortal: React.FC<BasePortalProps> = ({ 
  portalType, 
  sidebarConfig, 
  children 
}) => {
  const { 
    activePortal, 
    sidebarCollapsed, 
    navbarConfig,
    setActivePortal 
  } = useNavigationStore();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Set active portal on mount
  useEffect(() => {
    if (activePortal !== portalType) {
      setActivePortal(portalType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalType]);

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="flex min-h-screen">
      {/* Floating Sidebar */}
      <Sidebar 
        config={sidebarConfig} 
        isMobileOpen={isMobileOpen}
        onMobileToggle={handleMobileToggle}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-0 md:ml-28' : 'ml-0 md:ml-72'
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
