// User DTOs matching backend response structure

export interface SystemSubAdminDto {
  system_admin_id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  cnic?: string;
  date_of_birth?: string;
  gender?: string;
  is_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface HospitalAdminDto {
  hospital_staff_id: number;
  hospital_id: number;
  hospital_name: string;
  person_email: string;
  first_name?: string;
  last_name?: string;
  cnic?: string;
  date_of_birth?: string;
  gender?: string;
  is_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}
