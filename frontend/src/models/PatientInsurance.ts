export interface PatientInsurance {
  patient_insurance_id: number;
  patient_id: number;
  insurance_number: number;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Joined data (if needed)
  insurance_company_name?: string;
  insurance_company_id?: number;
}

export interface CreatePatientInsuranceRequest {
  insurance_number: number;
  insurance_company_id: number;
}

export interface UpdatePatientInsuranceRequest {
  insurance_number: number;
  is_primary: boolean;
}
