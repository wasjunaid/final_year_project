import type { HospitalDto } from './dto';
import type { HospitalModel } from './model';

// Transform DTO to Model
export const toHospitalModel = (dto: HospitalDto): HospitalModel => {
  return {
    hospital_id: dto.hospital_id,
    name: dto.name,
    wallet_address: dto.wallet_address,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
};

// Transform array of DTOs to array of Models
export const toHospitalModels = (dtos: HospitalDto[]): HospitalModel[] => {
  return dtos.map(toHospitalModel);
};
