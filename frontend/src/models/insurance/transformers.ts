import type { InsuranceCompanyDto, PatientInsuranceDto } from './dto';
import type { InsuranceCompanyModel, PatientInsuranceModel } from './model';

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

// Transform Patient Insurance DTO to Model
export const toPatientInsuranceModel = (dto: PatientInsuranceDto): PatientInsuranceModel => {
  return {
    patient_insurance_id: dto.patient_insurance_id,
    patient_id: dto.patient_id,
    insurance_company_id: dto.insurance_company_id,
    insurance_company_name: dto.insurance_company_name,
    insurance_number: dto.insurance_number,
    policy_holder_name: dto.policy_holder_name,
    relationship_to_holder: dto.relationship_to_holder,
    is_primary: dto.is_primary,
    is_verified: dto.is_verified,
    effective_date: dto.effective_date,
    expiration_date: dto.expiration_date,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
};

// Transform array of Patient Insurance DTOs to array of Models
export const toPatientInsuranceModels = (dtos: PatientInsuranceDto[]): PatientInsuranceModel[] => {
  return dtos.map(toPatientInsuranceModel);
};
