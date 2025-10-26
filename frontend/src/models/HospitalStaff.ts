export interface HospitalStaff {
  hospital_staff_id: number;
  person_id: number;
  hospital_id: number;
  role: string;
  created_at: string;
  updated_at: string;
  // Extended fields
  person_name?: string;
  person_email?: string;
  hospital_name?: string;
}

export interface CreateHospitalStaffRequest {
  person_id: number;
  hospital_id: number;
  role: string;
}
