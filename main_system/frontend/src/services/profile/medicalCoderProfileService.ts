import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { MedicalCoderDTO } from '../../models/profile/dto';

// Medical Coder profile service
export const medicalCoderProfileService = {
  // Get - fetch medical coder profile
  async getMedicalCoder(): Promise<ApiResponse<MedicalCoderDTO>> {
    const response = await apiClient.get<ApiResponse<MedicalCoderDTO>>('/medical-coder');
    return response.data;
  },

  // PUT - update medical coder profile (if needed)
  async updateMedicalCoder(data: any): Promise<ApiResponse<MedicalCoderDTO>> {
    const response = await apiClient.put<ApiResponse<MedicalCoderDTO>>('/medical-coder', data);
    return response.data;
  },
};
