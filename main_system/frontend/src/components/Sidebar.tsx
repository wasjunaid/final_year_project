import React from 'react';
import { LogOut, ChevronLeft, Menu } from 'lucide-react';
import { useSidebarController } from '../hooks/ui/sidebar';
import { useAuthController } from '../hooks/auth';
import type { SidebarConfig } from '../models/sidebar/model';
import logo from '../assets/logo.png';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  config: SidebarConfig;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ config, isMobileOpen, onMobileToggle }) => {
  const { signOut } = useAuthController();
  const { currentPage, navigateToPage, collapsed: sidebarCollapsed, toggle: toggleSidebar } = useSidebarController();

  const handleNavigation = (route: string) => {
    navigateToPage(route);
    onMobileToggle();
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-dark-bg-secondary ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } p-3 flex flex-col gap-3 rounded-xl fixed left-2 top-2 md:left-3 md:top-3 h-[calc(100vh-1rem)] md:h-[calc(100vh-1.5rem)] transition-all duration-300 z-50 overflow-y-auto overflow-x-hidden shadow-md border border-gray-200 dark:border-dark-border ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header with Collapse Button */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-gray-800 dark:text-dark-text">
                      {config.portalName}
                    </div>
                  </div>
                  {/* Collapse button - inline when expanded */}
                  <button
                    onClick={toggleSidebar}
                    className="flex w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg-tertiary transition-colors items-center justify-center text-xs shrink-0"
                    title="Collapse sidebar"
                  >
                    <ChevronLeft size={18} />
                  </button>
                </>
              )}
            </div>
            
            {/* Collapse button - below logo when collapsed */}
            {sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="flex w-full h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary hover:shadow-sm transition-colors items-center justify-center text-xs mt-3"
                title="Expand sidebar"
              >
                <Menu size={18} />
              </button>
            )}
          </div>

          {/* Main Navigation */}
          <nav className="flex flex-col gap-1.5 flex-1">
            {config.mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.route;

              return (
                <button
                  key={item.route}
                  onClick={() => handleNavigation(item.route)}
                  className={`nav-item flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all relative group ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary hover:shadow-sm'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left font-medium text-sm">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {/* Red dot indicator when collapsed */}
                  {sidebarCollapsed && item.badge && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-dark-bg-secondary" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-300 dark:border-dark-border pt-3 mt-3">
            <div className="flex flex-col gap-1.5">
              {config.bottomNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.route;

                return (
                  <button
                    key={item.route}
                    onClick={() => handleNavigation(item.route)}
                    className={`nav-item flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all relative group ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary hover:shadow-sm'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <Icon size={20} className="shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left font-medium text-sm">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {/* Red dot indicator when collapsed and has badge */}
                    {sidebarCollapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-dark-bg-secondary" />
                    )}
                  </button>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`nav-item flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-sm ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
                title={sidebarCollapsed ? 'Logout' : ''}
              >
                <LogOut size={20} className="shrink-0" />
                {!sidebarCollapsed && (
                  <span className="flex-1 text-left font-medium text-sm">Logout</span>
                )}
              </button>
              
              {/* Theme Toggle */}
              <div className={`${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                <ThemeToggle variant={sidebarCollapsed ? 'icon' : 'labeled-switch'} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onMobileToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
