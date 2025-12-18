// DTOs from backend - keep separate from frontend models
export interface HospitalPanelListDto {
  hospital_panel_list_id: number;
  hospital_id: number;
  insurance_company_id: number;
  hospital_name: string;
  insurance_company_name: string;
}
