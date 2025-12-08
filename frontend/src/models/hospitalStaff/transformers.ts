import type { HospitalStaffDto } from './dto';
import type { HospitalStaffModel } from './model';

export const toHospitalStaffModel = (dto: HospitalStaffDto): HospitalStaffModel => ({
  hospital_staff_id: dto.hospital_staff_id,
  hospital_id: dto.hospital_id,
  person_email: dto.person_email,
  first_name: dto.first_name,
  last_name: dto.last_name,
  role: dto.role,
  is_verified: dto.is_verified,
  created_at: dto.created_at,
  updated_at: dto.updated_at,
});

export const toHospitalStaffModels = (dtos: HospitalStaffDto[]): HospitalStaffModel[] => dtos.map(toHospitalStaffModel);
