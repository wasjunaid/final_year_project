import type { InsuranceCompanyDto } from './dto';
import type { InsuranceCompanyModel } from './model';

// Transform Insurance Company DTO to Model
export const toInsuranceCompanyModel = (dto: InsuranceCompanyDto): InsuranceCompanyModel => {
  return {
    insurance_company_id: dto.insurance_company_id,
    name: dto.name,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
};

// Transform array of Insurance Company DTOs to array of Models
export const toInsuranceCompanyModels = (dtos: InsuranceCompanyDto[]): InsuranceCompanyModel[] => {
  return dtos.map(toInsuranceCompanyModel);
};
