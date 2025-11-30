import { useEffect } from 'react';
import { useNavigationStore } from '../stores/navigation/navigationStore';
import type { NavbarConfig } from '../models/navigation/model';

/**
 * Hook to set navbar configuration for the current page
 * This should be called at the top of each page component
 */
export const useNavbar = (config: NavbarConfig | null) => {
  const { setNavbarConfig } = useNavigationStore();

  useEffect(() => {
    console.log('[useNavbar] Setting navbar config:', config);
    setNavbarConfig(config);
    
    // Cleanup: clear navbar config when component unmounts
    return () => {
      console.log('[useNavbar] Cleaning up navbar config');
      setNavbarConfig(null);
    };
    // Only run when component mounts/unmounts, not on config changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/**
 * Hook to get current route state (search, activeTab, etc.)
 */
export const useRouteState = () => {
  const { currentRoute, getRouteState } = useNavigationStore();
  return getRouteState(currentRoute);
};
