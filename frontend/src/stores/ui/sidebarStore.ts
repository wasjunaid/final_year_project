import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PageState {
  scrollPosition: number;
}

export interface SidebarState {
  // State
  collapsed: boolean;
  currentPage: string;
  pageStates: Record<string, PageState>;
  selectedAppointmentId: number | null;
  selectedPatientId: number | null;

  // Actions
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  navigateToPage: (page: string) => void;
  saveScrollPosition: (position: number) => void;
  getPageState: (page: string) => PageState;
  setSelectedAppointmentId: (id: number | null) => void;
  setSelectedPatientId: (id: number | null) => void;
}

const DEFAULT_PAGE_STATE: PageState = {
  scrollPosition: 0,
};

export const createSidebarStore = () => {
  return create<SidebarState>()(
  persist(
    (set, get) => ({
      // Initial state
      collapsed: false,
      currentPage: 'appointments',
      pageStates: {},
      selectedAppointmentId: null,
      selectedPatientId: null,

      // Actions
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      setSelectedAppointmentId: (id) => set({ selectedAppointmentId: id }),
      setSelectedPatientId: (id) => set({ selectedPatientId: id }),
      
      navigateToPage: (page) => {
        const { currentPage, pageStates } = get();
        
        // Save scroll position of current page before navigating
        const scrollPosition = window.scrollY;
        const currentState = pageStates[currentPage] || DEFAULT_PAGE_STATE;
        
        set({
          pageStates: {
            ...pageStates,
            [currentPage]: {
              ...currentState,
              scrollPosition,
            },
          },
          currentPage: page,
        });
        
        // Restore scroll position of new page after navigation
        setTimeout(() => {
          const newPageState = get().pageStates[page];
          if (newPageState?.scrollPosition) {
            window.scrollTo(0, newPageState.scrollPosition);
          } else {
            window.scrollTo(0, 0);
          }
        }, 0);
      },
      
      saveScrollPosition: (position) => {
        const { currentPage, pageStates } = get();
        const currentState = pageStates[currentPage] || DEFAULT_PAGE_STATE;
        
        set({
          pageStates: {
            ...pageStates,
            [currentPage]: {
              ...currentState,
              scrollPosition: position,
            },
          },
        });
      },
      
      getPageState: (page) => {
        const { pageStates } = get();
        return pageStates[page] || DEFAULT_PAGE_STATE;
      },
    }),
    {
      name: 'sidebar-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  ));
};

export type SidebarStore = ReturnType<typeof createSidebarStore>;
