export interface Patient {
  patient_id: number;
  emergency_contact_id?: number;
  emergency_contact_country_code?: string;
  emergency_contact_number?: string;
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  is_patient_profile_complete: boolean;
  created_at: string;
  updated_at: string;
  // Extended fields from person
  first_name?: string;
  last_name?: string;
  email?: string;
  cnic?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  address?: string;
  contact_number?: string;
}

export interface UpdatePatientRequest {
  emergency_contact_country_code?: string;
  emergency_contact_number?: string;
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
}