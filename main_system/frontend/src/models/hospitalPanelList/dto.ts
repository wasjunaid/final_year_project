// DTOs from backend - keep separate from frontend models
export interface HospitalPanelListDto {
  hospital_panel_list_id: number;
  hospital_id: number;
  insurance_company_id: number;
  hospital_name: string;
  insurance_company_name: string;
  focal_person_name?: string | null;
  focal_person_email?: string | null;
  focal_person_phone?: string | null;
  address?: string | null;
}
