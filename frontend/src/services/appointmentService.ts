import type { AppointmentDTO } from "../models/appointment/dto";
import api from "./apiClient";

export const appointmentService = {
  async fetchList(userId: string): Promise<AppointmentDTO[]> {
    const res = await api.get<AppointmentDTO[]>(`/users/${userId}/appointments`);
    return res.data;
  },

  async create(payload: { title: string; starts_at: string; patient_id: string }) {
    const res = await api.post<AppointmentDTO>(`/appointments`, payload);
    return res.data;
  },

  async remove(id: string) {
    await api.delete(`/appointments/${id}`);
    return id;
  }
};
