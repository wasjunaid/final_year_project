export interface HospitalPanelList {
  hospital_pannel_list_id: number;
  hospital_id: number;
  insurance_company_id: number;
  created_at: string;
  // Extended fields
  hospital_name?: string;
  insurance_company_name?: string;
}

export interface CreateHospitalPanelListRequest {
  hospital_id: number;
  insurance_company_id: number;
}
