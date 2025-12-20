import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api';
import type { HospitalStaffDto } from '../../models/hospitalStaff/dto';
import type { CreateHospitalStaffPayload } from '../../models/hospitalStaff/payload';

export const hospitalStaffService = {
  // Get all staff for the current hospital
  async getAllHospitalStaff(): Promise<ApiResponse<HospitalStaffDto[]>> {
    const response = await apiClient.get<ApiResponse<HospitalStaffDto[]>>('/hospital-staff/all');
    return response.data;
  },

  // Create hospital staff
  async createHospitalStaff(payload: CreateHospitalStaffPayload): Promise<ApiResponse<HospitalStaffDto>> {
    const response = await apiClient.post<ApiResponse<HospitalStaffDto>>('/hospital-staff/', payload);
    return response.data;
  },

  // Delete hospital staff
  async deleteHospitalStaff(hospitalStaffId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/hospital-staff/${hospitalStaffId}`);
    return response.data;
  },
};
