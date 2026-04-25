import type { AssociatedStaffResponseDto } from './dto';
import { toAssociatedDoctorModel } from './doctors/transformers';
import { toAssociatedMedicalCoderModel } from './medicalCoder/transformers';

export function toAssociatedStaffModels(dto: AssociatedStaffResponseDto) {
  return {
    doctors: (dto.doctors || []).map(toAssociatedDoctorModel),
    medicalCoders: (dto.medicalCoders || []).map(toAssociatedMedicalCoderModel),
  };
}

export * from './doctors/transformers';
export * from './medicalCoder/transformers';
