import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, X, Menu } from 'lucide-react';
import { useNavigationStore } from '../stores/navigation/navigationStore';
import type { NavbarConfig } from '../models/navigation/model';

interface NavbarProps {
  config: NavbarConfig;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ config, isMobileOpen, onMobileToggle }) => {
  const { 
    currentRoute, 
    getRouteState, 
    setSearchQuery, 
    setActiveTab 
  } = useNavigationStore();

  const routeState = getRouteState(currentRoute);
  const [localSearchQuery, setLocalSearchQuery] = useState(routeState.searchQuery);
  const [isSearchExpanded, setIsSearchExpanded] = useState(!!routeState.searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    title,
    subtitle,
    showBackButton = false,
    showSearch = false,
    searchPlaceholder = 'Search...',
    tabs,
    rightContent,
  } = config;

  // Sync local search with store and expand if query exists
  useEffect(() => {
    setLocalSearchQuery(routeState.searchQuery);
    if (routeState.searchQuery) {
      setIsSearchExpanded(true);
    }
  }, [routeState.searchQuery]);

  // Initialize active tab from config if not set
  useEffect(() => {
    if (tabs && tabs.length > 0 && !routeState.activeTab) {
      setActiveTab(tabs[0].value);
    }
  }, [tabs, routeState.activeTab, setActiveTab]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    setSearchQuery(value);
  };

  const handleTabClick = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleSearchToggle = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setLocalSearchQuery('');
      setSearchQuery('');
    }
  };

  // Close search when clicking outside (only if no text)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchExpanded && searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.search-button') && !localSearchQuery) {
          setIsSearchExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchExpanded, localSearchQuery]);

  return (
    <div className="bg-white rounded-xl shadow-md p-3 md:p-4 mb-3 md:mb-4 border border-gray-200">
      <div className="flex justify-between items-center min-h-[2.5rem]">
        {/* Left: Mobile Menu + Title */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileToggle}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            {title && (
              <h1 className="text-lg md:text-xl font-bold text-gray-800">{title}</h1>
            )}
            {subtitle && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{subtitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Search and Tabs */}
        <div className="flex items-center gap-2 md:gap-4 h-full">
          {/* Expandable Search */}
          {showSearch && (
            <div className="relative flex items-center">
              {isSearchExpanded ? (
                <div className="flex items-center gap-2 overflow-hidden" ref={searchInputRef} style={{ animation: 'slideInFromRight 0.3s ease-out forwards', width: '280px' }}>
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={localSearchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>
                  <button
                    onClick={handleSearchToggle}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSearchToggle}
                  className="search-button p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Search"
                >
                  <Search size={20} />
                </button>
              )}
            </div>
          )}
          
          {/* Tabs */}
          {tabs && tabs.length > 0 && (
            <div className="flex gap-4 md:gap-8 relative overflow-hidden" id="tabs">
              {tabs.map((tab) => {
                const isActive = routeState.activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabClick(tab.value)}
                    className={`tab relative pb-1 text-sm md:text-base transition-all duration-300 font-medium ${
                      isActive
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={{
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          {config.actions && config.actions.length > 0 && (
            <div className="flex items-center gap-2">
              {config.actions.map((action, index) => {
                const Icon = action.icon;
                const variantStyles = {
                  primary: 'bg-primary text-white hover:bg-primary-dark',
                  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
                  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
                  danger: 'bg-red-600 text-white hover:bg-red-700',
                  ghost: 'text-gray-700 hover:bg-gray-100',
                };
                const variantClass = variantStyles[action.variant || 'primary'];
                
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      variantClass
                    }`}
                  >
                    {Icon && <Icon size={18} />}
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom Right Content */}
          {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
