import React from 'react';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../stores/navigation/navigationStore';
import { useAuthController } from '../hooks/useAuthController';
import type { SidebarConfig } from '../models/navigation/model';
import logo from '../assets/logo.png';

interface SidebarProps {
  config: SidebarConfig;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ config, isMobileOpen, onMobileToggle }) => {
  const navigate = useNavigate();
  const { logout } = useAuthController();
  const { 
    currentRoute, 
    sidebarCollapsed, 
    navigateTo, 
    toggleSidebar 
  } = useNavigationStore();

  const handleNavigation = (route: string) => {
    navigateTo(route);
    onMobileToggle();
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`bg-white ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } p-3 flex flex-col gap-3 rounded-xl fixed left-2 top-2 md:left-3 md:top-3 h-[calc(100vh-1rem)] md:h-[calc(100vh-1.5rem)] transition-all duration-300 z-50 overflow-y-auto overflow-x-hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ boxShadow: '0 0 20px rgba(0, 0, 0, 0.08)' }}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header with Collapse Button */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-gray-800">
                      {config.portalName}
                    </div>
                  </div>
                  {/* Collapse button - inline when expanded */}
                  <button
                    onClick={toggleSidebar}
                    className="flex bg-gray-600 text-white w-6 h-6 rounded-full shadow-lg hover:bg-gray-700 transition-colors items-center justify-center text-xs shrink-0"
                    title="Collapse sidebar"
                  >
                    <ChevronLeft size={14} />
                  </button>
                </>
              )}
            </div>
            
            {/* Collapse button - below logo when collapsed */}
            {sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="flex bg-gray-600 text-white w-full h-8 rounded-lg shadow-lg hover:bg-gray-700 transition-colors items-center justify-center text-xs mt-3"
                title="Expand sidebar"
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Main Navigation */}
          <nav className="flex flex-col gap-1.5 flex-1">
            {config.mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;

              return (
                <button
                  key={item.route}
                  onClick={() => handleNavigation(item.route)}
                  className={`nav-item flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all relative group ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
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
                </button>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t pt-3 mt-3">
            <div className="flex flex-col gap-1.5">
              {config.bottomNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.route;

                return (
                  <button
                    key={item.route}
                    onClick={() => handleNavigation(item.route)}
                    className={`nav-item flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all relative group ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <Icon size={20} className="shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="flex-1 text-left font-medium text-sm">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`nav-item flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all text-red-600 hover:bg-red-50 hover:shadow-sm ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
                title={sidebarCollapsed ? 'Logout' : ''}
              >
                <LogOut size={20} className="shrink-0" />
                {!sidebarCollapsed && (
                  <span className="flex-1 text-left font-medium text-sm">Logout</span>
                )}
              </button>
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
