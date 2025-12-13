import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { PatientDTO } from '../../models/profile/dto';
import type { UpdatePatientRequest } from '../../models/profile/payload';

// Profile service - pure HTTP helpers returning DTOs wrapped in ApiResponse
export const patientProfileService = {
  // Get - fetch patient profile
  async getPatient(): Promise<ApiResponse<PatientDTO>> {
    const response = await apiClient.get<ApiResponse<PatientDTO>>('/patient');
    return response.data;
  },

  // PUT - update patient profile
  async updatePatient(data: UpdatePatientRequest): Promise<ApiResponse<PatientDTO>> {
    const response = await apiClient.put<ApiResponse<PatientDTO>>('/patient', data);
    return response.data;
  },
};
