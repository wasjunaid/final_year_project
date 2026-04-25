import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { DoctorDTO } from '../../models/profile';
import type { UpdateDoctorRequest } from '../../models/profile/payload';

// Profile service - pure HTTP helpers returning DTOs wrapped in ApiResponse
export const doctorProfileService = {
  // Get - fetch doctor profile
  async getDoctor(): Promise<ApiResponse<DoctorDTO>> {
    const response = await apiClient.get<ApiResponse<DoctorDTO>>('/doctor');
    return response.data;
  },

  // PUT - update doctor profile
  async updateDoctor(data: UpdateDoctorRequest): Promise<ApiResponse<DoctorDTO>> {
    const response = await apiClient.put<ApiResponse<DoctorDTO>>('/doctor', data);
    return response.data;
  },
};
