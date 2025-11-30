import { useEffect } from "react";
import { useAppointmentStore } from "../../stores/appointment/appointmentStore.prod";

// Centralized controller hook
export function useAppointmentsController(userId: string) {
  const { appointments, loading, error, load, add, remove } = useAppointmentStore(state => ({
    appointments: state.appointments,
    loading: state.loading,
    error: state.error,
    load: state.load,
    add: state.add,
    remove: state.remove,
  }));

  // Automatically load appointments once when hook is used
  useEffect(() => {
    if (!appointments || appointments.length === 0) {
      load(userId).catch(() => {});
    }
  }, [userId, load, appointments]);

  // You can add more helper functions here if needed
  const addAppointment = async (title: string, date: Date, patientId: string) => {
    return add({ title, startsAt: date, patientId });
  };

  const removeAppointment = async (id: string) => {
    return remove(id);
  };

  return {
    appointments,
    loading,
    error,
    addAppointment,
    removeAppointment,
  };
}
