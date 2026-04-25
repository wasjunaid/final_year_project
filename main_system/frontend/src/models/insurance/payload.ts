// Payloads for API requests
export interface CreateInsuranceCompanyPayload {
  name: string;
  focal_person_name?: string | null;
  focal_person_email?: string | null;
  focal_person_phone?: string | null;
  address?: string | null;
  wallet_address?: string | null;
}

export interface UpdateInsuranceCompanyPayload {
  name: string;
  focal_person_name?: string | null;
  focal_person_email?: string | null;
  focal_person_phone?: string | null;
  address?: string | null;
  wallet_address?: string | null;
}

export interface CreatePatientInsurancePayload {
  insurance_company_id: number;
  insurance_number: string;
  policy_holder_name: string;
  relationship_to_holder: string;
  is_primary: boolean;
}

export interface UpdatePatientInsurancePayload {
  is_primary?: boolean;
  auto_renewal_enabled?: boolean;
}

export interface ToggleAutoRenewPayload {
  auto_renewal_enabled: boolean;
}

export interface DeactivatePatientInsurancePayload {
  deactivation_reason?: string;
}
