import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { AccessRequestDto } from '../../models/accessRequest/dto';
import type { CreateAccessRequestPayload } from '../../models/accessRequest/payload';

export const accessRequestService = {
  async getRequestsForPatient(): Promise<ApiResponse<AccessRequestDto[]>> {
    const response = await apiClient.get<ApiResponse<AccessRequestDto[]>>('/ehr-access/frontend/patient');
    // console.log(`Response of GetRequestsForPatient: `, response)
    return response.data;
  },

  async getRequestsForDoctor(): Promise<ApiResponse<AccessRequestDto[]>> {
    const response = await apiClient.get<ApiResponse<AccessRequestDto[]>>('/ehr-access/frontend/doctor');
    // console.log(`Response of GetRequestsForDoctor: `, response)
    return response.data;
  },

  async createRequest(payload: CreateAccessRequestPayload): Promise<ApiResponse<AccessRequestDto>> {
    const response = await apiClient.put<ApiResponse<AccessRequestDto>>('/ehr-access/request', payload);
    return response.data;
  },

  async acceptRequest(requestId: number): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(`/ehr-access/grant/${requestId}`);
    return response.data;
  },

  async denyRequest(requestId: number): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(`/ehr-access/deny/${requestId}`);
    return response.data;
  },

  async revokeRequest(requestId: number): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(`/ehr-access/revoke/${requestId}`);
    return response.data;
  },

  async deleteRequest(requestId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/ehr-access/${requestId}`);
    return response.data;
  },

  async getPatientEhr(patientId: number): Promise<any> {
    // send patient_id in the request body
    const response = await apiClient.post<any>('/ehr-access/patient-data', { patient_id: patientId });
    return response.data;
  },

  async getBlockchainHistory(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>('/ehr-access/history_from_blockchain');
    return response.data;
  },
};

export default accessRequestService;
