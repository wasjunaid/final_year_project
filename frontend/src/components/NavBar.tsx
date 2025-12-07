import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, X, Menu } from 'lucide-react';
import { useNavbarController } from '../hooks/ui/navbar';
import type { NavbarConfig } from '../models/navbar/model';

interface NavbarProps {
  config: NavbarConfig;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ config, isMobileOpen, onMobileToggle }) => {
  const { activeTab, searchQuery, setActiveTab, setSearchQuery } = useNavbarController();
  
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearchExpanded, setIsSearchExpanded] = useState(!!searchQuery);
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
    setLocalSearchQuery(searchQuery);
    if (searchQuery) {
      setIsSearchExpanded(true);
    }
  }, [searchQuery]);

  // Note: activeTab is now managed by useNavbarController and restored from page state
  // No need to initialize here as the controller handles it

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
    <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md p-3 md:p-4 mb-3 md:mb-4 border border-gray-200 dark:border-[#404040]">
      <div className="flex justify-between items-center min-h-10">
        {/* Left: Mobile Menu + Title */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileToggle}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-[--color-dark-bg-tertiary] rounded-lg transition-colors"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[--color-dark-bg-tertiary] rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            {title && (
              <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-[#e5e5e5]">{title}</h1>
            )}
            {subtitle && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-[#a0a0a0]">{subtitle}</span>
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#404040] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white dark:bg-[#3a3a3a] dark:text-[#e5e5e5]"
                    />
                  </div>
                  <button
                    onClick={handleSearchToggle}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[--color-dark-bg-tertiary] rounded-lg transition-colors shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSearchToggle}
                  className="search-button p-2 hover:bg-gray-100 dark:hover:bg-[--color-dark-bg-tertiary] rounded-lg transition-colors"
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
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabClick(tab.value)}
                    className={`tab relative pb-1 text-sm md:text-base transition-all duration-300 font-medium ${
                      isActive
                        ? 'text-primary dark:text-white border-b-2 border-primary dark:border-white'
                        : 'text-gray-600 dark:text-[#a0a0a0] hover:text-gray-800 dark:hover:text-[#e5e5e5]'
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
                  primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed',
                  secondary: 'bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed',
                  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white dark:text-primary dark:border-primary disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed',
                  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed',
                  ghost: 'text-gray-700 dark:text-[#e5e5e5] hover:bg-gray-100 dark:hover:bg-[#3a3a3a] disabled:text-gray-400 disabled:cursor-not-allowed',
                };
                const variantClass = variantStyles[action.variant || 'primary'];
                
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={action.disabled}
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
