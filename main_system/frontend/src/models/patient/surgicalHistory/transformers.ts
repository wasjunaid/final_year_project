import type { SurgicalHistory } from "./model";
import type { SurgicalHistoryDto } from "./dto";

export const toSurgicalHistoryModel = (dto: SurgicalHistoryDto): SurgicalHistory => {
  return {
    patientSurgicalHistoryId: dto.patient_surgical_history_id,
    patientId: dto.patient_id,
    surgeryName: dto.surgery_name,
    surgeryDate: dto.surgery_date ? new Date(dto.surgery_date) : undefined,
    createdAt: dto.created_at ? new Date(dto.created_at) : undefined,
  };
};
