export * from "./personProfileService";
export * from "./patientProfileService";
export * from "./doctorProfileService";
export * from "./medicalCoderProfileService";
export * from "./hospitalStaffProfileService";

// Combined profile service for fetching complete profiles
import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { PersonDTO, PatientDTO, DoctorDTO, MedicalCoderDTO, HospitalStaffDTO } from '../../models/profile/dto';

export const profileService = {
  // Fetch complete patient profile (person + patient data)
  async getCompletePatientProfile(): Promise<{ person: ApiResponse<PersonDTO>, patient: ApiResponse<PatientDTO> }> {
    const [personResponse, patientResponse] = await Promise.all([
      apiClient.get<ApiResponse<PersonDTO>>('/person'),
      apiClient.get<ApiResponse<PatientDTO>>('/patient'),
    ]);
    
    return {
      person: personResponse.data,
      patient: patientResponse.data,
    };
  },

  // Fetch complete doctor profile (person + doctor data)
  async getCompleteDoctorProfile(): Promise<{ person: ApiResponse<PersonDTO>, doctor: ApiResponse<DoctorDTO> }> {
    const [personResponse, doctorResponse] = await Promise.all([
      apiClient.get<ApiResponse<PersonDTO>>('/person'),
      apiClient.get<ApiResponse<DoctorDTO>>('/doctor'),
    ]);
    
    return {
      person: personResponse.data,
      doctor: doctorResponse.data,
    };
  },

  // Fetch complete medical coder profile (person + coder data)
  async getCompleteMedicalCoderProfile(): Promise<{ person: ApiResponse<PersonDTO>, coder: ApiResponse<MedicalCoderDTO> }> {
    const [personResponse, coderResponse] = await Promise.all([
      apiClient.get<ApiResponse<PersonDTO>>('/person'),
      apiClient.get<ApiResponse<MedicalCoderDTO>>('/medical-coder'),
    ]);
    
    return {
      person: personResponse.data,
      coder: coderResponse.data,
    };
  },

  // Fetch complete hospital staff profile (person + staff data)
  async getCompleteHospitalStaffProfile(): Promise<{ person: ApiResponse<PersonDTO>, staff: ApiResponse<HospitalStaffDTO> }> {
    const [personResponse, staffResponse] = await Promise.all([
      apiClient.get<ApiResponse<PersonDTO>>('/person'),
      apiClient.get<ApiResponse<HospitalStaffDTO>>('/hospital-staff'),
    ]);
    
    return {
      person: personResponse.data,
      staff: staffResponse.data,
    };
  },
};
