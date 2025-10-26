export interface PatientInsurance {
  patient_insurance_id: number;
  patient_id: number;
  insurance_company_id: number;
  policy_number: string;
  coverage_amount: number;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  // Extended fields
  patient_name?: string;
  insurance_company_name?: string;
}

export interface CreatePatientInsuranceRequest {
  insurance_company_id: number;
  policy_number: string;
  coverage_amount: number;
}

export interface UpdatePatientInsuranceRequest {
  patient_insurance_id: number;
  policy_number?: string;
  coverage_amount?: number;
}