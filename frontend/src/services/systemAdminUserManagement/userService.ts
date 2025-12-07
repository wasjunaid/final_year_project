import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api';
import type { SystemSubAdminDto, HospitalAdminDto } from '../../models/systemAdminUserManagement/dto';
import type { CreateSystemSubAdminPayload, CreateHospitalAdminPayload } from '../../models/systemAdminUserManagement/payload';

// System Admin User Management service - pure HTTP helpers returning DTOs wrapped in ApiResponse
export const systemAdminUserManagementService = {
  // System Sub Admins
  async getAllSystemSubAdmins(): Promise<ApiResponse<SystemSubAdminDto[]>> {
    const response = await apiClient.get<ApiResponse<SystemSubAdminDto[]>>('/system-admin');
    return response.data;
  },

  async createSystemSubAdmin(payload: CreateSystemSubAdminPayload): Promise<ApiResponse<SystemSubAdminDto>> {
    const response = await apiClient.post<ApiResponse<SystemSubAdminDto>>('/system-admin', payload);
    return response.data;
  },

  async deleteSystemSubAdmin(systemAdminId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/system-admin/${systemAdminId}`);
    return response.data;
  },

  // Hospital Admins
  async getAllHospitalAdmins(): Promise<ApiResponse<HospitalAdminDto[]>> {
    const response = await apiClient.get<ApiResponse<HospitalAdminDto[]>>('/hospital-staff/admin');
    return response.data;
  },

  async createHospitalAdmin(payload: CreateHospitalAdminPayload): Promise<ApiResponse<HospitalAdminDto>> {
    const response = await apiClient.post<ApiResponse<HospitalAdminDto>>('/hospital-staff', payload);
    return response.data;
  },

  async deleteHospitalAdmin(hospitalStaffId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/hospital-staff/${hospitalStaffId}`);
    return response.data;
  },
};
