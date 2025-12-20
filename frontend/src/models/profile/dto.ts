// Backend DTOs for profile data
import type { BloodGroup, DoctorStatus, Gender } from "../../constants/profile";

// Person DTO from backend (person_view)
export interface PersonDTO {
  person_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  cnic?: string;
  date_of_birth?: string; // YYYY-MM-DD format
  gender?: Gender;
  address_id?: number;
  address?: string;
  contact_id?: number;
  country_code?: string;
  number?: string;
  is_verified: boolean;
  is_person_profile_complete: boolean;
}

// Patient DTO from backend (patient_view) - only patient fields, no person data
export interface PatientDTO {
  patient_id: string;
  emergency_contact_id?: number;
  emergency_contact_country_code?: string;
  emergency_contact_number?: string;
  blood_group?: BloodGroup;
  wallet_address?: string;
  is_patient_profile_complete: boolean;
}

// Doctor DTO from backend (doctor_view) - only doctor fields, no person data
export interface DoctorDTO {
  doctor_id: string;
  license_number?: string;
  specialization?: string;
  years_of_experience?: number;
  sitting_start?: string; // TIME format
  sitting_end?: string; // TIME format
  doctor_status: DoctorStatus;
  hospital_id?: number;
  hospital_name?: string;
  is_doctor_profile_complete: boolean;
}

// Medical Coder DTO from backend (medical_coder_view) - only coder fields, no person data
export interface MedicalCoderDTO {
  medical_coder_id: string;
  hospital_id?: number;
  hospital_name?: string;
  is_medical_coder_profile_complete: boolean;
}

// Hospital Staff DTO from backend (hospital_staff_view) - only staff fields, no person data
export interface HospitalStaffDTO {
  hospital_staff_id: string;
  hospital_id?: number;
  hospital_name?: string;
  role: string;
  is_hospital_staff_profile_complete: boolean;
}


