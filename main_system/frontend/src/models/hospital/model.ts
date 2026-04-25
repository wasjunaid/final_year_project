// Hospital model representing a hospital entity
export interface HospitalModel {
  hospital_id: number;
  name: string;
  focal_person_name?: string | null;
  focal_person_email?: string | null;
  focal_person_phone?: string | null;
  address?: string | null;
  hospitalization_daily_charge?: number | null;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

// Hospital form data for creation
export interface HospitalFormData {
  name: string;
  focal_person_name?: string;
  focal_person_email?: string;
  focal_person_phone?: string;
  address?: string;
  hospitalization_daily_charge?: string;
}
