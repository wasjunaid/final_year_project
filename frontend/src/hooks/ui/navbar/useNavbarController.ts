import { useEffect, useRef } from 'react';
import { useNavbarStore } from '../../../stores/ui';
import { useSidebarController } from '../sidebar';
import type { NavbarConfig } from '../../../models/navbar/model';

/**
 * Controller hook for navbar state management
 * This is the only way to access navbar state - components should never access the store directly
 * 
 * @param config - Navbar configuration that will be set automatically. Can be reactive - if dependencies change, config will update.
 *                 Only omit this if you're accessing navbar state without owning the config (e.g., in Navbar or BasePortal components)
 */
export const useNavbarController = (config?: NavbarConfig) => {
  const {
    config: currentConfig,
    activeTab,
    searchQuery,
    setConfig,
    setActiveTab,
    setSearchQuery,
    reset,
    savePageState,
    restorePageState,
  } = useNavbarStore();
  
  const { currentPage } = useSidebarController();
  const hasConfig = useRef(config !== undefined);
  const isInitialized = useRef(false);

  // Set initial value
  useEffect(() => {
    hasConfig.current = config !== undefined;
  }, [config]);

  // Update config and restore/initialize state when config changes
  useEffect(() => {
    if (config !== undefined) {
      setConfig(config);
      
      // Try to restore saved state for this page
      restorePageState(currentPage);
      
      // If no saved state and tabs exist, select first tab by default
      const store = useNavbarStore.getState();
      if (config.tabs && config.tabs.length > 0 && !store.activeTab) {
        setActiveTab(config.tabs[0].value);
      }
      
      isInitialized.current = true;
    }
  }, [config, currentPage]); // Added currentPage to restore state when page changes

  // Cleanup: reset navbar config on unmount - only if config was provided (meaning this component owns it)
  useEffect(() => {
    return () => {
      if (hasConfig.current) {
        reset();
      }
    };
  }, []); // Only run on mount/unmount

  // Save navbar state whenever it changes
  useEffect(() => {
    if (currentConfig && isInitialized.current) {
      savePageState(currentPage);
    }
  }, [activeTab, searchQuery, currentPage, currentConfig, savePageState]);

  return {
    // State
    config: currentConfig,
    activeTab,
    searchQuery,
    
    // Actions
    setActiveTab,
    setSearchQuery,
  };
};