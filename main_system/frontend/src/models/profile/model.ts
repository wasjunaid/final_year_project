import type { Gender, BloodGroup, UserRole, DoctorStatus } from '../../constants/profile';
import type { CountryCodeValue } from '../../constants/countryCode';

// Base Person Profile (common to all roles)
export interface PersonProfileModel {
  personId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  cnic?: string;
  dateOfBirth?: string; // YYYY-MM-DD format
  age: number;
  gender?: Gender;
  addressId?: number;
  address?: string;
  contactId?: number;
  countryCode?: CountryCodeValue;
  phoneNumber?: string;
  isVerified: boolean;
  isPersonProfileComplete: boolean;
}

// Patient-specific profile
export interface PatientProfileModel extends PersonProfileModel {
  patientId: string;
  emergencyContactId?: number;
  emergencyContactCountryCode?: CountryCodeValue;
  emergencyContactNumber?: string;
  bloodGroup?: BloodGroup;
  walletAddress?: string;
  isPatientProfileComplete: boolean;
}

// Doctor-specific profile
export interface DoctorProfileModel extends PersonProfileModel {
  doctorId: string;
  licenseNumber?: string;
  specialization?: string;
  yearsOfExperience?: number;
  sittingStart?: string; // HH:MM:SS format
  sittingEnd?: string; // HH:MM:SS format;
  status: DoctorStatus; // Not implemented yet
  hospitalId?: number;
  hospitalName?: string;
  isDoctorProfileComplete: boolean;
}

// Medical Coder profile
export interface MedicalCoderProfileModel extends PersonProfileModel {
  medicalCoderId: string;
  hospitalId?: number;
  hospitalName?: string;
  isMedicalCoderProfileComplete: boolean;
}

// Hospital Staff profile (for admin, sub-admin, front desk, lab tech, pharmacist)
export interface HospitalStaffProfileModel extends PersonProfileModel {
  hospitalStaffId: string;
  hospitalId?: number;
  hospitalName?: string;
  role: UserRole;
  isHospitalStaffProfileComplete: boolean;
}

// Union type for all profile types
export type ProfileModel = 
  | PersonProfileModel 
  | PatientProfileModel 
  | DoctorProfileModel 
  | MedicalCoderProfileModel 
  | HospitalStaffProfileModel
