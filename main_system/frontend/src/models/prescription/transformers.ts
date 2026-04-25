import type { PrescriptionDto } from './dto';
import type { PrescriptionModel } from './model';

export const toPrescriptionModel = (dto: PrescriptionDto): PrescriptionModel => {
  return {
    prescriptionId: dto.prescription_id,
    appointmentId: dto.appointment_id,
    medicineId: dto.medicine_id,
    dosage: dto.dosage,
    instruction: dto.instruction,
    prescriptionDate: dto.prescription_date,
    isCurrent: dto.is_current,
    medicineName: dto.medicine_name ?? (dto as any).name ?? null,
    patientId: dto.patient_id,
    patientName: dto.patient_name,
    doctorName: dto.doctor_name,
  };
};

export const toPrescriptionModels = (dtos: PrescriptionDto[]): PrescriptionModel[] => {
  return dtos.map(toPrescriptionModel);
};
