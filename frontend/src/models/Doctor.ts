export interface Doctor {
  doctor_id: number;
  license_number?: string;
  specialization?: string;
  years_of_experience?: number;
  sitting_start?: string;
  sitting_end?: string;
  doctor_status: 'ACTIVE' | 'INACTIVE';
  hospital_id?: number;
  hospital_name?: string;
  is_doctor_profile_complete: boolean;
  created_at: string;
  updated_at: string;
  // Extended fields from person
  first_name?: string;
  last_name?: string;
  email?: string;
  contact_number?: string;
}

export interface UpdateDoctorRequest {
  license_number?: string;
  specialization?: string;
  years_of_experience?: number;
  sitting_start?: string;
  sitting_end?: string;
  hospital_id?: number;
}

export interface UpdateDoctorStatusRequest {
  doctor_id: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateDoctorHospitalRequest {
  hospital_id?: number;
}