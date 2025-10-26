export interface InsuranceCompany {
  insurance_company_id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInsuranceCompanyRequest {
  name: string;
  email: string;
}

export interface UpdateInsuranceCompanyRequest {
  insurance_company_id: number;
  name?: string;
  email?: string;
}