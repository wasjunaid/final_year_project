// DTOs from backend for hospital staff
export interface HospitalStaffDto {
  hospital_staff_id: number;
  hospital_id: number;
  person_email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
