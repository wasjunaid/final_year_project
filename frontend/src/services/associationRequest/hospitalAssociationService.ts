import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { HospitalAssociationRequestDto } from '../../models/associationRequest/hospital/dto';
import type { CreateHospitalAssociationRequestPayload } from '../../models/associationRequest/hospital/payload';

export const hospitalAssociationService = {
  async getRequestsForHospitalStaff(): Promise<ApiResponse<HospitalAssociationRequestDto[]>> {
    const response = await apiClient.get<ApiResponse<HospitalAssociationRequestDto[]>>('/hospital-association-request/hospital-staff');
    return response.data;
  },

  async insertRequest(payload: CreateHospitalAssociationRequestPayload): Promise<ApiResponse<HospitalAssociationRequestDto>> {
    const response = await apiClient.post<ApiResponse<HospitalAssociationRequestDto>>('/hospital-association-request', payload);
    return response.data;
  },

  async deleteHospitalStaffRequest(requestId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/hospital-association-request/hospital-staff/${requestId}`);
    return response.data;
  },
};
