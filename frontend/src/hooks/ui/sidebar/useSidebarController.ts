import { useSidebarStore } from '../../../stores/ui';

export const useSidebarController = () => {
  const {
    collapsed,
    currentPage,
    pageStates,
    selectedAppointmentId,
    toggle,
    setCollapsed,
    navigateToPage,
    saveScrollPosition,
    getPageState,
    setSelectedAppointmentId,
  } = useSidebarStore();

  return {
    // State
    collapsed,
    currentPage,
    pageStates,
    selectedAppointmentId,
    
    // Actions
    toggle,
    setCollapsed,
    navigateToPage,
    saveScrollPosition,
    getPageState,
    setSelectedAppointmentId,
  };
};