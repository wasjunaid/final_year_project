import type { SystemSubAdminDto, HospitalAdminDto } from './dto';
import type { SystemSubAdminModel, HospitalAdminModel } from './model';

// Transform System Sub Admin DTO to Model
export const toSystemSubAdminModel = (dto: SystemSubAdminDto): SystemSubAdminModel => {
  return {
    system_admin_id: dto.system_admin_id,
    email: dto.email,
    first_name: dto.first_name,
    last_name: dto.last_name,
    cnic: dto.cnic,
    date_of_birth: dto.date_of_birth,
    gender: dto.gender,
    is_verified: dto.is_verified,
    role: dto.role,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
};

// Transform array of System Sub Admin DTOs to array of Models
export const toSystemSubAdminModels = (dtos: SystemSubAdminDto[]): SystemSubAdminModel[] => {
  return dtos.map(toSystemSubAdminModel);
};

// Transform Hospital Admin DTO to Model
export const toHospitalAdminModel = (dto: HospitalAdminDto): HospitalAdminModel => {
  return {
    hospital_staff_id: dto.hospital_staff_id,
    hospital_id: dto.hospital_id,
    hospital_name: dto.hospital_name,
    email: dto.person_email, // Note: backend returns person_email
    first_name: dto.first_name,
    last_name: dto.last_name,
    cnic: dto.cnic,
    date_of_birth: dto.date_of_birth,
    gender: dto.gender,
    is_verified: dto.is_verified,
    role: dto.role,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
};

// Transform array of Hospital Admin DTOs to array of Models
export const toHospitalAdminModels = (dtos: HospitalAdminDto[]): HospitalAdminModel[] => {
  return dtos.map(toHospitalAdminModel);
};
