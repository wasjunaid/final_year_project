import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScrollPosition {
  [key: string]: number;
}

interface UIState {
  // Sidebar state
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  
  // Scroll positions for different routes
  scrollPositions: ScrollPosition;
  
  // Navbar state
  activeTab: string;
  searchQuery: string;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  
  saveScrollPosition: (route: string, position: number) => void;
  getScrollPosition: (route: string) => number;
  
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  resetNavbarState: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
      scrollPositions: {},
      activeTab: '',
      searchQuery: '',
      
      // Sidebar actions
      toggleSidebar: () => 
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      
      setSidebarCollapsed: (collapsed: boolean) => 
        set({ isSidebarCollapsed: collapsed }),
      
      toggleMobileSidebar: () => 
        set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      
      setMobileSidebarOpen: (open: boolean) => 
        set({ isMobileSidebarOpen: open }),
      
      // Scroll position actions
      saveScrollPosition: (route: string, position: number) =>
        set((state) => ({
          scrollPositions: { ...state.scrollPositions, [route]: position },
        })),
      
      getScrollPosition: (route: string) => {
        return get().scrollPositions[route] || 0;
      },
      
      // Navbar actions
      setActiveTab: (tab: string) => set({ activeTab: tab }),
      
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      
      resetNavbarState: () => set({ activeTab: '', searchQuery: '' }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        scrollPositions: state.scrollPositions,
      }),
    }
  )
);
