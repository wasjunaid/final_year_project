// Hospital model representing a hospital entity
export interface HospitalModel {
  hospital_id: number;
  name: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

// Hospital form data for creation
export interface HospitalFormData {
  name: string;
}
