import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { HospitalStaffDTO } from '../../models/profile/dto';

// Hospital Staff profile service
export const hospitalStaffProfileService = {
  // Get - fetch hospital staff profile
  async getHospitalStaff(): Promise<ApiResponse<HospitalStaffDTO>> {
    const response = await apiClient.get<ApiResponse<HospitalStaffDTO>>('/hospital-staff');
    console.log('Fetching hospital staff profile from API', response);
    return response.data;
  },

  // PUT - update hospital staff profile (if needed)
  async updateHospitalStaff(data: any): Promise<ApiResponse<HospitalStaffDTO>> {
    const response = await apiClient.put<ApiResponse<HospitalStaffDTO>>('/hospital-staff', data);
    return response.data;
  },
};
