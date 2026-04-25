// DTOs match backend response structure exactly
export interface InsuranceCompanyDto {
  insurance_company_id: number;
  name: string;
  focal_person_name?: string | null;
  focal_person_email?: string | null;
  focal_person_phone?: string | null;
  address?: string | null;
  wallet_address?: string | null;
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
  auto_renewal_enabled?: boolean;
  is_active?: boolean;
  effective_date?: string;
  expiration_date?: string;
  last_renewed_at?: string;
  deactivated_at?: string;
  deactivation_reason?: string;
  created_at: string;
  updated_at: string;
}
