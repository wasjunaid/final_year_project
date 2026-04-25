import type { Allergy } from "./model";
import type { AllergyDto } from "./dto";

export const toAllergyModel = (dto: AllergyDto): Allergy => {
  return {
    patientAllergyId: dto.patient_allergy_id,
    patientId: dto.patient_id,
    allergyName: dto.allergy_name,
    createdAt: dto.created_at ? new Date(dto.created_at) : undefined,
  };
};
