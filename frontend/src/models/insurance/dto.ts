// DTOs match backend response structure exactly
export interface InsuranceCompanyDto {
  insurance_company_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PatientInsuranceDto {
  patient_insurance_id: number;
  patient_id: number;
  insurance_company_id: number;
  insurance_company_name: string;
  insurance_number: string;
  policy_holder_name: string;
  relationship_to_holder: string;
  is_primary: boolean;
  is_verified: boolean;
  effective_date?: string;
  expiration_date?: string;
  created_at: string;
  updated_at: string;
}
