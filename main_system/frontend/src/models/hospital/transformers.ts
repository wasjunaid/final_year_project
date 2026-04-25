import type { HospitalDto } from './dto';
import type { HospitalModel } from './model';

// Transform DTO to Model
export const toHospitalModel = (dto: HospitalDto): HospitalModel => {
  return {
    hospital_id: dto.hospital_id,
    name: dto.name,
    focal_person_name: dto.focal_person_name,
    focal_person_email: dto.focal_person_email,
    focal_person_phone: dto.focal_person_phone,
    address: dto.address,
    wallet_address: dto.wallet_address,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    hospitalization_daily_charge: dto.hospitalization_daily_charge,
  };
};

// Transform array of DTOs to array of Models
export const toHospitalModels = (dtos: HospitalDto[]): HospitalModel[] => {
  return dtos.map(toHospitalModel);
};
