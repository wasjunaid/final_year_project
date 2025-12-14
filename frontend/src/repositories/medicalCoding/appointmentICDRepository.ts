import { appointmentICDService } from '../../services/medicalCoding/appointmentICDService';
import type { AppointmentICDModel } from '../../models/medicalCoding/model';

export const appointmentICDRepository = {
  async fetchForAppointment(appointmentId: number): Promise<AppointmentICDModel[]> {
    const res = await appointmentICDService.getAppointmentICDCodes(appointmentId);
    if (!res || !res.success || !res.data) return [];
    return (res.data as any[]).map((d) => ({
      appointmentId: d.appointment_id ?? d.appointmentId,
      code: d.icd_code ?? d.code,
      description: d.description ?? d.icd_description ?? null,
      createdAt: d.created_at ?? d.createdAt ?? null,
    }));
  }
};
