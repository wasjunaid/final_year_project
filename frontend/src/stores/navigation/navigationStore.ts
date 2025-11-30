import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PortalType, RouteState, NavbarConfig } from '../../models/navigation/model';

interface NavigationState {
  // Current portal and route
  activePortal: PortalType;
  currentRoute: string;
  
  // Sidebar state
  sidebarCollapsed: boolean;
  
  // Route-specific states (persisted per route within each portal)
  routeStates: Record<string, RouteState>;
  
  // Current navbar configuration (managed dynamically by pages)
  navbarConfig: NavbarConfig | null;
  
  // Actions
  setActivePortal: (portal: PortalType) => void;
  navigateTo: (route: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Route state management
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: string) => void;
  saveScrollPosition: (position: number) => void;
  getRouteState: (route: string) => RouteState;
  
  // Navbar management
  setNavbarConfig: (config: NavbarConfig | null) => void;
  
  // Reset route state
  resetRouteState: (route: string) => void;
}

const DEFAULT_ROUTE_STATE: RouteState = {
  searchQuery: '',
  activeTab: '',
  scrollPosition: 0,
};

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      // Initial state
      activePortal: 'doctor',
      currentRoute: 'appointments',
      sidebarCollapsed: false,
      routeStates: {},
      navbarConfig: null,

      // Portal and route navigation
      setActivePortal: (portal) => set({ activePortal: portal }),
      
      navigateTo: (route) => {
        const { currentRoute, routeStates } = get();
        
        // Save scroll position of current route before navigating
        const scrollPosition = window.scrollY;
        const currentState = routeStates[currentRoute] || DEFAULT_ROUTE_STATE;
        
        set({
          routeStates: {
            ...routeStates,
            [currentRoute]: {
              ...currentState,
              scrollPosition,
            },
          },
          currentRoute: route,
        });
        
        // Restore scroll position of new route after navigation
        setTimeout(() => {
          const newRouteState = get().routeStates[route];
          if (newRouteState?.scrollPosition) {
            window.scrollTo(0, newRouteState.scrollPosition);
          } else {
            window.scrollTo(0, 0);
          }
        }, 0);
      },

      // Sidebar actions
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Route state getters and setters
      getRouteState: (route) => {
        const { routeStates } = get();
        return routeStates[route] || DEFAULT_ROUTE_STATE;
      },

      setSearchQuery: (query) => {
        const { currentRoute, routeStates } = get();
        const currentState = routeStates[currentRoute] || DEFAULT_ROUTE_STATE;
        
        set({
          routeStates: {
            ...routeStates,
            [currentRoute]: {
              ...currentState,
              searchQuery: query,
            },
          },
        });
      },

      setActiveTab: (tab) => {
        const { currentRoute, routeStates } = get();
        const currentState = routeStates[currentRoute] || DEFAULT_ROUTE_STATE;
        
        set({
          routeStates: {
            ...routeStates,
            [currentRoute]: {
              ...currentState,
              activeTab: tab,
            },
          },
        });
      },

      saveScrollPosition: (position) => {
        const { currentRoute, routeStates } = get();
        const currentState = routeStates[currentRoute] || DEFAULT_ROUTE_STATE;
        
        set({
          routeStates: {
            ...routeStates,
            [currentRoute]: {
              ...currentState,
              scrollPosition: position,
            },
          },
        });
      },

      // Navbar configuration
      setNavbarConfig: (config) => set({ navbarConfig: config }),

      // Reset route state
      resetRouteState: (route) => {
        const { routeStates } = get();
        const newStates = { ...routeStates };
        delete newStates[route];
        set({ routeStates: newStates });
      },
    }),
    {
      name: 'navigation-storage',
      partialize: (state) => ({
        activePortal: state.activePortal,
        currentRoute: state.currentRoute,
        sidebarCollapsed: state.sidebarCollapsed,
        routeStates: state.routeStates,
      }),
    }
  )
);
