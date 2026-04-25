import type { BloodGroup, Gender } from "../../constants/profile";

export interface UpdatePersonRequest {
  first_name?: string;
  last_name?: string;
  cnic?: string;
  date_of_birth?: string;
  gender?: Gender;
  address?: string;
  country_code?: string;
  number?: string;
}

export interface UpdatePatientRequest {
  emergency_contact_country_code?: string;
  emergency_contact_number?: string;
  blood_group?: BloodGroup;
  wallet_address?: string;
}

export interface UpdateDoctorRequest {
  license_number?: string;
  specialization?: string;
  years_of_experience?: number;
  sitting_start?: string;
  sitting_end?: string;
}
