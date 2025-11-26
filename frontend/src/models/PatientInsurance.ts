export interface PatientInsurance {
  patient_insurance_id: number;
  patient_id: number;
  insurance_company_id: number;
  insurance_number: string;
  policy_holder_name: string;
  relationship_to_holder: 'self' | 'spouse' | 'parent' | 'child' | 'other';
  group_number?: string;
  effective_date?: string;
  expiration_date?: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  
  // From view
  insurance_company_name?: string;
  patient_name?: string;
  patient_email?: string;
}

export interface CreatePatientInsuranceRequest {
  insurance_number: string;
  policy_holder_name: string;
  relationship_to_holder: 'self' | 'spouse' | 'parent' | 'child' | 'other';
  group_number?: string;
  effective_date?: string;
  expiration_date?: string;
  insurance_company_id: number;
  is_primary?: boolean;
}

export interface UpdatePatientInsuranceRequest {
  insurance_number?: string;
  policy_holder_name?: string;
  relationship_to_holder?: 'self' | 'spouse' | 'parent' | 'child' | 'other';
  group_number?: string;
  effective_date?: string;
  expiration_date?: string;
  insurance_company_id?: number;
  is_primary?: boolean;
  is_active?: boolean;
}