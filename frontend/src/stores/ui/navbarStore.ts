import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { NavbarConfig } from '../../models/navbar/model';

interface PageNavbarState {
  activeTab: string;
  searchQuery: string;
}

export interface NavbarState {
  // State
  config: NavbarConfig | null;
  activeTab: string;
  searchQuery: string;
  pageStates: Record<string, PageNavbarState>;

  // Actions
  setConfig: (config: NavbarConfig | null) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
  savePageState: (page: string) => void;
  restorePageState: (page: string) => void;
}

export const createNavbarStore = () => {
  return create<NavbarState>()(persist(
    (set, get) => ({
      // Initial state
      config: null,
      activeTab: '',
      searchQuery: '',
      pageStates: {},

      // Actions
      setConfig: (config) => set({ config }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      reset: () => set({ activeTab: '', searchQuery: '' }),
      
      savePageState: (page) => {
        const { activeTab, searchQuery, pageStates } = get();
        set({
          pageStates: {
            ...pageStates,
            [page]: { activeTab, searchQuery },
          },
        });
      },
      
      restorePageState: (page) => {
        const { pageStates } = get();
        const savedState = pageStates[page];
        if (savedState) {
          set({
            activeTab: savedState.activeTab,
            searchQuery: savedState.searchQuery,
          });
        }
      },
    }),
    {
      name: 'navbar-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  ));
};

export type NavbarStore = ReturnType<typeof createNavbarStore>;
