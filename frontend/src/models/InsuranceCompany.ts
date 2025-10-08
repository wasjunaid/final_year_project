export interface InsuranceCompany {
  insurance_company_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInsuranceCompanyRequest {
  name: string;
}

export interface UpdateInsuranceCompanyRequest {
  name: string;
}
