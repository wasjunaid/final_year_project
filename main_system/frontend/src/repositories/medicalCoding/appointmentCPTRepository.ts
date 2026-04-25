import { appointmentCPTService } from '../../services/medicalCoding/appointmentCPTService';
import type { AppointmentCPTModel } from '../../models/medicalCoding/model';

export const appointmentCPTRepository = {
  async fetchForAppointment(appointmentId: number): Promise<AppointmentCPTModel[]> {
    const res = await appointmentCPTService.getAppointmentCPTCodes(appointmentId);
    if (!res || !res.success || !res.data) return [];
    return (res.data as any[]).map((d) => ({
      appointmentId: d.appointment_id ?? d.appointmentId,
      code: d.cpt_code ?? d.code,
      description: d.description ?? d.cpt_description ?? null,
      createdAt: d.created_at ?? d.createdAt ?? null,
    }));
  }
};
