import type { AppointmentDTO } from "../models/appointment/dto";
import type { Appointment } from "../models/appointment/model";
import { appointmentService } from "../services/appointmentService";

export function createAppointmentRepository({ appointmentService: svc = appointmentService } = {}) {
  function toModel(dto: AppointmentDTO): Appointment {
    return {
      id: dto.id,
      title: dto.title,
      startsAt: new Date(dto.starts_at),
      patientName: dto.patient?.name ?? "Unknown",
    };
  }

  return {
    async getForUser(userId: string): Promise<Appointment[]> {
      const list = await svc.fetchList(userId);
      return list.map(toModel);
    },

    async createAppointment(payload: { title: string; startsAt: Date; patientId: string }): Promise<Appointment> {
      if (payload.startsAt < new Date()) {
        throw new Error("Appointment time must be in the future");
      }
      const dto = await svc.create({
        title: payload.title,
        starts_at: payload.startsAt.toISOString(),
        patient_id: payload.patientId,
      });
      return toModel(dto);
    },

    async delete(id: string) {
      return svc.remove(id);
    }
  };
}
