import { billService } from '../../services/bill';
import { transformBillDto } from '../../models/bill/transformers';
import type { BillModel } from '../../models/bill';

export const billRepository = {
  async getBillByAppointmentId(appointmentId: number): Promise<BillModel | null> {
    try {
      const response = await billService.getBillByAppointmentId(appointmentId);
      if (response.data) {
        return transformBillDto(response.data);
      }
      return null;
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw error;
    }
  },

  async updateClaimStatus(claimId: number, status: string): Promise<BillModel> {
    try {
      const response = await billService.updateClaimStatus(claimId, status);
      return transformBillDto(response.data);
    } catch (error) {
      console.error('Error updating claim status:', error);
      throw error;
    }
  },

  async resendClaim(billId: number): Promise<BillModel> {
    try {
      const response = await billService.resendClaim(billId);
      return transformBillDto(response.data);
    } catch (error) {
      console.error('Error resending claim:', error);
      throw error;
    }
  },
};
