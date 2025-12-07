import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { HospitalDto } from '../../models/hospital/dto';
import type { CreateHospitalPayload, UpdateHospitalPayload } from '../../models/hospital/payload';

// Hospital service - pure HTTP helpers returning DTOs wrapped in ApiResponse
export const hospitalService = {
  // Get all hospitals - GET /hospital
  async getAllHospitals(): Promise<ApiResponse<HospitalDto[]>> {
    const response = await apiClient.get<ApiResponse<HospitalDto[]>>('/hospital');
    return response.data;
  },

  // Create hospital - POST /hospital
  async createHospital(payload: CreateHospitalPayload): Promise<ApiResponse<HospitalDto>> {
    const response = await apiClient.post<ApiResponse<HospitalDto>>('/hospital', payload);
    return response.data;
  },

  // Update hospital - PUT /hospital/:hospital_id
  async updateHospital(hospitalId: number, payload: UpdateHospitalPayload): Promise<ApiResponse<HospitalDto>> {
    const response = await apiClient.put<ApiResponse<HospitalDto>>(`/hospital/${hospitalId}`, payload);
    return response.data;
  },
};
