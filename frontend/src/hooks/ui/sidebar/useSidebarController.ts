import { useSidebarStore } from '../../../stores/ui';

export const useSidebarController = () => {
  const {
    collapsed,
    currentPage,
    pageStates,
    selectedAppointmentId,
    selectedPatientId,
    toggle,
    setCollapsed,
    navigateToPage,
    saveScrollPosition,
    getPageState,
    setSelectedAppointmentId,
    setSelectedPatientId,
  } = useSidebarStore();

  return {
    // State
    collapsed,
    currentPage,
    pageStates,
    selectedAppointmentId,
    selectedPatientId,
    
    // Actions
    toggle,
    setCollapsed,
    navigateToPage,
    saveScrollPosition,
    getPageState,
    setSelectedAppointmentId,
    setSelectedPatientId,
  };
};