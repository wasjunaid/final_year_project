// stores/createAppointmentStore.ts
import { create } from "zustand";
import type { Appointment } from "../../models/appointment/model";

export type AppointmentStore = {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;

  load: (userId: string) => Promise<void>;
  add: (payload: { title: string; startsAt: Date; patientId: string }) => Promise<Appointment>;
  remove: (id: string) => Promise<void>;
};

// factory accepts repository for DI
export const createAppointmentStore = ({ repository }: { repository: any }) => {
  return create<AppointmentStore>((set, get) => ({
    appointments: [],
    loading: false,
    error: null,

    load: async (userId: string) => {
      set({ loading: true, error: null });
      try {
        const list = await repository.getForUser(userId);
        set({ appointments: list, loading: false });
      } catch (err: any) {
        set({ error: err.message ?? "Failed to load", loading: false });
      }
    },

    add: async (payload) => {
      set({ loading: true, error: null });
      try {
        const created = await repository.createAppointment(payload);
        set((s) => ({ appointments: [created, ...s.appointments], loading: false }));
        return created;
      } catch (err: any) {
        set({ error: err.message ?? "Failed to create", loading: false });
        throw err;
      }
    },

    remove: async (id) => {
      const before = get().appointments;
      set((s) => ({ appointments: s.appointments.filter(a => a.id !== id) }));
      try {
        await repository.delete(id);
      } catch (err: any) {
        // rollback
        set({ appointments: before, error: err.message ?? "Failed to delete" });
      }
    }
  }));
};
