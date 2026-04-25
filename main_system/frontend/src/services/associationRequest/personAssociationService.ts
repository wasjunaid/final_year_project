import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { PersonAssociationRequestDto } from '../../models/associationRequest/person/dto';

export const personAssociationService = {
  async getRequestsForPerson(): Promise<ApiResponse<PersonAssociationRequestDto[]>> {
    const response = await apiClient.get<ApiResponse<PersonAssociationRequestDto[]>>('/hospital-association-request/frontend/person');
    console.log("[PersonAssocation service] get requests for person", response)
    return response.data;
  },

  async deletePersonRequest(requestId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/hospital-association-request/person/${requestId}`);
    return response.data;
  },

  async deleteAllPersonRequests(): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/hospital-association-request/person`);
    return response.data;
  },

  async acceptRequest(requestId: number): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(`/hospital-association-request/accept/${requestId}`);
    return response.data;
  },
};
