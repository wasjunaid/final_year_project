// Payloads for API requests
export interface CreateInsuranceCompanyPayload {
  name: string;
}

export interface UpdateInsuranceCompanyPayload {
  name: string;
}

export interface CreatePatientInsurancePayload {
  insurance_company_id: number;
  insurance_number: string;
  policy_holder_name: string;
  relationship_to_holder: string;
  is_primary: boolean;
}

export interface UpdatePatientInsurancePayload {
  is_primary: boolean;
}
