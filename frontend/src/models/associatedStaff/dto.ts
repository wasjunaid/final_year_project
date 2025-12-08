import type { AssociatedDoctorDto } from './doctors/dto';
import type { AssociatedMedicalCoderDto } from './medicalCoder/dto';

export interface AssociatedStaffResponseDto {
  doctors: AssociatedDoctorDto[];
  medicalCoders: AssociatedMedicalCoderDto[];
}

export * from './doctors/dto';
export * from './medicalCoder/dto';
