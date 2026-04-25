import type { MedicalHistory } from "./model";
import type { MedicalHistoryDto } from "./dto";

export const toMedicalHistoryModel = (dto: MedicalHistoryDto): MedicalHistory => {
  return {
    patientMedicalHistoryId: dto.patient_medical_history_id,
    patientId: dto.patient_id,
    conditionName: dto.condition_name,
    diagnosisDate: dto.diagnosis_date ? new Date(dto.diagnosis_date) : undefined,
    createdAt: dto.created_at ? new Date(dto.created_at) : undefined,
  };
};
