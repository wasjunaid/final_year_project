export interface HospitalPanelList {
  hospital_panel_list_id: number;
  hospital_id: number;
  insurance_company_id: number;
  created_at?: string; // Optional since view doesn't include it
  // Extended fields from view
  hospital_name?: string;
  insurance_company_name?: string;
}

export interface CreateHospitalPanelListRequest {
  insurance_company_id: number; // Only insurance_company_id needed, hospital_id is determined from JWT
}
