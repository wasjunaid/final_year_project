import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api';
import type { BillDto } from '../../models/bill';

export const billService = {
  async getBillByAppointmentId(appointmentId: number): Promise<ApiResponse<BillDto>> {
    const response = await apiClient.get<ApiResponse<BillDto>>(`/bill/${appointmentId}`);
    return response.data;
  },

  async updateClaimStatus(claimId: number, status: string): Promise<ApiResponse<BillDto>> {
    const response = await apiClient.put<ApiResponse<BillDto>>('/bill/claim', {
      claim_id: claimId,
      status,
    });
    return response.data;
  },

  async resendClaim(billId: number): Promise<ApiResponse<BillDto>> {
    const response = await apiClient.put<ApiResponse<BillDto>>(`/bill/resend/${billId}`);
    return response.data;
  },
};
