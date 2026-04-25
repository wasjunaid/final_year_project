import type { FamilyHistory } from "./model";
import type { FamilyHistoryDto } from "./dto";

export const toFamilyHistoryModel = (dto: FamilyHistoryDto): FamilyHistory => {
  return {
    patientFamilyHistoryId: dto.patient_family_history_id,
    patientId: dto.patient_id,
    conditionName: dto.condition_name,
    createdAt: dto.created_at ? new Date(dto.created_at) : undefined,
  };
};
